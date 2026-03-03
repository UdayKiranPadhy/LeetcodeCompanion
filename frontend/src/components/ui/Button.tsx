import React from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'text';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit';
  className?: string;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-accent)',
    color: 'var(--color-text-on-accent)',
    border: 'none',
  },
  secondary: {
    background: 'var(--color-accent-light)',
    color: 'var(--color-accent)',
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
  },
  text: {
    background: 'transparent',
    color: 'var(--color-accent)',
    border: 'none',
    padding: '0',
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { height: '32px', padding: '0 12px', fontSize: 'var(--text-sm)' },
  md: { height: '40px', padding: '0 16px', fontSize: 'var(--text-base)' },
  lg: { height: '48px', padding: '0 24px', fontSize: 'var(--text-md)' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onClick,
  children,
  type = 'button',
  className,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={className}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[variant === 'text' ? 'md' : size],
        ...(variant === 'text' ? { height: 'auto', padding: '0' } : {}),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        borderRadius: variant === 'text' ? '0' : 'var(--radius-full)',
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--weight-medium)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition:
          'background-color var(--duration-fast) var(--ease-standard), ' +
          'transform 100ms var(--ease-standard), ' +
          'box-shadow var(--duration-fast) var(--ease-standard), ' +
          'opacity var(--duration-fast)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        width: fullWidth ? '100%' : undefined,
        lineHeight: 1,
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        if (isDisabled) return;
        const el = e.currentTarget;
        if (variant === 'primary') {
          el.style.background = 'var(--color-accent-hover)';
          el.style.boxShadow = 'var(--shadow-sm)';
        } else if (variant === 'secondary') {
          el.style.background = 'var(--color-accent-subtle)';
        } else if (variant === 'ghost') {
          el.style.background = 'var(--color-bg-hover)';
        } else if (variant === 'text') {
          el.style.textDecoration = 'underline';
        }
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.background = variantStyles[variant].background as string;
        el.style.boxShadow = 'none';
        el.style.textDecoration = 'none';
      }}
      onMouseDown={e => {
        if (!isDisabled) e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onMouseUp={e => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {isLoading ? (
        <Spinner
          size="sm"
          color={variant === 'primary' ? 'white' : 'accent'}
        />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
