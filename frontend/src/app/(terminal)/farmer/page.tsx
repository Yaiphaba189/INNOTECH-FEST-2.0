'use client';

import React, { useState, useEffect } from 'react';
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
  Sprout,
  Candy,
  Thermometer,
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'radar' || tabParam === 'module-b' || tabParam === 'harvest') {
        setActiveTab('module-b');
      } else if (tabParam === 'market' || tabParam === 'module-c') {
        setActiveTab('module-c');
      }
    }
  }, []);

  return (
    <RoleGuard allowedRoles={['farmer']}>
      <>
        <main className="app-sheet">
          <div className="farmer-workspace">
            {/* Screen Heading */}
            <div className="hl-screen-heading">
              <div>
                <span className="hl-eyebrow">Farmer terminal</span>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Harvest decisions
                </h1>
                <p>
                  <MapPin size={14} style={{ color: '#FB923C' }} />
                  <span>{farmerName} · Demonstration farm · Khousabung, Churachandpur</span>
                </p>
              </div>

              <span className="hl-lot-id">
                {lot.lot_code || 'HL-Q-CCP-089'}
              </span>
            </div>

            {/* Overview Grid: Harvest Window & Field and Lot */}
            <div className="hl-overview-grid">
              {/* Left Panel: Harvest Window & Weather Risk */}
              <div className="hl-risk-panel">
                <div className="hl-risk-copy">
                  <span className="hl-section-kicker">
                    <CloudRain size={16} />
                    <span>Harvest window</span>
                  </span>
                  <h2>Pick before the rain reaches your stand</h2>
                  <p>
                    65 mm of rain is forecast in 41 h. Harvest within 35 h to protect the Grade A grade.
                  </p>
                  <div className="hl-window-chart">
                    <div className="hl-window-labels">
                      <span>Now</span>
                      <span>Pick by 35 h</span>
                      <span>Rain · 41 h</span>
                    </div>
                    <div className="hl-window-track">
                      <div className="hl-window-safe" style={{ width: '73%' }} />
                      <div className="hl-window-pick" style={{ left: '73%' }} />
                      <div className="hl-window-rain" style={{ left: '85%' }} />
                    </div>
                    <div className="hl-window-end">48-hour forecast</div>
                  </div>
                  <button
                    type="button"
                    className="hl-primary-action"
                    onClick={() => setActiveTab('module-b')}
                  >
                    <span>Open harvest radar</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

                <div className="hl-risk-value">
                  <span>Value at risk if delayed</span>
                  <strong>₹4,094</strong>
                  <small>Estimated for this 500 kg lot</small>
                </div>
              </div>

              {/* Right Panel: Field and Lot */}
              <div className="hl-field-note">
                <h2>Field and lot</h2>
                <dl>
                  <div>
                    <dt>Crop</dt>
                    <dd>GI Queen pineapple</dd>
                  </div>
                  <div>
                    <dt>Current grade</dt>
                    <dd style={{ color: '#F97316', fontWeight: 600 }}>Grade A</dd>
                  </div>
                  <div>
                    <dt>Rain window</dt>
                    <dd style={{ color: '#963238', fontWeight: 600 }}>65 mm · 41 h</dd>
                  </div>
                  <div>
                    <dt>Net offer</dt>
                    <dd className="tabular-nums" style={{ color: '#F97316', fontWeight: 700 }}>₹28.50 / kg</dd>
                  </div>
                </dl>
                <small>Demonstration forecast · sample scenario</small>
              </div>
            </div>

            {/* 4 Essential Farm Telemetry Chips */}
            <div className="hl-metric-strip">
              <div>
                <i className="hl-metric-icon"><Sprout size={16} /></i>
                <span>Stand capacity</span>
                <strong>
                  18,500 <small>plants</small>
                </strong>
                <em>1.2 ha stand</em>
              </div>

              <div>
                <i className="hl-metric-icon"><Candy size={16} /></i>
                <span>Fruit sweetness</span>
                <strong style={{ color: '#F97316' }}>
                  14.8° <small>Brix</small>
                </strong>
                <em style={{ color: '#F97316' }}>Grade A estimate</em>
              </div>

              <div>
                <i className="hl-metric-icon"><Thermometer size={16} /></i>
                <span>Thermal accumulation</span>
                <strong style={{ color: '#783f0a' }}>
                  2,478 <small>/ 2,500 GDD</small>
                </strong>
                <em style={{ color: '#F97316' }}>99.1% maturity estimate</em>
              </div>

              <div>
                <i className="hl-metric-icon"><CircleDollarSign size={16} /></i>
                <span>Net return</span>
                <strong style={{ color: '#F97316' }}>
                  ₹28.50 <small>/ kg</small>
                </strong>
                <em style={{ color: '#F97316' }}>
                  ₹5.25 above broker cash
                </em>
              </div>
            </div>

            {/* Clean Module Underline Navigation */}
            <nav className="hl-module-nav" aria-label="Module Tabs">
              <button
                type="button"
                onClick={() => setActiveTab('module-a')}
                className={activeTab === 'module-a' ? 'is-active' : ''}
              >
                <Camera size={16} />
                <span>Disease screening</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('module-b')}
                className={activeTab === 'module-b' ? 'is-active' : ''}
              >
                <CalendarDays size={16} />
                <span>Harvest radar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('module-c')}
                className={activeTab === 'module-c' ? 'is-active' : ''}
              >
                <CircleDollarSign size={16} />
                <span>Market offers</span>
              </button>
            </nav>

            {/* Active Sub-module Container */}
            <div className="hl-module-content">
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

      </>
    </RoleGuard>
  );
}
