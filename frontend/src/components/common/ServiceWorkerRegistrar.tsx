'use client';

import { useEffect } from 'react';

/**
 * Registers the offline service worker (public/sw.js) after first paint.
 * Silent by design — a failed registration must never break the demo.
 *
 * Production only. In `next dev` bundle URLs are stable but their contents are
 * not, so a cache-first worker serves stale JavaScript against freshly rendered
 * HTML and React raises a hydration error. In development we therefore never
 * register, and we unregister any worker plus drop its caches installed by an
 * earlier run, so already-affected browsers heal on the next reload.
 */
export const ServiceWorkerRegistrar: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch(() => {
          // Cleanup is best-effort.
        });

      if (typeof caches !== 'undefined') {
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .catch(() => {
            // Cleanup is best-effort.
          });
      }
      return;
    }

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Offline caching is an enhancement; ignore failures.
      });
    };

    if (document.readyState === 'complete') {
      register();
      return;
    }

    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
};
