import React from 'react';

type Padding = 'sm' | 'md' | 'lg';
type Elevation = 'flat' | 'xs' | 'sm';

interface CardProps {
  children: React.ReactNode;
  padding?: Padding;
  elevation?: Elevation;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const paddingMap: Record<Padding, string> = {
  sm: 'var(--space-4)',
  md: 'var(--space-6)',
  lg: 'var(--space-8)',
};

const shadowMap: Record<Elevation, string> = {
  flat: 'none',
  xs: 'var(--shadow-xs)',
  sm: 'var(--shadow-sm)',
};

export function Card({
  children,
  padding = 'md',
  elevation = 'flat',
  className,
  style,
  onClick,
}: CardProps) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: paddingMap[padding],
        boxShadow: shadowMap[elevation],
        transition: 'box-shadow var(--duration-normal) var(--ease-standard)',
        ...style,
      }}
      onMouseEnter={e => {
        if (elevation === 'flat') {
          e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
        }
      }}
      onMouseLeave={e => {
        if (elevation === 'flat') {
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {children}
    </div>
  );
}
