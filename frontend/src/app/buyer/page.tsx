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
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      <Header
        currentRole="buyer"
        onSelectRole={(role) => {
          if (role === 'farmer') router.push('/farmer');
          else if (role === 'fpo') router.push('/fpo');
          else router.push('/buyer');
        }}
      />

      <main className="app-sheet">
        <RoleGuard allowedRoles={['buyer']}>
          <BuyerMarketplace />
        </RoleGuard>
      </main>

      <Footer />
    </div>
  );
}

