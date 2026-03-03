import React from 'react';
import type { CodeStep } from '@/types';

interface StepExplainerProps {
  steps: CodeStep[];
  activeStep: number;
  onStepChange: (stepIndex: number) => void;
}

export function StepExplainer({ steps, activeStep, onStepChange }: StepExplainerProps) {
  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M1 4h14M1 8h10M1 12h7"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--color-text-primary)',
          }}
        >
          Step-by-Step
        </span>
        <span
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-tertiary)',
          }}
        >
          Click a step to highlight code
        </span>
      </div>

      {/* Steps list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {steps.map((step, idx) => {
          const isActive = idx === activeStep;
          return (
            <button
              key={idx}
              onClick={() => onStepChange(isActive ? -1 : idx)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                background: isActive ? 'var(--color-accent-light)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--color-accent-subtle)' : 'var(--color-border)'}`,
                borderLeft: `3px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--duration-normal) var(--ease-standard)',
                width: '100%',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--color-bg-hover)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {/* Step number circle */}
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: isActive ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                  border: `1.5px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all var(--duration-normal)',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 'var(--weight-semibold)',
                    color: isActive ? 'white' : 'var(--color-text-tertiary)',
                    fontFamily: 'var(--font-body)',
                    lineHeight: 1,
                  }}
                >
                  {idx + 1}
                </span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Line range */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-code)',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                    background: isActive ? 'rgba(26,115,232,0.1)' : 'var(--color-bg-secondary)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  {step.lineRange[0] === step.lineRange[1]
                    ? `Line ${step.lineRange[0]}`
                    : `Lines ${step.lineRange[0]}–${step.lineRange[1]}`}
                </span>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-relaxed)',
                    fontWeight: isActive ? 'var(--weight-medium)' : 'var(--weight-regular)',
                  }}
                >
                  {step.explanation}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
