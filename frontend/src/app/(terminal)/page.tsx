'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import FarmerPage from '@/app/(terminal)/farmer/page';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  // Route to specific role terminal if non-farmer
  useEffect(() => {
    if (user?.role === 'buyer') {
      router.replace('/buyer');
    } else if (user?.role === 'fpo') {
      router.replace('/fpo');
    }
  }, [user?.role, router]);

  // Default directly to Farmer Terminal for 0ms initial load
  return <FarmerPage />;
}

