import React from 'react';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="font-family:var(--font-code);background:rgba(0,0,0,0.06);padding:1px 5px;border-radius:3px;font-size:0.88em">$1</code>')
    .replace(/\n\n/g, '</p><p style="margin-top:6px">')
    .replace(/\n/g, '<br/>');
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
        dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(message.content)}</p>` }}
      />
    </div>
  );
}
