import React, { useState, useEffect, useRef } from 'react';
import { Spinner } from '@/components/ui/Spinner';

interface SearchInputProps {
  onSubmit: (value: string) => void;
  isLoading?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

const LEETCODE_URL_RE = /^(https?:\/\/)?(www\.)?leetcode\.com\/problems\/[\w-]+\/?/i;

function isValidLeetCodeUrl(value: string): boolean {
  return LEETCODE_URL_RE.test(value.trim());
}

export function SearchInput({ onSubmit, isLoading = false, onFocusChange }: SearchInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onFocusChange?.(isFocused);
  }, [isFocused, onFocusChange]);

  // Clear error when user edits
  useEffect(() => {
    if (validationError) setValidationError(null);
  }, [value]);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      setValidationError('Please paste a LeetCode problem URL.');
      return;
    }
    if (!isValidLeetCodeUrl(trimmed)) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      setValidationError('Please enter a valid LeetCode URL, e.g. https://leetcode.com/problems/two-sum/');
      return;
    }
    setValidationError(null);
    onSubmit(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }

  const hasError = !!validationError;

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
        Paste a LeetCode problem URL
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--color-bg-primary)',
          border: `1px solid ${hasError ? 'var(--color-error)' : isFocused ? 'var(--color-border-focus)' : 'var(--color-border)'}`,
          borderRadius: '28px',
          height: '56px',
          padding: '8px 6px 8px 20px',
          boxShadow: isFocused ? 'var(--shadow-focus)' : 'var(--shadow-md)',
          transition:
            'border-color var(--duration-fast) var(--ease-standard), ' +
            'box-shadow var(--duration-fast) var(--ease-standard)',
          animation: shaking ? 'shake 400ms var(--ease-standard)' : 'none',
          gap: 'var(--space-3)',
        }}
      >
        <input
          ref={inputRef}
          type="url"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="https://leetcode.com/problems/..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            lineHeight: '24px',
            color: 'var(--color-text-primary)',
            caretColor: 'var(--color-accent)',
            padding: 0,
            margin: 0,
            minWidth: 0,
          }}
          aria-label="Paste a LeetCode problem URL"
        />

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
            'Explore'
          )}
        </button>
      </div>

      {/* Hint / error text */}
      <p
        style={{
          marginTop: 'var(--space-3)',
          fontSize: 'var(--text-base)',
          color: hasError ? 'var(--color-error)' : 'var(--color-text-tertiary)',
          textAlign: 'center',
          lineHeight: 'var(--leading-normal)',
          transition: 'color var(--duration-fast)',
        }}
      >
        {hasError ? validationError : 'Paste a LeetCode problem URL to get started'}
      </p>
    </div>
  );
}
