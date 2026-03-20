import { useState, useCallback } from 'react';
import type { ChatMessage, ChatContext } from '@/types';
import { sendFollowUp } from '@/services/api';

let messageIdCounter = 0;
function nextId() {
  return `msg-${++messageIdCounter}-${Date.now()}`;
}

// localStorage key is unique per conversation panel:
// - thought-analysis is split by feedbackType (correct vs incorrect)
// - other sections are split by section + language
function storageKey(ctx: ChatContext) {
  const parts = ['lc_chat', ctx.problemId, ctx.section];
  if (ctx.feedbackType) parts.push(ctx.feedbackType);
  if (ctx.language) parts.push(ctx.language);
  return parts.join('_');
}

// Shape stored in localStorage: minimal, only what the AI needs
type HistoryEntry = { role: string; content: string };

function loadHistory(ctx: ChatContext): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(ctx));
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(ctx: ChatContext, history: HistoryEntry[]) {
  try {
    localStorage.setItem(storageKey(ctx), JSON.stringify(history));
  } catch {
    // localStorage full or unavailable — silently continue
  }
}

// Convert stored history entries to display messages for initial render
function historyToMessages(history: HistoryEntry[]): ChatMessage[] {
  return history.map((entry, i) => ({
    id: `msg-restored-${i}`,
    role: entry.role === 'model' ? 'assistant' : 'user',
    content: entry.content,
    timestamp: Date.now(),
  }));
}

interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChat(context: ChatContext): UseChatReturn {
  // Restore previous messages from localStorage on first render
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    historyToMessages(loadHistory(context)),
  );
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    console.log('[useChat] sendMessage called', { text, isStreaming, context });
    if (!text.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: nextId(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    // Add a blank assistant placeholder immediately so the UI shows a streaming state
    const assistantId = nextId();
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);
    setIsStreaming(true);

    const history = loadHistory(context);

    try {
      let accumulated = '';
      const answer = await sendFollowUp(context, text.trim(), history, (chunk) => {
        accumulated += chunk;
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m),
        );
      });

      // Persist the completed exchange
      saveHistory(context, [
        ...history,
        { role: 'user', content: text.trim() },
        { role: 'model', content: answer },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [context, isStreaming]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(storageKey(context));
  }, [context]);

  return { messages, isStreaming, sendMessage, clearMessages };
}
