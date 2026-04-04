# 🛡️ ShramInsure — AI-Powered Parametric Insurance for Gig Workers

> **Guidewire DEVTrails 2026 · Phase 2 Submission**
>
> AI-enabled parametric income protection for India's 15M+ delivery partners (Zepto, Zomato, Swiggy, Blinkit, Amazon)

---

## 🎯 What We Built

ShramInsure protects delivery workers from **loss of income** caused by uncontrollable external disruptions:

| Trigger              | Threshold           | Response         |
| -------------------- | ------------------- | ---------------- |
| 🌧️ Heavy Rain       | > 65 mm/hr          | Auto-claim filed |
| 🌡️ Extreme Heat     | > 42°C              | Auto-claim filed |
| 💨 Air Quality (AQI) | > 200               | Auto-claim filed |
| ⛈️ Storm / Wind      | > 50 km/h           | Auto-claim filed |
| 🚫 Zone Curfew       | Active              | Auto-claim filed |
| 🌊 Flood Alert       | > 0.5 m water level | Auto-claim filed |

**Coverage scope:** Loss of income ONLY (no health/vehicle/accident coverage per contest rules).
**Pricing model:** Weekly premium (₹99–₹350/week depending on AI risk score).

---

## 🏗️ Architecture

```
ShramInsure/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   └── database.js         # sql.js SQLite with file persistence
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── policyController.js
│   │   ├── claimsController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   ├── services/
│   │   ├── aiPricing.js
│   │   ├── fraudDetection.js
│   │   └── triggerMonitor.js
│   ├── .env
│   ├── index.js
│   └── package.json
│
└── frontend/                   # React + Vite + Tailwind
```

---

## ⚡ Quick Start (VS Code)

### Prerequisites

* Node.js v18+
* npm v9+

### 1. Backend Setup

```bash
cd backend
npm install
node index.js
```

Server starts at **http://localhost:5001**

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App opens at **http://localhost:5173**

---

## 🧪 Demo Credentials

| Role      | Phone        | Instructions    |
| --------- | ------------ | --------------- |
| 🚴 Worker | `9876543210` | Click "Get OTP" |
| 🔑 Admin  | `9999999999` | Click "Get OTP" |

---

## 🤖 AI Premium Calculation

```
Final Premium = blend(
  BasePremium × WeatherFactor × PollutionFactor × ZoneFactor × PlatformFactor × HistoryFactor,
  0.045 × AvgWeeklyIncome
)
```

---

## 🔌 API Endpoints

### Auth

* POST `/api/auth/register`
* POST `/api/auth/request-otp`
* POST `/api/auth/login`
* GET `/api/auth/me`

### Policies

* POST `/api/policies/quote`
* POST `/api/policies`
* GET `/api/policies`
* PUT `/api/policies/:id/cancel`

### Claims

* POST `/api/claims/trigger-check`
* GET `/api/claims/environment`
* GET `/api/claims`
* POST `/api/claims/simulate-payout/:id`

---

## 🛡️ Fraud Detection

* Duplicate claims
* Location mismatch
* Threshold violations
* High payout anomalies

---

## 🧪 Tech Stack

* Frontend: React + Vite + Tailwind
* Backend: Node.js + Express
* Database: SQLite (sql.js)
* Auth: JWT + OTP
* Scheduling: node-cron
* Payments: Mock UPI

---

## 📦 Environment Variables

```env
PORT=5001
JWT_SECRET=shraminsure_super_secret_jwt_key_2026
DB_PATH=./shraminsure.db
NODE_ENV=development
```

---

*Built for Guidewire DEVTrails 2026 · Phase 2: Automation & Protection*
