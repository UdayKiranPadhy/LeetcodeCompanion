import React, { useState, useRef, useEffect } from 'react';
import type { LoadingState, ChatContext, Language, Problem } from '@/types';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { renderMarkdown } from '@/utils/renderMarkdown';

interface ThoughtSectionProps {
  content: string;
  loadState: LoadingState;
  problem: Problem;
  language: Language;
}

export function ThoughtSection({ content, loadState, problem, language }: ThoughtSectionProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');
  const contentRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
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
    section: 'thoughtProcess',
    language,
    problem,
    thoughtProcessContent: content,
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
            background: 'var(--color-accent-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1a4.5 4.5 0 0 1 2.25 8.4V11H4.75V9.4A4.5 4.5 0 0 1 7 1z" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M4.75 13h4.5" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinecap="round" />
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
            Thought Process
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
            Intuition and approach
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
              {[100, 88, 72, 92, 60].map((w, i) => (
                <div key={i} className="skeleton-line" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-relaxed)',
                }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />

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
                  {chatOpen ? 'Close follow-up' : 'Ask follow-up about thought process'}
                </button>

                <ChatPanel
                  context={context}
                  isOpen={chatOpen}
                  onClose={() => setChatOpen(false)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}
