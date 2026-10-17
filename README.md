# HARVESTLINK AI

> **Predictive Crop Intelligence and Smart Market Linkage for Manipur**  
> Prepared for **INNOTECH FEST 2.0**

---

## Overview

HARVESTLINK AI is an integrated agricultural decision-support system designed for horticulture in Manipur (specifically Queen & Kew pineapple clusters across Churachandpur, Thoubal, Imphal East, and Bishnupur).

The platform links:
1. **Module A — Crop Disease Screening:** MobileNetV3 computer vision model screening for *Heart Rot*, *Black Rot*, and *Mealybug Wilt* with calibrated triage.
2. **Module B — Harvest Readiness & Risk:** Phenological Growing Degree Day ($\text{GDD}$) accumulation tracking and 48-hour monsoon downpour alerts.
3. **Module C — Transparent Market Linkage:** Transparent pricing showing true net take-home returns per kg after freight, handling, and fees.
4. **Module D — Collective Logistics:** Google OR-Tools vehicle consolidation solver pooling small farm lots into full truck payloads ($\ge 75\%$ fill) with digital QR gate-passes.

---

## Documentation Suite

Complete project specifications are located in the [`Docs/`](Docs/) directory:

- [Part 1: System Architecture, Data Models & Platform Foundation](Docs/PART1_ARCHITECTURE_AND_FOUNDATION.md)
- [Part 2: AI Backend, Algorithmic Engine & Intelligence Specification](Docs/PART2_AI_BACKEND_IMPLEMENTATION.md)
- [Part 3: Frontend Architecture, UI/UX Design & User Experience Specification](Docs/PART3_FRONTEND_UI_UX_IMPLEMENTATION.md)
- [Team Work Distribution & 3-Member Allocation Plan](Docs/TEAM_WORK_DISTRIBUTION_PLAN.md)
- [Phase-Wise Implementation Plan (Roadmap to Competition Day)](Docs/PHASE_WISE_IMPLEMENTATION_PLAN.md)

---

## Monorepo Layout

```
.
├── Docs/                    # Project specifications & competition blueprints
├── intelligence_layer/      # Dedicated AI/ML models, phenology rules & OR-Tools
│   ├── module_a_disease/    # Computer vision screening, weights, triage
│   ├── module_b_harvest/    # Phenological GDD rules & weather risk alerts
│   ├── module_c_pricing/    # Transparent net-return deductions & ranking
│   ├── module_d_logistics/  # Google OR-Tools CVRPTW vehicle route solver
│   ├── pipelines/           # Unified inference and calculation interfaces
│   ├── notebooks/           # Training notebooks & exploratory analysis
│   └── tests/               # Model and algorithmic unit tests
├── backend/                 # FastAPI application, SQLAlchemy, PostGIS & JWT
│   ├── app/
│   │   ├── api/             # REST API endpoint routers
│   │   └── services/        # Business logic orchestration & DB transactions
│   ├── tests/               # Backend automated test suite
│   ├── alembic/             # PostgreSQL database migrations
│   └── scripts/             # Demonstration seed data scripts
├── frontend/                # Next.js 14 App Router (React, TypeScript, PWA)
│   ├── public/              # Static assets, PWA manifest, and icons
│   └── src/
│       ├── app/             # Application routes (Farmer, Buyer, FPO)
│       ├── components/      # UI component library & agrarian design tokens
│       ├── hooks/           # Custom React hooks (offline, scanner)
│       ├── lib/             # API client, Dexie.js offline DB, Meiteilon i18n
│       ├── styles/          # Agrarian design tokens and CSS modules
│       └── types/           # Shared TypeScript interfaces
├── data/                    # Local demo fixtures and model checkpoints
│   ├── demo/                # Synthetic test scenarios (Churachandpur & Thoubal)
│   └── models/              # Exported model weights (.pt files)
├── docker/                  # Dockerfiles and deployment configurations
└── docker-compose.yml       # Monorepo containerization configuration
```

---

## Team Execution Roles (3-Member Allocation)

- **Member 1 (AI / ML Engineer):** Owns `intelligence_layer/` (computer vision pipeline, phenology rules engine, net pricing model, OR-Tools routing solver).
- **Member 2 (Backend & Systems Engineer):** Owns `backend/` (PostgreSQL/PostGIS database, FastAPI service layer, JWT auth & RBAC, Docker deployment).
- **Member 3 (Frontend & UI/UX Engineer):** Owns `frontend/` (Next.js 14 responsive application, agrarian design system, camera compression, trilingual Meiteilon engine, live pitch flow).

---

## License

Developed for academic and innovation competition presentation at **INNOTECH FEST 2.0**.
