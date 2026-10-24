'use client';

import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  X, 
  Sparkles,
  Camera,
  CalendarDays,
  CircleDollarSign,
  Truck
} from 'lucide-react';
import { UserRole } from '@/types';

interface DemoPitchBarProps {
  onSelectRole: (role: UserRole) => void;
  onSelectModule?: (moduleKey: string) => void;
  onClose: () => void;
}

const PITCH_STEPS = [
  {
    step: 1,
    time: '0:00 - 0:45',
    title: 'Platform Overview & Problem Statement',
    role: 'farmer' as UserRole,
    targetModule: 'overview',
    icon: Sparkles,
    pitchScript: 
      '"Most agri-tech apps fail because they are disconnected point tools. HARVESTLINK AI links the entire horticultural cycle for Manipur\'s pineapple growers: early fungal disease screening, predictive harvest timing, and radical market transparency."',
    metric: 'Churachandpur & Thoubal Clusters'
  },
  {
    step: 2,
    time: '0:45 - 1:45',
    title: 'Module A: Disease Scanner & 2G Compression',
    role: 'farmer' as UserRole,
    targetModule: 'module-a',
    icon: Camera,
    pitchScript: 
      '"Notice our client camera pipeline. It downscales smartphone photos to ~200KB right in the browser, eliminating timeouts on rural 2G hill connections. Here, it diagnoses Phytophthora Heart Rot at 91.4% confidence and delivers ICAR-verified organic remedies plus 1-tap extension officer triage."',
    metric: '91.4% Confidence • <300KB Payload'
  },
  {
    step: 3,
    time: '1:45 - 2:45',
    title: 'Module B: Harvest Radar & Monsoon Risk',
    role: 'farmer' as UserRole,
    targetModule: 'module-b',
    icon: CalendarDays,
    pitchScript: 
      '"Here is our harvest window. It tracks Growing Degree Days (2,420 GDD) and warns the farmer of an incoming 65mm late-monsoon downpour: \'Harvest before 28 October to protect sugar levels (14.8° Brix) and stop sponge-tissue rot.\'"',
    metric: 'Day 480 • 14.8° Brix • High Rain Risk'
  },
  {
    step: 4,
    time: '2:45 - 3:45',
    title: 'Module C: Transparent Net-Returns Matching',
    role: 'farmer' as UserRole,
    targetModule: 'module-c',
    icon: CircleDollarSign,
    pitchScript: 
      '"Here is our core economic innovation: radical price transparency. Instead of misleading gross figures (e.g., ₹28/kg), we itemize deductions for freight (₹2.40), crates (₹0.80), and fees (₹0.40) to guarantee a True Net Realized take-home pay of ₹24.40/kg before contract lock."',
    metric: '₹24.40/kg Net Take-Home (₹10,980)'
  },
  {
    step: 5,
    time: '3:45 - 4:30',
    title: 'Module D: Collective Logistics Consolidation',
    role: 'fpo' as UserRole,
    targetModule: 'module-d',
    icon: Truck,
    pitchScript: 
      '"Finally, logistics pooling. 4 small farm lots combine into an 82% full Tata 407 payload (2,050 kg / 2,500 kg), saving ₹1.85/kg on mountain transport and issuing a tamper-proof digital QR gate-pass for instant weighbridge validation."',
    metric: '82% Payload Fill • ₹1.85/kg Saved'
  },
  {
    step: 6,
    time: '4:30 - 5:00',
    title: 'Offline Resilience & Wrap-Up',
    role: 'farmer' as UserRole,
    targetModule: 'overview',
    icon: Sparkles,
    pitchScript: 
      '"Finally, resilience. The terminal installs as an offline-first PWA: every field capture is cached on the device and syncs automatically the moment a signal returns, so a valley network blackspot never costs a farmer a diagnosis. A complete, practical, and highly defensible agricultural intelligence system built for INNOTECH FEST 2.0."',
    metric: 'Offline-First PWA • Local Sync Queue'
  }
];

export const DemoPitchBar: React.FC<DemoPitchBarProps> = ({
  onSelectRole,
  onSelectModule,
  onClose
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const activeStep = PITCH_STEPS[currentStepIndex];

  const handleStepChange = (index: number) => {
    setCurrentStepIndex(index);
    const step = PITCH_STEPS[index];
    onSelectRole(step.role);
    if (onSelectModule) {
      onSelectModule(step.targetModule);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < PITCH_STEPS.length - 1) {
      handleStepChange(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      handleStepChange(currentStepIndex - 1);
    }
  };

  return (
    <div style={{
      position: 'relative',
      background: '#0f172a',
      borderBottom: '1px solid #FB923C',
      padding: '0.85rem 1.5rem',
      zIndex: 40,
    }}>
      {/* Top Bar Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="badge badge-gold">
            <Clock size={13} />
            {activeStep.time}
          </span>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            INNOTECH FEST 2.0 Live Pitch Run (Step {activeStep.step} of 6)
          </span>
          <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
            {activeStep.metric}
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.25rem',
          }}
          title="Close Presentation Mode"
        >
          <X size={18} />
        </button>
      </div>

      {/* Spoken Script Box for Judges */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.08)',
        borderLeft: '4px solid var(--pineapple-gold)',
        padding: '0.85rem 1.15rem',
        borderRadius: '0 8px 8px 0',
        marginBottom: '0.85rem',
      }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--pineapple-gold)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.25rem',
        }}>
          Judge Pitch Talking Point (Speak Clearly):
        </div>
        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-primary)',
          fontStyle: 'italic',
          lineHeight: 1.5,
        }}>
          {activeStep.pitchScript}
        </p>
      </div>

      {/* Step Navigation Dots & Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {PITCH_STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCurrent = idx === currentStepIndex;
            const isPassed = idx < currentStepIndex;

            return (
              <button
                key={s.step}
                onClick={() => handleStepChange(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: isCurrent 
                    ? 'var(--pineapple-gold)' 
                    : isPassed 
                    ? 'rgba(251, 146, 60, 0.12)' 
                    : 'var(--bg-surface-elevated)',
                  color: isCurrent 
                    ? '#0F172A' 
                    : isPassed 
                    ? 'var(--plantation-green)' 
                    : 'var(--text-secondary)',
                  border: isCurrent 
                    ? '1px solid var(--pineapple-gold)' 
                    : isPassed 
                    ? '1px solid rgba(251, 146, 60, 0.3)' 
                    : '1px solid var(--border-medium)',
                  fontWeight: isCurrent ? 700 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isCurrent ? '0 2px 8px var(--pineapple-gold-glow)' : 'none',
                }}
              >
                {isPassed ? <CheckCircle2 size={13} /> : <Icon size={13} />}
                <span>{s.time.split(' ')[0]} {s.title.split(':')[0]}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="tap-target btn-secondary"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.82rem',
              opacity: currentStepIndex === 0 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <button
            onClick={nextStep}
            disabled={currentStepIndex === PITCH_STEPS.length - 1}
            className="tap-target btn-primary"
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.82rem',
              opacity: currentStepIndex === PITCH_STEPS.length - 1 ? 0.4 : 1,
            }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
