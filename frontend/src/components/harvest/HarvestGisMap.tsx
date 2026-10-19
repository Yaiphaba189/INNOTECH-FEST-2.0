'use client';

import React, { useState, useMemo } from 'react';
import { GisMapCanvas, NdviStatus, ZoomCommand } from './GisMapCanvas';
import { useFarmer } from '@/context/FarmerContext';
import {
  Map,
  MapPin,
  Layers,
  Compass,
  Crosshair,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CloudRain,
  Thermometer,
  Leaf,
  Droplets,
  Activity,
  Navigation,
  Globe,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export interface GisClusterPreset {
  id: string;
  name: string;
  district: string;
  crop: string;
  giTag: string;
  centerLat: number;
  centerLng: number;
  elevationM: number;
  slopeAspect: string;
  soilType: string;
  totalAreaHa: number;
  currentGdd: number;
  targetGdd: number;
  ripenessPct: number;
  estimatedBrix: number;
  weatherRisk: string;
  rainFrontEtaHours: number;
  zones: {
    id: string;
    name: string;
    areaHa: number;
    elevationM: number;
    soilMoisturePct: number;
    gddAccumulated: number;
    maturityPct: number;
    sugarBrix: number;
    status: 'OPTIMAL' | 'NEAR_MATURE' | 'WATERLOGGED_RISK';
    recommendedHarvest: string;
    priority: number;
    svgPath: string;
    centroid: [number, number];
  }[];
}

export const GIS_CLUSTERS: GisClusterPreset[] = [
  {
    id: 'thoubal_andro',
    name: 'Andro East Terraces',
    district: 'Thoubal Cluster',
    crop: 'Queen Pineapple',
    giTag: 'GI Certificate #497',
    centerLat: 24.7523,
    centerLng: 94.0418,
    elevationM: 842,
    slopeAspect: 'South-East (14° Incline)',
    soilType: 'Lateritic Red Clay Loam (pH 5.2)',
    totalAreaHa: 1.2,
    currentGdd: 2478,
    targetGdd: 2500,
    ripenessPct: 99.1,
    estimatedBrix: 14.8,
    weatherRisk: 'High (65mm Downpour in 48h)',
    rainFrontEtaHours: 36,
    zones: [
      {
        id: 'zone-a',
        name: 'Terrace Zone A (Upper Ridge Crest)',
        areaHa: 0.45,
        elevationM: 865,
        soilMoisturePct: 62.4,
        gddAccumulated: 2478,
        maturityPct: 99.1,
        sugarBrix: 14.8,
        status: 'OPTIMAL',
        recommendedHarvest: 'Immediate (Next 24h Morning Pick)',
        priority: 1,
        svgPath: 'M 140,80 L 290,65 L 340,150 L 220,185 L 125,140 Z',
        centroid: [225, 120],
      },
      {
        id: 'zone-b',
        name: 'Terrace Zone B (Mid-Contour Slope)',
        areaHa: 0.50,
        elevationM: 840,
        soilMoisturePct: 68.2,
        gddAccumulated: 2390,
        maturityPct: 95.6,
        sugarBrix: 14.2,
        status: 'NEAR_MATURE',
        recommendedHarvest: 'Harvest in 24–48h Before Rain Peak',
        priority: 2,
        svgPath: 'M 220,185 L 340,150 L 410,230 L 285,275 L 175,230 Z',
        centroid: [285, 215],
      },
      {
        id: 'zone-c',
        name: 'Terrace Zone C (Valley Furrow Depression)',
        areaHa: 0.25,
        elevationM: 818,
        soilMoisturePct: 88.5,
        gddAccumulated: 2210,
        maturityPct: 88.4,
        sugarBrix: 13.1,
        status: 'WATERLOGGED_RISK',
        recommendedHarvest: 'Drain Contours Immediately; Harvest by Wed',
        priority: 3,
        svgPath: 'M 175,230 L 285,275 L 350,350 L 210,380 L 140,310 Z',
        centroid: [235, 310],
      },
    ],
  },
  {
    id: 'ccp_khousabung',
    name: 'Khousabung Hill Crest',
    district: 'Churachandpur Cluster',
    crop: 'Queen Pineapple',
    giTag: 'GI Certificate #497',
    centerLat: 24.3312,
    centerLng: 93.6821,
    elevationM: 885,
    slopeAspect: 'South-Southwest (18° Incline)',
    soilType: 'Laterite Mountain Terrace (pH 4.8)',
    totalAreaHa: 1.5,
    currentGdd: 2510,
    targetGdd: 2500,
    ripenessPct: 100.0,
    estimatedBrix: 15.2,
    weatherRisk: 'Critical (Pre-Monsoon Squall Front)',
    rainFrontEtaHours: 24,
    zones: [
      {
        id: 'ccp-z1',
        name: 'Khousabung High Bench',
        areaHa: 0.8,
        elevationM: 910,
        soilMoisturePct: 58.0,
        gddAccumulated: 2510,
        maturityPct: 100.0,
        sugarBrix: 15.2,
        status: 'OPTIMAL',
        recommendedHarvest: 'Harvest Today (Peak Export Sugar 15.2°)',
        priority: 1,
        svgPath: 'M 150,90 L 320,70 L 370,170 L 200,190 Z',
        centroid: [260, 130],
      },
      {
        id: 'ccp-z2',
        name: 'Khousabung Lower Sward',
        areaHa: 0.7,
        elevationM: 860,
        soilMoisturePct: 74.0,
        gddAccumulated: 2440,
        maturityPct: 97.6,
        sugarBrix: 14.5,
        status: 'NEAR_MATURE',
        recommendedHarvest: 'Harvest Tomorrow Morning',
        priority: 2,
        svgPath: 'M 200,190 L 370,170 L 400,280 L 210,290 Z',
        centroid: [290, 230],
      },
    ],
  },
  {
    id: 'bishnupur_nambol',
    name: 'Nambol Red Terraces',
    district: 'Bishnupur Cluster',
    crop: 'Kew Pineapple',
    giTag: 'Processing Variety (Juice/Slice)',
    centerLat: 24.7082,
    centerLng: 93.8341,
    elevationM: 790,
    slopeAspect: 'East-Facing Foothills (8° Incline)',
    soilType: 'Alluvial-Clay Composite (pH 5.8)',
    totalAreaHa: 2.1,
    currentGdd: 2360,
    targetGdd: 2500,
    ripenessPct: 94.4,
    estimatedBrix: 13.8,
    weatherRisk: 'Moderate (Humid Lake Moisture)',
    rainFrontEtaHours: 42,
    zones: [
      {
        id: 'bnp-z1',
        name: 'Foothill Plot Alpha',
        areaHa: 1.1,
        elevationM: 805,
        soilMoisturePct: 65.0,
        gddAccumulated: 2380,
        maturityPct: 95.2,
        sugarBrix: 13.9,
        status: 'NEAR_MATURE',
        recommendedHarvest: 'In 3 to 4 Days',
        priority: 2,
        svgPath: 'M 130,80 L 330,80 L 350,220 L 150,220 Z',
        centroid: [240, 150],
      },
      {
        id: 'bnp-z2',
        name: 'Canal Bordering Plot',
        areaHa: 1.0,
        elevationM: 775,
        soilMoisturePct: 82.0,
        gddAccumulated: 2340,
        maturityPct: 93.6,
        sugarBrix: 13.7,
        status: 'WATERLOGGED_RISK',
        recommendedHarvest: 'Clear Drainage Furrows; Harvest in 3 Days',
        priority: 3,
        svgPath: 'M 150,220 L 350,220 L 330,360 L 140,360 Z',
        centroid: [240, 290],
      },
    ],
  },
];

interface HarvestGisMapProps {
  onSelectZone?: (zoneName: string, maturity: number, brix: number) => void;
  onTagForPooling?: () => void;
}

export const HarvestGisMap: React.FC<HarvestGisMapProps> = ({
  onSelectZone,
  onTagForPooling,
}) => {
  const { rain, lot } = useFarmer();
  const rainMm = Math.round(rain.mm);
  // Open on the cluster that holds the farmer's lot so the map, header and market all describe the same farm.
  const [selectedClusterId, setSelectedClusterId] = useState<string>(
    () => GIS_CLUSTERS.find((c) => c.district.startsWith(lot.district))?.id ?? 'thoubal_andro'
  );
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-a');
  const [activeLayers, setActiveLayers] = useState<{
    satellite: boolean;
    ndvi: boolean;
    gdd: boolean;
    doppler: boolean;
    drainage: boolean;
    cadastral: boolean;
  }>({
    satellite: true,
    ndvi: false,
    gdd: true,
    doppler: true,
    drainage: false,
    cadastral: true,
  });

  const [zoomCommand, setZoomCommand] = useState<ZoomCommand | null>(null);
  const sendZoom = (kind: ZoomCommand['kind']) => setZoomCommand((c) => ({ id: (c?.id ?? 0) + 1, kind }));
  const [hoverCoord, setHoverCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [ndviStatus, setNdviStatus] = useState<NdviStatus>({ state: 'loading' });
  const [radarStatus, setRadarStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isTagged, setIsTagged] = useState<boolean>(false);

  const cluster = useMemo(() => {
    return GIS_CLUSTERS.find((c) => c.id === selectedClusterId) || GIS_CLUSTERS[0];
  }, [selectedClusterId]);

  const activeZone = useMemo(() => {
    return cluster.zones.find((z) => z.id === selectedZoneId) || cluster.zones[0];
  }, [cluster, selectedZoneId]);

  const handleSelectZone = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    const z = cluster.zones.find((item) => item.id === zoneId);
    if (z && onSelectZone) {
      onSelectZone(z.name, z.maturityPct, z.sugarBrix);
    }
  };

  const handleTagPooling = () => {
    setIsTagged(true);
    if (onTagForPooling) {
      setTimeout(() => onTagForPooling(), 600);
    }
  };

  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        padding: '1.15rem',
        border: '1px solid var(--border-medium)',
        background: '#FFFFFF',
      }}
    >
      {/* Top Header: GIS Map Title, Cluster Selector & Spatial Badges */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
            }}
          >
            <Globe size={18} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Horticultural GIS Spatial Radar
              </h2>
              <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
                <Activity size={10} />
                Sentinel-2 L2A · Esri imagery
              </span>
              <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>
                Illustrative parcels
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              Satellite imagery, real Sentinel-2 NDVI, live rain radar and per-terrace thermal (GDD) tracking.
            </div>
          </div>
        </div>

        {/* Cluster Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', marginRight: '0.2rem' }}>
            CLUSTER:
          </span>
          {GIS_CLUSTERS.map((c) => {
            const isSelected = selectedClusterId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedClusterId(c.id);
                  setSelectedZoneId(c.zones[0].id);
                }}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid #0284C7' : '1px solid var(--border-subtle)',
                  background: isSelected ? '#EFF6FF' : '#FFFFFF',
                  color: isSelected ? '#0369A1' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <MapPin size={11} style={{ color: isSelected ? '#0284C7' : 'var(--text-muted)' }} />
                <span>{c.district.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* GIS Command Bar: Layer Toggles, Zoom, and Mode */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          background: '#F8FAFC',
          padding: '0.45rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Layer Switches */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', marginRight: '0.2rem' }}>
            GIS LAYERS:
          </span>

          <button
            onClick={() => toggleLayer('satellite')}
            style={{
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              border: activeLayers.satellite ? '1px solid #0284C7' : '1px solid var(--border-subtle)',
              background: activeLayers.satellite ? '#EFF6FF' : '#FFFFFF',
              color: activeLayers.satellite ? '#0369A1' : 'var(--text-secondary)',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Globe size={11} />
            <span>Satellite RGB</span>
          </button>

          <button
            onClick={() => toggleLayer('ndvi')}
            style={{
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              border: activeLayers.ndvi ? '1px solid #10B981' : '1px solid var(--border-subtle)',
              background: activeLayers.ndvi ? '#ECFDF5' : '#FFFFFF',
              color: activeLayers.ndvi ? '#065F46' : 'var(--text-secondary)',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Leaf size={11} />
            <span>NDVI Biomass</span>
          </button>

          <button
            onClick={() => toggleLayer('gdd')}
            style={{
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              border: activeLayers.gdd ? '1px solid #EA580C' : '1px solid var(--border-subtle)',
              background: activeLayers.gdd ? '#FFF7ED' : '#FFFFFF',
              color: activeLayers.gdd ? '#C2410C' : 'var(--text-secondary)',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Thermometer size={11} />
            <span>GDD by Terrace</span>
          </button>

          <button
            onClick={() => toggleLayer('doppler')}
            style={{
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              border: activeLayers.doppler ? '1px solid #3B82F6' : '1px solid var(--border-subtle)',
              background: activeLayers.doppler ? '#EFF6FF' : '#FFFFFF',
              color: activeLayers.doppler ? '#1D4ED8' : 'var(--text-secondary)',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <CloudRain size={11} />
            <span>Rain Radar · {rainMm}mm/48h</span>
          </button>

          <button
            onClick={() => toggleLayer('cadastral')}
            style={{
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              border: activeLayers.cadastral ? '1px solid #8B5CF6' : '1px solid var(--border-subtle)',
              background: activeLayers.cadastral ? '#F5F3FF' : '#FFFFFF',
              color: activeLayers.cadastral ? '#6D28D9' : 'var(--text-secondary)',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Layers size={11} />
            <span>Cadastral Parcels</span>
          </button>
        </div>

        {/* Map View Zoom Controls & PostGIS Spec Inspector Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => sendZoom('in')}
            style={{
              padding: '0.25rem 0.45rem',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: '#FFFFFF',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={() => sendZoom('out')}
            style={{
              padding: '0.25rem 0.45rem',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: '#FFFFFF',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <button
            onClick={() => sendZoom('reset')}
            style={{
              padding: '0.25rem 0.45rem',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: '#FFFFFF',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
            title="Reset Map View"
          >
            <RotateCcw size={13} />
          </button>

          <button
            onClick={() => setIsInspectorOpen((open) => !open)}
            style={{
              padding: '0.22rem 0.6rem',
              borderRadius: '6px',
              border: isInspectorOpen ? '1px solid #0284C7' : '1px solid var(--border-subtle)',
              background: isInspectorOpen ? '#EFF6FF' : '#FFFFFF',
              color: isInspectorOpen ? '#0369A1' : 'var(--text-secondary)',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Info size={12} />
            <span>GeoJSON</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Map & Spatial HUD Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Left Column: High-tech GIS Map Canvas */}
        <div
          style={{
            position: 'relative',
            height: '470px',
            borderRadius: 'var(--radius-md)',
            background: '#0B1120',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 25px rgba(0, 0, 0, 0.7), 0 4px 14px rgba(15, 23, 42, 0.1)',
            border: '1px solid #1E293B',
          }}
        >
          <GisMapCanvas
            cluster={cluster}
            selectedZoneId={activeZone.id}
            layers={activeLayers}
            zoomCommand={zoomCommand}
            onSelectZone={handleSelectZone}
            onHover={setHoverCoord}
            onNdviStatus={setNdviStatus}
            onRadarStatus={setRadarStatus}
          />

          {/* GIS Map Corner Overlay: Live Coordinates & North Arrow */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(11, 17, 32, 0.88)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#F8FAFC',
              fontSize: '0.68rem',
              fontFamily: 'monospace',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.15rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38BDF8', fontWeight: 800 }}>
              <Navigation size={11} style={{ transform: 'rotate(-45deg)' }} />
              <span>
                {hoverCoord
                  ? `LAT: ${hoverCoord.lat}°N  LNG: ${hoverCoord.lng}°E`
                  : `LAT: ${cluster.centerLat}°N  LNG: ${cluster.centerLng}°E`}
              </span>
            </div>
            <div style={{ color: '#94A3B8' }}>
              ELEV ≈ {cluster.elevationM}m AMSL • ASPECT: {cluster.slopeAspect.split('(')[0]}
            </div>
          </div>

          {/* Active Selected Zone Floating Pill */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: activeZone.status === 'OPTIMAL' ? 'rgba(5, 150, 105, 0.92)' : 'rgba(234, 88, 12, 0.92)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              fontSize: '0.7rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#FFFFFF',
              }}
            />
            <span>{activeZone.name.split('(')[0].trim()}: {activeZone.maturityPct}% Ready</span>
          </div>

          {/* Layer status: real Sentinel-2 scene / radar state */}
          {(activeLayers.ndvi || activeLayers.doppler) && (
            <div
              style={{
                position: 'absolute',
                bottom: '38px',
                left: '10px',
                maxWidth: '240px',
                background: 'rgba(11, 17, 32, 0.9)',
                padding: '0.4rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
                fontSize: '0.62rem',
                color: '#E2E8F0',
              }}
            >
              {activeLayers.ndvi && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontWeight: 800, color: '#4ADE80' }}>
                    {ndviStatus.state === 'ready'
                      ? `NDVI · Sentinel-2 · ${ndviStatus.scene.date} · ${ndviStatus.scene.cloudPct}% cloud`
                      : ndviStatus.state === 'loading'
                        ? 'NDVI · finding latest clear Sentinel-2 scene…'
                        : 'NDVI unavailable (offline or no clear scene)'}
                  </span>
                  <div
                    style={{
                      width: '120px',
                      height: '6px',
                      borderRadius: '3px',
                      background: 'linear-gradient(90deg, #A50026 0%, #F46D43 20%, #FEE08B 40%, #A6D96A 65%, #006837 100%)',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '120px', color: '#94A3B8', fontFamily: 'monospace' }}>
                    <span>-0.2 bare</span>
                    <span>0.9 dense</span>
                  </div>
                </div>
              )}
              {activeLayers.doppler && (
                <span style={{ fontWeight: 800, color: '#7DD3FC' }}>
                  {radarStatus === 'ready'
                    ? `Radar · RainViewer loop · forecast ${rainMm} mm in ${Math.round(rain.etaHours)} h (Open-Meteo)`
                    : radarStatus === 'loading'
                      ? 'Radar · loading frames…'
                      : 'Radar unavailable (offline)'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Spatial Cadastral Inspector & Harvest Decision Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Selected Parcel Telemetry Box */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: activeZone.status === 'OPTIMAL' ? '#F0FDF4' : '#FFF7ED',
              border: activeZone.status === 'OPTIMAL' ? '1px solid #BBF7D0' : '1px solid #FED7AA',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                SPATIAL INSPECTION • {cluster.name}
              </div>
              <span
                className={activeZone.status === 'OPTIMAL' ? 'badge badge-green' : 'badge badge-orange'}
                style={{ fontSize: '0.66rem' }}
              >
                {activeZone.status === 'OPTIMAL' ? 'Grade A Export Ready' : 'Monitoring Window'}
              </span>
            </div>

            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {activeZone.name}
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Crop: <strong>{cluster.crop}</strong> ({cluster.giTag}) • Area: <strong>{activeZone.areaHa} Hectares</strong>
            </div>

            {/* Metric Chips */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.45rem',
                marginTop: '0.6rem',
              }}
            >
              <div style={{ background: '#FFFFFF', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700 }}>RIPENESS</div>
                <div className="tabular-nums" style={{ fontSize: '0.92rem', fontWeight: 900, color: '#059669' }}>
                  {activeZone.maturityPct}%
                </div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700 }}>SWEETNESS</div>
                <div className="tabular-nums" style={{ fontSize: '0.92rem', fontWeight: 900, color: '#EA580C' }}>
                  {activeZone.sugarBrix}° Brix
                </div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700 }}>SOIL MOISTURE</div>
                <div className="tabular-nums" style={{ fontSize: '0.92rem', fontWeight: 900, color: activeZone.soilMoisturePct > 80 ? '#DC2626' : '#0284C7' }}>
                  {activeZone.soilMoisturePct}%
                </div>
              </div>
            </div>

            {/* Agronomic Recommendation */}
            <div
              style={{
                marginTop: '0.6rem',
                padding: '0.5rem 0.65rem',
                borderRadius: '6px',
                background: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.74rem',
                color: 'var(--text-primary)',
                lineHeight: 1.45,
              }}
            >
              <div style={{ fontWeight: 800, color: '#EA580C', marginBottom: '0.15rem' }}>
                SPATIAL ACTION ADVISORY:
              </div>
              {activeZone.recommendedHarvest}. Downpour front of {rainMm}mm arriving in about {Math.round(rain.etaHours)}h across the {cluster.district} corridor. Picking before front protects Grade A sugar concentration.
            </div>
          </div>

          {/* Quick Sub-Parcel Zone Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              SELECT SUB-PARCEL TERRACE TO FOCUS:
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {cluster.zones.map((zone) => {
                const isSelected = selectedZoneId === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => handleSelectZone(zone.id)}
                    style={{
                      flex: '1 1 140px',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1.5px solid #F97316' : '1px solid var(--border-subtle)',
                      background: isSelected ? '#FFF7ED' : '#F8FAFC',
                      color: isSelected ? '#EA580C' : 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.75rem' }}>
                      {zone.name.split('(')[0].trim()}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {zone.areaHa} ha • {zone.maturityPct}% Maturity
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Consignment Tagging Action */}
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: '#F8FAFC',
              border: '1px solid var(--border-subtle)',
              marginTop: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Link Parcel Lot to Collective Logistics
              </span>
              <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
                450 kg Ready
              </span>
            </div>

            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0.5rem 0' }}>
              Register this terrace into the {cluster.district.replace(' Cluster', '')} FPO logistics route before the {rainMm}mm downpour front arrives (~{Math.round(rain.etaHours)}h).
            </p>

            <button
              onClick={handleTagPooling}
              disabled={isTagged}
              className="tap-target btn-primary"
              style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem 0.85rem', gap: '0.4rem' }}
            >
              <CheckCircle2 size={14} />
              <span>{isTagged ? 'Tagged & Scheduled for FPO Truck #2!' : 'Schedule FPO Truck Consolidation'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* PostGIS GeoJSON Modal Inspector */}
      {isInspectorOpen && (
        <div
          style={{
            background: '#0F172A',
            color: '#F8FAFC',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #334155',
            marginTop: '0.25rem',
            fontSize: '0.72rem',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: 800, color: '#38BDF8' }}>
              POSTGIS GEOSPATIAL POLYGON DEFINITION (EPSG:4326)
            </span>
            <button
              onClick={() => setIsInspectorOpen(false)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              ✕ Close
            </button>
          </div>
          <pre style={{ margin: 0, overflowX: 'auto', color: '#CBD5E1', lineHeight: 1.4 }}>
{`{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "coordinates": [[
      [${cluster.centerLng - 0.002}, ${cluster.centerLat - 0.002}],
      [${cluster.centerLng + 0.003}, ${cluster.centerLat - 0.001}],
      [${cluster.centerLng + 0.002}, ${cluster.centerLat + 0.003}],
      [${cluster.centerLng - 0.003}, ${cluster.centerLat + 0.002}],
      [${cluster.centerLng - 0.002}, ${cluster.centerLat - 0.002}]
    ]]
  },
  "properties": {
    "cluster_id": "${cluster.id}",
    "parcel_cadastral_code": "MN-CAD-2026-0891",
    "district": "${cluster.district}",
    "elevation_amsl_m": ${cluster.elevationM},
    "slope_gradient": "${cluster.slopeAspect}",
    "gdd_accumulated": ${cluster.currentGdd},
    "soil_taxonomy": "${cluster.soilType}",
    "active_subparcel": "${activeZone.id}",
    "sugar_brix_est": ${activeZone.sugarBrix}
  }
}`}
          </pre>
        </div>
      )}
    </div>
  );
};
