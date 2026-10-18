import { getQueuedScans, clearOfflineScans } from './offline-db';

export async function countPendingScans(): Promise<number> {
  const scans = await getQueuedScans();
  return scans.filter((s) => !s.synced).length;
}

export async function drainOfflineQueue(): Promise<void> {
  const scans = await getQueuedScans();
  const unsynced = scans.filter((s) => !s.synced);

  if (unsynced.length === 0) return;

  // Simulate network synchronization of pending scans
  await new Promise((resolve) => setTimeout(resolve, 600));

  await clearOfflineScans();
}
