import React, { useState } from 'react';
import { SearchInput } from './SearchInput';

interface HeroSectionProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

export function HeroSection({ onSubmit, isLoading }: HeroSectionProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <section
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - var(--header-height))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-16) var(--space-6)',
      }}
    >
      {/* Backdrop overlay for focus mode */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(255, 255, 255, 0.7)', // Higher opacity, no blur
          zIndex: 40,
          opacity: searchFocused ? 1 : 0,
          pointerEvents: searchFocused ? 'auto' : 'none',
          transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        aria-hidden="true"
      />

      {/* Animated background orbs */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26,115,232,0.09) 0%, transparent 70%)',
            filter: 'blur(32px)',
            animation: 'orb-drift-a 14s ease-in-out infinite alternate',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            right: '-100px',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(66,133,244,0.07) 0%, transparent 70%)',
            filter: 'blur(32px)',
            animation: 'orb-drift-b 18s ease-in-out infinite alternate',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '40%',
            right: '10%',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(138,180,248,0.06) 0%, transparent 70%)',
            filter: 'blur(24px)',
            animation: 'orb-drift-a 22s ease-in-out infinite alternate-reverse',
          }}
        />
      </div>

      {/* Hero content */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-12)',
          width: '100%',
          maxWidth: '1200px',
        }}
      >
        {/* Left Side: Text */}
        <div
          style={{
            flex: '1 1 450px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            gap: 'var(--space-6)',
            opacity: searchFocused ? 0.3 : 1, // Slightly higher opacity
            filter: 'none', // Removed blur
            transition: 'opacity 300ms ease',
            animation: 'slide-up 500ms var(--ease-decelerate) forwards',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Tag line chip */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--color-accent-light)',
              color: 'var(--color-accent)',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="6" cy="6" r="3" />
            </svg>
            AI-powered problem companion
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: '-0.03em',
            }}
          >
            Think better.{' '}
            <span style={{ color: 'var(--color-accent)', display: 'block' }}>Solve smarter.</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'var(--text-xl)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              maxWidth: '540px',
              margin: '0',
            }}
          >
            Share your intuition. Get guided hints, correctness feedback, and
            beautifully explained solutions with mathematical proofs.
          </p>

          {/* Feature pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-2)',
            }}
          >
            {[
              { icon: '🔍', text: 'Approach analysis' },
              { icon: '💡', text: 'Progressive hints' },
              { icon: '∑', text: 'Mathematical proofs' },
              { icon: '</>', text: 'Step-by-step code' },
            ].map(f => (
              <span
                key={f.text}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span style={{ fontSize: '11px' }}>{f.icon}</span>
                {f.text}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side: Search */}
        <div
          style={{
            flex: '1 1 450px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            zIndex: searchFocused ? 50 : 1,
            animation: 'slide-up 600ms var(--ease-decelerate) forwards',
          }}
        >
          <SearchInput onSubmit={onSubmit} isLoading={isLoading} onFocusChange={setSearchFocused} />
        </div>
      </div>
    </section>
  );
}
