import os
import json
import uuid
import re

from dotenv import load_dotenv

from google.adk.agents import Agent
from google.adk.runners import InMemoryRunner
from google.genai import types as genai_types
from google import genai as google_genai

# ── Env ───────────────────────────────────────────────────────────────────────

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY is not set. Add it to backend/.env")

os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite-preview")

SYSTEM_PROMPT = (
    "You are an expert competitive programmer and LeetCode tutor. Reply to the user like a helpful, patient, and knowledgeable tutor who is trying to help the student understand how to solve the problem. "
    "Always use the problem description and feedback card items (if provided) as context for your answer, but do not repeat the context verbatim in your response unless necessary. Instead, use the context to inform your answer. If the user is asking a follow-up question, make sure to address it directly without restating the original problem or feedback items unless it's necessary for clarity. "
    "When the user asks a question, provide a clear and concise explanation. If the question is about a specific part of the problem or feedback, focus your answer on that part. If the user is asking for hints, provide helpful hints without giving away the full solution. If the user is asking for a solution, provide a step-by-step explanation along with code snippets in Python. Always maintain a supportive and encouraging tone to help the student learn effectively."
)

# ── ADK agent (single-turn, stateless per request) ────────────────────────────

_agent = Agent(
    name="leetcode_companion",
    model=MODEL,
    instruction=SYSTEM_PROMPT,
    description="LeetCode Companion backend agent",
)

_runner = InMemoryRunner(agent=_agent)

# ── Gemini client (multi-turn chat with history) ──────────────────────────────

_client = google_genai.Client(api_key=GOOGLE_API_KEY)


# ── Rate limit handling ───────────────────────────────────────────────────────

_RATE_LIMIT_MESSAGE = "Server Rate Limit due to huge load traffic, might not be because of you. Try again later"


def _is_rate_limit_error(e: Exception) -> bool:
    msg = str(e).lower()
    return "429" in str(e) or "resource exhausted" in msg or "rate limit" in msg or "quota exceeded" in msg


# ── Core helpers ──────────────────────────────────────────────────────────────

async def ask_agent(prompt: str) -> str:
    """Send a single-turn prompt to the ADK agent and return the text response."""
    session_id = str(uuid.uuid4())
    user_id = f"req-{session_id}"

    await _runner.session_service.create_session(
        app_name=_runner.app_name,
        user_id=user_id,
        session_id=session_id,
    )

    message = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text=prompt)],
    )

    try:
        response_text = ""
        async for event in _runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=message,
        ):
            if event.is_final_response():
                if event.content and event.content.parts:
                    response_text = event.content.parts[0].text
                break
        return response_text
    except Exception as e:
        if _is_rate_limit_error(e):
            raise Exception(_RATE_LIMIT_MESSAGE) from e
        raise


async def ask_agent_stream(prompt: str):
    """Stream text chunks from Gemini for a single-turn prompt."""
    try:
        async for chunk in await _client.aio.models.generate_content_stream(
            model=MODEL,
            contents=[genai_types.Content(role="user", parts=[genai_types.Part(text=prompt)])],
            config=genai_types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
        ):
            if chunk.text:
                yield chunk.text
    except Exception as e:
        if _is_rate_limit_error(e):
            raise Exception(_RATE_LIMIT_MESSAGE) from e
        raise


def chat_with_history(history: list, user_message: str) -> str:
    """Multi-turn Gemini call. Prepends SYSTEM_PROMPT; never includes it in the return value."""
    contents = [
        genai_types.Content(
            role=msg["role"],
            parts=[genai_types.Part(text=msg["content"])],
        )
        for msg in history
    ]
    contents.append(
        genai_types.Content(
            role="user",
            parts=[genai_types.Part(text=user_message)],
        )
    )

    try:
        response = _client.models.generate_content(
            model=MODEL,
            contents=contents,
            config=genai_types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
        )
        return response.text
    except Exception as e:
        if _is_rate_limit_error(e):
            raise Exception(_RATE_LIMIT_MESSAGE) from e
        raise


async def chat_with_history_stream(history: list[None|dict], user_message: str, problem_description: str = "", append_before_history: str = ""):
    """Stream text chunks from a multi-turn Gemini chat."""
    contents = [
        genai_types.Content(
            role=msg["role"],
            parts=[genai_types.Part(text=msg["content"])],
        )
        for msg in history
    ]
    contents.append(
        genai_types.Content(
            role="user",
            parts=[genai_types.Part(text=user_message)],
        )
    )

    try:
        async for chunk in await _client.aio.models.generate_content_stream(
            model=MODEL,
            contents=contents,
            config=genai_types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT + "\n\n" + problem_description + "\n" + append_before_history, temperature=0.85),
        ):
            if chunk.text:
                yield chunk.text
    except Exception as e:
        if _is_rate_limit_error(e):
            raise Exception(_RATE_LIMIT_MESSAGE) from e
        raise


def strip_and_parse(text: str) -> dict:
    """Remove markdown code fences (if any) and parse JSON."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE)
    text = text.strip()
    # Fix invalid JSON escape sequences (e.g. \{ \} \s from LaTeX/regex in LLM output)
    # by escaping backslashes not followed by valid JSON escape characters.
    text = re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', text)
    return json.loads(text)


