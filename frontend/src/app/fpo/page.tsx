'use client';

import React from 'react';
import { Header } from '@/components/common/Header';
import { FpoLogisticsConsole } from '@/components/fpo/FpoLogisticsConsole';
import { useRouter } from 'next/navigation';

export default function FpoPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        currentRole="fpo"
        onSelectRole={(role) => {
          if (role === 'farmer') router.push('/farmer');
          else if (role === 'buyer') router.push('/buyer');
          else router.push('/fpo');
        }}
      />

      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        <FpoLogisticsConsole />
      </main>
    </div>
  );
}
