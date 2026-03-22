import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/home/HeroSection';
import { fetchProblemDetails } from '@/services/api';

const RATE_LIMIT_RE = /rate.?limit|429|quota|resource exhausted/i;

export function HomePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('lc_chat_')) localStorage.removeItem(key);
    }
  }, []);
  const [error, setError] = useState<string | null>(null);

  // Auto-dismiss after 5 s
  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(id);
  }, [error]);

  async function handleSubmit(input: string) {
    setIsLoading(true);
    setError(null);
    try {
      const problem = await fetchProblemDetails(input);
      navigate(`/problem/${problem.slug}`, { state: { problem } });
    } catch (e) {
      const msg = (e as Error)?.message ?? '';
      setError(RATE_LIMIT_RE.test(msg) ? msg : 'Could not load the problem. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <div>
      <HeroSection onSubmit={handleSubmit} isLoading={isLoading} />
      {error && (
        <p
          style={{
            position: 'fixed',
            bottom: 'var(--space-8)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-error-bg)',
            border: '1px solid var(--color-error-border)',
            color: 'var(--color-error)',
            padding: 'var(--space-3) var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-sm)',
            boxShadow: 'var(--shadow-md)',
            animation: 'slide-up 300ms var(--ease-decelerate)',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
