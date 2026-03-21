import React from 'react';
import type { ChatMessage as ChatMessageType } from '@/types';
import { renderMarkdown } from '@/utils/renderMarkdown';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        animation: 'slide-up 150ms var(--ease-decelerate) both',
      }}
    >
      <div
        style={{
          maxWidth: '85%',
          padding: '8px 12px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
          color: isUser ? 'white' : 'var(--color-text-primary)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-body)',
          lineHeight: 'var(--leading-relaxed)',
          border: isUser ? 'none' : '1px solid var(--color-border)',
          wordBreak: 'break-word',
        }}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
      />
    </div>
  );
}
