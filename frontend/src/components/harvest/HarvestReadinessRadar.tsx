'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';
import {
  CalendarDays,
  CloudRain,
  PackageCheck,
  Thermometer,
  Gauge,
  Check,
  ArrowRight,
  Droplets,
  AlertTriangle,
  ShieldAlert,
  Video,
  Pause,
  Upload,
  Camera,
  Activity,
  Layers,
  CheckCircle,
  HelpCircle,
  Globe,
} from 'lucide-react';
import { HarvestForecastData } from '@/types';
import { MOCK_HARVEST_FORECAST } from '@/lib/mock-data';
import { api } from '@/lib/api-client';
import { HarvestGisMap } from './HarvestGisMap';

interface HarvestReadinessRadarProps {
  onRegisterLot?: () => void;
}

interface FieldScanPreset {
  id: string;
  label: string;
  img: string;
  isPlanted: boolean;
  plantingStatus: string;
  canopyCoverage: number;
  cropName: string;
  condition: 'OPTIMAL' | 'WATER_DEFICIT' | 'ROOT_ROT_ONSET' | 'MATURE_HARVEST' | 'FALLOW';
  conditionScore: number;
  waterStatus: 'OPTIMAL' | 'LACKING_WATER' | 'WATERLOGGED' | 'DRY_SOIL';
  soilMoisturePct: number;
  rootRotStatus: 'HEALTHY' | 'EARLY_ONSET' | 'N/A';
  rootRotDetails: string;
  harvestReadinessPct: number;
  recommendedPickDate: string;
  optimalHarvestWindow: string;
  estimatedBrix: number;
  gddAccumulated: number;
  weatherRisk: string;
  advisory: string;
}

const FIELD_SCAN_PRESETS: FieldScanPreset[] = [
  {
    id: 'mature_harvest',
    label: 'Mature Stand (Harvest Ready)',
    img: '/samples/crown_view.jpg',
    isPlanted: true,
    plantingStatus: 'Established Stand',
    canopyCoverage: 94.2,
    cropName: 'Manipur Queen Pineapple (GI #497)',
    condition: 'MATURE_HARVEST',
    conditionScore: 97.2,
    waterStatus: 'OPTIMAL',
    soilMoisturePct: 64.5,
    rootRotStatus: 'HEALTHY',
    rootRotDetails: 'Firm basal crown connection, white healthy roots, zero rot lesions.',
    harvestReadinessPct: 99.1,
    recommendedPickDate: 'Wednesday, Oct 24, 2026',
    optimalHarvestWindow: 'Oct 22 – Oct 26, 2026',
    estimatedBrix: 14.8,
    gddAccumulated: 2478,
    weatherRisk: 'High (65mm Downpour in 48h)',
    advisory: 'Harvest immediately before Wednesday downpour to prevent water blister rot and maintain Grade A export sweetness (14.8° Brix).',
  },
  {
    id: 'water_deficit',
    label: 'Water Deficit (Lacking Water)',
    img: '/samples/water_deficit.jpg',
    isPlanted: true,
    plantingStatus: 'Established Stand',
    canopyCoverage: 68.0,
    cropName: 'Manipur Queen Pineapple (GI #497)',
    condition: 'WATER_DEFICIT',
    conditionScore: 56.4,
    waterStatus: 'LACKING_WATER',
    soilMoisturePct: 28.4,
    rootRotStatus: 'HEALTHY',
    rootRotDetails: 'Desiccated outer root fibers, healthy inner vascular cylinder. No fungal rot.',
    harvestReadinessPct: 82.0,
    recommendedPickDate: 'In 6 to 8 Days (Post-Irrigation)',
    optimalHarvestWindow: 'Oct 27 – Oct 31, 2026',
    estimatedBrix: 14.8,
    gddAccumulated: 2280,
    weatherRisk: 'Moderate (High Evaporation & Sunburn Risk)',
    advisory: 'Stand is lacking water. Soil moisture at 28.4% (critical deficit threshold). Apply 25mm supplemental furrow or drip irrigation within 24 hours.',
  },
  {
    id: 'root_rot',
    label: 'Root Rot Onset (Basal Softening)',
    img: '/samples/root_rot_onset.jpg',
    isPlanted: true,
    plantingStatus: 'Established Stand',
    canopyCoverage: 75.0,
    cropName: 'Manipur Queen Pineapple (GI #497)',
    condition: 'ROOT_ROT_ONSET',
    conditionScore: 41.2,
    waterStatus: 'WATERLOGGED',
    soilMoisturePct: 88.5,
    rootRotStatus: 'EARLY_ONSET',
    rootRotDetails: 'Basal stem collar softening and dark water-soaking detected near soil line.',
    harvestReadinessPct: 94.0,
    recommendedPickDate: 'Immediate (Next 24 Hours)',
    optimalHarvestWindow: 'Immediate Harvest (Oct 19 – Oct 21)',
    estimatedBrix: 13.2,
    gddAccumulated: 2478,
    weatherRisk: 'Critical (Stagnant Moisture Accelerating Zoospore Spread)',
    advisory: 'Root rot onset detected at stem collar. Saturated furrows (88.5% moisture). Dig 30cm contour drainage trenches immediately and drench root collars with Trichoderma viride @ 10g/L.',
  },
  {
    id: 'fallow_soil',
    label: 'Unplanted Fallow Terrace (Bare Soil)',
    img: '/samples/fallow_terrace.jpg',
    isPlanted: false,
    plantingStatus: 'Unplanted Fallow Ground',
    canopyCoverage: 7.3,
    cropName: 'Bare Soil / Pre-Planting Terrace',
    condition: 'FALLOW',
    conditionScore: 15.0,
    waterStatus: 'DRY_SOIL',
    soilMoisturePct: 18.2,
    rootRotStatus: 'N/A',
    rootRotDetails: 'No active root system detected in bare soil terrace bed.',
    harvestReadinessPct: 0.0,
    recommendedPickDate: 'Not Applicable',
    optimalHarvestWindow: 'N/A - Planting Required',
    estimatedBrix: 0.0,
    gddAccumulated: 0,
    weatherRisk: 'Low (Favorable for Land Preparation)',
    advisory: 'Unplanted fallow terrace detected (7.3% vegetation). Prepare contour ridges and incorporate Farm Yard Manure (FYM) before planting slips.',
  },
  {
    id: 'rice_stand',
    label: 'Chak-hao Rice (Grain Filling)',
    img: '/samples/rice_blight.jpg',
    isPlanted: true,
    plantingStatus: 'Established Stand',
    canopyCoverage: 91.0,
    cropName: 'Chak-hao & Valley Rice (Oryza sativa)',
    condition: 'OPTIMAL',
    conditionScore: 92.0,
    waterStatus: 'OPTIMAL',
    soilMoisturePct: 72.0,
    rootRotStatus: 'HEALTHY',
    rootRotDetails: 'Intact adventitious crown roots, normal panicle emergence.',
    harvestReadinessPct: 88.5,
    recommendedPickDate: 'Nov 04 – Nov 08, 2026',
    optimalHarvestWindow: 'Nov 02 – Nov 10, 2026',
    estimatedBrix: 0.0,
    gddAccumulated: 1810,
    weatherRisk: 'Moderate (Humid valley dews)',
    advisory: 'Chak-hao rice panicles in dough stage. Maintain 3cm shallow standing water until terminal grain filling, then drain 10 days before harvest.',
  },
  {
    id: 'orange_stand',
    label: 'Tamenglong Orange (Color Break)',
    img: '/samples/orange_canker.jpg',
    isPlanted: true,
    plantingStatus: 'Established Stand',
    canopyCoverage: 87.5,
    cropName: 'Tamenglong Mandarin Orange (GI #498)',
    condition: 'OPTIMAL',
    conditionScore: 94.0,
    waterStatus: 'OPTIMAL',
    soilMoisturePct: 62.0,
    rootRotStatus: 'HEALTHY',
    rootRotDetails: 'Graft union sound, taproot and feeder roots firm.',
    harvestReadinessPct: 91.0,
    recommendedPickDate: 'Nov 12 – Nov 18, 2026',
    optimalHarvestWindow: 'Nov 10 – Nov 22, 2026',
    estimatedBrix: 11.8,
    gddAccumulated: 3040,
    weatherRisk: 'Low (Autumn sunshine favoring rind pigmentation)',
    advisory: 'Mandarin fruits at color break stage. Taper irrigation slightly to accelerate total soluble solid (TSS) concentration and prevent peel puffing.',
  },
];

export const HarvestReadinessRadar: React.FC<HarvestReadinessRadarProps> = ({
  onRegisterLot,
}) => {
  const { t } = useTranslation();
  const [forecast, setForecast] = useState<HarvestForecastData>(MOCK_HARVEST_FORECAST);
  const [lotRegistered, setLotRegistered] = useState(false);
  const [viewMode, setViewMode] = useState<'gis' | 'scanner' | 'both'>('gis');

  // Field Frame Scanner States
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>('/samples/crown_view.jpg');
  const [activePresetId, setActivePresetId] = useState<string>('mature_harvest');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live evaluated state
  const [fieldEvaluation, setFieldEvaluation] = useState<FieldScanPreset>(FIELD_SCAN_PRESETS[0]);

  useEffect(() => {
    api
      .getHarvestForecast('crop-queen-tombi-001')
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

  // Start live field camera
  const startLiveFieldCamera = async () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Autoplay error:', e));
      }
      setIsCameraActive(true);
      setPreviewImage(null);
    } catch (err) {
      console.warn('Field camera stream error:', err);
      setIsCameraActive(false);
    }
  };

  const stopLiveFieldCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Evaluate current camera frame
  const handleScanCurrentFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) return;

    try {
      setIsEvaluating(true);
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 800;
      const height = video.videoHeight || 600;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, width, height);

      const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPreviewImage(capturedDataUrl);
      stopLiveFieldCamera();

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.8)
      );

      if (blob) {
        const file = new File([blob], `field_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const res = await api.evaluateFieldFrame(file);

        setFieldEvaluation({
          id: 'live_frame',
          label: 'Live Field Scan',
          img: capturedDataUrl,
          isPlanted: res.is_planted,
          plantingStatus: res.planting_status,
          canopyCoverage: res.canopy_coverage_pct,
          cropName: res.crop_display_name || 'Manipur Queen Pineapple',
          condition: res.crop_condition as any,
          conditionScore: res.condition_score,
          waterStatus: res.water_status as any,
          soilMoisturePct: res.soil_moisture_pct,
          rootRotStatus: res.root_rot_status as any,
          rootRotDetails: res.root_rot_details,
          harvestReadinessPct: res.harvest_readiness_pct,
          recommendedPickDate: res.recommended_pick_date,
          optimalHarvestWindow: res.optimal_harvest_window,
          estimatedBrix: res.estimated_brix,
          gddAccumulated: Math.round(res.gdd_accumulated),
          weatherRisk: res.weather_risk,
          advisory: res.agronomic_advisory,
        });
      }
    } catch (err) {
      console.warn('Frame evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Select demo sample preset
  const handleSelectPreset = (preset: FieldScanPreset) => {
    stopLiveFieldCamera();
    setActivePresetId(preset.id);
    setPreviewImage(preset.img);
    setFieldEvaluation(preset);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsEvaluating(true);
      const dataUrl = URL.createObjectURL(file);
      setPreviewImage(dataUrl);
      stopLiveFieldCamera();

      const res = await api.evaluateFieldFrame(file);
      setFieldEvaluation({
        id: 'uploaded_field',
        label: 'Uploaded Field Photo',
        img: dataUrl,
        isPlanted: res.is_planted,
        plantingStatus: res.planting_status,
        canopyCoverage: res.canopy_coverage_pct,
        cropName: res.crop_display_name || 'Manipur Queen Pineapple',
        condition: res.crop_condition as any,
        conditionScore: res.condition_score,
        waterStatus: res.water_status as any,
        soilMoisturePct: res.soil_moisture_pct,
        rootRotStatus: res.root_rot_status as any,
        rootRotDetails: res.root_rot_details,
        harvestReadinessPct: res.harvest_readiness_pct,
        recommendedPickDate: res.recommended_pick_date,
        optimalHarvestWindow: res.optimal_harvest_window,
        estimatedBrix: res.estimated_brix,
        gddAccumulated: Math.round(res.gdd_accumulated),
        weatherRisk: res.weather_risk,
        advisory: res.agronomic_advisory,
      });
    } catch (err) {
      console.warn('File upload evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* View Mode Segmented Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          background: '#FFFFFF',
          padding: '0.65rem 0.95rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            RADAR PERSPECTIVE:
          </span>
          <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>
            MODULE B
          </span>
        </div>

        <div className="nav-segmented" style={{ padding: '0.2rem' }}>
          <button
            onClick={() => setViewMode('gis')}
            className={`nav-segmented-item ${viewMode === 'gis' ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.9rem', fontSize: '0.76rem', gap: '0.4rem' }}
          >
            <Globe size={13} />
            <span>GIS Spatial Radar</span>
          </button>
          <button
            onClick={() => setViewMode('scanner')}
            className={`nav-segmented-item ${viewMode === 'scanner' ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.9rem', fontSize: '0.76rem', gap: '0.4rem' }}
          >
            <Camera size={13} />
            <span>Ground Optical Scanner</span>
          </button>
          <button
            onClick={() => setViewMode('both')}
            className={`nav-segmented-item ${viewMode === 'both' ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.9rem', fontSize: '0.76rem', gap: '0.4rem' }}
          >
            <Layers size={13} />
            <span>Dual GIS & Optical View</span>
          </button>
        </div>
      </div>

      {/* Top Banner: Stand Status & Readiness Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
        }}
      >
        <div style={{ background: '#FFFFFF', border: '1px solid #F1E4D8', borderRadius: '8px', padding: '1rem 1.15rem' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#6E5A4A' }}>
            STAND STATUS
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#21170F', marginTop: '0.2rem' }}>
            {fieldEvaluation.isPlanted ? fieldEvaluation.cropName.split('(')[0].trim() : 'Unplanted Fallow'}
          </div>
          <div style={{ fontSize: '12px', color: fieldEvaluation.isPlanted ? '#F97316' : '#9a5b13', fontWeight: 600, marginTop: '0.2rem' }}>
            {fieldEvaluation.isPlanted ? `${fieldEvaluation.canopyCoverage}% Canopy Coverage` : 'Bare Soil Bed'}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #F1E4D8', borderRadius: '8px', padding: '1rem 1.15rem' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#6E5A4A' }}>
            HARVEST READINESS
          </div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 700, color: '#F97316', marginTop: '0.2rem' }}>
            {fieldEvaluation.harvestReadinessPct}%
          </div>
          <div style={{ fontSize: '12px', color: '#6E5A4A', marginTop: '0.2rem' }}>
            {fieldEvaluation.isPlanted ? fieldEvaluation.optimalHarvestWindow : 'N/A - Planting Required'}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #F1E4D8', borderRadius: '8px', padding: '1rem 1.15rem' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#6E5A4A' }}>
            WATER MOISTURE
          </div>
          <div
            className="tabular-nums"
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: fieldEvaluation.waterStatus === 'LACKING_WATER' ? '#9a5b13' : fieldEvaluation.waterStatus === 'WATERLOGGED' ? '#a11920' : '#F97316',
              marginTop: '0.2rem',
            }}
          >
            {fieldEvaluation.soilMoisturePct}%
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: fieldEvaluation.waterStatus === 'LACKING_WATER' ? '#9a5b13' : fieldEvaluation.waterStatus === 'WATERLOGGED' ? '#a11920' : '#F97316', marginTop: '0.2rem' }}>
            {fieldEvaluation.waterStatus === 'LACKING_WATER' ? 'Deficit (Lacking Water)' : fieldEvaluation.waterStatus === 'WATERLOGGED' ? 'Waterlogged' : 'Optimal Hydration'}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #F1E4D8', borderRadius: '8px', padding: '1rem 1.15rem' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#6E5A4A' }}>
            ROOT ROT WARNING
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: fieldEvaluation.rootRotStatus === 'EARLY_ONSET' ? '#a11920' : '#F97316',
              marginTop: '0.2rem',
            }}
          >
            {fieldEvaluation.rootRotStatus === 'EARLY_ONSET' ? 'Early Rot Onset' : fieldEvaluation.rootRotStatus === 'N/A' ? 'N/A' : 'Healthy Root'}
          </div>
          <div style={{ fontSize: '12px', color: fieldEvaluation.rootRotStatus === 'EARLY_ONSET' ? '#a11920' : '#F97316', fontWeight: 600, marginTop: '0.2rem' }}>
            {fieldEvaluation.rootRotStatus === 'EARLY_ONSET' ? 'Drainage Trench Urgent' : 'Firm Basal Collar'}
          </div>
        </div>
      </div>

      {/* Interactive GIS Spatial Radar Section */}
      {(viewMode === 'gis' || viewMode === 'both') && (
        <HarvestGisMap
          onSelectZone={(zoneName, maturity, brix) => {
            setFieldEvaluation((prev) => ({
              ...prev,
              label: zoneName,
              harvestReadinessPct: maturity,
              estimatedBrix: brix,
              recommendedPickDate:
                maturity >= 98
                  ? 'Immediate (Next 24h Morning Pick)'
                  : 'In 24–48h Before Rain Peak',
              optimalHarvestWindow:
                maturity >= 98 ? 'Immediate Harvest (Oct 19–21)' : 'Oct 22–24, 2026',
            }));
          }}
          onTagForPooling={handleRegisterClick}
        />
      )}

      {/* Field Frame Assessment Section */}
      {(viewMode === 'scanner' || viewMode === 'both') && (
        <div
          className="glass-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            padding: '1rem',
            border: '1px solid var(--border-medium)',
          }}
        >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Field Frame & Stand Evaluator
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Analyzes whether the frame is planted, assesses moisture deficit & root rot onset, and projects harvest timing.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {isCameraActive ? (
              <button
                onClick={handleScanCurrentFrame}
                disabled={isEvaluating}
                className="tap-target btn-primary"
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.76rem', gap: '0.35rem' }}
              >
                <Camera size={14} />
                <span>{isEvaluating ? 'Evaluating...' : 'Capture & Analyze'}</span>
              </button>
            ) : (
              <button
                onClick={startLiveFieldCamera}
                className="tap-target btn-primary"
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.76rem', gap: '0.35rem' }}
              >
                <Video size={14} />
                <span>Scan Live Field</span>
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="tap-target btn-secondary"
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.76rem', gap: '0.3rem' }}
            >
              <Upload size={13} />
              <span>Upload Photo</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Quick Sample Presets Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginRight: '0.2rem' }}>
            PRESETS:
          </span>
          {FIELD_SCAN_PRESETS.map((p) => {
            const isSelected = activePresetId === p.id && !isCameraActive;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                style={{
                  padding: '0.22rem 0.55rem',
                  fontSize: '0.7rem',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid var(--brand-orange)' : '1px solid var(--border-subtle)',
                  background: isSelected ? '#FFF7ED' : '#FFFFFF',
                  color: isSelected ? '#FB923C' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 800 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Frame Viewfinder & Result Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1rem',
            marginTop: '0.25rem',
          }}
        >
          {/* Left: Viewfinder Screen */}
          <div
            style={{
              position: 'relative',
              height: '260px',
              borderRadius: 'var(--radius-md)',
              background: '#090D16',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.5)',
            }}
          >
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : previewImage ? (
              <img
                src={previewImage}
                alt="Field Frame"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>No frame active</div>
            )}

            {/* Overlaid Diagnostic HUD */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(15, 23, 42, 0.88)',
                border: fieldEvaluation.isPlanted
                  ? '1px solid rgba(251, 146, 60, 0.5)'
                  : '1px solid rgba(251, 146, 60, 0.5)',
                color: fieldEvaluation.isPlanted ? '#FB923C' : '#FED7AA',
                fontSize: '0.68rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: fieldEvaluation.isPlanted ? '#FB923C' : '#FB923C',
                }}
              />
              <span>{fieldEvaluation.isPlanted ? 'PLANTED STAND' : 'UNPLANTED FALLOW'}</span>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                right: '10px',
                background: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(4px)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                color: '#FFFFFF',
              }}
            >
              <span>{fieldEvaluation.cropName}</span>
              <span style={{ color: '#FB923C', fontWeight: 800 }}>
                {fieldEvaluation.canopyCoverage}% Cover
              </span>
            </div>
          </div>

          {/* Right: Comprehensive Diagnostic Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {/* Condition Banner */}
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background:
                  fieldEvaluation.condition === 'MATURE_HARVEST'
                    ? 'var(--accent-green-light)'
                    : fieldEvaluation.condition === 'WATER_DEFICIT'
                    ? '#FFFBEB'
                    : fieldEvaluation.condition === 'ROOT_ROT_ONSET'
                    ? '#FEF2F2'
                    : '#F8FAFC',
                border:
                  fieldEvaluation.condition === 'MATURE_HARVEST'
                    ? '1px solid #E5D2C2'
                    : fieldEvaluation.condition === 'WATER_DEFICIT'
                    ? '1px solid #FDE68A'
                    : fieldEvaluation.condition === 'ROOT_ROT_ONSET'
                    ? '1px solid #FECACA'
                    : '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    color:
                      fieldEvaluation.condition === 'MATURE_HARVEST'
                        ? '#F97316'
                        : fieldEvaluation.condition === 'WATER_DEFICIT'
                        ? '#92400E'
                        : fieldEvaluation.condition === 'ROOT_ROT_ONSET'
                        ? '#991B1B'
                        : 'var(--text-primary)',
                  }}
                >
                  Condition: {fieldEvaluation.condition.replace('_', ' ')}
                </span>
                <span className="tabular-nums" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                  Health Score: {fieldEvaluation.conditionScore}%
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', lineHeight: 1.45 }}>
                {fieldEvaluation.advisory}
              </p>
            </div>

            {/* Critical Check Points: Moisture Deficit & Root Rot Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {/* Moisture status */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.55rem 0.65rem',
                }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                  SOIL MOISTURE
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                  {fieldEvaluation.soilMoisturePct}%
                </div>
                <div
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: fieldEvaluation.waterStatus === 'LACKING_WATER' ? '#DC2626' : '#F97316',
                    marginTop: '0.1rem',
                  }}
                >
                  {fieldEvaluation.waterStatus === 'LACKING_WATER' ? 'Lacking Water (Wilting Risk)' : 'Adequate Moisture'}
                </div>
              </div>

              {/* Root rot status */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.55rem 0.65rem',
                }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                  ROOT ROT CHECK
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                  {fieldEvaluation.rootRotStatus === 'EARLY_ONSET' ? 'Rot Started' : fieldEvaluation.rootRotStatus === 'N/A' ? 'Not Applicable' : 'Healthy Basal Collar'}
                </div>
                <div
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: fieldEvaluation.rootRotStatus === 'EARLY_ONSET' ? '#DC2626' : '#F97316',
                    marginTop: '0.1rem',
                  }}
                >
                  {fieldEvaluation.rootRotStatus === 'EARLY_ONSET' ? 'Action: Bio-Fungicide' : 'Firm Stem Union'}
                </div>
              </div>
            </div>

            {/* When to Harvest Box */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                  WHEN TO HARVEST:
                </span>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#FB923C' }}>
                  {fieldEvaluation.recommendedPickDate}
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Window: {fieldEvaluation.optimalHarvestWindow}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Thermal GDD: <strong>{fieldEvaluation.gddAccumulated}</strong> / 2500 • Sugar Sweetness: <strong>{fieldEvaluation.estimatedBrix}° Brix</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Lifecycle Stepper & Weather Decision Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Left: Phenological Stepper */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Phenological Lifecycle Stepper
            </span>
            <span className="badge badge-orange" style={{ fontSize: '0.68rem' }}>
              <span className="pulse-dot pulse-dot-orange" />
              99.1% GDD Complete
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {forecast.stages.map((stage, idx) => {
              return (
                <div
                  key={stage.stage_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.7rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: stage.is_active
                      ? '#FFF7ED'
                      : stage.is_completed
                      ? 'var(--accent-green-light)'
                      : '#F8FAFC',
                    border: stage.is_active
                      ? '1px solid var(--brand-orange)'
                      : stage.is_completed
                      ? '1px solid var(--accent-green-border)'
                      : '1px solid var(--border-subtle)',
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      color: stage.is_active
                        ? '#F97316'
                        : stage.is_completed
                        ? '#F97316'
                        : '#8A6D55',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stage.is_completed ? <Check size={14} strokeWidth={2.8} /> : `${idx + 1}.`}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          color: stage.is_active ? '#F97316' : 'var(--text-primary)',
                        }}
                      >
                        {stage.name}
                      </span>
                      {stage.is_active && (
                        <span className="badge badge-orange" style={{ fontSize: '0.6rem' }}>
                          Current
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {stage.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Weather Risk & Lot Registration */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Weather Risk & Consignment Pooling
            </span>
            <span className="badge badge-crimson" style={{ fontSize: '0.68rem' }}>
              48H WEATHER RISK
            </span>
          </div>

          <div
            style={{
              background: '#FFF7ED',
              border: '1px solid #FED7AA',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <CloudRain size={22} color="#F97316" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#EA580C' }}>
                  65.0mm Downpour in 48 Hours
                </div>
                <div style={{ fontSize: '0.7rem', color: '#7C2D12' }}>
                  Thoubal & Churachandpur Clusters
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.76rem', color: '#7C2D12', lineHeight: 1.45, margin: 0 }}>
              Excessive rainfall causes osmotic water uptake, diluting sucrose by up to{' '}
              <strong style={{ color: '#DC2626' }}>-2.1° Brix</strong> and triggering post-harvest water blister.
            </p>

            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem 0.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.74rem',
                border: '1px solid #FED7AA',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Optimal Harvest Window:</span>
              <span style={{ color: '#F97316', fontWeight: 800 }}>Next 24 to 36 Hours</span>
            </div>
          </div>

          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              marginTop: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                FPO Consignment Pool Registration
              </span>
              <span className="badge badge-green" style={{ fontSize: '0.64rem' }}>
                450 kg Ready
              </span>
            </div>

            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0 }}>
              Register your Grade A lot into the collective FPO queue now to guarantee institutional pricing before downpour onset.
            </p>

            <button
              onClick={handleRegisterClick}
              disabled={lotRegistered}
              className="tap-target"
              style={{
                width: '100%',
                gap: '0.45rem',
                fontSize: '0.82rem',
                marginTop: '0.2rem',
                minHeight: '40px',
                fontWeight: 700,
                background: lotRegistered ? '#F97316' : '#F97316',
                color: '#FFFFFF',
                borderRadius: '6px',
                border: 'none',
                cursor: lotRegistered ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none',
              }}
            >
              <PackageCheck size={15} />
              {lotRegistered ? (
                'Registered! Moving to Market...'
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  Register Consignment for Pooling <ArrowRight size={13} />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
