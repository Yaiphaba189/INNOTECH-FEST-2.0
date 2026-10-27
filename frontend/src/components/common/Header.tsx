'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    logout,
    closeAuthModal,
    isAuthModalOpen,
    authModalTab,
  } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const handleRoleTabClick = async (targetRole: UserRole) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== targetRole && !isSuperAdmin) return;
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
        return { label: 'Admin', bg: '#FFF5ED', color: '#21170F', border: '#E5D2C2', icon: ShieldCheck };
      case 'farmer':
        return { label: 'Farmer', bg: 'var(--accent-green-light)', color: '#F97316', border: 'var(--accent-green-border)', icon: Sprout };
      case 'buyer':
        return { label: 'Buyer', bg: '#fff7ed', color: '#F97316', border: '#fed7aa', icon: Building2 };
      case 'fpo':
        return { label: 'FPO Lead', bg: '#fbf4ea', color: '#783f0a', border: '#fed7aa', icon: Truck };
      default:
        return { label: 'Member', bg: '#FFF5ED', color: '#6E5A4A', border: '#F1E4D8', icon: User };
    }
  };

  const roleMeta = getRoleBadge(user?.role);
  const RoleIcon = roleMeta.icon;

  return (
    <>
      <header className="hl-topbar">
        {/* Brand & Subtitle */}
        <div className="hl-brand">
          <div className="hl-logo">
            <Sprout size={18} color="#ffffff" strokeWidth={2.4} />
          </div>
          <div className="hl-brand-copy">
            <strong>
              HARVESTLINK <em>AI</em>
            </strong>
            <small>Manipur Horticulture Decision Terminal</small>
          </div>
        </div>

        {/* Role Navigation Segmented Switcher */}
        <nav className="hl-role-nav" aria-label="Role Switcher">
          {isSuperAdmin && (
            <div className="hl-admin-chip"
            >
              <ShieldCheck size={13} strokeWidth={2.2} />
              <span>Admin</span>
            </div>
          )}

          {(!user || isSuperAdmin || user.role === 'farmer') && (
            <button
              type="button"
              onClick={() => handleRoleTabClick('farmer')}
              className={`hl-role-link ${currentRole === 'farmer' ? 'is-active' : ''}`}
              title="Farmer Terminal"
            >
              <Sprout size={15} />
              <span>Farmer</span>
            </button>
          )}

          {(!user || isSuperAdmin || user.role === 'buyer') && (
            <button
              type="button"
              onClick={() => handleRoleTabClick('buyer')}
              className={`hl-role-link ${currentRole === 'buyer' ? 'is-active' : ''}`}
              title="Buyer Marketplace"
            >
              <Building2 size={15} />
              <span>Buyer</span>
            </button>
          )}

          {(!user || isSuperAdmin || user.role === 'fpo') && (
            <button
              type="button"
              onClick={() => handleRoleTabClick('fpo')}
              className={`hl-role-link ${currentRole === 'fpo' ? 'is-active' : ''}`}
              title="FPO Collective Logistics"
            >
              <Truck size={15} />
              <span>FPO Logistics</span>
            </button>
          )}
        </nav>

        {/* Right Side: Auth User Badge */}
        <div className="hl-account" ref={menuRef}>
          {isAuthenticated && user ? (
            <button
              type="button"
              className="hl-account-trigger"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-expanded={isUserMenuOpen}
            >
              <div className="hl-avatar">
                {getInitials(user.full_name)}
              </div>

              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div className="hl-account-name">
                  {user.full_name}
                </div>
                <div style={{ fontSize: '12px', color: roleMeta.color, fontWeight: 600 }}>
                  {roleMeta.label}
                </div>
              </div>

              <ChevronDown
                size={14}
                style={{
                  color: '#6E5A4A',
                  transform: isUserMenuOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s ease',
                }}
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="hl-signin"
            >
              <User size={15} />
              <span>Sign In</span>
            </button>
          )}

          {/* User Dropdown Menu */}
          {isUserMenuOpen && user && (
            <div className="hl-account-menu">
              <div className="hl-account-details">
                <strong>{user.full_name}</strong>
                <span>{user.phone_number}</span>
                <small>
                  <RoleIcon size={12} />
                  <span>{roleMeta.label}</span>
                </small>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                  router.push('/login');
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
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

