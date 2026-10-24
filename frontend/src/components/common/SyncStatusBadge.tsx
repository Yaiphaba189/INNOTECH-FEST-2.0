'use client';

import React from 'react';
import { CheckCircle2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';

/**
 * Non-blocking connectivity + offline-queue indicator (Part 3, Sec 4.3 & 11.1).
 * Renders the "Saved Locally → Syncing… → Confirmed" lifecycle at a glance.
 */
export const SyncStatusBadge: React.FC = () => {
  const { isOnline, pendingCount, state, syncNow } = useOfflineSync();

  if (!isOnline) {
    return (
      <button
        type="button"
        onClick={() => void syncNow()}
        className="tap-target"
        title="Offline: scans are queued locally and will sync automatically"
        style={{
          gap: '0.35rem',
          padding: '0.35rem 0.65rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--alert-amber)',
          background: 'var(--alert-amber-bg)',
          border: '1px solid rgba(217, 119, 6, 0.35)',
        }}
      >
        <WifiOff size={14} />
        <span>OFFLINE{pendingCount > 0 ? ` • ${pendingCount} QUEUED` : ''}</span>
      </button>
    );
  }

  if (state === 'syncing') {
    return (
      <div
        title="Transmitting queued captures"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.35rem 0.65rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--pineapple-gold)',
          background: 'var(--pineapple-gold-bg)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        <RefreshCw size={14} className="animate-pulse-glow" />
        <span>SYNCING…</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        type="button"
        onClick={() => void syncNow()}
        className="tap-target"
        title="Tap to sync queued captures now"
        style={{
          gap: '0.35rem',
          padding: '0.35rem 0.65rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--pineapple-gold)',
          background: 'var(--pineapple-gold-bg)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        <Wifi size={14} />
        <span>SAVED LOCALLY • {pendingCount}</span>
      </button>
    );
  }

  return (
    <div
      title="Connected and all captures synced"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.35rem 0.65rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--plantation-green)',
        background: 'var(--plantation-green-bg)',
        border: '1px solid rgba(251, 146, 60, 0.3)',
      }}
    >
      <CheckCircle2 size={14} />
      <span>CONFIRMED</span>
    </div>
  );
};
