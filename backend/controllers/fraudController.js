// controllers/fraudController.js — Fraud analytics endpoints
const { getDb } = require('../config/database');
const { detectFraud } = require('../services/fraudDetection');

/**
 * POST /api/fraud/check
 * Run fraud analysis on arbitrary claim data (for admin testing)
 */
const checkFraud = (req, res) => {
  const db = getDb();
  const { claim_id } = req.body;

  if (claim_id) {
    const claim = db.prepare(`
      SELECT c.*, p.* FROM claims c JOIN policies p ON p.id = c.policy_id WHERE c.id = ?
    `).get(claim_id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    const triggerEvent = db.prepare(
      'SELECT * FROM trigger_events WHERE event_type = ? AND city = ? ORDER BY created_at DESC LIMIT 1'
    ).get(claim.trigger_type, claim.location);

    const result = detectFraud(
      { trigger_type: claim.trigger_type, location: claim.location, payout_amount: claim.payout_amount },
      req.user,
      claim,
      triggerEvent || { breached: true }
    );
    return res.json({ claimId: claim_id, ...result });
  }

  res.status(400).json({ error: 'claim_id required' });
};

/**
 * GET /api/fraud/logs
 * Admin: all high-fraud claims
 */
const getFraudLogs = (req, res) => {
  const db = getDb();
  const threshold = parseFloat(req.query.threshold || 0.4);
  const logs = db.prepare(`
    SELECT c.claim_number, c.fraud_score, c.fraud_flags, c.trigger_type, c.status,
           c.payout_amount, c.created_at, u.name, u.phone, u.platform, p.city
    FROM claims c
    JOIN users u ON u.id = c.user_id
    JOIN policies p ON p.id = c.policy_id
    WHERE c.fraud_score >= ?
    ORDER BY c.fraud_score DESC, c.created_at DESC
    LIMIT 50
  `).all(threshold).map(r => ({
    ...r,
    fraud_flags: JSON.parse(r.fraud_flags || '[]'),
    riskLevel: r.fraud_score >= 0.7 ? 'HIGH' : r.fraud_score >= 0.4 ? 'MEDIUM' : 'LOW',
  }));

  res.json({ logs, threshold });
};

/**
 * GET /api/fraud/stats
 * Admin: fraud summary metrics
 */
const getFraudStats = (req, res) => {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as n FROM claims').get().n;
  const flagged = db.prepare('SELECT COUNT(*) as n FROM claims WHERE fraud_score >= 0.4').get().n;
  const rejected = db.prepare("SELECT COUNT(*) as n FROM claims WHERE status = 'rejected'").get().n;
  const autoApproved = db.prepare('SELECT COUNT(*) as n FROM claims WHERE fraud_score < 0.4 AND auto_triggered = 1').get().n;
  const savedAmount = db.prepare("SELECT SUM(payout_amount) as s FROM claims WHERE status = 'rejected'").get().s || 0;

  // Top fraud flags breakdown
  const allFlags = db.prepare('SELECT fraud_flags FROM claims WHERE fraud_flags != "[]"').all();
  const flagCounts = {};
  for (const row of allFlags) {
    try {
      const flags = JSON.parse(row.fraud_flags);
      for (const f of flags) {
        flagCounts[f.type] = (flagCounts[f.type] || 0) + 1;
      }
    } catch {}
  }
  const topFlags = Object.entries(flagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([type, count]) => ({ type, count }));

  res.json({
    totalClaims: total,
    flaggedClaims: flagged,
    rejectedClaims: rejected,
    autoApprovedClaims: autoApproved,
    fraudRate: total > 0 ? +((flagged / total) * 100).toFixed(1) : 0,
    estimatedSaved: +savedAmount.toFixed(2),
    topFlags,
  });
};

module.exports = { checkFraud, getFraudLogs, getFraudStats };
