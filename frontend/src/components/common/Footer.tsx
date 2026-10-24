'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sprout,
  Building2,
  Truck,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div>
        {/* Main Content Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
            paddingBottom: '1.75rem',
            borderBottom: '1px solid #E5D2C2',
          }}
        >
          {/* Identity & Accreditation */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: '#FB923C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Sprout size={18} strokeWidth={2.4} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#21170F', letterSpacing: '-0.02em' }}>
                  HARVESTLINK
                </span>
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#FB923C' }}>
                  AI
                </span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#6E5A4A', lineHeight: 1.5, margin: 0 }}>
              Predictive crop intelligence, harvest readiness radar, and direct value chain linkages for Manipur Queen Pineapple growers.
            </p>
          </div>

          {/* Quick Platform Terminals */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', color: '#21170F', marginBottom: '0.75rem' }}>
              Platform Terminals
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Link
                href="/farmer"
                style={{ color: '#4A3A2E', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '13px' }}
              >
                <Sprout size={14} style={{ color: '#F97316' }} />
                <span>Farmer Diagnostic & Picking Radar</span>
              </Link>
              <Link
                href="/buyer"
                style={{ color: '#4A3A2E', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '13px' }}
              >
                <Building2 size={14} style={{ color: '#FB923C' }} />
                <span>Wholesale Buyer Marketplace</span>
              </Link>
              <Link
                href="/fpo"
                style={{ color: '#4A3A2E', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '13px' }}
              >
                <Truck size={14} style={{ color: '#783f0a' }} />
                <span>FPO Logistics & Aggregation</span>
              </Link>
              <span style={{ fontSize: '12px', color: '#6E5A4A', marginTop: '0.15rem' }}>
                GI Registered: Manipur Queen Pineapple (#497)
              </span>
            </div>
          </div>

          {/* Contact & Helpdesk */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', color: '#21170F', marginBottom: '0.75rem' }}>
              Contact & Helpdesk
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} style={{ color: '#783f0a', flexShrink: 0 }} />
                <span>
                  <strong style={{ color: '#21170F' }}>1800-180-1551</strong> <span style={{ color: '#6E5A4A' }}>(Kisan Call Centre, Toll-Free)</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} style={{ color: '#FB923C', flexShrink: 0 }} />
                <a href="mailto:support@harvestlink-ai.in" style={{ color: '#21170F', textDecoration: 'none', fontWeight: 500 }}>
                  support@harvestlink-ai.in
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#6E5A4A', lineHeight: 1.45 }}>
                <MapPin size={14} style={{ color: '#a11920', marginTop: '0.2rem', flexShrink: 0 }} />
                <span>Nilakuthi Food Park, Imphal East, Manipur – 795002</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Footer Base */}
        <div
          style={{
            paddingTop: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            fontSize: '12px',
            color: '#6E5A4A',
          }}
        >
          <div>
            © 2026 <strong>HARVESTLINK AI</strong>. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
