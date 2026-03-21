import type {
  Problem,
  Language,
  ThoughtFeedback,
  MathProof,
  CodeSolution,
  ChatContext,
} from '@/types';

const API_BASE = 'http://localhost:8000';

// ── SSE event shapes ──────────────────────────────────────────────────────────

interface ChunkEvent { type: 'chunk'; text: string }
interface ResultEvent<T> { type: 'result'; data: T }
interface ErrorEvent { type: 'error'; message: string }
type SSEEvent<T> = ChunkEvent | ResultEvent<T> | ErrorEvent;

// ── Regular POST ─────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Core SSE reader ───────────────────────────────────────────────────────────

async function* readSSE<T>(path: string, body: unknown): AsyncGenerator<SSEEvent<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `Request failed: ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      if (!part.startsWith('data: ')) continue;
      const payload = part.slice(6).trim();
      if (payload === '[DONE]') return;
      yield JSON.parse(payload) as SSEEvent<T>;
    }
  }
}

// Collect stream → final typed result (JSON endpoints)
async function streamToResult<T>(path: string, body: unknown): Promise<T> {
  for await (const event of readSSE<T>(path, body)) {
    if (event.type === 'result') return event.data;
    if (event.type === 'error') throw new Error(event.message);
  }
  throw new Error('Stream ended without a result');
}

// Collect stream → full string, calling onChunk on each piece (text endpoints)
async function streamText(
  path: string,
  body: unknown,
  onChunk?: (chunk: string) => void,
): Promise<string> {
  let full = '';
  for await (const event of readSSE<never>(path, body)) {
    if (event.type === 'chunk') {
      full += event.text;
      onChunk?.(event.text);
    }
    if (event.type === 'error') throw new Error(event.message);
  }
  return full;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchProblemDetails(input: string): Promise<Problem> {
  return post<Problem>('/fetch-problem', { url: input });
}

export async function analyzeThoughtProcess(
  problem: Problem,
  userThought: string,
): Promise<ThoughtFeedback> {
  return post<ThoughtFeedback>('/analyze-thought', { problem, user_thought: userThought });
}

export async function generateThoughtProcess(
  problem: Problem,
  language: Language,
  onChunk?: (chunk: string) => void,
): Promise<string> {
  return streamText('/generate-thought-process', { problem, language }, onChunk);
}

export async function generateMathProof(
  problem: Problem,
  language: Language,
  thoughtProcessContent?: string,
): Promise<MathProof> {
  return streamToResult<MathProof>('/generate-math-proof', { problem, language, thoughtProcessContent });
}

export async function generateCode(
  problem: Problem,
  language: Language,
  thoughtProcessContent?: string,
): Promise<{ solutions: CodeSolution[] }> {
  return streamToResult<{ solutions: CodeSolution[] }>('/generate-code', { problem, language, thoughtProcessContent });
}

export async function sendFollowUp(
  context: ChatContext,
  question: string,
  history: { role: string; content: string }[],
  onChunk?: (chunk: string) => void,
): Promise<string> {
  return streamText('/send-followup', { context, question, history }, onChunk);
}
