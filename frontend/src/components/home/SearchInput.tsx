import React, { useState, useEffect, useRef } from 'react';
import { Spinner } from '@/components/ui/Spinner';

interface SearchInputProps {
  onSubmit: (value: string) => void;
  isLoading?: boolean;
}

const PLACEHOLDERS = [
  'Paste a LeetCode URL…',
  'Type a problem title (e.g. Two Sum)…',
  'Paste the full problem description…',
];

export function SearchInput({ onSubmit, isLoading = false }: SearchInputProps) {
  const [value, setValue] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [shaking, setShaking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cycle placeholder
  useEffect(() => {
    if (isFocused || value) return;

    intervalRef.current = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex(i => (i + 1) % PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 300);
    }, 2800);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isFocused, value]);

  function handleSubmit() {
    if (!value.trim()) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }
    onSubmit(value.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '620px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--color-bg-primary)',
          border: `1.5px solid ${isFocused ? 'var(--color-border-focus)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-full)',
          height: '56px',
          padding: '0 6px 0 20px',
          boxShadow: isFocused ? 'var(--shadow-focus)' : 'var(--shadow-sm)',
          transition:
            'border-color var(--duration-fast) var(--ease-standard), ' +
            'box-shadow var(--duration-fast) var(--ease-standard)',
          animation: shaking ? 'shake 400ms var(--ease-standard)' : 'none',
          gap: 'var(--space-3)',
        }}
      >
        {/* Search icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          style={{ flexShrink: 0, color: 'var(--color-text-tertiary)' }}
        >
          <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        {/* Input + animated placeholder */}
        <div style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
          {/* Animated placeholder */}
          {!value && !isFocused && (
            <span
              key={placeholderIndex}
              style={{
                position: 'absolute',
                left: 0,
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--text-md)',
                pointerEvents: 'none',
                userSelect: 'none',
                animation: placeholderVisible
                  ? 'placeholder-in 300ms var(--ease-decelerate) forwards'
                  : 'placeholder-out 250ms var(--ease-accelerate) forwards',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {PLACEHOLDERS[placeholderIndex]}
            </span>
          )}

          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-md)',
              color: 'var(--color-text-primary)',
              caretColor: 'var(--color-accent)',
            }}
            aria-label="Enter a LeetCode URL, problem title, or paste the problem description"
          />
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            height: '42px',
            padding: '0 20px',
            background: isLoading ? 'var(--color-accent-hover)' : 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--weight-medium)',
            cursor: isLoading ? 'wait' : 'pointer',
            transition: 'background-color var(--duration-fast) var(--ease-standard), transform 100ms',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            if (!isLoading) e.currentTarget.style.background = 'var(--color-accent-hover)';
          }}
          onMouseLeave={e => {
            if (!isLoading) e.currentTarget.style.background = 'var(--color-accent)';
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" color="white" />
              Analyzing…
            </>
          ) : (
            <>
              Analyze
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Hint text */}
      <p
        style={{
          marginTop: 'var(--space-3)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-tertiary)',
          textAlign: 'center',
          lineHeight: 'var(--leading-normal)',
        }}
      >
        Accepts LeetCode URLs, problem titles, or full descriptions
      </p>
    </div>
  );
}
