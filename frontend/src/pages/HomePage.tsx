import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/home/HeroSection';
import { fetchProblemDetails } from '@/services/mockApi';

export function HomePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(input: string) {
    setIsLoading(true);
    setError(null);
    try {
      const problem = await fetchProblemDetails(input);
      navigate(`/problem/${problem.slug}`, { state: { problem } });
    } catch {
      setError('Could not load the problem. Please try again.');
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
