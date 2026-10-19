export type UserRole = 'farmer' | 'buyer' | 'fpo' | 'extension_officer' | 'admin' | 'superadmin';

export interface AuthUser {
  id: string;
  phone_number: string;
  full_name: string;
  role: UserRole;
  preferred_language?: string;
  is_simulated?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export type LanguageCode = 'en';

export type DiseaseClass = 
  | 'heart_rot' 
  | 'black_rot' 
  | 'mealybug_wilt' 
  | 'healthy'
  | 'bacterial_leaf_blight'
  | 'sheath_blight'
  | 'blast'
  | 'citrus_greening_hlb'
  | 'citrus_canker'
  | 'root_rot'
  | string;

export type TriageUrgency = 'high' | 'medium' | 'low';

export interface DiseaseDiagnosis {
  id: string;
  predicted_class: DiseaseClass;
  display_name: string;
  crop_species?: 'pineapple' | 'rice' | 'orange' | string;
  crop_display_name?: string;
  plant_part?: string;
  part_display_name?: string;
  local_name_beng?: string;
  local_name_mtei?: string;
  confidence_score: number;
  triage_status: 'confirmed' | 'preliminary' | 'inconclusive';
  severity: 'CRITICAL' | 'MODERATE' | 'LOW' | 'NONE' | 'UNKNOWN';
  inference_mode?: 'trained_model' | 'colour_heuristic' | 'offline_preset';
  evidence?: Record<string, number>;
  symptoms_detected: string[];
  organic_treatments: string[];
  chemical_treatments: string[];
  cultural_practices: string[];
  refer_to_expert: boolean;
  image_angle?: 'crown' | 'base_stalk' | 'lateral' | string;
  timestamp: string;
}

export interface PhenologyStage {
  stage_id: string;
  name: string;
  name_beng?: string;
  name_mtei?: string;
  days_range: [number, number];
  gdd_threshold?: number;
  target_brix_range?: string;
  is_active: boolean;
  is_completed: boolean;
  description: string;
}

export interface HarvestForecastData {
  crop_record_id: string;
  variety: 'Queen' | 'Kew' | string;
  crop_name?: string;
  is_planted?: boolean;
  planting_status?: 'Established Stand' | 'Sparse Vegetation' | 'Unplanted Fallow Ground' | string;
  canopy_coverage_pct?: number;
  crop_condition?: 'OPTIMAL' | 'WATER_DEFICIT' | 'ROOT_ROT_ONSET' | 'MATURE_HARVEST' | 'FALLOW' | string;
  condition_score?: number;
  water_status?: 'OPTIMAL' | 'LACKING_WATER' | 'WATERLOGGED' | string;
  soil_moisture_pct?: number;
  root_rot_status?: 'HEALTHY' | 'EARLY_ONSET' | 'CRITICAL_ROT' | string;
  root_rot_details?: string;
  harvest_readiness_pct?: number;
  harvest_recommendation?: string;
  district: string;
  farm_area_ha: number;
  days_in_field: number;
  gdd_accumulated: number;
  gdd_target: number;
  gdd_required?: number;
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
  delivery_location?: string;
  minimum_lot_kg?: number;
  distance_km: number;
  transit_distance_km?: number;
  gross_rate_per_kg: number;
  gross_offer_per_kg?: number;
  escrow_secured?: boolean;
  deductions: {
    shared_freight: number;
    crates_packaging: number;
    platform_fee: number;
    freight_per_kg?: number;
    crate_fee_per_kg?: number;
    platform_fee_per_kg?: number;
  };
  net_rate_per_kg: number;
  net_farmer_price_per_kg?: number;
  total_payout: number;
  payment_terms: string;
  pickup_window: string;
  quality_tolerance: string;
  is_recommended: boolean;
  status: 'available' | 'locked' | 'expired';
  middleman_comparison?: {
    cash_advantage_per_kg: number;
    advantage_percentage: number;
  };
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

export interface AIAdvisorRequest {
  prompt: string;
  query_type?: 'disease_triage' | 'harvest_decision' | 'market_negotiation' | 'general_copilot';
  crop?: string;
  context?: Record<string, any>;
  include_manipuri?: boolean;
  preferred_model?: string;
}

export interface AIAdvisorResponse {
  source: 'openrouter' | 'expert_fallback';
  model: string;
  response: string;
  actionable_steps: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  manipuri_summary?: string;
  cached: boolean;
}

export interface AIStatus {
  openrouter_configured: boolean;
  primary_model: string;
  available_models: string[];
  cache_ttl_seconds: number;
  environment: string;
}

