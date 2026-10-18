import {
  DiseaseDiagnosis,
  HarvestForecastData,
  BuyerMatchQuote,
  DispatchRun,
  MarketplaceLot,
  DemandOrder,
  AuthUser,
  AuthResponse,
  UserRole,
} from '@/types';

export const DEMO_USERS: Record<string, { phone: string; pass: string; name: string; role: UserRole }> = {
  farmer: {
    phone: '9862000001',
    pass: 'farmer123',
    name: 'Tombi Singh (Farmer)',
    role: 'farmer',
  },
  buyer: {
    phone: '9862000002',
    pass: 'buyer123',
    name: 'Seven Sisters Agro (Buyer)',
    role: 'buyer',
  },
  fpo: {
    phone: '9862000003',
    pass: 'fpo123',
    name: 'Churachandpur FPO (Lead)',
    role: 'fpo',
  },
  extension_officer: {
    phone: '9862000004',
    pass: 'officer123',
    name: 'Dr. L. Kanta Sharma (Officer)',
    role: 'extension_officer',
  },
  admin: {
    phone: '9862000005',
    pass: 'admin123',
    name: 'State Admin (Portal)',
    role: 'admin',
  },
};
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

  auth: {
    async login(phone_number: string, password: string): Promise<AuthResponse> {
      try {
        const formData = new URLSearchParams();
        formData.append('username', phone_number);
        formData.append('password', password);

        const res = await fetch(`${PRIMARY_API_BASE}/api/auth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });

        if (res.ok) {
          const data = await res.json();
          if (typeof window !== 'undefined') {
            localStorage.setItem('harvestlink_user_active', JSON.stringify(data.user));
            localStorage.setItem('harvestlink_token_active', data.access_token);
          }
          return data;
        }
      } catch {
        // fallback
      }

      const matched = Object.values(DEMO_USERS).find((u) => u.phone === phone_number) || {
        phone: phone_number,
        pass: password,
        name: 'Demo User',
        role: 'farmer' as UserRole,
      };

      const demoUser: AuthUser = {
        id: `usr-${matched.role}-001`,
        phone_number: matched.phone,
        full_name: matched.name,
        role: matched.role,
        preferred_language: 'en',
        is_simulated: true,
        created_at: new Date().toISOString(),
      };

      const resp: AuthResponse = {
        access_token: `demo-token-${Date.now()}`,
        token_type: 'bearer',
        user: demoUser,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('harvestlink_user_active', JSON.stringify(demoUser));
        localStorage.setItem('harvestlink_token_active', resp.access_token);
      }

      return resp;
    },

    async register(payload: {
      phone_number: string;
      full_name: string;
      password: string;
      role: UserRole;
      preferred_language?: string;
    }): Promise<AuthResponse> {
      try {
        const res = await fetch(`${PRIMARY_API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (typeof window !== 'undefined') {
            localStorage.setItem('harvestlink_user_active', JSON.stringify(data.user));
            localStorage.setItem('harvestlink_token_active', data.access_token);
          }
          return data;
        }
      } catch {
        // fallback
      }

      const newUser: AuthUser = {
        id: `usr-${payload.role}-${Date.now()}`,
        phone_number: payload.phone_number,
        full_name: payload.full_name,
        role: payload.role,
        preferred_language: payload.preferred_language || 'en',
        is_simulated: true,
        created_at: new Date().toISOString(),
      };

      const resp: AuthResponse = {
        access_token: `reg-token-${Date.now()}`,
        token_type: 'bearer',
        user: newUser,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('harvestlink_user_active', JSON.stringify(newUser));
        localStorage.setItem('harvestlink_token_active', resp.access_token);
      }

      return resp;
    },
  },
};
