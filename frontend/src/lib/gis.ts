/** Geometry and live-data helpers for the harvest GIS map. */

export interface GeoZone {
  id: string;
  areaHa: number;
  svgPath: string;
}

export interface GeoCluster {
  centerLat: number;
  centerLng: number;
  zones: GeoZone[];
}

const SVG_CENTER = { x: 250, y: 210 };
const M_PER_DEG_LAT = 111_320;

function parsePoints(path: string): [number, number][] {
  return Array.from(path.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)).map((m) => [Number(m[1]), Number(m[2])]);
}

function shoelaceArea(pts: [number, number][]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

/**
 * Places each terrace sketch on the ground. The scale is chosen so the polygons' areas match the
 * recorded hectares, so the parcels are the right size even though their outlines are illustrative.
 */
export function zonesToGeoJSON(cluster: GeoCluster, extra: (zoneId: string) => Record<string, unknown>) {
  const scales = cluster.zones
    .map((z) => {
      const area = shoelaceArea(parsePoints(z.svgPath));
      return area > 0 ? Math.sqrt((z.areaHa * 10_000) / area) : 0;
    })
    .filter(Boolean);
  const mPerUnit = scales.reduce((a, b) => a + b, 0) / (scales.length || 1) || 0.5;
  const cosLat = Math.cos((cluster.centerLat * Math.PI) / 180);

  const toLngLat = ([x, y]: [number, number]): [number, number] => [
    cluster.centerLng + ((x - SVG_CENTER.x) * mPerUnit) / (M_PER_DEG_LAT * cosLat),
    cluster.centerLat + ((SVG_CENTER.y - y) * mPerUnit) / M_PER_DEG_LAT,
  ];

  return {
    type: 'FeatureCollection' as const,
    features: cluster.zones.map((z) => {
      const ring = parsePoints(z.svgPath).map(toLngLat);
      ring.push(ring[0]);
      return {
        type: 'Feature' as const,
        id: z.id,
        properties: { id: z.id, ...extra(z.id) },
        geometry: { type: 'Polygon' as const, coordinates: [ring] },
      };
    }),
  };
}

export function boundsOf(fc: ReturnType<typeof zonesToGeoJSON>): [[number, number], [number, number]] {
  const pts = fc.features.flatMap((f) => f.geometry.coordinates[0]);
  const lngs = pts.map((p) => p[0]);
  const lats = pts.map((p) => p[1]);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

export function centroidOf(fc: ReturnType<typeof zonesToGeoJSON>, zoneId: string): [number, number] | null {
  const f = fc.features.find((x) => x.properties.id === zoneId);
  if (!f) return null;
  const ring = f.geometry.coordinates[0].slice(0, -1);
  return [ring.reduce((a, p) => a + p[0], 0) / ring.length, ring.reduce((a, p) => a + p[1], 0) / ring.length];
}

export interface NdviScene {
  itemId: string;
  date: string;
  cloudPct: number;
  tileUrl: string;
}

const PC = 'https://planetarycomputer.microsoft.com/api';

/** Latest low-cloud Sentinel-2 L2A scene covering the point, rendered as NDVI tiles by Planetary Computer. */
export async function findNdviScene(lat: number, lng: number): Promise<NdviScene | null> {
  const to = new Date();
  const from = new Date(to.getTime() - 75 * 86400_000);
  const d = 0.005;
  const res = await fetch(`${PC}/stac/v1/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      collections: ['sentinel-2-l2a'],
      bbox: [lng - d, lat - d, lng + d, lat + d],
      datetime: `${from.toISOString()}/${to.toISOString()}`,
      query: { 'eo:cloud_cover': { lt: 60 } },
      sortby: [{ field: 'datetime', direction: 'desc' }],
      limit: 20,
    }),
  });
  if (!res.ok) return null;
  const { features = [] } = await res.json();
  const covering = features.filter(
    (f: any) => lng >= f.bbox[0] && lng <= f.bbox[2] && lat >= f.bbox[1] && lat <= f.bbox[3]
  );
  if (!covering.length) return null;
  // Prefer the clearest scene among the most recent few overpasses.
  const best = covering.slice(0, 6).reduce((a: any, b: any) =>
    b.properties['eo:cloud_cover'] < a.properties['eo:cloud_cover'] ? b : a
  );
  const q = new URLSearchParams({
    collection: 'sentinel-2-l2a',
    item: best.id,
    expression: '(B08-B04)/(B08+B04)',
    asset_as_band: 'true',
    rescale: '-0.2,0.9',
    colormap_name: 'rdylgn',
  });
  q.append('assets', 'B08');
  q.append('assets', 'B04');
  return {
    itemId: best.id,
    date: String(best.properties.datetime).slice(0, 10),
    cloudPct: Math.round(best.properties['eo:cloud_cover']),
    tileUrl: `${PC}/data/v1/item/tiles/WebMercatorQuad/{z}/{x}/{y}@1x.png?${q.toString().replace(/%7B/g, '{').replace(/%7D/g, '}')}`,
  };
}

export interface RadarFrames {
  host: string;
  frames: { time: number; path: string }[];
}

/** Recent radar/nowcast frames from RainViewer (global composite, free). */
export async function fetchRadarFrames(): Promise<RadarFrames | null> {
  const res = await fetch('https://api.rainviewer.com/public/weather-maps.json', { signal: AbortSignal.timeout(6000) });
  if (!res.ok) return null;
  const data = await res.json();
  const frames = [...(data.radar?.past ?? []), ...(data.radar?.nowcast ?? [])];
  return frames.length ? { host: data.host, frames } : null;
}
