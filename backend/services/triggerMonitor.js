// services/triggerMonitor.js — Parametric trigger system (mock APIs)
// Simulates 5 real-world disruption triggers that auto-fire claims

const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { detectFraud } = require('./fraudDetection');

// ── Mock Data Pools ───────────────────────────────────────────────────────────
// In production these would call OpenWeatherMap, CPCB AQI, etc.

const MOCK_WEATHER = {
  Mumbai:    { temp: 38, rainfall: 85, windSpeed: 62, condition: 'Heavy Rain' },
  Delhi:     { temp: 44, rainfall: 0,  windSpeed: 15, condition: 'Extreme Heat' },
  Bangalore: { temp: 32, rainfall: 45, windSpeed: 30, condition: 'Moderate Rain' },
  Chennai:   { temp: 40, rainfall: 70, windSpeed: 55, condition: 'Cyclone Warning' },
  Hyderabad: { temp: 42, rainfall: 20, windSpeed: 25, condition: 'Hot & Dusty' },
};

const MOCK_AQI = {
  Mumbai: 165, Delhi: 312, Bangalore: 98, Chennai: 145, Hyderabad: 190,
};

const MOCK_CURFEW = {
  Mumbai: { active: false, zones: [] },
  Delhi:  { active: true,  zones: ['East', 'North'], reason: 'Political unrest' },
  Bangalore: { active: false, zones: [] },
};

const MOCK_TRAFFIC = {
  Mumbai:    { congestionLevel: 85, avgSpeedKmph: 12, description: 'Severe gridlock' },
  Delhi:     { congestionLevel: 70, avgSpeedKmph: 18, description: 'Heavy congestion' },
  Bangalore: { congestionLevel: 92, avgSpeedKmph: 8,  description: 'Near standstill' },
};

const MOCK_FLOOD = {
  Mumbai:    { floodZones: ['Kurla', 'Andheri East', 'Sion'], severity: 'high', waterLevel: 1.2 },
  Chennai:   { floodZones: ['Tambaram', 'Velachery'],         severity: 'medium', waterLevel: 0.7 },
  Hyderabad: { floodZones: [],                                severity: 'none', waterLevel: 0 },
};

// ── Thresholds (parametric triggers) ─────────────────────────────────────────
const THRESHOLDS = {
  RAINFALL:     { value: 65,  unit: 'mm/hr',   label: 'Heavy Rain' },       // > 65mm/hr
  TEMPERATURE:  { value: 42,  unit: '°C',      label: 'Extreme Heat' },     // > 42°C
  AQI:          { value: 200, unit: 'AQI',     label: 'Severe Pollution' }, // > 200 AQI
  WIND_SPEED:   { value: 50,  unit: 'km/h',    label: 'Storm Warning' },    // > 50km/h
  CURFEW:       { value: 1,   unit: 'boolean', label: 'Civil Curfew' },     // active = true
  FLOOD_LEVEL:  { value: 0.5, unit: 'meters',  label: 'Flood Alert' },      // > 0.5m
};

/**
 * Mock API call: Fetch weather for city
 */
const fetchWeather = (city) => {
  const db = getDb();
  const data = MOCK_WEATHER[city] || { temp: 30, rainfall: 10, windSpeed: 20, condition: 'Clear' };
  // Add slight randomness to simulate real API variance
  return {
    ...data,
    rainfall: +(data.rainfall + (Math.random() * 20 - 10)).toFixed(1),
    temp: +(data.temp + (Math.random() * 4 - 2)).toFixed(1),
    windSpeed: +(data.windSpeed + (Math.random() * 10 - 5)).toFixed(1),
  };
};

/**
 * Mock API call: Fetch AQI for city
 */
const fetchAQI = (city) => {
  const db = getDb();
  const base = MOCK_AQI[city] || 120;
  return +(base + (Math.random() * 40 - 20)).toFixed(0);
};

/**
 * Mock API call: Check curfew/zone restrictions
 */
const fetchCurfew = (city, zone) => {
  const db = getDb();
  const data = MOCK_CURFEW[city] || { active: false, zones: [] };
  return {
    active: data.active && (data.zones.length === 0 || data.zones.includes(zone)),
    reason: data.reason || null,
    zones: data.zones,
  };
};

/**
 * Mock API call: Fetch flood data
 */
const fetchFlood = (city) => {
  const db = getDb();
  return MOCK_FLOOD[city] || { floodZones: [], severity: 'none', waterLevel: 0 };
};

/**
 * Evaluate all 5 parametric triggers for a given city/zone
 * Returns array of triggered events with severity
 */
const evaluateTriggers = (city, zone) => {
  const db = getDb();
  const weather = fetchWeather(city);
  const aqi = fetchAQI(city);
  const curfew = fetchCurfew(city, zone);
  const flood = fetchFlood(city);

  const triggered = [];

  // Trigger 1: Heavy Rain
  if (weather.rainfall > THRESHOLDS.RAINFALL.value) {
    triggered.push({
      type: 'WEATHER_RAIN',
      label: 'Heavy Rain Alert',
      value: weather.rainfall,
      threshold: THRESHOLDS.RAINFALL.value,
      unit: THRESHOLDS.RAINFALL.unit,
      severity: weather.rainfall > 100 ? 'critical' : 'high',
      breached: true,
      data: weather,
    });
  }

  // Trigger 2: Extreme Heat
  if (weather.temp > THRESHOLDS.TEMPERATURE.value) {
    triggered.push({
      type: 'WEATHER_HEAT',
      label: 'Extreme Heat Warning',
      value: weather.temp,
      threshold: THRESHOLDS.TEMPERATURE.value,
      unit: THRESHOLDS.TEMPERATURE.unit,
      severity: weather.temp > 46 ? 'critical' : 'high',
      breached: true,
      data: weather,
    });
  }

  // Trigger 3: Air Quality Emergency
  if (aqi > THRESHOLDS.AQI.value) {
    triggered.push({
      type: 'POLLUTION_AQI',
      label: 'Air Quality Emergency',
      value: aqi,
      threshold: THRESHOLDS.AQI.value,
      unit: THRESHOLDS.AQI.unit,
      severity: aqi > 300 ? 'critical' : 'high',
      breached: true,
      data: { aqi },
    });
  }

  // Trigger 4: Storm / High Wind
  if (weather.windSpeed > THRESHOLDS.WIND_SPEED.value) {
    triggered.push({
      type: 'WEATHER_STORM',
      label: 'Storm Warning',
      value: weather.windSpeed,
      threshold: THRESHOLDS.WIND_SPEED.value,
      unit: THRESHOLDS.WIND_SPEED.unit,
      severity: weather.windSpeed > 80 ? 'critical' : 'high',
      breached: true,
      data: weather,
    });
  }

  // Trigger 5: Civil Curfew / Zone Closure
  if (curfew.active) {
    triggered.push({
      type: 'CIVIL_CURFEW',
      label: 'Zone Closure / Curfew',
      value: 1,
      threshold: 0,
      unit: 'boolean',
      severity: 'critical',
      breached: true,
      data: curfew,
    });
  }

  // Trigger 6: Flood Alert
  if (flood.waterLevel > THRESHOLDS.FLOOD_LEVEL.value) {
    triggered.push({
      type: 'FLOOD_ALERT',
      label: 'Flood Zone Alert',
      value: flood.waterLevel,
      threshold: THRESHOLDS.FLOOD_LEVEL.value,
      unit: 'meters',
      severity: flood.waterLevel > 1 ? 'critical' : 'high',
      breached: true,
      data: flood,
    });
  }

  return { triggered, weather, aqi, curfew, flood };
};

/**
 * Log a trigger event to DB and auto-create claims for affected policyholders
 */
const processTriggerEvents = (city, zone) => {
  const db = getDb();
  const { triggered } = evaluateTriggers(city, zone);
  const newClaims = [];

  for (const event of triggered) {
    // Log trigger event
    const stmt = db.prepare(`
      INSERT INTO trigger_events (event_type, city, zone, severity, value, unit, threshold, breached, raw_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(event.type, city, zone || 'All', event.severity, event.value, event.unit, event.threshold, 1, JSON.stringify(event.data));

    // Find active policies in affected city/zone
    const affectedPolicies = db.prepare(`
      SELECT p.*, u.id as uid, u.avg_weekly_income, u.phone, u.name, u.wallet_balance
      FROM policies p
      JOIN users u ON u.id = p.user_id
      WHERE p.status = 'active' AND p.city = ? AND (p.zone = ? OR ? = 'All')
        AND p.end_date >= datetime('now')
    `).all(city, zone || 'All', zone || 'All');

    for (const policy of affectedPolicies) {
      // Check if claim already exists for this trigger today
      const existing = db.prepare(`
        SELECT id FROM claims WHERE policy_id = ? AND trigger_type = ? AND created_at >= date('now')
      `).get(policy.id, event.type);

      if (existing) continue;

      // Calculate payout (prorated daily amount based on severity)
      const weeklyIncome = parseFloat(policy.avg_weekly_income) || 3500; // fallback to min ₹3500/week
      const dailyIncome = weeklyIncome / 7;
      const severityMultiplier = event.severity === 'critical' ? 0.9 : event.severity === 'high' ? 0.7 : 0.5;
      const rawPayout = dailyIncome * severityMultiplier;
      const payoutAmount = +Math.max(rawPayout, 150).toFixed(2); // minimum ₹150 payout

      // Run fraud check
      const claimData = { trigger_type: event.type, location: city, payout_amount: payoutAmount };
      const fraud = detectFraud(claimData, { id: policy.user_id }, policy, event);

      const claimNumber = `CLM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const status = fraud.decision === 'REJECT' ? 'rejected'
                   : fraud.decision === 'APPROVE' ? 'approved' : 'pending';

      const inserted = db.prepare(`
        INSERT INTO claims (claim_number, policy_id, user_id, trigger_type, trigger_value, status,
          payout_amount, fraud_score, fraud_flags, auto_triggered, location, processed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, datetime('now'))
      `).run(
        claimNumber, policy.id, policy.user_id, event.type,
        JSON.stringify(event.data), status, payoutAmount,
        fraud.fraudScore, JSON.stringify(fraud.flags), city
      );

      // Auto-payout if approved
      if (status === 'approved') {
        const txnId = `TXN-${uuidv4().substring(0, 8).toUpperCase()}`;
        db.prepare(`
          INSERT INTO payouts (claim_id, user_id, amount, method, txn_id, status, settled_at)
          VALUES (?, ?, ?, 'UPI', ?, 'success', datetime('now'))
        `).run(inserted.lastID, policy.user_id, payoutAmount, txnId);

        // Update claim to paid
        db.prepare(`UPDATE claims SET status = 'paid', paid_at = datetime('now') WHERE id = ?`).run(inserted.lastID);

        // Credit wallet
        db.prepare(`UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?`).run(payoutAmount, policy.user_id);
        
        console.log(`💸 Auto-payout processed: ${txnId} for ₹${payoutAmount}`);
      }

      newClaims.push({ claimNumber, policyId: policy.id, status, payoutAmount });
    }
  }

  return { triggered, newClaims };
};

module.exports = { evaluateTriggers, processTriggerEvents, THRESHOLDS };
