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
  Check,
  Cpu,
  Layers,
  Activity,
  Zap,
  Info
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
  const [activeRemedyTab, setActiveRemedyTab] = useState<'organic' | 'chemical' | 'cultural'>('organic');
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
  const [escalationNotes, setEscalationNotes] = useState('Severe basal rot noticed after 3 days of heavy rain in Andro. Immediate ground inspection requested.');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload with client-side compression pipeline
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsAnalyzing(true);
      const result = await compressFieldImage(file, 1024, 0.82);
      setCompressionInfo(result);
      setPreviewImage(result.dataUrl);

      const newDiag = await api.screenCropPhoto('crop-queen-tombi-001', selectedAngle, file);
      setDiagnosis(newDiag);
      setIsAnalyzing(false);
      setEscalated(false);

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
      await api.escalateToOfficer(diagnosis.id, escalationNotes);
    }
    setEscalated(true);
    setShowEscalationModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Studio Header */}
      <div className="glass-card glass-card-accent" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge badge-orange">MODULE A</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                AI Vision Disease & Triage Studio
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Edge-optimized MobileNetV3 diagnostic inference with 2G client compression (&lt;300KB) and ICAR/CAU triage protocols.
            </p>
          </div>

          {/* Quick Disease Scenario Simulator Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              SAMPLE PRESETS:
            </span>
            <button
              onClick={() => handleSimulatedCapture('heart_rot')}
              className="tap-target"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                borderRadius: 'var(--radius-full)',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontWeight: 700,
                minHeight: '34px',
              }}
            >
              Heart Rot (91%)
            </button>
            <button
              onClick={() => handleSimulatedCapture('black_rot')}
              className="tap-target"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                borderRadius: 'var(--radius-full)',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontWeight: 700,
                minHeight: '34px',
              }}
            >
              Black Rot (88%)
            </button>
            <button
              onClick={() => handleSimulatedCapture('mealybug_wilt')}
              className="tap-target"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                borderRadius: 'var(--radius-full)',
                background: '#FFF7ED',
                border: '1px solid #FDBA74',
                color: '#EA580C',
                fontWeight: 700,
                minHeight: '34px',
              }}
            >
              Mealybug (84%)
            </button>
            <button
              onClick={() => handleSimulatedCapture('healthy')}
              className="tap-target"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                borderRadius: 'var(--radius-full)',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#059669',
                fontWeight: 700,
                minHeight: '34px',
              }}
            >
              Healthy Stand (97%)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Viewfinder & Diagnostic Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Left Column: Camera / Capture & Multi-Angle Guide */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                Target Diagnostic Angle
              </span>
              <span className="badge badge-slate" style={{ fontSize: '0.68rem' }}>
                Reticle Perspective
              </span>
            </div>

            {/* Multi-Angle Visual Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' }}>
              {[
                { id: 'crown', label: 'Crown Whorl', sub: 'Basal rot' },
                { id: 'base_stalk', label: 'Basal Sheath', sub: 'Root collar' },
                { id: 'lateral', label: 'Lateral Eyes', sub: 'Fruit borer' },
              ].map((ang) => (
                <button
                  key={ang.id}
                  onClick={() => setSelectedAngle(ang.id as any)}
                  className="tap-target"
                  style={{
                    padding: '0.55rem 0.4rem',
                    flexDirection: 'column',
                    gap: '0.1rem',
                    fontSize: '0.8rem',
                    background: selectedAngle === ang.id ? '#FFF7ED' : '#FAFAF9',
                    color: selectedAngle === ang.id ? '#EA580C' : 'var(--text-secondary)',
                    border: selectedAngle === ang.id ? '1.5px solid #F97316' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    fontWeight: selectedAngle === ang.id ? 800 : 500,
                    minHeight: '48px',
                  }}
                >
                  <span>{ang.label}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{ang.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clean Camera Viewfinder Reticle */}
          <div style={{
            position: 'relative',
            height: '280px',
            background: 'radial-gradient(circle at center, #1E293B, #0F172A)',
            borderRadius: 'var(--radius-md)',
            border: '2px dashed #FDBA74',
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
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(249, 115, 22, 0.15)',
                  border: '1px solid rgba(249, 115, 22, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F97316',
                  margin: '0 auto 0.75rem',
                }}>
                  <Camera size={30} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF' }}>
                  Target: Align {selectedAngle === 'crown' ? 'Crown Whorl' : selectedAngle === 'base_stalk' ? 'Basal Sheath' : 'Lateral Fruit Eyes'}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.25rem', maxWidth: '280px' }}>
                  Hold camera 15-20cm from crop in natural light. Edge AI checks for water-soaked lesions and fungal exudate.
                </p>
              </div>
            )}

            {/* Simulated Live Laser Scan Line */}
            {isAnalyzing && <div className="animate-scan-line" />}

            {/* Reticle Boundary Crosshairs in Orange */}
            <div style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              width: '24px',
              height: '24px',
              borderTop: '3px solid #F97316',
              borderLeft: '3px solid #F97316',
            }} />
            <div style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              width: '24px',
              height: '24px',
              borderTop: '3px solid #F97316',
              borderRight: '3px solid #F97316',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '14px',
              left: '14px',
              width: '24px',
              height: '24px',
              borderBottom: '3px solid #F97316',
              borderLeft: '3px solid #F97316',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '14px',
              right: '14px',
              width: '24px',
              height: '24px',
              borderBottom: '3px solid #F97316',
              borderRight: '3px solid #F97316',
            }} />
          </div>

          {/* Action Buttons: Take Photo & Upload */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={() => handleSimulatedCapture(diagnosis?.predicted_class || 'heart_rot')}
              disabled={isAnalyzing}
              className="tap-target btn-primary"
              style={{ gap: '0.45rem', fontSize: '0.88rem' }}
            >
              <Camera size={18} />
              {isAnalyzing ? 'Scanning...' : 'Capture Photo'}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="tap-target btn-secondary"
              style={{ gap: '0.45rem', fontSize: '0.88rem' }}
            >
              <Upload size={18} />
              Upload Image
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

          {/* Client-Side Canvas Compression Telemetry */}
          {compressionInfo && (
            <div style={{
              background: '#FFF7ED',
              border: '1px solid #FDBA74',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 0.95rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#EA580C', letterSpacing: '0.04em' }}>
                  2G CLIENT COMPRESSION ENGINE
                </span>
                <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>
                  -{compressionInfo.compressionRatio}% Bandwidth
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Raw: {(compressionInfo.originalSizeBytes / 1024 / 1024).toFixed(1)} MB</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Compressed: {Math.round(compressionInfo.compressedSizeBytes / 1024)} KB</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                SHA-256: {compressionInfo.sha256Hash}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic Result & Triage Actions */}
        {diagnosis && (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Disease Heading & Triage Status */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span className="badge badge-slate" style={{ fontSize: '0.68rem' }}>
                  DIAGNOSTIC INFERENCE RESULT
                </span>
                <span className={`badge ${
                  diagnosis.severity === 'CRITICAL' ? 'badge-crimson' :
                  diagnosis.severity === 'MODERATE' ? 'badge-orange' : 'badge-green'
                }`}>
                  SEVERITY: {diagnosis.severity}
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {diagnosis.display_name}
              </h3>
            </div>

            {/* Model Confidence Meter */}
            <div style={{
              background: '#FAFAF9',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Model Confidence
                </span>
                <span className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 900, color: '#059669' }}>
                  {diagnosis.confidence_score.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{
                height: '8px',
                background: '#E4E4E7',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{
                  height: '100%',
                  width: `${diagnosis.confidence_score}%`,
                  background: diagnosis.confidence_score >= 85
                    ? '#10B981'
                    : diagnosis.confidence_score >= 50
                      ? '#F97316'
                      : '#EF4444',
                  borderRadius: '4px',
                  transition: 'width 0.8s ease',
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>&lt;50% Inconclusive</span>
                <span>50-85% Preliminary</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>&gt;85% Confirmed</span>
              </div>
            </div>

            {/* Symptoms Detected */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                Pathological Biomarkers Detected:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {diagnosis.symptoms_detected.map((sym, idx) => (
                  <li key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    background: '#FAFAF9',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <CheckCircle size={15} style={{ color: '#F97316', flexShrink: 0, marginTop: '2px' }} />
                    <span>{sym}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Treatment Protocol Tabs: Organic / Chemical */}
            <div style={{
              background: '#FAFAF9',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.95rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  ICAR / CAU Guidelines:
                </span>

                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button
                    onClick={() => setActiveRemedyTab('organic')}
                    style={{
                      padding: '0.2rem 0.55rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-sm)',
                      background: activeRemedyTab === 'organic' ? '#10B981' : 'transparent',
                      color: activeRemedyTab === 'organic' ? '#FFFFFF' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Organic
                  </button>
                  <button
                    onClick={() => setActiveRemedyTab('chemical')}
                    style={{
                      padding: '0.2rem 0.55rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-sm)',
                      background: activeRemedyTab === 'chemical' ? '#EA580C' : 'transparent',
                      color: activeRemedyTab === 'chemical' ? '#FFFFFF' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Chemical
                  </button>
                </div>
              </div>

              {activeRemedyTab === 'organic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                    Bio-Control & Soil Amendment:
                  </span>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {diagnosis.organic_treatments[0] || 'Apply Trichoderma harzianum @ 10g/L around root zone and enhance ridge drainage to prevent stagnant water.'}
                  </p>
                </div>
              )}

              {activeRemedyTab === 'chemical' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase' }}>
                    Chemical Fungicide (Severe):
                  </span>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {diagnosis.chemical_treatments[0] || 'Foliar spray and basal drenching with Metalaxyl-M + Mancozeb (Ridomil MZ @ 2g/L) at 15-day intervals.'}
                  </p>
                </div>
              )}
            </div>

            {/* Officer Escalation Action */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
              <button
                onClick={() => setShowEscalationModal(true)}
                disabled={escalated}
                className="tap-target btn-outline-danger"
                style={{ flex: 1, gap: '0.45rem', fontSize: '0.85rem' }}
              >
                <ShieldAlert size={16} />
                {escalated ? 'Escalated to District Officer' : 'Escalate to District Officer'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Escalation Modal */}
      {showEscalationModal && (
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
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '1.5rem', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Escalate to District Horticulture Officer
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Broadcasts immediate SMS/WhatsApp alert with GPS coordinates to the Thoubal District Agriculture Office for field verification.
            </p>

            <textarea
              value={escalationNotes}
              onChange={(e) => setEscalationNotes(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: '#FAFAF9',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                resize: 'none',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setShowEscalationModal(false)}
                className="tap-target btn-secondary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateConfirm}
                className="tap-target btn-primary"
                style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
