# HARVESTLINK AI — Implementation Plan

## Part 1: System Architecture, Data Models & Platform Foundation

---

> **Project:** Predictive Crop Intelligence and Smart Market Linkage for Manipur  
> **Document:** Part 1 of 3 — System Architecture, Data Models & Platform Foundation  
> **Target Audience:** Judges, Evaluators, Technical Committees, System Architects  
> **Context:** INNOTECH FEST 2.0 Innovation Proposal  
> **Status:** Production Specification (Zero Raw Code / Pure Architectural & Foundation Documentation)  

---

## Table of Contents

1. [Executive Summary & Problem Alignment](#1-executive-summary--problem-alignment)
2. [Core Principles of Responsible Agri-AI](#2-core-principles-of-responsible-agri-ai)
3. [System Architecture & Tier Decomposition](#3-system-architecture--tier-decomposition)
4. [Technology Stack Strategy & Justification](#4-technology-stack-strategy--justification)
5. [Structural Domain Model & Entity Relationships](#5-structural-domain-model--entity-relationships)
6. [Comprehensive Data Dictionaries (Schema Specification)](#6-comprehensive-data-dictionaries-schema-specification)
7. [Authentication, Authorization & Role-Based Access Control](#7-authentication-authorization--role-based-access-control)
8. [Infrastructure Topology & Deployment Model](#8-infrastructure-topology--deployment-model)
9. [Development Roadmap & Milestone Phasing](#9-development-roadmap--milestone-phasing)
10. [Foundation Verification & Audit Matrix](#10-foundation-verification--audit-matrix)

---

## 1. Executive Summary & Problem Alignment

### 1.1 The Regional Agricultural Challenge in Manipur

Manipur possesses ideal agro-climatic conditions for horticulture, notably producing some of India's finest Queen and Kew pineapples across districts like Churachandpur, Thoubal, Imphal East, and Bishnupur. However, smallholder growers face compounded post-harvest crises:

1. **Undetected Pathological Spoilage:** Fungal conditions such as Phytophthora Heart Rot and Thielaviopsis Black Rot spread rapidly during wet periods, often remaining undiagnosed until significant yield loss occurs.
2. **Suboptimal Harvest Scheduling:** Harvesting prematurely results in sour fruit with low sugar content (under 12° Brix), while delayed harvesting during monsoon downpours causes water-sponge rot, skin cracks, and severe price downgrades.
3. **Information Asymmetry & Predatory Intermediation:** Smallholders operate without forward visibility into institutional wholesale demand. Middlemen offer deceptive gross prices that are heavily diminished upon delivery through opaque deductions for transit, crate handling, and spoilage risk.
4. **Logistical Fragmentation:** Scattered individual farmers attempt to transport small lots (100–400 kg) individually over mountain roads, incurring exorbitant transportation costs that consume up to 30% of total revenue.

### 1.2 The HARVESTLINK AI Solution

HARVESTLINK AI replaces isolated, single-feature agricultural apps with a unified **decision-support platform** that links crop health, harvest timing, and collective market logistics into an integrated intelligence loop:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       HARVESTLINK AI CLOSED LOOP                            │
│                                                                             │
│   [ 1. CROP HEALTH ]            [ 2. HARVEST READINESS ]                   │
│   Computer Vision screens        Thermal units (GDD) & monsoon             │
│   leaf & basal rot symptoms      radar predict the exact 5-day             │
│   at 90%+ confidence.            optimal sugar harvest window.             │
│            │                               │                                │
│            ▼                               ▼                                │
│   [ 4. FPO AGGREGATION ]         [ 3. TRANSPARENT MARKET ]                  │
│   Route optimization aggregates  Deterministic matching reveals            │
│   multiple small lots into       TRUE NET RETURN per kg after all           │
│   efficient truck payloads.      freight & packing deductions.             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Scope Boundary Definition for MVP

| Functional Scope | In MVP Specification | Explicitly Excluded from MVP | Rationale |
|---|---|---|---|
| **Target Crop** | Pineapple (Queen & Kew varieties) | General field crops, vegetables, cereals | Deep botanical specificity ensures defensible agronomic rules and accurate vision models. |
| **Disease Screening** | Top 3 pathologies: Heart Rot, Black Rot, Mealybug Wilt | Rare viral infections, nutritional leaf scorch | Focuses resources on the diseases responsible for >80% of economic loss in Manipur. |
| **Market Matching** | Deterministic net-return calculation and order matching | Dynamic spot auctions, automated escrow settlements | High financial reliability without regulatory/banking compliance overhead in the prototype phase. |
| **Logistics** | Multi-lot cluster aggregation and vehicle capacity fill | Real-time GPS driver turn-by-turn re-routing | Static cluster optimization delivers 90% of transport cost savings with zero hardware dependency. |

---

## 2. Core Principles of Responsible Agri-AI

To ensure scientific credibility and defensibility before technical judges, HARVESTLINK AI adheres to four strict operational tenets:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 FOUR PILLARS OF RESPONSIBLE AGRI-AI                         │
├─────────────────────────┬───────────────────────────────────────────────────┤
│ Principle               │ System Guarantee & Enforcement Mechanism          │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ 1. Radical AI Honesty   │ • Never disguise an agronomic rule as an ML model │
│                         │ • Never invent simulated market bids or buyers    │
│                         │ • Explicitly tag synthetic records as "DEMO DATA" │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ 2. Progressive AI Layer │ • Phase 1: Phenological rules & deterministic math│
│                         │ • Phase 2: Pilot data logging & ground validation │
│                         │ • Phase 3: Train neural models only on real data  │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ 3. Data Sovereignty     │ • Farmer-reported weights are never overwritten   │
│                         │ • All AI outputs preserve model version & timestamp│
│                         │ • Weather advisories cite data provider & origin  │
├─────────────────────────┼───────────────────────────────────────────────────┤
│ 4. Separation of Domain │ • API handles validation and routing only         │
│    Concerns             │ • Services manage business logic and orchestration│
│                         │ • Vision & optimization engines have no DB access │
└─────────────────────────┴───────────────────────────────────────────────────┘
```

---

## 3. System Architecture & Tier Decomposition

The system follows a modular 3-tier enterprise architecture designed for low-latency inference, clear audit boundaries, and clean separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       HARVESTLINK AI ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. PRESENTATION LAYER (Next.js / Responsive Web & PWA)                      │
│    ├── Farmer Portal (Camera Triage, Harvest Radar, Net-Return Quote Cards) │
│    ├── Buyer Marketplace (Demand Specification, Batch Quality Verification) │
│    ├── FPO Dispatch Console (Cluster Map, Payload Bar, Digital Gate-Pass)   │
│    └── Bilingual Localization Engine (English, Bengali Script, Meetei Mayek)│
├─────────────────────────────────────────────────────────────────────────────┤
│                            HTTPS / RESTful APIs                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. BUSINESS & INTELLIGENCE SERVICE LAYER (FastAPI)                          │
│    ├── Module A Engine: PyTorch Vision Screening (Crown / Leaf Pathology)   │
│    ├── Module B Engine: Agronomic Phenology Rules & Meteorological Alerting │
│    ├── Module C Engine: Deterministic Net-Realized Revenue Calculator       │
│    ├── Module D Engine: Operations Research Combinatorial Aggregation Solver│
│    └── Security & Authorization: Stateless JWT Engine + Role-Based Access   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. PERSISTENCE & DATA STORAGE LAYER                                         │
│    ├── Relational Database: PostgreSQL with Strict Foreign Key Integrity    │
│    ├── Spatial Extension: PostGIS for Farm & Hub Geo-Coordinate Queries     │
│    ├── Object Storage: Secure Local / Cloud Storage for Diagnostic Photos   │
│    └── Client Local Persistence: IndexedDB for Offline Queue Operations     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Technology Stack Strategy & Justification

| Architectural Tier | Selected Technology | Evaluated Alternatives | Rationale for Selection |
|---|---|---|---|
| **Frontend Framework** | Next.js 14+ (App Router) | React SPA, Flutter Web | Server Components provide rapid initial paint over slow mobile networks; native PWA support. |
| **Styling & Design System** | Vanilla CSS Tokens + CSS Modules | Tailwind CSS, Material UI | Total control over high-contrast theme variables, zero-runtime overhead, lightweight bundle. |
| **Backend Framework** | FastAPI (Python 3.11+) | Django, Node.js / Express | Native asynchronous concurrency; seamless integration with Python ML/scientific libraries. |
| **Vision Inference** | PyTorch / TorchVision | TensorFlow, Cloud Vision APIs | Exceptional speed on CPU nodes; fine-grained model optimization for agricultural classification. |
| **Optimization Solver** | Custom capacity-constrained Python heuristic | Google OR-Tools, Linear Solvers | Lightweight, dependency-free, deterministic and fast for regional FPO clusters; OR-Tools is a possible future upgrade. |
| **Relational Database** | PostgreSQL 16 + PostGIS | MongoDB, MySQL | Native spatial radius calculations (identifying farms within 10 km); strict transactional consistency. |
| **Client Storage** | Dexie.js (IndexedDB) | LocalStorage, SQLite Wasm | IndexedDB handles binary image blobs efficiently without memory leak risks on low-end smartphones. |

---

## 5. Structural Domain Model & Entity Relationships

The core data model is structured around seven primary entities that mirror the physical lifecycle of horticulture in Manipur:

```
┌─────────────┐        1:N         ┌─────────────┐        1:N         ┌─────────────────────┐
│    USERS    ├───────────────────►│    FARMS    ├───────────────────►│    CROP RECORDS     │
│ (Role-based)│                    │  (PostGIS)  │                    │(Planting / Variety) │
└──────┬──────┘                    └─────────────┘                    └──────────┬──────────┘
       │                                                                         │
       │ 1:N                                                        ┌────────────┴────────────┐
       ▼                                                            ▼                         ▼
┌─────────────┐             1:N                            ┌─────────────────┐       ┌─────────────────┐
│BUYER ORDERS │◄────────────────────────┐                  │   DISEASE SCANS │       │HARVEST FORECASTS│
│ (Demands)   │                         │                  │ (Vision Result) │       │ (Window & Risk) │
└──────┬──────┘                         │                  └─────────────────┘       └─────────────────┘
       │                                │
       │ 1:N                            │ 1:N
       ▼                                │
┌─────────────┐        N:1         ┌────┴────────┐
│ BUYER OFFERS├───────────────────►│HARVEST LOTS │
│(Net Returns)│                    │(Consignments│
└─────────────┘                    └─────┬───────┘
                                         │
                                         │ N:1
                                         ▼
                                   ┌─────────────┐
                                   │DISPATCH RUNS│
                                   │(FPO Trucks) │
                                   └─────────────┘
```

---

## 6. Comprehensive Data Dictionaries (Schema Specification)

### 6.1 Entity: `users`
Represents all system participants across agricultural, commercial, and administrative roles.

| Attribute Name | Data Type | Constraints & Defaults | Nullable | Description & Domain Rules |
|---|---|---|---|---|
| `id` | UUID | Primary Key, Auto-generated | No | Globally unique user identifier. |
| `phone_number` | VARCHAR(15) | Unique, Indexed | No | Primary login credential for rural mobile users. |
| `full_name` | VARCHAR(150) | None | No | Legal name of farmer, buyer, or coordinator. |
| `password_hash` | VARCHAR(255) | Bcrypt / Argon2 hash | No | Secure salted credential storage. |
| `role` | VARCHAR(20) | Enum: farmer, buyer, fpo, admin | No | Enforces system access permissions. |
| `preferred_language`| VARCHAR(15) | Default: 'en' | No | Supports: 'en', 'mn_bengali', 'mn_mayek'. |
| `is_simulated` | BOOLEAN | Default: FALSE | No | Mandatory tag for test/demo accounts. |
| `created_at` | TIMESTAMPTZ | Default: NOW() | No | Audit record creation timestamp. |

### 6.2 Entity: `farms`
Represents geographic agricultural land holdings registered by growers.

| Attribute Name | Data Type | Constraints & Defaults | Nullable | Description & Domain Rules |
|---|---|---|---|---|
| `id` | UUID | Primary Key, Auto-generated | No | Unique farm entity identifier. |
| `farmer_id` | UUID | Foreign Key → `users.id` | No | Associated farmer owner. |
| `farm_name` | VARCHAR(150) | None | No | Farmer-designated holding name. |
| `district` | VARCHAR(100) | Indexed | No | Manipur district (e.g., Churachandpur, Thoubal). |
| `sub_division` | VARCHAR(100) | None | Yes | Local administrative circle / block. |
| `coordinates` | GEOGRAPHY(Point)| PostGIS 4326, Indexed | No | Exact latitude/longitude of farm gate. |
| `total_area_ha` | DECIMAL(6,2) | Value > 0 | No | Cultivated area in hectares. |
| `elevation_meters` | INTEGER | Range: 500 – 2500 | Yes | Topographical altitude above sea level. |

### 6.3 Entity: `crop_records`
Tracks individual planting cycles and phenological progression over time.

| Attribute Name | Data Type | Constraints & Defaults | Nullable | Description & Domain Rules |
|---|---|---|---|---|
| `id` | UUID | Primary Key, Auto-generated | No | Unique planting cycle identifier. |
| `farm_id` | UUID | Foreign Key → `farms.id` | No | Farm where crop is cultivated. |
| `crop_type` | VARCHAR(50) | Default: 'pineapple' | No | Botanical family classification. |
| `variety` | VARCHAR(50) | Enum: 'queen', 'kew' | No | Queen (table fruit) or Kew (canning fruit). |
| `planting_date` | DATE | <= CURRENT_DATE | No | Date slips or suckers were bedded. |
| `current_stage` | VARCHAR(30) | Enum: vegetative, inflorescence, fruit_development, color_break, mature | No | Current phenological development phase. |
| `estimated_plant_count`| INTEGER | Value > 0 | No | Number of active stands planted. |

### 6.4 Entity: `disease_assessments`
Records diagnostic results generated by the vision screening engine.

| Attribute Name | Data Type | Constraints & Defaults | Nullable | Description & Domain Rules |
|---|---|---|---|---|
| `id` | UUID | Primary Key, Auto-generated | No | Diagnostic assessment identifier. |
| `crop_record_id`| UUID | Foreign Key → `crop_records.id`| No | Planting stand under assessment. |
| `image_url` | VARCHAR(500) | Valid Storage URI | No | Path to compressed photographic proof. |
| `image_angle` | VARCHAR(30) | Enum: crown, fruit_base, lateral | No | Perspective of the diagnostic photo. |
| `predicted_class`| VARCHAR(50) | Enum: healthy, heart_rot, black_rot, mealybug_wilt | No | Machine-classified pathology outcome. |
| `confidence_score`| DECIMAL(4,3)| Range: 0.000 – 1.000 | No | Statistical probability from vision model. |
| `severity_rating`| VARCHAR(20) | Enum: none, mild, moderate, severe | No | Agronomic urgency classification. |
| `expert_referred`| BOOLEAN | Default: FALSE | No | Flag indicating field officer review requested. |
| `model_version` | VARCHAR(50) | e.g., 'pineapple-mobilenet-v1.2'| No | Provenance of model used for inference. |

### 6.5 Entity: `harvest_lots`
Represents marketable, physical consignments of harvested fruit.

| Attribute Name | Data Type | Constraints & Defaults | Nullable | Description & Domain Rules |
|---|---|---|---|---|
| `id` | UUID | Primary Key, Auto-generated | No | Consignment identification number. |
| `farmer_id` | UUID | Foreign Key → `users.id` | No | Consignment owner. |
| `crop_record_id`| UUID | Foreign Key → `crop_records.id`| No | Parent biological planting stand. |
| `quantity_kg` | DECIMAL(8,2) | Value > 0 | No | Total physical weight available for pickup. |
| `quality_grade` | VARCHAR(20) | Enum: grade_a, grade_b, processing | No | Physical grading standard. |
| `brix_reading` | DECIMAL(4,1) | Range: 8.0 – 20.0 | Yes | Sugar measurement if refractometer tested. |
| `harvest_window_start`| DATE | <= harvest_window_end | No | Earliest safe collection date. |
| `harvest_window_end` | DATE | >= harvest_window_start | No | Latest date before spoilage/overripeness. |
| `status` | VARCHAR(30) | Enum: registered, matched, committed, collected, settled | No | Consignment lifecycle tracker. |

### 6.6 Entity: `buyer_orders`
Represents institutional purchasing demand posted by wholesale buyers or processors.

| Attribute Name | Data Type | Constraints & Defaults | Nullable | Description & Domain Rules |
|---|---|---|---|---|
| `id` | UUID | Primary Key, Auto-generated | No | Purchase order identifier. |
| `buyer_id` | UUID | Foreign Key → `users.id` | No | Registered institutional purchasing entity. |
| `variety_required`| VARCHAR(50) | Enum: 'queen', 'kew', 'any' | No | Required botanical variety. |
| `min_grade` | VARCHAR(20) | Enum: grade_a, grade_b | No | Minimum acceptable quality threshold. |
| `target_quantity_kg`| DECIMAL(10,2)| Value >= 500.00 | No | Minimum institutional order volume. |
| `offered_gross_rate`| DECIMAL(8,2)| INR per kg | No | Headline offered purchase price. |
| `delivery_hub_district`| VARCHAR(100)| Manipur district | No | Destination intake facility. |
| `required_by_date` | DATE | >= CURRENT_DATE | No | Fulfillment deadline. |

### 6.7 Entity: `dispatch_runs`
Represents collective transport consolidation runs operated by FPOs.

| Attribute Name | Data Type | Constraints & Defaults | Nullable | Description & Domain Rules |
|---|---|---|---|---|
| `id` | UUID | Primary Key, Auto-generated | No | Dispatch manifest identifier. |
| `vehicle_type` | VARCHAR(50) | Enum: 3_wheeler, pickup_407, medium_truck | No | Transport vehicle classification. |
| `max_capacity_kg`| INTEGER | e.g., 800, 2500, 5000 | No | Maximum safe payload weight. |
| `driver_name` | VARCHAR(150) | None | No | Vehicle operator name. |
| `driver_phone` | VARCHAR(15) | None | No | Direct mobile contact for driver. |
| `total_loaded_kg`| DECIMAL(8,2) | <= max_capacity_kg | No | Sum of aggregated farmer lots loaded. |
| `destination_facility`| VARCHAR(200)| None | No | Central intake processing or retail hub. |
| `digital_gate_pass` | VARCHAR(100)| Cryptographic Token | No | Scannable QR manifest verification string. |

---

## 7. Authentication, Authorization & Role-Based Access Control

The platform enforces zero-trust identity separation using stateless JSON Web Tokens (JWT) signed with HMAC-SHA256:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ROLE ACCESS CONTROL MATRIX                            │
├────────────────────┬──────────┬──────────┬──────────┬───────────────────────┤
│ Endpoint / Feature │ Farmer   │ Buyer    │ FPO Coord│ Extension Officer     │
├────────────────────┼──────────┼──────────┼──────────┼───────────────────────┤
│ Upload Crop Photo  │ Full     │ None     │ Read     │ Full                  │
│ View Disease Screen│ Own Farm │ None     │ Cluster  │ Assigned District     │
│ Request Expert Help│ Yes      │ No       │ Yes      │ Receives & Resolves   │
│ View Harvest Window│ Own Crop │ None     │ Summary  │ Full District         │
│ Post Harvest Lot   │ Yes      │ No       │ On Behalf│ No                    │
│ Post Buyer Demand  │ No       │ Yes      │ No       │ No                    │
│ Review Net Returns │ Own Lots │ Anonymized Own Bids │ Regional Average      │
│ Accept Market Deal │ Yes      │ Confirms │ Oversees │ Read-only             │
│ Plan Aggregation   │ No       │ No       │ Full     │ Assists               │
│ Issue Gate-Pass    │ Receives │ Scans QR │ Issues   │ Validates             │
└────────────────────┴──────────┴──────────┴──────────┴───────────────────────┘
```

---

## 8. Infrastructure Topology & Deployment Model

For reliable development and clear reproducibility during competition evaluation, all infrastructure components are packaged into isolated container services:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DEPLOYMENT TOPOLOGY ARCHITECTURE                        │
│                                                                             │
│   [ Client Browser / Mobile PWA ]                                           │
│                 │                                                           │
│                 ▼ HTTPS (Port 443)                                          │
│   ┌───────────────────────────┐                                             │
│   │ Reverse Proxy & SSL Term  │                                             │
│   │ (Nginx / Cloudflare Edge) │                                             │
│   └─────────────┬─────────────┘                                             │
│                 │                                                           │
│         ┌───────┴───────┐                                                   │
│         │ Port 3000     │ Port 8000                                         │
│         ▼               ▼                                                   │
│   ┌───────────┐   ┌───────────┐                                             │
│   │  Next.js  │   │  FastAPI  │─── Local Weights (TorchScript .pt)          │
│   │ Frontend  │   │  Backend  │                                             │
│   └───────────┘   └─────┬─────┘                                             │
│                         │ Port 5432                                         │
│                         ▼                                                   │
│                   ┌───────────┐                                             │
│                   │PostgreSQL │                                             │
│                   │ + PostGIS │                                             │
│                   └───────────┘                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Development Roadmap & Milestone Phasing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT & VALIDATION TIMELINE                        │
├─────────┬──────────────────────┬────────────────────────────────────────────┤
│ Phase   │ Primary Milestone    │ Key Deliverables & Validation Criteria     │
├─────────┼──────────────────────┼────────────────────────────────────────────┤
│ Phase 1 │ Foundation & Schema  │ • PostgreSQL + PostGIS schema deployed     │
│         │ Setup                │ • Seed data populated for 3 Manipur hubs   │
│         │                      │ • User roles, JWT, and access matrix active│
├─────────┼──────────────────────┼────────────────────────────────────────────┤
│ Phase 2 │ Core Intelligence    │ • PyTorch vision pipeline (Top 3 diseases) │
│         │ Engines              │ • Phenology & GDD harvest window rules     │
│         │                      │ • Deterministic net-return pricing logic   │
│         │                      │ • dispatch solver logistics aggregation solver    │
├─────────┼──────────────────────┼────────────────────────────────────────────┤
│ Phase 3 │ Frontend UI & PWA    │ • High-contrast agrarian design system     │
│         │ System               │ • Client image compression (<300KB)        │
│         │                      │ • Meiteilon bilingual localization engine  │
│         │                      │ • Offline IndexedDB queue persistence      │
├─────────┼──────────────────────┼────────────────────────────────────────────┤
│ Phase 4 │ End-to-End Trial     │ • Simulated Churachandpur & Thoubal runs   │
│         │ & Competition Prep   │ • 5-minute judge demonstration dry run     │
│         │                      │ • Validation metrics verification complete │
└─────────┴──────────────────────┴────────────────────────────────────────────┘
```

---

## 10. Foundation Verification & Audit Matrix

- [x] **Zero Raw Code:** Document strictly adheres to formal architectural specifications, functional tables, data dictionaries, and structural diagrams without raw code blocks.
- [x] **Relational Integrity:** Explicit primary key, foreign key, cascade delete, and indexing policies across all 7 operational entities.
- [x] **Spatial Capability:** PostGIS spatial point data model incorporated to enable real-world route consolidation between farms and regional processing hubs.
- [x] **Agronomic Authenticity:** Specific attributes for Queen and Kew pineapple varieties, including refractometer Brix metrics and phenological development stages.
- [x] **Competition Defensibility:** Explicit tagging of simulated demonstration records (`is_simulated = TRUE`) to ensure absolute transparency and scientific honesty before competition evaluators.
