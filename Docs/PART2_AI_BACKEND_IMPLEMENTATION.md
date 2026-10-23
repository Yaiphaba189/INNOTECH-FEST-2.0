# HARVESTLINK AI — Implementation Plan

> **Implementation status (disease coverage):** The shipped pineapple checkpoint is a fine-tuned MobileNetV3-Small trained on public leaf images for **Healthy vs Mealybug Wilt only** (97.0% accuracy on a held-out public split; not validated on Manipur field data). **Heart Rot and Black Rot have no trained coverage yet** and are screened by an explainable colour-rule heuristic with expert-referral triage (see `Docs/DATA.md`). Class lists and accuracy targets elsewhere in this document describe the design goal, not the current model.

## Part 2: AI Backend, Algorithmic Engine & Intelligence Specification

---

> **Project:** Predictive Crop Intelligence and Smart Market Linkage for Manipur  
> **Document:** Part 2 of 3 — AI Backend, Algorithmic Engine & Intelligence Specification  
> **Target Audience:** Evaluators, Data Scientists, Backend Engineers, Operations Researchers  
> **Context:** INNOTECH FEST 2.0 Innovation Proposal  
> **Status:** Production Specification (Zero Raw Code / Pure Algorithmic & Architectural Documentation)  

---

## Table of Contents

1. [Backend Architecture & Processing Pipeline](#1-backend-architecture--processing-pipeline)
2. [Module A: Computer Vision Disease Screening Intelligence](#2-module-a-computer-vision-disease-screening-intelligence)
3. [Module B: Harvest Readiness & Meteorological Risk Engine](#3-module-b-harvest-readiness--meteorological-risk-engine)
4. [Module C: Transparent Net-Returns & Buyer Matching Model](#4-module-c-transparent-net-returns--buyer-matching-model)
5. [Module D: Collective Logistics & Vehicle Capacity Optimizer](#5-module-d-collective-logistics--vehicle-capacity-optimizer)
6. [Formal API Specifications & Data Contracts](#6-formal-api-specifications--data-contracts)
7. [Error Handling, Fallback Protocols & Auditing](#7-error-handling-fallback-protocols--auditing)
8. [Evaluation Metrics, Testing Protocols & Performance Benchmarks](#8-evaluation-metrics-testing-protocols--performance-benchmarks)
9. [Backend Implementation Checklist](#9-backend-implementation-checklist)

---

## 1. Backend Architecture & Processing Pipeline

### 1.1 Asynchronous Architectural Principles

The HARVESTLINK AI backend operates on a high-throughput, asynchronous service layer built using FastAPI. The architecture separates operational concerns into distinct tiers to ensure that compute-intensive neural network inference and combinatorial optimization solvers never block standard transactional database operations.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BACKEND REQUEST PROCESSING PIPELINE                    │
│                                                                             │
│   [ Inbound HTTPS Request ]                                                 │
│               │                                                             │
│               ▼                                                             │
│   ┌───────────────────────────────────────┐                                 │
│   │ 1. API Routing & Request Validation   │                                 │
│   │    • Header authentication check      │                                 │
│   │    • Request schema verification      │                                 │
│   │    • Non-blocking parameter decoding  │                                 │
│   └───────────────────┬───────────────────┘                                 │
│                       │ Validated Request                                   │
│                       ▼                                                     │
│   ┌───────────────────────────────────────┐                                 │
│   │ 2. Service Orchestration Layer        │                                 │
│   │    • Enforces business logic & rules  │                                 │
│   │    • Verifies user permissions        │                                 │
│   │    • Dispatches specialized tasks     │                                 │
│   └───────────┬───────────────┬───────────┘                                 │
│               │               │                                             │
│       Compute │               │ Query / Persist                             │
│       Task    ▼               ▼                                             │
│   ┌──────────────────────┐  ┌───────────────────────────────────────────┐  │
│   │ 3. Specialized       │  │ 4. Transactional Data Layer               │  │
│   │    Intelligence      │  │    • PostgreSQL / PostGIS transactions    │  │
│   │    Worker Engines    │  │    • Optimistic concurrency control       │  │
│   │    • Vision Model    │  │    • Immutable assessment audit logs      │  │
│   │    • Phenology Math  │  └───────────────────────────────────────────┘  │
│   │    • Net Returns     │                                                  │
│   │    • dispatch solver Solver │                                                  │
│   └───────────┬──────────┘                                                  │
│               │ Computed Intelligence Result                                │
│               ▼                                                             │
│   ┌───────────────────────────────────────┐                                 │
│   │ 5. Response Serialization & Audit     │                                 │
│   │    • JSON payload construction        │                                 │
│   │    • Response status code assignment  │                                 │
│   └───────────────────────────────────────┘                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Separation of Engine Responsibilities

1. **HTTP Controller Layer:** Validates incoming payload types, extracts authorization claims from JSON Web Tokens, and delegates immediately to service coordinators. Contains no database queries or mathematical formulas.
2. **Business Service Layer:** Implements workflow logic (e.g., verifying that a farmer cannot accept an expired buyer offer, or ensuring that a harvest lot cannot be registered for a past date).
3. **Isolated Intelligence Engines:** Self-contained computational units:
   - *Vision Engine:* Stateless neural inference executing over memory-buffered image tensors.
   - *Phenology Engine:* Pure algorithmic calculation of thermal units and maturation dates.
   - *Pricing Engine:* Deterministic cost deduction and ranking algorithm.
   - *Operations Research Engine:* Constraint satisfaction solver for multi-stop vehicle loading.

---

## 2. Module A: Computer Vision Disease Screening Intelligence

### 2.1 Regional Pathological Scope (Manipur Pineapples)

The vision intelligence engine focuses on the three most destructive pathological threats to Queen and Kew pineapple varieties in Manipur, which together account for more than 80% of economic crop damage in the state:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PINEAPPLE PATHOLOGY CLASSIFICATION MATRIX                   │
├─────────────────────┬──────────────────────────┬────────────────────────────┤
│ Disease Entity      │ Etiological Agent        │ Primary Visual Signifiers  │
├─────────────────────┼──────────────────────────┼────────────────────────────┤
│ Phytophthora        │ Phytophthora nicotianae  │ • Water-soaked soft rot at │
│ Heart Rot           │ var. parasitica (Fungus) │   central leaf base        │
│ (মপন শাবা)          │                          │ • Brown necrotic margins   │
│                     │                          │ • Inner whorl detachment   │
├─────────────────────┼──────────────────────────┼────────────────────────────┤
│ Thielaviopsis       │ Ceratocystis paradoxa /  │ • Watery black breakdown   │
│ Black Rot           │ Thielaviopsis paradoxa   │   of fruit flesh & stalk   │
│ (হৈনোম অমোৎপা)      │ (Fungus)                 │ • Dark soot-like spore     │
│                     │                          │   masses along core        │
├─────────────────────┼──────────────────────────┼────────────────────────────┤
│ Mealybug Wilt       │ Dysmicoccus brevipes     │ • Flaccid, curling leaves  │
│ (হৈনোম হিক তাবা)    │ vectoring PMWV virus     │ • Distinct pinkish-bronze  │
│                     │                          │   coloration at tips       │
│                     │                          │ • White waxy cottony bugs  │
├─────────────────────┼──────────────────────────┼────────────────────────────┤
│ Healthy Stand       │ Normal botanical state   │ • Rigid green leaf blades  │
│ (হকচাং ফবা)         │ (Negative control)       │ • Uniform golden/green skin│
│                     │                          │ • Intact, upright crown    │
└─────────────────────┴──────────────────────────┴────────────────────────────┘
```

### 2.2 Neural Network Architecture & Inference Pipeline

```
[ Inbound Compressed Image (~250 KB) ]
                  │
                  ▼
[ 1. Image Validation & Integrity Check ]
  • Verify MIME type (image/jpeg, image/png)
  • Validate file size (< 5 MB) and dimensional bounds (min 224×224 px)
                  │
                  ▼
[ 2. Tensor Preprocessing & Normalization ]
  • Bilinear interpolation resize to 224 × 224 pixels
  • Center crop extraction (aspect ratio preservation)
  • Channel scaling to [0.0, 1.0]
  • Channel-wise z-score normalization (ImageNet standard distribution)
                  │
                  ▼
[ 3. Deep Feature Extraction (MobileNetV3 / EfficientNet-B0) ]
  • Inverted residual blocks with depthwise separable convolutions
  • Squeeze-and-excitation attention modules
  • Low computational complexity (< 300M FLOPs) suitable for fast CPU inference
                  │
                  ▼
[ 4. Probability Calibration & Decision Logic ]
  • Softmax activation across 4 output class logits
  • Probability calibration via temperature scaling
                  │
                  ▼
[ 5. Diagnostic Triage & Referral Synthesis ]
  • Apply confidence thresholding and assign urgency rating
```

### 2.3 Diagnostic Triage Decision Framework

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DIAGNOSTIC TRIAGE RULES                               │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ Model Confidence     │ Diagnostic Status    │ Action Protocol               │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ Score ≥ 85.0%        │ Confirmed Screening  │ • Display validated chemical  │
│                      │                      │   and organic remedy protocols│
│                      │                      │ • If severe, offer 1-tap KVK  │
│                      │                      │   extension officer referral  │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ 50.0% ≤ Score < 85.0%│ Preliminary Alert    │ • Display provisional findings│
│                      │                      │ • Advise re-scan in 48 hours  │
│                      │                      │ • Show preventative measures  │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ Score < 50.0%        │ Inconclusive Result  │ • No disease declared         │
│                      │                      │ • Prompt user to capture new  │
│                      │                      │   photo in brighter daylight  │
│                      │                      │ • Offer direct officer assist │
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

### 2.4 Remediation Protocols (Organic & Chemical)

| Pathological Entity | Recommended Organic Remedy | Recommended Chemical Intervention | Cultural Control Action |
|---|---|---|---|
| **Heart Rot** | Dip slips in *Trichoderma viride* (10g/L) for 15 minutes before planting. | Spray Copper Oxychloride (0.25%) or Fosetyl-Aluminium (0.2%) at heart base. | Dig 30cm drainage trenches immediately to eliminate stagnant water between ridges. |
| **Black Rot** | Apply neem seed kernel extract (5%) around stalk scars post-harvest. | Spray Carbendazim (0.1%) or Propiconazole (0.1%) over affected stems. | Avoid harvesting in damp mornings; cure fruits in shade for 2 hours before packing. |
| **Mealybug Wilt** | Spray fish oil rosin soap (25g/L) or botanical petroleum oils. | Soil drench with Imidacloprid (0.3ml/L) or Chlorpyrifos around root zone. | Control attendant ant colonies using sticky barrier bands around plant stands. |

---

## 3. Module B: Harvest Readiness & Meteorological Risk Engine

### 3.1 Agronomic Phenology of Manipur Pineapples

Queen and Kew pineapples require distinct developmental periods influenced by elevation and seasonal thermal accumulation:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PINEAPPLE DEVELOPMENTAL PHASES (QUEEN)                      │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ Developmental Phase  │ Elapsed Duration     │ Observable Physical Attributes│
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ 1. Vegetative Stand  │ Day 0 to Day 360     │ • Active leaf production      │
│                      │ (12 months)          │ • 30–40 mature leaf blades    │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ 2. Inflorescence     │ Day 360 to Day 400   │ • "Red bud" emerges at heart  │
│    Induction         │ (Months 12–13)       │ • Spiral floral bracts appear │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ 3. Fruit Development │ Day 400 to Day 460   │ • Petals wilt; fruitlet eyes  │
│                      │ (Months 13–15)       │   flatten and expand          │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ 4. Color-Break Stage │ Day 460 to Day 480   │ • Bottom 1 to 2 eye tiers turn│
│                      │ (Weeks 15–16)        │   golden-yellow (Critical!)   │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ 5. Optimal Maturity  │ Day 480 to Day 490   │ • 20% to 40% surface golden   │
│                      │ (Peak Harvest)       │ • Brix reaches 14.0° – 16.0°  │
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

### 3.2 Growing Degree Day (GDD) Formulation

Thermal accumulation determines fruit ripening rate and sugar formation. The system calculates effective thermal units accumulated since inflorescence induction using the standard agricultural formula:

$$\text{GDD} = \sum_{t=\text{induction}}^{\text{current}} \max\left(0, \frac{T_{\max}(t) + T_{\min}(t)}{2} - T_{\text{base}}\right)$$

Where:
- $T_{\max}(t)$ and $T_{\min}(t)$ are the daily maximum and minimum ambient temperatures (°C) at the farm's district coordinates.
- $T_{\text{base}}$ is the physiological baseline temperature for pineapple ($16.0^\circ\text{C}$). Below this threshold, metabolic development ceases.
- **Target Accumulation:** Queen pineapples reach Grade A ripeness (14.5° Brix) upon accumulating **2,450 to 2,550 GDD units** post-induction.

### 3.3 Meteorological Risk Synthesis Algorithm

Monsoon rainfall on mature pineapples causes severe post-harvest loss through water intoxication, flesh softening, skin cracking, and rapid brix dilution (sugar content dropping by up to 2.5° Brix).

```
[ INPUT DATA: Farm Coordinates + Phenological Stage + 5-Day Rainfall Forecast ]
                                │
                                ▼
         Is Crop in "Color-Break" or "Mature" Stage?
                 ├── NO  ──► Risk Rating: LOW (Rain promotes leaf growth)
                 └── YES ──► Evaluate Forecasted Rainfall Volume (48h Window)
                                │
                                ├── Rain < 20 mm ──► Risk Rating: LOW
                                │                    Advisory: "Standard harvest schedule."
                                │
                                ├── 20 mm ≤ Rain < 50 mm ──► Risk Rating: MODERATE
                                │                            Advisory: "Monitor field drainage."
                                │
                                └── Rain ≥ 50 mm ──► Risk Rating: HIGH (CRITICAL)
                                                     Action Triggered:
                                                     "Downpour alert (50mm+). Harvest within
                                                      48 hours to prevent sugar dilution and
                                                      waterlogging. Connect to FPO truck."
```

---

## 4. Module C: Transparent Net-Returns & Buyer Matching Model

### 4.1 The Economics of True Net Return

Smallholder farmers frequently fall victim to deceptive headline pricing where middlemen promise high rates (e.g., ₹28/kg) but subsequently subtract arbitrary charges upon physical delivery.

HARVESTLINK AI enforces **Radical Net Price Transparency** by calculating the true take-home earning before any deal is accepted:

$$\text{Net Return (₹/kg)} = \text{Gross Offered Rate} - \text{Unit Freight} - \text{Handling \& Crates} - \text{Platform Fee}$$

$$\text{Total Farmer Take-Home (₹)} = \text{Net Return (₹/kg)} \times \text{Consignment Weight (kg)}$$

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     NET RETURN DEDUCTION ARCHITECTURE                       │
├─────────────────────────┬───────────────────────────┬───────────────────────┤
│ Cost Component          │ Value Formula / Rate      │ Responsible Entity    │
├─────────────────────────┼───────────────────────────┼───────────────────────┤
│ Gross Offered Rate      │ Set by verified buyer     │ Buyer purchase order  │
│                         │ (e.g. ₹28.00 / kg)        │                       │
├─────────────────────────┼───────────────────────────┼───────────────────────┤
│ Shared Freight Cost     │ Consolidated truck route: │ FPO collective        │
│                         │ ₹1.80 to ₹3.20 / kg       │ transport run         │
├─────────────────────────┼───────────────────────────┼───────────────────────┤
│ Crate & Handling Fee    │ Standardized crate cost:  │ Packaging supplier /  │
│                         │ ₹0.80 / kg                │ local aggregation hub │
├─────────────────────────┼───────────────────────────┼───────────────────────┤
│ Platform Protocol Fee   │ 1.5% of gross value:      │ Platform technology   │
│                         │ ₹0.42 / kg                │ sustainability        │
├─────────────────────────┼───────────────────────────┼───────────────────────┤
│ TRUE NET REALIZED RATE  │ Gross Rate - Deductions:  │ FARMER TAKE-HOME PAY  │
│                         │ = ₹23.58 / kg             │ (Guaranteed payout)   │
└─────────────────────────┴───────────────────────────┴───────────────────────┘
```

### 4.2 Buyer Matching & Ranking Formulation

When a farmer registers a ready harvest lot, the matching engine scores and ranks all compatible active buyer purchase orders using a deterministic composite utility function:

$$\text{Match Score} = w_1 \cdot S_{\text{net}} + w_2 \cdot S_{\text{dist}} + w_3 \cdot S_{\text{pay}} + w_4 \cdot S_{\text{grade}}$$

Where:
- $S_{\text{net}}$ is the normalized net return rate (weight $w_1 = 0.50$, prioritizing farmer income).
- $S_{\text{dist}}$ is proximity to destination hub (weight $w_2 = 0.20$, minimizing transit spoilage).
- $S_{\text{pay}}$ is payment immediacy (weight $w_3 = 0.20$; instant weighment payment scores 1.0, 14-day credit scores 0.3).
- $S_{\text{grade}}$ is exact quality tolerance alignment (weight $w_4 = 0.10$).

---

## 5. Module D: Collective Logistics & Vehicle Capacity Optimizer

### 5.1 The Fragmentation Problem

In rural Manipur, individual farmers attempting to transport 200–500 kg lots to Imphal or Silchar markets hire private light vehicles at exorbitant rates (up to ₹6.50/kg). Module D applies operations research techniques to pool multiple nearby farm lots into fully utilized commercial vehicles, driving transport costs down to ₹1.85/kg.

### 5.2 Mathematical Formulation (Capacitated Vehicle Routing)

The vehicle consolidation problem is formulated as a Capacitated Vehicle Routing Problem with Time Windows (CVRPTW):

**Objective Function:** Minimize total logistics expenditure:

$$\min \sum_{k \in V} \sum_{i \in N} \sum_{j \in N} c_{ij} \cdot x_{ijk}$$

**Subject to Constraints:**
1. **Vehicle Payload Capacity:** Total weight picked up by vehicle $k$ cannot exceed its certified payload $Q_k$:
   $$\sum_{i \in N} q_i \cdot y_{ik} \le Q_k \quad \forall k \in V$$
2. **Efficiency Threshold:** A vehicle dispatch run is only approved if payload saturation exceeds 75%:
   $$\frac{\sum_{i \in N} q_i \cdot y_{ik}}{Q_k} \ge 0.75$$
3. **Maturity Time Window:** Farm collection must occur within the farmer's optimal harvest window:
   $$e_i \le t_{ik} \le l_i \quad \forall i \in N$$
4. **Single Visit Requirement:** Each farmer lot is picked up exactly once by an assigned vehicle.

### 5.3 Vehicle Classes & Efficiency Profiles

| Vehicle Profile | Certified Payload | Ideal Cluster Radius | Target Route Profile | Transport Cost / kg |
|---|---|---|---|---|
| **Electric Cargo 3-Wheeler** | 600 kg | Within 15 km | Intra-district feeder to local hub | ₹1.20 – ₹1.60 |
| **Tata 407 LCV** | 2,500 kg | Within 45 km | Thoubal / Churachandpur to Imphal | ₹1.80 – ₹2.30 |
| **Medium Commercial Truck** | 7,000 kg | Interstate (>100 km) | Imphal to Silchar / Guwahati railhead | ₹3.10 – ₹3.80 |

### 5.4 Digital Consignment Gate-Pass Generation

Upon solver convergence, the system issues an immutable digital gate-pass containing a cryptographic QR token. This gate-pass encodes:
- Unique dispatch run identifier
- Driver identity and vehicle registration
- Itemized manifest of all constituent farm lots (weights, grades, farmer identifiers)
- Authorized destination delivery hub
- Digital signature verifying contract lock

---

## 6. Formal API Specifications & Data Contracts

All endpoints consume and return JSON payloads and require standard Bearer token authentication in the request headers (except public authentication routes).

### 6.1 Authentication Endpoints

| HTTP Method & Path | Auth Required | Request Parameters / Body | Response Status & Fields |
|---|---|---|---|
| `POST /api/auth/register` | None (Public) | `phone_number`, `full_name`, `password`, `role`, `preferred_language` | `201 Created` → User profile summary + JWT Bearer token |
| `POST /api/auth/login` | None (Public) | `phone_number`, `password` | `200 OK` → User profile summary + JWT Bearer token |
| `GET /api/auth/me` | Yes (All roles) | None | `200 OK` → Complete authenticated user entity |

### 6.2 Module A: Crop Disease Screening

| HTTP Method & Path | Auth Required | Request Parameters / Body | Response Status & Fields |
|---|---|---|---|
| `POST /api/assessments/screen` | Yes (Farmer, Officer) | Multipart form: `crop_record_id`, `image_file`, `image_angle` | `200 OK` → `predicted_class`, `confidence_score`, `severity_rating`, `symptoms_detected[]`, `recommended_actions[]`, `refer_to_expert` |
| `POST /api/assessments/{id}/escalate`| Yes (Farmer) | `notes` | `200 OK` → `referral_id`, `status: 'assigned_to_officer'` |

### 6.3 Module B: Harvest Forecasting & Weather

| HTTP Method & Path | Auth Required | Request Parameters / Body | Response Status & Fields |
|---|---|---|---|
| `GET /api/crops/{id}/forecast` | Yes (Farmer, FPO) | Query: `target_brix` (optional) | `200 OK` → `current_stage`, `days_in_field`, `gdd_accumulated`, `optimal_harvest_start`, `optimal_harvest_end`, `estimated_brix`, `weather_risk_level`, `weather_advisory` |

### 6.4 Module C: Buyer Matching & Offers

| HTTP Method & Path | Auth Required | Request Parameters / Body | Response Status & Fields |
|---|---|---|---|
| `POST /api/lots` | Yes (Farmer, FPO) | `crop_record_id`, `quantity_kg`, `quality_grade`, `harvest_window_start`, `harvest_window_end` | `201 Created` → Created harvest lot entity with status `'registered'` |
| `GET /api/lots/{id}/matches` | Yes (Farmer, FPO) | None | `200 OK` → List of compatible buyer matches: `buyer_name`, `gross_rate`, `freight_deduction`, `net_rate`, `total_take_home`, `pickup_date` |
| `POST /api/matches/{id}/accept` | Yes (Farmer) | None | `200 OK` → Contract locked; lot status updated to `'committed'` |

### 6.5 Module D: Logistics & Dispatch

| HTTP Method & Path | Auth Required | Request Parameters / Body | Response Status & Fields |
|---|---|---|---|
| `POST /api/logistics/dispatch-plans/generate` | Yes (FPO Admin) | `cluster_district`, `vehicle_type`, `destination_hub` | `201 Created` → Solved dispatch plan: `total_weight_kg`, `capacity_fill_pct`, `stops[]`, `estimated_cost_per_kg`, `digital_gate_pass` |
| `GET /api/logistics/dispatch-passes/{token}` | Yes (All roles) | Path parameter: `token` | `200 OK` → Complete consignment manifest for weighbridge validation |

---

## 7. Error Handling, Fallback Protocols & Auditing

### 7.1 Standard Error Code Mapping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STANDARDIZED API ERROR MAPPING                        │
├─────────────┬──────────────────────────┬────────────────────────────────────┤
│ HTTP Status │ System Error Code        │ Description & Recovery Guidance    │
├─────────────┼──────────────────────────┼────────────────────────────────────┤
│ 400 Bad Req │ `IMAGE_CORRUPTED`        │ Supplied image cannot be decoded.  │
│             │                          │ Prompt user to re-capture photo.   │
├─────────────┼──────────────────────────┼────────────────────────────────────┤
│ 401 Unauth  │ `TOKEN_EXPIRED`          │ JWT expired. Client re-routes user │
│             │                          │ to login screen.                   │
├─────────────┼──────────────────────────┼────────────────────────────────────┤
│ 403 Forbid  │ `ROLE_NOT_AUTHORIZED`    │ User lacks permission (e.g., buyer │
│             │                          │ attempting to accept farm offer).  │
├─────────────┼──────────────────────────┼────────────────────────────────────┤
│ 409 Conflict│ `LOT_ALREADY_COMMITTED`  │ Lot was already accepted by another│
│             │                          │ party. Refresh marketplace list.   │
├─────────────┼──────────────────────────┼────────────────────────────────────┤
│ 422 Unproc  │ `CAPACITY_THRESHOLD_FAIL`│ Aggregate load < 75% vehicle fill. │
│             │                          │ Add more nearby lots before run.   │
├─────────────┼──────────────────────────┼────────────────────────────────────┤
│ 503 Overload│ `SOLVER_TIMEOUT`         │ dispatch solver exceeded time limit.      │
│             │                          │ Fallback to nearest-neighbor rule. │
└─────────────┴──────────────────────────┴────────────────────────────────────┘
```

### 7.2 Audit Trail & Verification

To satisfy competition evaluators and prevent fraudulent data injection:
1. Every disease diagnosis preserves the SHA-256 hash of the input image, model architecture version, and calibrated confidence score.
2. Simulated demonstration records carry `is_simulated = TRUE`, ensuring test data is never conflated with live pilot records.

---

## 8. Evaluation Metrics, Testing Protocols & Performance Benchmarks

### 8.1 Performance Targets

| Operational Dimension | Metric | Minimum Target | Verification Method |
|---|---|---|---|
| **Disease Screening** | Top-1 Categorical Accuracy | ≥ 88.0% | 5-fold cross-validation on validated pineapple pathology test set |
| **Disease Screening** | Macro Recall (Heart Rot) | ≥ 92.0% | Minimizing false negatives on destructive fungal conditions |
| **Harvest Forecasting** | Window Precision | Within ±3 days | Ground truth validation against commercial harvest records |
| **Logistics Solver** | Vehicle Payload Fill | ≥ 75.0% | Load weight versus manufacturer gross vehicle weight |
| **Transport Cost** | Cost Reduction / kg | ≥ 35.0% savings | Comparison of pooled freight (₹2.10/kg) vs solo transit (₹4.50/kg) |
| **System Latency** | Vision Inference Time | < 800 ms | Benchmark on 2-vCPU commodity cloud server |
| **System Latency** | Routing Solver Convergence| < 3.0 seconds | Constraint satisfaction over 25-stop regional cluster |

---

## 9. Backend Implementation Checklist

- [x] **Zero Raw Code:** Document is completely free of raw implementation code blocks, relying on formal architectural specifications, functional tables, and mathematical formulas.
- [x] **Complete Module Specifications:** Comprehensive algorithmic coverage across Computer Vision (Module A), Phenological Harvest Windows (Module B), Net-Returns Pricing (Module C), and Vehicle Routing Optimization (Module D).
- [x] **Defensible AI Principles:** Clear separation between machine learning models and deterministic agronomic rules, preserving scientific integrity.
- [x] **Production API Contracts:** Complete specification of all system endpoints, including HTTP verbs, required payloads, response objects, and error mappings.
- [x] **Regional Specificity:** All rules, formulas, and parameters calibrated specifically for Queen and Kew pineapple agriculture in Manipur.
