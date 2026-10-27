'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { UserRole } from '@/types';

// Header and footer live here so they persist across Farmer/Buyer/FPO navigation instead of remounting.
export default function TerminalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentRole: UserRole = pathname.startsWith('/buyer') ? 'buyer' : pathname.startsWith('/fpo') ? 'fpo' : 'farmer';

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      <Header currentRole={currentRole} onSelectRole={(role) => router.push(`/${role}`)} />
      {children}
      <Footer />
    </div>
  );
}
