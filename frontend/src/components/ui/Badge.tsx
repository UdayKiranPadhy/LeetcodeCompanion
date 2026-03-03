import React from 'react';

type BadgeColor = 'neutral' | 'blue' | 'green' | 'amber' | 'red';

interface BadgeProps {
  label: string;
  color?: BadgeColor;
}

const colorStyles: Record<BadgeColor, React.CSSProperties> = {
  neutral: {
    background: 'var(--color-bg-secondary)',
    color: 'var(--color-text-secondary)',
  },
  blue: {
    background: 'var(--color-accent-light)',
    color: 'var(--color-accent)',
  },
  green: {
    background: 'var(--color-success-bg)',
    color: 'var(--color-success)',
  },
  amber: {
    background: 'var(--color-warning-bg)',
    color: 'var(--color-warning)',
  },
  red: {
    background: 'var(--color-error-bg)',
    color: 'var(--color-error)',
  },
};

export function Badge({ label, color = 'neutral' }: BadgeProps) {
  return (
    <span
      style={{
        ...colorStyles[color],
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-semibold)',
        fontFamily: 'var(--font-body)',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        lineHeight: '18px',
      }}
    >
      {label}
    </span>
  );
}
