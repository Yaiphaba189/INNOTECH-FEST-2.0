import {
  DiseaseDiagnosis,
  HarvestForecastData,
  BuyerMatchQuote,
  DispatchRun,
  MarketplaceLot,
  DemandOrder,
} from '@/types';
import {
  INITIAL_DISEASE_DIAGNOSIS,
  MOCK_HARVEST_FORECAST,
  MOCK_BUYER_MATCHES,
  MOCK_DISPATCH_RUN,
} from './mock-data';

const PRIMARY_API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.port === '3000'
    ? 'http://localhost:8001'
    : 'http://localhost:8000');

async function safeFetch<T>(
  endpoint: string,
  options?: RequestInit,
  fallback?: T
): Promise<T> {
  const urls = [
    `${PRIMARY_API_BASE}${endpoint}`,
    `http://localhost:8000${endpoint}`,
    `http://localhost:8001${endpoint}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
      });

      if (res.ok) {
        return (await res.json()) as T;
      }
    } catch {
      // try next fallback url
    }
  }

  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(`API call to ${endpoint} failed and no fallback provided.`);
}

export const api = {
  async screenCropPhoto(
    cropRecordId: string,
    angle: string,
    file?: File
  ): Promise<DiseaseDiagnosis> {
    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('crop_record_id', cropRecordId);
        formData.append('image_angle', angle);

        const res = await fetch(`${PRIMARY_API_BASE}/api/assessments/screen-photo`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          return (await res.json()) as DiseaseDiagnosis;
        }
      }
    } catch {
      // fallback
    }

    return {
      ...INITIAL_DISEASE_DIAGNOSIS,
      id: `diag-${Date.now()}`,
      image_angle: angle as any,
      timestamp: new Date().toISOString(),
    };
  },

  async escalateToOfficer(diagnosisId: string, notes: string): Promise<{ success: boolean }> {
    return safeFetch<{ success: boolean }>(
      `/api/assessments/${diagnosisId}/escalate`,
      {
        method: 'POST',
        body: JSON.stringify({ notes }),
      },
      { success: true }
    );
  },

  async getHarvestForecast(cropRecordId: string): Promise<HarvestForecastData> {
    return safeFetch<HarvestForecastData>(
      `/api/crops/${cropRecordId}/forecast`,
      { method: 'GET' },
      MOCK_HARVEST_FORECAST
    );
  },

  async registerLot(weightKg: number, cropRecordId: string): Promise<{ success: boolean; lot_id: string }> {
    return safeFetch<{ success: boolean; lot_id: string }>(
      `/api/market/lots`,
      {
        method: 'POST',
        body: JSON.stringify({
          crop_record_id: cropRecordId,
          weight_kg: weightKg,
          harvest_date: new Date().toISOString().split('T')[0],
        }),
      },
      { success: true, lot_id: `lot-reg-${Date.now()}` }
    );
  },

  async getBuyerMatches(lotId: string): Promise<BuyerMatchQuote[]> {
    return safeFetch<BuyerMatchQuote[]>(
      `/api/market/matches/${lotId}`,
      { method: 'GET' },
      MOCK_BUYER_MATCHES
    );
  },

  async acceptDeal(matchId: string): Promise<{ success: boolean; match_id: string }> {
    return safeFetch<{ success: boolean; match_id: string }>(
      `/api/market/matches/${matchId}/accept`,
      { method: 'POST' },
      { success: true, match_id: matchId }
    );
  },

  async getDispatchRun(clusterDistrict: string): Promise<DispatchRun> {
    return safeFetch<DispatchRun>(
      `/api/logistics/dispatch-runs/${encodeURIComponent(clusterDistrict)}`,
      { method: 'GET' },
      MOCK_DISPATCH_RUN
    );
  },

  async getMarketplaceLots(): Promise<MarketplaceLot[]> {
    const fallbackLots: MarketplaceLot[] = [
      {
        id: 'lot-001',
        lot_code: 'HL-Q-CCP-089',
        farmer: 'Tombi Singh Ningthoujam',
        district: 'Churachandpur',
        variety: 'Queen',
        weight_kg: 500,
        brix: 14.8,
        grade: 'Grade A',
        available_date: '2026-10-23',
        minimum_rate: 28.5,
        status: 'open',
      },
      {
        id: 'lot-002',
        lot_code: 'HL-Q-CCP-091',
        farmer: 'Ginzamang Haokip',
        district: 'Churachandpur',
        variety: 'Queen',
        weight_kg: 850,
        brix: 14.6,
        grade: 'Grade A',
        available_date: '2026-10-23',
        minimum_rate: 28.0,
        status: 'open',
      },
      {
        id: 'lot-003',
        lot_code: 'HL-K-THO-012',
        farmer: 'Brajabidhu Singh',
        district: 'Thoubal',
        variety: 'Kew',
        weight_kg: 1800,
        brix: 13.9,
        grade: 'Grade B',
        available_date: '2026-10-25',
        minimum_rate: 22.0,
        status: 'open',
      },
    ];

    return safeFetch<MarketplaceLot[]>('/api/market/lots', { method: 'GET' }, fallbackLots);
  },

  async broadcastDemandOrder(order: DemandOrder): Promise<{ success: boolean; order_id: string }> {
    return safeFetch<{ success: boolean; order_id: string }>(
      '/api/market/orders',
      {
        method: 'POST',
        body: JSON.stringify(order),
      },
      { success: true, order_id: `order-${Date.now()}` }
    );
  },
};
