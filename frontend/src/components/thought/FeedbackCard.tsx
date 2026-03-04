import React, { useState } from 'react';
import type { FeedbackItem, ChatContext } from '@/types';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

interface FeedbackCardProps {
  type: 'correct' | 'incorrect';
  items: FeedbackItem[];
  problemId: string;
}

export function FeedbackCard({ type, items, problemId }: FeedbackCardProps) {
  const [chatOpen, setChatOpen] = useState(false);

  const isCorrect = type === 'correct';
  const context: ChatContext = {
    problemId,
    section: 'thought-analysis',
  };

  if (items.length === 0) return null;

  return (
    <SpotlightCard
      style={{
        borderLeft: `4px solid ${isCorrect ? 'var(--color-success-border)' : 'var(--color-error-border)'}`,
        background: isCorrect ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
        borderRadius: `0 var(--radius-lg) var(--radius-lg) 0`,
        padding: 'var(--space-5)',
        animation: 'slide-up 400ms var(--ease-decelerate) both',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: isCorrect ? 'var(--color-success)' : 'var(--color-error)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isCorrect ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3L3 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--weight-semibold)',
            color: isCorrect ? 'var(--color-success)' : 'var(--color-error)',
          }}
        >
          {isCorrect ? 'What you got right' : 'Where to reconsider'}
        </span>
      </div>

      {/* Items */}
      <ul
        style={{
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
        }}
      >
        {items.map((item, idx) => (
          <li
            key={item.id}
            style={{
              animation: `slide-up 300ms ${idx * 80}ms var(--ease-decelerate) both`,
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: item.detail ? 'var(--space-1)' : '0',
              }}
            >
              {item.text}
            </p>
            {item.detail && (
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                }}
              >
                {item.detail}
              </p>
            )}
          </li>
        ))}
      </ul>

      {/* Follow-up toggle */}
      <button
        onClick={() => setChatOpen(o => !o)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--weight-medium)',
          color: 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
        onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1C3.686 1 1 3.239 1 6c0 1.426.637 2.71 1.659 3.63L2 13l3.236-1.448C5.784 11.836 6.38 12 7 12c3.314 0 6-2.239 6-5s-2.686-5-6-5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
        {chatOpen ? 'Close follow-up' : 'Ask follow-up about this'}
      </button>

      <ChatPanel
        context={context}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </SpotlightCard>
  );
}
