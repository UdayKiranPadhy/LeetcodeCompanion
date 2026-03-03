import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import type { Problem } from '@/types';
import { fetchProblemDetails } from '@/services/mockApi';
import { useProblem } from '@/hooks/useProblem';
import { ProblemCard } from '@/components/problem/ProblemCard';
import { Tabs } from '@/components/ui/Tabs';
import { ThoughtInput } from '@/components/thought/ThoughtInput';
import { FeedbackCard } from '@/components/thought/FeedbackCard';
import { HintCard } from '@/components/thought/HintCard';
import { SolutionView } from '@/components/solution/SolutionView';
import { Spinner } from '@/components/ui/Spinner';

const PAGE_TABS = [
  {
    id: 'analyze',
    label: 'Analyze My Approach',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 7l1.5 1.5L9 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'solution',
    label: 'Generate Solution',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 4l3.5-2.5 3.5 2.5M2 10l3.5 2.5L9 10M2 4v6M9 4v6M11 6l2 1-2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function ProblemPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem | null>(
    (location.state as { problem?: Problem } | null)?.problem ?? null,
  );
  const [loadingProblem, setLoadingProblem] = useState(!problem);
  const [activeTab, setActiveTab] = useState<'analyze' | 'solution'>('analyze');

  const problemHook = useProblem();

  // If we navigated directly (no state), refetch
  useEffect(() => {
    if (!problem && slug) {
      setLoadingProblem(true);
      fetchProblemDetails(slug)
        .then(p => {
          setProblem(p);
          problemHook.setProblem(p);
        })
        .finally(() => setLoadingProblem(false));
    } else if (problem) {
      problemHook.setProblem(problem);
    }
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loadingProblem) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - var(--header-height))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-4)',
        }}
      >
        <Spinner size="lg" />
        <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-base)' }}>
          Loading problem…
        </p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - var(--header-height))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-4)',
        }}
      >
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-md)' }}>
          Problem not found.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '10px 20px',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
          }}
        >
          Go home
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 'var(--max-width-content)',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-6) var(--space-16)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}
      >
        {/* Problem card */}
        <ProblemCard problem={problem} defaultCollapsed={false} />

        {/* Mode tabs */}
        <Tabs
          tabs={PAGE_TABS}
          activeTab={activeTab}
          onChange={id => setActiveTab(id as 'analyze' | 'solution')}
          variant="underline"
        />

        {/* Tab content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {activeTab === 'analyze' && (
            <>
              {/* Thought input */}
              <ThoughtInput
                onSubmit={problemHook.submitThought}
                isLoading={problemHook.analyzeState === 'loading'}
              />

              {/* Feedback */}
              {problemHook.feedback && (
                <>
                  {problemHook.feedback.correct.length > 0 && (
                    <FeedbackCard
                      type="correct"
                      items={problemHook.feedback.correct}
                      problemId={problem.id}
                    />
                  )}
                  {problemHook.feedback.incorrect.length > 0 && (
                    <FeedbackCard
                      type="incorrect"
                      items={problemHook.feedback.incorrect}
                      problemId={problem.id}
                    />
                  )}
                  <HintCard hints={problemHook.feedback.hints} />
                </>
              )}
            </>
          )}

          {activeTab === 'solution' && (
            <SolutionView problem={problem} problemHook={problemHook} />
          )}
        </div>
      </div>
    </div>
  );
}
