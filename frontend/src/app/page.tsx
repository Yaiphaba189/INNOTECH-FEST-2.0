'use client';

import React, { useState } from 'react';
import { Header } from '@/components/common/Header';
import { DiseaseScreeningStudio } from '@/components/disease/DiseaseScreeningStudio';
import { HarvestReadinessRadar } from '@/components/harvest/HarvestReadinessRadar';
import { MarketLinkageModule } from '@/components/market/MarketLinkageModule';
import { FpoLogisticsConsole } from '@/components/fpo/FpoLogisticsConsole';
import { BuyerMarketplace } from '@/components/buyer/BuyerMarketplace';
import { useTranslation } from '@/lib/i18n';
import { UserRole } from '@/types';
import { 
  Camera, 
  CalendarDays, 
  CircleDollarSign, 
  Sparkles, 
  Sprout, 
  Building2, 
  Truck, 
  CloudRain, 
  MapPin, 
  CheckCircle2,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [activeFarmerTab, setActiveFarmerTab] = useState<'module-a' | 'module-b' | 'module-c'>('module-a');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Global Header */}
      <Header
        currentRole={currentRole}
        onSelectRole={(role) => setCurrentRole(role)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        {/* Role 1: Farmer Terminal */}
        {currentRole === 'farmer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Farmer Farm Profile Summary Bar */}
            <div className="glass-card" style={{
              background: 'linear-gradient(135deg, #FFFFFF, #F8FAFC)',
              border: '1px solid var(--border-medium)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              boxShadow: 'var(--shadow-subtle)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)',
                }}>
                  👨‍🌾
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Tombi Singh
                    </h1>
                    <span className="badge badge-green">Verified Smallholder</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                    <MapPin size={14} style={{ color: 'var(--pineapple-gold)' }} />
                    <span>Andro Terraces, Thoubal / Churachandpur Cluster • 1.2 Ha Queen Pineapple</span>
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{
                  background: 'rgba(220, 38, 38, 0.08)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.45rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  color: '#DC2626',
                  fontWeight: 600,
                }}>
                  <CloudRain size={16} />
                  <span>Monsoon Downpour: 29 Oct (65mm)</span>
                </div>

                <div style={{
                  background: 'rgba(217, 119, 6, 0.08)',
                  border: '1px solid rgba(217, 119, 6, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.45rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  color: '#B45309',
                  fontWeight: 700,
                }}>
                  <Sparkles size={16} />
                  <span>Harvest Stage: Color Break (14.8° Brix)</span>
                </div>
              </div>
            </div>

            {/* Farmer Module Tabs Navigation */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
            }}>
              <button
                onClick={() => setActiveFarmerTab('module-a')}
                className="tap-target"
                style={{
                  background: activeFarmerTab === 'module-a' 
                    ? 'linear-gradient(135deg, var(--pineapple-gold), #D97706)' 
                    : 'var(--bg-surface)',
                  color: activeFarmerTab === 'module-a' ? '#0F172A' : 'var(--text-secondary)',
                  border: activeFarmerTab === 'module-a' ? '1px solid var(--pineapple-gold)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  boxShadow: activeFarmerTab === 'module-a' ? '0 4px 14px var(--pineapple-gold-glow)' : 'none',
                }}
              >
                <Camera size={18} />
                <span>Module A: Disease Scan</span>
              </button>

              <button
                onClick={() => setActiveFarmerTab('module-b')}
                className="tap-target"
                style={{
                  background: activeFarmerTab === 'module-b' 
                    ? 'linear-gradient(135deg, var(--pineapple-gold), #D97706)' 
                    : 'var(--bg-surface)',
                  color: activeFarmerTab === 'module-b' ? '#0F172A' : 'var(--text-secondary)',
                  border: activeFarmerTab === 'module-b' ? '1px solid var(--pineapple-gold)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  boxShadow: activeFarmerTab === 'module-b' ? '0 4px 14px var(--pineapple-gold-glow)' : 'none',
                }}
              >
                <CalendarDays size={18} />
                <span>Module B: Harvest Radar</span>
              </button>

              <button
                onClick={() => setActiveFarmerTab('module-c')}
                className="tap-target"
                style={{
                  background: activeFarmerTab === 'module-c' 
                    ? 'linear-gradient(135deg, var(--pineapple-gold), #D97706)' 
                    : 'var(--bg-surface)',
                  color: activeFarmerTab === 'module-c' ? '#0F172A' : 'var(--text-secondary)',
                  border: activeFarmerTab === 'module-c' ? '1px solid var(--pineapple-gold)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  boxShadow: activeFarmerTab === 'module-c' ? '0 4px 14px var(--pineapple-gold-glow)' : 'none',
                }}
              >
                <CircleDollarSign size={18} />
                <span>Module C: Transparent Market</span>
              </button>
            </div>

            {/* Active Farmer Sub-Screen */}
            {activeFarmerTab === 'module-a' && <DiseaseScreeningStudio />}
            {activeFarmerTab === 'module-b' && (
              <HarvestReadinessRadar onRegisterLot={() => setActiveFarmerTab('module-c')} />
            )}
            {activeFarmerTab === 'module-c' && (
              <MarketLinkageModule onDealLocked={() => {
                // If deal locked, recommend checking FPO logistics
              }} />
            )}
          </div>
        )}

        {/* Role 2: Buyer Portal */}
        {currentRole === 'buyer' && <BuyerMarketplace />}

        {/* Role 3: FPO Logistics Console */}
        {currentRole === 'fpo' && <FpoLogisticsConsole />}
      </main>

      {/* Footer & Innotech Fest 2.0 Credentials */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        padding: '1.75rem 1.25rem',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>HARVESTLINK AI</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Designed for Manipur Horticulture (Churachandpur, Thoubal, Imphal East & Bishnupur clusters).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Member 1 (AI/ML):</strong> MobileNetV3 + Phenology GDD
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Member 2 (Backend):</strong> FastAPI + PostGIS + OR-Tools
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Member 3 (Frontend):</strong> Next.js 14 + Agrarian Tokens + Offline PWA
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
