import React, { useEffect, useRef, useState } from 'react';
import type { Language, CodeStep } from '@/types';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);

interface CodeBlockProps {
  code: string;
  language: Language;
  steps?: CodeStep[];
  activeStep?: number;
}

const LANG_LABELS: Record<Language, string> = {
  python: 'Python',
  java: 'Java',
  javascript: 'JavaScript',
};

export function CodeBlock({ code, language, steps, activeStep }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!codeRef.current) return;
    // Remove the data-highlighted attr so hljs re-processes on language/code change
    delete (codeRef.current.dataset as Record<string, string | undefined>).highlighted;
    hljs.highlightElement(codeRef.current);
  }, [code, language]);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const lines = code.split('\n');
  const activeRange = (steps && activeStep !== undefined && activeStep >= 0)
    ? steps[activeStep]?.lineRange
    : undefined;

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: '#282C34',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: '#21252B',
        }}
      >
        {/* Dots */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['#FF5F57', '#FFBD2E', '#28C840'].map((c, i) => (
            <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Language badge */}
          <span
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.6)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-code)',
              fontWeight: 'var(--weight-medium)',
            }}
          >
            {LANG_LABELS[language]}
          </span>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: copied ? '#4CAF50' : 'rgba(255,255,255,0.5)',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-body)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              transition: 'all var(--duration-fast)',
            }}
            onMouseEnter={e => { if (!copied) e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
            onMouseLeave={e => { if (!copied) e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M3 8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code area */}
      <div
        style={{
          overflowX: 'auto',
          position: 'relative',
        }}
      >
        {/* Line highlight overlay */}
        {activeRange && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {lines.map((_, lineIdx) => {
              const lineNum = lineIdx + 1;
              const isHighlighted =
                lineNum >= activeRange[0] && lineNum <= activeRange[1];
              return (
                <div
                  key={lineIdx}
                  style={{
                    height: '1.6em',
                    background: isHighlighted
                      ? 'rgba(255, 214, 0, 0.12)'
                      : 'transparent',
                    borderLeft: isHighlighted
                      ? '3px solid rgba(255, 214, 0, 0.6)'
                      : '3px solid transparent',
                    transition: 'background var(--duration-normal)',
                  }}
                />
              );
            })}
          </div>
        )}

        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            fontFamily: 'var(--font-code)',
            fontSize: '13px',
            lineHeight: '1.6',
          }}
        >
          <tbody>
            {lines.map((_, idx) => (
              <tr key={idx}>
                {/* Line number */}
                <td
                  style={{
                    userSelect: 'none',
                    color: 'rgba(255,255,255,0.2)',
                    textAlign: 'right',
                    padding: '0 12px 0 16px',
                    width: '1%',
                    whiteSpace: 'nowrap',
                    fontSize: '12px',
                    verticalAlign: 'top',
                    paddingTop: '1px',
                  }}
                >
                  {idx + 1}
                </td>
                <td style={{ padding: '0 16px 0 0', verticalAlign: 'top' }}>
                  {/* Empty — actual highlighting is via the pre/code below */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Actual highlighted code — positioned absolutely over the table */}
        <pre
          style={{
            position: 'absolute',
            top: 0,
            left: '44px',    // width of line number column
            right: 0,
            margin: 0,
            padding: '0 16px 16px 0',
            background: 'transparent',
            overflow: 'visible',
            fontSize: '13px',
            lineHeight: '1.6',
          }}
        >
          <code
            ref={codeRef}
            className={`language-${language}`}
            style={{
              background: 'transparent',
              padding: 0,
              fontFamily: 'var(--font-code)',
            }}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
