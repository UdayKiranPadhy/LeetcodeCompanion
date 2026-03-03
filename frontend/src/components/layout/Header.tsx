import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => { if (sentinel) observer.unobserve(sentinel); };
  }, []);

  const isHome = location.pathname === '/';

  return (
    <>
      {/* Scroll sentinel — sits at the top of page content */}
      <div ref={sentinelRef} style={{ position: 'absolute', top: 0, height: 1, pointerEvents: 'none' }} />

      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'var(--header-height)',
          background: 'var(--color-bg-primary)',
          borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--space-6)',
          zIndex: 'var(--z-sticky)',
          transition:
            'border-color var(--duration-normal) var(--ease-standard), ' +
            'box-shadow var(--duration-normal) var(--ease-standard)',
          boxShadow: scrolled ? 'var(--shadow-xs)' : 'none',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--max-width-wide)',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="28" height="28" rx="8" fill="var(--color-accent)" />
              <path
                d="M8 14h12M14 8l6 6-6 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-md)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              LC Companion
            </span>
          </button>

          {/* Right side — show problem indicator on problem page */}
          {!isHome && (
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                transition: 'all var(--duration-fast) var(--ease-standard)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--color-bg-hover)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              New problem
            </button>
          )}
        </div>
      </header>
    </>
  );
}
