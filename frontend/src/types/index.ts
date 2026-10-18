export type UserRole = 'farmer' | 'buyer' | 'fpo' | 'extension_officer';

export type LanguageCode = 'en';

export type DiseaseClass = 
  | 'heart_rot' 
  | 'black_rot' 
  | 'mealybug_wilt' 
  | 'healthy';

export type TriageUrgency = 'high' | 'medium' | 'low';

export interface DiseaseDiagnosis {
  id: string;
  predicted_class: DiseaseClass;
  display_name: string;
  local_name_beng?: string;
  local_name_mtei?: string;
  confidence_score: number;
  triage_status: 'confirmed' | 'preliminary' | 'inconclusive';
  severity: 'CRITICAL' | 'MODERATE' | 'LOW' | 'NONE';
  symptoms_detected: string[];
  organic_treatments: string[];
  chemical_treatments: string[];
  cultural_practices: string[];
  refer_to_expert: boolean;
  image_angle: 'crown' | 'base_stalk' | 'lateral';
  timestamp: string;
}

export interface PhenologyStage {
  stage_id: string;
  name: string;
  name_beng?: string;
  name_mtei?: string;
  days_range: [number, number];
  is_active: boolean;
  is_completed: boolean;
  description: string;
}

export interface HarvestForecastData {
  crop_record_id: string;
  variety: 'Queen' | 'Kew';
  district: string;
  farm_area_ha: number;
  days_in_field: number;
  gdd_accumulated: number;
  gdd_target: number;
  estimated_brix: number;
  optimal_harvest_start: string;
  optimal_harvest_end: string;
  recommended_pick_date: string;
  weather_risk_level: 'HIGH' | 'MODERATE' | 'LOW';
  weather_risk_title: string;
  weather_forecast: {
    dates: string;
    condition: string;
    precipitation_mm: number;
  };
  agronomic_advisory: string;
  stages: PhenologyStage[];
}

export interface BuyerMatchQuote {
  id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_type: 'Processor' | 'Wholesale Exporter' | 'Retail Co-op';
  location: string;
  distance_km: number;
  gross_rate_per_kg: number;
  deductions: {
    shared_freight: number;
    crates_packaging: number;
    platform_fee: number;
  };
  net_rate_per_kg: number;
  total_payout: number;
  payment_terms: string;
  pickup_window: string;
  quality_tolerance: string;
  is_recommended: boolean;
  status: 'available' | 'locked' | 'expired';
}

export interface HarvestLot {
  id: string;
  lot_code: string;
  farmer_id: string;
  farmer_name: string;
  district: string;
  crop_variety: 'Queen' | 'Kew';
  quantity_kg: number;
  quality_grade: 'Grade A' | 'Grade B' | 'Grade C';
  estimated_brix: number;
  ready_date: string;
  status: 'registered' | 'matched' | 'committed' | 'dispatched';
}

export interface DispatchWaypoint {
  order: number;
  farmer_name: string;
  village: string;
  district: string;
  lot_code: string;
  quantity_kg: number;
  grade: string;
  contact_phone: string;
}

export interface DispatchRun {
  run_id: string;
  cluster_district: string;
  vehicle_type: string;
  vehicle_capacity_kg: number;
  current_payload_kg: number;
  capacity_fill_pct: number;
  driver_name: string;
  driver_phone: string;
  vehicle_registration: string;
  stops: DispatchWaypoint[];
  destination_hub: string;
  cost_savings_per_kg: number;
  digital_gate_pass_token: string;
  timestamp: string;
  status: 'forming' | 'approved' | 'en_route' | 'delivered';
}

export interface OfflineQueuedScan {
  id: string;
  timestamp: string;
  imageBlobUrl: string;
  imageAngle: string;
  compressedSizeKb: number;
  originalSizeKb: number;
  synced: boolean;
  diagnosis?: DiseaseDiagnosis;
}

export interface MarketplaceLot {
  id: string;
  lot_code: string;
  farmer: string;
  district: string;
  variety: 'Queen' | 'Kew';
  weight_kg: number;
  brix: number;
  grade: 'Grade A' | 'Grade B';
  available_date: string;
  minimum_rate: number;
  status: 'open' | 'matched' | 'settled';
}

export interface DemandOrder {
  variety: 'Queen' | 'Kew';
  required_weight_kg: number;
  min_brix: number;
  max_rate_per_kg: number;
  receiving_hub: string;
}

export interface EscalationPayload {
  diagnosisName: string;
  confidenceScore: number;
  imageAngle: string;
  notes: string;
  farmerName: string;
  district: string;
  latitude: number;
  longitude: number;
}
