from typing import List, Optional
from pydantic import BaseModel


# ── Domain models ─────────────────────────────────────────────────────────────

class ProblemExample(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None
    image: Optional[str] = None


class Problem(BaseModel):
    id: str
    title: str
    slug: str
    difficulty: str  # 'Easy' | 'Medium' | 'Hard'
    tags: List[str]
    description: str
    examples: List[ProblemExample]
    constraints: List[str]


class FeedbackItem(BaseModel):
    id: str
    text: str
    detail: Optional[str] = None


class Hint(BaseModel):
    id: str
    level: int  # 1 | 2 | 3
    text: str


class ThoughtFeedback(BaseModel):
    correct: List[FeedbackItem]
    incorrect: List[FeedbackItem]
    hints: List[Hint]


class MathProof(BaseModel):
    timeComplexity: str
    spaceComplexity: str
    explanation: str
    correctnessProof: Optional[str] = None


class CodeStep(BaseModel):
    lineRange: List[int]  # [startLine, endLine], 1-indexed
    explanation: str


class ChatMessage(BaseModel):
    role: str      # "user" | "model"
    content: str


# ── Request bodies ────────────────────────────────────────────────────────────

class FetchProblemRequest(BaseModel):
    url: str


class AnalyzeThoughtRequest(BaseModel):
    problem: Problem
    user_thought: str


class GenerateThoughtProcessRequest(BaseModel):
    problem: Problem
    language: str


class GenerateMathProofRequest(BaseModel):
    problem: Problem
    language: str


class GenerateCodeRequest(BaseModel):
    problem: Problem
    language: str


class ChatContext(BaseModel):
    problemId: str
    section: str  # 'thought-analysis' | 'thoughtProcess' | 'mathProof' | 'code'
    language: Optional[str] = None
    problem: Optional[Problem] = None
    userThought: Optional[str] = None
    feedbackType: Optional[str] = None   # 'correct' | 'incorrect'
    feedbackItems: Optional[List[FeedbackItem]] = None


class SendFollowUpRequest(BaseModel):
    context: ChatContext
    question: str
    history: List[ChatMessage] = []
