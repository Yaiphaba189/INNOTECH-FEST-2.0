# HARVESTLINK AI — AI Engineer (Member 1) — Compiled Parts

> **Implementation status (disease coverage):** The shipped pineapple checkpoint is a fine-tuned MobileNetV3-Small trained on public leaf images for **Healthy vs Mealybug Wilt only** (97.0% accuracy on a held-out public split; not validated on Manipur field data). **Heart Rot and Black Rot have no trained coverage yet** and are screened by an explainable colour-rule heuristic with expert-referral triage (see `Docs/DATA.md`). Class lists and accuracy targets elsewhere in this document describe the design goal, not the current model.

**Consolidated from:**
- `Docs/PHASE_WISE_IIMPLEMENTATION_PLAN.md` (Phase-Wise Implementation Plan)
- `Docs/TEAM_WORK_DISTRIBUTION_PLAN.md` (Team Work Distribution & Execution Plan)

**Project:** Predictive Crop Intelligence and Smart Market Linkage for Manipur  
**Role:** Member 1 — AI / Machine Learning Engineer  
**Event:** INNOTECH FEST 2.0

---

## 1. Role Summary

**Primary ownership:** The AI/ML Engineer is responsible for the **scientific validity, algorithmic formulations, and mathematical intelligence** of the entire platform. This member guarantees that every AI claim is technically defensible before judges.

**Workstream position:** Member 1 sits at the bottom of the topology — producing inference tensors & preprocessed images, and mathematical solvers & phenology logic — which Member 2 (Backend) consumes via REST APIs, which Member 3 (Frontend) presents to users.

---

## 2. Module-by-Module Responsibilities

### Module A: Crop Disease Screening Intelligence (Vision)

From the Team Work Distribution Plan:
- Train/fine-tune a lightweight **MobileNetV3 or EfficientNet-B0** vision classifier for the top 3 pineapple diseases in Manipur (*Phytophthora Heart Rot*, *Thielaviopsis Black Rot*, *Mealybug Wilt*) plus healthy stands.
- Establish probability calibration (**temperature scaling**) to ensure confidence scores represent true diagnostic probabilities.
- Formulate the triage rules:
  - High confidence (≥85%) → immediate treatment protocols.
  - Medium confidence (50%–85%) → monitoring.
  - Low confidence (<50%) → human extension officer escalation.
- Document **organic, chemical, and cultural treatment recommendations** verified by regional horticultural standards (ICAR / CAU Imphal).

From the Phase-Wise Implementation Plan (Phase 2):
- Fine-tune MobileNetV3 / EfficientNet-B0 backbone for 4 classes (*Heart Rot*, *Black Rot*, *Mealybug Wilt*, *Healthy*).
- Calibrate confidence outputs via temperature scaling.
- Codify diagnostic triage rules: high confidence (≥85%) triggers direct treatment protocol; medium confidence (50%–85%) triggers monitoring; low confidence (<50%) triggers extension officer referral.

### Module B: Harvest Readiness & Meteorological Risk

From the Team Work Distribution Plan:
- Formulate the **Growing Degree Day (GDD) accumulation equation** with base temperature **T_base = 16.0°C**.
- Define the phenological developmental stage rules for **Queen and Kew pineapples** (planting to color-break and mature harvest).
- Specify the risk synthesis logic linking forecasted precipitation (**≥50mm in 48 hours**) to urgent pre-downpour harvest advisories.

From the Phase-Wise Implementation Plan (Phase 2):
- Implement Growing Degree Day (GDD) accumulation equation with base temperature T_base = 16.0°C.
- Define Queen pineapple phenological stages (Day 0 vegetative to Day 480 color-break and mature harvest).
- Codify weather risk rules triggering urgent 48-hour harvest alerts when mature stands face ≥50mm forecast rainfall.

### Module C: Net-Return Pricing Formulation

From the Team Work Distribution Plan:
- Formulate the transparent pricing equation: **Net Rate = Gross − Freight − Crates − Platform Fee**.
- Design the multi-criteria buyer ranking utility function weighting **net return (50%), transit distance (20%), payment terms (20%), quality alignment (10%)**.

From the Phase-Wise Implementation Plan (Phase 2):
- Implement true net return formula: Gross Rate − Freight − Crates − Platform Fee.
- Build multi-criteria buyer ranking utility function weighting net price (50%), distance (20%), payment terms (20%), and quality (10%).

### Module D: Collective Logistics Solver

From the Team Work Distribution Plan:
- Formulate the **Capacitated Vehicle Routing Problem with Time Windows (CVRPTW)** using **capacity-constrained dispatch solver**.
- Define constraints: vehicle payload limits (Tata 407, 3-wheeler), **75% minimum payload threshold**, and farmer pickup windows.

From the Phase-Wise Implementation Plan (Phase 2):
- Formulate Capacitated Vehicle Routing Problem with Time Windows (CVRPTW).
- Enforce capacity threshold constraint requiring vehicle payload saturation ≥75%.

---

## 3. Phase 2 Action Items (Phase-Wise Implementation Plan)

**Phase 2: Core Intelligence Engines & Algorithms (AI Workstream)**

| Module | Action Items |
|--------|-------------|
| **A — Disease Vision** | Fine-tune MobileNetV3 / EfficientNet-B0 backbone for 4 classes; calibrate confidence via temperature scaling; codify diagnostic triage rules (≥85% treatment / 50–85% monitoring / <50% referral). |
| **B — Harvest Readiness** | Implement GDD accumulation (T_base = 16.0°C); define Queen pineapple phenological stages (Day 0 vegetative → Day 480 color-break/mature harvest); codify ≥50mm 48-hour rainfall → urgent harvest alert rules. |
| **C — Net-Return Pricing** | Implement net return formula (Gross − Freight − Crates − Platform Fee); build multi-criteria buyer ranking utility (net price 50%, distance 20%, payment terms 20%, quality 10%). |
| **D — dispatch solver Logistics** | Formulate CVRPTW; enforce vehicle payload saturation ≥75% capacity threshold. |

**Verification Gate:**
- Vision model achieves **≥88% top-1 accuracy** on validation images.
- Solver completes consolidation plans for a **25-farm cluster within 3.0 seconds**.

**Sprint 2 (Days 2):** Phase 2 — PyTorch model, GDD rules, net pricing & dispatch solver.  
**Verification:** Vision inference **<800ms**; solver converges in **<3s**.

**Phase Sign-Off (Ph. 2):** Vision model inference & dispatch solver solvers validated — Responsible Lead: **Member 1 (AI / ML Lead)** — Status: READY.

---

## 4. Key Deliverables & Artifacts

1. **Model Weights & Inference Pipeline:** Lightweight PyTorch model artifact (`.pt` / TorchScript) optimized for fast **CPU inference (<800ms)**.
2. **Algorithmic Module Functions:** Pure Python modules with clean functional signatures for:
   - Disease prediction
   - Harvest window calculation
   - Net return pricing
   - dispatch solver route solving
3. **Scientific Documentation:** Model evaluation tables (Accuracy, Precision, Recall, F1-Score) and mathematical formulas for the competition presentation.

**Member 1 Sign-Off Checklist:**
- [x] PyTorch vision model inference script operational on CPU (<800ms).
- [x] Confidence thresholding and triage decision rules verified.
- [x] Phenological GDD calculation validated against Queen pineapple lifecycle.
- [x] Net-return mathematical formulation and ranking logic completed.
- [x] dispatch solver CVRPTW solver converging in <3 seconds on 25-stop regional clusters.

---

## 5. Cross-Functional Integration Contracts

### Member 1 → Member 2 (AI to Backend)

| Boundary | Agreed Standard & Contract Specification |
|----------|------------------------------------------|
| Interface | Pure Python module signatures with typed inputs. |
| Vision | `predict_disease(image_bytes) -> ResultDict` |
| Forecast | `calculate_harvest(crop_stage, gdd) -> Dict` |
| Solver | `solve_cvrp(stops, vehicle_cap) -> PlanDict` |
| Dependency rule | Self-contained dependencies; **no DB imports in ML**. |

### Member 3 → Member 1 (UI to AI Model)
- Client guarantees images are compressed to <500 KB and minimum 224×224 px before upload.
- UI accurately renders confidence brackets (<50%, 50–85%, >85%) matching Member 1's decision matrix.

---

## 6. Dependencies & Risk Mitigation

| Potential Risk | Dependent Member | Fallback Strategy |
|----------------|------------------|-------------------|
| Delay in PyTorch model training | Member 2 (Backend), Member 3 (Frontend) | Member 1 supplies a **lightweight rule-based diagnostic mock engine** returning calibrated fixtures. Backend and UI proceed unblocked. |
| dispatch solver solver convergence edge cases | Member 2 (Backend) | Fallback to a **greedy nearest-neighbor clustering algorithm** for regional demo clusters. |

---

## 7. 7-Day Sprint Execution Timeline (AI Engineer Tasks)

| Day | Milestone | Member 1 AI Tasks |
|-----|-----------|-------------------|
| **Day 1** | Architecture Alignment & Contract Freeze | Begins dataset curation & model setup. |
| **Day 2** | Core Scaffolding & Independent Prototyping | Validates MobileNetV3 pipeline & GDD formula. |
| **Day 3** | First Integration Point: Module A & B | Hands over vision model & harvest rules to Member 2; first successful end-to-end photo diagnostic test. |
| **Day 4** | Second Integration Point: Module C & D | Delivers net return pricing & dispatch solver routing solver. |
| **Day 5** | System Hardening, Seed Scenarios & Resilience | Validates model accuracy & solver constraints. |
| **Day 6** | End-to-End Rehearsal & Live Demo Dry Runs | Participates in simulated 5-minute pitch runs; verify complete loop (Disease Scan → Harvest Alert → Market Match → FPO Truck Consolidation → QR Gate-Pass). |
| **Day 7** | COMPETITION DAY | Live demonstration of Module A & Module B before judges. |

---

## 8. Live Pitch Speaking Distribution (Member 1 Segments)

| Timing | Presentation Segment | Lead Speaker | Key Talking Points & Action |
|--------|----------------------|--------------|----------------------------|
| **0:45 – 1:45** | **Module A: Disease Screening & Triage** | **Member 1 (AI/ML)** | Demonstrate live camera scan of pineapple rot; explain 91% confidence, MobileNetV3 CPU speed, and organic remedies. |
| **1:45 – 2:30** | **Module B: Harvest & Weather Risk Radar** | **Member 1 (AI/ML)** | Explain GDD thermal units; demonstrate 48-hour monsoon downpour alert. |

---

## 9. RACI Matrix — Member 1 Involvement

| # | Platform Component / Deliverable | Member 1 (AI/ML) |
|---|----------------------------------|------------------|
| 1 | Core Architecture & Tech Stack Freeze | C |
| 2 | PostgreSQL + PostGIS Schema Design | C |
| 3 | REST API Contract & Data Schema Freeze | C |
| **4** | **Module A: Vision Disease Model & Triage** | **A / R** |
| **5** | **Module A: Image Preprocessing & Inference** | **A / R** |
| 6 | Module A: Disease Scanner Camera Screen | I |
| **7** | **Module B: GDD & Phenology Rules Engine** | **A / R** |
| 8 | Module B: Weather Risk Alert API | C |
| 9 | Module B: Harvest Readiness Radar UI | I |
| **10** | **Module C: Net-Return Pricing Formula** | **A / R** |
| 11 | Module C: Market Matching Endpoints | C |
| 12 | Module C: Transparent Deductions UI | I |
| **13** | **Module D: dispatch solver Logistics Solver** | **A / R** |
| 14 | Module D: Dispatch Manifest Generation | C |
| 15 | Module D: FPO Capacity & Gate-Pass UI | I |
| 16 | JWT Auth & Role-Based Access Control | I |
| 17 | Client Image Compression (<300 KB) | C |
| 20 | Seed Data Generation (Churachandpur/Thoubal) | C |
| 21 | Docker Containerization & Demo Staging | C |
| 22 | Innotech Fest 5-Minute Pitch & Slide Deck | C |

*Legend: A = Accountable, R = Responsible, C = Consulted, I = Informed.*

---

## 10. Summary: The AI Engineer's End-to-End Contribution

Member 1 owns all four intelligence engines end-to-end:

1. **Module A** — Vision disease classifier (MobileNetV3/EfficientNet-B0, 4 classes, temperature-scaled confidence, ≥85/50–85/<50 triage).
2. **Module B** — GDD phenology engine (T_base = 16.0°C, Queen/Kew stages Day 0→480, ≥50mm/48h downpour alert).
3. **Module C** — Net-return pricing (Gross − Freight − Crates − Platform Fee; buyer ranking 50/20/20/10).
4. **Module D** — dispatch solver CVRPTW logistics solver (≥75% payload saturation).

All four are delivered as self-contained Python modules with typed signatures to Member 2's backend, validated against the Phase 2 verification gates (≥88% vision accuracy, <800ms inference, <3s solver on 25-farm clusters), and demonstrated live by Member 1 during the 0:45–2:30 portion of the 5-minute competition pitch.
