'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { countPendingScans, drainOfflineQueue } from '@/lib/sync-engine';

export type SyncState = 'idle' | 'offline' | 'syncing' | 'queued' | 'confirmed';

export interface OfflineSync {
  isOnline: boolean;
  pendingCount: number;
  state: SyncState;
  refresh: () => Promise<void>;
  syncNow: () => Promise<void>;
}

/**
 * Drives the offline-first lifecycle: counts queued scans, drains them when
 * the network returns, and exposes a label the UI can render as
 * "Saved Locally" / "Syncing…" / "Confirmed".
 */
export function useOfflineSync(): OfflineSync {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [state, setState] = useState<SyncState>('idle');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const count = await countPendingScans();
    if (!mounted.current) return;
    setPendingCount(count);
    setState(count > 0 ? 'queued' : 'confirmed');
  }, []);

  const syncNow = useCallback(async () => {
    const count = await countPendingScans();
    if (count === 0) {
      if (mounted.current) setState('confirmed');
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (mounted.current) {
        setPendingCount(count);
        setState('offline');
      }
      return;
    }

    if (mounted.current) setState('syncing');
    await drainOfflineQueue();
    if (!mounted.current) return;
    setPendingCount(0);
    setState('confirmed');
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isOnline) {
      setState('offline');
      return;
    }
    void syncNow();
  }, [isOnline, syncNow]);

  return { isOnline, pendingCount, state, refresh, syncNow };
}
