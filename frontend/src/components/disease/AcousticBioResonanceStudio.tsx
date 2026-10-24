'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Waves,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  RotateCcw,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export interface AcousticGradingResult {
  peakFrequencyHz: number;
  dampingRatio: number;
  massKg: number;
  firmnessIndex: number;
  internalStatus: 'crisp_dense_core' | 'internal_water_blister' | 'soft_processing' | 'fibrous_immature';
  qualityGrade: string;
  waterBlisterRiskPct: number;
  title: string;
  description: string;
  recommendation: string;
}

const PRESETS: Record<string, AcousticGradingResult> = {
  crisp_grade_a: {
    peakFrequencyHz: 128.0,
    dampingRatio: 0.038,
    massKg: 1.20,
    firmnessIndex: 18485,
    internalStatus: 'crisp_dense_core',
    qualityGrade: 'Grade-A Prime (Export Quality)',
    waterBlisterRiskPct: 4.2,
    title: 'Crisp, Dense High-Brix Core (14.8° Brix)',
    description:
      'Optimal acoustic bio-resonance. Acoustic frequency lies precisely in the ideal 110–145 Hz band. Cellular locular partitions are intact with high sucrose density.',
    recommendation: 'Prime fresh-fruit export grade. High structural resilience for long-haul refrigerated transit.',
  },
  water_blister: {
    peakFrequencyHz: 74.5,
    dampingRatio: 0.094,
    massKg: 1.35,
    firmnessIndex: 6760,
    internalStatus: 'internal_water_blister',
    qualityGrade: 'Reject / Fermenting (Pre-Cut Spoilage)',
    waterBlisterRiskPct: 89.4,
    title: 'Critical: Post-Rain Osmotic Water Blister Detected',
    description:
      'Resonant frequency dropped below 85 Hz with severe damping dissipation (ζ = 0.094). Internal translucent waterlogging and early sponge-tissue fermentation confirmed before outer rind signs appear.',
    recommendation:
      'Do not pack into long-haul trucks. Divert immediately to local vinegar or livestock silage processing.',
  },
  soft_processing: {
    peakFrequencyHz: 98.0,
    dampingRatio: 0.052,
    massKg: 1.15,
    firmnessIndex: 10540,
    internalStatus: 'soft_processing',
    qualityGrade: 'Grade-B (Processing Pulp)',
    waterBlisterRiskPct: 28.5,
    title: 'Semi-Mature Soft Core (High Juice Sac Fluidity)',
    description:
      'Slightly softened internal tissue density (98 Hz). Sugar levels are sweet but cellular firmness is reduced.',
    recommendation: 'Direct immediately to Nilakuthi Food Park cold pulping line for canned juice within 24 hours.',
  },
  fibrous_immature: {
    peakFrequencyHz: 154.0,
    dampingRatio: 0.031,
    massKg: 1.05,
    firmnessIndex: 24520,
    internalStatus: 'fibrous_immature',
    qualityGrade: 'Grade-C (Immature Woody)',
    waterBlisterRiskPct: 1.0,
    title: 'Immature Fibrous Stand (Rigid Lignified Core)',
    description:
      'Acoustic resonance above 145 Hz indicates unripe, highly rigid cellulose wall structure. Sugars are underdeveloped.',
    recommendation: 'Allow 5–7 additional days of field maturation under solar radiation before harvest.',
  },
};

export const AcousticBioResonanceStudio: React.FC = () => {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('crisp_grade_a');
  const [result, setResult] = useState<AcousticGradingResult>(PRESETS.crisp_grade_a);
  const [massKg, setMassKg] = useState<number>(1.20);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSecondsLeft, setRecordingSecondsLeft] = useState<number>(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Play synthetic acoustic thump sound for audio demo
  const playSyntheticThump = useCallback((freq: number, damping: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.75), ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.7, ctx.currentTime);
      // Damping decay
      const decayDuration = Math.max(0.15, Math.min(0.6, 0.4 / (damping * 10)));
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decayDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + decayDuration);
    } catch {
      // Audio playback blocked or unsupported
    }
  }, []);

  // Recalculate Firmness Index S = f_peak^2 * m^(2/3) when mass changes
  useEffect(() => {
    const s = Math.round(Math.pow(result.peakFrequencyHz, 2) * Math.pow(massKg, 2 / 3));
    setResult((prev) => ({
      ...prev,
      massKg,
      firmnessIndex: s,
    }));
  }, [massKg, result.peakFrequencyHz]);

  // Select Preset Handler
  const handleSelectPreset = (key: string) => {
    setSelectedPresetKey(key);
    const p = PRESETS[key];
    const s = Math.round(Math.pow(p.peakFrequencyHz, 2) * Math.pow(massKg, 2 / 3));
    const updated = {
      ...p,
      massKg,
      firmnessIndex: s,
    };
    setResult(updated);
    playSyntheticThump(p.peakFrequencyHz, p.dampingRatio);
    drawSpectrumVisualization(p.peakFrequencyHz, p.dampingRatio);
  };

  // Draw acoustic resonance spectrum onto canvas
  const drawSpectrumVisualization = useCallback((peakHz: number, damping: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dark grid background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    // Draw Frequency Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Band Shading: [110Hz, 145Hz] is Grade-A Target
    const freqToX = (hz: number) => (hz / 220) * width;
    const xMin110 = freqToX(110);
    const xMax145 = freqToX(145);

    ctx.fillStyle = 'rgba(251, 146, 60, 0.15)';
    ctx.fillRect(xMin110, 0, xMax145 - xMin110, height);

    // Water Blister Warning Zone: < 85Hz
    const xBlister85 = freqToX(85);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
    ctx.fillRect(0, 0, xBlister85, height);

    // Draw Resonant Curve
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    const isBlister = peakHz < 85;
    const isOptimal = peakHz >= 110 && peakHz <= 145;
    ctx.strokeStyle = isBlister ? '#EF4444' : isOptimal ? '#FB923C' : '#F59E0B';

    for (let x = 0; x < width; x++) {
      const currentHz = (x / width) * 220;
      // Resonant Lorentzian peak equation:
      const bandwidth = Math.max(8, peakHz * damping * 3.0);
      const denominator = Math.pow(currentHz - peakHz, 2) + Math.pow(bandwidth / 2, 2);
      const amp = (Math.pow(bandwidth / 2, 2) / denominator) * (height * 0.78);
      const y = height - amp - 15;

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = isBlister
      ? 'rgba(239, 68, 68, 0.20)'
      : isOptimal
      ? 'rgba(251, 146, 60, 0.22)'
      : 'rgba(245, 158, 11, 0.20)';
    ctx.fill();

    // Draw Peak Frequency Marker line
    const peakX = freqToX(peakHz);
    ctx.strokeStyle = '#FFFFFF';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(peakX, 0);
    ctx.lineTo(peakX, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Peak Label Callout
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`f_peak: ${peakHz.toFixed(1)} Hz`, Math.min(width - 55, Math.max(55, peakX)), 22);

    // Threshold Markers
    ctx.fillStyle = '#FB923C';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Grade-A Window [110-145 Hz]', (xMin110 + xMax145) / 2, height - 8);

    ctx.fillStyle = '#EF4444';
    ctx.fillText('Water Blister (<85 Hz)', xBlister85 / 2, height - 8);
  }, []);

  // Start real microphone 1.5-second capture
  const startAcousticCapture = async () => {
    setAudioError(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setAudioError('Microphone capture not supported on this device.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsRecording(true);
      setRecordingSecondsLeft(1.5);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);
      const sampleRate = audioCtx.sampleRate;

      let detectedPeak = 125.0;
      let maxMagnitude = -Infinity;

      const analyzeFrame = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatFrequencyData(dataArray);

        // Find peak frequency in horticultural thump band: 50Hz to 250Hz
        const minBin = Math.floor((50 / (sampleRate / 2)) * bufferLength);
        const maxBin = Math.floor((250 / (sampleRate / 2)) * bufferLength);

        for (let i = minBin; i <= maxBin; i++) {
          if (dataArray[i] > maxMagnitude) {
            maxMagnitude = dataArray[i];
            detectedPeak = (i * (sampleRate / 2)) / bufferLength;
          }
        }

        drawSpectrumVisualization(detectedPeak, 0.045);
        animationFrameRef.current = requestAnimationFrame(analyzeFrame);
      };

      animationFrameRef.current = requestAnimationFrame(analyzeFrame);

      // Countdown timer for 1.5s
      const timer = setInterval(() => {
        setRecordingSecondsLeft((prev) => {
          if (prev <= 0.2) {
            clearInterval(timer);
            stopCapture(detectedPeak);
            return 0;
          }
          return Math.round((prev - 0.1) * 10) / 10;
        });
      }, 100);
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      setAudioError(err.message || 'Microphone access denied. You can test using the preset buttons below.');
      setIsRecording(false);
    }
  };

  const stopCapture = (detectedPeak: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }

    setIsRecording(false);

    // Map captured frequency to grading result
    let status: AcousticGradingResult['internalStatus'] = 'crisp_dense_core';
    let grade = 'Grade-A Prime (Export Quality)';
    let blisterRisk = 5.0;
    let title = `Crisp Core (${detectedPeak.toFixed(1)} Hz)`;
    let desc = 'Live thump bio-resonance indicates crisp internal partitions.';
    let rec = 'Approved for transport.';

    if (detectedPeak < 85) {
      status = 'internal_water_blister';
      grade = 'Reject / Fermenting';
      blisterRisk = 91.2;
      title = `Internal Water Blister Detected (${detectedPeak.toFixed(1)} Hz)`;
      desc = 'Frequency < 85 Hz reveals post-rain spongy tissue breakdown.';
      rec = 'Divert to local juice or processing.';
    } else if (detectedPeak < 110) {
      status = 'soft_processing';
      grade = 'Grade-B (Processing Pulp)';
      blisterRisk = 25.0;
      title = `Semi-Mature Pulp Core (${detectedPeak.toFixed(1)} Hz)`;
      desc = 'Soft internal locular partitions.';
      rec = 'Deliver to Nilakuthi Food Park within 24h.';
    } else if (detectedPeak > 145) {
      status = 'fibrous_immature';
      grade = 'Grade-C (Immature Woody)';
      blisterRisk = 1.0;
      title = `Immature Fibrous Core (${detectedPeak.toFixed(1)} Hz)`;
      desc = 'High frequency indicates rigid, underdeveloped tissue.';
      rec = 'Allow more maturation time in field.';
    }

    const s = Math.round(Math.pow(detectedPeak, 2) * Math.pow(massKg, 2 / 3));

    setResult({
      peakFrequencyHz: Math.round(detectedPeak * 10) / 10,
      dampingRatio: 0.045,
      massKg,
      firmnessIndex: s,
      internalStatus: status,
      qualityGrade: grade,
      waterBlisterRiskPct: blisterRisk,
      title,
      description: desc,
      recommendation: rec,
    });
    drawSpectrumVisualization(detectedPeak, 0.045);
  };

  useEffect(() => {
    drawSpectrumVisualization(result.peakFrequencyHz, result.dampingRatio);
  }, [drawSpectrumVisualization, result.peakFrequencyHz, result.dampingRatio]);

  const isBlister = result.internalStatus === 'internal_water_blister';
  const isOptimal = result.internalStatus === 'crisp_dense_core';

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                background: '#FFF7ED',
                color: '#FB923C',
                border: '1px solid #FED7AA',
                fontSize: '12px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              Non-Destructive Acoustic Screening
            </span>
            <span
              style={{
                background: 'var(--accent-green-light)',
                color: '#F97316',
                border: '1px solid var(--accent-green-border)',
                fontSize: '12px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              Hardware-Free
            </span>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
            Acoustic &ldquo;Thumb-Thump&rdquo; Bio-Resonance Spectrometer
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '0.15rem' }}>
            Smartphone mic captures 1.5s thumb-flick impulse response → Browser FFT extracts peak resonance (f<sub>peak</sub>) and internal rot risk.
          </p>
        </div>

        {/* Live Audio Record Button */}
        <div>
          <button
            onClick={isRecording ? () => stopCapture(result.peakFrequencyHz) : startAcousticCapture}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1rem',
              borderRadius: '6px',
              background: isRecording ? '#9f1239' : '#21170F',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            {isRecording ? (
              <>
                <Waves className="animate-pulse" size={16} />
                <span>Listening... ({recordingSecondsLeft}s)</span>
              </>
            ) : (
              <>
                <Mic size={16} />
                <span>Tap &amp; Record 1.5s Thump</span>
              </>
            )}
          </button>
        </div>
      </div>

      {audioError && (
        <div
          style={{
            padding: '0.6rem 0.85rem',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem',
            color: '#B91C1C',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Info size={16} />
          <span>{audioError}</span>
        </div>
      )}

      {/* Interactive Hackathon Preset Buttons */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            DEMO PRESET ACOUSTIC IMPULSES (CLICK TO AUDIT FREQUENCY FFT):
          </span>
          <span style={{ fontSize: '12px', color: '#FB923C', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Volume2 size={13} />
            <span>Synthetic bio-sound preview</span>
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
          {[
            {
              key: 'crisp_grade_a',
              label: 'Grade-A Core (128 Hz)',
              sub: 'Dense locular partitions',
              color: '#F97316',
              border: '#FB923C',
              bg: 'var(--accent-green-light)',
            },
            {
              key: 'water_blister',
              label: 'Water Blister (74.5 Hz)',
              sub: 'Osmotic internal rot!',
              color: '#DC2626',
              border: '#EF4444',
              bg: '#FEF2F2',
            },
            {
              key: 'soft_processing',
              label: 'Soft Pulping (98 Hz)',
              sub: 'Nilakuthi juice candidate',
              color: '#D97706',
              border: '#F59E0B',
              bg: '#FFFBEB',
            },
            {
              key: 'fibrous_immature',
              label: 'Fibrous Stand (154 Hz)',
              sub: 'Immature woody cellulose',
              color: '#FB923C',
              border: '#FED7AA',
              bg: '#FFF7ED',
            },
          ].map((preset) => {
            const isSelected = selectedPresetKey === preset.key;
            return (
              <button
                key={preset.key}
                onClick={() => handleSelectPreset(preset.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? preset.bg : '#F8FAFC',
                  border: isSelected ? `2px solid ${preset.border}` : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.12s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', width: '100%' }}>
                  <Volume2 size={13} color={preset.color} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: preset.color }}>{preset.label}</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {preset.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Display: Canvas FFT on Left, Physics Metrics on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Left: FFT Spectrum Canvas */}
        <div
          style={{
            background: '#0F172A',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              FAST FOURIER TRANSFORM (50 Hz – 220 Hz)
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                color: isBlister ? '#F87171' : isOptimal ? '#FB923C' : '#FBBF24',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
              }}
            >
              f_peak = {result.peakFrequencyHz.toFixed(1)} Hz
            </span>
          </div>

          <canvas
            ref={canvasRef}
            width={380}
            height={160}
            style={{
              width: '100%',
              height: '160px',
              borderRadius: '6px',
              display: 'block',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.66rem',
              color: '#64748B',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>50 Hz (Low Dull)</span>
            <span>110 Hz</span>
            <span>145 Hz</span>
            <span>220 Hz (High Ring)</span>
          </div>
        </div>

        {/* Right: Physics Equations & Mathematical Metrics */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          {/* Formula Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '0.55rem 0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                NON-DESTRUCTIVE HARVEST METRIC
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#FB923C' }}>
                Mass-Compensated
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                fontWeight: 600,
                color: '#21170F',
                marginTop: '0.2rem',
              }}
            >
              Firmness Index (S) = f<sub>peak</sub>² · m<sup>2/3</sup>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              = ({result.peakFrequencyHz.toFixed(1)})² · ({massKg.toFixed(2)})<sup>2/3</sup> ={' '}
              <strong style={{ color: '#FB923C' }}>{result.firmnessIndex.toLocaleString()}</strong>
            </div>
          </div>

          {/* Fruit Mass Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '0.2rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Estimated Fruit Mass (m):</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{massKg.toFixed(2)} kg</span>
            </div>
            <input
              type="range"
              min="0.70"
              max="2.50"
              step="0.05"
              value={massKg}
              onChange={(e) => setMassKg(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#FB923C', cursor: 'pointer' }}
            />
          </div>

          {/* Key Metric Gauges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div style={{ background: '#FFFFFF', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', display: 'block' }}>Damping Ratio (ζ)</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: result.dampingRatio > 0.08 ? '#DC2626' : '#F97316' }}>
                {result.dampingRatio.toFixed(4)}
              </span>
              <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', display: 'block' }}>
                {result.dampingRatio > 0.08 ? 'Excess sap dissipation' : 'Normal vibration decay'}
              </span>
            </div>

            <div style={{ background: '#FFFFFF', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', display: 'block' }}>Water Blister Risk</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: result.waterBlisterRiskPct > 50 ? '#DC2626' : '#F97316' }}>
                {result.waterBlisterRiskPct.toFixed(1)}%
              </span>
              <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', display: 'block' }}>
                {result.waterBlisterRiskPct > 50 ? 'Internal sponge breakdown' : 'Negligible risk'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Action Banner */}
      <div
        style={{
          background: isBlister ? '#FEF2F2' : isOptimal ? 'var(--accent-green-light)' : '#FFFBEB',
          border: `1px solid ${isBlister ? '#FECACA' : isOptimal ? 'var(--accent-green-border)' : '#FDE68A'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
        }}
      >
        <div style={{ marginTop: '0.1rem', flexShrink: 0 }}>
          {isBlister ? (
            <ShieldAlert size={22} color="#DC2626" />
          ) : isOptimal ? (
            <CheckCircle2 size={22} color="#F97316" />
          ) : (
            <AlertTriangle size={22} color="#D97706" />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
            <h4
              style={{
                fontSize: '0.88rem',
                fontWeight: 800,
                color: isBlister ? '#991B1B' : isOptimal ? '#F97316' : '#92400E',
              }}
            >
              {result.title}
            </h4>
            <span
              className="badge"
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                background: isBlister ? '#DC2626' : isOptimal ? '#F97316' : '#D97706',
                color: '#FFFFFF',
              }}
            >
              {result.qualityGrade}
            </span>
          </div>
          <p
            style={{
              fontSize: '0.76rem',
              color: isBlister ? '#7F1D1D' : isOptimal ? '#F97316' : '#78350F',
              marginTop: '0.2rem',
              lineHeight: 1.45,
            }}
          >
            {result.description}
          </p>
          <div
            style={{
              marginTop: '0.4rem',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: isBlister ? '#991B1B' : isOptimal ? '#F97316' : '#92400E',
            }}
          >
            Recommended Action: <em>{result.recommendation}</em>
          </div>
        </div>
      </div>
    </div>
  );
};
