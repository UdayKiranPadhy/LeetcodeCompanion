export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Language = 'python' | 'java' | 'javascript';
export type InputMode = 'url' | 'title' | 'description';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
  image?: string;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  examples: ProblemExample[];
  constraints: string[];
}

export interface FeedbackItem {
  id: string;
  text: string;
  detail?: string;
}

export interface Hint {
  id: string;
  level: 1 | 2 | 3;
  text: string;
}

export interface ThoughtFeedback {
  correct: FeedbackItem[];
  incorrect: FeedbackItem[];
  hints: Hint[];
}

export interface SolutionComplexity {
  name: string;           // e.g. "Brute Force", "Optimal (Hash Map)"
  timeComplexity: string;
  spaceComplexity: string;
}

export interface MathProof {
  solutions: SolutionComplexity[];
  explanation: string;
  correctnessProof?: string;
}

export interface CodeStep {
  lineRange: [number, number];
  explanation: string;
}

export interface CodeSolution {
  name: string;
  code: string;
  steps: CodeStep[];
}

export interface Solution {
  language: Language;
  thoughtProcess: string;
  mathProof: MathProof;
  codeSolutions: CodeSolution[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatContext {
  problemId: string;
  section: 'thought-analysis' | 'thoughtProcess' | 'mathProof' | 'code';
  language?: Language;
  problem: Problem;
  // thought-analysis only
  userThought?: string;
  feedbackType?: 'correct' | 'incorrect';
  feedbackItems?: FeedbackItem[];
  // section content for follow-up context
  thoughtProcessContent?: string;
  mathProofContent?: MathProof;
  codeContent?: { solutions: CodeSolution[] };
}

export interface SectionLoadState {
  thoughtProcess: LoadingState;
  mathProof: LoadingState;
  code: LoadingState;
}

/* ── API response shapes ─────────────────────────────────────────────────── */
export interface FetchProblemResponse {
  problem: Problem;
  inputMode: InputMode;
}

export interface AnalyzeThoughtResponse {
  feedback: ThoughtFeedback;
}

export interface GenerateSolutionResponse {
  solution: Solution;
}

export interface FollowUpResponse {
  answer: string;
}
