'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import {
  CalendarDays,
  CloudRain,
  SunMedium,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  PackageCheck,
  Thermometer,
  Layers,
  Clock,
  Droplets,
  Activity,
  Gauge,
  Check
} from 'lucide-react';
import { HarvestForecastData } from '@/types';
import { MOCK_HARVEST_FORECAST } from '@/lib/mock-data';
import { api } from '@/lib/api-client';

interface HarvestReadinessRadarProps {
  onRegisterLot?: () => void;
}

export const HarvestReadinessRadar: React.FC<HarvestReadinessRadarProps> = ({
  onRegisterLot
}) => {
  const { t } = useTranslation();
  const [forecast, setForecast] = useState<HarvestForecastData>(MOCK_HARVEST_FORECAST);
  const [lotRegistered, setLotRegistered] = useState(false);

  useEffect(() => {
    api.getHarvestForecast('crop-queen-tombi-001')
      .then((data) => setForecast(data))
      .catch((err) => console.warn('Forecast fetch error:', err));
  }, []);

  const handleRegisterClick = async () => {
    setLotRegistered(true);
    try {
      await api.registerLot(450, 'crop-queen-tombi-001');
    } catch (err) {
      console.warn('Lot registration error:', err);
    }
    if (onRegisterLot) {
      setTimeout(() => {
        onRegisterLot();
      }, 700);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Module Header */}
      <div className="glass-card glass-card-accent" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge badge-orange">MODULE B</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Harvest Readiness & Phenology Radar
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Growing Degree Day (GDD) thermal tracking, refractometer brix forecasting, and monsoon dilution risk mitigation.
            </p>
          </div>

          <div style={{
            background: '#FAFAF9',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.55rem 0.95rem',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>CROP BATCH PROFILE</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Queen Pineapple • 1.2 Ha
            </div>
            <div style={{ fontSize: '0.78rem', color: '#EA580C', fontWeight: 600 }}>
              {forecast.district} • Field Day {forecast.days_in_field}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Phenology Progression & Weather Advisory */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Left Column: Phenological Stepper */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              Phenological Lifecycle Stepper
            </span>
            <span className="badge badge-orange">
              <span className="pulse-dot pulse-dot-orange" />
              99.1% GDD Complete
            </span>
          </div>

          {/* Stepper Visuals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {forecast.stages.map((stage, idx) => {
              return (
                <div
                  key={stage.stage_id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    background: stage.is_active
                      ? '#FFF7ED'
                      : stage.is_completed
                        ? '#ECFDF5'
                        : '#FAFAF9',
                    border: stage.is_active
                      ? '1.5px solid #F97316'
                      : stage.is_completed
                        ? '1px solid #A7F3D0'
                        : '1px solid var(--border-subtle)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: stage.is_active
                      ? '#F97316'
                      : stage.is_completed
                        ? '#10B981'
                        : '#E4E4E7',
                    color: stage.is_active || stage.is_completed ? '#FFFFFF' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>
                    {stage.is_completed ? <Check size={14} strokeWidth={2.5} /> : idx + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: stage.is_active ? '#EA580C' : 'var(--text-primary)' }}>
                        {stage.name}
                      </span>
                      {stage.is_active && (
                        <span className="badge badge-orange" style={{ fontSize: '0.62rem' }}>
                          CURRENT STAGE
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {stage.description}
                    </p>
                    <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>Threshold: {stage.gdd_threshold ? `${stage.gdd_threshold} GDD` : `${stage.days_range[1]} Days`}</span>
                      <span>•</span>
                      <span>Target: {stage.target_brix_range || '14.5° Brix'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dual Metrics: GDD Accumulation & Refractometer Brix */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginTop: '0.25rem',
          }}>
            <div style={{
              background: '#FAFAF9',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#EA580C', fontSize: '0.75rem', fontWeight: 700 }}>
                <Thermometer size={14} />
                <span>THERMAL GDD</span>
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {forecast.gdd_accumulated} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {forecast.gdd_required || forecast.gdd_target}</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#059669' }}>
                Base Temp 10°C • Manipur
              </div>
            </div>

            <div style={{
              background: '#FAFAF9',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>
                <Gauge size={14} />
                <span>SUGAR CONTENT</span>
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 900, color: '#059669' }}>
                {forecast.estimated_brix}° Brix
              </div>
              <div style={{ fontSize: '0.7rem', color: '#EA580C' }}>
                Grade A Minimum: 14.0°
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Weather Threat & Batch Action */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              Weather Impact & Harvest Window
            </span>
            <span className="badge badge-crimson">
              HIGH RISK WINDOW
            </span>
          </div>

          {/* Meteorological Downpour Threat Card */}
          <div style={{
            background: '#FFF7ED',
            border: '1px solid #FDBA74',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#FFEDD5',
                color: '#EA580C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <CloudRain size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#9A3412' }}>
                  65.0mm Heavy Downpour Forecast in 48 Hours
                </div>
                <div style={{ fontSize: '0.75rem', color: '#C2410C' }}>
                  Soil Saturation in Thoubal & Churachandpur
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#7C2D12', lineHeight: 1.5 }}>
              Harvesting during heavy rainfall leads to osmotic water uptake, dropping pineapple Brix by <strong style={{ color: '#DC2626' }}>-2.1° Brix</strong> (downgrading from Grade A to Grade B) and increasing transit mold.
            </p>

            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              padding: '0.55rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              border: '1px solid #FED7AA',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Optimal Harvest Window:</span>
              <span style={{ color: '#EA580C', fontWeight: 800 }}>Next 24 to 36 Hours</span>
            </div>
          </div>

          {/* Action Box: Register Harvest Lot for Pooling */}
          <div style={{
            background: '#FAFAF9',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginTop: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Pre-Harvest Batch Registration
              </span>
              <span className="badge badge-green">450 kg Ready</span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Lock in your Grade A lot in the collective FPO queue now to guarantee institutional pricing before the downpour begins.
            </p>

            <button
              onClick={handleRegisterClick}
              disabled={lotRegistered}
              className="tap-target btn-primary"
              style={{ width: '100%', gap: '0.45rem', fontSize: '0.88rem' }}
            >
              <PackageCheck size={18} />
              {lotRegistered ? (
                'Registered! Forwarding to Market...'
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  Register Consignment for Pooling <ArrowRight size={14} />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
