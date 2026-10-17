# HARVESTLINK AI — Implementation Plan

## Part 3: Frontend Architecture, UI/UX Design & User Experience Specification

---

> **Project:** Predictive Crop Intelligence and Smart Market Linkage for Manipur  
> **Document:** Part 3 of 3 — Frontend Architecture, UI/UX System & User Experience Specification  
> **Target Audience:** Judges, System Architects, UI/UX Designers, Product Managers  
> **Context:** INNOTECH FEST 2.0 Innovation Proposal  
> **Status:** Production Specification (Zero Raw Code / Pure Architectural & Design Documentation)  

---

## Table of Contents

1. [Executive Summary & Frontend Philosophy](#1-executive-summary--frontend-philosophy)
2. [Rural Agrarian UX Context (Manipur Field Reality)](#2-rural-agrarian-ux-context-manipur-field-reality)
3. [User Personas & Journey Maps](#3-user-personas--journey-maps)
4. [Design System & Visual Language](#4-design-system--visual-language)
5. [Information Architecture & Navigation Hierarchy](#5-information-architecture--navigation-hierarchy)
6. [Module A UI/UX Specification: Crop Disease Screening & Triage](#6-module-a-uiux-specification-crop-disease-screening--triage)
7. [Module B UI/UX Specification: Harvest Readiness & Weather Risk Visualizer](#7-module-b-uiux-specification-harvest-readiness--weather-risk-visualizer)
8. [Module C UI/UX Specification: Buyer Matching & Transparent Net-Returns](#8-module-c-uiux-specification-buyer-matching--transparent-net-returns)
9. [Module D UI/UX Specification: FPO Aggregation & Dispatch Logistics](#9-module-d-uiux-specification-fpo-aggregation--dispatch-logistics)
10. [Bilingual Localization Architecture (English / Meiteilon)](#10-bilingual-localization-architecture-english--meiteilon)
11. [Low-Bandwidth, Glare Resilience & Offline-First Strategy](#11-low-bandwidth-glare-resilience--offline-first-strategy)
12. [Innotech Fest 2.0 Demonstration Script](#12-innotech-fest-20-demonstration-script)
13. [Frontend Quality & Validation Checklist](#13-frontend-quality--validation-checklist)

---

## 1. Executive Summary & Frontend Philosophy

HARVESTLINK AI’s frontend interface is not a conventional e-commerce or SaaS dashboard. It is an **agricultural decision-support terminal** designed specifically for the unique geographical, technical, and socio-economic dynamics of Manipur’s horticulture ecosystem (specifically pineapple clusters across Churachandpur, Thoubal, Imphal East, and Bishnupur).

The core frontend philosophy rests on four pillars:

1. **Radical Transparency over Black-Box Metrics:** Every AI prediction is accompanied by visible reasoning, confidence margins, and disclaimers. Every market price displays a clear, step-by-step breakdown of net take-home pay after deducting logistics, packaging, and commission fees.
2. **Zero Superfluous Text:** Field workers and farmers need high-contrast visual signifiers (color-coded statuses, intuitive progression bars, pictorial guidance) rather than complex textual reports.
3. **Resilient to Hardware & Network Constraints:** The client application prioritizes client-side optimization, aggressive persistent caching, and offline-first workflows to operate smoothly over erratic 2G/3G connectivity.
4. **Honest AI Representation:** The interface never confuses a rules-based harvest estimation with a computer vision diagnosis, and clearly marks any mock or test data as "DEMO DATA" to maintain absolute scientific integrity during evaluation.

---

## 2. Rural Agrarian UX Context (Manipur Field Reality)

Designing for agricultural communities in Northeast India demands direct accommodation of field constraints that typical web applications ignore:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MANIPUR FIELD OPERATING CONTEXT                        │
├────────────────────────┬────────────────────────────┬───────────────────────┤
│ Environmental Reality  │ User Behavioral Impact     │ Interface Mitigation  │
├────────────────────────┼────────────────────────────┼───────────────────────┤
│ Direct Midday Sun      │ Severe screen glare on     │ Deep-slate dark theme │
│ (Hill Plantations)     │ budget mobile LCDs.        │ with high-contrast    │
│                        │ Low-contrast text unreadable│ amber/emerald text.  │
├────────────────────────┼────────────────────────────┼───────────────────────┤
│ High Soil & Moisture   │ Muddy or wet fingers;      │ Oversized tap targets │
│ Field Conditions       │ inaccurate typing.         │ (minimum 48×48px);    │
│                        │                            │ 1-tap card selections.│
├────────────────────────┼────────────────────────────┼───────────────────────┤
│ Network Blackspots     │ Signal drops in valley     │ Local-first database; │
│ (2G / Edge Connectivity│ pockets during image send. │ client-side image     │
│                        │                            │ downscaling to <300KB.│
├────────────────────────┼────────────────────────────┼───────────────────────┤
│ Linguistic Landscape   │ Technical English causes   │ Dynamic bilingual     │
│                        │ hesitation or misuse.      │ toggle (English,      │
│                        │                            │ Meiteilon Bengali &   │
│                        │                            │ Meetei Mayek script). │
└────────────────────────┴────────────────────────────┴───────────────────────┘
```

---

## 3. User Personas & Journey Maps

### 3.1 Primary Personas

#### Persona 1: The Smallholder Pineapple Farmer (Tombi Singh, Churachandpur)
- **Profile:** Cultivates 1.5 hectares of Queen pineapple on hillside terraces. Uses an entry-level Android smartphone with a prepaid 3G/4G data plan.
- **Goals:** Detect leaf rot before it ruins the plantation; know the exact harvest window to prevent fruit rotting during monsoon rains; avoid predatory middlemen by securing fair local market rates.
- **Frustrations:** Middlemen deduct arbitrary "spoilage and freight penalties"; agricultural advisories are too academic and delivered too late.

#### Persona 2: The Fruit Processing Buyer (Ibomcha Sharma, Imphal Industrial Estate)
- **Profile:** Procurement head for a pineapple canning and juice processing enterprise. Requires consistent, bulk Grade A Queen & Kew pineapples (minimum 500 kg per consignment).
- **Goals:** Source uniform fruit maturity (14–16° Brix); avoid uncoordinated deliveries from scattered individual farms; receive digital quality certifications.
- **Frustrations:** High variability in harvest ripeness; irregular supply logistics leading to factory downtime.

#### Persona 3: The FPO Coordinator / Field Extension Officer (Linthoingambi Devi, Thoubal)
- **Profile:** Coordinates 45 local pineapple farmers under a registered Farmer Producer Organisation. Manages regional consolidation hubs and light commercial vehicle dispatch.
- **Goals:** Pool small harvest lots (100–300 kg each) into full truckloads (2,000–3,000 kg) to lower freight costs; review suspicious disease reports from farmers.
- **Frustrations:** Manual paper manifests; empty vehicle return trips; fragmented WhatsApp communication.

### 3.2 End-to-End User Journey Map

```
PHASE 1: MONITORING & PROTECTION
  Farmer identifies discolored leaves
    → Opens HARVESTLINK AI Disease Scanner
    → Captures photo (client downscales automatically)
    → Screen detects "Heart Rot" (91% confidence)
    → Immediate organic & chemical instructions displayed
    → 1-tap option to alert FPO Extension Officer

PHASE 2: HARVEST READINESS
  Crop approaches 450 days from planting
    → Harvest Forecast widget alerts: "Color Break Stage"
    → Sugar estimate indicates 14.5° Brix
    → System identifies 48-hour monsoon downpour window
    → Advisory: "Harvest within 48h to prevent waterlogging & brix dilution"

PHASE 3: MARKET MATCHING & NET PRICING
  Farmer posts 450 kg harvest lot
    → System displays 3 verified buyer matches
    → Transparent pricing card breaks down:
        Gross Offer: ₹28.00/kg
        - Freight: ₹3.20/kg
        - Handling: ₹1.00/kg
        - Platform Fee: ₹0.40/kg
        = True Net Realized: ₹23.40/kg
    → Farmer accepts offer with guaranteed pickup date

PHASE 4: AGGREGATION & DISPATCH
  FPO Coordinator console aggregates 4 farm lots in Thoubal cluster
    → Vehicle capacity fill bar hits 82% (Tata 407 optimal)
    → Optimal pickup route generated
    → QR-coded digital gate-pass issued for vehicle driver
    → Produce delivered to processor; digital settlement logged
```

---

## 4. Design System & Visual Language

### 4.1 Palette Rationale

The color tokens reflect indigenous agriculture and the high-contrast needs of outdoor work:

- **Pineapple Gold (`#F59E0B`):** Primary brand accent, symbolizing harvest ripeness, prosperity, and focal interactive elements.
- **Plantation Green (`#10B981`):** Represents healthy crops, confirmed transactions, and high-confidence metrics.
- **Hill Earth Brown (`#B45309`):** Grounding neutral for subtle badges and agricultural borders.
- **Deep Slate Ground (`#0F172A` / `#1E293B`):** Dark-mode default surface that eliminates sun glare, conserves smartphone battery, and emphasizes status indicators.
- **Alert Amber (`#D97706`) & Alert Crimson (`#DC2626`):** Disease triage and severe weather warnings.

### 4.2 Typography Hierarchy

- **Primary Display Font:** *Outfit* or *Inter* (Open Source, excellent legibility at micro-sizes).
- **Metric Figures:** Monospaced tabular numerals (`JetBrains Mono` / `Roboto Mono`) for currency values, weights, and dates to ensure visual alignment in financial comparisons.
- **Manipuri Scripts:** *Noto Sans Bengali* and *Noto Sans Meetei Mayek* for native language renderings.

### 4.3 Component States & Accessibility Standards

- **Touch Targets:** All clickable surfaces adhere to an absolute minimum of 48×48 CSS pixels with 8px external margins to prevent misclicks with wet or gloved hands.
- **Color Contrast:** All text elements exceed WCAG 2.1 AAA contrast ratios (minimum 7:1 against card backgrounds) to preserve readability under direct tropical sunlight.
- **State Feedback:** Immediate optimistic visual state changes on all user interactions, accompanied by non-blocking status badges ("Saved Locally", "Syncing...", "Confirmed").

---

## 5. Information Architecture & Navigation Hierarchy

```
HARVESTLINK AI CLIENT ARCHITECTURE
│
├── 🌐 Public Landing Portal (Innotech Fest Showcase)
│   ├── Interactive Problem & Innovation Synopsis
│   ├── Live Simulation Sandbox (Queen Pineapple Workflow)
│   └── Role Switcher (Farmer / Buyer / FPO Coordinator)
│
├── 🚜 Farmer Portal (Mobile-First Viewport)
│   ├── Farm Dashboard (Active Crops, Weather Alerts, Pending Offers)
│   ├── Module A: Disease Screening Studio
│   │   ├── Guided Multi-Angle Image Uploader
│   │   ├── Diagnostic Confidence Meter & Triage Protocol
│   │   └── Extension Officer Escalation Modal
│   ├── Module B: Harvest Timing & Risk Radar
│   │   ├── Phenological Timeline (Planting → Harvest)
│   │   ├── GDD & Brix Ripeness Tracker
│   │   └── 5-Day Rainfall & Post-Harvest Weather Advisory
│   └── Module C: Transparent Market Linkage
│   │   ├── Active Harvest Lots Registry
│   │   ├── Side-by-Side Buyer Comparison Deck
│   │   └── Net-Return Price Deductions Inspector
│
├── 🏢 Buyer Portal (Desktop/Tablet Viewport)
│   ├── Live Marketplace Lot Feed (Grade, Brix, Volume, District)
│   ├── Demand Order Creator (Quantity, Specs, Delivery Deadline)
│   └── Contract Settlement & Delivery Tracker
│
└── 🚛 FPO Logistics Console (Coordinator Viewport)
    ├── Regional Cluster Map (Thoubal / Churachandpur Consolidations)
    ├── Vehicle Payload Capacity Monitor (3-Wheeler / Tata 407)
    └── Digital QR Gate-Pass & Manifest Printer
```

---

## 6. Module A UI/UX Specification: Crop Disease Screening & Triage

### 6.1 Screen Layout & Wireframe Architecture

```
┌────────────────────────────────────────────────────────┐
│ [← Back]          PINEAPPLE HEALTH SCAN         [EN|MN]│
├────────────────────────────────────────────────────────┤
│ ℹ INSTRUCTION                                          │
│ Take a clear photo of leaf base, crown, or lateral     │
│ fruit eyes in daylight (20–30 cm distance).            │
├────────────────────────────────────────────────────────┤
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │                                                │   │
│   │              [ LIVE CAMERA FEED ]              │   │
│   │          or [ SELECTED IMAGE PREVIEW ]         │   │
│   │                                                │   │
│   │       ┌────────────────────────────────┐       │   │
│   │       │ Target Reticle: Align Crown    │       │   │
│   │       └────────────────────────────────┘       │   │
│   └────────────────────────────────────────────────┘   │
│                                                        │
│   [ 📷 Tap to Capture Photo ]   [ 📁 Upload File ]    │
├────────────────────────────────────────────────────────┤
│ DIAGNOSTIC RESULT (POST-INFERENCE)                     │
│                                                        │
│  ● Condition: Phytophthora Heart Rot (মপন শাবা)        │
│  ● Severity:  MODERATE                                 │
│  ● Model Confidence: 91.4%  [████████████░░]           │
│                                                        │
│  Visible Symptoms Screened:                            │
│   ✔ Water-soaked brown lesions along basal leaf sheath │
│   ✔ Premature central leaf whorl softening             │
│                                                        │
│  Immediate Treatment Protocol:                         │
│   1. Dip replacement slips in Trichoderma viride.     │
│   2. Drench crown base with Copper Oxychloride (0.25%).│
│   3. Clear drainage channels to stop waterlogging.     │
│                                                        │
│  [ 🚨 Request Extension Officer Confirmation ]          │
└────────────────────────────────────────────────────────┘
```

### 6.2 UX Interaction Mechanics

1. **Client-Side Compression Pipeline:**
   - Raw 12–48MP smartphone photos are intercepted on the client canvas.
   - Images are downscaled to a max dimension of 1024px and compressed to JPEG format (~200–300KB) before transmission.
   - Prevents transmission timeouts on unstable 2G cellular uplinks while preserving essential pathological textures (leaf lesions, fungal rot, mealybug clustering).

2. **Multi-Angle Visual Guide:**
   - Visual toggle buttons encourage three distinct diagnostic perspectives:
     - *Crown Top-Down View:* Detects central leaf whorl yellowing and apical rot.
     - *Fruit Base & Stalk View:* Identifies water-soaked basal rot and fungal rings.
     - *Lateral Fruit View:* Assesses eye development and mealybug webbing.

3. **Honest AI Confidence Indicator:**
   - **Above 85% Confidence:** Color-coded solid emerald/amber with direct actionable agronomic advice.
   - **Between 50% and 85% Confidence:** Labeled "Preliminary Screening — Subject to Visual Progression", advising a follow-up photo in 48 hours.
   - **Below 50% Confidence:** Explicit notification that diagnosis is inconclusive, prompting re-capture under better lighting or automatic escalation to an extension worker.

4. **Extension Officer Escalation Flow:**
   - One tap dispatches the compressed image, farm GPS coordinates, and crop history directly to the regional Krishi Vigyan Kendra (KVK) or FPO field technician for ground verification.

---

## 7. Module B UI/UX Specification: Harvest Readiness & Weather Risk Visualizer

### 7.1 Screen Layout & Wireframe Architecture

```
┌────────────────────────────────────────────────────────┐
│ [← Back]         HARVEST READINESS RADAR        [EN|MN]│
├────────────────────────────────────────────────────────┤
│ LOT #PL-048 • QUEEN PINEAPPLE • 1.2 HECTARES           │
│ Planted: 15 Jun 2025 (Day 480 in Field)                │
├────────────────────────────────────────────────────────┤
│ PHENOLOGICAL PROGRESSION TIMELINE                      │
│                                                        │
│  [●] Planting  ──  [●] Inflorescence  ──  [●] Break    │
│  (100%)             (100%)                (ACTIVE)     │
│                                                        │
│  Progress to Optimal Harvest: 90%                      │
│  [████████████████████████████████░░░░]                │
├────────────────────────────────────────────────────────┤
│ OPTIMAL HARVEST WINDOW                                 │
│                                                        │
│    24 OCT 2026   ────►   28 OCT 2026                   │
│    (Recommended: 26 Oct morning pick)                 │
│                                                        │
│  • Estimated Brix Sweetness:  14.8° Brix (Grade A)     │
│  • Total Heat Units (GDD):    2,420 / 2,500 target     │
├────────────────────────────────────────────────────────┤
│ ⚠ METEOROLOGICAL HARVEST RISK ADVISORY                 │
│                                                        │
│  Forecast: Heavy Monsoon Downpour (65mm on 29-30 Oct)   │
│  Risk Rating: HIGH (Waterlogging & Sugar Dilution)     │
│                                                        │
│  Agronomic Advisory:                                   │
│  "Harvesting before 28 October prevents fruit sponge-  │
│   tissue rot and avoids post-rain brix dilution by     │
│   up to 2.5 degrees. Coordinates with FPO Truck #2."   │
│                                                        │
│  [ 📦 Register 500 kg Lot for Immediate Market Link ]   │
└────────────────────────────────────────────────────────┘
```

### 7.2 UX Interaction Mechanics

1. **Phenological Stage Stepper:**
   - Represents the 18-month biological cycle of Queen pineapples (from sucker/slip planting through vegetative development, inflorescence induction, fruit sizing, color-break, and mature harvesting).
   - Clear visual markers indicate whether the crop is premature (sour, low brix), optimal (golden base, 14–16° Brix), or over-mature (fermentation risk, shortened shelf life).

2. **Weather Risk Synthesis Card:**
   - Dynamically correlates 5-day weather forecasts with crop maturity.
   - Highlights the primary danger facing Manipur pineapple farmers: **late-monsoon rain on mature fruit**, which causes water intoxication, skin cracking, and drops in sugar density that lead to wholesale rejections.

---

## 8. Module C UI/UX Specification: Buyer Matching & Transparent Net-Returns

### 8.1 Screen Layout & Wireframe Architecture

```
┌────────────────────────────────────────────────────────┐
│ [← Back]           BUYER MATCH OFFERS           [EN|MN]│
├────────────────────────────────────────────────────────┤
│ LOT: 450 kg Queen Pineapple (Grade A • 14.5° Brix)     │
│ Verified Ready: 26 Oct 2026                            │
├────────────────────────────────────────────────────────┤
│ 3 VERIFIED BUYERS FOUND                                │
├────────────────────────────────────────────────────────┤
│ [CARD 1: RECOMMENDED MATCH]                            │
│ ┌────────────────────────────────────────────────────┐ │
│ │ MANIPUR FRUIT PROCESSING CO-OP                     │ │
│ │ Food Park, Nilakuthi • Processor                   │ │
│ │                                                    │ │
│ │ Gross Offer:         ₹28.00 / kg                   │ │
│ │ Deductions:                                        │ │
│ │   - Shared Freight:  ₹ 2.40 / kg (via FPO Truck)   │ │
│ │   - Crate & Pack:    ₹ 0.80 / kg                   │ │
│ │   - Platform Fee:    ₹ 0.40 / kg                   │ │
│ │ ─────────────────────────────────────────────────  │ │
│ │ TRUE NET TAKE-HOME:  ₹24.40 / kg                   │ │
│ │ TOTAL FARMER PAYOUT: ₹10,980.00                    │ │
│ │                                                    │ │
│ │ Payment Terms: 100% on Hub Weighment               │ │
│ │ Pickup Window: 26 Oct Morning                      │ │
│ │                                                    │ │
│ │ [ ✔ ACCEPT & LOCK DEAL ]   [ Details / Breakdown ] │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ [CARD 2: SECONDARY MATCH]                              │
│ ┌────────────────────────────────────────────────────┐ │
│ │ GUWAHATI RETAIL EXPORTERS                          │ │
│ │ Silchar Transit Hub • Wholesale Exporter           │ │
│ │ Gross Offer: ₹31.00 / kg  | Net Return: ₹22.80 / kg │ │
│ │ (Lower net due to long-haul mountain transport)     │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### 8.2 UX Interaction Mechanics

1. **The Net Return Transparency Principle:**
   - Conventional intermediaries offer high headline gross rates (e.g., "₹30/kg") but hit farmers with opaque fees upon delivery (deducting 25% for transit shrinkage, handling, and broker cuts).
   - HARVESTLINK AI calculates and displays the **net realized take-home rate** up front before the farmer agrees to anything.
   - Farmers can directly toggle the deductions panel to see every itemized rupee (transport, crates, platform maintenance).

2. **One-Tap Contract Commitment:**
   - Tapping "Accept & Lock Deal" instantly confirms the reservation, removes the lot from open bidding, and feeds the pickup location into the FPO consolidation schedule.

---

## 9. Module D UI/UX Specification: FPO Aggregation & Dispatch Logistics

### 9.1 Screen Layout & Wireframe Architecture

```
┌────────────────────────────────────────────────────────┐
│ FPO LOGISTICS CONSOLE — THOUBAL CLUSTER        [LOGOUT]│
├────────────────────────────────────────────────────────┤
│ ACTIVE CONSOLIDATION RUN #THB-2026-10                  │
│ Vehicle: Tata 407 (Capacity: 2,500 kg)                 │
│ Driver: Sanatomba M. (Phone: +91 98620 XXXXX)          │
├────────────────────────────────────────────────────────┤
│ VEHICLE LOAD SATURATION GAUGE                          │
│                                                        │
│  2,050 kg / 2,500 kg (82% CAPACITY ACHIEVED)           │
│  [██████████████████████████████████░░░░░░░]           │
│                                                        │
│  ✔ Optimal freight efficiency threshold reached.       │
│  Estimated transport cost savings: ₹1.85 / kg          │
├────────────────────────────────────────────────────────┤
│ PICKUP WAYPOINTS (4 CONSOLIDATED FARMS)                │
│                                                        │
│  1. Tombi Singh (Andro)         ── 450 kg (Grade A Qn) │
│  2. Mangi Meitei (Yairipok)     ── 600 kg (Grade A Qn) │
│  3. Ibopishak (Nongpok Sekmai)  ── 500 kg (Grade B Qn) │
│  4. Chaoba Devi (Wangbal)       ── 500 kg (Grade A Qn) │
│                                                        │
│  Final Drop: Nilakuthi Processing Facility (Imphal)    │
├────────────────────────────────────────────────────────┤
│ CONSIGNMENT GATE-PASS & VERIFICATION                   │
│                                                        │
│     ┌─────────────┐   Digital Dispatch Token:          │
│     │  [QR CODE]  │   HL-DISP-8839-2026                │
│     │   SCAN AT   │   Authenticated by Smart Contract  │
│     │  WEIGHBRIDGE│   Timestamp: 26 Oct 2026, 06:30    │
│     └─────────────┘                                    │
│                                                        │
│  [ 🖨 Print Driver Manifest ]   [ 📱 Send SMS to Driver ]│
└────────────────────────────────────────────────────────┘
```

### 9.2 UX Interaction Mechanics

1. **Load Saturation Gauge:**
   - Solves the critical logistical failure of smallholder farming: sending partially full trucks over difficult mountain terrain.
   - Real-time gauge visually indicates when enough individual 400–600 kg lots have combined to cross the economic efficiency barrier (>75% capacity).
   - Shows the immediate monetary savings per kilogram realized by co-loading.

2. **Digital QR Gate-Pass & Verification:**
   - Generates an offline-scannable QR token containing lot identifiers, farmer IDs, declared grades, and weights.
   - At the buyer's weighbridge, a single scan confirms incoming consignment authenticity, matches weights, and triggers payment settlement.

---

## 10. Bilingual Localization Architecture (English / Meiteilon)

To ensure usability across all educational levels in Manipur, the entire interface features zero-friction language switching with three distinct visual presentations:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    LINGUISTIC PRESENTATION MATRIX                            │
├──────────────────┬─────────────────────────────┬─────────────────────────────┤
│ English (EN)     │ Manipuri Bengali Script     │ Meetei Mayek Script         │
├──────────────────┼─────────────────────────────┼─────────────────────────────┤
│ Disease Scan     │ লাইনা য়েংশিনবা             │ ꯂꯥꯏꯅꯥ ꯌꯦꯡꯁꯤꯟꯕꯥ             │
│ Harvest Window   │ হৈনোম লোইবা মতম             │ ꯂꯣꯏꯕꯥ ꯃꯇꯝ                   │
│ Buyer Match      │ লৈরোই শম্নহনবা              │ ꯂꯩꯔꯣꯏ ꯁꯝꯅꯍꯟꯕꯥ              │
│ Net Return       │ শেংলবা কান্নবা              │ ꯁꯦꯡꯂꯕꯥ ꯀꯥꯟꯅꯕꯥ             │
│ Heart Rot        │ মপন শাবা                    │ ꯃꯄꯟ ꯁꯥꯕꯥ                    │
│ Black Rot        │ হৈনোম অমোৎপা                │ ꯍꯩꯅꯣꯝ ꯑꯃꯣꯠꯄꯥ                │
│ Queen Pineapple  │ কুইন হৈনোম                  │ ꯀꯨꯏꯟ ꯍꯩꯅꯣꯝ                  │
│ Dispatch Pass    │ পুথোক-পুশিন পাস             │ ꯄꯨꯊꯣꯛ-ꯄꯨꯁꯤꯟ ꯄꯥꯁ            │
└──────────────────┴─────────────────────────────┴─────────────────────────────┘
```

Language preference is persisted locally and requires only a single tap from the global navigation bar, updating all labels, instructions, advisories, and currency notations without reloading the page.

---

## 11. Low-Bandwidth, Glare Resilience & Offline-First Strategy

### 11.1 Offline State Management Lifecycle

```
[ USER ACTION (e.g. Disease Photo or Harvest Log) ]
                    │
                    ▼
     Is Network Available?
       ├── YES ──► Immediate HTTP POST to FastAPI Backend
       └── NO  ──► Save to Persistent Local IndexedDB Queue
                     │
                     ▼
             Display Optimistic UI:
             "Logged Locally — Will sync when connected"
                     │
                     ▼
           Network Re-established
                     │
                     ▼
             Background Sync Engine
             Transmits Queued Mutations
                     │
                     ▼
             Update UI with Server Confirmation
```

### 11.2 Glare Resistance Protocol

1. **High Contrast Surface Palette:** Pure dark slate backgrounds (`#0F172A`) paired with bright amber and emerald foreground elements minimize pupil strain under high ambient lumen environments (hilltop farms at noon).
2. **Iconographic Redundancy:** Every textual status is accompanied by a unique geometric icon (e.g., checkmark in circle for healthy, triangle exclamation for warning, octagonal shield for critical action) so meaning is conveyed even if colors are washed out by direct sun glare.
3. **Typography Scaling:** Minimum base font size of 14px on mobile devices, with critical numeric readouts scaled to 20–28px bold tabular fonts.

---

## 12. Innotech Fest 2.0 Demonstration Script

This structured 5-minute presentation script is designed to walk judges through the complete closed-loop innovation:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             INNOTECH FEST 2.0 — 5-MINUTE LIVE DEMONSTRATION RUN             │
├─────────┬──────────────────────┬────────────────────────────────────────────┤
│ Timing  │ Screen Shown         │ Key Innovation Spoken to Judges            │
├─────────┼──────────────────────┼────────────────────────────────────────────┤
│ 0:00 to │ Main Portal &        │ "Most agri-tech apps fail because they are │
│ 0:45    │ Problem Synopsis     │ disconnected point tools. HARVESTLINK AI   │
│         │                      │ links the entire cycle: crop disease,      │
│         │                      │ harvest timing, and net market linkage for │
│         │                      │ Manipur's pineapple growers."              │
├─────────┼──────────────────────┼────────────────────────────────────────────┤
│ 0:45 to │ Module A: Disease    │ "Notice our live camera screen. It         │
│ 1:45    │ Scanner              │ compresses images to 200KB right on the    │
│         │                      │ phone so it works on weak 2G hill signals. │
│         │                      │ Here, it screens Phytophthora Heart Rot at │
│         │                      │ 91.4% confidence and shows organic remedy  │
│         │                      │ steps plus 1-tap extension officer triage."│
├─────────┼──────────────────────┼────────────────────────────────────────────┤
│ 1:45 to │ Module B: Harvest    │ "Here is our harvest window. It tracks     │
│ 2:45    │ Readiness Radar      │ heat units and warns the farmer of a 65mm  │
│         │                      │ monsoon downpour in 4 days: 'Harvest now   │
│         │                      │ to protect sugar levels and stop rot.'"    │
├─────────┼──────────────────────┼────────────────────────────────────────────┤
│ 2:45 to │ Module C: Net-Return │ "Here is our core market innovation:       │
│ 3:45    │ Buyer Matches        │ radical price transparency. Instead of     │
│         │                      │ misleading gross figures, we show the true │
│         │                      │ take-home pay after freight and fees.      │
│         │                      │ The farmer knows their exact earnings."    │
├─────────┼──────────────────────┼────────────────────────────────────────────┤
│ 3:45 to │ Module D: FPO        │ "Finally, logistics aggregation. 4 small   │
│ 4:30    │ Dispatch Console     │ farm lots combine into an 82% full truck,  │
│         │                      │ saving ₹1.85/kg on transport and issuing a │
│         │                      │ digital QR gate-pass for delivery."        │
├─────────┼──────────────────────┼────────────────────────────────────────────┤
│ 4:30 to │ Bilingual Toggle &   │ "One tap converts everything into native   │
│ 5:00    │ Wrap-Up              │ Meiteilon. A complete, practical, defensible│
│         │                      │ agricultural intelligence system."         │
└─────────┴──────────────────────┴────────────────────────────────────────────┘
```

---

## 13. Frontend Quality & Validation Checklist

- [x] **Zero Code Violations:** Pure design specifications, wireframes, user journeys, and architectural standards without raw implementation code blocks.
- [x] **Field Ergonomics:** 48×48px minimum touch targets, high-contrast dark theme for outdoor glare reduction, and non-blocking notifications.
- [x] **Low-Bandwidth Resilience:** Client-side image compression specification (<300KB) to support erratic rural 2G/3G connectivity.
- [x] **Linguistic Inclusivity:** Tri-script bilingual localization framework (English, Manipuri Bengali script, Meetei Mayek).
- [x] **Module Completeness:** Comprehensive UI/UX coverage across Disease Screening (Module A), Harvest Readiness (Module B), Net-Returns Market Matching (Module C), and FPO Dispatch Logistics (Module D).
- [x] **Innovation Presentation Readiness:** Includes a minute-by-minute live presentation script tailored for the Innotech Fest 2.0 evaluation committee.
