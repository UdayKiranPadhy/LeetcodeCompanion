import React, { useState, useRef, useEffect } from 'react';
import type { LoadingState, MathProof, ChatContext, Language, Problem } from '@/types';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { renderMarkdown } from '@/utils/renderMarkdown';

interface MathProofSectionProps {
  mathProof: MathProof | undefined;
  loadState: LoadingState;
  problem: Problem;
  language: Language;
}

export function MathProofSection({ mathProof, loadState, problem, language }: MathProofSectionProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    if (isCollapsed) {
      setContentHeight(contentRef.current.scrollHeight);
      requestAnimationFrame(() => setContentHeight(0));
    } else {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isCollapsed]);

  function handleTransitionEnd() {
    if (!isCollapsed) setContentHeight('auto');
  }

  const context: ChatContext = {
    problemId: problem.id,
    section: 'mathProof',
    language,
    problem,
    mathProofContent: mathProof,
  };

  return (
    <SpotlightCard
      className={loadState === 'success' ? 'section-revealed' : 'section-hidden'}
      style={{
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Section header */}
      <button
        onClick={() => setIsCollapsed(c => !c)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-5) var(--space-6)',
          background: 'var(--color-bg-secondary)',
          border: 'none',
          borderBottom: isCollapsed ? 'none' : '1px solid var(--color-border)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg-secondary)'; }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-success-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 12l3-4 2 2 3-5 2 7" stroke="var(--color-success)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--color-text-primary)',
              lineHeight: 1,
            }}
          >
            Complexity & Proof
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
            Mathematical analysis
          </p>
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
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
        <div style={{ padding: 'var(--space-6)' }}>
          {loadState === 'loading' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {/* Complexity chips skeleton */}
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                {[80, 90].map((w, i) => (
                  <div key={i} className="skeleton-line" style={{ width: `${w}px`, height: '32px', borderRadius: 'var(--radius-md)' }} />
                ))}
              </div>
              {[100, 85, 70, 90].map((w, i) => (
                <div key={i} className="skeleton-line" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : mathProof ? (
            <>
              {/* Complexity chips */}
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-3)',
                  flexWrap: 'wrap',
                  marginBottom: 'var(--space-5)',
                }}
              >
                {[
                  { label: 'Time', value: mathProof.timeComplexity },
                  { label: 'Space', value: mathProof.spaceComplexity },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      padding: '6px 14px',
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-tertiary)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {label}:
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-code)',
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-relaxed)',
                  marginBottom: mathProof.correctnessProof ? 'var(--space-5)' : 0,
                }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(mathProof.explanation) }}
              />

              {/* Correctness proof */}
              {mathProof.correctnessProof && (
                <div
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    borderLeft: '3px solid var(--color-success-border)',
                  }}
                >
                  <p
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--weight-semibold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--color-success)',
                      marginBottom: 'var(--space-3)',
                    }}
                  >
                    Correctness Proof
                  </p>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      lineHeight: 'var(--leading-relaxed)',
                    }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(mathProof.correctnessProof) }}
                  />
                </div>
              )}

              {/* Follow-up */}
              <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
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
                    gap: '5px',
                    padding: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1C3.686 1 1 3.239 1 6c0 1.426.637 2.71 1.659 3.63L2 13l3.236-1.448C5.784 11.836 6.38 12 7 12c3.314 0 6-2.239 6-5s-2.686-5-6-5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                  {chatOpen ? 'Close follow-up' : 'Ask follow-up about complexity'}
                </button>

                <ChatPanel
                  context={context}
                  isOpen={chatOpen}
                  onClose={() => setChatOpen(false)}
                />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </SpotlightCard>
  );
}
