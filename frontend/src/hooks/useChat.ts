import { useState, useCallback } from 'react';
import type { ChatMessage, ChatContext } from '@/types';
import { sendFollowUp } from '@/services/mockApi';

let messageIdCounter = 0;
function nextId() {
  return `msg-${++messageIdCounter}-${Date.now()}`;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChat(context: ChatContext): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: nextId(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      const answer = await sendFollowUp(context, text.trim());
      const assistantMessage: ChatMessage = {
        id: nextId(),
        role: 'assistant',
        content: answer,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsStreaming(false);
    }
  }, [context, isStreaming]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isStreaming, sendMessage, clearMessages };
}
