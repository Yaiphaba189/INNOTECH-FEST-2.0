'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import { UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  Sprout,
  Building2,
  Truck,
  User,
  ChevronDown,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
}) => {
  const { t } = useTranslation();
  const {
    user,
    isAuthenticated,
    logout,
    openAuthModal,
    closeAuthModal,
    isAuthModalOpen,
    authModalTab,
  } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const handleRoleTabClick = (targetRole: UserRole) => {
    if (user && user.role !== targetRole && !isSuperAdmin) {
      // User is logged in with another role: prompt switch account
      openAuthModal('login');
      return;
    }
    onSelectRole(targetRole);
  };

  // Close user dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'admin':
      case 'superadmin':
        return { label: 'Super Admin', bg: '#EEF2FF', color: '#4F46E5', border: '#C7D2FE', icon: ShieldCheck };
      case 'farmer':
        return { label: 'Farmer', bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', icon: Sprout };
      case 'buyer':
        return { label: 'Buyer', bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE', icon: Building2 };
      case 'fpo':
        return { label: 'FPO Lead', bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA', icon: Truck };
      default:
        return { label: 'User', bg: '#F4F4F5', color: '#52525B', border: '#E4E4E7', icon: User };
    }
  };

  const roleMeta = getRoleBadge(user?.role);
  const RoleIcon = roleMeta.icon;

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.85rem 1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Brand & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '1.35rem',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
            }}
          >
            <Sprout size={22} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: '1.35rem',
                  letterSpacing: '-0.02em',
                  color: '#18181B',
                  lineHeight: 1.15,
                }}
              >
                HARVESTLINK
              </span>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: '1.35rem',
                  letterSpacing: '-0.01em',
                  color: '#F97316',
                  lineHeight: 1.15,
                }}
              >
                AI
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.1rem' }}>
              Predictive Crop Decision Terminal • Manipur Horticulture
            </p>
          </div>
        </div>

        {/* Role Navigation Segmented Switcher - Hides non-role tabs unless Super Admin */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#F4F4F5',
            padding: '0.25rem',
            borderRadius: 'var(--radius-full)',
            gap: '0.35rem',
          }}
        >
          {/* Super Admin Indicator Chip */}
          {isSuperAdmin && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: '#EEF2FF',
                border: '1px solid #C7D2FE',
                color: '#4F46E5',
                fontSize: '0.74rem',
                fontWeight: 800,
                marginRight: '0.2rem',
              }}
            >
              <ShieldCheck size={14} strokeWidth={2.5} />
              <span>SUPER ADMIN • ALL ACCESS</span>
            </div>
          )}

          {/* Farmer Tab: Only rendered if Super Admin, Farmer, or unauthenticated */}
          {(isSuperAdmin || user?.role === 'farmer' || !user) && (
            <button
              onClick={() => handleRoleTabClick('farmer')}
              className="tap-target"
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.84rem',
                borderRadius: 'var(--radius-full)',
                background: currentRole === 'farmer' ? '#F97316' : 'transparent',
                color: currentRole === 'farmer' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: currentRole === 'farmer' ? 700 : 500,
                boxShadow: currentRole === 'farmer' ? '0 2px 8px rgba(249, 115, 22, 0.35)' : 'none',
                border: 'none',
                minHeight: '38px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              title="Farmer Terminal: Disease, Harvest, Transparent Returns"
            >
              <Sprout size={15} style={{ marginRight: '0.4rem' }} />
              <span>Farmer</span>
            </button>
          )}

          {/* Buyer Tab: Only rendered if Super Admin, Buyer, or unauthenticated */}
          {(isSuperAdmin || user?.role === 'buyer' || !user) && (
            <button
              onClick={() => handleRoleTabClick('buyer')}
              className="tap-target"
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.84rem',
                borderRadius: 'var(--radius-full)',
                background: currentRole === 'buyer' ? '#F97316' : 'transparent',
                color: currentRole === 'buyer' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: currentRole === 'buyer' ? 700 : 500,
                boxShadow: currentRole === 'buyer' ? '0 2px 8px rgba(249, 115, 22, 0.35)' : 'none',
                border: 'none',
                minHeight: '38px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              title="Buyer Marketplace: Wholesale Lot Feed & Orders"
            >
              <Building2 size={15} style={{ marginRight: '0.4rem' }} />
              <span>Buyer</span>
            </button>
          )}

          {/* FPO Logistics Tab: Only rendered if Super Admin, FPO, or unauthenticated */}
          {(isSuperAdmin || user?.role === 'fpo' || !user) && (
            <button
              onClick={() => handleRoleTabClick('fpo')}
              className="tap-target"
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.84rem',
                borderRadius: 'var(--radius-full)',
                background: currentRole === 'fpo' ? '#F97316' : 'transparent',
                color: currentRole === 'fpo' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: currentRole === 'fpo' ? 700 : 500,
                boxShadow: currentRole === 'fpo' ? '0 2px 8px rgba(249, 115, 22, 0.35)' : 'none',
                border: 'none',
                minHeight: '38px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              title="FPO Logistics: Pooling & QR Gate-Pass"
            >
              <Truck size={15} style={{ marginRight: '0.4rem' }} />
              <span>FPO Logistics</span>
            </button>
          )}
        </nav>

        {/* Right Side: Auth User Badge & Telemetry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* User Account Chip with Dropdown */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            {isAuthenticated && user ? (
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.35rem 0.65rem 0.35rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#FAFAF9',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Initials Circle */}
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getInitials(user.full_name)}
                </div>

                <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#18181B' }}>
                    {user.full_name.length > 15 ? `${user.full_name.slice(0, 15)}...` : user.full_name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: roleMeta.color, fontWeight: 700 }}>
                    {roleMeta.label}
                  </div>
                </div>

                <ChevronDown size={14} style={{ color: '#94A3B8', transform: isUserMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="tap-target"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#F97316',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
                }}
              >
                <User size={15} />
                <span>Sign In / Register</span>
              </button>
            )}

            {/* User Dropdown Menu */}
            {isUserMenuOpen && user && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '240px',
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #E2E8F0',
                  padding: '0.65rem',
                  zIndex: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                {/* Profile Summary */}
                <div style={{ padding: '0.45rem 0.55rem', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                    {user.full_name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    {user.phone_number}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginTop: '0.35rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: roleMeta.bg,
                      color: roleMeta.color,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                    }}
                  >
                    <RoleIcon size={12} />
                    <span>{roleMeta.label.toUpperCase()}</span>
                  </div>
                </div>

                {/* Sign Out */}
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#DC2626',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialTab={authModalTab}
      />
    </>
  );
};
