import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/context/AuthContext';
import { ServiceWorkerRegistrar } from '@/components/common/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  title: 'HARVESTLINK AI — Predictive Crop Intelligence for Manipur',
  description: 'Integrated agricultural decision-support terminal for Queen & Kew pineapple clusters in Manipur. Built for INNOTECH FEST 2.0.',
  manifest: '/manifest.json',
  applicationName: 'HARVESTLINK AI',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HARVESTLINK',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  keywords: [
    'HARVESTLINK AI',
    'INNOTECH FEST 2.0',
    'Manipur agriculture',
    'Queen pineapple',
    'Phytophthora Heart Rot',
    'Growing Degree Days',
    'Transparent Market Linkage',
    'FPO Collective Logistics'
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F8FAFC',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;600;700&family=Noto+Sans+Meetei+Mayek:wght@400;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {process.env.NODE_ENV !== 'production' && (
          <script
            dangerouslySetInnerHTML={{
              // Runs from freshly fetched HTML (navigations are network-first), so it
              // can recover clients whose JavaScript is still being served stale by an
              // earlier cache-first service worker.
              __html:
                "if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister()})})}" +
                "if(window.caches){caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k)})})}",
            }}
          />
        )}
      </head>
      <body>
        <I18nProvider>
          <AuthProvider>
            <ServiceWorkerRegistrar />
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
