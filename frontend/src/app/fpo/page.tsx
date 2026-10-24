'use client';

import React from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { FpoLogisticsConsole } from '@/components/fpo/FpoLogisticsConsole';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useRouter } from 'next/navigation';

export default function FpoPage() {
  const router = useRouter();

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      <Header
        currentRole="fpo"
        onSelectRole={(role) => {
          if (role === 'farmer') router.push('/farmer');
          else if (role === 'buyer') router.push('/buyer');
          else router.push('/fpo');
        }}
      />

      <main className="app-sheet">
        <RoleGuard allowedRoles={['fpo']}>
          <FpoLogisticsConsole />
        </RoleGuard>
      </main>

      <Footer />
    </div>
  );
}

