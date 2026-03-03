import React, { useRef, useEffect, useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pill';
}

export function Tabs({ tabs, activeTab, onChange, variant = 'underline' }: TabsProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (variant !== 'underline') return;
    const el = tabRefs.current[activeTab];
    if (el) {
      const parent = el.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const rect = el.getBoundingClientRect();
        setIndicatorStyle({
          left: rect.left - parentRect.left,
          width: rect.width,
        });
      }
    }
  }, [activeTab, variant]);

  if (variant === 'pill') {
    return (
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
        }}
      >
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: isActive ? 'var(--color-accent-light)' : 'transparent',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                fontWeight: isActive ? 'var(--weight-medium)' : 'var(--weight-regular)',
                cursor: 'pointer',
                transition: 'all var(--duration-fast) var(--ease-standard)',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Underline variant
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={el => { tabRefs.current[tab.id] = el; }}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              fontWeight: isActive ? 'var(--weight-medium)' : 'var(--weight-regular)',
              cursor: 'pointer',
              transition: 'color var(--duration-fast) var(--ease-standard)',
              position: 'relative',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              if (!isActive) e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={e => {
              if (!isActive) e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}

      {/* Sliding indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '-1px',
          height: '2px',
          background: 'var(--color-accent)',
          borderRadius: 'var(--radius-full)',
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          transition:
            'left var(--duration-normal) var(--ease-standard), ' +
            'width var(--duration-normal) var(--ease-standard)',
        }}
      />
    </div>
  );
}
