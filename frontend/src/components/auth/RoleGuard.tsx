'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, Sprout, Building2, Truck, RefreshCw } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  const effectiveRole = user?.role || 'farmer';

  // Session still being restored from storage after a refresh
  if (isLoading) return null;

  // Logged out: ask for sign-in (quick demo login lives in the auth modal) instead of auto-logging in
  if (!user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ maxWidth: '420px', width: '100%', background: '#FFFFFF', border: '1px solid #F1E4D8', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
          <Lock size={24} style={{ margin: '0 auto 1rem', color: '#21170F' }} />
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#21170F', marginBottom: '0.5rem' }}>Sign in required</h1>
          <p style={{ fontSize: '13px', color: '#6E5A4A', marginBottom: '1.25rem' }}>Please sign in to open this terminal.</p>
          <button
            onClick={() => router.push('/login')}
            className="tap-target"
            style={{ padding: '0.75rem 1.5rem', fontSize: '13px', fontWeight: 600, background: '#21170F', color: '#FFFFFF', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Super Admin (Mission Director) has full unrestricted access to all terminals
  if (effectiveRole === 'admin' || effectiveRole === 'superadmin') {
    return <>{children}</>;
  }

  // Only the roles listed for this terminal may enter (admins handled above)
  if (allowedRoles.includes(effectiveRole)) {
    return <>{children}</>;
  }

  // If an authenticated user's role is not authorized for this view
  const roleIcons: Record<string, any> = {
    farmer: Sprout,
    buyer: Building2,
    fpo: Truck,
  };
  const targetRoleName = allowedRoles.map((r) => r.toUpperCase()).join(' or ');
  const MyRoleIcon = roleIcons[effectiveRole] || Lock;
  const userName = user?.full_name || 'User';

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          background: '#FFFFFF',
          border: '1px solid #F1E4D8',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '6px',
            background: '#fdf3f2',
            color: '#a11920',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            border: '1px solid #f2cfce',
          }}
        >
          <ShieldAlert size={24} />
        </div>

        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#21170F', marginBottom: '0.5rem' }}>
          Access Restricted: Role Unauthorized
        </h1>

        <p style={{ fontSize: '13px', color: '#6E5A4A', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          You are signed in as <strong>{userName}</strong> with role{' '}
          <span
            style={{
              background: '#FFF8F1',
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              fontWeight: 600,
              color: '#21170F',
            }}
          >
            {effectiveRole.toUpperCase()}
          </span>
          . This section requires <strong>{targetRoleName}</strong> authorization scopes.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            onClick={() => router.push('/login')}
            className="tap-target"
            style={{
              padding: '0.75rem',
              fontSize: '13px',
              fontWeight: 600,
              background: '#21170F',
              color: '#FFFFFF',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <RefreshCw size={15} />
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
              fontSize: '13px',
              fontWeight: 600,
              color: '#21170F',
              background: '#FFFFFF',
              border: '1px solid #E5D2C2',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
          >
            <MyRoleIcon size={14} />
            <span>Go to My Terminal ({effectiveRole.toUpperCase()})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

