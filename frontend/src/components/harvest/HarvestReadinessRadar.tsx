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
  Layers
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Module Header */}
      <div className="glass-card glass-card-accent" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge badge-gold">MODULE B</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {t('moduleBTitle')}
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
              Growing Degree Day (GDD) phenological tracking and 48-hour monsoon downpour dilution alerts.
            </p>
          </div>

          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 0.85rem',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CROP PROFILE</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Queen Pineapple • 1.2 Ha
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pineapple-gold)' }}>
              {forecast.district} • Day {forecast.days_in_field}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Phenology Progression & Weather Advisory */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* Left Column: Phenological Stepper & Heat Gauge */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {t('phenologyProgression')}
            </span>
            <span className="badge badge-gold">
              90% Optimal
            </span>
          </div>

          {/* Stepper Visuals (Planting -> Inflorescence -> Color Break -> Harvest) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {forecast.stages.map((stage, idx) => {
              const label = stage.name;

              return (
                <div
                  key={stage.stage_id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: stage.is_active
                      ? 'rgba(245, 158, 11, 0.12)'
                      : stage.is_completed
                        ? 'rgba(16, 185, 129, 0.08)'
                        : 'var(--bg-surface)',
                    border: stage.is_active
                      ? '1px solid var(--pineapple-gold)'
                      : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: stage.is_active
                      ? 'var(--pineapple-gold)'
                      : stage.is_completed
                        ? 'var(--plantation-green)'
                        : 'var(--bg-surface-elevated)',
                    color: stage.is_active || stage.is_completed ? '#080C14' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>
                    {stage.is_completed ? '✔' : idx + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        color: stage.is_active ? 'var(--pineapple-gold)' : stage.is_completed ? 'var(--text-primary)' : 'var(--text-muted)',
                      }}>
                        {label}
                      </span>
                      <span className="tabular-nums" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        Day {stage.days_range[0]} - {stage.days_range[1]}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Metric Badges: Heat Units (GDD) & Brix Sugar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {/* GDD Gauge */}
            <div style={{
              background: 'var(--bg-surface-elevated)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                <Thermometer size={14} style={{ color: 'var(--pineapple-gold)' }} />
                <span>GDD HEAT UNITS</span>
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {forecast.gdd_accumulated} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {forecast.gdd_target}</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--plantation-green)', marginTop: '0.15rem' }}>
                96.8% Target Reached (T_base = 16.0°C)
              </div>
            </div>

            {/* Brix Sweetness Indicator */}
            <div style={{
              background: 'var(--bg-surface-elevated)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                <Sparkles size={14} style={{ color: 'var(--plantation-green)' }} />
                <span>ESTIMATED BRIX</span>
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--plantation-green)', marginTop: '0.25rem' }}>
                {forecast.estimated_brix}° Brix
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--pineapple-gold)', marginTop: '0.15rem' }}>
                Certified Grade A Queen
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Optimal Window, Weather Risk Warning & Register Lot */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Optimal Harvest Window Callout */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(16, 185, 129, 0.15))',
            border: '1px solid var(--pineapple-gold)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--pineapple-gold)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('optimalWindow')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.4rem' }}>
              <span className="tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {forecast.optimal_harvest_start}
              </span>
              <ArrowRight size={18} style={{ color: 'var(--pineapple-gold)' }} />
              <span className="tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {forecast.optimal_harvest_end}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--plantation-green)', fontWeight: 600, marginTop: '0.4rem' }}>
              Recommended: {forecast.recommended_pick_date}
            </div>
          </div>

          {/* Meteorological Risk Warning: Monsoon Dilution (Part 3, Sec 7.2) */}
          <div style={{
            background: 'var(--alert-crimson-bg)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <CloudRain size={20} style={{ color: 'var(--alert-crimson)' }} />
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--alert-crimson)' }}>
                {t('weatherRiskAlert')}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.35rem' }}>
              {forecast.weather_risk_title} ({forecast.weather_forecast.condition})
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {forecast.agronomic_advisory}
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.75rem',
              padding: '0.45rem 0.65rem',
              background: '#FFFFFF',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: 'var(--alert-crimson)',
            }}>
              <AlertTriangle size={15} style={{ color: 'var(--alert-crimson)', flexShrink: 0 }} />
              <span>Picking delayed past 28 Oct drops sugar by up to 2.5° Brix, triggering buyer price penalties.</span>
            </div>
          </div>

          {/* Register Lot for Immediate Market Linkage */}
          <div style={{ marginTop: 'auto' }}>
            {lotRegistered ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid var(--plantation-green)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: 'var(--plantation-green)',
              }}>
                <CheckCircle2 size={20} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Lot Registered: LOT-PL-048 (450 kg)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Synchronized with Module C Buyer Matching Deck
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleRegisterClick}
                className="tap-target btn-primary"
                style={{ width: '100%', gap: '0.5rem', fontSize: '0.95rem' }}
              >
                <PackageCheck size={18} />
                {t('registerLotBtn')} (450 kg Queen)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
