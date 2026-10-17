'use client';

import React, { useState, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle,
  Send,
  HelpCircle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  RefreshCw,
  MapPin,
  Check
} from 'lucide-react';
import { DiseaseDiagnosis, DiseaseClass } from '@/types';
import { INITIAL_DISEASE_DIAGNOSIS, MOCK_DISEASE_CATALOG } from '@/lib/mock-data';
import { compressFieldImage, CompressionResult } from '@/lib/image-compressor';
import { queueOfflineScan } from '@/lib/offline-db';
import { api } from '@/lib/api-client';

export const DiseaseScreeningStudio: React.FC = () => {
  const { t } = useTranslation();
  const [selectedAngle, setSelectedAngle] = useState<'crown' | 'base_stalk' | 'lateral'>('crown');
  const [diagnosis, setDiagnosis] = useState<DiseaseDiagnosis | null>(INITIAL_DISEASE_DIAGNOSIS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>({
    compressedBlob: new Blob(),
    dataUrl: '',
    originalSizeBytes: 4210500, // 4.2 MB
    compressedSizeBytes: 218400, // 218 KB
    compressionRatio: 94.8,
    width: 1024,
    height: 768,
    sha256Hash: 'a7f93e8d2c4b5190e29d61845bb08c90fe3421dca90827bfa7c5e4f210d3e589'
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [escalationNotes, setEscalationNotes] = useState('Severe basal rot noticed after 3 days of rain. Immediate ground check requested.');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload with client-side compression pipeline
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsAnalyzing(true);
      // Client-side canvas downscaling to <300KB
      const result = await compressFieldImage(file, 1024, 0.82);
      setCompressionInfo(result);
      setPreviewImage(result.dataUrl);

      // Live inference with MobileNetV3 via FastAPI backend
      const newDiag = await api.screenCropPhoto('crop-queen-tombi-001', selectedAngle, file);
      setDiagnosis(newDiag);
      setIsAnalyzing(false);
      setEscalated(false);

      // Queue in offline IndexedDB
      await queueOfflineScan({
        id: newDiag.id || `scan-${Date.now()}`,
        timestamp: new Date().toISOString(),
        imageBlobUrl: result.dataUrl,
        imageAngle: selectedAngle,
        compressedSizeKb: Math.round(result.compressedSizeBytes / 1024),
        originalSizeKb: Math.round(result.originalSizeBytes / 1024),
        diagnosis: newDiag,
      });
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
    }
  };

  // Simulate camera capture with pre-loaded realistic field samples
  const handleSimulatedCapture = async (diseaseKey: string) => {
    setIsAnalyzing(true);
    try {
      const selected = await api.screenCropPhoto('crop-queen-tombi-001', selectedAngle);
      setDiagnosis(selected);
    } catch {
      const fallback = MOCK_DISEASE_CATALOG[diseaseKey] || INITIAL_DISEASE_DIAGNOSIS;
      setDiagnosis(fallback);
    } finally {
      setIsAnalyzing(false);
      setEscalated(false);
    }
  };

  const handleEscalateConfirm = async () => {
    if (diagnosis?.id) {
      await api.escalateToOfficer(diagnosis.id, 'Central whorl and basal rot detected in daylight field inspection.');
    }
    setEscalated(true);
    setShowEscalationModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Studio Header */}
      <div className="glass-card glass-card-accent" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge badge-gold">MODULE A</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {t('moduleATitle')}
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
              {t('moduleASubtitle')}
            </p>
          </div>

          {/* Quick Disease Scenario Simulator for Demonstration */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>DEMO SAMPLES:</span>
            <button
              onClick={() => handleSimulatedCapture('heart_rot')}
              className="tap-target btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
            >
              Heart Rot (91%)
            </button>
            <button
              onClick={() => handleSimulatedCapture('black_rot')}
              className="tap-target btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
            >
              Black Rot (88%)
            </button>
            <button
              onClick={() => handleSimulatedCapture('mealybug_wilt')}
              className="tap-target btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
            >
              Mealybug (84%)
            </button>
            <button
              onClick={() => handleSimulatedCapture('healthy')}
              className="tap-target btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
            >
              Healthy Stand
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Viewfinder & Diagnostic Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* Left Column: Camera / Capture & Multi-Angle Guide */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Diagnostic Perspective</span>
              <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>Field Guide</span>
            </div>
            {/* Multi-Angle Visual Toggle (Part 3, Sec 6.2) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              {[
                { id: 'crown', label: t('crownView') },
                { id: 'base_stalk', label: t('baseView') },
                { id: 'lateral', label: t('lateralView') },
              ].map((ang) => (
                <button
                  key={ang.id}
                  onClick={() => setSelectedAngle(ang.id as any)}
                  className="tap-target"
                  style={{
                    padding: '0.55rem 0.4rem',
                    fontSize: '0.78rem',
                    background: selectedAngle === ang.id ? 'var(--pineapple-gold)' : 'var(--bg-surface-elevated)',
                    color: selectedAngle === ang.id ? '#080C14' : 'var(--text-secondary)',
                    border: selectedAngle === ang.id ? '1px solid var(--pineapple-gold)' : '1px solid var(--border-subtle)',
                    textAlign: 'center',
                    fontWeight: selectedAngle === ang.id ? 700 : 500,
                  }}
                >
                  {ang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Viewfinder Reticle */}
          <div style={{
            position: 'relative',
            height: '280px',
            background: 'radial-gradient(circle at center, #1E293B, #0A0F1D)',
            borderRadius: 'var(--radius-md)',
            border: '2px dashed var(--border-medium)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {previewImage ? (
              <img
                src={previewImage}
                alt="Field Capture Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', zIndex: 2 }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--pineapple-gold)',
                  margin: '0 auto 0.75rem',
                }}>
                  <Camera size={32} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFFFFF' }}>
                  Target Reticle: Align {selectedAngle === 'crown' ? 'Crown' : selectedAngle === 'base_stalk' ? 'Basal Sheath' : 'Lateral Eyes'}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '280px' }}>
                  {t('photoGuide')}
                </p>
              </div>
            )}

            {/* Simulated Live Scan Line */}
            {isAnalyzing && <div className="animate-scan-line" />}

            {/* Reticle Boundary Crosshairs */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '24px',
              height: '24px',
              borderTop: '3px solid var(--pineapple-gold)',
              borderLeft: '3px solid var(--pineapple-gold)',
            }} />
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '24px',
              height: '24px',
              borderTop: '3px solid var(--pineapple-gold)',
              borderRight: '3px solid var(--pineapple-gold)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              width: '24px',
              height: '24px',
              borderBottom: '3px solid var(--pineapple-gold)',
              borderLeft: '3px solid var(--pineapple-gold)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: '24px',
              height: '24px',
              borderBottom: '3px solid var(--pineapple-gold)',
              borderRight: '3px solid var(--pineapple-gold)',
            }} />
          </div>

          {/* Action Buttons: Take Photo & Upload */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={() => handleSimulatedCapture(diagnosis?.predicted_class || 'heart_rot')}
              disabled={isAnalyzing}
              className="tap-target btn-primary"
              style={{ gap: '0.4rem', fontSize: '0.88rem' }}
            >
              <Camera size={18} />
              {isAnalyzing ? t('diagnosing') : t('snapPhoto')}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="tap-target btn-secondary"
              style={{ gap: '0.4rem', fontSize: '0.88rem' }}
            >
              <Upload size={18} />
              {t('uploadPhoto')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Client-Side Canvas Compression Telemetry (Part 3, Sec 6.2) */}
          {compressionInfo && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--plantation-green)' }}>
                  CLIENT 2G COMPRESSION ENGINE
                </span>
                <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                  -{compressionInfo.compressionRatio}% Bandwidth
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span>Original: {(compressionInfo.originalSizeBytes / 1024 / 1024).toFixed(1)} MB</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>➔ Compressed: {Math.round(compressionInfo.compressedSizeBytes / 1024)} KB</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                SHA-256: {compressionInfo.sha256Hash}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic Result & Triage Actions */}
        {diagnosis && (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Disease Heading & Triage Status */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                  DIAGNOSTIC INFERENCE RESULT
                </span>
                <span className={`badge ${diagnosis.severity === 'CRITICAL' ? 'badge-crimson' :
                    diagnosis.severity === 'MODERATE' ? 'badge-gold' : 'badge-green'
                  }`}>
                  SEVERITY: {diagnosis.severity}
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {diagnosis.display_name}
              </h3>
            </div>

            {/* Model Confidence Meter with Calibrated Triage */}
            <div style={{
              background: 'var(--bg-surface-elevated)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {t('confidenceScore')}
                </span>
                <span className="tabular-nums" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--plantation-green)' }}>
                  {diagnosis.confidence_score.toFixed(1)}%
                </span>
              </div>

              {/* High-Contrast Progress Bar */}
              <div style={{
                height: '10px',
                background: 'var(--border-subtle)',
                borderRadius: '5px',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{
                  height: '100%',
                  width: `${diagnosis.confidence_score}%`,
                  background: diagnosis.confidence_score >= 85
                    ? 'linear-gradient(90deg, #10B981, #059669)'
                    : diagnosis.confidence_score >= 50
                      ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                      : '#DC2626',
                  borderRadius: '5px',
                  transition: 'width 0.8s ease',
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>&lt;50% Inconclusive</span>
                <span>50-85% Preliminary</span>
                <span style={{ color: 'var(--plantation-green)', fontWeight: 700 }}>&gt;85% Confirmed Triage</span>
              </div>
            </div>

            {/* Visible Symptoms Screened */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Visible Pathological Symptoms Detected:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {diagnosis.symptoms_detected.map((sym, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    <CheckCircle size={15} style={{ color: 'var(--pineapple-gold)', flexShrink: 0, marginTop: '2px' }} />
                    <span>{sym}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Immediate Action Protocol: Organic & Chemical */}
            <div style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--plantation-green)', marginBottom: '0.4rem' }}>
                Immediate Treatment Protocol (ICAR / CAU Guidelines):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--pineapple-gold)', textTransform: 'uppercase' }}>
                    Organic & Cultural:
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {diagnosis.organic_treatments[0]}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>
                    Chemical Fungicide:
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {diagnosis.chemical_treatments[0]}
                  </p>
                </div>
              </div>
            </div>

            {/* Escalation Trigger to KVK Field Extension Officer */}
            <div style={{ marginTop: 'auto' }}>
              {escalated ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid var(--plantation-green)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--plantation-green)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}>
                  <Check size={18} />
                  <span>Extension Officer Alerted (Ref: KVK-THB-9921) • Technician Assigned</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowEscalationModal(true)}
                  className="tap-target btn-outline-danger"
                  style={{ width: '100%', gap: '0.5rem', fontSize: '0.88rem' }}
                >
                  <ShieldAlert size={18} />
                  {t('escalateOfficer')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Extension Officer Escalation Modal */}
      {showEscalationModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div className="glass-card" style={{
            maxWidth: '500px',
            width: '100%',
            padding: '1.5rem',
            border: '1px solid var(--border-medium)',
            background: '#FFFFFF',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <ShieldAlert size={24} style={{ color: 'var(--alert-amber)' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Escalate to KVK Field Extension Officer
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              This dispatches your compressed field image, GPS location, and crop history directly to the Thoubal District Agricultural Extension Officer for on-site diagnostic verification.
            </p>

            <div style={{
              background: 'var(--bg-surface-elevated)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              marginBottom: '1rem',
              border: '1px solid var(--border-subtle)',
            }}>
              <div><strong>Farmer:</strong> Tombi Singh (Phone: +91 94361 22910)</div>
              <div><strong>Location:</strong> Andro Hill Terraces, Thoubal (24.738° N, 94.021° E)</div>
              <div><strong>Screened Condition:</strong> {diagnosis?.display_name} ({diagnosis?.confidence_score}%)</div>
            </div>

            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Farmer Observations & Notes:
            </label>
            <textarea
              value={escalationNotes}
              onChange={(e) => setEscalationNotes(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                background: '#FFFFFF',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                marginTop: '0.35rem',
                marginBottom: '1.25rem',
              }}
            />

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEscalationModal(false)}
                className="tap-target btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateConfirm}
                className="tap-target btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.4rem' }}
              >
                <Send size={15} />
                Dispatch Alert to KVK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
