'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, ArrowRight, Sprout, Building2, Truck, RefreshCw } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading, openAuthModal } = useAuth();
  const router = useRouter();

  // If user is loaded and authorized, or fallback demo
  const effectiveRole = user?.role || 'farmer';

  // Super Admin (Mission Director) has full unrestricted access to all terminals
  if (effectiveRole === 'admin' || effectiveRole === 'superadmin') {
    return <>{children}</>;
  }

  // If authorized for this view
  if (allowedRoles.includes(effectiveRole)) {
    return <>{children}</>;
  }

  // If user role is not authorized for this view
  const roleIcons: Record<string, any> = {
    farmer: Sprout,
    buyer: Building2,
    fpo: Truck,
  };
  const targetRoleName = allowedRoles.map((r) => r.toUpperCase()).join(' or ');
  const MyRoleIcon = roleIcons[effectiveRole] || Lock;
  const userName = user?.full_name || 'Tombi Singh';

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '500px',
          width: '100%',
          background: '#FFFFFF',
          border: '1px solid #FECACA',
          borderRadius: '18px',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: '0 20px 40px -15px rgba(220, 38, 38, 0.1)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: '#FEF2F2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            border: '1px solid #FECACA',
          }}
        >
          <ShieldAlert size={28} />
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
          Access Restricted: Role Unauthorized
        </h2>

        <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
          You are signed in as <strong>{userName}</strong> with role{' '}
          <span
            style={{
              background: '#F1F5F9',
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              fontWeight: 700,
              color: '#334155',
            }}
          >
            {effectiveRole.toUpperCase()}
          </span>
          . This section requires <strong>{targetRoleName}</strong> authorization scopes.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            onClick={() => openAuthModal('login')}
            className="tap-target"
            style={{
              padding: '0.75rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: '#F97316',
              color: '#FFFFFF',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <RefreshCw size={16} />
            <span>Switch to Authorized Account</span>
          </button>

          <button
            onClick={() => {
              if (effectiveRole === 'farmer') router.push('/farmer');
              else if (effectiveRole === 'buyer') router.push('/buyer');
              else if (effectiveRole === 'fpo') router.push('/fpo');
              else router.push('/');
            }}
            style={{
              padding: '0.65rem',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#475569',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
          >
            <MyRoleIcon size={15} />
            <span>Go to My Authorized Terminal ({effectiveRole.toUpperCase()})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
