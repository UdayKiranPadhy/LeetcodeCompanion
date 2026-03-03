import React, { useState, useEffect, useRef } from 'react';
import { Spinner } from '@/components/ui/Spinner';

interface SearchInputProps {
  onSubmit: (value: string) => void;
  isLoading?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

const PLACEHOLDERS = [
  'Paste a LeetCode URL…',
  'Type a problem title (e.g. Two Sum)…',
  'Paste the full problem description…',
];

export function SearchInput({ onSubmit, isLoading = false, onFocusChange }: SearchInputProps) {
  const [value, setValue] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [shaking, setShaking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  // Cycle placeholder
  useEffect(() => {
    if (isFocused || value) return;

    intervalRef.current = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex(i => (i + 1) % PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 300);
    }, 2100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isFocused, value]);

  useEffect(() => {
    onFocusChange?.(isFocused);
  }, [isFocused, onFocusChange]);

  function handleSubmit() {
    if (!value.trim()) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }
    onSubmit(value.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '620px' }}>
      {/* Label above search bar when focused */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          left: '0',
          width: '100%',
          textAlign: 'center',
          color: 'var(--color-text-primary)',
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--weight-medium)',
          opacity: isFocused ? 1 : 0,
          transform: isFocused ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
        }}
      >
        Enter a LeetCode URL, problem title, or description
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--color-bg-primary)',
          border: `1px solid ${isFocused ? 'var(--color-border-focus)' : 'var(--color-border)'}`,
          borderRadius: '28px', // Matched height/2
          minHeight: '56px',
          height: 'auto',
          padding: '8px 6px 8px 20px',
          boxShadow: isFocused ? 'var(--shadow-focus)' : 'var(--shadow-md)',
          transition:
            'border-color var(--duration-fast) var(--ease-standard), ' +
            'box-shadow var(--duration-fast) var(--ease-standard)',
          animation: shaking ? 'shake 400ms var(--ease-standard)' : 'none',
          gap: 'var(--space-3)',
        }}
      >
        {/* Input + animated placeholder */}
        <div style={{ flex: 1, position: 'relative', minHeight: '24px', display: 'flex', alignItems: 'center' }}>
          {/* Animated placeholder */}
          {!value && !isFocused && (
            <span
              key={placeholderIndex}
              style={{
                position: 'absolute',
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--text-lg)',
                pointerEvents: 'none',
                userSelect: 'none',
                animation: placeholderVisible
                  ? 'placeholder-in 300ms var(--ease-decelerate) forwards'
                  : 'placeholder-out 250ms var(--ease-accelerate) forwards',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                lineHeight: '24px', // Match textarea line-height
              }}
            >
              {PLACEHOLDERS[placeholderIndex]}
            </span>
          )}

          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={1}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-md)',
              lineHeight: '24px',
              color: 'var(--color-text-primary)',
              caretColor: 'var(--color-accent)',
              resize: 'none',
              overflow: 'hidden',
              padding: 0,
              margin: 0,
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
              Explore
            </>
          )}
        </button>
      </div>

      {/* Hint text */}
      <p
        style={{
          marginTop: 'var(--space-3)',
          fontSize: 'var(--text-base)',
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
