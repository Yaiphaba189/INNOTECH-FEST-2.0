'use client';

import React, { useState } from 'react';
import { Header } from '@/components/common/Header';
import { DiseaseScreeningStudio } from '@/components/disease/DiseaseScreeningStudio';
import { HarvestReadinessRadar } from '@/components/harvest/HarvestReadinessRadar';
import { MarketLinkageModule } from '@/components/market/MarketLinkageModule';
import { useRouter } from 'next/navigation';
import { Camera, CalendarDays, CircleDollarSign, CloudRain, MapPin, Sparkles } from 'lucide-react';

export default function FarmerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'module-a' | 'module-b' | 'module-c'>('module-a');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        currentRole="farmer"
        onSelectRole={(role) => {
          if (role === 'buyer') router.push('/buyer');
          else if (role === 'fpo') router.push('/fpo');
          else router.push('/farmer');
        }}
      />

      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Farm Profile Header */}
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
                    Tombi Singh (Churachandpur / Thoubal)
                  </h1>
                  <span className="badge badge-green">Verified Smallholder</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                  <MapPin size={14} style={{ color: 'var(--pineapple-gold)' }} />
                  <span>Andro Terraces Cluster • 1.2 Ha Queen Pineapple (Day 480)</span>
                </div>
              </div>
            </div>

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
                <span>Monsoon Warning: 29 Oct (65mm)</span>
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
                <span>14.8° Brix (Grade A)</span>
              </div>
            </div>
          </div>

          {/* Module Selector Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <button
              onClick={() => setActiveTab('module-a')}
              className="tap-target"
              style={{
                background: activeTab === 'module-a' 
                  ? 'linear-gradient(135deg, var(--pineapple-gold), #D97706)' 
                  : 'var(--bg-surface)',
                color: activeTab === 'module-a' ? '#0F172A' : 'var(--text-secondary)',
                border: activeTab === 'module-a' ? '1px solid var(--pineapple-gold)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                boxShadow: activeTab === 'module-a' ? '0 4px 14px var(--pineapple-gold-glow)' : 'none',
              }}
            >
              <Camera size={18} />
              <span>Module A: Disease Scan</span>
            </button>

            <button
              onClick={() => setActiveTab('module-b')}
              className="tap-target"
              style={{
                background: activeTab === 'module-b' 
                  ? 'linear-gradient(135deg, var(--pineapple-gold), #D97706)' 
                  : 'var(--bg-surface)',
                color: activeTab === 'module-b' ? '#0F172A' : 'var(--text-secondary)',
                border: activeTab === 'module-b' ? '1px solid var(--pineapple-gold)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                boxShadow: activeTab === 'module-b' ? '0 4px 14px var(--pineapple-gold-glow)' : 'none',
              }}
            >
              <CalendarDays size={18} />
              <span>Module B: Harvest Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('module-c')}
              className="tap-target"
              style={{
                background: activeTab === 'module-c' 
                  ? 'linear-gradient(135deg, var(--pineapple-gold), #D97706)' 
                  : 'var(--bg-surface)',
                color: activeTab === 'module-c' ? '#0F172A' : 'var(--text-secondary)',
                border: activeTab === 'module-c' ? '1px solid var(--pineapple-gold)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                boxShadow: activeTab === 'module-c' ? '0 4px 14px var(--pineapple-gold-glow)' : 'none',
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
    </div>
  );
}
