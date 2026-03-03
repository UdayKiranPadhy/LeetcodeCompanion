import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface ThoughtInputProps {
  onSubmit: (thought: string) => void;
  isLoading: boolean;
}

export function ThoughtInput({ onSubmit, isLoading }: ThoughtInputProps) {
  const [thought, setThought] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setThought(e.target.value);
    // Auto-grow
    const el = e.currentTarget;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
  }

  function handleSubmit() {
    if (!thought.trim() || isLoading) return;
    onSubmit(thought.trim());
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Heading */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Describe Your Approach
        </h2>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Write your intuition, even if it's incomplete or wrong. We'll show you exactly what's right, what's off, and give you hints to guide you to the solution.
        </p>
      </div>

      {/* Textarea */}
      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={thought}
          onChange={handleChange}
          placeholder="e.g. I think we can use a hash map to avoid the O(n²) brute force. For each number, we store it and look for its complement..."
          style={{
            width: '100%',
            minHeight: '160px',
            padding: 'var(--space-4)',
            paddingBottom: '28px',
            background: 'var(--color-bg-primary)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-relaxed)',
            resize: 'none',
            outline: 'none',
            transition: 'border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast)',
            caretColor: 'var(--color-accent)',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--color-border-focus)';
            e.currentTarget.style.boxShadow = 'var(--shadow-focus)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {/* Char count */}
        <span
          style={{
            position: 'absolute',
            bottom: 'var(--space-2)',
            right: 'var(--space-3)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-tertiary)',
            pointerEvents: 'none',
          }}
        >
          {thought.length} chars
        </span>
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="primary"
          size="md"
          isLoading={isLoading}
          onClick={handleSubmit}
          disabled={!thought.trim()}
          leftIcon={
            !isLoading ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8zm4 0l2-2 2 2M8 6v5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : undefined
          }
        >
          {isLoading ? 'Analyzing…' : 'Analyze My Approach'}
        </Button>
      </div>
    </div>
  );
}
