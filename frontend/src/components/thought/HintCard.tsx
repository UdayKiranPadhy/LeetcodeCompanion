import React, { useState } from 'react';
import type { Hint } from '@/types';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

interface HintCardProps {
  hints: Hint[];
}

const levelConfig = {
  1: { label: 'Gentle', color: 'var(--color-accent)', bg: 'var(--color-accent-light)' },
  2: { label: 'Nudge', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  3: { label: 'Near Solution', color: 'var(--color-error)', bg: 'var(--color-error-bg)' },
};

export function HintCard({ hints }: HintCardProps) {
  const [revealedCount, setRevealedCount] = useState(0);

  const revealedHints = hints.slice(0, revealedCount);
  const allRevealed = revealedCount >= hints.length;

  return (
    <SpotlightCard
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        animation: 'slide-up 400ms 200ms var(--ease-decelerate) both',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: revealedCount > 0 ? 'var(--space-4)' : '0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 2a5 5 0 0 1 2.5 9.33V13H6.5v-1.67A5 5 0 0 1 9 2z"
              stroke="var(--color-warning)"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path d="M6.5 15.5h5" stroke="var(--color-warning)" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M9 13v2" stroke="var(--color-warning)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--color-text-primary)',
            }}
          >
            Hints{revealedCount > 0 ? ` (${revealedCount}/${hints.length})` : ''}
          </span>
        </div>

        {/* Reveal button */}
        <button
          onClick={() => !allRevealed && setRevealedCount(c => c + 1)}
          disabled={allRevealed}
          style={{
            background: allRevealed ? 'transparent' : 'var(--color-accent)',
            color: allRevealed ? 'var(--color-text-tertiary)' : 'white',
            border: allRevealed ? '1px solid var(--color-border)' : 'none',
            borderRadius: 'var(--radius-full)',
            padding: '5px 14px',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-medium)',
            cursor: allRevealed ? 'default' : 'pointer',
            transition: 'all var(--duration-fast) var(--ease-standard)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
          onMouseEnter={e => {
            if (!allRevealed) e.currentTarget.style.background = 'var(--color-accent-hover)';
          }}
          onMouseLeave={e => {
            if (!allRevealed) e.currentTarget.style.background = 'var(--color-accent)';
          }}
        >
          {allRevealed ? (
            'All hints shown'
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M2 7l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {revealedCount === 0 ? 'Reveal hint' : 'Next hint'}
            </>
          )}
        </button>
      </div>

      {/* Hint items */}
      {revealedHints.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {revealedHints.map((hint, idx) => {
            const config = levelConfig[hint.level];
            return (
              <div
                key={hint.id}
                style={{
                  display: 'flex',
                  gap: 'var(--space-3)',
                  alignItems: 'flex-start',
                  padding: 'var(--space-4)',
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  animation: idx === revealedHints.length - 1
                    ? 'slide-up 250ms var(--ease-decelerate) both'
                    : 'none',
                }}
              >
                {/* Level badge */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    background: config.bg,
                    color: config.color,
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--weight-semibold)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  {config.label}
                </span>
                <p
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--leading-relaxed)',
                  }}
                >
                  {hint.text}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Teaser text when no hints revealed */}
      {revealedCount === 0 && (
        <p
          style={{
            marginTop: 'var(--space-3)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-tertiary)',
            lineHeight: 'var(--leading-normal)',
          }}
        >
          {hints.length} hint{hints.length !== 1 ? 's' : ''} available — reveal them one at a time.
        </p>
      )}
    </SpotlightCard>
  );
}
