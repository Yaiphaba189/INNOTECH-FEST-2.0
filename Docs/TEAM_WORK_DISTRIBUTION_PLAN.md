# HARVESTLINK AI — Team Work Distribution & Execution Plan

## 3-Member Engineering Allocation for INNOTECH FEST 2.0

---

> **Project:** Predictive Crop Intelligence and Smart Market Linkage for Manipur  
> **Document:** Team Work Breakdown & Role Distribution  
> **Team Size:** 3 Engineering Members (AI Engineer, Backend Engineer, Frontend & UI/UX Engineer)  
> **Context:** INNOTECH FEST 2.0 Innovation Proposal & Hackathon Prototype  
> **Standard:** Pure Engineering Management & Architectural Documentation (Zero Raw Code)  

---

## Table of Contents

1. [Executive Summary & Team Architecture](#1-executive-summary--team-architecture)
2. [Global RACI Responsibility Matrix](#2-global-raci-responsibility-matrix)
3. [Member 1: AI / Machine Learning Engineer](#3-member-1-ai--machine-learning-engineer)
4. [Member 2: Backend & Systems Engineer](#4-member-2-backend--systems-engineer)
5. [Member 3: Frontend & UI/UX Engineer](#5-member-3-frontend--uiux-engineer)
6. [Cross-Functional Integration Touchpoints & Contracts](#6-cross-functional-integration-touchpoints--contracts)
7. [Inter-Member Dependency & Risk Mitigation Matrix](#7-inter-member-dependency--risk-mitigation-matrix)
8. [7-Day Sprint Execution Timeline to Competition Day](#8-7-day-sprint-execution-timeline-to-competition-day)
9. [Innotech Fest 2.0 Live Pitch Speaking Distribution](#9-innotech-fest-20-live-pitch-speaking-distribution)
10. [Team Readiness & Deliverable Sign-Off Checklist](#10-team-readiness--deliverable-sign-off-checklist)

---

## 1. Executive Summary & Team Architecture

To deliver HARVESTLINK AI as an end-to-end working decision-support prototype within the competitive timeline of INNOTECH FEST 2.0, the technical workload is divided across three specialized engineering roles.

Rather than working in silos, each member owns a clear layer of the platform with explicitly documented hand-off interfaces:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          3-MEMBER WORKSTREAM TOPOLOGY                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ MEMBER 3: FRONTEND & UI/UX ENGINEER                                 │   │
│   │ • Next.js 14 App Router, Responsive Web & PWA                       │   │
│   │ • High-contrast agrarian design system (Sunlight glare resistant)   │   │
│   │ • Client-side image compression (<300 KB for 2G network resilience) │   │
│   │ • Trilingual localization (English, Bengali Script, Meetei Mayek)   │   │
│   │ • Offline-first IndexedDB queue & presentation flow                 │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │ JSON REST APIs / Contract Schemas    │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ MEMBER 2: BACKEND & SYSTEMS ENGINEER                                │   │
│   │ • FastAPI asynchronous web service architecture                     │   │
│   │ • PostgreSQL + PostGIS relational database & spatial indexing       │   │
│   │ • JWT authentication & Role-Based Access Control (RBAC)             │   │
│   │ • Service orchestration layer (Farms, Crops, Lots, Orders)          │   │
│   │ • Docker containerization, staging environment & seed demo data     │   │
│   └───────────────────▲─────────────────────────────▲───────────────────┘   │
│                       │ Inference Tensors           │ Mathematical Solvers  │
│                       │ & Preprocessed Images       │ & Phenology Logic     │
│   ┌───────────────────┴─────────────────────────────┴───────────────────┐   │
│   │ MEMBER 1: AI / MACHINE LEARNING ENGINEER                            │   │
│   │ • Module A: PyTorch Computer Vision disease model (MobileNetV3)     │   │
│   │ • Module B: Phenological harvest rules & GDD thermal accumulation   │   │
│   │ • Module C: Transparent net-returns pricing formulation             │   │
│   │ • Module D: Google OR-Tools vehicle routing & capacity solver       │   │
│   │ • Scientific defensibility, evaluation metrics & validation data    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Global RACI Responsibility Matrix

*Legend:*  
- **R (Responsible):** The primary owner who executes the deliverable.  
- **A (Accountable):** The ultimate decision-maker for technical correctness.  
- **C (Consulted):** Provides vital inputs, review, or domain context.  
- **I (Informed):** Updated on progress and dependent outcomes.  

```
┌──────────────────────────────────────────────┬──────────────┬──────────────┬──────────────┐
│ Platform Component / Deliverable             │ Member 1     │ Member 2     │ Member 3     │
│                                              │ (AI / ML)    │ (Backend)    │ (Frontend)   │
├──────────────────────────────────────────────┼──────────────┼──────────────┼──────────────┤
│ 1. Core Architecture & Tech Stack Freeze     │ C            │ A / R        │ C            │
│ 2. PostgreSQL + PostGIS Schema Design        │ C            │ A / R        │ I            │
│ 3. REST API Contract & Data Schema Freeze    │ C            │ A / R        │ C            │
│ 4. Module A: Vision Disease Model & Triage   │ A / R        │ C            │ I            │
│ 5. Module A: Image Preprocessing & Inference │ A / R        │ C            │ C            │
│ 6. Module A: Disease Scanner Camera Screen   │ I            │ C            │ A / R        │
│ 7. Module B: GDD & Phenology Rules Engine    │ A / R        │ C            │ I            │
│ 8. Module B: Weather Risk Alert API          │ C            │ A / R        │ I            │
│ 9. Module B: Harvest Readiness Radar UI      │ I            │ C            │ A / R        │
│ 10. Module C: Net-Return Pricing Formula     │ A / R        │ C            │ I            │
│ 11. Module C: Market Matching Endpoints      │ C            │ A / R        │ I            │
│ 12. Module C: Transparent Deductions UI      │ I            │ C            │ A / R        │
│ 13. Module D: OR-Tools Logistics Solver      │ A / R        │ C            │ I            │
│ 14. Module D: Dispatch Manifest Generation   │ C            │ A / R        │ I            │
│ 15. Module D: FPO Capacity & Gate-Pass UI    │ I            │ C            │ A / R        │
│ 16. JWT Auth & Role-Based Access Control     │ I            │ A / R        │ C            │
│ 17. Client Image Compression (<300 KB)       │ C            │ I            │ A / R        │
│ 18. Trilingual Localization (EN / Meiteilon) │ I            │ I            │ A / R        │
│ 19. Offline IndexedDB Persistence & PWA      │ I            │ C            │ A / R        │
│ 20. Seed Data Generation (Churachandpur/THB) │ C            │ A / R        │ I            │
│ 21. Docker Containerization & Demo Staging   │ C            │ A / R        │ C            │
│ 22. Innotech Fest 5-Minute Pitch & Slide Deck│ C            │ C            │ A / R        │
└──────────────────────────────────────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 3. Member 1: AI / Machine Learning Engineer

### 3.1 Primary Role & Ownership
The AI/ML Engineer is responsible for the **scientific validity, algorithmic formulations, and mathematical intelligence** of the entire platform. This member guarantees that every AI claim is technically defensible before judges.

### 3.2 Specific Responsibilities by Module

#### Module A: Crop Disease Screening Intelligence
- Train/fine-tune a lightweight MobileNetV3 or EfficientNet-B0 vision classifier for the top 3 pineapple diseases in Manipur (*Phytophthora Heart Rot*, *Thielaviopsis Black Rot*, *Mealybug Wilt*) plus healthy stands.
- Establish probability calibration (temperature scaling) to ensure confidence scores represent true diagnostic probabilities.
- Formulate the triage rules: high confidence ($\ge 85\%$) triggers immediate treatment protocols; medium confidence ($50\% - 85\%$) triggers monitoring; low confidence ($< 50\%$) triggers human extension officer escalation.
- Document organic, chemical, and cultural treatment recommendations verified by regional horticultural standards (ICAR / CAU Imphal).

#### Module B: Harvest Readiness & Meteorological Risk
- Formulate the Growing Degree Day ($\text{GDD}$) accumulation equation with base temperature $T_{\text{base}} = 16.0^\circ\text{C}$.
- Define the phenological developmental stage rules for Queen and Kew pineapples (planting to color-break and mature harvest).
- Specify the risk synthesis logic that links forecasted precipitation ($\ge 50\text{mm}$ in 48 hours) to urgent pre-downpour harvest advisories.

#### Module C: Net-Return Pricing Formulation
- Formulate the transparent pricing equation: $\text{Net Rate} = \text{Gross} - \text{Freight} - \text{Crates} - \text{Platform Fee}$.
- Design the multi-criteria buyer ranking utility function weighting net return ($50\%$), transit distance ($20\%$), payment terms ($20\%$), and quality alignment ($10\%$).

#### Module D: Collective Logistics Solver
- Formulate the Capacitated Vehicle Routing Problem with Time Windows ($\text{CVRPTW}$) using Google OR-Tools.
- Define constraints: vehicle payload limits (Tata 407, 3-wheeler), $75\%$ minimum payload threshold, and farmer pickup windows.

### 3.3 Key Deliverables & Artifacts
1. **Model Weights & Inference Pipeline:** Lightweight PyTorch model artifact (`.pt` / TorchScript) optimized for fast CPU inference ($<800\text{ms}$).
2. **Algorithmic Module Functions:** Pure Python modules with clean functional signatures for disease prediction, harvest window calculation, net return pricing, and OR-Tools route solving.
3. **Scientific Documentation:** Model evaluation tables (Accuracy, Precision, Recall, F1-Score) and mathematical formulas for the competition presentation.

---

## 4. Member 2: Backend & Systems Engineer

### 4.1 Primary Role & Ownership
The Backend Engineer is responsible for the **core system infrastructure, data persistence, REST API service layer, and production stability**. This member ensures the backend reliably orchestrates transactions between the frontend and the AI modules.

### 4.2 Specific Responsibilities

#### Database Design & Persistence Layer
- Implement the PostgreSQL database schema with PostGIS spatial extension.
- Maintain data integrity across all 7 operational entities (`users`, `farms`, `crop_records`, `disease_assessments`, `harvest_lots`, `buyer_orders`, `dispatch_runs`).
- Enforce foreign keys, cascade policies, and spatial indices for fast geographic radius searches (e.g., finding farms within 15 km).

#### Security, Authentication & Access Control
- Build the stateless JWT authentication system with password hashing (Bcrypt/Argon2).
- Implement the Role-Based Access Control (RBAC) middleware ensuring Farmers, Buyers, FPO Coordinators, and Extension Officers only access their authorized scopes.

#### API Orchestration & Service Layer
- Develop RESTful API endpoints adhering to standard HTTP verbs and status codes.
- Integrate Member 1’s PyTorch model and OR-Tools solver into non-blocking asynchronous service pipelines.
- Create file upload handlers for diagnostic crop images with validation and storage management.

#### Containerization & Demonstration Seeding
- Configure Docker Compose orchestrating PostgreSQL, PostGIS, and FastAPI.
- Write realistic seed scripts populating realistic demonstration data for Manipur pineapple clusters:
  - 3 simulated farmers across Churachandpur and Thoubal.
  - 2 verified wholesale buyers (Manipur Fruit Processing Co-op, Nilakuthi).
  - Pre-loaded harvest lots and historical weather data.

### 4.3 Key Deliverables & Artifacts
1. **FastAPI Application:** Complete, running asynchronous backend web service.
2. **Database Migrations & Seed Data:** Alembic migration scripts and reproducible seed scenarios tagged with `is_simulated = TRUE`.
3. **OpenAPI / Swagger Documentation:** Fully documented API documentation accessible at `/docs` for frontend integration.
4. **Dockerized Environment:** One-command deployment (`docker-compose up`) ensuring zero setup friction on judging day.

---

## 5. Member 3: Frontend & UI/UX Engineer

### 5.1 Primary Role & Ownership
The Frontend Engineer is responsible for the **user experience, interface design, client-side resilience, accessibility, and the visual presentation** of the platform. This member guarantees that judges and farmers experience a high-impact, polished product.

### 5.2 Specific Responsibilities

#### Agrarian Design System & Responsive Layout
- Implement the custom design system utilizing high-contrast tokens:
  - Pineapple Gold (`#F59E0B`), Plantation Green (`#10B981`), Deep Slate ground (`#0F172A`).
- Enforce sunlight-glare resilience: deep-slate dark theme with WCAG AAA contrast ratios.
- Maintain field ergonomics: minimum $48\times 48\text{px}$ touch targets and card-based tap interactions.

#### Screen & Component Implementation
- **Farmer Portal:**
  - *Module A Screen:* Camera capture interface, multi-angle visual guide, confidence score meter, actionable remedy checklist, and 1-tap extension officer escalation.
  - *Module B Screen:* Phenological development progress bar, GDD heat gauge, Brix sweetness indicator, and 48-hour monsoon downpour alert.
  - *Module C Screen:* Side-by-side buyer match deck with expandable deduction breakdowns (Gross Rate vs True Net Take-Home).
- **Buyer & FPO Consoles:**
  - Institutional demand order creator and marketplace lot browser.
  - FPO consolidation screen with vehicle payload fill meter ($82\%$ saturation) and digital QR gate-pass.

#### Low-Bandwidth & Offline Resilience
- Build client-side canvas image downscaling to compress smartphone photos to $<300\text{KB}$ before transmission over rural 2G/3G networks.
- Configure IndexedDB (Dexie.js) offline caching allowing farmers to log disease scans and view harvest forecasts without active internet.

#### Bilingual Localization Engine
- Implement trilingual language toggle: English, Manipuri in Bengali script, and Meetei Mayek script.
- Ensure instantaneous UI translation without page reload.

### 5.3 Key Deliverables & Artifacts
1. **Next.js 14 Web Application:** High-performance, responsive web application and PWA.
2. **Interactive Demo Prototype:** Fully functional frontend connected to Member 2's backend with smooth transitions and zero visual glitches.
3. **5-Minute Pitch Deck & Presentation Flow:** Visual slides and choreographed live demonstration sequence for the Innotech Fest 2.0 evaluation panel.

---

## 6. Cross-Functional Integration Touchpoints & Contracts

To eliminate integration friction, the three members interact through standardized boundary agreements:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CROSS-ROLE INTEGRATION CONTRACTS                      │
├─────────────────────┬───────────────────────────────────────────────────────┤
│ Interface Boundary  │ Agreed Standard & Contract Specification              │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ Member 1 ──►        │ • Pure Python module signatures with typed inputs.   │
│ Member 2            │ • Vision: `predict_disease(image_bytes) -> ResultDict`│
│ (AI to Backend)     │ • Forecast: `calculate_harvest(crop_stage, gdd) -> Dict`│
│                     │ • Solver: `solve_cvrp(stops, vehicle_cap) -> PlanDict` │
│                     │ • Self-contained dependencies; no DB imports in ML.   │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ Member 2 ──►        │ • Strict REST API JSON contracts defined in Part 2.   │
│ Member 3            │ • Standard error payload format:                      │
│ (Backend to UI)     │   `{"detail": {"code": "ERROR_CODE", "msg": "..."}}`  │
│                     │ • All image uploads via `multipart/form-data`.        │
│                     │ • JWT passed via `Authorization: Bearer <token>`.      │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ Member 3 ──►        │ • Client guarantees images are compressed to <500 KB  │
│ Member 1            │   and minimum 224x224 px before upload.               │
│ (UI to AI Model)    │ • UI accurately renders confidence brackets (<50%,    │
│                     │   50-85%, >85%) matching Member 1's decision matrix. │
└─────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 7. Inter-Member Dependency & Risk Mitigation Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DEPENDENCY BOTTLENECK & FALLBACK MATRIX                  │
├──────────────────┬──────────────────────┬───────────────────────────────────┤
│ Potential Risk   │ Dependent Member     │ Architectural Fallback Strategy   │
├──────────────────┼──────────────────────┼───────────────────────────────────┤
│ Delay in PyTorch │ Member 2 (Backend)   │ Member 1 supplies a lightweight   │
│ model training   │ Member 3 (Frontend)  │ rule-based diagnostic mock engine │
│                  │                      │ returning calibrated fixtures.    │
│                  │                      │ Backend and UI proceed unblocked. │
├──────────────────┼──────────────────────┼───────────────────────────────────┤
│ Backend API      │ Member 3 (Frontend)  │ Member 3 uses static JSON mock    │
│ endpoints not yet│                      │ handlers matching the OpenAPI     │
│ deployed         │                      │ schema from Day 1 to build screens│
│                  │                      │ independently.                    │
├──────────────────┼──────────────────────┼───────────────────────────────────┤
│ OR-Tools solver  │ Member 2 (Backend)   │ Fallback to a greedy nearest-     │
│ convergence      │                      │ neighbor clustering algorithm     │
│ edge cases       │                      │ for regional demo clusters.       │
├──────────────────┼──────────────────────┼───────────────────────────────────┤
│ Weak judging hall│ All Members          │ Full local deployment via Docker  │
│ Wi-Fi connection │                      │ on localhost; client PWA cached;  │
│                  │                      │ zero reliance on public cloud.    │
└──────────────────┴──────────────────────┴───────────────────────────────────┘
```

---

## 8. 7-Day Sprint Execution Timeline to Competition Day

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       7-DAY COMPETITION SPRINT CALENDAR                     │
├───────┬─────────────────────────────────────────────────────────────────────┤
│ Day   │ Synchronized Milestone & Team Goals                                 │
├───────┼─────────────────────────────────────────────────────────────────────┤
│ DAY 1 │ Architecture Alignment & Contract Freeze                            │
│       │ • Joint review of 3 specification documents.                        │
│       │ • Freeze API endpoints, data entities, and folder structure.        │
│       │ • Member 1 begins dataset curation & model setup.                   │
│       │ • Member 2 initializes FastAPI, PostgreSQL, and PostGIS.            │
│       │ • Member 3 scaffolds Next.js project and design tokens.             │
├───────┼─────────────────────────────────────────────────────────────────────┤
│ DAY 2 │ Core Scaffolding & Independent Prototyping                          │
│       │ • Member 1: Validates MobileNetV3 pipeline & GDD formula.           │
│       │ • Member 2: Implements User Auth, Farms, Crops, and Lots CRUD.      │
│       │ • Member 3: Builds UI component library & Camera uploader.          │
├───────┼─────────────────────────────────────────────────────────────────────┤
│ DAY 3 │ First Integration Point: Module A & B                               │
│       │ • Member 1 hands over vision model & harvest rules to Member 2.     │
│       │ • Member 2 wires `/assessments/screen` and `/crops/forecast`.       │
│       │ • Member 3 connects Disease Scanner & Harvest Radar to API.         │
│       │ • First successful end-to-end photo diagnostic test.                │
├───────┼─────────────────────────────────────────────────────────────────────┤
│ DAY 4 │ Second Integration Point: Module C & D                              │
│       │ • Member 1 delivers net return pricing & OR-Tools routing solver.   │
│       │ • Member 2 wires matching engine and dispatch plan generation.      │
│       │ • Member 3 implements Net-Return Quote card & FPO Truck gauge.      │
├───────┼─────────────────────────────────────────────────────────────────────┤
│ DAY 5 │ System Hardening, Seed Scenarios & Resilience                       │
│       │ • Member 2 loads realistic seed dataset for Manipur pineapple hubs. │
│       │ • Member 3 completes Meiteilon translations & offline IndexedDB.    │
│       │ • Member 1 validates model accuracy & solver constraints.           │
│       │ • Full Docker Compose containerization verified.                    │
├───────┼─────────────────────────────────────────────────────────────────────┤
│ DAY 6 │ End-to-End Rehearsal & Live Demo Dry Runs                           │
│       │ • Team conducts simulated 5-minute competition pitch runs.          │
│       │ • Verify complete loop: Disease Scan → Harvest Alert → Market Match │
│       │   → FPO Truck Consolidation → QR Gate-Pass.                         │
│       │ • Fix edge-case layout glitches and timing bottlenecks.             │
├───────┼─────────────────────────────────────────────────────────────────────┤
│ DAY 7 │ COMPETITION DAY: INNOTECH FEST 2.0 EVALUATION                       │
│       │ • Deliver synchronized live presentation before judging committee.  │
│       │ • Operate live interactive demo on local containerized stack.       │
│       │ • Answer technical architecture and agronomic defense questions.    │
└───────┴─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Innotech Fest 2.0 Live Pitch Speaking Distribution

During the 5-minute live judging evaluation, all three members take the floor to demonstrate collaborative ownership:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 5-MINUTE JUDGE DEMONSTRATION SPEAKING ORDER                 │
├─────────┬──────────────────────┬─────────────┬──────────────────────────────┤
│ Timing  │ Presentation Segment │ Lead Speaker│ Key Talking Points & Action  │
├─────────┼──────────────────────┼─────────────┼──────────────────────────────┤
│ 0:00 to │ Problem Context &    │ Member 3    │ • Explain Manipur pineapple  │
│ 0:45    │ Innovation Overview  │ (Frontend)  │   post-harvest challenges.   │
│         │                      │             │ • Introduce closed-loop      │
│         │                      │             │   decision support system.   │
├─────────┼──────────────────────┼─────────────┼──────────────────────────────┤
│ 0:45 to │ Module A: Disease    │ Member 1    │ • Demonstrate live camera    │
│ 1:45    │ Screening & Triage   │ (AI / ML)   │   scan of pineapple rot.     │
│         │                      │             │ • Explain 91% confidence,    │
│         │                      │             │   MobileNetV3 CPU speed,     │
│         │                      │             │   and organic remedies.      │
├─────────┼──────────────────────┼─────────────┼──────────────────────────────┤
│ 1:45 to │ Module B: Harvest &  │ Member 1    │ • Explain GDD thermal units. │
│ 2:30    │ Weather Risk Radar   │ (AI / ML)   │ • Demonstrate 48h monsoon    │
│         │                      │             │   downpour alert.            │
├─────────┼──────────────────────┼─────────────┼──────────────────────────────┤
│ 2:30 to │ Module C: Net-Return │ Member 2    │ • Show transparent pricing   │
│ 3:30    │ Market Matching      │ (Backend)   │   formula (Gross vs Net).    │
│         │                      │             │ • Demonstrate 1-tap accept   │
│         │                      │             │   and transactional lock.    │
├─────────┼──────────────────────┼─────────────┼──────────────────────────────┤
│ 3:30 to │ Module D: Collective │ Member 2    │ • Show OR-Tools vehicle      │
│ 4:30    │ Logistics & QR Pass  │ (Backend)   │   consolidation (82% fill).  │
│         │                      │             │ • Show generated QR manifest │
│         │                      │             │   and ₹1.85/kg cost savings. │
├─────────┼──────────────────────┼─────────────┼──────────────────────────────┤
│ 4:30 to │ Bilingual Toggle,    │ Member 3    │ • Tap to switch interface    │
│ 5:00    │ Offline & Closing    │ (Frontend)  │   into Meiteilon script.     │
│         │                      │             │ • Conclude with social and   │
│         │                      │             │   economic impact summary.   │
└─────────┴──────────────────────┴─────────────┴──────────────────────────────┘
```

---

## 10. Team Readiness & Deliverable Sign-Off Checklist

### Member 1: AI / ML Engineer Sign-Off
- [x] PyTorch vision model inference script operational on CPU ($<800\text{ms}$).
- [x] Confidence thresholding and triage decision rules verified.
- [x] Phenological GDD calculation validated against Queen pineapple lifecycle.
- [x] Net-return mathematical formulation and ranking logic completed.
- [x] OR-Tools CVRPTW solver converging in $<3$ seconds on 25-stop regional clusters.

### Member 2: Backend Engineer Sign-Off
- [x] PostgreSQL + PostGIS schema deployed with all constraints and indices.
- [x] JWT authentication and RBAC middleware tested across all 4 roles.
- [x] Asynchronous endpoints operational for assessments, crops, lots, and orders.
- [x] Seed data script generating realistic Churachandpur/Thoubal scenarios.
- [x] Containerized Docker Compose stack running with one command.

### Member 3: Frontend Engineer Sign-Off
- [x] Responsive Next.js application with sunlight-glare resistant dark theme.
- [x] Client-side image downscaling confirmed ($<300\text{KB}$ output).
- [x] Complete UI screens for Disease Triage, Harvest Radar, Net Pricing, and FPO Dispatch.
- [x] Trilingual engine functioning across English, Bengali script, and Meetei Mayek.
- [x] Slide deck and live demo script synchronized for the 5-minute presentation.
