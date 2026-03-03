import React, { useEffect, useState } from 'react';
import type { Problem, Language } from '@/types';
import { useProblem } from '@/hooks/useProblem';
import { Tabs } from '@/components/ui/Tabs';
import { ThoughtSection } from './ThoughtSection';
import { MathProofSection } from './MathProofSection';
import { CodeBlock } from './CodeBlock';
import { StepExplainer } from './StepExplainer';
import { ChatPanel } from '@/components/chat/ChatPanel';
import type { ChatContext } from '@/types';

interface SolutionViewProps {
  problem: Problem;
  problemHook: ReturnType<typeof useProblem>;
}

const LANG_TABS = [
  { id: 'python' as Language, label: 'Python' },
  { id: 'java' as Language, label: 'Java' },
  { id: 'javascript' as Language, label: 'JavaScript' },
];

export function SolutionView({ problem, problemHook }: SolutionViewProps) {
  const {
    solution,
    sectionLoadState,
    activeLanguage,
    setActiveLanguage,
    generateSolution,
    isGenerating,
  } = problemHook;

  const [activeStep, setActiveStep] = useState(-1);
  const [codeChatOpen, setCodeChatOpen] = useState(false);

  const codeChatContext: ChatContext = {
    problemId: problem.id,
    section: 'code',
    language: activeLanguage,
  };

  // Trigger generation when language changes or on mount
  useEffect(() => {
    if (
      sectionLoadState.thoughtProcess === 'idle' &&
      !isGenerating
    ) {
      generateSolution(activeLanguage);
    }
  }, [activeLanguage]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleLanguageChange(lang: string) {
    setActiveLanguage(lang as Language);
    setActiveStep(-1);
    setCodeChatOpen(false);
  }

  const isCodeReady = sectionLoadState.code === 'success' && solution.code;
  const showCodeSection = sectionLoadState.mathProof === 'success';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Language selector */}
      <div>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-tertiary)',
            marginBottom: 'var(--space-3)',
          }}
        >
          Choose a language for the solution:
        </p>
        <Tabs
          tabs={LANG_TABS}
          activeTab={activeLanguage}
          onChange={handleLanguageChange}
          variant="pill"
        />
      </div>

      {/* Section 1: Thought Process */}
      {sectionLoadState.thoughtProcess !== 'idle' && (
        <ThoughtSection
          content={solution.thoughtProcess ?? ''}
          loadState={sectionLoadState.thoughtProcess}
          problemId={problem.id}
          language={activeLanguage}
        />
      )}

      {/* Section 2: Math Proof (only after thought finishes) */}
      {sectionLoadState.mathProof !== 'idle' && (
        <MathProofSection
          mathProof={solution.mathProof}
          loadState={sectionLoadState.mathProof}
          problemId={problem.id}
          language={activeLanguage}
        />
      )}

      {/* Section 3: Code + Steps (only after proof finishes) */}
      {showCodeSection && (
        <div
          className={isCodeReady ? 'section-revealed' : 'section-hidden'}
          style={{
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {/* Section header */}
          <div
            style={{
              padding: 'var(--space-5) var(--space-6)',
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(26,115,232,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4l4-3 4 3M2 10l4 3 4-3M2 4v6M10 4v6" stroke="var(--color-accent)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-md)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1,
                }}
              >
                Code Solution
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                Click a step to highlight lines
              </p>
            </div>
          </div>

          <div style={{ padding: 'var(--space-6)' }}>
            {sectionLoadState.code === 'loading' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div className="skeleton-line" style={{ width: '100%', height: '200px', borderRadius: 'var(--radius-md)' }} />
                {[100, 85, 70, 90, 65].map((w, i) => (
                  <div key={i} className="skeleton-line" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : isCodeReady ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {/* Code block */}
                <CodeBlock
                  code={solution.code!}
                  language={activeLanguage}
                  steps={solution.steps}
                  activeStep={activeStep}
                />

                {/* Step explainer */}
                {solution.steps && solution.steps.length > 0 && (
                  <StepExplainer
                    steps={solution.steps}
                    activeStep={activeStep}
                    onStepChange={setActiveStep}
                  />
                )}

                {/* Follow-up */}
                <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                  <button
                    onClick={() => setCodeChatOpen(o => !o)}
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
                    {codeChatOpen ? 'Close follow-up' : 'Ask follow-up about the code'}
                  </button>

                  <ChatPanel
                    context={codeChatContext}
                    isOpen={codeChatOpen}
                    onClose={() => setCodeChatOpen(false)}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
