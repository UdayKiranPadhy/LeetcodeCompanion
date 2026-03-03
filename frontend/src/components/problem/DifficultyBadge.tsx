import React from 'react';
import type { Difficulty } from '@/types';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

const styles: Record<Difficulty, React.CSSProperties> = {
  Easy: {
    background: 'var(--color-difficulty-easy-bg)',
    color: 'var(--color-difficulty-easy)',
  },
  Medium: {
    background: 'var(--color-difficulty-medium-bg)',
    color: 'var(--color-difficulty-medium)',
  },
  Hard: {
    background: 'var(--color-difficulty-hard-bg)',
    color: 'var(--color-difficulty-hard)',
  },
};

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span
      style={{
        ...styles[difficulty],
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-semibold)',
        fontFamily: 'var(--font-body)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {difficulty}
    </span>
  );
}
