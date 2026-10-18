'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthPortal } from '@/components/auth/AuthPortal';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Forward authenticated users directly to their authorized role terminal
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role) {
      if (user.role === 'buyer') {
        router.replace('/buyer');
      } else if (user.role === 'fpo') {
        router.replace('/fpo');
      } else {
        // farmer, admin, superadmin default to farmer terminal
        router.replace('/farmer');
      }
    }
  }, [isLoading, isAuthenticated, user?.role, router]);

  // Loading state while verifying credentials from localStorage / API
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8FAFC',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '3px solid #FED7AA',
            borderTopColor: '#F97316',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>
          Authenticating HarvestLink AI Session...
        </p>
      </div>
    );
  }

  // ROOT PATH GATE: If not authenticated, require Login or Sign Up
  if (!isAuthenticated || !user) {
    return <AuthPortal />;
  }

  // If authenticated, forward to role terminal
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8FAFC',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '3px solid #FED7AA',
          borderTopColor: '#F97316',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>
        Loading {user.role.toUpperCase()} Terminal...
      </p>
    </div>
  );
}
