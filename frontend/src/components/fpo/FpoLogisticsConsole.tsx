'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import QRCode from 'qrcode';
import {
  Truck,
  MapPin,
  Printer,
  MessageSquare,
  QrCode,
  Phone,
  X,
} from 'lucide-react';
import { DispatchRun } from '@/types';
import { MOCK_DISPATCH_RUN } from '@/lib/mock-data';
import { api } from '@/lib/api-client';

export const FpoLogisticsConsole: React.FC = () => {
  const { t } = useTranslation();
  const [run, setRun] = useState<DispatchRun>(MOCK_DISPATCH_RUN);
  // Persisted runs have UUID ids; show a short readable code instead.
  const displayRunId = run.run_id.length > 24 ? `RUN-${run.run_id.slice(0, 8).toUpperCase()}` : run.run_id;
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [smsSent, setSmsSent] = useState(false);
  const [showManifestModal, setShowManifestModal] = useState(false);

  useEffect(() => {
    api
      .getDispatchRun('latest')
      .then((data) => {
        if (data && data.run_id) {
          setRun(data);
        }
      })
      .catch((err) => console.warn('Dispatch run fetch error:', err));
  }, []);

  useEffect(() => {
    const qrPayload = JSON.stringify({
      token: run.digital_gate_pass_token,
      run_id: run.run_id,
      vehicle: run.vehicle_registration,
      driver: run.driver_name,
      total_kg: run.current_payload_kg,
      dest: run.destination_hub,
      timestamp: run.timestamp,
    });

    QRCode.toDataURL(qrPayload, {
      width: 220,
      margin: 1,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [run]);

  const handleSendSms = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 4000);
  };

  const stops = run.stops || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Console Header */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-orange" style={{ fontSize: '0.66rem' }}>
              FPO LOGISTICS
            </span>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Collective Logistics & Route Dispatch
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
            Consolidating smallholder harvest lots into ≥75% saturated transit payloads.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-slate" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
            RUN: {displayRunId}
          </span>
          <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
            {run.cluster_district} Cluster
          </span>
        </div>
      </div>

      {/* Main Grid: Vehicle Saturation & Waypoint Route */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Left Column: Vehicle Saturation & QR Gate-Pass */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Vehicle Saturation Meter
            </span>
            <span
              className={`badge ${run.capacity_fill_pct >= 75 ? 'badge-green' : 'badge-orange'}`}
              style={{ fontSize: '0.68rem' }}
            >
              <span className={`pulse-dot ${run.capacity_fill_pct >= 75 ? 'pulse-dot-green' : ''}`} />
              {run.capacity_fill_pct}% Full ({run.capacity_fill_pct >= 75 ? 'Pass' : 'Below 75% gate'})
            </span>
          </div>

          {/* Vehicle Info Box */}
          <div
            style={{
              background: '#F8FAFC',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#FFF7ED',
                  color: '#EA580C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Truck size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  {run.vehicle_type}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Reg: {run.vehicle_registration} • Driver: {run.driver_name}
                </div>
              </div>
            </div>

            <span className="badge badge-orange" style={{ fontSize: '0.66rem' }}>
              06:30 AM
            </span>
          </div>

          {/* Saturation Progress */}
          <div
            style={{
              background: '#F8FAFC',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Consolidated Payload
              </span>
              <span className="tabular-nums" style={{ fontSize: '1rem', fontWeight: 900, color: '#059669' }}>
                {run.current_payload_kg} kg <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>/ {run.vehicle_capacity_kg} kg</span>
              </span>
            </div>

            <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  width: `${run.capacity_fill_pct}%`,
                  background: '#10B981',
                  borderRadius: '4px',
                  transition: 'width 0.6s ease',
                }}
              />
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '75%', width: '2px', background: '#F97316' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              <span>0 kg</span>
              <span style={{ color: '#EA580C', fontWeight: 700 }}>75% Target Gate</span>
              <span>{run.vehicle_capacity_kg} kg</span>
            </div>
          </div>

          {/* 3 Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div style={{ background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', padding: '0.55rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>STOPS</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                {stops.length} Lots
              </div>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', padding: '0.55rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>SAVINGS</div>
              <div className="tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 900, color: '#059669', marginTop: '0.1rem' }}>
                +₹{run.cost_savings_per_kg.toFixed(2)}/kg
              </div>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', padding: '0.55rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>HUB</div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#EA580C', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Nilakuthi
              </div>
            </div>
          </div>

          {/* Digital Gate Pass Card */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginTop: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Transit Gate Pass QR"
                  style={{ width: '50px', height: '50px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
                />
              )}
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                  Digital Transit Gate-Pass
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  TOKEN: {run.digital_gate_pass_token.slice(0, 14)}...
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowManifestModal(true)}
              className="tap-target btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem', minHeight: '32px' }}
            >
              <QrCode size={13} style={{ marginRight: '0.25rem' }} />
              QR Pass
            </button>
          </div>
        </div>

        {/* Right Column: Route Stops Timeline & Actions */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Pickup Route Timeline
            </span>
            <span className="badge badge-orange" style={{ fontSize: '0.68rem' }}>
              CVRPTW Optimal
            </span>
          </div>

          {/* Route Stops */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {stops.map((stop, idx) => (
              <div
                key={stop.lot_code || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#F8FAFC',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    color: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.72rem',
                    flexShrink: 0,
                  }}
                >
                  {stop.order || idx + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                      {stop.farmer_name}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#EA580C', fontWeight: 700 }}>
                      {stop.quantity_kg} kg
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {stop.village}, {stop.district} • Lot: {stop.lot_code}
                  </div>
                </div>
              </div>
            ))}

            {/* Destination Hub */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#10B981',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.72rem',
                  flexShrink: 0,
                }}
              >
                <MapPin size={12} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#065F46' }}>
                    {run.destination_hub}
                  </span>
                  <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
                    DESTINATION
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 600 }}>
                  Total Payload: {run.current_payload_kg} kg
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginTop: 'auto' }}>
            <button
              onClick={handleSendSms}
              disabled={smsSent}
              className="tap-target btn-primary"
              style={{ gap: '0.35rem', fontSize: '0.82rem', minHeight: '36px' }}
            >
              <MessageSquare size={14} />
              <span>{smsSent ? '✓ Dispatched' : 'SMS Route to Driver'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="tap-target btn-secondary"
              style={{ gap: '0.35rem', fontSize: '0.82rem', minHeight: '36px' }}
            >
              <Printer size={14} />
              <span>Print Manifest</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enlarged QR Modal */}
      {showManifestModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div className="glass-card" style={{ maxWidth: '380px', width: '100%', textAlign: 'center', background: '#FFFFFF', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Digital Gate-Pass QR Code
              </h3>
              <button
                type="button"
                onClick={() => setShowManifestModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Scan at Highway Patrol & Processing Plant Checkpoint
            </p>

            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Enlarged QR"
                style={{
                  width: '200px',
                  height: '200px',
                  margin: '0 auto 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              />
            )}

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
              RUN: {displayRunId} • VEHICLE: {run.vehicle_registration}
            </div>

            <button
              onClick={() => setShowManifestModal(false)}
              className="tap-target btn-secondary"
              style={{ width: '100%', fontSize: '0.82rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
