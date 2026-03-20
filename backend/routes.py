import json as json_lib

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from crawl4ai.async_configs import CrawlerRunConfig

# Populated at startup by index.py lifespan — shared across all requests
crawler = None

from models import (
    Problem,
    ThoughtFeedback,
    MathProof,
    CodeStep,
    FetchProblemRequest,
    AnalyzeThoughtRequest,
    GenerateThoughtProcessRequest,
    GenerateMathProofRequest,
    GenerateCodeRequest,
    SendFollowUpRequest,
)
from services import (
    ask_agent,
    ask_agent_stream,
    chat_with_history_stream,
    strip_and_parse,
)

router = APIRouter()


# ── SSE helpers ───────────────────────────────────────────────────────────────

def _sse(payload: dict) -> str:
    return f"data: {json_lib.dumps(payload)}\n\n"


async def _json_sse_stream(chunks_gen, validate_fn):
    """Stream text chunks, then emit a final validated result (or error)."""
    full_text = ""
    try:
        async for chunk in chunks_gen:
            full_text += chunk
            yield _sse({"type": "chunk", "text": chunk})
        result = validate_fn(full_text)
        yield _sse({"type": "result", "data": result})
    except Exception as e:
        yield _sse({"type": "error", "message": str(e)})
    finally:
        yield "data: [DONE]\n\n"


async def _text_sse_stream(chunks_gen):
    """Stream text chunks only (no structured result)."""
    try:
        async for chunk in chunks_gen:
            yield _sse({"type": "chunk", "text": chunk})
    except Exception as e:
        yield _sse({"type": "error", "message": str(e)})
    finally:
        yield "data: [DONE]\n\n"


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/fetch-problem", response_model=Problem)
async def fetch_problem(req: FetchProblemRequest):
    """Crawl a LeetCode problem URL and return structured problem data."""
    result = await crawler.arun(url=req.url, config=CrawlerRunConfig())

    if not result.success:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to crawl URL: {result.error_message}",
        )

    content = result.markdown or result.cleaned_html or ""

    prompt = f"""You are given the scraped markdown content of a LeetCode problem page.
Extract the problem details and return them as a single JSON object.

PAGE CONTENT :
{content}

Return ONLY a raw JSON object — no markdown fences, no explanation:
{{
  "id": "<problem number as string, e.g. '1'>",
  "title": "<Problem Title>",
  "slug": "<problem-slug-from-url>",
  "difficulty": "<Easy | Medium | Hard>",
  "tags": ["<tag1>", "<tag2>"],
  "description": "<full problem description in markdown>",
  "examples": [
    {{
      "input": "<example input>",
      "output": "<example output>",
      "explanation": "<optional explanation or omit key>"
    }}
  ],
  "constraints": ["<constraint 1>", "<constraint 2>"]
}}"""

    raw = await ask_agent(prompt)
    try:
        data = strip_and_parse(raw)
        return Problem(**data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse problem data: {e}\n\nRaw response: {raw[:600]}",
        )


@router.post("/analyze-thought")
async def analyze_thought(req: AnalyzeThoughtRequest):
    """Analyze the user's thought process and stream structured feedback."""
    prompt = f"""You are reviewing a student's thought process for a LeetCode problem.

PROBLEM: {req.problem.title} ({req.problem.difficulty})
DESCRIPTION:
{req.problem.description}

STUDENT'S THOUGHT PROCESS:
{req.user_thought}

Identify what the student got right, what needs correction, and provide 3 progressive hints
(level 1 = subtle nudge, level 2 = moderate, level 3 = near-explicit).

Return ONLY a raw JSON object:
{{
  "correct": [
    {{"id": "c1", "text": "<short label>", "detail": "<educational explanation>"}}
  ],
  "incorrect": [
    {{"id": "i1", "text": "<short label>", "detail": "<what's wrong and how to fix it>"}}
  ],
  "hints": [
    {{"id": "h1", "level": 1, "text": "<subtle hint>"}},
    {{"id": "h2", "level": 2, "text": "<moderate hint>"}},
    {{"id": "h3", "level": 3, "text": "<near-explicit hint>"}}
  ]
}}"""

    def validate(text: str) -> dict:
        data = strip_and_parse(text)
        return ThoughtFeedback(**data).model_dump()

    return StreamingResponse(
        _json_sse_stream(ask_agent_stream(prompt), validate),
        media_type="text/event-stream",
    )


@router.post("/generate-thought-process")
async def generate_thought_process(req: GenerateThoughtProcessRequest):
    """Stream an expert intuition and approach explanation in markdown."""
    prompt = f"""You are an expert competitive programmer. Write a clear, educational explanation
of how to approach and solve this LeetCode problem. The solution should be in {req.language}.

PROBLEM: {req.problem.title} ({req.problem.difficulty})
TAGS: {', '.join(req.problem.tags)}
DESCRIPTION:
{req.problem.description}

Write structured markdown with these sections:
## Intuition
(Why the naive approach fails and what insight unlocks the optimal solution)

## Approach
(Step-by-step algorithm walkthrough — numbered list)

## Why it works
(Brief justification of correctness)

Be concise and educational. Do NOT include any code."""

    return StreamingResponse(
        _text_sse_stream(ask_agent_stream(prompt)),
        media_type="text/event-stream",
    )


@router.post("/generate-math-proof")
async def generate_math_proof(req: GenerateMathProofRequest):
    """Stream time/space complexity analysis and a correctness proof."""
    prompt = f"""You are an expert at algorithm analysis. Provide a rigorous complexity analysis
and correctness proof for the optimal solution to this problem in {req.language}.

PROBLEM: {req.problem.title} ({req.problem.difficulty})
DESCRIPTION:
{req.problem.description}

Return ONLY a raw JSON object:
{{
  "timeComplexity": "<e.g. O(n)>",
  "spaceComplexity": "<e.g. O(n)>",
  "explanation": "<detailed markdown — break down time and space step by step>",
  "correctnessProof": "<semi-formal proof: state the claim, then prove it with case analysis or induction>"
}}"""

    def validate(text: str) -> dict:
        data = strip_and_parse(text)
        return MathProof(**data).model_dump()

    return StreamingResponse(
        _json_sse_stream(ask_agent_stream(prompt), validate),
        media_type="text/event-stream",
    )


@router.post("/generate-code")
async def generate_code(req: GenerateCodeRequest):
    """Stream an optimized solution with line-by-line step explanations."""
    prompt = f"""You are an expert competitive programmer. Write an optimal solution
for this LeetCode problem in {req.language}, then annotate it step by step.

PROBLEM: {req.problem.title} ({req.problem.difficulty})
DESCRIPTION:
{req.problem.description}

Return ONLY a raw JSON object:
{{
  "code": "<complete solution as a single string; use \\n for newlines>",
  "steps": [
    {{
      "lineRange": [1, 1],
      "explanation": "<what these lines do and WHY — educational, not just descriptive>"
    }}
  ]
}}

Rules for steps:
- lineRange is [startLine, endLine] (1-indexed, inclusive)
- Cover every line; steps must be in order with no gaps
- Group closely related lines (e.g. a loop header + its first body line) into one step
- Aim for 5–8 steps total
- Explain the reasoning, not just what the code says"""

    def validate(text: str) -> dict:
        data = strip_and_parse(text)
        steps = [CodeStep(**s).model_dump() for s in data["steps"]]
        return {"code": data["code"], "steps": steps}

    return StreamingResponse(
        _json_sse_stream(ask_agent_stream(prompt), validate),
        media_type="text/event-stream",
    )


@router.post("/send-followup")
async def send_followup(req: SendFollowUpRequest):
    """Stream a contextual follow-up answer using conversation history."""
    section_labels = {
        "thought-analysis": "the analysis of the student's thought process",
        "thoughtProcess": "the intuition and approach explanation",
        "mathProof": "the time/space complexity analysis and correctness proof",
        "code": "the solution code and its step-by-step breakdown",
    }
    section_label = section_labels.get(req.context.section, req.context.section)
    lang_note = f" The solution language is {req.context.language}." if req.context.language else ""

    user_message = (
        f"[Context: viewing {section_label} for problem {req.context.problemId}.{lang_note}]\n\n"
        f"{req.question}"
    )

    history = [{"role": m.role, "content": m.content} for m in req.history]

    return StreamingResponse(
        _text_sse_stream(chat_with_history_stream(history, user_message)),
        media_type="text/event-stream",
    )
