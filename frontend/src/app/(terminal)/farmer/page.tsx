'use client';

import React, { useState, useEffect } from 'react';
import { DiseaseScreeningStudio } from '@/components/disease/DiseaseScreeningStudio';
import { HarvestReadinessRadar } from '@/components/harvest/HarvestReadinessRadar';
import { MarketLinkageModule } from '@/components/market/MarketLinkageModule';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/context/AuthContext';
import { FarmerProvider, useFarmer } from '@/context/FarmerContext';
import { BROKER_NET_PER_KG, round2 } from '@/lib/decision';
import { api } from '@/lib/api-client';
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
  const isDemoRain = rain.source === 'demo';
  const hoursLeft = decision ? Math.max(0, Math.round(decision.hoursLeft)) : null;
  const rupeesAtRisk = decision ? Math.round(decision.rupeesAtRisk) : null;
  const grade = decision?.gradeNow ?? '—';
  const brix = decision?.brixNow ?? lot.estimated_brix;
  const advantage = bestView?.advantage ?? null;
  const [gdd, setGdd] = useState<{ acc: number; target: number } | null>(null);
  useEffect(() => {
    api
      .getHarvestForecast('crop-queen-tombi-001')
      .then((f) => setGdd({ acc: f.gdd_accumulated, target: f.gdd_target }))
      .catch(() => setGdd(null));
  }, []);
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
                    {rain.mm >= 20
                      ? `${rain.mm} mm of rain is forecast in ${rain.etaHours} h. Harvest within ${hoursLeft ?? '—'} h to protect the ${grade} grade.`
                      : `No damaging rain in the next 48 h (${rain.mm} mm forecast). No need to rush the harvest.`}
                  </p>
                  <div className="hl-window-chart">
                    <div className="hl-window-labels">
                      <span>Now</span>
                      <span>Pick by {hoursLeft ?? '—'} h</span>
                      <span>Rain · {rain.etaHours} h</span>
                    </div>
                    <div className="hl-window-track">
                      <div className="hl-window-safe" style={{ width: `${Math.min(100, ((hoursLeft ?? 0) / 48) * 100)}%` }} />
                      <div className="hl-window-pick" style={{ left: `${Math.min(100, ((hoursLeft ?? 0) / 48) * 100)}%` }} />
                      <div className="hl-window-rain" style={{ left: `${Math.min(100, (rain.etaHours / 48) * 100)}%` }} />
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
                  <strong>{rupeesAtRisk == null ? '—' : `₹${rupeesAtRisk.toLocaleString('en-IN')}`}</strong>
                  <small>Estimated for this {lot.quantity_kg} kg lot</small>
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
                    <dd style={{ color: '#F97316', fontWeight: 600 }}>{grade}</dd>
                  </div>
                  <div>
                    <dt>Rain window</dt>
                    <dd style={{ color: '#963238', fontWeight: 600 }}>{rain.mm} mm · {rain.etaHours} h</dd>
                  </div>
                  <div>
                    <dt>Net offer</dt>
                    <dd className="tabular-nums" style={{ color: '#F97316', fontWeight: 700 }}>{bestView ? `₹${bestView.net.toFixed(2)} / kg` : '—'}</dd>
                  </div>
                </dl>
                <small>{isDemoRain ? 'Demonstration storm · sample scenario, not a live forecast' : `Live forecast · ${rain.source}`}</small>
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
                  {brix}° <small>Brix</small>
                </strong>
                <em style={{ color: '#F97316' }}>{grade} estimate</em>
              </div>

              <div>
                <i className="hl-metric-icon"><Thermometer size={16} /></i>
                <span>Thermal accumulation</span>
                <strong style={{ color: '#783f0a' }}>
                  {gdd ? gdd.acc.toLocaleString('en-IN') : '—'} <small>/ {gdd ? gdd.target.toLocaleString('en-IN') : '—'} GDD</small>
                </strong>
                <em style={{ color: '#F97316' }}>{gdd ? `${((gdd.acc / gdd.target) * 100).toFixed(1)}% maturity estimate` : 'Forecast unavailable'}</em>
              </div>

              <div>
                <i className="hl-metric-icon"><CircleDollarSign size={16} /></i>
                <span>Net return</span>
                <strong style={{ color: '#F97316' }}>
                  {bestView ? `₹${bestView.net.toFixed(2)}` : '—'} <small>/ kg</small>
                </strong>
                <em style={{ color: '#F97316' }}>
                  {advantage == null ? 'No offer yet' : `₹${advantage.toFixed(2)} ${advantage >= 0 ? 'above' : 'below'} broker cash`}
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
