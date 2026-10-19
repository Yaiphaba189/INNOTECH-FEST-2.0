'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';
import {
  Camera,
  Video,
  FlipHorizontal,
  Upload,
  CheckCircle,
  ShieldAlert,
  Crosshair,
  Pause,
  Activity,
  Layers,
  Volume2,
  Waves,
  Sparkles,
} from 'lucide-react';
import { DiseaseDiagnosis } from '@/types';
import { INITIAL_DISEASE_DIAGNOSIS, MOCK_DISEASE_CATALOG } from '@/lib/mock-data';
import { compressFieldImage, CompressionResult } from '@/lib/image-compressor';
import { queueOfflineScan } from '@/lib/offline-db';
import { api, ModelCard } from '@/lib/api-client';
import { AcousticBioResonanceStudio } from './AcousticBioResonanceStudio';

type CropScope = 'auto' | 'pineapple' | 'rice' | 'orange';

interface CropInfo {
  id: string;
  name: string;
  scientificName: string;
}

const CROP_METADATA: Record<string, CropInfo> = {
  pineapple: {
    id: 'pineapple',
    name: 'Manipur Queen Pineapple (GI #497)',
    scientificName: 'Ananas comosus var. Queen',
  },
  rice: {
    id: 'rice',
    name: 'Chak-hao & Valley Rice',
    scientificName: 'Oryza sativa var. Chak-hao',
  },
  orange: {
    id: 'orange',
    name: 'Tamenglong Mandarin Orange (GI #498)',
    scientificName: 'Citrus reticulata Blanco',
  },
};

interface OrganDefinition {
  id: string;
  title: string;
  hint: string;
  img: string;
}

const CROP_ORGANS: Record<string, OrganDefinition[]> = {
  pineapple: [
    {
      id: 'crown',
      title: 'Crown Whorl (Rosette)',
      hint: 'Central leaf rosette: detect Phytophthora Heart Rot.',
      img: '/samples/crown_view.jpg',
    },
    {
      id: 'base_stalk',
      title: 'Fruit Base & Stalk',
      hint: 'Peduncle connection: detect Thielaviopsis Black Rot.',
      img: '/samples/base_stalk.jpg',
    },
    {
      id: 'lateral',
      title: 'Lateral Eyes & Axils',
      hint: 'Fruit eye profile: inspect Mealybug Wilt & borers.',
      img: '/samples/lateral_view.jpg',
    },
  ],
  rice: [
    {
      id: 'leaf_blade',
      title: 'Leaf Blade & Margins',
      hint: 'Foliage margins: detect Bacterial Leaf Blight (BLB).',
      img: '/samples/rice_blight.jpg',
    },
    {
      id: 'sheath',
      title: 'Leaf Sheath (Waterline)',
      hint: 'Basal stem sheath: detect Rhizoctonia Sheath Blight.',
      img: '/samples/rice_blight.jpg',
    },
    {
      id: 'panicle',
      title: 'Panicle & Grain Head',
      hint: 'Emerging panicle neck: detect Rice Blast (Magnaporthe).',
      img: '/samples/rice_blight.jpg',
    },
  ],
  orange: [
    {
      id: 'foliage',
      title: 'Foliage & Canopy Leaves',
      hint: 'Asymmetric leaf mottle: detect Citrus Greening (HLB).',
      img: '/samples/orange_canker.jpg',
    },
    {
      id: 'fruit_peel',
      title: 'Fruit Peel & Outer Rind',
      hint: 'Crater-like corky lesions: detect Citrus Canker.',
      img: '/samples/orange_canker.jpg',
    },
    {
      id: 'root_rot',
      title: 'Stem Collar & Bark Base',
      hint: 'Gummosis & basal bark oozing: detect Collar & Root Rot.',
      img: '/samples/orange_canker.jpg',
    },
  ],
};

const SAMPLE_PRESETS: Array<{
  id: string;
  crop: 'pineapple' | 'rice' | 'orange';
  organ: string;
  img: string;
  label: string;
  cropLabel: string;
}> = [
  { id: 'pine-crown', crop: 'pineapple', organ: 'crown', img: '/samples/crown_view.jpg', label: 'Crown photo', cropLabel: 'Pineapple' },
  { id: 'pine-base', crop: 'pineapple', organ: 'base_stalk', img: '/samples/base_stalk.jpg', label: 'Base photo', cropLabel: 'Pineapple' },
  { id: 'pine-side', crop: 'pineapple', organ: 'lateral', img: '/samples/lateral_view.jpg', label: 'Side photo', cropLabel: 'Pineapple' },
  { id: 'rice-leaf', crop: 'rice', organ: 'leaf_blade', img: '/samples/rice_blight.jpg', label: 'Leaf photo', cropLabel: 'Rice' },
  { id: 'orange-leaf', crop: 'orange', organ: 'foliage', img: '/samples/orange_canker.jpg', label: 'Leaf photo', cropLabel: 'Orange' },
  { id: 'orange-collar', crop: 'orange', organ: 'root_rot', img: '/samples/root_rot_onset.jpg', label: 'Collar photo', cropLabel: 'Orange' },
];

export const DiseaseScreeningStudio: React.FC = () => {
  const { t } = useTranslation();

  // Mode: Optical Vision vs Acoustic Bio-Resonance Spectrometer
  const [modelCards, setModelCards] = useState<ModelCard[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [screeningMode, setScreeningMode] = useState<'vision' | 'acoustic'>('vision');

  // Crop & Organ selector
  const [cropScope, setCropScope] = useState<CropScope>('auto');
  const [selectedOrgan, setSelectedOrgan] = useState<string>('crown');

  // Continuous Auto-Detection State
  const [autoScanActive, setAutoScanActive] = useState<boolean>(true);
  const [isScanningFrame, setIsScanningFrame] = useState<boolean>(false);
  const [detectedCropLive, setDetectedCropLive] = useState<{
    id: string;
    name: string;
    confidence: number;
  }>({
    id: 'pineapple',
    name: 'Manipur Queen Pineapple (GI #497)',
    confidence: 97.4,
  });
  const [detectedOrganLive, setDetectedOrganLive] = useState<{
    id: string;
    name: string;
    confidence: number;
  }>({
    id: 'crown',
    name: 'Crown Whorl (Rosette)',
    confidence: 94.2,
  });

  // Current Diagnosis & Remediation
  const [diagnosis, setDiagnosis] = useState<DiseaseDiagnosis | null>(INITIAL_DISEASE_DIAGNOSIS);
  const [activeRemedyTab, setActiveRemedyTab] = useState<'organic' | 'chemical'>('organic');
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>({
    compressedBlob: new Blob(),
    dataUrl: '',
    originalSizeBytes: 4210500,
    compressedSizeBytes: 218400,
    compressionRatio: 94.8,
    width: 1024,
    height: 768,
    sha256Hash: 'a7f93e8d2c4b5190e29d61845bb08c90fe3421dca90827bfa7c5e4f210d3e589',
  });

  // Camera stream states
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Snapshot Freeze state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Escalation Modal
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [escalationNotes, setEscalationNotes] = useState(
    'Automated field diagnostic detected critical risk. Inspection requested for Thoubal cluster.'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isScanningRef = useRef<boolean>(false);

  // Determine current active crop organs
  const activeCropKey = cropScope === 'auto' ? detectedCropLive.id : cropScope;
  const currentOrgans = CROP_ORGANS[activeCropKey] || CROP_ORGANS.pineapple;

  // Start live camera stream
  const startLiveCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Live camera not supported in this browser.');
      setIsCameraActive(false);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn('Autoplay error:', e));
        };
      }
      setIsCameraActive(true);
      setFacingMode(mode);
      setPreviewImage(null);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setIsCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Click "Start Live Camera" to enable continuous detection.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No physical camera detected.');
      } else {
        setCameraError('Camera stream temporarily unavailable.');
      }
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    startLiveCamera(nextMode);
  };

  useEffect(() => {
    startLiveCamera('environment');
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const selectedOrganRef = useRef<string>(selectedOrgan);
  useEffect(() => {
    selectedOrganRef.current = selectedOrgan;
  }, [selectedOrgan]);

  const cropScopeRef = useRef<CropScope>(cropScope);
  useEffect(() => {
    cropScopeRef.current = cropScope;
  }, [cropScope]);

  // Continuous Auto-Detection Loop: Optimized for 60fps UI responsiveness
  const executeFrameAutoDetection = useCallback(async () => {
    if (isScanningRef.current) return;
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2 || video.paused || video.ended) return;

    try {
      isScanningRef.current = true;
      setIsScanningFrame(true);

      // Fast lightweight offscreen canvas (MobileNet consumes 224x224)
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (facingMode === 'user') {
        ctx.translate(320, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, 320, 240);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.6)
      );

      if (!blob) return;

      const file = new File([blob], `frame.jpg`, { type: 'image/jpeg' });
      const currentScope = cropScopeRef.current;
      const cropHint = currentScope === 'auto' ? undefined : currentScope;

      const response = await api.autoDetectLiveFrame(file, cropHint, selectedOrganRef.current);

      // Single batched update
      setDetectedCropLive({
        id: response.detected_crop,
        name: response.crop_display_name,
        confidence: Math.round(response.crop_confidence * 100),
      });

      setDetectedOrganLive({
        id: response.detected_part,
        name: response.part_display_name,
        confidence: Math.round(response.part_confidence * 100),
      });

      const diag = response.diagnosis;
      setDiagnosis({
        id: `auto-diag-${Date.now()}`,
        predicted_class: diag.predicted_class,
        display_name: diag.display_name,
        crop_species: response.detected_crop,
        crop_display_name: response.crop_display_name,
        plant_part: response.detected_part,
        part_display_name: response.part_display_name,
        local_name_mtei: diag.local_name,
        confidence_score: diag.confidence_score,
        triage_status: diag.triage_status ?? 'confirmed',
        severity: (diag.severity_rating as any) || 'CRITICAL',
        inference_mode: response.inference_mode ?? 'offline_preset',
        evidence: response.evidence,
        symptoms_detected: diag.symptoms_detected || [],
        organic_treatments: [diag.organic_treatment],
        chemical_treatments: [diag.chemical_treatment],
        cultural_practices: [diag.cultural_practices],
        refer_to_expert: diag.refer_to_expert,
        image_angle: response.detected_part,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      // ignore frame drops silently
    } finally {
      setIsScanningFrame(false);
      isScanningRef.current = false;
    }
  }, [facingMode]);

  // Set up periodic loop when camera is active and auto-scan is enabled
  useEffect(() => {
    if (!isCameraActive || !autoScanActive || previewImage) {
      return;
    }

    const initialTimer = setTimeout(() => {
      executeFrameAutoDetection();
    }, 1200);

    const interval = setInterval(() => {
      executeFrameAutoDetection();
    }, 2800);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isCameraActive, autoScanActive, previewImage, executeFrameAutoDetection]);

  // Handle Manual Freeze / Snapshot
  const handleFreezeCurrentFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    try {
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 1024;
      const height = video.videoHeight || 768;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (facingMode === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);

      const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setPreviewImage(capturedDataUrl);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85)
      );

      if (blob) {
        const file = new File([blob], `frozen_frame_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const result = await compressFieldImage(file, 1024, 0.82);
        setCompressionInfo(result);

        await queueOfflineScan({
          id: `freeze-${Date.now()}`,
          timestamp: new Date().toISOString(),
          imageBlobUrl: result.dataUrl,
          imageAngle: selectedOrgan,
          compressedSizeKb: Math.round(result.compressedSizeBytes / 1024),
          originalSizeKb: Math.round(result.originalSizeBytes / 1024),
          diagnosis: diagnosis || INITIAL_DISEASE_DIAGNOSIS,
        });
      }
    } catch (err) {
      console.error('Frame freeze error:', err);
    }
  };

  useEffect(() => {
    api.getModelCards().then(setModelCards).catch(() => setModelCards([]));
  }, []);

  const handleResumeLiveFeed = () => {
    setPreviewImage(null);
    if (!isCameraActive) {
      startLiveCamera();
    }
  };

  // Sends an image through the backend analyzer and renders the result. Shared by uploads and sample photos.
  const analyseFile = async (file: File, cropHint: string | undefined, organ: string, idPrefix: string) => {
    const response = await api.autoDetectLiveFrame(file, cropHint, organ);

    setDetectedCropLive({
      id: response.detected_crop,
      name: response.crop_display_name,
      confidence: Math.round(response.crop_confidence * 100),
    });
    setDetectedOrganLive({
      id: response.detected_part,
      name: response.part_display_name,
      confidence: Math.round(response.part_confidence * 100),
    });

    setSelectedOrgan(response.detected_part);
    const diag = response.diagnosis;
    setDiagnosis({
      id: `${idPrefix}-${Date.now()}`,
      predicted_class: diag.predicted_class,
      display_name: diag.display_name,
      crop_species: response.detected_crop,
      crop_display_name: response.crop_display_name,
      plant_part: response.detected_part,
      part_display_name: response.part_display_name,
      local_name_mtei: diag.local_name,
      confidence_score: diag.confidence_score,
      triage_status: diag.triage_status ?? 'confirmed',
      severity: (diag.severity_rating as any) || 'CRITICAL',
      inference_mode: response.inference_mode ?? 'offline_preset',
      evidence: response.evidence,
      symptoms_detected: diag.symptoms_detected || [],
      organic_treatments: [diag.organic_treatment],
      chemical_treatments: [diag.chemical_treatment],
      cultural_practices: [diag.cultural_practices],
      refer_to_expert: diag.refer_to_expert,
      image_angle: response.detected_part,
      timestamp: new Date().toISOString(),
    });
    setEscalated(false);
  };

  // Handle File Upload Fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsScanningFrame(true);
      setActivePresetId(null);
      const result = await compressFieldImage(file, 1024, 0.82);
      setCompressionInfo(result);
      setPreviewImage(result.dataUrl);

      const uploadFile = new File([result.compressedBlob], 'field_upload.jpg', { type: 'image/jpeg' });
      await analyseFile(uploadFile, cropScope === 'auto' ? undefined : cropScope, selectedOrgan, 'upload-diag');
    } catch (err) {
      console.error('File diagnosis failed:', err);
    } finally {
      setIsScanningFrame(false);
    }
  };

  // Sample photos are analysed exactly like uploads, so the result always comes from the pixels.
  const handleSelectPreset = async (preset: typeof SAMPLE_PRESETS[0]) => {
    setCropScope(preset.crop);
    setSelectedOrgan(preset.organ);
    setActivePresetId(preset.id);
    setPreviewImage(preset.img);

    try {
      setIsScanningFrame(true);
      const blob = await (await fetch(preset.img)).blob();
      await analyseFile(new File([blob], `${preset.id}.jpg`, { type: blob.type || 'image/jpeg' }), preset.crop, preset.organ, 'sample-diag');
    } catch (err) {
      console.error('Sample photo analysis failed:', err);
    } finally {
      setIsScanningFrame(false);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Multimodal Diagnostic Mode Switcher: Vision vs Acoustic FFT */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#F1F5F9',
          padding: '0.3rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <button
          onClick={() => setScreeningMode('vision')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.8rem',
            borderRadius: '6px',
            border: 'none',
            background: screeningMode === 'vision' ? '#FFFFFF' : 'transparent',
            color: screeningMode === 'vision' ? '#0F172A' : '#64748B',
            fontWeight: screeningMode === 'vision' ? 800 : 600,
            fontSize: '0.78rem',
            cursor: 'pointer',
            boxShadow: screeningMode === 'vision' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.12s ease',
          }}
        >
          <Camera size={14} color={screeningMode === 'vision' ? '#EA580C' : '#64748B'} />
          <span>Optical Vision Screening (External Rind & Leaves)</span>
        </button>

        <button
          onClick={() => setScreeningMode('acoustic')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.8rem',
            borderRadius: '6px',
            border: 'none',
            background: screeningMode === 'acoustic' ? '#FFFFFF' : 'transparent',
            color: screeningMode === 'acoustic' ? '#4F46E5' : '#64748B',
            fontWeight: screeningMode === 'acoustic' ? 800 : 600,
            fontSize: '0.78rem',
            cursor: 'pointer',
            boxShadow: screeningMode === 'acoustic' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.12s ease',
          }}
        >
          <Waves size={14} color={screeningMode === 'acoustic' ? '#4F46E5' : '#64748B'} />
          <span>Acoustic &ldquo;Thumb-Thump&rdquo; Spectrometer (Internal Water Blister)</span>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '0.1rem 0.4rem',
              borderRadius: '999px',
              background: '#EEF2FF',
              color: '#4F46E5',
              border: '1px solid #C7D2FE',
            }}
          >
            INNOVATION #1
          </span>
        </button>
      </div>

      {screeningMode === 'acoustic' ? (
        <AcousticBioResonanceStudio />
      ) : (
        <>
          {/* Clean Scope Bar: Crop Scope Pills on Left, Auto-Scan Toggle on Right */}
          <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.6rem',
          padding: '0.45rem 0.65rem',
          borderRadius: 'var(--radius-md)',
          background: '#F8FAFC',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Left: Clean Text Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginRight: '0.2rem' }}>
            CROP:
          </span>
          {[
            { id: 'auto', label: 'Auto (All Crops)' },
            { id: 'pineapple', label: 'Pineapple' },
            { id: 'rice', label: 'Rice' },
            { id: 'orange', label: 'Orange' },
          ].map((scope) => {
            const isActive = cropScope === scope.id;
            return (
              <button
                key={scope.id}
                onClick={() => {
                  setCropScope(scope.id as CropScope);
                  if (scope.id !== 'auto') {
                    const defaultOrgans = CROP_ORGANS[scope.id];
                    if (defaultOrgans && defaultOrgans[0]) {
                      setSelectedOrgan(defaultOrgans[0].id);
                    }
                  }
                }}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.74rem',
                  borderRadius: 'var(--radius-full)',
                  border: isActive ? '1px solid var(--brand-orange)' : '1px solid var(--border-subtle)',
                  background: isActive ? '#FFF7ED' : '#FFFFFF',
                  color: isActive ? '#EA580C' : 'var(--text-secondary)',
                  fontWeight: isActive ? 800 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {scope.label}
                {scope.id === 'orange' && (
                  <span
                    title="No trained model yet: explainable colour analysis only"
                    style={{ marginLeft: '0.35rem', fontSize: '0.58rem', fontWeight: 800, color: '#B45309', background: '#FEF3C7', borderRadius: '999px', padding: '0.05rem 0.4rem' }}
                  >
                    Preview
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Clean Auto-Scan Status Button */}
        <button
          onClick={() => setAutoScanActive(!autoScanActive)}
          title="Toggle Continuous Real-Time Auto-Detection"
          style={{
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            border: autoScanActive ? '1px solid #10B981' : '1px solid var(--border-medium)',
            background: autoScanActive ? '#ECFDF5' : '#FFFFFF',
            color: autoScanActive ? '#047857' : 'var(--text-muted)',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.12s ease',
          }}
        >
          {autoScanActive ? (
            <>
              <span className="pulse-dot pulse-dot-green" style={{ width: '6px', height: '6px' }} />
              <span>Auto-Scan: Active</span>
            </>
          ) : (
            <>
              <Pause size={11} />
              <span>Auto-Scan: Paused</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Viewfinder & Diagnosis Dashboard */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
          gap: '1.1rem',
        }}
      >
        {/* Left Column: Live Viewfinder */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Viewfinder Window */}
          <div
            style={{
              position: 'relative',
              height: '280px',
              borderRadius: 'var(--radius-md)',
              background: '#090D16',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* 1. Captured / Preset Frozen Snapshot */}
            {previewImage ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img
                  src={previewImage}
                  alt="Captured Crop Frame"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(254, 215, 170, 0.4)',
                    color: '#FED7AA',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F97316' }} />
                  <span>Snapshot Mode</span>
                </div>

                <button
                  type="button"
                  onClick={handleResumeLiveFeed}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(15, 23, 42, 0.85)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Video size={12} />
                  <span>Resume Live Cam</span>
                </button>
              </div>
            ) : isCameraActive ? (
              /* 2. Real-Time Camera Video Stream */
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                  }}
                />

                {/* Top-Left: Live Auto-Detect Status */}
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    color: '#4ADE80',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span className="pulse-dot pulse-dot-green" style={{ width: '6px', height: '6px' }} />
                  <span>{autoScanActive ? 'Auto-Scan Live' : 'Camera Feed'}</span>
                </div>

                {/* Top-Right: Camera Flip Toggle */}
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  title="Switch camera"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '0.25rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(15, 23, 42, 0.85)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <FlipHorizontal size={12} />
                  <span>{facingMode === 'environment' ? 'Rear' : 'Front'}</span>
                </button>

                {/* Clean HUD Badges Overlaid on Live Stream */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    right: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.88)',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(249, 115, 22, 0.4)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.25rem 0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#FED7AA',
                      fontSize: '0.7rem',
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>
                      Crop: {detectedCropLive.name}
                    </span>
                    <span style={{ color: '#4ADE80', fontWeight: 800 }}>
                      {detectedCropLive.confidence}%
                    </span>
                  </div>

                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.88)',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.22rem 0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#BAE6FD',
                      fontSize: '0.68rem',
                    }}
                  >
                    <span>
                      Organ: {detectedOrganLive.name}
                    </span>
                    <span style={{ color: '#38BDF8', fontWeight: 800 }}>
                      {detectedOrganLive.confidence}%
                    </span>
                  </div>
                </div>

                {/* Central Targeting Frame */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      width: '160px',
                      height: '160px',
                      border: isScanningFrame
                        ? '2px solid rgba(52, 211, 153, 0.85)'
                        : '1.5px dashed rgba(249, 115, 22, 0.55)',
                      borderRadius: '14px',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'border 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isScanningFrame ? '#34D399' : '#F97316',
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* 3. Fallback View when camera is inactive */
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img
                  src={currentOrgans[0]?.img || '/samples/crown_view.jpg'}
                  alt="Crop Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.75)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    textAlign: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Continuous AI Disease Detection
                  </div>
                  <p style={{ fontSize: '0.74rem', color: '#94A3B8', maxWidth: '280px', margin: 0 }}>
                    {cameraError ||
                      'Point camera at Pineapple, Rice, or Orange plants for automatic disease detection.'}
                  </p>
                  <button
                    onClick={() => startLiveCamera('environment')}
                    className="tap-target btn-primary"
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.76rem', gap: '0.35rem', marginTop: '0.25rem' }}
                  >
                    <Video size={13} />
                    <span>Start Live Camera</span>
                  </button>
                </div>
              </div>
            )}

            {/* Scanning Laser Line */}
            {isScanningFrame && <div className="animate-scan-line" />}

            {/* Corner Reticle Brackets */}
            <div style={{ position: 'absolute', top: 10, left: 10, width: 14, height: 14, borderTop: '2px solid #F97316', borderLeft: '2px solid #F97316', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 10, right: 10, width: 14, height: 14, borderTop: '2px solid #F97316', borderRight: '2px solid #F97316', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 10, left: 10, width: 14, height: 14, borderBottom: '2px solid #F97316', borderLeft: '2px solid #F97316', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 10, right: 10, width: 14, height: 14, borderBottom: '2px solid #F97316', borderRight: '2px solid #F97316', pointerEvents: 'none' }} />
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem' }}>
            {previewImage ? (
              <button
                onClick={handleResumeLiveFeed}
                className="tap-target btn-primary"
                style={{ fontSize: '0.8rem', gap: '0.35rem', justifyContent: 'center' }}
              >
                <Video size={14} />
                <span>Resume Live Cam</span>
              </button>
            ) : isCameraActive ? (
              <button
                onClick={handleFreezeCurrentFrame}
                className="tap-target btn-secondary"
                style={{ fontSize: '0.8rem', gap: '0.35rem', justifyContent: 'center' }}
              >
                <Pause size={13} />
                <span>Freeze Frame</span>
              </button>
            ) : (
              <button
                onClick={() => startLiveCamera('environment')}
                className="tap-target btn-primary"
                style={{ fontSize: '0.8rem', gap: '0.35rem', justifyContent: 'center' }}
              >
                <Video size={14} />
                <span>Start Live Cam</span>
              </button>
            )}

            <button
              onClick={toggleFacingMode}
              disabled={!isCameraActive || Boolean(previewImage)}
              className="tap-target btn-secondary"
              title="Flip camera"
              style={{
                fontSize: '0.76rem',
                gap: '0.3rem',
                justifyContent: 'center',
                opacity: !isCameraActive ? 0.6 : 1,
              }}
            >
              <FlipHorizontal size={13} />
              <span>Flip</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanningFrame}
              className="tap-target btn-secondary"
              title="Upload existing field photo"
              style={{ fontSize: '0.76rem', gap: '0.3rem', justifyContent: 'center' }}
            >
              <Upload size={13} />
              <span>Upload</span>
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

          {/* Clean Demo Presets Toolbar (Simple Pills) */}
          <div
            style={{
              padding: '0.45rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              background: '#F8FAFC',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              SAMPLE PHOTOS (analysed live by the backend):
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {SAMPLE_PRESETS.map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      padding: '0.2rem 0.55rem',
                      fontSize: '0.7rem',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '1px solid #EA580C' : '1px solid var(--border-subtle)',
                      background: isSelected ? '#FFF7ED' : '#FFFFFF',
                      color: isSelected ? '#EA580C' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 800 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', marginRight: '0.25rem', fontSize: '0.66rem' }}>
                      {preset.cropLabel}:
                    </span>
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {(() => {
            const card = modelCards.find((c) => c.crop === (diagnosis?.crop_species || detectedCropLive.id));
            if (!card) return null;
            const pretty = (list: string[]) => list.map((c) => c.replace(/_/g, ' ')).join(', ');
            return (
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', lineHeight: 1.45, padding: '0 0.2rem' }}>
                <strong>Model card · {card.crop}:</strong>{' '}
                {card.test_accuracy != null ? (
                  <>
                    MobileNetV3 trained on public leaf datasets, <strong>{(card.test_accuracy * 100).toFixed(1)}% accuracy</strong> on{' '}
                    {card.test_images} held-out images it never saw ({card.split_method}). Covers: {pretty(card.trained_classes)}.
                  </>
                ) : (
                  <>no trained model yet — explainable colour analysis only.</>
                )}
                {card.colour_rule_classes.length > 0 && card.test_accuracy != null && (
                  <> Screened by colour rules (no licensed training data): {pretty(card.colour_rule_classes)}.</>
                )}
                <> Public lab-style photos; field accuracy in Manipur is not yet validated.</>
              </div>
            );
          })()}
        </div>

        {/* Right Column: Clean Diagnosis Results Card */}
        {diagnosis && (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Header: Clean Risk Badge & Crop Metadata */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  DIAGNOSIS RESULT
                </span>
                <span
                  className={`badge ${
                    diagnosis.severity === 'CRITICAL'
                      ? 'badge-crimson'
                      : diagnosis.severity === 'MODERATE'
                      ? 'badge-orange'
                      : 'badge-green'
                  }`}
                  style={{ fontSize: '0.68rem' }}
                >
                  {diagnosis.severity === 'UNKNOWN' ? 'NEEDS EXPERT REVIEW' : `${diagnosis.severity} RISK`}
                </span>
              </div>

              {diagnosis.inference_mode && diagnosis.inference_mode !== 'trained_model' && (
                <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                  {diagnosis.inference_mode === 'offline_preset'
                    ? 'Offline preset — server unreachable, this is a sample result, not a scan of your photo.'
                    : `Screening aid: colour analysis of your photo (${Math.round((diagnosis.evidence?.plant_coverage ?? 0) * 100)}% plant tissue detected). Confirm with a KVK officer.`}
                </span>
              )}
              {diagnosis.triage_status === 'inconclusive' && (
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Inconclusive — retake in bright daylight or escalate to an officer.
                </span>
              )}

              {/* Clean Crop & Organ Line */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.74rem',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {diagnosis.crop_display_name || detectedCropLive.name}
                  </strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
                    • {diagnosis.part_display_name || detectedOrganLive.name}
                  </span>
                </div>
                <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.68rem' }}>
                  Auto-Detected
                </span>
              </div>

              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0.2rem 0 0 0' }}>
                {diagnosis.triage_status === 'inconclusive'
                  ? `No confident diagnosis · closest: ${diagnosis.display_name} (${diagnosis.confidence_score}%)`
                  : diagnosis.display_name}
              </h2>

              {diagnosis.local_name_mtei && (
                <div style={{ fontSize: '0.78rem', color: 'var(--brand-orange)', fontWeight: 600 }}>
                  {diagnosis.local_name_mtei}
                </div>
              )}
            </div>

            {/* Model Confidence Bar */}
            <div
              style={{
                background: '#F8FAFC',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Diagnostic Confidence
                </span>
                <span className="tabular-nums" style={{ fontSize: '1rem', fontWeight: 900, color: '#059669' }}>
                  {diagnosis.confidence_score.toFixed(1)}%
                </span>
              </div>

              <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${diagnosis.confidence_score}%`,
                    background: diagnosis.confidence_score >= 85 ? '#10B981' : '#F97316',
                    borderRadius: '3px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>

            {/* Pathological Symptoms */}
            <div>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '0.35rem',
                }}
              >
                Symptoms Identified:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {diagnosis.symptoms_detected.slice(0, 3).map((sym, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.76rem',
                      color: 'var(--text-secondary)',
                      background: '#F8FAFC',
                      padding: '0.35rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <CheckCircle size={12} style={{ color: '#F97316', flexShrink: 0 }} />
                    <span>{sym}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ICAR / CAU Advisory Treatments */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  ICAR / CAU Advisory
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={() => setActiveRemedyTab('organic')}
                    style={{
                      padding: '0.18rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: '4px',
                      background: activeRemedyTab === 'organic' ? '#059669' : 'transparent',
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
                      padding: '0.18rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: '4px',
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

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                {activeRemedyTab === 'organic'
                  ? diagnosis.organic_treatments[0] || 'Apply Trichoderma bio-fungicide and ensure proper drainage.'
                  : diagnosis.chemical_treatments[0] || 'Spray recommended protective fungicide per ICAR advisory.'}
              </p>
            </div>

            {/* Direct Action: District Officer Alert */}
            <div style={{ marginTop: 'auto' }}>
              <button
                onClick={() => setShowEscalationModal(true)}
                disabled={escalated}
                className="tap-target btn-outline-danger"
                style={{
                  width: '100%',
                  fontSize: '0.8rem',
                  gap: '0.4rem',
                  padding: '0.45rem',
                }}
              >
                <ShieldAlert size={14} />
                <span>{escalated ? '✓ Escalated to District Officer' : 'Escalate to District Horticulture Officer'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Escalation Modal */}
      {showEscalationModal && (
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
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '1.5rem', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Escalate to District Officer
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              Sends SMS and GPS coordinates to the Thoubal District Agriculture Office for urgent ground verification.
            </p>

            <textarea
              value={escalationNotes}
              onChange={(e) => setEscalationNotes(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: '#F8FAFC',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                resize: 'none',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setShowEscalationModal(false)}
                className="tap-target btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateConfirm}
                className="tap-target btn-primary"
                style={{ padding: '0.4rem 1.15rem', fontSize: '0.82rem' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
