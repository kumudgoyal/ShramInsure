# 🚀 GigShield – AI-Powered Income Protection for Gig Workers

> **Parametric insurance that pays out before the delivery partner even gets home.**  
> No claims. No paperwork. No waiting. Just protection.

### 👨‍💻 Team: NextGen Devs

> *"If the city stops, your income doesn't."*  
> *"We don't verify claims. We verify reality."*

---

## 1. Problem Statement

India has **12+ million platform-based delivery partners** working for Blinkit, Zepto, Swiggy Instamart, and others. Quick-commerce riders operate on a high-frequency, per-delivery model — completing 15–25 short instant orders a day. They earn only when they ride. When the environment forces them to stop, no one compensates them.

**The income gap is invisible but devastating:**

- A heavy rainstorm can wipe out 4–6 hours of earning potential in a single evening.
- A sudden curfew or zone lockdown can cost a worker ₹400–800 in a single day.
- Severe pollution alerts (AQI > 400) reduce instant order volumes by 30–50% in affected zones.
- Platform outages lasting even 30–60 minutes can erase an entire peak-hour earning window.

No product exists today that specifically insures against **income lost due to external, verifiable disruptions**. Health insurance doesn't cover it. Vehicle insurance doesn't cover it.

**GigShield fills this gap** — an automated, parametric income protection platform with zero manual claims and payouts directly to a worker's wallet within minutes of a verified disruption event.

### Real-World Scenarios

**Scenario A — Arjun, Blinkit Delivery Partner, Bengaluru**  
It's a Thursday evening peak hour. Arjun is running 10-minute instant orders when the IMD red alert triggers. His order queue drops to zero in under an hour. He waits 2 hours under a petrol station roof, earning ₹0. With GigShield, ₹180 is automatically credited to his UPI wallet — no app interaction required.

**Scenario B — Priya, Zepto Rider, Delhi**  
The AQI in her delivery zone crosses 450. Municipal authorities restrict two-wheeler movement between 8 PM and 10 PM — her highest-earning window. GigShield detects the government restriction via integrated civic APIs, verifies her active policy, and processes a ₹220 payout automatically.

---

## 2. Target Persona

### Primary Persona: Quick-Commerce Delivery Partner (Blinkit / Zepto / Swiggy Instamart)

**Profile: Ravi Kumar, 26, Hyderabad**

| Attribute | Detail |
|---|---|
| Platform | Blinkit (primary), Zepto (secondary) |
| Delivery Model | 10–15 minute instant orders, 15–25 trips/day |
| Daily Active Hours | 10 AM – 2 PM, 6 PM – 10 PM |
| Average Daily Earnings | ₹800 – ₹1,100 |
| Average Weekly Earnings | ₹5,600 – ₹7,700 |
| Payment Mode | UPI (PhonePe) |
| Vehicle | 2-Wheeler (Petrol) |
| Phone | Android mid-range, 4G |
| Insurance Status | None (beyond mandatory vehicle TP) |

**Daily Reality:**
- Ravi completes high-frequency short-distance instant orders across 2–3 dark store zones.
- His income spikes sharply during evening peaks and collapses entirely during disruptions.
- He cannot absorb even a 2-hour income loss without skipping a meal or delaying a bill.
- He distrusts traditional insurance — too much paperwork, no perceived value, no trust in payouts.
- He needs something that works silently in the background, costs less than ₹50/week, and just pays.

---

## 3. Solution Overview

**GigShield is a parametric income protection platform** — payouts are triggered automatically when a pre-defined, verifiable external event occurs. No manual claim. No paperwork.

Traditional insurance: *"Prove you were affected, submit documents, wait 3–15 days."*  
GigShield: *"The rain hit your zone. Your policy is active. ₹180 is on its way."*

The payout is tied to the **event**, not the worker's report. This removes fraud surface area, eliminates adjuster costs, and makes instant payout structurally possible.

### Core Pillars

- **Automated Monitoring** — Real-time ingestion of weather, AQI, civic restriction, and platform signals.
- **Instant Payout** — Triggered payouts via UPI/wallet within 3–5 minutes of event confirmation.
- **Zero-Touch Claims** — Workers never initiate a claim. The system detects, verifies, and pays.
- **AI Risk Engine** — Dynamic weekly premiums based on hyper-local risk, zone history, and worker behavior.
- **Fraud-Resilient Architecture** — Multi-signal verification that GPS spoofing alone cannot defeat.

---

## 4. System Workflow

```
[ONBOARDING] → [RISK PROFILING] → [POLICY ACTIVATION] → [REAL-TIME MONITORING] → [TRIGGER DETECTION] → [FRAUD CHECK] → [PAYOUT]
```

**Step 1 — Onboarding (< 3 minutes)**
Worker downloads app or accesses via WhatsApp bot, enters mobile number, selects platform (Blinkit/Zepto/Instamart), completes Aadhaar-based eKYC via DigiLocker (mock), and registers UPI ID for payout.

**Step 2 — Risk Profiling (Automated)**
AI Risk Engine evaluates the worker's primary delivery zone(s) for historical disruption frequency, platform activity tier, and the city's seasonal risk calendar. Output: Low / Medium / High risk score.

**Step 3 — Weekly Policy Activation**
Worker selects a coverage tier. Premium is auto-debited every Monday via UPI AutoPay. Policy covers 7 days from activation. Worker sees a simple coverage summary: active zones, event types, and weekly payout cap.

**Step 4 — Real-Time Monitoring**
System continuously polls IMD / OpenWeatherMap (rainfall), CPCB (AQI), government civic feeds (curfews), and platform status APIs. Worker's last active zone is tracked via periodic GPS pings — not continuous, to preserve battery.

**Step 5 — Trigger Detection**
A disruption event is detected in a monitored zone. System checks: active policy? covered zone? duration threshold met? If yes → trigger confirmed → payout queue initiated.

**Step 6 — Fraud Verification (90-second Multi-Signal Check)**
Anti-spoofing engine evaluates 15 behavioral and device signals (detailed in Section 9). Worker assigned Fraud Risk Score: Clean → Instant payout. Review → Delayed 2–4 hours. Flagged → Manual review.

**Step 7 — Payout**
UPI transfer initiated, push notification + SMS sent, event logged to coverage history.

---

## 5. Weekly Pricing Model

GigShield uses a **dynamic, zone-aware weekly premium** — not a flat rate. Premiums adjust based on real risk signals every renewal cycle.

### Premium Components

| Factor | Description | Weight |
|---|---|---|
| Base Rate | Fixed floor by city tier | 30% |
| Zone Risk Score | Historical disruption frequency in delivery zone | 30% |
| Seasonal Risk Index | Monsoon, heat wave calendar, winter pollution | 20% |
| Worker Tenure | Newer workers carry a slight premium | 10% |
| Claims History | Zero-claim loyalty discount applied | 10% |

### Coverage Tiers

| Tier | Weekly Premium | Max Weekly Payout | Covered Events |
|---|---|---|---|
| Basic | ₹29 | ₹400 | Heavy Rain, Red Alert Weather |
| Standard | ₹49 | ₹700 | Rain, AQI > 350, Curfew/Restriction |
| Plus | ₹79 | ₹1,100 | All triggers + Platform Downtime |

### Sample Calculation

**Worker: Ravi Kumar | Zone: Kondapur (Hyderabad) | Month: August (Peak Monsoon)**

```
Base Rate:              ₹29 (Tier-1 City)
Zone Risk Adjustment:   +₹12 (Kondapur — 6+ red alerts/month in monsoon)
Seasonal Index:         +₹8  (August peak risk, multiplier: 1.16)
Tenure Discount:        -₹3  (6+ months active)
Claims History:         -₹0  (1 prior claim, no discount)
──────────────────────────────────────────
Final Weekly Premium:   ₹46  (Standard Tier equivalent)
Max Weekly Payout:      ₹700
```

**ROI for Ravi:** One 2-hour disruption (avg. loss ≈ ₹220) returns **4.7x** the weekly premium.

---

## 6. Parametric Triggers

Payouts fire only when **objective, third-party-verifiable thresholds** are crossed in the worker's active zone. No worker input required.

### Trigger 1 — Heavy Rain / Red Alert Weather
- **Source:** IMD District Weather API + OpenWeatherMap
- **Threshold:** IMD Orange/Red alert, OR rainfall > 15mm/hr for 30+ minutes
- **Payout:** ₹45/hr (Standard) | *Example: 2-hour red-alert rain → ₹90*

### Trigger 2 — Severe Air Pollution (AQI)
- **Source:** CPCB Real-Time AQI API
- **Threshold:** AQI > 400 sustained for 2+ hours in worker's active zone
- **Payout:** Fixed per-event payout | *Example: 3-hour AQI event → ₹150*

### Trigger 3 — Curfew / Zone Closure / Local Strike
- **Source:** State government emergency feeds, municipal APIs (mock in Phase 1)
- **Threshold:** Official restriction on 2-wheeler movement in worker's zone
- **Payout:** Per-hour for restriction duration | *Example: 3-hour curfew → ₹135*

### Trigger 4 — Extreme Heat Event
- **Source:** IMD Heat Wave API
- **Threshold:** Heat Index > 47°C AND IMD advisory active for 4+ hours (11 AM–3 PM)
- **Payout:** Flat half-day payout | *Example: Full advisory afternoon → ₹160*

### Trigger 5 — Platform Downtime *(Plus Tier Only)*
- **Source:** Simulated platform status API / third-party uptime monitor
- **Threshold:** Delivery app downtime > 30 minutes confirmed by status API
- **Payout:** Per-hour for verified outage | *Example: 90-min Blinkit outage → ₹90*

---

## 7. AI/ML Architecture

Three distinct ML layers power GigShield's intelligence. We've kept the logic grounded — no magic boxes, just explainable models with clear inputs and outputs.

### Layer 1 — Risk & Premium Engine
**Model:** Gradient Boosted Regression (XGBoost)  
**Inputs:** Zone-level disruption history (24 months), seasonal indices, worker tenure, zone-hotspot overlap  
**Output:** Risk Score (0–100) → premium multiplier  
**Retraining:** Weekly on rolling 90-day data | **Inference:** Sub-second at activation

### Layer 2 — Real-Time Trigger Monitor
**Architecture:** Event-driven stream processing (Kafka + Python consumers)  
**Logic:** Continuous API polling → pin code–to–zone mapping → threshold evaluation every 5 minutes → confirmed triggers published to payout queue

### Layer 3 — Fraud Detection Engine
**Models:** Isolation Forest (anomaly detection) + DBSCAN (fraud ring clustering)  
**Inputs:** 15 behavioral and device signals (Section 9)  
**Output:** Fraud Risk Score → Clean / Review / Flagged  
**Latency:** < 90 seconds per event

---

## 8. System Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native (Android-first) |
| Web Dashboard | React.js + Tailwind CSS |
| Backend API | Node.js (Express) + Python (ML via FastAPI) |
| Database | PostgreSQL + Redis |
| ML Pipeline | scikit-learn, XGBoost |
| Message Queue | Apache Kafka |
| Cloud | AWS (EC2, RDS, S3, Lambda) |
| Notifications | Firebase Cloud Messaging + Twilio (mock) |

### External Integrations

| Integration | Purpose | Phase 1 Status |
|---|---|---|
| IMD District Weather API | Rainfall & weather alerts | Mock / Free Tier |
| OpenWeatherMap API | Rainfall intensity by coordinates | Free Tier |
| CPCB AQI API | Real-time air quality by station | Free Tier |
| Government Civic Feeds | Curfew/restriction orders | Mock |
| Platform Status API | Delivery app downtime detection | Simulated |
| DigiLocker / eKYC | Identity verification | Mock |
| Razorpay (Test Mode) | UPI payout processing | Sandbox |

### Architecture Overview

```
┌──────────────────────────────────────────────────┐
│                  GigShield Platform               │
│                                                   │
│  ┌──────────┐    ┌──────────────────────────┐    │
│  │  Worker  │◄──►│   React Native App        │    │
│  │  Mobile  │    │ (Onboarding, Policy, UX)  │    │
│  └──────────┘    └────────────┬─────────────┘    │
│                               │                   │
│                    ┌──────────▼─────────┐         │
│                    │    API Gateway      │         │
│                    │  (Node.js/Express)  │         │
│                    └──────────┬──────────┘        │
│            ┌──────────────────┼───────────────┐   │
│   ┌────────▼──────┐  ┌───────▼──────┐ ┌──────▼──┐│
│   │ Risk Engine   │  │   Trigger    │ │ Fraud   ││
│   │ (XGBoost /    │  │  Monitoring  │ │ Engine  ││
│   │  FastAPI)     │  │(Kafka+Python)│ │(Iso.Forest)│
│   └───────────────┘  └──────┬───────┘ └────┬────┘│
│                    ┌────────▼───────────────▼──┐  │
│                    │     Payout Orchestrator     │  │
│                    │    (Razorpay / UPI Mock)    │  │
│                    └────────────────────────────┘  │
└──────────────────────────────────────────────────┘
         │                                │
  ┌──────▼──────┐                ┌────────▼────────┐
  │ External APIs│                │  PostgreSQL +   │
  │(IMD,CPCB,   │                │   Redis Cache   │
  │ Civic Feeds) │                └─────────────────┘
  └─────────────┘
```

---

## 9. 🔴 Adversarial Defense & Anti-Spoofing Strategy

> **The Threat:** Organized syndicates using GPS-spoofing apps to fake presence inside active disruption zones — triggering mass fraudulent payouts and draining the liquidity pool.  
> **Our Response:** GPS is one input. We have fourteen others. Spoofing one signal is easy. Spoofing all fifteen simultaneously, consistently, across 500 workers, is operationally infeasible.

### 9.1 Differentiation Logic — Real Worker vs. Bad Actor

A genuine quick-commerce rider waiting out a disruption exhibits a **multi-dimensional behavioral fingerprint** that no spoofing app can fully replicate from a stationary device at home.

| Signal | Genuine Stranded Worker | GPS Spoofer (at home) |
|---|---|---|
| GPS Coordinates | Inside disruption zone | Faked |
| Accelerometer / IMU | Micro-motion — waiting, short walks | Near-zero — device on a table |
| Battery Drain Rate | Elevated (GPS, heat/rain stress on device) | Normal household rate |
| Cell Tower ID | Towers inside the disruption zone | Towers near home address |
| Wi-Fi Networks Detected | Unknown public hotspots | Known home Wi-Fi |
| App Interaction Pattern | Frequent instant order-check, map scrolling | Idle or scripted |
| Delivery Activity (Pre-Event) | Active instant orders in nearby zones | No deliveries before event |
| Platform API Status | Rider online and accepting instant orders | Rider offline on platform |

**Decision Rule:** A payout is Clean only when ≥ 7 of 10 non-GPS signals confirm genuine field presence. A spoofer cannot simultaneously fake cell tower location, suppress home Wi-Fi detection, generate realistic accelerometer motion, and maintain a consistent pre-event delivery history.

### 9.2 Data Signals Used (Beyond GPS)

**Device Behavioral Signals**
1. **Accelerometer / Gyroscope** — Motion pattern consistent with a person waiting outdoors vs. a device sitting still.
2. **Battery Drain Rate** — Elevated in field conditions; normal at home.
3. **Screen-On / App-Active Timestamps** — Genuine workers check the app frequently between instant orders; scripts show unnatural regularity.
4. **Device Temperature** — Outdoor heat/humidity creates a different thermal signature than an indoor environment.

**Network & Location Signals**
5. **Cell Tower ID + Signal Strength** — Cross-referenced against tower location databases. Claimed zone must match serving tower.
6. **Wi-Fi BSSID Scan** — Home Wi-Fi detected = immediate flag.
7. **IP Address Geolocation** — Broad zone corroboration; VPN usage flagged.
8. **GPS Altitude + Accuracy Radius** — Spoofed coordinates often show suspiciously perfect 0m accuracy or incorrect altitude.

**Historical Behavioral Signals**
9. **Pre-Event Delivery Log** — Was the worker actively completing instant orders near the disruption zone in the 2 hours prior?
10. **Zone Consistency History** — Does this worker's historical route pass through the claimed zone? A worker who never enters Zone X but claims a disruption there is flagged.
11. **Claim Frequency Ratio** — Claims must correlate with the worker's actual operating zones and regional event data.

**Population-Level Signals (Fraud Ring Detection)**
12. **Claim Surge Analysis** — Unnaturally simultaneous, identical-parameter claims from a single zone spike the ring-detection alert.
13. **Device Fingerprint Clustering** — Claims from devices sharing hardware IDs, OS builds, or rooted/emulator signatures are grouped and reviewed.
14. **Onboarding & Referral Graph** — Workers registered in the same batch or via the same referral chain who show synchronized claim behavior are escalated.
15. **Behavioral Velocity** — Time from policy activation to first claim. Fraudsters claim fast; legitimate workers have usage history first.

### 9.3 Fraud Detection Strategy

**Stage 1 — Real-Time Anomaly Scoring (Isolation Forest)**
Every payout event is scored against a behavioral baseline of historical legitimate claims. Outlier score above threshold → escalated to Stage 2. Latency: < 30 seconds.

**Stage 2 — Ring Detection (DBSCAN Clustering)**
Activated when 10+ simultaneous claims arrive from the same zone within 10 minutes. DBSCAN clusters by device fingerprint, network characteristics, onboarding history, and behavioral vector proximity. Clusters of 5+ high-similarity workers trigger a coordinated fraud alert; payouts held for 4-hour review.

**Stage 3 — Risk Score Composition**

```
Fraud Score =
  0.25 × (Device Behavioral Score)
+ 0.25 × (Network/Location Consistency Score)
+ 0.25 × (Historical Activity Score)
+ 0.25 × (Population Anomaly Score)

Score  0–30  → CLEAN    → Instant payout
Score 31–60  → REVIEW   → Delayed 2–4 hours, soft re-check
Score 61–100 → FLAGGED  → Held, manual review, worker notified
```

### 9.4 UX Protection — The Honest Worker is Never Penalized

A quick-commerce rider stuck in a rain-hit zone is already stressed. The last thing they need is a confusing rejection message.

**CLEAN (0–30):** Payout fires instantly. Notification: *"Heavy rain in your zone. ₹90 credited to your UPI. Stay safe."*

**REVIEW (31–60):** Payout queued, not denied. Message: *"Your payout is being verified. Expected in 2–4 hours."* A second-pass check using deeper signals automatically clears 90%+ of legitimate workers in this band. No accusatory language.

**FLAGGED (61–100):** Payout withheld. Message: *"We need a moment to verify your claim. We'll review within 24 hours."* Worker can submit a one-tap soft appeal. If confirmed legitimate, payout is released with a ₹20 goodwill credit.

**Network Drop Handling:** Bad weather degrades GPS and cellular signals — this is expected and modeled. Poor GPS accuracy during a verified rain event is not a disqualifier. The system uses the last confirmed zone + weather event boundary to make a conservative, fair decision. Signal quality is an input, not a gatekeeper.

**Platform KPI:** False positive rate on legitimate claims — Target: < 2%.

---

## 10. Why This Will Work

**Scalability:** Zone-based parametric model scales by loading new city zone boundaries and historical data — no model rebuilds required. Payout logic is stateless and handles thousands of concurrent events via queue architecture.

**Feasibility:** All required APIs (IMD, CPCB, OpenWeatherMap) are publicly available. Parametric design eliminates claims adjusters entirely. Weekly premiums align perfectly with platform payout cycles for quick-commerce workers.

**Real-World Impact:** At ₹49/week, GigShield costs less than 1% of a quick-commerce rider's weekly earnings. The product is built for people who don't have time for paperwork — so we eliminated it entirely.

**Actuarial Viability:** Parametric triggers are objective and capped. Loss ratios are predictable because payouts are tied to measurable external thresholds, not subjective reports. This architecture is reinsurer-friendly by design.

---

## 11. Future Scope

**Phase 2–3**
- Live Blinkit/Zepto partner API integration for real-time delivery activity validation.
- WhatsApp-native onboarding — no app install required.
- Vernacular language support: Hindi, Kannada, Tamil, Telugu.

**6–12 Months**
- **Income History Integration:** Use verified platform earnings data to auto-size coverage (up to 30% of weekly average).
- **Micro-Reinsurance Pool:** Zone and dark-store cluster-based group pricing.
- **Predictive Pre-Activation:** AI detects high-risk weather 24 hours ahead and prompts coverage activation before the event hits.

**Long-Term**
- **Blockchain-Anchored Payouts:** Smart contracts for fully auditable parametric triggers.
- **B2B Embedded Insurance:** White-label GigShield as a platform benefit inside Blinkit/Zepto partner apps.
- **Pan-Gig Expansion:** Auto-rickshaw drivers (traffic restrictions), construction workers (extreme heat), agricultural labor (floods).

---

## 12. Tech Stack Summary

```
Frontend:      React Native (Android), React.js (Admin Dashboard)
Backend:       Node.js (Express), Python (FastAPI for ML)
Database:      PostgreSQL + Redis
ML:            XGBoost, Isolation Forest, DBSCAN (scikit-learn)
Streaming:     Apache Kafka
Cloud:         AWS (EC2, RDS, Lambda, S3)
APIs:          IMD, CPCB, OpenWeatherMap, Razorpay (Test), DigiLocker (Mock)
Auth:          Firebase Auth + OTP
Notifications: FCM + Twilio SMS
Version Control: GitHub
```

---

## 13. Team & Repository

**Team:** NextGen Devs  
**Repository:** [github.com/kumudgoyal/GigShield](https://github.com/kumudgoyal/GigShield)  
**Phase:** 1 — Ideation & Foundation | **Deadline:** March 20, 2026  
**Competition:** Guidewire DEVTrails 2026 — Unicorn Chase

---

*GigShield — Because every delivery partner deserves a safety net that works as fast as they do.*
