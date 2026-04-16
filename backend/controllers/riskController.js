// controllers/riskController.js — AI Risk Engine (Phase 3)
const { getDb } = require('../config/database');
const { calculatePremium } = require('../services/aiPricing');

/**
 * POST /api/risk/calculate
 * Full ML-based risk scoring with explainability
 */
const calculateRisk = (req, res) => {
  const db = getDb();
  const user = req.user;
  const { city, zone, platform, avg_weekly_income } = req.body;

  const targetCity     = city     || user.city;
  const targetZone     = zone     || user.zone;
  const targetPlatform = platform || user.platform;
  const income         = parseFloat(avg_weekly_income || user.avg_weekly_income || 3500);

  // Count historical claims for this user
  const historicalClaims = db.prepare(
    "SELECT COUNT(*) as n FROM claims WHERE user_id = ? AND status IN ('paid','approved')"
  ).get(user.id)?.n || 0;

  // Get premium + risk breakdown from AI engine
  const result = calculatePremium({
    city: targetCity,
    zone: targetZone,
    platform: targetPlatform,
    avgWeeklyIncome: income,
    historicalClaims,
  });

  // Build factor explanations for UI
  const factors = [
    {
      name: 'City Base Risk',
      icon: '🏙',
      factor: result.breakdown.weatherFactor,
      impact: result.breakdown.weatherFactor > 1.2 ? 'high' : result.breakdown.weatherFactor > 1.1 ? 'medium' : 'low',
      explanation: `${targetCity} historical disruption risk. Weather risk multiplied by 0.3.`,
    },
    {
      name: 'Pollution Risk',
      icon: '💨',
      factor: result.breakdown.pollutionFactor,
      impact: result.breakdown.pollutionFactor > 1.1 ? 'high' : 'medium',
      explanation: `AQI-based coverage adjustment for ${targetCity}. Higher in Delhi/Hyderabad.`,
    },
    {
      name: 'Zone Adjustment',
      icon: '📍',
      factor: result.breakdown.zoneFactor,
      impact: result.breakdown.zoneFactor > 1.05 ? 'high' : result.breakdown.zoneFactor < 1 ? 'low' : 'medium',
      explanation: `${targetZone} zone hyper-local risk. Suburbs/East zones carry higher surcharges.`,
    },
    {
      name: 'Platform Multiplier',
      icon: '🛵',
      factor: result.breakdown.platformFactor,
      impact: result.breakdown.platformFactor > 1.1 ? 'high' : 'medium',
      explanation: `${targetPlatform} delivery exposure factor. Q-commerce operates in extreme conditions.`,
    },
    {
      name: 'Claims History',
      icon: '📋',
      factor: result.breakdown.historyFactor,
      impact: historicalClaims >= 3 ? 'high' : historicalClaims >= 1 ? 'medium' : 'low',
      explanation: `${historicalClaims} prior claims. Each adds +3% to premium (max 30% surcharge).`,
    },
  ];

  // Persist risk score
  db.prepare('UPDATE users SET risk_score = ? WHERE id = ?').run(result.riskScore, user.id);

  res.json({
    riskScore: result.riskScore,
    riskLevel: result.riskScore > 0.7 ? 'HIGH' : result.riskScore > 0.4 ? 'MEDIUM' : 'LOW',
    weeklyPremium: result.weeklyPremium,
    coverageAmount: result.coverageAmount,
    recommendation: result.recommendation,
    factors,
    breakdown: result.breakdown,
    inputs: { city: targetCity, zone: targetZone, platform: targetPlatform, income, historicalClaims },
    modelVersion: 'GigShield-ML-v3.0',
    computedAt: new Date().toISOString(),
  });
};

/**
 * GET /api/risk/history
 * Risk score trend over time
 */
const getRiskHistory = (req, res) => {
  const db = getDb();
  const logs = db.prepare(`
    SELECT date(created_at) as date, AVG(risk_score) as avg_risk, AVG(final_premium) as avg_premium
    FROM premium_logs WHERE user_id = ?
    GROUP BY date(created_at)
    ORDER BY date DESC LIMIT 30
  `).all(req.user.id);

  res.json({ history: logs.reverse() });
};

module.exports = { calculateRisk, getRiskHistory };
