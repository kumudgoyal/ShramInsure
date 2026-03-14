# 🛡️ GigShield — Parametric Income Insurance for Quick-Commerce Delivery Workers

> **Guidewire DEVTrails 2026 | University Hackathon**
> *AI-Powered Parametric Insurance · Zero-Touch Claims · Instant UPI Payouts*
---
## 1. Problem Statement

India's quick-commerce delivery partners — working for **Blinkit, Zepto, Swiggy Instamart, and Dunzo** — are the invisible engine of our instant-delivery economy. Yet they remain completely exposed to income shocks they cannot control.

When a **heavy rainstorm** hits a city zone, deliveries stop. When the **AQI crosses 400**, workers cannot safely ride. When a **platform outage** kills the app, orders vanish. In each case, the gig worker bears 100% of the financial loss — with no safety net, no insurance, and no recourse.

> 📊 External disruptions reduce gig worker monthly earnings by **20–30%** on average.
> India has **~15 million** platform-based delivery partners with **zero income protection**.

---

## 2. Our Solution — GigShield

**GigShield** is an AI-powered, parametric income insurance platform built specifically for quick-commerce delivery workers.

Workers pay a **small weekly premium** and receive **automatic, zero-touch payouts** the moment a verified external disruption reduces their ability to work — no claim forms, no waiting, no disputes.

| Feature | Description |
|---|---|
| 🌧️ Parametric Triggers | Automatic detection of weather, pollution, civil and platform disruptions |
| 🤖 AI Risk Engine | ML-based dynamic weekly premium pricing per worker |
| 🔍 Fraud Detection | Behavioral anomaly detection and GPS/location validation |
| ⚡ Instant Payouts | Direct UPI/bank transfer within minutes of trigger verification |
| 📊 Smart Dashboard | Real-time analytics for workers and insurer admin |

---

## 3. Target Users / Persona

### Primary Persona — Quick-Commerce Delivery Partner

- **Who:** Delivery riders on Blinkit, Zepto, Swiggy Instamart, Dunzo
- **Location:** Tier-1 and Tier-2 Indian cities
- **Earnings Model:** Per-delivery + surge incentives (~₹600–₹1,200/day on active days)
- **Risk Profile:** Highly vulnerable to weather, pollution, traffic, and platform events
- **Tech Access:** Smartphone with UPI-enabled bank account
- **Pain Point:** Zero income protection when disruptions halt deliveries

### Secondary Persona — Platform Insurance Admin

- Insurer monitoring risk exposure, loss ratios, fraud signals, and payout analytics

---

## 4. How the System Works — Step-by-Step Workflow

```
┌──────────────────────────────────────────────────────────────────────┐
│                         GIGSHIELD FLOW                               │
│                                                                      │
│  STEP 1 — ONBOARDING                                                 │
│    Worker registers → Risk profile built → Weekly premium            │
│    calculated by AI → Policy issued via PolicyCenter                 │
│                                                                      │
│  STEP 2 — REAL-TIME MONITORING                                       │
│    External APIs polled continuously via Kafka event pipeline:       │
│    Weather | AQI | Traffic | Platform Status | Civic Alerts          │
│                                                                      │
│  STEP 3 — DISRUPTION DETECTION                                       │
│    Trigger threshold crossed → Disruption event logged               │
│    → Affected zone mapped → Eligible active workers identified       │
│                                                                      │
│  STEP 4 — FRAUD VALIDATION                                           │
│    Worker GPS verified inside disrupted zone                         │
│    → Activity pattern checked → Anomaly score calculated             │
│    → Confidence Score > threshold → Auto-approved                    │
│                                                                      │
│  STEP 5 — AUTO CLAIM CREATION                                        │
│    ClaimCenter integration → Claim auto-generated                    │
│    → Payout amount calculated from lost-hours model                  │
│                                                                      │
│  STEP 6 — INSTANT PAYOUT                                             │
│    Razorpay UPI → Worker's bank account → Push notification sent     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 5. Parametric Triggers

GigShield monitors **7 core disruption types** specific to quick-commerce delivery workers:

| # | Trigger | Threshold | Data Source |
|---|---|---|---|
| 1 | 🌧️ Heavy Rainfall | > 15 mm/hr in worker zone | OpenWeatherMap API |
| 2 | 🌡️ Extreme Heat | > 42°C ambient temperature | OpenWeatherMap API |
| 3 | 🌫️ Hazardous AQI | AQI > 300 (Hazardous band) | AQICN / OpenAQ API |
| 4 | 📱 Platform Outage | App unavailability > 30 min | Platform Status APIs / Mock |
| 5 | 🏪 Dark Store Closure | > 50% dark stores offline in zone | Platform API / Mock |
| 6 | 🚫 Road Shutdown | Major arterial closure in worker zone | Google Maps Traffic API |
| 7 | 🚨 Civil Disruption | Curfew / strike alert in zone | Government alert feeds / Mock |

> **Coverage scope:** Income loss ONLY. No health, accident, vehicle, or life coverage.

---

## 6. AI & Machine Learning Components

### 6.1 Dynamic Premium Pricing Engine

The weekly premium is individually calculated per worker using a risk scoring model:

```
Weekly Premium = Base Rate × Risk Multiplier × Zone Factor × History Factor

  Base Rate        = Rs.40/week (calibrated floor)
  Risk Multiplier  = ML score from zone disruption frequency  (0.8x – 1.5x)
  Zone Factor      = Hyper-local historical disruption data per PIN code
  History Factor   = Worker's own exposure and claim history
```

**ML Model:** Gradient Boosted Decision Tree (XGBoost) trained on:
- Historical weather and AQI patterns at city/zone level
- Platform outage frequency and duration records
- Worker's historical activity, hours, and earning patterns

### 6.2 Confidence Scoring System for Trigger Verification

Each trigger event receives a **Confidence Score (0–100)** before any claim is created:

```
Score > 75  →  Auto-approve  →  Claim created immediately
Score 40–74 →  Manual review queue  →  Human adjudicator assigned
Score < 40  →  Auto-reject  →  Event flagged and logged for audit
```

### 6.3 Payout Calculation Model

```
Payout = (Hours Lost × Hourly Wage Estimate) × Coverage Percentage

  Hours Lost         = Disruption duration within worker's active window
  Hourly Wage Est.   = AI-derived from worker's historical delivery pattern
  Coverage %         = 70–90% of estimated lost income (tier-based on plan)
```

---

## 7. Weekly Premium Pricing Model

Aligned with the gig worker's weekly earning and expense cycle:

| Plan | Weekly Premium | Max Weekly Payout | Best For |
|---|---|---|---|
| Shield Basic | Rs.35 / week | Rs.500 | Part-time workers (< 4 hrs/day) |
| Shield Plus | Rs.60 / week | Rs.1,000 | Full-time workers (4–8 hrs/day) |
| Shield Pro | Rs.90 / week | Rs.1,800 | Power riders (8+ hrs/day, surge-active) |

- **Collected:** Weekly via UPI auto-debit or platform wallet integration
- **Policy window:** Monday 00:00 to Sunday 23:59 IST
- **No lock-in:** Cancel any week before renewal; unused weeks do not roll over
- **Dynamic:** Premium recalculated each renewal using live ML risk model

---

## 8. Fraud Detection Approach

Multi-layer AI fraud defense built specifically for delivery-worker fraud patterns:

| Layer | Detection Method | What It Catches |
|---|---|---|
| 1 | GPS Zone Verification | Worker must be physically inside the disrupted zone |
| 2 | GPS Spoofing Detection | Cross-validate GPS with accelerometer + cell network data |
| 3 | Behavioral Baseline | Suspicious inactivity spike immediately before trigger event |
| 4 | Duplicate Event Check | Prevent double-claiming within same disruption window |
| 5 | Claim Velocity Limiter | Max 1 claim per disruption type per 24-hour window |
| 6 | Historical Cross-Check | Claimed disruption verified against public weather records |
| 7 | Confidence Score Gate | Automated approve / review / reject pipeline for every claim |

---

## 9. System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL DATA LAYER                           │
│  OpenWeatherMap  |  AQICN  |  Google Maps  |  Platform APIs        │
│  Government Alert Feeds  |  Razorpay  |  FCM                       │
└──────────────────────────┬─────────────────────────────────────────┘
                           |  Kafka Event Stream
┌──────────────────────────▼─────────────────────────────────────────┐
│                      CORE SERVICES LAYER                           │
│                                                                    │
│  ┌────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │ Trigger        │  │ Risk / Premium  │  │ Fraud Detection     │ │
│  │ Monitor Svc    │  │ Engine (ML)     │  │ Service             │ │
│  └───────┬────────┘  └────────┬────────┘  └──────────┬──────────┘ │
│          └────────────────────┴──────────────────────┘            │
│                               |                                    │
│  ┌────────────────────────────▼──────────────────────────────────┐ │
│  │              Policy & Claims Orchestrator                     │ │
│  └─────────────────────────────┬─────────────────────────────────┘ │
└────────────────────────────────┼───────────────────────────────────┘
                                 |
┌────────────────────────────────▼───────────────────────────────────┐
│                  GUIDEWIRE INTEGRATION LAYER                       │
│          PolicyCenter API              ClaimCenter API             │
└────────────────────────────────┬───────────────────────────────────┘
                                 |
┌────────────────────────────────▼───────────────────────────────────┐
│                        PAYOUT LAYER                                │
│              Razorpay UPI / IMPS / Bank Transfer                   │
└────────────────────────────────────────────────────────────────────┘
```

**Architecture principles:**
- Event-driven microservices — each service independently deployable
- Apache Kafka for real-time event streaming between all services
- PostgreSQL for worker, policy, and claim data (ACID-compliant)
- Redis for real-time session state and duplicate-claim locks
- REST APIs for all inter-service and Guidewire communication

---

## 10. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js (Web Dashboard) + React Native (Worker Mobile App) |
| **Backend** | Node.js + Python FastAPI (Microservices) |
| **AI / ML** | Python — scikit-learn, XGBoost (Premium Engine + Fraud Model) |
| **Event Streaming** | Apache Kafka |
| **Database** | PostgreSQL (transactional) + Redis (cache / distributed locks) |
| **Insurance Core** | Guidewire PolicyCenter & ClaimCenter APIs |
| **Weather / AQI** | OpenWeatherMap API, AQICN / OpenAQ API |
| **Traffic / Maps** | Google Maps Platform API (free tier / mock) |
| **Payments** | Razorpay (UPI + IMPS — sandbox / test mode) |
| **Notifications** | Firebase Cloud Messaging (FCM) |
| **Cloud Hosting** | AWS (EC2, RDS, MSK for Kafka) |
| **DevOps** | Docker, GitHub Actions CI/CD |

---

## 11. Development Plan

### Phase 1 — Ideation & Foundation (Weeks 1–2) | Deadline: March 20

- [x] Problem research and persona definition (Q-commerce delivery workers)
- [x] System architecture design and README documentation
- [ ] Project scaffolding — frontend + backend monorepo setup
- [ ] Mock data models: Worker, Policy, Claim, TriggerEvent
- [ ] OpenWeatherMap + AQICN API integration (free tier)
- [ ] Rule-based premium pricing model (ML-enhanced in Phase 2)
- [ ] Basic worker onboarding flow wireframes

**Deliverables:** README.md in GitHub repo + 2-minute strategy video

---

### Phase 2 — Automation & Protection (Weeks 3–4) | Deadline: April 4

- [ ] Full worker registration and onboarding flow (web + mobile)
- [ ] Insurance policy creation with weekly pricing tiers
- [ ] Dynamic ML premium calculation engine (XGBoost deployed)
- [ ] 5 automated parametric triggers (weather, AQI, platform outage, road closure, civil alert)
- [ ] Claims management module with auto-claim creation
- [ ] Basic fraud detection (GPS zone validation + duplicate event check)
- [ ] Guidewire PolicyCenter integration (mock / sandbox)
- [ ] Razorpay sandbox payment integration (UPI + IMPS)

**Deliverables:** Working prototype + 2-minute demo video

---

### Phase 3 — Scale & Optimise (Weeks 5–6) | Deadline: April 17

- [ ] Advanced fraud detection (behavioral anomaly model + GPS spoofing detection)
- [ ] Confidence scoring system with auto-approve / review / reject pipeline
- [ ] End-to-end instant payout simulation (Razorpay test mode)
- [ ] Worker dashboard (earnings protected, active coverage, claim history)
- [ ] Admin / insurer dashboard (loss ratios, risk heatmaps, predictive disruption analytics)
- [ ] Guidewire ClaimCenter integration
- [ ] Full disruption simulation with automated claim + payout walkthrough
- [ ] Final pitch deck (PDF) + 5-minute demo video

**Deliverables:** Full platform + pitch deck + demo video

---

## 12. Future Scope

- **Multi-segment expansion** — Food delivery (Zomato/Swiggy) and e-commerce (Amazon/Flipkart) riders
- **Vernacular UX** — Hindi, Tamil, Telugu in-app language support
- **Platform co-funding** — Allow Blinkit/Zepto to co-contribute premiums as a worker benefit
- **Community risk pools** — Worker collectives sharing risk across zones
- **IRDAI sandbox pathway** — Formal regulatory approval for live insurance operations
- **Micro-savings feature** — Unused weekly budget converts to micro-savings
- **Regional expansion** — Southeast Asia quick-commerce markets (GrabMart, GoMart)

---

## 13. Why This Solution Matters

India's 15 million gig delivery workers generate billions in platform GMV but receive none of the safety net that traditional employment provides.

GigShield addresses a **real, urgent, and completely underserved insurance gap:**

- Parametric design eliminates paperwork and claim disputes — payouts are fully automatic
- AI-driven pricing makes premiums fair and affordable (Rs.35–90/week vs. zero protection today)
- Weekly model perfectly matches the gig worker's earnings and expense cycle
- Fraud detection makes the platform financially sustainable for insurers long-term
- Instant UPI payouts provide real income resilience — not bureaucratic delays

> *When the rain comes and deliveries stop — GigShield pays. Automatically.*

---

*Built for Guidewire DEVTrails 2026 — AI-Powered Insurance for India's Gig Economy*
*Team: NextGen Devs*
