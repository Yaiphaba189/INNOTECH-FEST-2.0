'use client';

import React from 'react';
import { FpoLogisticsConsole } from '@/components/fpo/FpoLogisticsConsole';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function FpoPage() {
  return (
    <>
      <main className="app-sheet">
        <RoleGuard allowedRoles={['fpo']}>
          <FpoLogisticsConsole />
        </RoleGuard>
      </main>

    </>
  );
}

