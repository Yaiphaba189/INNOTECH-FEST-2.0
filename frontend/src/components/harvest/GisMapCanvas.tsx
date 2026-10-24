'use client';

import React, { useEffect, useRef } from 'react';
import type { Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { GeoCluster, boundsOf, centroidOf, fetchRadarFrames, findNdviScene, zonesToGeoJSON, NdviScene } from '@/lib/gis';

export interface CanvasZone {
  id: string;
  name: string;
  areaHa: number;
  svgPath: string;
  status: 'OPTIMAL' | 'NEAR_MATURE' | 'WATERLOGGED_RISK';
  maturityPct: number;
  sugarBrix: number;
  gddAccumulated: number;
}

export interface CanvasCluster extends GeoCluster {
  id: string;
  targetGdd: number;
  zones: CanvasZone[];
}

export interface CanvasLayers {
  satellite: boolean;
  ndvi: boolean;
  gdd: boolean;
  doppler: boolean;
  cadastral: boolean;
}

export type NdviStatus =
  | { state: 'loading' }
  | { state: 'ready'; scene: NdviScene }
  | { state: 'unavailable' };

export type ZoomCommand = { id: number; kind: 'in' | 'out' | 'reset' };

export interface FarmerPin {
  lat: number;
  lng: number;
  farmerName: string;
  parcelName: string;
}

interface Props {
  cluster: CanvasCluster;
  selectedZoneId: string;
  layers: CanvasLayers;
  zoomCommand: ZoomCommand | null;
  farmerPin?: FarmerPin | null;
  isPinpointMode?: boolean;
  onSelectZone: (zoneId: string) => void;
  onPinpoint?: (coords: { lat: number; lng: number }) => void;
  onHover: (pos: { lat: number; lng: number } | null) => void;
  onNdviStatus: (status: NdviStatus) => void;
  onRadarStatus: (status: 'loading' | 'ready' | 'unavailable') => void;
}

const STATUS_COLOR = { OPTIMAL: '#10B981', NEAR_MATURE: '#3B82F6', WATERLOGGED_RISK: '#EF4444' } as const;

function gddColor(ratio: number): string {
  if (ratio >= 0.99) return '#16A34A';
  if (ratio >= 0.95) return '#84CC16';
  if (ratio >= 0.9) return '#F59E0B';
  return '#EF4444';
}

export const GisMapCanvas: React.FC<Props> = (props) => {
  const { cluster, selectedZoneId, layers } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const pinMarkerRef = useRef<Marker | null>(null);
  const readyRef = useRef(false);
  const propsRef = useRef(props);
  propsRef.current = props;
  const ndviCache = useRef<Record<string, NdviScene | null>>({});
  const radarTimer = useRef<ReturnType<typeof setInterval> | null>(null);


  // Create the map once.
  useEffect(() => {
    let disposed = false;
    (async () => {
      const maplibregl = (await import('maplibre-gl')).default;
      if (disposed || !containerRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#0B1120' } }] },
        center: [cluster.centerLng, cluster.centerLat],
        zoom: 16,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
      });
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
      // Start with the attribution collapsed behind its (i) button; it stays one click away.
      const collapseAttribution = () => {
        const attrib = containerRef.current?.querySelector('.maplibregl-ctrl-attrib');
        attrib?.classList.remove('maplibregl-compact-show');
        attrib?.removeAttribute('open');
      };
      collapseAttribution();
      map.once('idle', collapseAttribution);
      map.addControl(new maplibregl.ScaleControl({ maxWidth: 90, unit: 'metric' }), 'bottom-left');
      map.touchZoomRotate.disableRotation();

      map.on('load', () => {
        map.addSource('osm', {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          maxzoom: 19,
          attribution: '© OpenStreetMap contributors',
        });
        map.addSource('esri', {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          maxzoom: 19,
          attribution: 'Imagery © Esri, Maxar, Earthstar Geographics',
        });
        map.addLayer({ id: 'osm', type: 'raster', source: 'osm', layout: { visibility: 'none' } });
        map.addLayer({ id: 'esri', type: 'raster', source: 'esri' });

        map.addSource('zones', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addLayer({
          id: 'zones-fill',
          type: 'fill',
          source: 'zones',
          paint: { 'fill-color': ['get', 'fill'], 'fill-opacity': ['case', ['get', 'selected'], 0.5, 0.32] },
        });
        map.addLayer({
          id: 'zones-line',
          type: 'line',
          source: 'zones',
          paint: { 'line-color': ['get', 'stroke'], 'line-width': ['case', ['get', 'selected'], 3.5, 2] },
        });
        map.on('click', 'zones-fill', (e) => {
          const id = e.features?.[0]?.properties?.id;
          if (id) propsRef.current.onSelectZone(String(id));
        });
        map.on('click', (e) => {
          if (propsRef.current.onPinpoint) {
            propsRef.current.onPinpoint({
              lat: Number(e.lngLat.lat.toFixed(4)),
              lng: Number(e.lngLat.lng.toFixed(4)),
            });
          }
        });
        map.on('mouseenter', 'zones-fill', () => (map.getCanvas().style.cursor = 'pointer'));
        map.on('mouseleave', 'zones-fill', () => (map.getCanvas().style.cursor = propsRef.current.isPinpointMode ? 'crosshair' : ''));
        map.on('mousemove', (e) => propsRef.current.onHover({ lat: e.lngLat.lat, lng: e.lngLat.lng }));
        map.on('mouseout', () => propsRef.current.onHover(null));

        readyRef.current = true;
        mapRef.current = map;
        // Trigger the data effects below now that the map exists.
        map.fire('hl-ready');
      });
      mapRef.current = map;
    })();

    return () => {
      disposed = true;
      if (radarTimer.current) clearInterval(radarTimer.current);
      markersRef.current.forEach((m) => m.remove());
      if (pinMarkerRef.current) {
        pinMarkerRef.current.remove();
        pinMarkerRef.current = null;
      }
      mapRef.current?.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Run `fn` once the map style has loaded (immediately if it already has).
  const whenReady = (fn: (map: MapLibreMap) => void) => {
    const map = mapRef.current;
    if (!map) return () => {};
    if (readyRef.current) {
      fn(map);
      return () => {};
    }
    const handler = () => fn(map);
    map.once('hl-ready' as any, handler);
    return () => {
      map.off('hl-ready' as any, handler);
    };
  };

  // Parcels: geometry, colours, labels, framing.
  useEffect(() => {
    let cancelled = false;
    let cleanup: () => void = () => {};
    const poll = setInterval(() => {
      if (!mapRef.current) return;
      clearInterval(poll);
      cleanup = whenReady((map) => {
        if (cancelled) return;
        const fc = zonesToGeoJSON(cluster, (zid) => {
          const z = cluster.zones.find((x) => x.id === zid)!;
          const stroke = zid === selectedZoneId ? '#F97316' : STATUS_COLOR[z.status];
          const fill = layers.gdd ? gddColor(z.gddAccumulated / cluster.targetGdd) : stroke;
          return { selected: zid === selectedZoneId, stroke, fill };
        });
        (map.getSource('zones') as any)?.setData(fc);

        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        import('maplibre-gl').then(({ default: maplibregl }) => {
          if (cancelled) return;
          cluster.zones.forEach((z) => {
            const c = centroidOf(fc, z.id);
            if (!c) return;
            const el = document.createElement('div');
            const sel = z.id === selectedZoneId;
            // The pinpoint tooltip already names the selected parcel; a second label would stack under it.
            if (sel && propsRef.current.farmerPin) return;
            el.style.cssText =
              'pointer-events:none;transform:translateY(-50%);padding:2px 7px;border-radius:6px;font:700 10px/1.3 system-ui,sans-serif;' +
              `color:#fff;background:rgba(11,17,32,${sel ? 0.92 : 0.72});border:1px solid ${sel ? '#F97316' : 'rgba(255,255,255,0.25)'};white-space:nowrap;`;
            el.textContent = `${z.name.split('(')[0].replace('Terrace Zone', 'Zone').trim()} · ${z.maturityPct}% · ${z.sugarBrix}°Bx`;
            markersRef.current.push(new maplibregl.Marker({ element: el }).setLngLat(c).addTo(map));
          });
        });
      });
    }, 50);
    return () => {
      cancelled = true;
      clearInterval(poll);
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, selectedZoneId, layers.gdd, props.farmerPin]);

  // Render and update Farmer Pinpoint Marker
  useEffect(() => {
    let cancelled = false;
    const poll = setInterval(() => {
      const map = mapRef.current;
      if (!map || !readyRef.current) return;
      clearInterval(poll);

      if (pinMarkerRef.current) {
        pinMarkerRef.current.remove();
        pinMarkerRef.current = null;
      }

      const pin = props.farmerPin;
      if (!pin) return;

      if (typeof document !== 'undefined' && !document.getElementById('hl-pinpoint-styles')) {
        const style = document.createElement('style');
        style.id = 'hl-pinpoint-styles';
        style.textContent = `
          @keyframes hl-pin-pulse {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(2.2); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      import('maplibre-gl').then(({ default: maplibregl }) => {
        if (cancelled || !mapRef.current) return;
        const el = document.createElement('div');
        el.className = 'hl-farmer-pin-container';
        el.style.cssText =
          'position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;user-select:none;z-index:999;';
        el.innerHTML = `
          <div style="background:rgba(11,17,32,0.95);border:1.5px solid #F97316;box-shadow:0 4px 14px rgba(0,0,0,0.6),0 0 12px rgba(249,115,22,0.45);border-radius:8px;padding:4px 8px;font:800 11px system-ui,sans-serif;color:#fff;white-space:nowrap;margin-bottom:4px;display:flex;flex-direction:column;align-items:center;gap:2px;">
            <div style="display:flex;align-items:center;gap:5px;">
              <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10B981;box-shadow:0 0 6px #10B981;"></span>
              <span style="letter-spacing:0.02em;">${pin.farmerName} · ${pin.parcelName}</span>
            </div>
            <div style="font-size:9px;color:#38BDF8;font-family:monospace;font-weight:700;">
              LAT: ${pin.lat.toFixed(4)}°N &nbsp;LNG: ${pin.lng.toFixed(4)}°E
            </div>
          </div>
          <div style="position:absolute;bottom:0px;width:34px;height:34px;border-radius:50%;background:rgba(249,115,22,0.3);border:2px solid #F97316;animation:hl-pin-pulse 1.8s infinite ease-out;pointer-events:none;"></div>
          <svg width="26" height="34" viewBox="0 0 24 32" fill="none" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.6));">
            <path d="M12 0C5.37258 0 0 5.37258 0 12C0 19.5 12 32 12 32C12 32 24 19.5 24 12C24 5.37258 18.6274 0 12 0Z" fill="#EA580C"/>
            <circle cx="12" cy="11" r="5" fill="#FFFFFF"/>
            <circle cx="12" cy="11" r="2.5" fill="#EA580C"/>
          </svg>
        `;

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([pin.lng, pin.lat])
          .addTo(mapRef.current);
        pinMarkerRef.current = marker;
      });
    }, 50);

    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [props.farmerPin]);

  // Cursor handling for pinpoint mode
  useEffect(() => {
    const map = mapRef.current;
    if (map && readyRef.current) {
      map.getCanvas().style.cursor = props.isPinpointMode ? 'crosshair' : '';
    }
  }, [props.isPinpointMode]);

  // Frame the cluster when it changes.
  useEffect(() => {
    const poll = setInterval(() => {
      const map = mapRef.current;
      if (!map || !readyRef.current) return;
      clearInterval(poll);
      map.fitBounds(boundsOf(zonesToGeoJSON(cluster, () => ({}))), { padding: 55, maxZoom: 17.5, duration: 700 });
    }, 50);
    return () => clearInterval(poll);
  }, [cluster]);

  // Basemap and parcel visibility.
  useEffect(() => {
    const poll = setInterval(() => {
      const map = mapRef.current;
      if (!map || !readyRef.current) return;
      clearInterval(poll);
      const vis = (on: boolean) => (on ? 'visible' : 'none');
      map.setLayoutProperty('esri', 'visibility', vis(layers.satellite));
      map.setLayoutProperty('osm', 'visibility', vis(!layers.satellite));
      map.setLayoutProperty('zones-fill', 'visibility', vis(layers.cadastral || layers.gdd));
      map.setLayoutProperty('zones-line', 'visibility', vis(layers.cadastral));
      markersRef.current.forEach((m) => (m.getElement().style.display = layers.cadastral ? '' : 'none'));
    }, 50);
    return () => clearInterval(poll);
  }, [layers.satellite, layers.cadastral, layers.gdd, cluster, selectedZoneId]);

  // Real Sentinel-2 NDVI.
  useEffect(() => {
    let cancelled = false;
    const poll = setInterval(async () => {
      const map = mapRef.current;
      if (!map || !readyRef.current) return;
      clearInterval(poll);
      const remove = () => {
        if (map.getLayer('ndvi')) map.removeLayer('ndvi');
        if (map.getSource('ndvi')) map.removeSource('ndvi');
      };
      remove();
      if (!layers.ndvi) return;

      propsRef.current.onNdviStatus({ state: 'loading' });
      let scene = ndviCache.current[cluster.id];
      if (scene === undefined) {
        try {
          scene = await findNdviScene(cluster.centerLat, cluster.centerLng);
        } catch {
          scene = null;
        }
        ndviCache.current[cluster.id] = scene;
      }
      if (cancelled || !mapRef.current) return;
      if (!scene) {
        propsRef.current.onNdviStatus({ state: 'unavailable' });
        return;
      }
      remove();
      map.addSource('ndvi', { type: 'raster', tiles: [scene.tileUrl], tileSize: 256, attribution: 'Sentinel-2 L2A · Microsoft Planetary Computer' });
      map.addLayer({ id: 'ndvi', type: 'raster', source: 'ndvi', paint: { 'raster-opacity': 0.78 } }, 'zones-fill');
      propsRef.current.onNdviStatus({ state: 'ready', scene });
    }, 50);
    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [layers.ndvi, cluster]);

  // Real rain radar (RainViewer), animated through recent frames.
  useEffect(() => {
    let cancelled = false;
    const poll = setInterval(async () => {
      const map = mapRef.current;
      if (!map || !readyRef.current) return;
      clearInterval(poll);
      if (radarTimer.current) clearInterval(radarTimer.current);
      if (map.getLayer('radar')) map.removeLayer('radar');
      if (map.getSource('radar')) map.removeSource('radar');
      if (!layers.doppler) return;

      propsRef.current.onRadarStatus('loading');
      let data = null;
      try {
        data = await fetchRadarFrames();
      } catch {
        data = null;
      }
      if (cancelled || !mapRef.current) return;
      if (!data) {
        propsRef.current.onRadarStatus('unavailable');
        return;
      }
      const url = (i: number) => `${data!.host}${data!.frames[i].path}/256/{z}/{x}/{y}/2/1_1.png`;
      let i = Math.max(0, data.frames.findIndex((f) => f.time * 1000 > Date.now()) - 1);
      if (i < 0 || i >= data.frames.length) i = data.frames.length - 1;
      map.addSource('radar', { type: 'raster', tiles: [url(i)], tileSize: 256, maxzoom: 7, attribution: 'Radar © RainViewer' });
      map.addLayer({ id: 'radar', type: 'raster', source: 'radar', paint: { 'raster-opacity': 0.65 } });
      propsRef.current.onRadarStatus('ready');
      radarTimer.current = setInterval(() => {
        i = (i + 1) % data!.frames.length;
        (map.getSource('radar') as any)?.setTiles([url(i)]);
      }, 900);
    }, 50);
    return () => {
      cancelled = true;
      clearInterval(poll);
      if (radarTimer.current) clearInterval(radarTimer.current);
    };
  }, [layers.doppler]);

  // Zoom buttons.
  useEffect(() => {
    const cmd = props.zoomCommand;
    const map = mapRef.current;
    if (!cmd || !map) return;
    if (cmd.kind === 'in') map.zoomIn();
    else if (cmd.kind === 'out') map.zoomOut();
    else map.fitBounds(boundsOf(zonesToGeoJSON(cluster, () => ({}))), { padding: 55, maxZoom: 17.5, duration: 500 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.zoomCommand]);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />;
};
