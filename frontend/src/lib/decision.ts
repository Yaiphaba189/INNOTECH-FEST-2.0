import { BuyerMatchQuote, HarvestLot } from '@/types';

/**
 * Single source of truth for the "Rain-to-Rupee" harvest decision.
 * Mirrors intelligence_layer/module_b_harvest/weather_risk/cost_of_waiting.py so the
 * offline/mock path and the backend path give the same answer.
 */

export const GRADE_A_MIN_BRIX = 14.0;
export const GRADE_B_MIN_BRIX = 12.0;
export const GRADE_B_PRICE_FACTOR = 0.75;
export const WAIT_SPOILAGE_PCT = 0.05;
export const HAUL_BUFFER_HOURS = 6;

/** Mirrors geo_baseline.py: what a broker quotes vs. what actually reaches the farmer. */
export const BROKER_GROSS_PER_KG = 31.0;
export const BROKER_SHRINKAGE_PCT = 0.25;

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const BROKER_NET_PER_KG = round2(BROKER_GROSS_PER_KG * (1 - BROKER_SHRINKAGE_PCT));

export type Grade = 'Grade A' | 'Grade B' | 'Grade C';

export interface RainForecast {
  mm: number;
  etaHours: number;
  source: 'live' | 'cached' | 'demo' | 'unavailable';
  /** Real 48h total when the demo storm is shown instead. */
  liveMm: number | null;
  asOf: string;
}

export const DEMO_RAIN: RainForecast = { mm: 65, etaHours: 41, source: 'demo', liveMm: null, asOf: new Date().toISOString() };

export interface Decision {
  rainMm: number;
  hoursLeft: number;
  harvestBy: Date;
  brixNow: number;
  brixIfWait: number;
  brixDrop: number;
  gradeNow: Grade;
  gradeIfWait: Grade;
  netRateNow: number;
  netRateIfWait: number;
  rupeesNow: number;
  rupeesIfWait: number;
  rupeesAtRisk: number;
  urgent: boolean;
}

export function gradeForBrix(brix: number): Grade {
  if (brix >= GRADE_A_MIN_BRIX) return 'Grade A';
  if (brix >= GRADE_B_MIN_BRIX) return 'Grade B';
  return 'Grade C';
}

/** Osmotic dilution: none below 20 mm, ramps to 2.0° at 50 mm, up to 2.5° by 65 mm. */
export function brixDropForRain(rainMm: number): number {
  if (rainMm < 20) return 0;
  if (rainMm < 50) return round2(((rainMm - 20) / 30) * 2.0);
  return round2(2.0 + Math.min(0.5, (rainMm - 50) / 30));
}

export function computeCostOfWaiting(
  lot: Pick<HarvestLot, 'quantity_kg' | 'estimated_brix'>,
  bestNetRate: number,
  rain: Pick<RainForecast, 'mm' | 'etaHours'>,
  now: Date = new Date()
): Decision {
  const brixDrop = brixDropForRain(rain.mm);
  const brixIfWait = round2(lot.estimated_brix - brixDrop);
  const gradeIfWait = gradeForBrix(brixIfWait);
  const netIfWait = gradeIfWait === 'Grade A' ? bestNetRate : round2(bestNetRate * GRADE_B_PRICE_FACTOR);
  const kgIfWait = lot.quantity_kg * (brixDrop > 0 ? 1 - WAIT_SPOILAGE_PCT : 1);

  const rupeesNow = Math.round(bestNetRate * lot.quantity_kg);
  const rupeesIfWait = Math.round(netIfWait * kgIfWait);
  const hoursLeft = Math.max(0, rain.etaHours - HAUL_BUFFER_HOURS);

  return {
    rainMm: rain.mm,
    hoursLeft,
    harvestBy: new Date(now.getTime() + hoursLeft * 3600_000),
    brixNow: lot.estimated_brix,
    brixIfWait,
    brixDrop,
    gradeNow: gradeForBrix(lot.estimated_brix),
    gradeIfWait,
    netRateNow: bestNetRate,
    netRateIfWait: netIfWait,
    rupeesNow,
    rupeesIfWait,
    rupeesAtRisk: Math.max(0, rupeesNow - rupeesIfWait),
    urgent: brixDrop > 0,
  };
}

const GRADE_LABEL: Record<string, Grade> = { grade_a: 'Grade A', grade_b: 'Grade B', grade_c: 'Grade C' };

/** Maps the snake_case backend /lots/{id}/decision `decision` block to the UI shape. */
export function decisionFromApi(d: any): Decision {
  return {
    rainMm: d.rain_mm,
    hoursLeft: d.hours_left,
    harvestBy: new Date(d.harvest_by),
    brixNow: d.brix_now,
    brixIfWait: d.brix_if_wait,
    brixDrop: d.brix_drop,
    gradeNow: GRADE_LABEL[d.grade_now] ?? 'Grade A',
    gradeIfWait: GRADE_LABEL[d.grade_if_wait] ?? 'Grade B',
    netRateNow: d.net_rate_now,
    netRateIfWait: d.net_rate_if_wait,
    rupeesNow: d.rupees_now,
    rupeesIfWait: d.rupees_if_wait,
    rupeesAtRisk: d.rupees_at_risk,
    urgent: d.urgent,
  };
}

/** Farmer-facing numbers for one buyer quote. Backend-supplied broker comparison wins over the local baseline. */
export function quoteView(quote: BuyerMatchQuote, lotKg: number) {
  const net = quote.net_farmer_price_per_kg ?? quote.net_rate_per_kg;
  const gross = quote.gross_offer_per_kg ?? quote.gross_rate_per_kg;
  const advantage = quote.middleman_comparison?.cash_advantage_per_kg ?? round2(net - BROKER_NET_PER_KG);
  const advantagePct = quote.middleman_comparison?.advantage_percentage ?? round2((advantage / BROKER_NET_PER_KG) * 100);
  return {
    net,
    gross,
    advantage,
    advantagePct,
    payout: Math.round(net * lotKg),
    freight: quote.deductions.freight_per_kg ?? quote.deductions.shared_freight,
    crates: quote.deductions.crate_fee_per_kg ?? quote.deductions.crates_packaging,
    platform: quote.deductions.platform_fee_per_kg ?? quote.deductions.platform_fee,
    distanceKm: quote.transit_distance_km ?? quote.distance_km,
  };
}

export function pickBestQuote(quotes: BuyerMatchQuote[]): BuyerMatchQuote | null {
  if (!quotes.length) return null;
  const net = (q: BuyerMatchQuote) => q.net_farmer_price_per_kg ?? q.net_rate_per_kg;
  return quotes.reduce((best, q) => (net(q) > net(best) ? q : best));
}

export const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/** Browser-side Open-Meteo fallback for when the backend is unreachable. */
export async function fetchRainForecast(lat: number, lng: number): Promise<RainForecast> {
  const asOf = new Date().toISOString();
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&hourly=precipitation&forecast_days=3&timezone=Asia%2FKolkata`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const times: string[] = data.hourly.time;
    const precip: number[] = data.hourly.precipitation;
    const nowMs = Date.now();
    const start = Math.max(0, times.findIndex((t) => new Date(t + '+05:30').getTime() >= nowMs));
    const window = precip.slice(start, start + 48);
    const liveMm = round2(window.reduce((a, b) => a + (b || 0), 0));
    if (liveMm >= 20) {
      const firstWet = window.findIndex((p) => p >= 1);
      return { mm: liveMm, etaHours: Math.max(1, firstWet), source: 'live', liveMm, asOf };
    }
    return { ...DEMO_RAIN, liveMm, asOf };
  } catch {
    return { ...DEMO_RAIN, asOf };
  }
}
