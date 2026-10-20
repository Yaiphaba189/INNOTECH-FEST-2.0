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
  Sparkles,
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
    switchDemoRole,
    openAuthModal,
    closeAuthModal,
    isAuthModalOpen,
    authModalTab,
  } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const handleRoleTabClick = async (targetRole: UserRole) => {
    if (user?.role !== targetRole && !isSuperAdmin) {
      try {
        await switchDemoRole(targetRole);
      } catch (err) {
        console.warn('Auto role switch fallback:', err);
      }
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
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.65rem 1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
        }}
      >
        {/* Brand & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0,
              boxShadow: '0 3px 10px rgba(249, 115, 22, 0.25)',
            }}
          >
            <Sprout size={19} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  letterSpacing: '-0.025em',
                  color: '#0F172A',
                  lineHeight: 1.1,
                }}
              >
                HARVESTLINK
              </span>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  letterSpacing: '-0.01em',
                  color: '#F97316',
                  lineHeight: 1.1,
                }}
              >
                AI
              </span>
              <span
                className="badge badge-orange"
                style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem', fontWeight: 800 }}
              >
                2.0
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>
              Manipur Horticulture Decision Terminal
            </p>
          </div>
        </div>

        {/* Role Navigation Segmented Switcher */}
        <nav className="nav-segmented">
          {/* Super Admin Indicator Chip */}
          {isSuperAdmin && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: '#EEF2FF',
                color: '#4F46E5',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={13} strokeWidth={2.5} />
              <span>SUPER ADMIN</span>
            </div>
          )}

          {/* Farmer Tab */}
          <button
            onClick={() => handleRoleTabClick('farmer')}
            className={`nav-segmented-item ${currentRole === 'farmer' ? 'active' : ''}`}
            title="Farmer Terminal"
          >
            <Sprout size={14} />
            <span>Farmer</span>
          </button>

          {/* Buyer Tab */}
          <button
            onClick={() => handleRoleTabClick('buyer')}
            className={`nav-segmented-item ${currentRole === 'buyer' ? 'active' : ''}`}
            title="Buyer Marketplace"
          >
            <Building2 size={14} />
            <span>Buyer</span>
          </button>

          {/* FPO Logistics Tab */}
          <button
            onClick={() => handleRoleTabClick('fpo')}
            className={`nav-segmented-item ${currentRole === 'fpo' ? 'active' : ''}`}
            title="FPO Logistics"
          >
            <Truck size={14} />
            <span>FPO Logistics</span>
          </button>
        </nav>

        {/* Right Side: Auth User Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* User Account Chip with Dropdown */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            {isAuthenticated && user ? (
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.3rem 0.6rem 0.3rem 0.35rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                }}
              >
                {/* Initials Circle */}
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getInitials(user.full_name)}
                </div>

                <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                    {user.full_name.length > 14 ? `${user.full_name.slice(0, 14)}...` : user.full_name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: roleMeta.color, fontWeight: 700 }}>
                    {roleMeta.label}
                  </div>
                </div>

                <ChevronDown size={13} style={{ color: '#94A3B8', transform: isUserMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="tap-target btn-primary"
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  minHeight: '34px',
                  gap: '0.4rem',
                }}
              >
                <User size={14} />
                <span>Sign In</span>
              </button>
            )}

            {/* User Dropdown Menu */}
            {isUserMenuOpen && user && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: '230px',
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.12)',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.5rem',
                  zIndex: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                {/* Profile Summary */}
                <div style={{ padding: '0.45rem 0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>
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
                      fontSize: '0.66rem',
                      fontWeight: 800,
                    }}
                  >
                    <RoleIcon size={11} />
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
                    gap: '0.45rem',
                    padding: '0.45rem 0.55rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#DC2626',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={13} />
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

