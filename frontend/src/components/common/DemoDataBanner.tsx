'use client';

import React, { useEffect, useState } from 'react';
import { DEMO_DATA_EVENT } from '@/lib/api-client';

// Shown whenever a screen falls back to built-in sample data because the server could not be reached.
export const DemoDataBanner: React.FC = () => {
  const [sources, setSources] = useState<string[]>([]);

  useEffect(() => {
    const onDemo = (e: Event) => {
      const source = String((e as CustomEvent).detail);
      setSources((prev) => (prev.includes(source) ? prev : [...prev, source]));
    };
    window.addEventListener(DEMO_DATA_EVENT, onDemo);
    return () => window.removeEventListener(DEMO_DATA_EVENT, onDemo);
  }, []);

  if (sources.length === 0) return null;
  return (
    <div
      role="status"
      style={{
        padding: '0.4rem 1rem',
        background: '#FFF7ED',
        borderBottom: '1px solid #FED7AA',
        color: '#9A3412',
        fontSize: '0.72rem',
        fontWeight: 600,
        textAlign: 'center',
      }}
    >
      Server unreachable — showing sample data, not live figures: {sources.join(', ')}.
    </div>
  );
};
