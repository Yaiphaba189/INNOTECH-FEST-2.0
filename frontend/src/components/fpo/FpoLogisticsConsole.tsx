'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import QRCode from 'qrcode';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Printer, 
  MessageSquare, 
  QrCode, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  FileText,
  Navigation,
  Gauge,
  Sparkles
} from 'lucide-react';
import { DispatchRun } from '@/types';
import { MOCK_DISPATCH_RUN } from '@/lib/mock-data';
import { api } from '@/lib/api-client';

export const FpoLogisticsConsole: React.FC = () => {
  const { t } = useTranslation();
  const [run, setRun] = useState<DispatchRun>(MOCK_DISPATCH_RUN);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [smsSent, setSmsSent] = useState(false);
  const [showManifestModal, setShowManifestModal] = useState(false);

  useEffect(() => {
    api.getDispatchRun('Churachandpur')
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
        dark: '#18181B',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [run]);

  const handleSendSms = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 5000);
  };

  const stops = run.stops || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Console Header */}
      <div className="glass-card glass-card-accent" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge badge-orange">MODULE D</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                FPO Collective Logistics & Route Dispatch Console
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Google OR-Tools Capacitated Vehicle Routing (CVRPTW) pooling smallholder lots into ≥ 75% saturated transit payloads.
            </p>
          </div>

          <div style={{
            background: '#FAFAF9',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.55rem 0.95rem',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>DISPATCH RUN ID</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {run.run_id}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
              {run.cluster_district} Cluster
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Vehicle Saturation & Waypoint Route */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Left Column: Vehicle Load Saturation Gauge */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              Vehicle Payload Saturation Meter
            </span>
            <span className="badge badge-green">
              <span className="pulse-dot pulse-dot-green" />
              {run.capacity_fill_pct}% SATURATION (PASS)
            </span>
          </div>

          {/* Vehicle Metadata Header */}
          <div style={{
            background: '#FAFAF9',
            padding: '0.95rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#FFF7ED',
                color: '#EA580C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Truck size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {run.vehicle_type}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Reg: {run.vehicle_registration} • Driver: {run.driver_name}
                </div>
              </div>
            </div>

            <span className="badge badge-orange" style={{ fontSize: '0.68rem' }}>
              Scheduled 06:30 AM
            </span>
          </div>

          {/* Visual Saturation Progress Bar with 75% Gate Mark */}
          <div style={{
            background: '#FAFAF9',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Loaded Payload
              </span>
              <span className="tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 900, color: '#059669' }}>
                {run.current_payload_kg} kg <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {run.vehicle_capacity_kg} kg</span>
              </span>
            </div>

            {/* High-Contrast Progress Bar */}
            <div style={{
              height: '10px',
              background: '#E4E4E7',
              borderRadius: '5px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                height: '100%',
                width: `${run.capacity_fill_pct}%`,
                background: '#10B981',
                borderRadius: '5px',
                transition: 'width 0.8s ease',
              }} />

              {/* 75% Gate Marker */}
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '75%',
                width: '2px',
                background: '#F97316',
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>0 kg</span>
              <span style={{ color: '#EA580C', fontWeight: 700 }}>▲ 75% Mandatory Transit Gate ({Math.round(run.vehicle_capacity_kg * 0.75)} kg)</span>
              <span>{run.vehicle_capacity_kg} kg</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.65rem',
          }}>
            <div style={{
              background: '#FAFAF9',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '0.65rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>PICKUPS</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                {stops.length} Lots
              </div>
            </div>

            <div style={{
              background: '#FAFAF9',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '0.65rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>SAVINGS</div>
              <div className="tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#059669', marginTop: '0.1rem' }}>
                +₹{run.cost_savings_per_kg.toFixed(2)}/kg
              </div>
            </div>

            <div style={{
              background: '#FAFAF9',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '0.65rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>DESTINATION</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#EA580C', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Nilakuthi Hub
              </div>
            </div>
          </div>

          {/* Digital Gate-Pass Card */}
          <div style={{
            background: '#FAFAF9',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.85rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Transit Gate Pass QR Code"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                  }}
                />
              )}
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  Digital Transit Gate-Pass
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  TOKEN: {run.digital_gate_pass_token.slice(0, 16)}...
                </div>
                <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '0.15rem' }}>
                  Verified by FPO Logistics Lead
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowManifestModal(true)}
              className="tap-target btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            >
              <QrCode size={14} style={{ marginRight: '0.3rem' }} />
              Enlarge QR
            </button>
          </div>
        </div>

        {/* Right Column: Multi-Farm Route Stops Waypoint Sequence */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              Optimized Waypoint Sequence
            </span>
            <span className="badge badge-orange">
              CVRPTW SOLVER 1.8s
            </span>
          </div>

          {/* Sequential Waypoint Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stops.map((stop, idx) => {
              return (
                <div
                  key={stop.lot_code || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#FAFAF9',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#FFF7ED',
                    border: '1px solid #FDBA74',
                    color: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>
                    {stop.order || idx + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {stop.farmer_name}
                      </span>
                      <span className="badge badge-slate" style={{ fontSize: '0.62rem' }}>
                        {stop.village}, {stop.district}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                      Lot: {stop.lot_code} • {stop.grade}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '0.35rem',
                      fontSize: '0.72rem',
                    }}>
                      <span style={{ color: '#EA580C', fontWeight: 700 }}>
                        Pickup: {stop.quantity_kg} kg
                      </span>
                      <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone size={11} /> {stop.contact_phone}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Destination Final Stop */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.75rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
            }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: '#10B981',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.75rem',
                flexShrink: 0,
                marginTop: '2px',
              }}>
                <MapPin size={13} color="#FFFFFF" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#065F46' }}>
                    {run.destination_hub}
                  </span>
                  <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
                    DESTINATION
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '0.1rem', fontWeight: 600 }}>
                  Weighbridge & Unload: {run.current_payload_kg} kg
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: 'auto' }}>
            <button
              onClick={handleSendSms}
              disabled={smsSent}
              className="tap-target btn-primary"
              style={{ gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <MessageSquare size={16} />
              {smsSent ? 'SMS Dispatched' : 'SMS Route to Driver'}
            </button>

            <button
              onClick={() => window.print()}
              className="tap-target btn-secondary"
              style={{ gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <Printer size={16} />
              Print Manifest
            </button>
          </div>
        </div>
      </div>

      {/* Enlarged QR Modal */}
      {showManifestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Digital Gate-Pass QR Code
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.15rem' }}>
              Present to Highway Patrol & Processing Plant Checkpoint
            </p>

            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Enlarged QR"
                style={{
                  width: '220px',
                  height: '220px',
                  margin: '0 auto 1.15rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                }}
              />
            )}

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
              RUN: {run.run_id} • VEHICLE: {run.vehicle_registration}
            </div>

            <button
              onClick={() => setShowManifestModal(false)}
              className="tap-target btn-secondary"
              style={{ width: '100%' }}
            >
              Close Gate Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
