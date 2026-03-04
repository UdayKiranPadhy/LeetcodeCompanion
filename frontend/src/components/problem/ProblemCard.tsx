import React, { useRef, useState, useEffect } from 'react';
import type { Problem } from '@/types';
import { DifficultyBadge } from './DifficultyBadge';
import { Badge } from '@/components/ui/Badge';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

interface ProblemCardProps {
  problem: Problem;
  defaultCollapsed?: boolean;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="font-family:var(--font-code);background:var(--color-bg-secondary);padding:1px 5px;border-radius:var(--radius-sm);font-size:0.9em">$1</code>')
    .replace(/\n/g, '<br/>');
}

export function ProblemCard({ problem, defaultCollapsed = false }: ProblemCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [contentHeight, setContentHeight] = useState<number | 'auto'>(
    defaultCollapsed ? 0 : 'auto',
  );
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    if (isCollapsed) {
      // First set exact height, then animate to 0
      setContentHeight(contentRef.current.scrollHeight);
      requestAnimationFrame(() => setContentHeight(0));
    } else {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isCollapsed]);

  function handleTransitionEnd() {
    if (!isCollapsed) setContentHeight('auto');
  }

  return (
    <SpotlightCard
      style={{
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Header row */}
      <button
        onClick={() => setIsCollapsed(c => !c)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-5) var(--space-6)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        {/* Problem number + title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-text-primary)',
              }}
            >
              {problem.title}
            </span>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-2)',
            }}
          >
            {problem.tags.map(tag => (
              <Badge key={tag} label={tag} color="neutral" />
            ))}
          </div>
        </div>

        {/* Chevron */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          style={{
            flexShrink: 0,
            color: 'var(--color-text-tertiary)',
            transition: 'transform var(--duration-medium) var(--ease-standard)',
            transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        >
          <path
            d="M5 7.5l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Collapsible content */}
      <div
        ref={contentRef}
        onTransitionEnd={handleTransitionEnd}
        style={{
          height: contentHeight === 'auto' ? 'auto' : `${contentHeight}px`,
          overflow: 'hidden',
          transition: 'height var(--duration-medium) var(--ease-standard)',
        }}
      >
        <div style={{ padding: '0 var(--space-6) var(--space-6)' }}>
          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: 'var(--space-5)' }} />

          {/* Description */}
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-md)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--leading-relaxed)',
              marginBottom: 'var(--space-6)',
            }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(problem.description) }}
          />

          {/* Examples */}
          {problem.examples.length > 0 && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <p
                style={{
                  fontSize: 'var(--text-md)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 'var(--space-3)',
                }}
              >
                Examples
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {problem.examples.map((ex, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                    }}
                  >
                    <p style={{ fontFamily: 'var(--font-code)', fontSize: 'var(--text-sm)', marginBottom: ex.explanation ? 'var(--space-2)' : '0' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Input: </span>
                      <span style={{ color: 'var(--color-text-primary)' }}>{ex.input}</span>
                    </p>
                    <p style={{ fontFamily: 'var(--font-code)', fontSize: 'var(--text-sm)', marginBottom: ex.explanation ? 'var(--space-2)' : '0' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Output: </span>
                      <span style={{ color: 'var(--color-text-primary)' }}>{ex.output}</span>
                    </p>
                    {ex.explanation && (
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                        <em>{ex.explanation}</em>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constraints */}
          {problem.constraints.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 'var(--space-3)',
                }}
              >
                Constraints
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-1)',
                }}
              >
                {problem.constraints.map((c, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-2)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-code)',
                    }}
                  >
                    <span style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }}>•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}
