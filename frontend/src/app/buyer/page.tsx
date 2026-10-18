'use client';

import React from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { BuyerMarketplace } from '@/components/buyer/BuyerMarketplace';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useRouter } from 'next/navigation';

export default function BuyerPage() {
  const router = useRouter();

  return (
    <RoleGuard allowedRoles={['buyer']}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
        <Header
          currentRole="buyer"
          onSelectRole={(role) => {
            if (role === 'farmer') router.push('/farmer');
            else if (role === 'fpo') router.push('/fpo');
            else router.push('/buyer');
          }}
        />

        <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '1.75rem 1.25rem' }}>
          <BuyerMarketplace />
        </main>

        <Footer />
      </div>
    </RoleGuard>
  );
}
