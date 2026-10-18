'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-app)',
      color: 'var(--text-secondary)',
      fontSize: '0.9rem',
      fontFamily: 'var(--font-sans)',
    }}>
      Loading HarvestLink AI Terminal...
    </div>
  );
}
