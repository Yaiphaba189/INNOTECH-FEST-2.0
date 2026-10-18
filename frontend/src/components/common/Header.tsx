'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { UserRole } from '@/types';
import {
  Wifi,
  WifiOff,
  Sprout,
  Building2,
  Truck,
  Server
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
    }}>
      {/* Brand & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
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
        }}>
          <Sprout size={22} color="#FFFFFF" strokeWidth={2.4} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontWeight: 900,
              fontSize: '1.35rem',
              letterSpacing: '-0.02em',
              color: '#18181B',
              lineHeight: 1.15,
            }}>
              HARVESTLINK
            </span>
            <span style={{
              fontWeight: 900,
              fontSize: '1.35rem',
              letterSpacing: '-0.01em',
              color: '#F97316',
              lineHeight: 1.15,
            }}>
              AI
            </span>
            <span className="badge badge-orange" style={{ fontSize: '0.62rem', padding: '0.15rem 0.5rem' }}>
              INNOTECH 2.0
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.1rem' }}>
            Predictive Crop Decision Terminal • Manipur Horticulture
          </p>
        </div>
      </div>

      {/* Role Navigation Segmented Switcher */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        background: '#F4F4F5',
        padding: '0.25rem',
        borderRadius: 'var(--radius-full)',
        gap: '0.25rem',
      }}>
        <button
          onClick={() => onSelectRole('farmer')}
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
          }}
          title="Farmer Terminal: Disease, Harvest, Transparent Returns"
        >
          <Sprout size={15} style={{ marginRight: '0.4rem' }} />
          Farmer
        </button>

        <button
          onClick={() => onSelectRole('buyer')}
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
          }}
          title="Buyer Marketplace: Wholesale Lot Feed & Orders"
        >
          <Building2 size={15} style={{ marginRight: '0.4rem' }} />
          Buyer
        </button>

        <button
          onClick={() => onSelectRole('fpo')}
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
          }}
          title="FPO Logistics: Pooling & QR Gate-Pass"
        >
          <Truck size={15} style={{ marginRight: '0.4rem' }} />
          FPO Logistics
        </button>
      </nav>

      {/* Backend & Connectivity Telemetry Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Live Backend Connection Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          fontSize: '0.75rem',
          color: '#059669',
          fontWeight: 700,
        }}>
          <span className="pulse-dot pulse-dot-green" />
          <Server size={13} />
          <span>API :8001</span>
        </div>

        {/* Network Connectivity Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: isOnline ? '#F4F4F5' : '#FFF7ED',
            border: `1px solid ${isOnline ? '#E4E4E7' : '#FDBA74'}`,
            fontSize: '0.75rem',
            color: isOnline ? '#52525B' : '#EA580C',
            fontWeight: 700,
          }}
          title={isOnline ? 'Connected to live network' : 'Offline Mode'}
        >
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>
    </header>
  );
};
