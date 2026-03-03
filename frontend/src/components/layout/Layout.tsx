import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Header />
      <main
        style={{
          paddingTop: 'var(--header-height)',
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
    </div>
  );
}
