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
  ShieldCheck,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        background: '#FAFAFA',
        borderTop: '1px solid #E4E4E7',
        color: '#52525B',
        fontSize: '0.84rem',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '2.25rem 1.75rem 1.75rem',
        }}
      >
        {/* Main Content Grid - Single Layer */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2.25rem',
            alignItems: 'start',
            paddingBottom: '1.75rem',
            borderBottom: '1px solid #E4E4E7',
          }}
        >
          {/* Identity & Accreditation */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 6px rgba(249, 115, 22, 0.25)',
                }}
              >
                <Sprout size={18} strokeWidth={2.4} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontWeight: 900, fontSize: '1.15rem', color: '#18181B', letterSpacing: '-0.02em' }}>
                  HARVESTLINK
                </span>
                <span style={{ fontWeight: 900, fontSize: '1.15rem', color: '#F97316' }}>
                  AI
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#71717A', lineHeight: 1.6, margin: '0 0 0.85rem' }}>
              Predictive crop intelligence, harvest readiness radar, and direct value chain linkages for Manipur Queen Pineapple growers.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#15803D',
                background: '#F0FDF4',
                border: '1px solid #DCFCE7',
                padding: '0.25rem 0.55rem',
                borderRadius: '6px',
              }}
            >
              <ShieldCheck size={14} />
              <span>Dept. of Horticulture & Soil Conservation, Govt. of Manipur</span>
            </div>
          </div>

          {/* Quick Platform Terminals */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#18181B', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Platform Terminals
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Link
                href="/farmer"
                style={{ color: '#52525B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem' }}
              >
                <Sprout size={14} style={{ color: '#16A34A' }} />
                <span>Farmer Diagnostic & Picking Radar</span>
              </Link>
              <Link
                href="/buyer"
                style={{ color: '#52525B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem' }}
              >
                <Building2 size={14} style={{ color: '#2563EB' }} />
                <span>Wholesale Buyer Marketplace</span>
              </Link>
              <Link
                href="/fpo"
                style={{ color: '#52525B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem' }}
              >
                <Truck size={14} style={{ color: '#EA580C' }} />
                <span>FPO Logistics & Aggregation</span>
              </Link>
              <span style={{ fontSize: '0.74rem', color: '#A1A1AA', marginTop: '0.15rem' }}>
                GI Registered: Manipur Queen Pineapple (#497)
              </span>
            </div>
          </div>

          {/* Contact & Helpdesk */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#18181B', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Contact & Helpdesk
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} style={{ color: '#EA580C', flexShrink: 0 }} />
                <span>
                  <strong>1800-180-1551</strong> <span style={{ color: '#71717A' }}>(Kisan Call Centre, Toll-Free)</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} style={{ color: '#2563EB', flexShrink: 0 }} />
                <a href="mailto:support@harvestlink-ai.in" style={{ color: '#18181B', textDecoration: 'none', fontWeight: 500 }}>
                  support@harvestlink-ai.in
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#71717A', lineHeight: 1.45 }}>
                <MapPin size={14} style={{ color: '#DC2626', marginTop: '0.2rem', flexShrink: 0 }} />
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
            fontSize: '0.76rem',
            color: '#71717A',
          }}
        >
          <div>
            © 2026 <strong>HARVESTLINK AI</strong>. All rights reserved.
          </div>
          <div>
            Thoubal & Imphal Horticulture Clusters • ICAR-NEH & CAU Compliant
          </div>
        </div>
      </div>
    </footer>
  );
};
