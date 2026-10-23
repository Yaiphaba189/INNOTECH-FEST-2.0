# HARVESTLINK AI — Phase-Wise Implementation Plan

## End-to-End Phased Roadmap from Foundation to Competition Day

---

> **Project:** Predictive Crop Intelligence and Smart Market Linkage for Manipur  
> **Document:** Phase-Wise Implementation Roadmap & Milestone Schedule  
> **Context:** INNOTECH FEST 2.0 Innovation Proposal & Hackathon Prototype  
> **Target Audience:** Project Leads, Evaluators, Engineering Members  
> **Standard:** Pure Engineering Management & Implementation Blueprint (Zero Raw Code)  

---

## Table of Contents

1. [Roadmap Architecture & Phasing Principles](#1-roadmap-architecture--phasing-principles)
2. [Global Phase Timeline & Milestone Gates](#2-global-phase-timeline--milestone-gates)
3. [Phase 0: Workspace Scaffolding & Git Workflow](#3-phase-0-workspace-scaffolding--git-workflow)
4. [Phase 1: Database Foundation, PostGIS & Domain Schema](#4-phase-1-database-foundation-postgis--domain-schema)
5. [Phase 2: Core Intelligence Engines & Algorithms (AI Workstream)](#5-phase-2-core-intelligence-engines--algorithms-ai-workstream)
6. [Phase 3: Backend API Layer, Asynchronous Services & Security](#6-phase-3-backend-api-layer-asynchronous-services--security)
7. [Phase 4: Frontend Application, Design System & Rural PWA](#7-phase-4-frontend-application-design-system--rural-pwa)
8. [Phase 5: System Integration & Demonstration Seed Ingestion](#8-phase-5-system-integration--demonstration-seed-ingestion)
9. [Phase 6: Containerization, Dress Rehearsal & Live Judging Pitch](#9-phase-6-containerization-dress-rehearsal--live-judging-pitch)
10. [Milestone Quality Gates & Acceptance Sign-Off Matrix](#10-milestone-quality-gates--acceptance-sign-off-matrix)

---

## 1. Roadmap Architecture & Phasing Principles

To transform the HARVESTLINK AI concept into a working, defensible prototype for **INNOTECH FEST 2.0**, implementation follows an agile, contract-driven phased model:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       7-STAGE PHASE-WISE ROADMAP                            │
├─────────┬──────────────────────────────┬────────────────────────────────────┤
│ Phase   │ Focus Area                   │ Primary Outcome                    │
├─────────┼──────────────────────────────┼────────────────────────────────────┤
│ Phase 0 │ Scaffolding & Versioning     │ Clean monorepo, .gitkeep folders,  │
│         │                              │ Git workflow initialized for team. │
├─────────┼──────────────────────────────┼────────────────────────────────────┤
│ Phase 1 │ Data Persistence & Models    │ PostgreSQL + PostGIS schema,       │
│         │                              │ spatial queries, 7 entities ready. │
├─────────┼──────────────────────────────┼────────────────────────────────────┤
│ Phase 2 │ AI Engines & Mathematical    │ PyTorch vision model, GDD thermal  │
│         │ Algorithms                   │ rules, Net-Return, dispatch solver solver.│
├─────────┼──────────────────────────────┼────────────────────────────────────┤
│ Phase 3 │ Web Services & Security      │ FastAPI endpoints, JWT auth, RBAC, │
│         │                              │ asynchronous service pipelines.    │
├─────────┼──────────────────────────────┼────────────────────────────────────┤
│ Phase 4 │ UI/UX, PWA & Localization    │ Next.js responsive app, camera     │
│         │                              │ compression, trilingual Meiteilon. │
├─────────┼──────────────────────────────┼────────────────────────────────────┤
│ Phase 5 │ Integration & Demo Scenarios │ Full loop wired: Churachandpur &   │
│         │                              │ Thoubal real-world seed data.      │
├─────────┼──────────────────────────────┼────────────────────────────────────┤
│ Phase 6 │ Hardening & Pitch Rehearsal  │ One-command Docker deployment,     │
│         │                              │ 5-minute timed live demo dry runs. │
└─────────┴──────────────────────────────┴────────────────────────────────────┘
```

---

## 2. Global Phase Timeline & Milestone Gates

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SYNCHRONIZED IMPLEMENTATION SCHEDULE                     │
├──────────┬──────────────────────────────────────┬───────────────────────────┤
│ Sprint   │ Major Engineering Milestones         │ Quality Gate Verification │
├──────────┼──────────────────────────────────────┼───────────────────────────┤
│ Sprint 1 │ Phase 0: Scaffolding & Git setup     │ Repo pushed to remote;    │
│ (Days 1) │ Phase 1: Database & PostGIS schema   │ all tables & indices live.│
├──────────┼──────────────────────────────────────┼───────────────────────────┤
│ Sprint 2 │ Phase 2: PyTorch model, GDD rules,   │ Vision inference <800ms;  │
│ (Days 2) │          net pricing & dispatch solver      │ solver converges in <3s.  │
├──────────┼──────────────────────────────────────┼───────────────────────────┤
│ Sprint 3 │ Phase 3: FastAPI endpoints, JWT auth │ OpenAPI docs passing;     │
│ (Days 3) │          & service orchestration     │ auth & RBAC validated.    │
├──────────┼──────────────────────────────────────┼───────────────────────────┤
│ Sprint 4 │ Phase 4: Next.js UI, Camera scanner, │ Images compressed <300KB; │
│ (Days 4) │          Harvest radar, Net pricing  │ trilingual toggle works.  │
├──────────┼──────────────────────────────────────┼───────────────────────────┤
│ Sprint 5 │ Phase 5: End-to-end integration with │ Complete closed loop      │
│ (Days 5) │          Manipur demonstration seed  │ verified on test cases.   │
├──────────┼──────────────────────────────────────┼───────────────────────────┤
│ Sprint 6 │ Phase 6: Docker Compose deployment,  │ Zero setup friction;      │
│ (Days 6-7│          pitch slides, judge demo run│ pitch runs in exactly 5m. │
└──────────┴──────────────────────────────────────┴───────────────────────────┘
```

---

## 3. Phase 0: Workspace Scaffolding & Git Workflow

### 3.1 Objective
Establish an empty, version-controlled monorepo directory layout with placeholder markers (`.gitkeep`) so team members can immediately clone, branch, and push without directory collisions.

### 3.2 Action Items & Tasks
1. Initialize local Git repository with the `main` branch.
2. Establish the monorepo directory tree:
   - `backend/`: Application factory, API routes, business services, ML models, optimization routines, Alembic migrations, test suite.
   - `frontend/`: Next.js App Router, components library, agrarian tokens, bilingual dictionary, client storage.
   - `data/`: Seed data files, sample demonstration crop images, model checkpoints.
   - `Docs/`: Architecture, AI backend, UI/UX, team work distribution, and phase roadmap documents.
3. Configure `.gitignore` with comprehensive exclusions for Python, Node.js, PostGIS dumps, large ML model binaries, and local operating system artifacts.
4. Place `.gitkeep` files in every terminal directory to ensure Git tracks all empty directory structures.

### 3.3 Verification Gate
- Running `git status` displays all directories tracked.
- Repository can be pushed cleanly to a remote host (GitHub / GitLab).

---

## 4. Phase 1: Database Foundation, PostGIS & Domain Schema

### 4.1 Objective
Deploy the relational PostgreSQL database with PostGIS extensions to support spatial clustering of smallholder pineapple farms across Manipur's terrain.

### 4.2 Action Items & Tasks
1. Set up PostgreSQL 16 container with PostGIS 3.4 enabled.
2. Implement schema definitions for the 7 primary domain entities:
   - `users`: Farmers, buyers, FPO coordinators, extension officers.
   - `farms`: Geographic boundaries, elevation, PostGIS spatial point.
   - `crop_records`: Planting stand tracking (Queen vs. Kew varieties).
   - `disease_assessments`: Vision model inference outcomes, confidence, and audit trail.
   - `harvest_lots`: Market-ready consignments, grades, Brix readings.
   - `buyer_orders`: Institutional purchasing demand and quality specifications.
   - `dispatch_runs`: Vehicle manifest, payload utilization, QR verification.
3. Establish database migration environment using Alembic.
4. Configure primary keys, foreign key constraints, cascade deletion policies, and spatial GIST indices on geographic coordinates.

### 4.3 Verification Gate
- Migration runs cleanly from zero state to full schema.
- Spatial query executes correctly (e.g., retrieving all registered farms within a 15 km radius of Thoubal center).

---

## 5. Phase 2: Core Intelligence Engines & Algorithms (AI Workstream)

### 5.1 Objective
Build, calibrate, and validate the four core intelligence engines independently of web delivery.

### 5.2 Action Items & Tasks
1. **Module A (Disease Vision Intelligence):**
   - Fine-tune MobileNetV3 / EfficientNet-B0 backbone for 4 classes (*Heart Rot*, *Black Rot*, *Mealybug Wilt*, *Healthy*).
   - Calibrate confidence outputs via temperature scaling.
   - Codify diagnostic triage rules: high confidence ($\ge 85\%$) triggers direct treatment protocol; medium confidence ($50\% - 85\%$) triggers monitoring; low confidence ($< 50\%$) triggers extension officer referral.
2. **Module B (Harvest Readiness & Weather Radar):**
   - Implement Growing Degree Day ($\text{GDD}$) accumulation equation with base temperature $T_{\text{base}} = 16.0^\circ\text{C}$.
   - Define Queen pineapple phenological stages (Day 0 vegetative to Day 480 color-break and mature harvest).
   - Codify weather risk rules triggering urgent 48-hour harvest alerts when mature stands face $\ge 50\text{mm}$ forecast rainfall.
3. **Module C (Net-Return Pricing Formulation):**
   - Implement true net return formula: $\text{Gross Rate} - \text{Freight} - \text{Crates} - \text{Platform Fee}$.
   - Build multi-criteria buyer ranking utility function weighting net price ($50\%$), distance ($20\%$), payment terms ($20\%$), and quality ($10\%$).
4. **Module D (dispatch solver Logistics Optimizer):**
   - Formulate Capacitated Vehicle Routing Problem with Time Windows ($\text{CVRPTW}$).
   - Enforce capacity threshold constraint requiring vehicle payload saturation $\ge 75\%$.

### 5.3 Verification Gate
- Vision model achieves $\ge 88\%$ top-1 accuracy on validation images.
- Solver completes consolidation plans for a 25-farm cluster within 3.0 seconds.

---

## 6. Phase 3: Backend API Layer, Asynchronous Services & Security

### 6.1 Objective
Construct the FastAPI web service layer connecting database persistence to the intelligence engines, secured with token-based access control.

### 6.2 Action Items & Tasks
1. Scaffold FastAPI application factory with CORS middleware, lifespan events, and global exception handlers.
2. Implement JWT authentication module (password hashing with Bcrypt, access token generation, token refresh).
3. Implement Role-Based Access Control (RBAC) dependency verifying permissions across Farmer, Buyer, FPO, and Extension Officer scopes.
4. Build REST API controllers:
   - Authentication routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
   - Crop assessment routes with multipart image upload (`/api/assessments/screen`).
   - Harvest forecasting routes (`/api/crops/{id}/forecast`).
   - Marketplace lot management and buyer matching (`/api/lots`, `/api/lots/{id}/matches`, `/api/matches/{id}/accept`).
   - Logistics dispatch plan generation (`/api/logistics/dispatch-plans/generate`).
5. Wire Member 1's AI engines into asynchronous background service calls.

### 6.3 Verification Gate
- Automated test suite achieves $>80\%$ coverage across critical routes.
- Swagger / OpenAPI documentation auto-generated and operational at `/docs`.

---

## 7. Phase 4: Frontend Application, Design System & Rural PWA

### 7.1 Objective
Build the Next.js 14 responsive web application and Progressive Web App (PWA) incorporating rural agrarian UX principles.

### 7.2 Action Items & Tasks
1. Configure Next.js App Router with TypeScript and global styling tokens (Pineapple Gold, Plantation Green, Slate dark ground).
2. Build client-side image downscaling module using HTML5 Canvas to compress raw smartphone photos to $<300\text{KB}$ prior to network transmission.
3. Implement trilingual localization provider supporting English, Manipuri in Bengali script, and Meetei Mayek script with zero-reload switching.
4. Build interactive screens:
   - *Farmer Dashboard:* Summary of active crops, lots, and weather alerts.
   - *Disease Scanner (Module A):* Camera preview, multi-angle guide, confidence meter, remediation protocol card, extension escalation trigger.
   - *Harvest Radar (Module B):* 18-month stage progression bar, GDD heat gauge, Brix sweetness indicator, 48-hour monsoon downpour alert.
   - *Net-Return Market Deck (Module C):* Side-by-side buyer quotes with expandable deduction breakdowns and 1-tap deal lock.
   - *FPO Dispatch Console (Module D):* Truck payload saturation meter ($82\%$ filled) and digital QR gate-pass.
5. Setup Dexie.js (IndexedDB) for local offline persistence of pending scans and harvest logs.

### 7.3 Verification Gate
- Client loads cleanly on mobile viewports with WCAG AAA contrast compliance under simulated high-glare conditions.
- Offline mode allows logging scans and reviewing cached forecasts without network connection.

---

## 8. Phase 5: System Integration & Demonstration Seed Ingestion

### 8.1 Objective
Connect the frontend client to the backend services and ingest realistic demonstration scenarios representing Manipur's horticulture hubs.

### 8.2 Action Items & Tasks
1. Integrate frontend API client with backend endpoints using JWT interceptors and retry handlers.
2. Populate the database with realistic demonstration seed scenarios tagged with `is_simulated = TRUE`:
   - *Churachandpur Cluster:* Smallholder Queen pineapple growers on terraced hill slopes facing Heart Rot symptoms.
   - *Thoubal Cluster:* Aggregated farm lots ready for collective transport to Imphal.
   - *Institutional Buyers:* Nilakuthi Food Park processing plant posting bulk purchase demand ($2,000\text{kg}$).
3. Execute end-to-end user journeys:
   - Farmer captures diseased leaf $\rightarrow$ 91.4% confidence Heart Rot diagnosis $\rightarrow$ organic remediation protocol displayed.
   - Farmer inspects mature crop $\rightarrow$ GDD indicates 14.8° Brix $\rightarrow$ system alerts of approaching 65mm downpour $\rightarrow$ recommends immediate 48-hour harvest.
   - Farmer registers 450 kg lot $\rightarrow$ buyer matching displays net take-home rate (₹24.40/kg vs ₹28.00/kg gross) $\rightarrow$ farmer accepts.
   - FPO console consolidates 4 farm lots into Tata 407 truck ($82\%$ payload saturation) $\rightarrow$ generates digital QR gate-pass.

### 8.3 Verification Gate
- The complete 4-module closed loop functions seamlessly end-to-end without unhandled runtime exceptions.

---

## 9. Phase 6: Containerization, Dress Rehearsal & Live Judging Pitch

### 9.1 Objective
Package the full application stack into a portable, one-command Docker environment and rehearse the 5-minute competition presentation.

### 9.2 Action Items & Tasks
1. Build production `docker-compose.yml` packaging PostgreSQL/PostGIS, FastAPI backend, and Next.js frontend.
2. Verify local standalone operation on judging laptop (zero dependency on external internet or public cloud).
3. Conduct 5-minute timed live demonstration dry runs adhering to the team speaking allocation:
   - *0:00 - 0:45:* Problem context & innovation loop (Member 3).
   - *0:45 - 1:45:* Module A Disease Scanner live run (Member 1).
   - *1:45 - 2:30:* Module B Harvest Radar & Weather alert (Member 1).
   - *2:30 - 3:30:* Module C Transparent Net Returns (Member 2).
   - *3:30 - 4:30:* Module D Collective Logistics & QR Gate-Pass (Member 2).
   - *4:30 - 5:00:* Trilingual Meiteilon toggle & wrap-up (Member 3).
4. Prepare contingency fallback backups (local screenshots, cached demo video) in case of presentation hardware failure.

### 9.3 Verification Gate
- `docker-compose up` launches all services healthy within 60 seconds on an offline laptop.
- Pitch cleanly finishes within the strict 5-minute competition time limit.

---

## 10. Milestone Quality Gates & Acceptance Sign-Off Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PHASE SIGN-OFF AUDIT CHECKLIST                        │
├───────┬──────────────────────────────┬────────────────────────────┬─────────┤
│ Phase │ Primary Acceptance Criterion │ Responsible Lead           │ Status  │
├───────┼──────────────────────────────┼────────────────────────────┼─────────┤
│ Ph. 0 │ Workspace scaffolded with    │ Member 2 (Backend Lead)    │ READY   │
│       │ .gitkeep markers and .git    │                            │         │
├───────┼──────────────────────────────┼────────────────────────────┼─────────┤
│ Ph. 1 │ Relational PostGIS schema    │ Member 2 (Backend Lead)    │ READY   │
│       │ verified across 7 entities   │                            │         │
├───────┼──────────────────────────────┼────────────────────────────┼─────────┤
│ Ph. 2 │ Vision model inference &     │ Member 1 (AI / ML Lead)    │ READY   │
│       │ dispatch solver solvers validated   │                            │         │
├───────┼──────────────────────────────┼────────────────────────────┼─────────┤
│ Ph. 3 │ FastAPI endpoints & JWT auth │ Member 2 (Backend Lead)    │ READY   │
│       │ passed test suite            │                            │         │
├───────┼──────────────────────────────┼────────────────────────────┼─────────┤
│ Ph. 4 │ Next.js UI, PWA offline, and │ Member 3 (Frontend Lead)   │ READY   │
│       │ Meiteilon engine operational │                            │         │
├───────┼──────────────────────────────┼────────────────────────────┼─────────┤
│ Ph. 5 │ Full closed-loop demo seed   │ All Team Members           │ READY   │
│       │ verified without errors      │                            │         │
├───────┼──────────────────────────────┼────────────────────────────┼─────────┤
│ Ph. 6 │ Dockerized stack & 5-minute  │ All Team Members           │ READY   │
│       │ pitch rehearsed for judges   │                            │         │
└───────┴──────────────────────────────┴────────────────────────────┴─────────┘
```
