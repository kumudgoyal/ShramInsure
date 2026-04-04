// controllers/policyController.js — Insurance policy management
const { getDb } = require('../config/database');
const { calculatePremium } = require('../services/aiPricing');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/policies/quote
 * Get AI-calculated premium quote (no policy created yet)
 */
const getQuote = (req, res) => {
  const db = getDb();
  const { city, zone, platform, avg_weekly_income } = req.body;
  const user = req.user;

  const historicalClaims = db.prepare(
    'SELECT COUNT(*) as cnt FROM claims WHERE user_id = ?'
  ).get(user.id).cnt;

  const quote = calculatePremium({
    city: city || user.city,
    zone: zone || user.zone,
    platform: platform || user.platform,
    avgWeeklyIncome: parseFloat(avg_weekly_income) || user.avg_weekly_income,
    historicalClaims,
  });

  // Log premium calculation
  db.prepare(`
    INSERT INTO premium_logs (user_id, base_premium, final_premium, city, zone,
      weather_factor, pollution_factor, zone_factor, history_factor, platform_factor)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    user.id, quote.breakdown.basePremium, quote.weeklyPremium,
    city || user.city, zone || user.zone,
    quote.breakdown.weatherFactor, quote.breakdown.pollutionFactor,
    quote.breakdown.zoneFactor, quote.breakdown.historyFactor,
    quote.breakdown.platformFactor
  );

  res.json({ quote });
};

/**
 * POST /api/policies
 * Create a new weekly insurance policy
 */
const createPolicy = (req, res) => {
  const db = getDb();
  const { city, zone, weeks = 4 } = req.body;
  const user = req.user;

  // Check for active policy
  const activePolicy = db.prepare(
    "SELECT id FROM policies WHERE user_id = ? AND status = 'active' AND end_date >= datetime('now')"
  ).get(user.id);

  if (activePolicy) {
    return res.status(409).json({ error: 'You already have an active policy. Wait for it to expire or cancel it.' });
  }

  const historicalClaims = db.prepare(
    'SELECT COUNT(*) as cnt FROM claims WHERE user_id = ?'
  ).get(user.id).cnt;

  const priceData = calculatePremium({
    city: city || user.city,
    zone: zone || user.zone,
    platform: user.platform,
    avgWeeklyIncome: user.avg_weekly_income,
    historicalClaims,
  });

  const startDate = new Date().toISOString();
  const endDate = new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).toISOString();
  const policyNumber = `POL-${uuidv4().substring(0, 8).toUpperCase()}`;

  const result = db.prepare(`
    INSERT INTO policies (user_id, policy_number, status, coverage_amount, weekly_premium,
      start_date, end_date, risk_score, zone, city)
    VALUES (?, ?, 'active', ?, ?, ?, ?, ?, ?, ?)
  `).run(
    user.id, policyNumber, priceData.coverageAmount, priceData.weeklyPremium,
    startDate, endDate, priceData.riskScore, zone || user.zone, city || user.city
  );

  const policy = db.prepare('SELECT * FROM policies WHERE id = ?').get(result.lastID);
  res.status(201).json({ message: 'Policy created successfully!', policy, priceBreakdown: priceData.breakdown });
};

/**
 * GET /api/policies
 * Get all policies for current user
 */
const getPolicies = (req, res) => {
  const db = getDb();
  const policies = db.prepare(
    'SELECT * FROM policies WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.user.id);
  res.json({ policies });
};

/**
 * GET /api/policies/:id
 * Get single policy with claim history
 */
const getPolicy = (req, res) => {
  const db = getDb();
  const policy = db.prepare(
    'SELECT * FROM policies WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id);

  if (!policy) return res.status(404).json({ error: 'Policy not found.' });

  const claims = db.prepare(
    'SELECT * FROM claims WHERE policy_id = ? ORDER BY created_at DESC'
  ).all(policy.id);

  res.json({ policy, claims });
};

/**
 * PUT /api/policies/:id/cancel
 * Cancel an active policy
 */
const cancelPolicy = (req, res) => {
  const db = getDb();
  const policy = db.prepare(
    "SELECT * FROM policies WHERE id = ? AND user_id = ? AND status = 'active'"
  ).get(req.params.id, req.user.id);

  if (!policy) return res.status(404).json({ error: 'Active policy not found.' });

  db.prepare("UPDATE policies SET status = 'cancelled' WHERE id = ?").run(policy.id);
  res.json({ message: 'Policy cancelled successfully.' });
};

module.exports = { getQuote, createPolicy, getPolicies, getPolicy, cancelPolicy };
