import { OfflineQueuedScan } from '@/types';

const STORAGE_KEY = 'harvestlink_offline_scans';

export async function queueOfflineScan(scan: Partial<OfflineQueuedScan> & { id: string }): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const fullScan: OfflineQueuedScan = {
      id: scan.id,
      timestamp: scan.timestamp || new Date().toISOString(),
      imageBlobUrl: scan.imageBlobUrl || '',
      imageAngle: scan.imageAngle || 'crown',
      compressedSizeKb: scan.compressedSizeKb || 0,
      originalSizeKb: scan.originalSizeKb || 0,
      synced: scan.synced ?? false,
      diagnosis: scan.diagnosis,
    };

    const existing = await getQueuedScans();
    const updated = [fullScan, ...existing.filter((s) => s.id !== scan.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to queue offline scan to localStorage:', err);
  }
}

export async function getQueuedScans(): Promise<OfflineQueuedScan[]> {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OfflineQueuedScan[];
  } catch {
    return [];
  }
}

export async function countOfflineScans(): Promise<number> {
  const scans = await getQueuedScans();
  return scans.filter((s) => !s.synced).length;
}

export async function clearOfflineScans(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
