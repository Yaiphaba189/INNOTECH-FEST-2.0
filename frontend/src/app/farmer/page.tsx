'use client';

import React, { useState } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { DiseaseScreeningStudio } from '@/components/disease/DiseaseScreeningStudio';
import { HarvestReadinessRadar } from '@/components/harvest/HarvestReadinessRadar';
import { MarketLinkageModule } from '@/components/market/MarketLinkageModule';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/context/AuthContext';
import { FarmerProvider, useFarmer } from '@/context/FarmerContext';
import { BROKER_NET_PER_KG, round2 } from '@/lib/decision';
import { useRouter } from 'next/navigation';
import {
  Camera,
  CalendarDays,
  CircleDollarSign,
  CloudRain,
  MapPin,
  ShieldCheck,
  ArrowRight,
  User,
  Sparkles,
} from 'lucide-react';

export default function FarmerPage() {
  return (
    <FarmerProvider>
      <FarmerHub />
    </FarmerProvider>
  );
}

function FarmerHub() {
  const router = useRouter();
  const { user } = useAuth();
  const { lot, decision, bestView, rain } = useFarmer();
  // Admin/demo-role sessions can open this page; show the seeded farmer persona, not the admin's name.
  const farmerName = user?.role === 'farmer' && user.full_name ? user.full_name : 'Tombi Singh';
  const netPay = bestView?.net ?? 0;
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

        <main style={{ flex: 1, maxWidth: '1180px', width: '100%', margin: '0 auto', padding: '1.5rem 1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Unified Farmer Command Hub Card */}
            <div
              className="glass-card"
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {/* Profile Top Row */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                      border: '1px solid #FED7AA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#EA580C',
                      flexShrink: 0,
                    }}
                  >
                    <User size={22} strokeWidth={2.4} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        {farmerName}
                      </h1>
                      <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                        <ShieldCheck size={12} />
                        Verified Smallholder
                      </span>
                      <span className="badge badge-orange" style={{ fontSize: '0.68rem' }}>
                        {lot.lot_code}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        color: 'var(--text-muted)',
                        fontSize: '0.78rem',
                        marginTop: '0.15rem',
                      }}
                    >
                      <MapPin size={13} style={{ color: '#F97316' }} />
                      <span>Khousabung Terraces, {lot.district} Cluster</span>
                      <span>•</span>
                      <span style={{ color: '#059669', fontWeight: 600 }}>GI Certified Queen Pineapple</span>
                    </div>
                  </div>
                </div>

                {/* Weather Alert Strip */}
                <div
                  style={{
                    background: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.45rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                  }}
                >
                  <CloudRain size={16} style={{ color: '#EA580C', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.78rem', color: '#9A3412', fontWeight: 600 }}>
                    {decision?.urgent
                      ? `Rain ${Math.round(rain.mm)} mm in ${Math.round(rain.etaHours)} h: pick within ${Math.round(decision.hoursLeft)} h to protect your grade`
                      : 'No harvest-threatening rain in the next 48 h'}
                  </div>
                  <button
                    onClick={() => setActiveTab('module-b')}
                    style={{
                      background: '#EA580C',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.2rem 0.55rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <span>Radar</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>

              {/* 4 Essential Farm Telemetry Chips */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.95rem',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Stand Capacity
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                    18,500 <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)' }}>Pines</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 600 }}>
                    1.2 Ha Stand
                  </div>
                </div>

                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.95rem',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Sugar Sweetness
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', marginTop: '0.1rem' }}>
                    {lot.estimated_brix.toFixed(1)}° <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>Brix</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                    {decision?.gradeNow ?? 'Grade A'} Export Quality
                  </div>
                </div>

                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.95rem',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Thermal Accumulation
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#EA580C', marginTop: '0.1rem' }}>
                    2,478 <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ 2500 GDD</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                    99.1% Peak Maturity
                  </div>
                </div>

                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.95rem',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Guaranteed Net Pay
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F97316', marginTop: '0.1rem' }}>
                    ₹{netPay.toFixed(2)} <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ kg Net</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                    +₹{round2(netPay - BROKER_NET_PER_KG).toFixed(2)}/kg vs Broker Cash
                  </div>
                </div>
              </div>
            </div>

            {/* Clean Segmented Tab Switcher */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  background: '#F1F5F9',
                  padding: '0.3rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  gap: '0.35rem',
                }}
              >
                <button
                  onClick={() => setActiveTab('module-a')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 1.15rem',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    fontSize: '0.84rem',
                    fontWeight: activeTab === 'module-a' ? 800 : 600,
                    cursor: 'pointer',
                    background: activeTab === 'module-a' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'module-a' ? '#EA580C' : 'var(--text-secondary)',
                    boxShadow: activeTab === 'module-a' ? '0 1px 4px rgba(15, 23, 42, 0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Camera size={15} />
                  <span>AI Disease Scanner</span>
                </button>

                <button
                  onClick={() => setActiveTab('module-b')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 1.15rem',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    fontSize: '0.84rem',
                    fontWeight: activeTab === 'module-b' ? 800 : 600,
                    cursor: 'pointer',
                    background: activeTab === 'module-b' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'module-b' ? '#EA580C' : 'var(--text-secondary)',
                    boxShadow: activeTab === 'module-b' ? '0 1px 4px rgba(15, 23, 42, 0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <CalendarDays size={15} />
                  <span>Harvest Radar</span>
                </button>

                <button
                  onClick={() => setActiveTab('module-c')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 1.15rem',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    fontSize: '0.84rem',
                    fontWeight: activeTab === 'module-c' ? 800 : 600,
                    cursor: 'pointer',
                    background: activeTab === 'module-c' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'module-c' ? '#EA580C' : 'var(--text-secondary)',
                    boxShadow: activeTab === 'module-c' ? '0 1px 4px rgba(15, 23, 42, 0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <CircleDollarSign size={15} />
                  <span>Transparent Market</span>
                </button>
              </div>
            </div>

            {/* Active Sub-module Container with Instant Tab Switching */}
            <div style={{ marginTop: '0.25rem' }}>
              <div style={{ display: activeTab === 'module-a' ? 'block' : 'none' }}>
                <DiseaseScreeningStudio />
              </div>
              <div style={{ display: activeTab === 'module-b' ? 'block' : 'none' }}>
                <HarvestReadinessRadar onRegisterLot={() => setActiveTab('module-c')} />
              </div>
              <div style={{ display: activeTab === 'module-c' ? 'block' : 'none' }}>
                <MarketLinkageModule />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </RoleGuard>
  );
}
