'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

export type TriageBand = 'confirmed' | 'preliminary' | 'inconclusive';

/**
 * Honest-AI confidence bracketing (Part 3, Sec 6.3):
 *   >= 85%  confirmed, actionable advice
 *   50-85%  preliminary, re-check in 48h
 *   <  50%  inconclusive, escalate to a human
 */
export function classifyConfidence(score: number): TriageBand {
  if (score >= 85) return 'confirmed';
  if (score >= 50) return 'preliminary';
  return 'inconclusive';
}

const BANDS: Record<
  TriageBand,
  { label: string; hint: string; color: string; fill: string; Icon: typeof CheckCircle2 }
> = {
  confirmed: {
    label: 'Confirmed Triage',
    hint: 'High-confidence screen — follow the protocol below.',
    color: '#F97316',
    fill: '#F97316',
    Icon: CheckCircle2,
  },
  preliminary: {
    label: 'Preliminary Screening — Subject to Visual Progression',
    hint: 'Re-capture under daylight in 48 hours to confirm progression.',
    color: '#9a5b13',
    fill: '#9a5b13',
    Icon: AlertTriangle,
  },
  inconclusive: {
    label: 'Inconclusive — Human Verification Required',
    hint: 'Re-capture with better lighting or escalate to an extension officer.',
    color: '#a11920',
    fill: '#a11920',
    Icon: HelpCircle,
  },
};

interface ConfidenceMeterProps {
  score: number;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ score }) => {
  const band = classifyConfidence(score);
  const config = BANDS[band];
  const { Icon } = config;

  return (
    <div
      style={{
        background: '#ffffff',
        padding: '14px',
        borderRadius: '6px',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Model Confidence
        </span>
        <span
          className="tabular-nums"
          style={{ fontSize: '15px', fontWeight: 600, color: config.color }}
        >
          {score.toFixed(1)}%
        </span>
      </div>

      <div style={{ height: '8px', background: '#F1E4D8', borderRadius: '4px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${score}%`,
            background: config.fill,
            borderRadius: '4px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.55rem' }}>
        <Icon size={15} style={{ color: config.color, flexShrink: 0 }} />
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: config.color }}>
          {config.label}
        </span>
      </div>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
        {config.hint}
      </p>
    </div>
  );
};
