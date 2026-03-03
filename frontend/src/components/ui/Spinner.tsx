import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'accent' | 'white' | 'muted';
}

const sizes = { sm: 16, md: 24, lg: 36 };
const colors = {
  accent: 'var(--color-accent)',
  white: '#FFFFFF',
  muted: 'var(--color-text-tertiary)',
};

export function Spinner({ size = 'md', color = 'accent' }: SpinnerProps) {
  const px = sizes[size];
  const stroke = colors[color];
  const r = (px / 2) * 0.7;
  const circumference = 2 * Math.PI * r;

  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      style={{
        animation: 'spin 700ms linear infinite',
        flexShrink: 0,
      }}
      aria-label="Loading"
      role="status"
    >
      {/* Track */}
      <circle
        cx={px / 2}
        cy={px / 2}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={2.5}
        opacity={0.2}
      />
      {/* Arc */}
      <circle
        cx={px / 2}
        cy={px / 2}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={2.5}
        strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${px / 2} ${px / 2})`}
      />
    </svg>
  );
}
