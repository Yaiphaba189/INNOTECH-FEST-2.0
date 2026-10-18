'use client';

import React, { useState } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { DiseaseScreeningStudio } from '@/components/disease/DiseaseScreeningStudio';
import { HarvestReadinessRadar } from '@/components/harvest/HarvestReadinessRadar';
import { MarketLinkageModule } from '@/components/market/MarketLinkageModule';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useRouter } from 'next/navigation';
import { Camera, CalendarDays, CircleDollarSign, CloudRain, MapPin, ShieldCheck, Cpu, ArrowRight, User } from 'lucide-react';

export default function FarmerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'module-a' | 'module-b' | 'module-c'>('module-a');

  return (
    <RoleGuard allowedRoles={['farmer']}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
        <Header
          currentRole="farmer"
          onSelectRole={(role) => {
            if (role === 'buyer') router.push('/buyer');
            else if (role === 'fpo') router.push('/fpo');
            else router.push('/farmer');
          }}
        />

      <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '1.75rem 1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Farm Profile Header */}
          <div className="glass-card" style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-subtle)',
            padding: '1.35rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.15rem',
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: '#FFF7ED',
                  border: '1px solid #FDBA74',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.65rem',
                  flexShrink: 0,
                }}>
                  <User size={24} style={{ color: '#EA580C' }} strokeWidth={2.2} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                      Tombi Singh
                    </h1>
                    <span className="badge badge-green">
                      <ShieldCheck size={12} />
                      Verified Smallholder
                    </span>
                    <span className="badge badge-orange">
                      LOT #PL-048
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    marginTop: '0.2rem'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={14} style={{ color: '#F97316' }} />
                      <strong>Andro Terraces, Thoubal Cluster</strong> (24.7344° N, 93.9424° E)
                    </span>
                    <span style={{ color: 'var(--border-medium)' }}>•</span>
                    <span>Elevation 914m</span>
                    <span style={{ color: 'var(--border-medium)' }}>•</span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>GI Certified Queen Pineapple</span>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: '#F4F4F5',
                border: '1px solid #E4E4E7',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
              }}>
                <Cpu size={13} style={{ color: '#F97316' }} />
                <span>MobileNetV3 CPU &lt; 800ms</span>
              </div>
            </div>

            {/* Telemetry Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
            }}>
              <div style={{
                background: '#FAFAF9',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Plot Stand Size
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                  1.2 Hectare
                </div>
                <div style={{ fontSize: '0.75rem', color: '#EA580C', marginTop: '0.1rem' }}>
                  18,500 Queen Pineapples
                </div>
              </div>

              <div style={{
                background: '#FAFAF9',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Refractometer Sugar
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', marginTop: '0.15rem' }}>
                  14.8° Brix
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                  Grade A Export Ready
                </div>
              </div>

              <div style={{
                background: '#FAFAF9',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Thermal Heat Units
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EA580C', marginTop: '0.15rem' }}>
                  2,478 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 2,500 GDD</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.1rem' }}>
                  99.1% Maturity Peak
                </div>
              </div>

              <div style={{
                background: '#FAFAF9',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Guaranteed Net Return
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F97316', marginTop: '0.15rem' }}>
                  ₹24.38 <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ kg Net</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.1rem' }}>
                  +₹2.65/kg vs Broker Cash
                </div>
              </div>
            </div>

            {/* Downpour Alert */}
            <div style={{
              background: '#FFF7ED',
              border: '1px solid #FDBA74',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: '#FFEDD5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EA580C',
                  flexShrink: 0,
                }}>
                  <CloudRain size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#9A3412' }}>
                    Weather Alert: 65.0mm Downpour Forecast in 48 Hours
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#C2410C', marginTop: '0.1rem' }}>
                    Rainfall will dilute pineapple sucrose by -2.1° Brix. Accelerate harvest window before Wednesday.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('module-b')}
                className="tap-target"
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem',
                  background: '#EA580C',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  minHeight: '34px',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  View Harvest Window <ArrowRight size={13} />
                </span>
              </button>
            </div>
          </div>

          {/* Module Selector Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <button
              onClick={() => setActiveTab('module-a')}
              className="tap-target"
              style={{
                background: activeTab === 'module-a' ? '#F97316' : '#FFFFFF',
                color: activeTab === 'module-a' ? '#FFFFFF' : 'var(--text-secondary)',
                border: activeTab === 'module-a' ? '1px solid #F97316' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                fontSize: '0.92rem',
                boxShadow: activeTab === 'module-a' ? '0 4px 14px rgba(249, 115, 22, 0.3)' : 'var(--shadow-subtle)',
              }}
            >
              <Camera size={18} />
              <span>Module A: Disease Scan</span>
            </button>

            <button
              onClick={() => setActiveTab('module-b')}
              className="tap-target"
              style={{
                background: activeTab === 'module-b' ? '#F97316' : '#FFFFFF',
                color: activeTab === 'module-b' ? '#FFFFFF' : 'var(--text-secondary)',
                border: activeTab === 'module-b' ? '1px solid #F97316' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                fontSize: '0.92rem',
                boxShadow: activeTab === 'module-b' ? '0 4px 14px rgba(249, 115, 22, 0.3)' : 'var(--shadow-subtle)',
              }}
            >
              <CalendarDays size={18} />
              <span>Module B: Harvest Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('module-c')}
              className="tap-target"
              style={{
                background: activeTab === 'module-c' ? '#F97316' : '#FFFFFF',
                color: activeTab === 'module-c' ? '#FFFFFF' : 'var(--text-secondary)',
                border: activeTab === 'module-c' ? '1px solid #F97316' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                fontSize: '0.92rem',
                boxShadow: activeTab === 'module-c' ? '0 4px 14px rgba(249, 115, 22, 0.3)' : 'var(--shadow-subtle)',
              }}
            >
              <CircleDollarSign size={18} />
              <span>Module C: Transparent Market</span>
            </button>
          </div>

          {activeTab === 'module-a' && <DiseaseScreeningStudio />}
          {activeTab === 'module-b' && <HarvestReadinessRadar onRegisterLot={() => setActiveTab('module-c')} />}
          {activeTab === 'module-c' && <MarketLinkageModule />}
        </div>
      </main>

      <Footer />
    </div>
  </RoleGuard>
);
}
