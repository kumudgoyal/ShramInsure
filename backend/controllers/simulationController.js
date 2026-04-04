// controllers/simulationController.js — Demo Simulation Engine
// Forcefully injects disruption events to demo the full zero-touch claim flow
const { getDb } = require('../config/database');
const { detectFraud } = require('../services/fraudDetection');
const { v4: uuidv4 } = require('uuid');

/**
 * Core simulation function — injects a disruption event and processes auto-claims
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {object} event - The disruption event to inject
 */
const runSimulation = (req, res, event) => {
  const db = getDb();
  const user = req.user;
  const city = req.body.city || user.city;
  const zone = req.body.zone || user.zone;
  const steps = [];

  steps.push({ step: 1, label: 'Disruption Detected', detail: `${event.label} detected in ${city} - ${zone}`, icon: event.icon, status: 'done' });

  // Log trigger event
  const triggerResult = db.prepare(`
    INSERT INTO trigger_events (event_type, city, zone, severity, value, unit, threshold, breached, raw_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).run(event.type, city, zone, event.severity, event.value, event.unit, event.threshold, JSON.stringify(event.data));

  steps.push({ step: 2, label: 'Trigger Logged', detail: `Event ID #${triggerResult.lastID} stored in ledger`, icon: '📝', status: 'done' });

  // Find active policy for this user in this city
  const policy = db.prepare(`
    SELECT p.*, u.avg_weekly_income
    FROM policies p JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ? AND p.status = 'active' AND p.end_date >= datetime('now')
    ORDER BY p.created_at DESC LIMIT 1
  `).get(user.id);

  if (!policy) {
    return res.status(400).json({
      success: false,
      error: 'No active policy found. Please create a policy first.',
      steps,
    });
  }

  steps.push({ step: 3, label: 'Worker Activity Verified', detail: `Active policy ${policy.policy_number} found — coverage valid`, icon: '✅', status: 'done' });

  // Calculate payout
  const dailyIncome = policy.avg_weekly_income / 7;
  const severityMultiplier = event.severity === 'critical' ? 0.9 : event.severity === 'high' ? 0.7 : 0.5;
  const payoutAmount = +(dailyIncome * severityMultiplier).toFixed(2);

  steps.push({ step: 4, label: 'Income Loss Calculated', detail: `₹${payoutAmount.toFixed(0)} estimated loss (${(severityMultiplier*100).toFixed(0)}% daily income × severity)`, icon: '💰', status: 'done' });

  // Fraud check
  const claimData = { trigger_type: event.type, location: city, payout_amount: payoutAmount };
  const fraud = detectFraud(claimData, user, policy, { ...event, breached: true });

  const fraudLabel = fraud.decision === 'APPROVE' ? `✅ PASSED (score: ${(fraud.fraudScore*100).toFixed(0)}/100)` :
                     fraud.decision === 'REVIEW' ? `⚠️ REVIEW (score: ${(fraud.fraudScore*100).toFixed(0)}/100)` :
                     `🚨 FLAGGED (score: ${(fraud.fraudScore*100).toFixed(0)}/100)`;

  steps.push({ step: 5, label: 'Fraud Analysis Complete', detail: fraudLabel, icon: '🔍', status: fraud.decision === 'REJECT' ? 'blocked' : 'done', fraudData: fraud });

  // Create claim
  const claimNumber = `SIM-${Date.now()}-${Math.floor(Math.random() * 999)}`;
  const status = fraud.decision === 'REJECT' ? 'rejected' : fraud.decision === 'APPROVE' ? 'approved' : 'pending';

  const claimResult = db.prepare(`
    INSERT INTO claims (claim_number, policy_id, user_id, trigger_type, trigger_value, status,
      payout_amount, fraud_score, fraud_flags, auto_triggered, location, processed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, datetime('now'))
  `).run(
    claimNumber, policy.id, user.id, event.type,
    JSON.stringify(event.data), status, payoutAmount,
    fraud.fraudScore, JSON.stringify(fraud.flags), city
  );

  steps.push({ step: 6, label: 'Claim Auto-Filed', detail: `Claim ${claimNumber} created with status: ${status.toUpperCase()}`, icon: '📋', status: 'done' });

  let payoutResult = null;

  if (status === 'approved') {
    // Auto payout
    const txnId = `TXN-${uuidv4().substring(0, 8).toUpperCase()}`;
    const upiId = `${user.phone}@upi`;

    db.prepare(`
      INSERT INTO payouts (claim_id, user_id, amount, method, txn_id, status, upi_id, settled_at)
      VALUES (?, ?, ?, 'UPI', ?, 'success', ?, datetime('now'))
    `).run(claimResult.lastID, user.id, payoutAmount, txnId, upiId);

    db.prepare("UPDATE claims SET status = 'paid', paid_at = datetime('now') WHERE id = ?").run(claimResult.lastID);
    db.prepare('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?').run(payoutAmount, user.id);

    payoutResult = { txnId, amount: payoutAmount, upiId, method: 'UPI', status: 'success' };

    steps.push({
      step: 7,
      label: '💸 Payout Credited!',
      detail: `₹${payoutAmount.toFixed(0)} sent to ${upiId} · TXN: ${txnId}`,
      icon: '🎉',
      status: 'paid',
    });
  } else if (status === 'rejected') {
    steps.push({ step: 7, label: 'Payout Blocked', detail: 'High fraud risk detected — claim rejected for manual investigation', icon: '🚫', status: 'blocked' });
  } else {
    steps.push({ step: 7, label: 'Queued for Review', detail: 'Moderate risk signals — claim sent to manual review queue', icon: '⏳', status: 'pending' });
  }

  const newWallet = db.prepare('SELECT wallet_balance FROM users WHERE id = ?').get(user.id)?.wallet_balance || 0;

  res.json({
    success: true,
    simulationType: event.type,
    triggerLabel: event.label,
    city,
    zone,
    steps,
    claim: { claimNumber, status, payoutAmount, policyNumber: policy.policy_number },
    payout: payoutResult,
    fraud,
    walletBalance: newWallet,
    summary: status === 'paid'
      ? `✅ Full simulation complete! ₹${payoutAmount.toFixed(0)} auto-credited to wallet.`
      : status === 'rejected'
      ? `🚨 Simulation complete. Fraud detected — payout blocked.`
      : `⏳ Simulation complete. Claim queued for manual review.`,
  });
};

// ── Individual Simulation Handlers ──────────────────────────────────────────

const simulateRain = (req, res) => runSimulation(req, res, {
  type: 'WEATHER_RAIN',
  label: 'Simulated Heavy Rain',
  icon: '🌧',
  severity: 'high',
  value: 87.5,
  unit: 'mm/hr',
  threshold: 65,
  data: { rainfall: 87.5, condition: 'Simulated Monsoon Surge', source: 'GigShield Demo Engine' },
});

const simulatePollution = (req, res) => runSimulation(req, res, {
  type: 'POLLUTION_AQI',
  label: 'Simulated Air Quality Emergency',
  icon: '💨',
  severity: 'critical',
  value: 340,
  unit: 'AQI',
  threshold: 200,
  data: { aqi: 340, category: 'Hazardous', source: 'GigShield Demo Engine' },
});

const simulateCurfew = (req, res) => runSimulation(req, res, {
  type: 'CIVIL_CURFEW',
  label: 'Simulated Zone Curfew',
  icon: '🚫',
  severity: 'critical',
  value: 1,
  unit: 'boolean',
  threshold: 0,
  data: { active: true, reason: 'Simulated civil restriction', source: 'GigShield Demo Engine' },
});

const simulateFlood = (req, res) => runSimulation(req, res, {
  type: 'FLOOD_ALERT',
  label: 'Simulated Flood Alert',
  icon: '🌊',
  severity: 'critical',
  value: 1.4,
  unit: 'meters',
  threshold: 0.5,
  data: { waterLevel: 1.4, severity: 'high', source: 'GigShield Demo Engine' },
});

const simulateHeat = (req, res) => runSimulation(req, res, {
  type: 'WEATHER_HEAT',
  label: 'Simulated Extreme Heat',
  icon: '🌡',
  severity: 'high',
  value: 46.2,
  unit: '°C',
  threshold: 42,
  data: { temp: 46.2, condition: 'Extreme Heat Wave', source: 'GigShield Demo Engine' },
});

/**
 * GET /api/simulate/history
 * Recent simulation events
 */
const getSimulations = (req, res) => {
  const db = getDb();
  const events = db.prepare(`
    SELECT * FROM trigger_events
    WHERE raw_data LIKE '%Demo Engine%'
    ORDER BY created_at DESC LIMIT 20
  `).all().map(e => ({ ...e, raw_data: JSON.parse(e.raw_data || '{}') }));

  res.json({ simulations: events });
};

module.exports = { simulateRain, simulatePollution, simulateCurfew, simulateFlood, simulateHeat, getSimulations };
