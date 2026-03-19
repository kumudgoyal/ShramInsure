# 🚀 GigShield – AI-Powered Income Protection for Gig Workers

> **Parametric insurance that pays out before the delivery partner even gets home.**  
> No claims. No paperwork. No waiting. Just protection.

---

## 1. Problem Statement

India has **12+ million platform-based delivery partners** working for Zomato, Swiggy, Blinkit, and others. These workers operate entirely on a per-delivery earnings model — they earn only when they ride. When the environment forces them to stop, no one compensates them.

**The income gap is invisible but devastating:**

- A heavy rainstorm can wipe out 4–6 hours of earning potential in a single evening.
- A sudden curfew or zone lockdown can cost a worker ₹400–800 in a single day.
- Severe pollution alerts (AQI > 400) reduce order volumes by 30–50% in affected zones.
- Platform outages can last 1–3 hours, rendering a worker completely idle mid-shift.

There is **no existing safety net** for these disruptions. Health insurance doesn't cover it. Vehicle insurance doesn't cover it. No product exists today that specifically insures against **income lost due to external, verifiable disruptions**.

**GigShield fills this gap** with an automated, parametric income protection platform that requires zero manual claims and delivers payouts directly to a worker's wallet within minutes of a verified disruption event.

### Real-World Scenarios

**Scenario A — Arjun, Swiggy Delivery Partner, Bengaluru**  
It's a Thursday evening. Arjun is mid-shift when the IMD red alert triggers. Within 45 minutes, his order queue drops to zero. He waits 2 hours under a petrol station roof. He earns ₹0. With GigShield, a payout of ₹180 is automatically credited to his UPI wallet — no app interaction required.

**Scenario B — Priya, Blinkit Rider, Delhi**  
The AQI in her delivery zone crosses 450. Municipal authorities restrict two-wheeler movement between 8 PM and 10 PM. Priya loses her highest-earning window. GigShield detects the government-issued restriction via integrated civic APIs, verifies her active policy, and processes a ₹220 payout automatically.

---

## 2. Target Persona

### Primary Persona: Food Delivery Partner (Zomato / Swiggy)

**Profile: Ravi Kumar, 26, Hyderabad**

| Attribute | Detail |
|---|---|
| Platform | Zomato (primary), Swiggy (secondary) |
| Daily Active Hours | 10 AM – 2 PM, 6 PM – 10 PM |
| Average Daily Earnings | ₹800 – ₹1,100 |
| Average Weekly Earnings | ₹5,600 – ₹7,700 |
| Payment Mode | UPI (PhonePe) |
| Vehicle | 2-Wheeler (Petrol) |
| Phone | Android mid-range, 4G |
| Insurance Status | None (beyond mandatory vehicle TP) |

**Daily Reality:**
- Ravi checks the weather before each shift but has no financial fallback if conditions worsen mid-ride.
- He operates in 2–3 delivery zones depending on demand hotspots.
- His income spikes on weekends and dips significantly during rain, festivals, or local disruptions.
- He cannot absorb even a 2-hour income loss without skipping a meal or delaying a bill payment.
- He distrusts traditional insurance — too much paperwork, no perceived value, no trust in payouts.

**What Ravi Needs:**
- A product that costs less than ₹50/week.
- A payout that hits his account without him doing anything.
- Zero complexity. He should be able to onboard in under 3 minutes.

---

## 3. Solution Overview

**GigShield is a parametric income protection platform** — which means payouts are triggered automatically when a pre-defined, verifiable external event occurs, not when a worker files a manual claim.

### What Makes It Parametric?

Traditional insurance: *"Prove you were affected, submit documents, wait 3–15 days."*  
GigShield: *"The rain hit your zone. Your policy is active. ₹180 is on its way."*

The payout is tied to the **event**, not the worker's subjective loss report. This eliminates fraud surface area, removes adjuster costs, and makes instant payout possible.

### Core Pillars

- **Automated Monitoring** — Real-time ingestion of weather, AQI, civic restriction, and platform signals.
- **Instant Payout** — Triggered payouts via UPI/wallet within 3–5 minutes of event confirmation.
- **Zero-Touch Claims** — Workers never initiate a claim. The system detects, verifies, and pays.
- **AI Risk Engine** — Dynamic weekly premiums based on hyper-local risk, delivery zone history, and worker behavior.
- **Fraud-Resilient Architecture** — Multi-signal verification that cannot be defeated by GPS spoofing alone.

---

## 4. System Workflow

```
[ONBOARDING] → [RISK PROFILING] → [POLICY ACTIVATION] → [REAL-TIME MONITORING] → [TRIGGER DETECTION] → [FRAUD CHECK] → [PAYOUT]
```

### Step-by-Step

**Step 1 — Onboarding (< 3 minutes)**
- Worker downloads app or accesses via WhatsApp bot.
- Enters mobile number, selects delivery platform (Zomato/Swiggy/Blinkit), and grants location permission.
- Aadhaar-based eKYC via DigiLocker (or platform ID verification via mock API).
- UPI ID collected for payout.

**Step 2 — Risk Profiling (Background, Automated)**
- AI Risk Engine evaluates:
  - Worker's primary delivery zone(s) — historical flood/rain/AQI incident frequency.
  - Platform activity tier (new vs. experienced worker).
  - Seasonal risk calendar for the city.
- Risk score generated: Low / Medium / High.

**Step 3 — Weekly Policy Activation**
- Worker selects a weekly coverage tier (Basic / Standard / Plus).
- Premium is deducted automatically (UPI AutoPay or wallet debit) every Monday.
- Policy is live for 7 days from activation.
- Worker sees coverage summary: active zones, covered events, max weekly payout cap.

**Step 4 — Real-Time Monitoring (Always On)**
- System continuously polls:
  - IMD / OpenWeatherMap API for rainfall intensity and alerts by pin code.
  - CPCB API for AQI by zone.
  - Government/civic API feeds for curfew and restriction orders.
  - Platform API (mock/simulated) for app downtime events.
- Worker's last known active zone is tracked via periodic GPS pings (not continuous — battery-aware).

**Step 5 — Trigger Detection**
- A disruption event is detected in a monitored zone.
- System cross-references: Is there an active policy covering this zone and event type?
- Disruption duration threshold met (e.g., red-alert rain lasting > 45 minutes).
- Trigger confirmed.

**Step 6 — Fraud Verification (Multi-Signal Check)**
- Anti-spoofing engine runs a 90-second multi-signal verification (detailed in Section 9).
- Worker assigned a Fraud Risk Score: Clean / Review / Flagged.
- Clean → Instant payout. Review → Delayed payout (2–4 hours, post-soft-check). Flagged → Held for manual review.

**Step 7 — Payout**
- UPI transfer initiated to registered account.
- Push notification + SMS sent to worker.
- Event logged to worker's coverage history.

---

## 5. Weekly Pricing Model

GigShield uses a **dynamic, zone-aware weekly premium** that adjusts based on real risk signals — not fixed flat rates.

### Premium Components

| Factor | Description | Weight |
|---|---|---|
| Base Rate | Fixed floor by city tier | 30% |
| Zone Risk Score | Historical disruption frequency in delivery zone | 30% |
| Seasonal Risk Index | Monsoon season, heat wave calendar, winter pollution | 20% |
| Worker Tenure | Newer workers have less behavioral data, slight premium | 10% |
| Claims History | Workers with zero claims history get loyalty discount | 10% |

### Coverage Tiers

| Tier | Weekly Premium | Max Weekly Payout | Covered Events |
|---|---|---|---|
| Basic | ₹29 | ₹400 | Heavy Rain, Red Alert Weather |
| Standard | ₹49 | ₹700 | Rain, AQI > 350, Curfew/Restriction |
| Plus | ₹79 | ₹1,100 | All triggers + Platform Downtime |

### Sample Calculation

**Worker: Ravi Kumar, Bengaluru, Zone: Koramangala, Month: August (Peak Monsoon)**

```
Base Rate:              ₹29 (Tier-1 City)
Zone Risk Adjustment:   +₹12 (Koramangala — historically 6+ red alerts/month in monsoon)
Seasonal Index:         +₹8 (August = peak risk month, multiplier: 1.16)
Tenure Discount:        -₹3 (6+ months active, loyalty discount applies)
Claims History:         -₹0 (1 prior claim, no discount)
─────────────────────────────
Final Weekly Premium:   ₹46 (Standard Tier equivalent)
Max Weekly Payout:      ₹700
```

**ROI for Ravi:** If even one 2-hour evening disruption occurs (avg. loss ≈ ₹220), GigShield returns **4.7x** the weekly premium.

---

## 6. Parametric Triggers

Payouts are only triggered when **objective, third-party-verifiable thresholds** are crossed in the worker's active zone.

### Trigger 1 — Heavy Rain / Red Alert Weather
- **Data Source:** IMD District Weather API + OpenWeatherMap (rainfall mm/hr by pin code)
- **Threshold:** IMD Orange/Red alert issued, OR rainfall > 15mm/hr sustained for 30+ minutes
- **Payout Logic:** Flat per-hour payout for each hour above threshold (up to daily cap)
- **Payout Example:** 2 hours of red-alert rain → ₹90 payout (₹45/hr under Standard tier)

### Trigger 2 — Severe Air Pollution (AQI)
- **Data Source:** CPCB Real-Time AQI API (station-level data, mapped to delivery zones)
- **Threshold:** AQI > 400 (Severe category) sustained for 2+ hours in worker's active zone
- **Payout Logic:** Fixed disruption payout credited once per AQI event per day
- **Payout Example:** AQI > 400 for 3 hours → ₹150 single-event payout

### Trigger 3 — Curfew / Zone Closure / Local Strike
- **Data Source:** State government emergency feeds, municipal APIs, verified news aggregation (mock in Phase 1)
- **Threshold:** Official restriction order affecting 2-wheeler movement in worker's zone
- **Payout Logic:** Per-hour payout for duration of the official restriction window
- **Payout Example:** 3-hour curfew → ₹135 payout

### Trigger 4 — Extreme Heat Event
- **Data Source:** IMD Heat Wave API
- **Threshold:** Heat Index > 47°C in worker's city AND IMD heat wave advisory issued
- **Payout Logic:** Flat half-day payout for advisory periods > 4 hours between 11 AM – 3 PM
- **Payout Example:** Full heat advisory afternoon → ₹160 payout

### Trigger 5 — Platform Downtime (Plus Tier Only)
- **Data Source:** Simulated platform status API / third-party uptime monitoring feed
- **Threshold:** Delivery app experiencing > 30-minute downtime confirmed by status API
- **Payout Logic:** Per-hour downtime payout for verified outage duration
- **Payout Example:** 90-min Zomato outage during peak hours → ₹90 payout

---

## 7. AI/ML Architecture

GigShield's intelligence operates across three distinct ML layers.

### Layer 1 — Risk Prediction & Premium Engine

**Model Type:** Gradient Boosted Regression (XGBoost)

**Input Features:**
- Zone-level historical disruption frequency (last 24 months)
- Seasonal weather pattern indices (city + micro-zone)
- Worker delivery zone overlap with flood/pollution hotspot maps
- Worker platform tenure and activity consistency score

**Output:** Risk Score (0–100) → maps to premium multiplier  
**Retraining Cadence:** Weekly, using rolling 90-day incident data  
**Inference:** Sub-second at policy activation and renewal

### Layer 2 — Real-Time Trigger Monitoring Engine

**Architecture:** Event-driven stream processing (Kafka + Python consumer services)

**Logic:**
- Continuous ingestion of weather, AQI, and civic event streams.
- Pin code → Delivery Zone mapping applied to all events.
- Threshold evaluation runs every 5 minutes per active zone.
- Confirmed triggers published to payout queue.

### Layer 3 — Fraud Detection Engine

**Model Type:** Isolation Forest (anomaly detection) + DBSCAN Clustering (ring detection)

**Purpose:** Verify that a worker claiming a disruption-linked payout was genuinely active and affected — and was not faking presence in a disruption zone.

**Input:** 15+ behavioral and device signals (see Section 9)  
**Output:** Fraud Risk Score → Clean / Review / Flagged  
**Latency:** < 90 seconds per claim event

---

## 8. System Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native (Android-first) |
| Web Dashboard | React.js + Tailwind CSS |
| Backend API | Node.js (Express) + Python (ML services) |
| Database | PostgreSQL (transactional) + Redis (session/cache) |
| ML Pipeline | Python (scikit-learn, XGBoost), served via FastAPI |
| Message Queue | Apache Kafka (event streaming) |
| Cloud Infrastructure | AWS (EC2, RDS, S3, Lambda) |
| Notifications | Firebase Cloud Messaging + SMS (Twilio mock) |

### External Integrations

| Integration | Purpose | Phase 1 Status |
|---|---|---|
| IMD District Weather API | Rainfall & weather alerts | Mock / Free Tier |
| OpenWeatherMap API | Rainfall intensity by coordinates | Free Tier |
| CPCB AQI API | Real-time air quality by station | Free Tier |
| Government Civic Feeds | Curfew/restriction orders | Mock |
| Platform Status API | Delivery app downtime detection | Simulated |
| DigiLocker / eKYC | Identity verification at onboarding | Mock |
| Razorpay (Test Mode) | UPI payout processing | Sandbox |

### Architecture Diagram

```
┌──────────────────────────────────────────────────┐
│                  GigShield Platform               │
│                                                   │
│  ┌──────────┐    ┌──────────────────────────┐    │
│  │ Worker   │◄──►│   React Native App        │    │
│  │  Mobile  │    │ (Onboarding, Policy, UX)  │    │
│  └──────────┘    └────────────┬─────────────┘    │
│                               │                   │
│                    ┌──────────▼─────────┐         │
│                    │   API Gateway       │         │
│                    │   (Node.js/Express) │         │
│                    └──────────┬──────────┘         │
│            ┌──────────────────┼───────────────┐   │
│            │                  │               │   │
│   ┌────────▼──────┐  ┌───────▼──────┐ ┌──────▼──┐│
│   │ Risk Engine   │  │ Trigger      │ │ Fraud   ││
│   │ (XGBoost/     │  │ Monitoring   │ │ Engine  ││
│   │  FastAPI)     │  │ (Kafka +     │ │ (Isolation│
│   └───────────────┘  │  Python)     │ │ Forest) ││
│                      └──────┬───────┘ └────┬────┘│
│                             │               │     │
│                    ┌────────▼───────────────▼──┐  │
│                    │     Payout Orchestrator     │  │
│                    │   (Razorpay Test / UPI)     │  │
│                    └────────────────────────────┘  │
└──────────────────────────────────────────────────┘
           │                              │
    ┌──────▼──────┐              ┌────────▼────────┐
    │ External     │              │  PostgreSQL +   │
    │ APIs (IMD,   │              │  Redis Cache    │
    │ CPCB, Civic) │              └─────────────────┘
    └─────────────┘
```

---

## 9. 🔴 Adversarial Defense & Anti-Spoofing Strategy

> **The Threat:** Organized syndicates using GPS-spoofing applications to falsely place themselves inside active disruption zones, triggering mass fraudulent payouts and draining the liquidity pool.  
> **Our Response:** GPS is one input. We have fourteen others. Spoofing one signal is easy. Spoofing all fifteen simultaneously, consistently, across 500 workers, is computationally and operationally infeasible.

### 9.1 Differentiation Logic — Real Worker vs. Bad Actor

GigShield does not trust any single data point. A legitimate delivery partner in a disruption zone exhibits a **consistent, multi-dimensional behavioral fingerprint** that cannot be fully replicated by a spoofing tool running on a stationary device.

| Signal | Genuine Stranded Worker | GPS Spoofer (at home) |
|---|---|---|
| GPS Coordinates | Inside disruption zone | Faked to disruption zone |
| Accelerometer / IMU | Low, irregular motion (waiting, walking short distances) | Near-zero — device is stationary on a table |
| Battery Drain Rate | Elevated (screen on, GPS, rain/heat stress on device) | Normal household rate |
| Network Cell Tower ID | Towers inside the disruption zone | Towers near home address |
| Wi-Fi Networks Detected | Unknown public networks (petrol stations, restaurants) | Known home Wi-Fi |
| App Interaction Pattern | Periodic order-check behavior, map scrolling | Idle or scripted |
| Prior Delivery Activity | Orders delivered in adjacent zones same day | No deliveries recorded before the event |
| Platform API Activity | Rider was online and receiving orders before disruption | Rider was offline on the platform |

**Decision Rule:** A payout is classified as Clean only when ≥ 7 of 10 non-GPS signals are consistent with genuine field presence. A spoofer can fake GPS. They cannot simultaneously fake cell tower location, home Wi-Fi absence, accelerometer motion, battery drain, and platform activity history.

### 9.2 Data Signals Used (Beyond GPS)

The following 15 signals are ingested and scored by the Fraud Engine for every payout event:

**Device Behavioral Signals (collected passively via app SDK)**
1. **Accelerometer / Gyroscope Data** — Detects motion consistent with a person waiting outdoors (micro-movements, phone shifts) vs. a stationary device.
2. **Battery Drain Rate** — Elevated drain correlates with heavy GPS usage, screen activity, and environmental heat/rain stress.
3. **Screen-On / App-Active Timestamps** — Genuine workers check their app frequently during disruptions; automated scripts show unnatural regularity or inactivity.
4. **Device Temperature** (if accessible via API) — Devices in hot, humid outdoor environments exhibit thermal signatures different from climate-controlled rooms.

**Network & Location Signals**
5. **Cell Tower ID + Signal Strength** — Cross-referenced with telecom tower location databases. A worker claiming to be in Koramangala must be served by Koramangala-area towers.
6. **Wi-Fi BSSID Scan** — Detects known home Wi-Fi networks, flagging workers who are actually at their registered residence.
7. **IP Address Geolocation** — Broad corroboration with claimed zone. VPN usage is flagged.
8. **GPS Altitude + Accuracy Radius** — Spoofed GPS coordinates often have suspiciously perfect accuracy (0m radius) or incorrect altitude for the claimed location.

**Historical Behavioral Signals**
9. **Delivery Activity Log (Pre-Event)** — Was the worker actively delivering in or near the disruption zone in the 2 hours before the event? Checked via platform API.
10. **Zone Consistency History** — Does the worker's historical GPS breadcrumb trail regularly pass through the claimed zone? Workers who never go to Zone X but claim disruption in Zone X are flagged.
11. **Claim Frequency Ratio** — Payout events per active week. A legitimate worker will have claims correlated with regional disruption events. A fraudster shows claims with no correlation to their normal routes.

**Population-Level Signals (Fraud Ring Detection)**
12. **Claim Surge Analysis** — Sudden spike in claims from a specific zone at the same timestamp. Legitimate disruptions affect many workers; coordinated fraud rings show unnaturally simultaneous, identical-parameter claims.
13. **Device Fingerprint Clustering** — Multiple claims originating from devices sharing hardware IDs, software versions, or rooted/emulator signatures.
14. **Social Graph / Communication Pattern** (Indirect) — If multiple flagged workers are registered in the same onboarding batch, share referral codes, or exhibit suspiciously synchronized app activity, a coordinated ring flag is raised.
15. **Behavioral Velocity** — Time between policy activation and first claim. Legitimate workers have usage history before claims; fraudsters often claim within hours of activation.

### 9.3 Fraud Detection Strategy

**Stage 1 — Real-Time Anomaly Scoring (Isolation Forest)**
- Runs at the moment a payout is triggered.
- Every payout event is scored against a baseline behavioral model trained on historical legitimate claims.
- Outlier score > threshold → escalated to Stage 2.
- Latency: < 30 seconds.

**Stage 2 — Ring Detection (DBSCAN Clustering)**
- Activated when 10+ simultaneous claims arrive from the same zone within a 10-minute window.
- DBSCAN clusters claims by: device fingerprint similarity, network characteristics, onboarding history, and behavioral vector proximity.
- Clusters of 5+ workers with high similarity scores trigger a coordinated fraud alert.
- Affected claims held for 4-hour review window; payout paused.

**Stage 3 — Risk Score Composition**
Each claim is assigned a composite Fraud Risk Score (0–100):

```
Fraud Score = 
  0.25 × (Device Behavioral Score)
+ 0.25 × (Network/Location Consistency Score)
+ 0.25 × (Historical Activity Score)
+ 0.25 × (Population Anomaly Score)

Score 0–30:   → CLEAN   → Instant payout
Score 31–60:  → REVIEW  → Delayed payout (2–4 hours, soft review)
Score 61–100: → FLAGGED → Held, manual review, worker notified
```

### 9.4 UX Protection — Protecting the Honest Worker

**The core design principle:** A legitimate delivery partner experiencing genuine hardship during a disruption must never be made to feel accused, delayed without explanation, or denied without recourse.

**For CLEAN claims (Score 0–30):**
- Payout initiated immediately, no action required from worker.
- Push notification: *"Heavy rain alert in your zone. ₹90 credited to your UPI. Stay safe."*

**For REVIEW claims (Score 31–60):**
- Payout queued, not denied.
- Worker notified: *"Your claim is being verified. Expected in 2–4 hours."*
- A second-pass check uses slower, more thorough signals (network tower history, delivery log cross-check).
- 90%+ of legitimate workers in this band pass the secondary check automatically.
- No stigma language. No "fraud detected." Just "verification in progress."

**For FLAGGED claims (Score 61–100):**
- Payout withheld pending manual review.
- Worker receives: *"We need a moment to verify your claim. Our team will review within 24 hours."*
- Worker can submit a soft appeal: one tap to share current location screenshot or any additional signal.
- If review confirms legitimacy, payout is processed with an additional ₹20 goodwill credit.
- False positive rate is tracked as a core platform KPI. Target: < 2% of legitimate claims incorrectly flagged.

**Network Drop Handling:**
- Bad weather degrades GPS and cellular signals — this is expected and modeled.
- A worker with poor GPS accuracy during a verified rain event is NOT penalized.
- The system uses the last confirmed zone + weather event boundary to make a conservative but fair payout decision.
- GPS signal quality is an input, not a disqualifier.

---

## 10. Why This Will Work

**Scalability**
- Zone-based parametric model scales horizontally — adding a new city requires only loading zone boundaries and historical disruption data, not rebuilding the model.
- Payout logic is stateless and can process thousands of concurrent events via queue-based architecture.

**Feasibility**
- All required APIs (IMD, CPCB, OpenWeatherMap) are publicly available with free or low-cost tiers.
- Parametric design eliminates the need for a human claims adjuster team — payout cost structure is dramatically lower than traditional insurance.
- Weekly premium model aligns perfectly with gig worker payment cycles (weekly settlements by platforms).

**Real-World Impact**
- Targets a segment with zero existing income protection and real, measurable income volatility.
- At ₹49/week, the product is affordable even for workers earning ₹5,000/week — less than 1% of weekly income.
- A 5-star rating on trust from gig workers translates directly to platform retention and word-of-mouth — the most powerful distribution channel in this demographic.

**Actuarial Viability**
- Parametric triggers are objective and capped — the platform controls maximum liability per event and per worker per week.
- Loss ratio is predictable because triggers are tied to external, measurable thresholds, not subjective worker reports.
- Reinsurance partnerships are feasible given the data-rich, fraud-resistant architecture.

---

## 11. Future Scope

**Short-Term (Phase 2–3)**
- Live integration with Zomato/Swiggy partner APIs for real-time delivery activity validation.
- Expansion to E-commerce (Amazon Flex) and Q-Commerce (Zepto) personas.
- WhatsApp-native onboarding for workers who prefer not to install a new app.
- Vernacular language support (Hindi, Kannada, Tamil) in app and notifications.

**Medium-Term (6–12 Months)**
- **Income History Integration:** Partner with platforms to use verified earnings data for dynamic coverage sizing (cover up to 30% of weekly average earnings, calculated from real data).
- **Micro-Reinsurance Pool:** Group workers by zone and risk tier; offer group pricing for delivery hubs and dark store clusters.
- **Predictive Pre-Activation:** AI model detects 24-hour-ahead disruption probability and proactively prompts workers to activate coverage before the event.

**Long-Term Vision**
- **Blockchain-Anchored Payouts:** Smart contracts for fully trustless, auditable parametric triggers — relevant for regulatory compliance and reinsurer transparency.
- **B2B Partnerships:** White-label GigShield as an embedded benefit within Zomato/Swiggy partner apps — platform pays a subsidized premium as a retention tool for top-rated delivery partners.
- **Pan-Gig Expansion:** Extend beyond delivery to cover auto-rickshaw drivers (traffic restriction events), construction day-wage workers (extreme heat), and agricultural labor (flood events).

---

## 12. Tech Stack Summary

```
Frontend:     React Native (Android), React.js (Admin Dashboard)
Backend:      Node.js (Express), Python (FastAPI for ML)
Database:     PostgreSQL + Redis
ML:           XGBoost, Isolation Forest, DBSCAN (scikit-learn)
Streaming:    Apache Kafka
Cloud:        AWS (EC2, RDS, Lambda, S3)
APIs:         IMD, CPCB, OpenWeatherMap, Razorpay (Test), DigiLocker (Mock)
Auth:         Firebase Auth + OTP
Notifications: FCM + Twilio SMS
Version Control: GitHub (this repo)
```

---

## 13. Team & Repository

**Repository:** [github.com/kumudgoyal/GigShield](https://github.com/kumudgoyal/GigShield)  
**Phase:** 1 — Ideation & Foundation (Submission: March 20, 2026)  
**Competition:** Guidewire DEVTrails 2026 — Unicorn Chase

---

*GigShield — Because every delivery partner deserves a safety net that works as fast as they do.*
