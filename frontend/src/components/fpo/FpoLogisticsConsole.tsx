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
  CheckCircle,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Console Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          background: '#FFFFFF',
          border: '1px solid #F1E4D8',
          borderRadius: '8px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="badge badge-orange" style={{ fontSize: '11px', fontWeight: 600 }}>
              FPO LOGISTICS
            </span>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#21170F' }}>
              Collective Logistics & Route Dispatch
            </h1>
          </div>
          <p style={{ color: '#6E5A4A', fontSize: '13px', marginTop: '0.25rem' }}>
            Consolidating smallholder harvest lots into ≥75% saturated transit payloads.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-slate" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>
            RUN: {displayRunId}
          </span>
          <span className="badge badge-orange" style={{ fontSize: '12px', fontWeight: 600 }}>
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: '#FFFFFF',
            border: '1px solid #F1E4D8',
            borderRadius: '8px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#21170F' }}>
              Vehicle Saturation Meter
            </span>
            <span
              className={`badge ${run.capacity_fill_pct >= 75 ? 'badge-orange' : 'badge-slate'}`}
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              <span className={`pulse-dot ${run.capacity_fill_pct >= 75 ? 'pulse-dot-orange' : ''}`} />
              {run.capacity_fill_pct}% Full ({run.capacity_fill_pct >= 75 ? 'Pass' : 'Below 75% gate'})
            </span>
          </div>

          {/* Vehicle Info Box */}
          <div
            style={{
              background: '#FFF5ED',
              padding: '0.85rem 1rem',
              borderRadius: '6px',
              border: '1px solid #F1E4D8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Truck size={22} style={{ color: '#21170F', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#21170F' }}>
                  {run.vehicle_type}
                </div>
                <div style={{ fontSize: '12px', color: '#6E5A4A' }}>
                  Reg: {run.vehicle_registration} • Driver: {run.driver_name}
                </div>
              </div>
            </div>

            <span className="badge badge-orange" style={{ fontSize: '12px', fontWeight: 600 }}>
              06:30 AM
            </span>
          </div>

          {/* Saturation Progress */}
          <div
            style={{
              background: '#FFF5ED',
              padding: '0.85rem 1rem',
              borderRadius: '6px',
              border: '1px solid #F1E4D8',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '13px', color: '#4A3A2E', fontWeight: 600 }}>
                Consolidated Payload
              </span>
              <span className="tabular-nums" style={{ fontSize: '15px', fontWeight: 700, color: '#FB923C' }}>
                {run.current_payload_kg} kg <span style={{ fontSize: '12px', color: '#6E5A4A', fontWeight: 400 }}>/ {run.vehicle_capacity_kg} kg</span>
              </span>
            </div>

            <div style={{ height: '8px', background: '#F1E4D8', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  width: `${run.capacity_fill_pct}%`,
                  background: '#FB923C',
                  borderRadius: '4px',
                  transition: 'width 0.6s ease',
                }}
              />
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '75%', width: '2px', background: '#21170F' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '12px', color: '#6E5A4A' }}>
              <span>0 kg</span>
              <span style={{ color: '#FB923C', fontWeight: 600 }}>75% Target Gate</span>
              <span>{run.vehicle_capacity_kg} kg</span>
            </div>
          </div>

          {/* 3 Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div style={{ background: '#FFF5ED', borderRadius: '6px', border: '1px solid #F1E4D8', padding: '0.65rem', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#6E5A4A', fontWeight: 600 }}>STOPS</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#21170F', marginTop: '0.1rem' }}>
                {stops.length} Lots
              </div>
            </div>

            <div style={{ background: '#FFF5ED', borderRadius: '6px', border: '1px solid #F1E4D8', padding: '0.65rem', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#6E5A4A', fontWeight: 600 }}>SAVINGS</div>
              <div className="tabular-nums" style={{ fontSize: '16px', fontWeight: 700, color: '#F97316', marginTop: '0.1rem' }}>
                +₹{run.cost_savings_per_kg.toFixed(2)}/kg
              </div>
            </div>

            <div style={{ background: '#FFF5ED', borderRadius: '6px', border: '1px solid #F1E4D8', padding: '0.65rem', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#6E5A4A', fontWeight: 600 }}>HUB</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FB923C', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Nilakuthi
              </div>
            </div>
          </div>

          {/* Digital Gate Pass Card */}
          <div
            style={{
              background: '#FFF5ED',
              border: '1px solid #F1E4D8',
              borderRadius: '6px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginTop: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Transit Gate Pass QR"
                  style={{ width: '48px', height: '48px', borderRadius: '4px', border: '1px solid #E5D2C2' }}
                />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#21170F' }}>
                  Digital Transit Gate-Pass
                </div>
                <div style={{ fontSize: '12px', color: '#6E5A4A', fontFamily: 'var(--font-mono)' }}>
                  TOKEN: {run.digital_gate_pass_token.slice(0, 14)}...
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowManifestModal(true)}
              className="tap-target btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '13px', minHeight: '38px', fontWeight: 600 }}
            >
              <QrCode size={14} style={{ marginRight: '0.3rem' }} />
              QR Pass
            </button>
          </div>
        </div>

        {/* Right Column: Route Stops Timeline & Actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: '#FFFFFF',
            border: '1px solid #F1E4D8',
            borderRadius: '8px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#21170F' }}>
              Pickup Route Timeline
            </span>
            <span className="badge badge-orange" style={{ fontSize: '12px', fontWeight: 600 }}>
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
                  padding: '0.75rem 0.95rem',
                  borderRadius: '6px',
                  background: '#FFF5ED',
                  border: '1px solid #F1E4D8',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#6E5A4A',
                    width: '24px',
                    flexShrink: 0,
                  }}
                >
                  0{stop.order || idx + 1}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#21170F' }}>
                      {stop.farmer_name}
                    </span>
                    <span style={{ fontSize: '13px', color: '#FB923C', fontWeight: 700 }}>
                      {stop.quantity_kg} kg
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6E5A4A' }}>
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
                padding: '0.75rem 0.95rem',
                borderRadius: '6px',
                background: 'var(--accent-green-light)',
                border: '1px solid var(--accent-green-border)',
              }}
            >
              <MapPin size={16} style={{ color: '#F97316', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#F97316' }}>
                    {run.destination_hub}
                  </span>
                  <span className="badge badge-orange" style={{ fontSize: '12px', fontWeight: 600 }}>
                    DESTINATION
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#F97316', fontWeight: 600 }}>
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
              style={{ gap: '0.4rem', fontSize: '13px', minHeight: '40px', fontWeight: 600 }}
            >
              {smsSent ? (
                <>
                  <CheckCircle size={14} />
                  <span>Route Dispatched</span>
                </>
              ) : (
                <>
                  <MessageSquare size={14} />
                  <span>SMS Route to Driver</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="tap-target btn-secondary"
              style={{ gap: '0.4rem', fontSize: '13px', minHeight: '40px', fontWeight: 600 }}
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
          <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center', background: '#FFFFFF', padding: '1.5rem', border: '1px solid #F1E4D8', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#21170F' }}>
                Digital Gate-Pass QR Code
              </h3>
              <button
                type="button"
                onClick={() => setShowManifestModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6E5A4A' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#6E5A4A', marginBottom: '1rem' }}>
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
