'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { UserRole } from '@/types';
import {
  Wifi,
  WifiOff,
  Sprout,
  Building2,
  Truck
} from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
}) => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(true);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--bg-surface)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.75rem 1.25rem',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      boxShadow: 'var(--shadow-subtle)',
    }}>
      {/* Brand & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(217, 119, 6, 0.35)',
          fontWeight: 800,
          fontSize: '1.35rem',
          flexShrink: 0,
        }}>
          🍍
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
              fontWeight: 900,
              fontSize: '1.45rem',
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              display: 'inline-block',
            }}>
              HARVESTLINK
            </span>
            <span style={{
              fontWeight: 900,
              fontSize: '1.45rem',
              letterSpacing: '-0.02em',
              color: 'var(--pineapple-gold)',
              lineHeight: 1.2,
              display: 'inline-block',
              marginLeft: '0.4rem',
            }}>
              AI
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '420px', marginTop: '0.15rem' }}>
            {t('tagline')}
          </p>
        </div>
      </div>

      {/* Role Navigation Switcher */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-surface-elevated)',
        padding: '0.25rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        gap: '0.25rem',
      }}>
        <button
          onClick={() => onSelectRole('farmer')}
          className={`tap-target ${currentRole === 'farmer' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
          title="Farmer Terminal: Disease, Harvest, Transparent Returns"
        >
          <Sprout size={16} style={{ marginRight: '0.4rem' }} />
          {t('roleFarmer')}
        </button>

        <button
          onClick={() => onSelectRole('buyer')}
          className={`tap-target ${currentRole === 'buyer' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
          title="Buyer Marketplace: Wholesale Lot Feed & Orders"
        >
          <Building2 size={16} style={{ marginRight: '0.4rem' }} />
          {t('roleBuyer')}
        </button>

        <button
          onClick={() => onSelectRole('fpo')}
          className={`tap-target ${currentRole === 'fpo' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
          title="FPO Logistics: Pooling & QR Gate-Pass"
        >
          <Truck size={16} style={{ marginRight: '0.4rem' }} />
          {t('roleFpo')}
        </button>
      </nav>

      {/* Utility Controls: Online Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Network Connectivity Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            background: isOnline ? 'var(--plantation-green-bg)' : 'var(--alert-amber-bg)',
            border: `1px solid ${isOnline ? 'rgba(5, 150, 105, 0.3)' : 'rgba(217, 119, 6, 0.3)'}`,
            fontSize: '0.75rem',
            color: isOnline ? 'var(--plantation-green)' : 'var(--alert-amber)',
            fontWeight: 600,
          }}
          title={isOnline ? 'Connected to live network' : 'Offline Mode: Scans & actions queued in local Dexie IndexedDB'}
        >
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>
    </header>
  );
};
