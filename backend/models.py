import re
from typing import List, Optional
from pydantic import BaseModel, field_validator

_LEETCODE_PROBLEM_RE = re.compile(
    r"^(https?://)?(www\.)?leetcode\.com/problems/[\w-]+/?",
    re.IGNORECASE,
)


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


class SolutionComplexity(BaseModel):
    name: str           # e.g. "Brute Force", "Optimal (Two Pointers)"
    timeComplexity: str
    spaceComplexity: str


class MathProof(BaseModel):
    solutions: List[SolutionComplexity]
    explanation: str
    correctnessProof: Optional[str] = None


class CodeStep(BaseModel):
    lineRange: List[int]  # [startLine, endLine], 1-indexed
    explanation: str


class CodeSolution(BaseModel):
    name: str           # e.g. "Brute Force", "Optimal (Hash Map)"
    code: str
    steps: List[CodeStep]


class ChatMessage(BaseModel):
    role: str      # "user" | "model"
    content: str


# ── Request bodies ────────────────────────────────────────────────────────────

class FetchProblemRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def must_be_leetcode_problem_url(cls, v: str) -> str:
        if not _LEETCODE_PROBLEM_RE.match(v.strip()):
            raise ValueError(
                "Only LeetCode problem URLs are accepted "
                "(e.g. https://leetcode.com/problems/two-sum/)"
            )
        return v.strip()


class AnalyzeThoughtRequest(BaseModel):
    problem: Problem
    user_thought: str


class GenerateThoughtProcessRequest(BaseModel):
    problem: Problem
    language: str


class GenerateMathProofRequest(BaseModel):
    problem: Problem
    language: str
    thoughtProcessContent: Optional[str] = None


class GenerateCodeRequest(BaseModel):
    problem: Problem
    language: str
    thoughtProcessContent: Optional[str] = None


class CodeContent(BaseModel):
    solutions: List[CodeSolution]


class ChatContext(BaseModel):
    problemId: str
    section: str  # 'thought-analysis' | 'thoughtProcess' | 'mathProof' | 'code'
    language: Optional[str] = None
    problem: Optional[Problem] = None
    userThought: Optional[str] = None
    feedbackType: Optional[str] = None   # 'correct' | 'incorrect'
    feedbackItems: Optional[List[FeedbackItem]] = None
    # section content for follow-up context
    thoughtProcessContent: Optional[str] = None
    mathProofContent: Optional[MathProof] = None
    codeContent: Optional[CodeContent] = None


class SendFollowUpRequest(BaseModel):
    context: ChatContext
    question: str
    history: List[ChatMessage] = []
