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

MODEL = "gemini-2.5-flash"

SYSTEM_PROMPT = (
    "You are an expert competitive programmer and LeetCode tutor. "
    "When asked to return JSON, output ONLY raw JSON — no markdown fences, "
    "no prose, no explanation. Just the JSON object itself."
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


async def ask_agent_stream(prompt: str):
    """Stream text chunks from Gemini for a single-turn prompt."""
    async for chunk in await _client.aio.models.generate_content_stream(
        model=MODEL,
        contents=[genai_types.Content(role="user", parts=[genai_types.Part(text=prompt)])],
        config=genai_types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
    ):
        if chunk.text:
            yield chunk.text


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

    response = _client.models.generate_content(
        model=MODEL,
        contents=contents,
        config=genai_types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
    )
    return response.text


async def chat_with_history_stream(history: list, user_message: str):
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

    async for chunk in await _client.aio.models.generate_content_stream(
        model=MODEL,
        contents=contents,
        config=genai_types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
    ):
        if chunk.text:
            yield chunk.text


def strip_and_parse(text: str) -> dict:
    """Remove markdown code fences (if any) and parse JSON."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE)
    return json.loads(text.strip())


