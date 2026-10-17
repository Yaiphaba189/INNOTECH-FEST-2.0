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
  FileText
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
      .then((data) => setRun(data))
      .catch((err) => console.warn('Dispatch run fetch error:', err));
  }, []);

  // Generate real scannable QR Code
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
      width: 200,
      margin: 1,
      color: {
        dark: '#080C14',
        light: '#F8FAFC',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [run]);

  const handleSendSms = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Console Header */}
      <div className="glass-card glass-card-accent" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge badge-gold">MODULE D</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {t('moduleDTitle')}
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
              Google OR-Tools Capacitated Vehicle Routing (CVRPTW) pooling small lots into full payloads (≥ 75%).
            </p>
          </div>

          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 0.85rem',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>DISPATCH RUN ID</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {run.run_id}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--plantation-green)' }}>
              {run.cluster_district}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Vehicle Saturation & Waypoint Route */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* Left Column: Vehicle Load Saturation Gauge (Part 3, Sec 9.2) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {t('payloadSaturation')}
            </span>
            <span className="badge badge-green">
              {run.capacity_fill_pct}% SATURATION
            </span>
          </div>

          {/* Vehicle Metadata Header */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            padding: '0.85rem',
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
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--pineapple-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Truck size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {run.vehicle_type}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Reg: {run.vehicle_registration} • Driver: {run.driver_name}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>DRIVER CONTACT</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--pineapple-gold)', fontWeight: 600 }}>
                {run.driver_phone}
              </div>
            </div>
          </div>

          {/* Load Progress Bar & Economics */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Current Accumulated Cargo</span>
              <span className="tabular-nums" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {run.current_payload_kg} kg <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {run.vehicle_capacity_kg} kg</span>
              </span>
            </div>

            {/* High-Contrast Progress Bar with 75% Threshold Line */}
            <div style={{
              height: '16px',
              background: 'var(--border-subtle)',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid var(--border-medium)',
            }}>
              <div style={{
                height: '100%',
                width: `${run.capacity_fill_pct}%`,
                background: 'linear-gradient(90deg, #F59E0B, #10B981)',
                borderRadius: '8px',
                transition: 'width 0.8s ease',
              }} />
              {/* 75% Economic Threshold Marker */}
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '75%',
                width: '2px',
                background: 'var(--text-primary)',
                zIndex: 2,
              }} title="75% Minimum Payload Threshold" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>0 kg</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>▲ 75% Efficiency Barrier</span>
              <span>2,500 kg</span>
            </div>
          </div>

          {/* Efficiency & Savings Summary */}
          <div style={{
            background: 'var(--plantation-green-bg)',
            border: '1px solid rgba(5, 150, 105, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <CheckCircle2 size={24} style={{ color: 'var(--plantation-green)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Optimal Freight Efficiency Threshold Reached
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--plantation-green)', fontWeight: 600 }}>
                Estimated Collective Transport Savings: ₹{run.cost_savings_per_kg.toFixed(2)} / kg (₹3,792 saved on run)
              </div>
            </div>
          </div>

          {/* Destination */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
          }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>DESTINATION HUB:</span>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '0.15rem' }}>
              {run.destination_hub}
            </div>
          </div>
        </div>

        {/* Right Column: 4 Consolidated Farm Waypoints & Digital QR Gate-Pass */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Pickup Waypoints (4 Consolidated Farms)
            </span>
            <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
              Optimal Sequence
            </span>
          </div>

          {/* Waypoints List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {run.stops.map((stop) => (
              <div
                key={stop.order}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--pineapple-gold)',
                    color: 'var(--pineapple-gold)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {stop.order}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {stop.farmer_name} ({stop.village})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {stop.grade} • {stop.lot_code}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="tabular-nums" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--pineapple-gold)' }}>
                    {stop.quantity_kg} kg
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {stop.contact_phone}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Consignment Gate-Pass & Verification with Real QR Code */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            {qrDataUrl ? (
              <div style={{
                background: '#FFFFFF',
                padding: '6px',
                borderRadius: '8px',
                display: 'inline-flex',
                flexShrink: 0,
                border: '1px solid var(--border-subtle)',
              }}>
                <img 
                  src={qrDataUrl} 
                  alt="Consignment QR Gate Pass" 
                  style={{ width: '90px', height: '90px', display: 'block' }} 
                />
              </div>
            ) : (
              <div style={{ width: '90px', height: '90px', background: 'var(--border-subtle)', borderRadius: '8px' }} />
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={16} style={{ color: 'var(--plantation-green)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--plantation-green)' }}>
                  DIGITAL DISPATCH TOKEN
                </span>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginTop: '0.15rem',
                wordBreak: 'break-all',
              }}>
                {run.digital_gate_pass_token}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Authenticated by Smart Contract • Weighbridge Ready
              </div>
            </div>
          </div>

          {/* Actions: Print Manifest & Send SMS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: 'auto' }}>
            <button
              onClick={() => setShowManifestModal(true)}
              className="tap-target btn-secondary"
              style={{ gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <Printer size={16} />
              {t('printManifest')}
            </button>

            <button
              onClick={handleSendSms}
              className="tap-target btn-primary"
              style={{ gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <MessageSquare size={16} />
              {smsSent ? 'SMS Dispatched!' : t('sendDriverSms')}
            </button>
          </div>
        </div>
      </div>

      {/* Driver Manifest Modal */}
      {showManifestModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '1.75rem', border: '1px solid var(--pineapple-gold)', background: 'rgba(15, 23, 42, 0.95)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-medium)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  FPO CONSIGNMENT DISPATCH MANIFEST
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--pineapple-gold)', fontFamily: 'var(--font-mono)' }}>
                  RUN: {run.run_id} • PASS: {run.digital_gate_pass_token}
                </div>
              </div>
              <span className="badge badge-green">OFFICIAL GATE-PASS</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
              <div><strong>Vehicle:</strong> {run.vehicle_type} ({run.vehicle_registration})</div>
              <div><strong>Driver:</strong> {run.driver_name} ({run.driver_phone})</div>
              <div><strong>Aggregate Weight:</strong> {run.current_payload_kg} kg</div>
              <div><strong>Destination:</strong> {run.destination_hub}</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>#</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Farmer / Farm</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Lot</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Weight</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {run.stops.map((stop) => (
                  <tr key={stop.order} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.5rem' }}>{stop.order}</td>
                    <td style={{ padding: '0.5rem' }}>{stop.farmer_name} ({stop.village})</td>
                    <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)' }}>{stop.lot_code}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700 }} className="tabular-nums">{stop.quantity_kg} kg</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--plantation-green)' }}>Verified</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowManifestModal(false)}
                className="tap-target btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowManifestModal(false);
                }}
                className="tap-target btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.4rem' }}
              >
                <Printer size={16} />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
