import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            [position === 'top' ? 'bottom' : 'top']: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-text-primary)',
            color: '#FFFFFF',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-body)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 'var(--z-tooltip)',
            animation: 'fade-in 150ms var(--ease-decelerate) forwards',
          }}
        >
          {content}
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              [position === 'top' ? 'bottom' : 'top']: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              ...(position === 'top'
                ? { borderTop: '4px solid var(--color-text-primary)' }
                : { borderBottom: '4px solid var(--color-text-primary)' }),
            }}
          />
        </div>
      )}
    </div>
  );
}
