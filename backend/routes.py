import html
import json as json_lib
import re
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from crawl4ai.async_configs import CrawlerRunConfig
from crawl4ai.extraction_strategy import JsonCssExtractionStrategy

# Populated at startup by index.py lifespan — shared across all requests
crawler = None

from models import (
    Problem,
    ProblemExample,
    ThoughtFeedback,
    MathProof,
    SolutionComplexity,
    CodeStep,
    CodeSolution,
    CodeContent,
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

# ── LeetCode CSS extraction schema ────────────────────────────────────────────

_LEETCODE_SCHEMA: dict[str, object] = {
    "name": "LeetCode Problem",
    "baseSelector": "head",
    "fields": [
        {
            "name": "og_title",
            "selector": "meta[property='og:title']",
            "type": "attribute",
            "attribute": "content",
        },
        {
            "name": "page_title",
            "selector": "title",
            "type": "text",
        },
        {
            "name": "meta_description",
            "selector": "meta[name='description']",
            "type": "attribute",
            "attribute": "content",
        },
    ],
}


def _slug_from_url(url: str) -> str:
    parts = urlparse(url).path.strip("/").split("/")
    try:
        return parts[parts.index("problems") + 1]
    except (ValueError, IndexError):
        return ""


def _parse_meta_description(raw: str) -> tuple[str, list[dict[str, str | None]], list[str]]:
    """Parse the LeetCode meta description string into (description, examples, constraints)."""
    if not raw:
        return "", [], []

    text = html.unescape(raw).strip()

    # Strip "Can you solve this real interview question? TITLE - " prefix
    text = re.sub(r"^Can you solve this real interview question\?\s+.+?\s+-\s+", "", text)

    # Strip trailing Follow-up section
    text = re.split(r"\n\s*Follow[- ]?up\s*[:\u00a0]", text, maxsplit=1)[0].strip()

    # ── Split into: description | examples + constraints ──────────────────────
    main_parts = re.split(r"\n\s*Example\s+1\s*:", text, maxsplit=1)
    description = main_parts[0].strip()
    examples_and_rest = ("Example 1:" + main_parts[1]) if len(main_parts) > 1 else ""

    # ── Split off constraints ─────────────────────────────────────────────────
    rest_parts = re.split(r"\n\s*Constraints\s*:\s*\n", examples_and_rest, maxsplit=1)
    examples_text = rest_parts[0]
    constraints_text = rest_parts[1] if len(rest_parts) > 1 else ""

    # ── Parse each example block ──────────────────────────────────────────────
    # Group 1: optional bracketed image URL(s) before Input:
    # Group 2: Input/Output/Explanation block
    _EXAMPLE_RE = re.compile(
        r"Example\s+\d+\s*:\s*\n+"
        r"((?:\[[^\]]*\]\s*\n+)*)"   # optional image lines, e.g. [https://...]
        r"\s*(Input:.+?)(?=\n\s*Example\s+\d+|\Z)",
        re.DOTALL,
    )
    examples: list[dict[str, str | None]] = []
    for match in _EXAMPLE_RE.finditer(examples_text):
        image_lines = match.group(1).strip()
        block = match.group(2).strip()

        # Extract first image URL from bracketed lines
        img_match = re.search(r"\[(https?://[^\]]+)\]", image_lines)
        image_url = img_match.group(1).strip() if img_match else None

        inp = re.search(r"Input:\s*(.+?)(?=\nOutput:)", block, re.DOTALL)
        out = re.search(r"Output:\s*(.+?)(?=\nExplanation:|\Z)", block, re.DOTALL)
        exp = re.search(r"Explanation:\s*(.+?)$", block, re.DOTALL)
        if inp and out:
            examples.append({
                "input": inp.group(1).strip(),
                "output": out.group(1).strip(),
                "explanation": exp.group(1).strip() if exp else None,
                "image": image_url,
            })

    # ── Parse constraints: bullet lines starting with * ───────────────────────
    constraints: list[str] = [
        line.lstrip("* \t").strip()
        for line in constraints_text.splitlines()
        if re.match(r"\s*\*", line) and line.strip()
    ]

    return description, examples, constraints


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
    result = await crawler.arun(
        url=req.url,
        config=CrawlerRunConfig(extraction_strategy=JsonCssExtractionStrategy(_LEETCODE_SCHEMA)),
    )

    if not result.success:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to crawl URL: {result.error_message}",
        )

    try:
        items: list[dict[str, object]] = json_lib.loads(result.extracted_content or "[]")
        item = items[0] if items else {}

        # Title: prefer og:title ("Two Sum - LeetCode"), fall back to <title>
        raw_title = str(item.get("og_title", "") or item.get("page_title", ""))
        title = re.sub(r"\s*[-–|]\s*LeetCode.*$", "", raw_title).strip()

        # Slug from URL
        slug = _slug_from_url(req.url)

        # Difficulty from markdown (reliable plain-text scan)
        diff_m = re.search(r"\b(Easy|Medium|Hard)\b", result.markdown or "")
        difficulty = diff_m.group(1) if diff_m else "Unknown"

        # Description, examples, constraints from meta description tag
        description, examples, constraints = _parse_meta_description(
            str(item.get("meta_description", ""))
        )

        # Tags from the rendered page links
        tag_soup_text: str = str(result.markdown or "")
        tags = list(dict.fromkeys(re.findall(r"(?<=/tag/)[a-z0-9-]+", tag_soup_text)))

        return Problem(
            id="",
            title=title,
            slug=slug,
            difficulty=difficulty,
            tags=tags,
            description=description,
            examples=[
                ProblemExample(
                    input=ex["input"] or "",
                    output=ex["output"] or "",
                    explanation=ex.get("explanation"),
                    image=ex.get("image"),
                )
                for ex in examples
            ],
            constraints=constraints,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse problem data: {e}",
        )


@router.post("/analyze-thought", response_model=ThoughtFeedback)
async def analyze_thought(req: AnalyzeThoughtRequest):
    """Analyze the user's thought process and return structured feedback."""
    prompt = f"""
You are acting as a senior technical interviewer reviewing a student's thought process for a LeetCode-style problem.

Your goal is to evaluate reasoning quality — not just correctness.

---------------------
PROBLEM
---------------------
Title: {req.problem.title}
Difficulty: {req.problem.difficulty}

Description:
{req.problem.description}

Examples:
{"".join(f'- Input: {ex.input}\n  Output: {ex.output}\n  Explanation: {ex.explanation}\n  Image: {ex.image}\n\n' for ex in req.problem.examples)} 

Constraints:
{"".join(f'- {c}\n' for c in req.problem.constraints)} 

---------------------
STUDENT THOUGHT PROCESS
---------------------
{req.user_thought}

---------------------
EVALUATION INSTRUCTIONS
---------------------

1. Identify ALL valid insights the student demonstrated.
   - Include correct intuitions, partial correctness, and good problem decomposition.

2. Identify ALL issues or gaps.
   - Logical errors
   - Incorrect assumptions
   - Missed edge cases
   - Inefficient approach (time/space complexity)
   - Incomplete reasoning
   - Flawed code snippets (if any)
   - In the Logical correct check for Time and Space complexity and verify if they are correct or not based constraints.

3. Provide EXACTLY 3 progressive hints:
   - Level 1 (subtle): gentle directional nudge, no solution structure
   - Level 2 (moderate): clearer guidance, may suggest approach or pattern
   - Level 3 (strong): near-explicit, but DO NOT provide full code or complete solution

---------------------
STRICT RULES
---------------------
- Be concise but educational.
- Each point must be atomic (one idea per item).
- Avoid repeating the same idea across sections.
- Do NOT provide full solution or code.
- Prefer actionable feedback over vague comments.
- If the student's approach is completely wrong, still extract any partial positives if possible.
- If no correct points exist, return an empty "correct" array.

---------------------
OUTPUT FORMAT (STRICT JSON ONLY)
---------------------
Return ONLY a valid raw JSON object. No markdown, no explanations.

{{
  "correct": [
    {{
      "id": "c1",
      "text": "<short label>",
      "detail": "<clear explanation of why it's correct and why it matters>"
    }}
  ],
  "incorrect": [
    {{
      "id": "i1",
      "text": "<short label>",
      "detail": "<what is wrong, why it is wrong, and how to fix or think about it>"
    }}
  ],
  "hints": [
    {{
      "id": "h1",
      "level": 1,
      "text": "<subtle directional hint>"
    }},
    {{
      "id": "h2",
      "level": 2,
      "text": "<moderate hint with clearer guidance>"
    }},
    {{
      "id": "h3",
      "level": 3,
      "text": "<near-explicit hint without giving full solution>"
    }}
  ]
}}
"""
    raw = await ask_agent(prompt)
    try:
        data = strip_and_parse(raw)
        return ThoughtFeedback(**data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse thought feedback: {e}\n\nRaw: {raw[:600]}",
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
EXAMPLES:
{"".join(f'- Input: {ex.input}\n  Output: {ex.output}\n  Explanation: {ex.explanation}\n  Image: {ex.image}\n\n' for ex in req.problem.examples)}
CONSTRAINTS:
{"".join(f'- {c}\n' for c in req.problem.constraints)}

Write structured markdown with these sections:
## Intuition
(Explain the core insight or intuition that leads to the optimal solution. The intuition should be such that if the student understands it deeply, they could reconstruct the solution on their own. Avoid vague statements like "think about using a hash map" without explaining why.)
(After explaining the intuition, the student should be able to solve similar problems that share the same underlying insight, even if the surface details differ.)

## Approach
(Explain the brute-force solution first, then the optimal solution. For the optimal solution, break down the algorithm step by step, explaining the reasoning behind each step and how it connects to the intuition. Use clear examples or analogies if helpful.)
(Step-by-step algorithm walkthrough — numbered list)
(If multiple approaches are possible, briefly compare them and explain why the optimal one is better.)

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
    thought_block = ""
    if req.thoughtProcessContent:
        thought_block = (
            f"\nTHOUGHT PROCESS (from previous section — use this to identify all distinct approaches):\n"
            f"{req.thoughtProcessContent}\n"
        )

    prompt = f"""You are an expert at algorithm analysis. Provide a rigorous complexity analysis
and correctness proof for ALL distinct solutions/approaches to this problem in {req.language}.

PROBLEM: {req.problem.title} ({req.problem.difficulty})
DESCRIPTION:
{req.problem.description}

{thought_block}

Analyze every distinct approach covered (e.g. brute force, then the optimal solution).
For each approach give its own time and space complexity entry.

Return ONLY a raw JSON object:
{{
  "solutions": [
    {{
      "name": "<approach name, e.g. 'Brute Force' or 'Optimal (Hash Map)'>",
      "timeComplexity": "<e.g. O(n²)>",
      "spaceComplexity": "<e.g. O(1)>"
    }}
  ],
  "explanation": "<detailed markdown — for each solution break down time and space step by step, then compare them>",
  "correctnessProof": "<semi-formal proof for the optimal approach: state the claim, then prove it with case analysis or induction>"
}}"""

    def validate(text: str) -> dict:
        data = strip_and_parse(text)
        solutions = [SolutionComplexity(**s).model_dump() for s in data["solutions"]]
        return MathProof(
            solutions=solutions,
            explanation=data["explanation"],
            correctnessProof=data.get("correctnessProof"),
        ).model_dump()

    return StreamingResponse(
        _json_sse_stream(ask_agent_stream(prompt), validate),
        media_type="text/event-stream",
    )


@router.post("/generate-code")
async def generate_code(req: GenerateCodeRequest):
    """Stream all solutions with line-by-line step explanations."""
    thought_block = ""
    if req.thoughtProcessContent:
        thought_block = (
            f"\nTHOUGHT PROCESS (from previous section — generate code for each distinct approach described):\n"
            f"{req.thoughtProcessContent}\n"
        )

    prompt = f"""You are an expert competitive programmer. Write complete solutions for ALL distinct approaches described in the thought process for this LeetCode problem in {req.language}.
{thought_block}
PROBLEM: {req.problem.title} ({req.problem.difficulty})
DESCRIPTION:
{req.problem.description}

For each distinct approach (e.g. brute force first, then the optimal solution), provide a named solution with its own annotated steps.

Return ONLY a raw JSON object:
{{
  "solutions": [
    {{
      "name": "<approach name, e.g. 'Brute Force' or 'Optimal (Hash Map)'>",
      "code": "<complete solution as a single string; use \\n for newlines>",
      "steps": [
        {{
          "lineRange": [1, 1],
          "explanation": "<what these lines do and WHY — educational, not just descriptive>"
        }}
      ]
    }}
  ]
}}

Rules for steps (applied independently per solution):
- lineRange is [startLine, endLine] (1-indexed, inclusive) within that solution's code
- Cover every line; steps must be in order with no gaps
- Group closely related lines (e.g. a loop header + its first body line) into one step
- Aim for 5–8 steps per solution
- Explain the reasoning, not just what the code says"""

    def validate(text: str) -> dict:
        data = strip_and_parse(text)
        solutions = []
        for sol in data["solutions"]:
            steps = [CodeStep(**s).model_dump() for s in sol["steps"]]
            solutions.append(CodeSolution(name=sol["name"], code=sol["code"], steps=steps).model_dump())
        return CodeContent(solutions=solutions).model_dump()

    return StreamingResponse(
        _json_sse_stream(ask_agent_stream(prompt), validate),
        media_type="text/event-stream",
    )


@router.post("/send-followup")
async def send_followup(req: SendFollowUpRequest):
    """Stream a contextual follow-up answer using conversation history."""
    ctx = req.context
    problem = ctx.problem

    # ── Build problem block ───────────────────────────────────────────────────
    if problem:
        problem_block = (
            f"PROBLEM: {problem.title} ({problem.difficulty})\n"
            f"TAGS: {', '.join(problem.tags)}\n\n"
            f"DESCRIPTION:\n{problem.description}\n"
            f"EXAMPLES:\n"
            + "\n".join(
                f"- Input: {ex.input}\n  Output: {ex.output}\n  Explanation: {ex.explanation}\n  Image: {ex.image}\n"
                for ex in problem.examples
            )
            + f"CONSTRAINTS:\n" + "\n".join(f"- {c}" for c in problem.constraints)
        )
    else:
        problem_block = f"PROBLEM ID: {ctx.problemId}\n"

    # ── Build section-specific context block ──────────────────────────────────
    section_labels = {
        "thought-analysis": "thought-process feedback",
        "thoughtProcess": "intuition & approach explanation",
        "mathProof": "time/space complexity analysis and correctness proof",
        "code": "solution code and step-by-step breakdown",
    }
    section_label = section_labels.get(ctx.section, ctx.section)
    lang_note = f" (language: {ctx.language})" if ctx.language else ""

    if ctx.section == "thought-analysis" and ctx.feedbackType and ctx.feedbackItems:
        card_label = "things the student got RIGHT" if ctx.feedbackType == "correct" else "things the student needs to RECONSIDER"
        items_text = "\n".join(
            f"- {item.text}: {item.detail}" if item.detail else f"- {item.text}"
            for item in ctx.feedbackItems
        )
        thought_block = (
            f"\nSTUDENT'S ORIGINAL THOUGHT PROCESS:\n{ctx.userThought}\n"
            if ctx.userThought else ""
        )
        section_block = (
            f"SECTION: {section_label}\n"
            f"{thought_block}"
            f"The student is asking a follow-up about the '{ctx.feedbackType}' feedback card "
            f"({card_label}).\n\n"
            f"FEEDBACK ITEMS IN THIS CARD:\n{items_text}\n"
            f"Use the student's thought process and these feedback items as context to answer their follow-up. "
            f"Do NOT repeat the items verbatim unless necessary."
        )
    elif ctx.section == "thoughtProcess" and ctx.thoughtProcessContent:
        section_block = (
            f"SECTION: {section_label}{lang_note}\n\n"
            f"THOUGHT PROCESS CONTENT (what was shown to the student):\n"
            f"{ctx.thoughtProcessContent}\n\n"
            f"Answer the student's follow-up question using the content above as context."
        )
    elif ctx.section == "mathProof" and ctx.mathProofContent:
        proof = ctx.mathProofContent
        solutions_text = "\n".join(
            f"- {s.name}: Time {s.timeComplexity}, Space {s.spaceComplexity}"
            for s in proof.solutions
        )
        proof_text = (
            f"Solutions & Complexities:\n{solutions_text}\n\n"
            f"Explanation:\n{proof.explanation}"
        )
        if proof.correctnessProof:
            proof_text += f"\n\nCorrectness Proof:\n{proof.correctnessProof}"
        section_block = (
            f"SECTION: {section_label}{lang_note}\n\n"
            f"COMPLEXITY ANALYSIS CONTENT (what was shown to the student):\n"
            f"{proof_text}\n\n"
            f"Answer the student's follow-up question using the analysis above as context."
        )
    elif ctx.section == "code" and ctx.codeContent:
        solutions_text = ""
        for sol in ctx.codeContent.solutions:
            steps_text = "\n".join(
                f"Lines {s.lineRange[0]}-{s.lineRange[1]}: {s.explanation}"
                for s in sol.steps
            )
            solutions_text += (
                f"\n### {sol.name}\n"
                f"```\n{sol.code}\n```\n"
                f"Steps:\n{steps_text}\n"
            )
        section_block = (
            f"SECTION: {section_label}{lang_note}\n\n"
            f"CODE SOLUTIONS (what was shown to the student):\n"
            f"{solutions_text}\n"
            f"Answer the student's follow-up question using the code and breakdowns above as context."
        )
    else:
        section_block = f"SECTION: {section_label}{lang_note}\n"
    

    # ── Compose the user turn with full context as a prefix ───────────────────
    problem_block = problem_block + "\n\n" if problem_block else ""
    section_block = section_block + "\n\n" if section_block else ""
    user_message = (
        f"[QUESTION]\n"
        f"{req.question}"
    )

    history = [{"role": m.role, "content": m.content} for m in req.history]

    return StreamingResponse(
        _text_sse_stream(chat_with_history_stream(history, user_message, problem_description=problem_block + section_block)),
        media_type="text/event-stream",
    )
