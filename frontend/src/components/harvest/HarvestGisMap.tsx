'use client';

import React, { useState, useMemo } from 'react';
import { GisMapCanvas, NdviStatus, ZoomCommand, FarmerPin } from './GisMapCanvas';
import { useFarmer } from '@/context/FarmerContext';
import { useAuth } from '@/context/AuthContext';
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
  const { user } = useAuth();
  const { rain, lot } = useFarmer();
  const rainMm = Math.round(rain.mm);
  const farmerName =
    user?.full_name ||
    (lot.farmer_name ? lot.farmer_name.split(' ')[0] + ' ' + (lot.farmer_name.split(' ')[1] || '') : 'Tombi Singh');

  // Open on Khousabung Hill Crest (Churachandpur Cluster) for the logged-in farmer
  const initialCluster = useMemo(() => {
    if (user?.role === 'farmer' || lot.district.toLowerCase().includes('churachandpur')) {
      return GIS_CLUSTERS.find((c) => c.id === 'ccp_khousabung') || GIS_CLUSTERS[0];
    }
    return GIS_CLUSTERS.find((c) => c.district.startsWith(lot.district)) || GIS_CLUSTERS[0];
  }, [user?.role, lot.district]);

  const [selectedClusterId, setSelectedClusterId] = useState<string>(initialCluster.id);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(initialCluster.zones[0]?.id || 'ccp-z1');
  const [isPinpointMode, setIsPinpointMode] = useState<boolean>(false);
  const [pinnedCoords, setPinnedCoords] = useState<{ lat: number; lng: number }>({
    lat: initialCluster.centerLat,
    lng: initialCluster.centerLng,
  });
  const [pinToast, setPinToast] = useState<string | null>(null);

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

  const farmerPin: FarmerPin = useMemo(() => {
    return {
      lat: pinnedCoords.lat,
      lng: pinnedCoords.lng,
      farmerName: farmerName.trim(),
      parcelName: activeZone.name.split('(')[0].trim(),
    };
  }, [pinnedCoords, farmerName, activeZone.name]);

  const handleSelectZone = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    const z = cluster.zones.find((item) => item.id === zoneId);
    if (z) {
      if (cluster.id === 'ccp_khousabung') {
        if (z.id === 'ccp-z1') {
          setPinnedCoords({ lat: 24.3312, lng: 93.6821 });
        } else if (z.id === 'ccp-z2') {
          setPinnedCoords({ lat: 24.3298, lng: 93.6835 });
        }
      } else {
        setPinnedCoords({ lat: cluster.centerLat, lng: cluster.centerLng });
      }
      if (onSelectZone) {
        onSelectZone(z.name, z.maturityPct, z.sugarBrix);
      }
    }
  };

  const handleSelectCluster = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    const c = GIS_CLUSTERS.find((x) => x.id === clusterId);
    if (c && c.zones.length > 0) {
      setSelectedZoneId(c.zones[0].id);
      setPinnedCoords({ lat: c.centerLat, lng: c.centerLng });
      sendZoom('reset');
    }
  };

  const handleMapPinpoint = (coords: { lat: number; lng: number }) => {
    setPinnedCoords(coords);
    setPinToast(`Farm stand pinpointed: ${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E`);
    setTimeout(() => setPinToast(null), 3500);
  };

  const handleLocateFarmerStand = () => {
    setSelectedClusterId('ccp_khousabung');
    setSelectedZoneId('ccp-z1');
    setPinnedCoords({ lat: 24.3312, lng: 93.6821 });
    sendZoom('reset');
    setPinToast(`Focused on ${farmerName}'s Khousabung High Bench (24.3312°N, 93.6821°E)`);
    setTimeout(() => setPinToast(null), 3500);
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
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        padding: '1.15rem',
        border: '1px solid var(--border-medium)',
        background: '#FFFFFF',
      }}
    >
      {/* Top Header: Title, Subtitle & Cluster Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem',
          borderBottom: '1px solid #F1E4D8',
          paddingBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: '#FFF7ED',
              border: '1px solid #FED7AA',
              color: '#FB923C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Globe size={18} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#21170F', margin: 0 }}>
                Horticultural GIS Spatial Radar
              </h2>
              <span className="badge badge-green" style={{ fontSize: '11px', fontWeight: 600 }}>
                Live Sentinel-2 & Doppler
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#6E5A4A', marginTop: '0.2rem' }}>
              Multi-spectral Sentinel-2 NDVI, real-time rain radar, and terrace thermal tracking.
            </div>
          </div>
        </div>

        {/* Cluster Selector Segmented Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#6E5A4A', letterSpacing: '0.04em' }}>
            CLUSTER:
          </span>
          <div style={{ display: 'flex', gap: '4px', background: '#FFFBF7', border: '1px solid #F1E4D8', padding: '3px', borderRadius: '6px' }}>
            {GIS_CLUSTERS.map((c) => {
              const isSelected = selectedClusterId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCluster(c.id)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: isSelected ? '#FB923C' : 'transparent',
                    color: isSelected ? '#FFFFFF' : '#6E5A4A',
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <MapPin size={11} color={isSelected ? '#FFFFFF' : '#6E5A4A'} />
                  <span>{c.district.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* GIS Command Bar: Layer Toggles & Map Tools */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          background: '#FFFBF7',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          border: '1px solid #F1E4D8',
        }}
      >
        {/* Layer Switches */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#6E5A4A', marginRight: '0.2rem', letterSpacing: '0.04em' }}>
            LAYERS:
          </span>

          <button
            type="button"
            onClick={() => toggleLayer('satellite')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              border: activeLayers.satellite ? '1px solid #FB923C' : '1px solid #F1E4D8',
              background: activeLayers.satellite ? '#FFF7ED' : '#FFFFFF',
              color: activeLayers.satellite ? '#F97316' : '#6E5A4A',
              fontSize: '12px',
              fontWeight: activeLayers.satellite ? 600 : 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Globe size={12} />
            <span>Satellite RGB</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('ndvi')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              border: activeLayers.ndvi ? '1px solid #F97316' : '1px solid #F1E4D8',
              background: activeLayers.ndvi ? 'var(--accent-green-light)' : '#FFFFFF',
              color: activeLayers.ndvi ? '#F97316' : '#6E5A4A',
              fontSize: '12px',
              fontWeight: activeLayers.ndvi ? 600 : 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Leaf size={12} />
            <span>NDVI Biomass</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('gdd')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              border: activeLayers.gdd ? '1px solid #783f0a' : '1px solid #F1E4D8',
              background: activeLayers.gdd ? '#fbf4ea' : '#FFFFFF',
              color: activeLayers.gdd ? '#783f0a' : '#6E5A4A',
              fontSize: '12px',
              fontWeight: activeLayers.gdd ? 600 : 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Thermometer size={12} />
            <span>GDD by Terrace</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('doppler')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              border: activeLayers.doppler ? '1px solid #2f70bb' : '1px solid #F1E4D8',
              background: activeLayers.doppler ? '#eaf2fa' : '#FFFFFF',
              color: activeLayers.doppler ? '#1e528e' : '#6E5A4A',
              fontSize: '12px',
              fontWeight: activeLayers.doppler ? 600 : 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <CloudRain size={12} />
            <span>Rain Radar ({rainMm}mm)</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('cadastral')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              border: activeLayers.cadastral ? '1px solid #FB923C' : '1px solid #F1E4D8',
              background: activeLayers.cadastral ? '#FFF7ED' : '#FFFFFF',
              color: activeLayers.cadastral ? '#F97316' : '#6E5A4A',
              fontSize: '12px',
              fontWeight: activeLayers.cadastral ? 600 : 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Layers size={12} />
            <span>Cadastral Parcels</span>
          </button>
        </div>

        {/* Map View Zoom Controls & Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', border: '1px solid #F1E4D8', borderRadius: '4px', background: '#FFFFFF', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => sendZoom('out')}
              style={{
                padding: '0.25rem 0.45rem',
                border: 'none',
                background: 'transparent',
                color: '#21170F',
                cursor: 'pointer',
              }}
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <div style={{ width: '1px', background: '#F1E4D8' }} />
            <button
              type="button"
              onClick={() => sendZoom('in')}
              style={{
                padding: '0.25rem 0.45rem',
                border: 'none',
                background: 'transparent',
                color: '#21170F',
                cursor: 'pointer',
              }}
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <div style={{ width: '1px', background: '#F1E4D8' }} />
            <button
              type="button"
              onClick={() => sendZoom('reset')}
              style={{
                padding: '0.25rem 0.45rem',
                border: 'none',
                background: 'transparent',
                color: '#21170F',
                cursor: 'pointer',
              }}
              title="Reset View"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleLocateFarmerStand}
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              border: '1px solid #FED7AA',
              background: '#FFF7ED',
              color: '#F97316',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
            title="Focus Farmer Stand"
          >
            <Crosshair size={13} color="#FB923C" />
            <span>Locate Farm Stand</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPinpointMode((m) => !m);
              setPinToast(
                !isPinpointMode
                  ? 'Pinpoint Mode: Click anywhere on the map to place custom pin'
                  : null
              );
            }}
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              border: isPinpointMode ? '1px solid #F97316' : '1px solid #F1E4D8',
              background: isPinpointMode ? 'var(--accent-green-light)' : '#FFFFFF',
              color: isPinpointMode ? '#F97316' : '#6E5A4A',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
            title="Toggle Pinpoint Mode"
          >
            <MapPin size={12} color={isPinpointMode ? '#F97316' : '#6E5A4A'} />
            <span>{isPinpointMode ? 'Pinpoint: ON' : 'Pinpoint Map'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsInspectorOpen((open) => !open)}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              border: isInspectorOpen ? '1px solid #2f70bb' : '1px solid #F1E4D8',
              background: isInspectorOpen ? '#eaf2fa' : '#FFFFFF',
              color: isInspectorOpen ? '#1e528e' : '#6E5A4A',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
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
            minHeight: '470px',
            height: '100%',
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
            farmerPin={farmerPin}
            isPinpointMode={isPinpointMode}
            onSelectZone={handleSelectZone}
            onPinpoint={handleMapPinpoint}
            onHover={setHoverCoord}
            onNdviStatus={setNdviStatus}
            onRadarStatus={setRadarStatus}
          />

          {/* Pinpoint Notification Toast */}
          {pinToast && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(11, 17, 32, 0.95)',
                color: '#FFFFFF',
                border: '1.5px solid #FB923C',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.9rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(251, 146, 60, 0.4)',
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap',
              }}
            >
              <Crosshair size={13} color="#FB923C" />
              <span>{pinToast}</span>
            </div>
          )}

          {/* GIS Map Corner Overlay: Live Coordinates & North Arrow */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              padding: '0.4rem 0.7rem',
              borderRadius: '6px',
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#F8FAFC',
              fontSize: '0.68rem',
              fontFamily: 'monospace',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.15rem',
              zIndex: 5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38BDF8', fontWeight: 700 }}>
              <Navigation size={11} style={{ transform: 'rotate(-45deg)' }} />
              <span>
                {hoverCoord
                  ? `LAT: ${hoverCoord.lat.toFixed(4)}°N  LNG: ${hoverCoord.lng.toFixed(4)}°E`
                  : pinnedCoords
                    ? `LAT: ${pinnedCoords.lat.toFixed(4)}°N  LNG: ${pinnedCoords.lng.toFixed(4)}°E`
                    : `LAT: ${cluster.centerLat.toFixed(4)}°N  LNG: ${cluster.centerLng.toFixed(4)}°E`}
              </span>
            </div>
            <div style={{ color: '#94A3B8', fontSize: '0.64rem' }}>
              ELEV ≈ {cluster.elevationM}m AMSL • ASPECT: {cluster.slopeAspect.split('(')[0].trim()}
            </div>
          </div>

          {/* Active Selected Zone Pill */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#F8FAFC',
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              zIndex: 5,
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: activeZone.status === 'OPTIMAL' ? '#FB923C' : '#FB923C',
                display: 'inline-block',
                boxShadow: activeZone.status === 'OPTIMAL' ? '0 0 6px #FB923C' : '0 0 6px #FB923C',
              }}
            />
            <span>{activeZone.name.split('(')[0].trim()}</span>
            <span style={{ color: '#94A3B8', fontWeight: 500 }}>·</span>
            <span style={{ color: activeZone.status === 'OPTIMAL' ? '#FB923C' : '#FDBA74' }}>{activeZone.maturityPct}% Ready</span>
          </div>

          {/* Layer status: real Sentinel-2 scene / radar state */}
          {(activeLayers.ndvi || activeLayers.doppler) && (
            <div
              style={{
                position: 'absolute',
                bottom: '34px',
                left: '10px',
                maxWidth: '280px',
                background: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(8px)',
                padding: '0.45rem 0.7rem',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
                fontSize: '0.64rem',
                color: '#E2E8F0',
                zIndex: 5,
              }}
            >
              {activeLayers.ndvi && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontWeight: 700, color: '#FB923C' }}>
                    {ndviStatus.state === 'ready'
                      ? `NDVI · Sentinel-2 · ${ndviStatus.scene.date} · ${ndviStatus.scene.cloudPct}% cloud`
                      : ndviStatus.state === 'loading'
                        ? 'NDVI · finding latest clear Sentinel-2 scene…'
                        : 'NDVI unavailable (offline or no clear scene)'}
                  </span>
                  <div
                    style={{
                      width: '130px',
                      height: '5px',
                      borderRadius: '3px',
                      background: 'linear-gradient(90deg, #A50026 0%, #F46D43 20%, #FEE08B 40%, #A6D96A 65%, #006837 100%)', // taste-skill-ignore: scientific false-colour NDVI data scale
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '130px', color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.58rem' }}>
                    <span>-0.2 bare</span>
                    <span>0.9 dense</span>
                  </div>
                </div>
              )}
              {activeLayers.doppler && (
                <span style={{ fontWeight: 700, color: '#7DD3FC' }}>
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

        {/* Right Column: Unified Spatial Cadastral Inspector & Harvest Action Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #F1E4D8',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Card Section 1: Parcel Identity & Quality Status */}
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: '1px solid #F1E4D8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#8A6D55', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                SPATIAL INSPECTION • {cluster.name}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  background: '#FFF7ED',
                  color: '#F97316',
                  border: '1px solid #FED7AA',
                }}
              >
                {activeZone.status === 'OPTIMAL' ? 'Grade A Export Ready' : 'Monitoring Window'}
              </span>
            </div>

            <div style={{ fontSize: '18px', fontWeight: 700, color: '#21170F', marginTop: '0.3rem', letterSpacing: '-0.01em' }}>
              {activeZone.name}
            </div>

            <div style={{ fontSize: '12px', color: '#6E6259', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>Crop: <strong style={{ color: '#21170F' }}>{cluster.crop}</strong> ({cluster.giTag})</span>
              <span style={{ color: '#D4C4B5' }}>•</span>
              <span>Area: <strong style={{ color: '#21170F' }}>{activeZone.areaHa} Hectares</strong></span>
            </div>
          </div>

          {/* Card Section 2: Core Biomass & Physicochemical Metrics */}
          <div
            style={{
              padding: '0.75rem 1.15rem',
              borderBottom: '1px solid #F1E4D8',
              background: '#FDFAF7',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                padding: '0.55rem 0.7rem',
                borderRadius: '6px',
                border: '1px solid #F1E4D8',
              }}
            >
              <div style={{ fontSize: '11px', color: '#8A6D55', fontWeight: 700, letterSpacing: '0.03em' }}>RIPENESS</div>
              <div className="tabular-nums" style={{ fontSize: '17px', fontWeight: 700, color: '#F97316', marginTop: '2px' }}>
                {activeZone.maturityPct}%
              </div>
            </div>

            <div
              style={{
                background: '#FFFFFF',
                padding: '0.55rem 0.7rem',
                borderRadius: '6px',
                border: '1px solid #F1E4D8',
              }}
            >
              <div style={{ fontSize: '11px', color: '#8A6D55', fontWeight: 700, letterSpacing: '0.03em' }}>SWEETNESS</div>
              <div className="tabular-nums" style={{ fontSize: '17px', fontWeight: 700, color: '#21170F', marginTop: '2px' }}>
                {activeZone.sugarBrix}° Brix
              </div>
            </div>

            <div
              style={{
                background: '#FFFFFF',
                padding: '0.55rem 0.7rem',
                borderRadius: '6px',
                border: '1px solid #F1E4D8',
              }}
            >
              <div style={{ fontSize: '11px', color: '#8A6D55', fontWeight: 700, letterSpacing: '0.03em' }}>SOIL MOISTURE</div>
              <div className="tabular-nums" style={{ fontSize: '17px', fontWeight: 700, color: activeZone.soilMoisturePct > 80 ? '#A11920' : '#21170F', marginTop: '2px' }}>
                {activeZone.soilMoisturePct}%
              </div>
            </div>
          </div>

          {/* Card Section 3: Weather-Linked Action Advisory */}
          <div style={{ padding: '0.75rem 1.15rem', borderBottom: '1px solid #F1E4D8' }}>
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                background: '#FFF7ED',
                border: '1px solid #FED7AA',
                fontSize: '12px',
                color: '#21170F',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 700, color: '#F97316', marginBottom: '0.2rem', fontSize: '11px', letterSpacing: '0.03em' }}>
                SPATIAL ACTION ADVISORY:
              </div>
              {activeZone.recommendedHarvest}. Downpour front of <strong>{rainMm}mm</strong> arriving in about <strong>{Math.round(rain.etaHours)}h</strong> across the {cluster.district} corridor. Picking before front protects Grade A sugar concentration.
            </div>
          </div>

          {/* Card Section 4: Sub-Parcel Terrace Selection */}
          <div style={{ padding: '0.75rem 1.15rem', borderBottom: '1px solid #F1E4D8' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#8A6D55', letterSpacing: '0.04em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              SELECT SUB-PARCEL TERRACE TO FOCUS:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.45rem' }}>
              {cluster.zones.map((zone) => {
                const isSelected = selectedZoneId === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => handleSelectZone(zone.id)}
                    style={{
                      padding: '0.5rem 0.7rem',
                      borderRadius: '6px',
                      border: isSelected ? '2px solid #F97316' : '1px solid #F1E4D8',
                      background: isSelected ? '#FFF7ED' : '#FFF5ED',
                      color: '#21170F',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background-color 0.15s',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '12.5px', color: isSelected ? '#F97316' : '#21170F' }}>
                      {zone.name.split('(')[0].trim()}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6E6259', marginTop: '2px' }}>
                      {zone.areaHa} ha • {zone.maturityPct}% Maturity
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Section 5: Collective Logistics Dispatch */}
          <div style={{ padding: '0.85rem 1.15rem', marginTop: 'auto', background: '#FFF5ED' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#21170F' }}>
                Link Parcel Lot to Collective Logistics
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: '#FFF5ED',
                  color: '#F97316',
                  border: '1px solid #E5D2C2',
                }}
              >
                450 kg Ready
              </span>
            </div>

            <p style={{ fontSize: '12px', color: '#6E6259', margin: '0.35rem 0 0.75rem 0', lineHeight: 1.45 }}>
              Register this terrace into the {cluster.district.replace(' Cluster', '')} FPO logistics route before the {rainMm}mm downpour front arrives (~{Math.round(rain.etaHours)}h).
            </p>

            <button
              onClick={handleTagPooling}
              disabled={isTagged}
              className="tap-target"
              style={{
                width: '100%',
                fontSize: '13px',
                padding: '0.55rem 0.85rem',
                gap: '0.45rem',
                minHeight: '40px',
                fontWeight: 700,
                background: isTagged ? '#F97316' : '#F97316',
                color: '#FFFFFF',
                borderRadius: '6px',
                border: 'none',
                cursor: isTagged ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s, transform 0.1s',
              }}
            >
              <CheckCircle2 size={15} />
              <span>{isTagged ? 'Tagged & Scheduled for FPO Truck #2!' : 'Schedule FPO Truck Consolidation'}</span>
              <ArrowRight size={14} />
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
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '12px' }}
            >
              Close
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
