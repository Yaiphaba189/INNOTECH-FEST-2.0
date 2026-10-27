'use client';

import React from 'react';
import { BuyerMarketplace } from '@/components/buyer/BuyerMarketplace';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function BuyerPage() {
  return (
    <>
      <main className="app-sheet">
        <RoleGuard allowedRoles={['buyer']}>
          <BuyerMarketplace />
        </RoleGuard>
      </main>

    </>
  );
}

