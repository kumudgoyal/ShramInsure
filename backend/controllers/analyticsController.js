// controllers/analyticsController.js — Admin analytics & dashboard data
const { getDb } = require('../config/database');

/**
 * GET /api/analytics/dashboard
 * Full admin analytics snapshot
 */
const getDashboard = (req, res) => {
  const db = getDb();
  const totalUsers    = db.prepare("SELECT COUNT(*) as n FROM users WHERE is_admin = 0").get().n;
  const activePolicies = db.prepare("SELECT COUNT(*) as n FROM policies WHERE status = 'active'").get().n;
  const totalPremium  = db.prepare("SELECT SUM(weekly_premium) as s FROM policies WHERE status = 'active'").get().s || 0;
  const totalPayouts  = db.prepare("SELECT SUM(amount) as s FROM payouts WHERE status = 'success'").get().s || 0;
  const pendingClaims = db.prepare("SELECT COUNT(*) as n FROM claims WHERE status = 'pending'").get().n;
  const fraudAlerts   = db.prepare("SELECT COUNT(*) as n FROM claims WHERE fraud_score > 0.4").get().n;

  // Claims by type
  const claimsByType = db.prepare(`
    SELECT trigger_type, COUNT(*) as count, SUM(payout_amount) as total_payout
    FROM claims GROUP BY trigger_type ORDER BY count DESC
  `).all();

  // Claims trend (last 7 days)
  const claimsTrend = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as claims, SUM(payout_amount) as payout
    FROM claims WHERE created_at >= date('now', '-7 days')
    GROUP BY date(created_at) ORDER BY date
  `).all();

  // Top risk cities
  const riskByCities = db.prepare(`
    SELECT city, AVG(risk_score) as avg_risk, COUNT(*) as policy_count
    FROM policies GROUP BY city ORDER BY avg_risk DESC
  `).all();

  // Recent fraud alerts
  const recentFraud = db.prepare(`
    SELECT c.claim_number, c.fraud_score, c.fraud_flags, c.trigger_type, u.name, u.phone
    FROM claims c JOIN users u ON u.id = c.user_id
    WHERE c.fraud_score > 0.4 ORDER BY c.created_at DESC LIMIT 5
  `).all().map(r => ({ ...r, fraud_flags: JSON.parse(r.fraud_flags || '[]') }));

  // Loss ratio = total payouts / total premiums collected
  const totalPremiumCollected = db.prepare(`
    SELECT SUM(weekly_premium * (julianday(end_date) - julianday(start_date)) / 7) as total
    FROM policies
  `).get().total || 0;
  const lossRatio = totalPremiumCollected > 0 ? +(totalPayouts / totalPremiumCollected).toFixed(3) : 0;

  res.json({
    summary: { totalUsers, activePolicies, totalPremium, totalPayouts, pendingClaims, fraudAlerts, lossRatio },
    claimsByType,
    claimsTrend,
    riskByCities,
    recentFraud,
  });
};

/**
 * GET /api/analytics/worker
 * Worker-level dashboard data
 */
const getWorkerDashboard = (req, res) => {
  const db = getDb();
  const user = req.user;

  const activePolicy = db.prepare(
    "SELECT * FROM policies WHERE user_id = ? AND status = 'active' AND end_date >= datetime('now') ORDER BY created_at DESC LIMIT 1"
  ).get(user.id);

  const totalClaims = db.prepare("SELECT COUNT(*) as n FROM claims WHERE user_id = ?").get(user.id).n;
  const paidClaims  = db.prepare("SELECT COUNT(*) as n FROM claims WHERE user_id = ? AND status = 'paid'").get(user.id).n;
  const totalPayout = db.prepare("SELECT SUM(amount) as s FROM payouts WHERE user_id = ? AND status = 'success'").get(user.id).s || 0;

  const recentClaims = db.prepare(`
    SELECT c.*, p.policy_number FROM claims c JOIN policies p ON p.id = c.policy_id
    WHERE c.user_id = ? ORDER BY c.created_at DESC LIMIT 5
  `).all(user.id).map(c => ({
    ...c,
    trigger_value: JSON.parse(c.trigger_value || '{}'),
    fraud_flags: JSON.parse(c.fraud_flags || '[]'),
  }));

  // Weekly earnings protection
  const earningsProtected = activePolicy ? activePolicy.coverage_amount * 4 : 0; // 4-week coverage

  res.json({
    user: { name: user.name, phone: user.phone, platform: user.platform, city: user.city, walletBalance: user.wallet_balance },
    activePolicy,
    stats: { totalClaims, paidClaims, totalPayout, earningsProtected },
    recentClaims,
  });
};

module.exports = { getDashboard, getWorkerDashboard };
