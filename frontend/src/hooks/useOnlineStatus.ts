'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks browser connectivity. Defaults to online so server-rendered markup
 * matches the first client render, then corrects itself on mount.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return isOnline;
}
