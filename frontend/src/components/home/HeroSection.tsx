import React, { useState } from 'react';
import { HeroBackground } from './HeroBackground';
import { SearchInput } from './SearchInput';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

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

      <HeroBackground />

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
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--space-6)',
            position: 'relative',
            zIndex: searchFocused ? 50 : 1,
            animation: 'slide-up 600ms var(--ease-decelerate) forwards',
          }}
        >
          <SearchInput onSubmit={onSubmit} isLoading={isLoading} onFocusChange={setSearchFocused} />

          {/* Quick Access Cards showing Spotlight Effect */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 'var(--space-4)',
            width: '100%',
            maxWidth: '620px',
            opacity: searchFocused ? 0 : 1,
            transform: searchFocused ? 'translateY(20px)' : 'translateY(0)',
            transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: searchFocused ? 'none' : 'auto',
          }}>
            <SpotlightCard
              style={{ padding: 'var(--space-4)', cursor: 'pointer' }}
              onClick={() => onSubmit('two-sum')}
              spotlightColor="rgba(26, 115, 232, 0.12)"
            >
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Two Sum</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-difficulty-easy)' }}>Easy • Array</div>
            </SpotlightCard>

            <SpotlightCard
              style={{ padding: 'var(--space-4)', cursor: 'pointer' }}
              onClick={() => onSubmit('lru-cache')}
              spotlightColor="rgba(26, 115, 232, 0.12)"
            >
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>LRU Cache</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-difficulty-medium)' }}>Medium • Design</div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
