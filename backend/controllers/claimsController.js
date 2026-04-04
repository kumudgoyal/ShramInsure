// controllers/claimsController.js — Claims management + auto-trigger processing
const { getDb } = require('../config/database');
const { detectFraud } = require('../services/fraudDetection');
const { processTriggerEvents, evaluateTriggers } = require('../services/triggerMonitor');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/claims/trigger-check
 * Manually run trigger evaluation for user's city/zone → auto-creates claims
 */
const runTriggerCheck = (req, res) => {
  const db = getDb();
  const user = req.user;
  const city = req.body.city || user.city;
  const zone = req.body.zone || user.zone;

  const result = processTriggerEvents(city, zone);
  res.json({
    message: `Trigger scan complete for ${city} - ${zone}`,
    triggersDetected: result.triggered.length,
    triggers: result.triggered,
    claimsCreated: result.newClaims.length,
    claims: result.newClaims,
  });
};

/**
 * GET /api/claims/environment
 * Get current environmental conditions (mock API data)
 */
const getEnvironment = (req, res) => {
  const db = getDb();
  const city = req.query.city || req.user.city;
  const zone = req.query.zone || req.user.zone;
  const data = evaluateTriggers(city, zone);
  res.json({ city, zone, ...data });
};

/**
 * GET /api/claims
 * Get all claims for current user
 */
const getClaims = (req, res) => {
  const db = getDb();
  const claims = db.prepare(`
    SELECT c.*, p.policy_number, p.city, p.zone
    FROM claims c
    JOIN policies p ON p.id = c.policy_id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `).all(req.user.id);

  // Parse JSON fields
  const parsed = claims.map(c => ({
    ...c,
    trigger_value: JSON.parse(c.trigger_value || '{}'),
    fraud_flags: JSON.parse(c.fraud_flags || '[]'),
  }));

  res.json({ claims: parsed });
};

/**
 * GET /api/claims/:id
 * Single claim with payout info
 */
const getClaim = (req, res) => {
  const db = getDb();
  const claim = db.prepare(`
    SELECT c.*, p.policy_number, p.city, p.zone, p.coverage_amount
    FROM claims c JOIN policies p ON p.id = c.policy_id
    WHERE c.id = ? AND c.user_id = ?
  `).get(req.params.id, req.user.id);

  if (!claim) return res.status(404).json({ error: 'Claim not found.' });

  const payout = db.prepare('SELECT * FROM payouts WHERE claim_id = ?').get(claim.id);

  res.json({
    claim: {
      ...claim,
      trigger_value: JSON.parse(claim.trigger_value || '{}'),
      fraud_flags: JSON.parse(claim.fraud_flags || '[]'),
    },
    payout,
  });
};

/**
 * POST /api/claims/simulate-payout/:id
 * Simulate instant UPI payout for approved claim
 */
const simulatePayout = (req, res) => {
  const db = getDb();
  const claim = db.prepare(
    "SELECT * FROM claims WHERE id = ? AND user_id = ? AND status = 'approved'"
  ).get(req.params.id, req.user.id);

  if (!claim) return res.status(404).json({ error: 'Approved claim not found.' });

  const txnId = `TXN-${uuidv4().substring(0, 8).toUpperCase()}`;
  const upiId = req.body.upi_id || `${req.user.phone}@upi`;

  db.prepare(`
    INSERT INTO payouts (claim_id, user_id, amount, method, txn_id, status, upi_id, settled_at)
    VALUES (?, ?, ?, 'UPI', ?, 'success', ?, datetime('now'))
  `).run(claim.id, req.user.id, claim.payout_amount, txnId, upiId);

  db.prepare("UPDATE claims SET status = 'paid', paid_at = datetime('now') WHERE id = ?").run(claim.id);
  db.prepare('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?').run(claim.payout_amount, req.user.id);

  res.json({
    message: '✅ Payout credited instantly!',
    txnId,
    amount: claim.payout_amount,
    upiId,
    status: 'success',
  });
};

/**
 * Admin: GET /api/claims/admin/all
 */
const adminGetAllClaims = (req, res) => {
  const db = getDb();
  const { status, limit = 50, offset = 0 } = req.query;
  const where = status ? "WHERE c.status = ?" : "";
  const params = status ? [status, limit, offset] : [limit, offset];

  const claims = db.prepare(`
    SELECT c.*, u.name, u.phone, u.platform, p.policy_number, p.city
    FROM claims c
    JOIN users u ON u.id = c.user_id
    JOIN policies p ON p.id = c.policy_id
    ${where}
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params);

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN auto_triggered = 1 THEN 1 ELSE 0 END) as auto_triggered,
      SUM(CASE WHEN status = 'paid' THEN payout_amount ELSE 0 END) as total_payout
    FROM claims
  `).get();

  res.json({ claims: claims.map(c => ({ ...c, fraud_flags: JSON.parse(c.fraud_flags || '[]') })), stats });
};

/**
 * Admin: PUT /api/claims/admin/:id/approve
 */
const adminApproveClaim = (req, res) => {
  const db = getDb();
  const claim = db.prepare("SELECT * FROM claims WHERE id = ? AND status = 'pending'").get(req.params.id);
  if (!claim) return res.status(404).json({ error: 'Pending claim not found.' });

  db.prepare("UPDATE claims SET status = 'approved', processed_at = datetime('now') WHERE id = ?").run(claim.id);
  res.json({ message: 'Claim approved.' });
};

/**
 * Admin: PUT /api/claims/admin/:id/reject
 */
const adminRejectClaim = (req, res) => {
  const db = getDb();
  const claim = db.prepare("SELECT * FROM claims WHERE id = ?").get(req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found.' });

  db.prepare("UPDATE claims SET status = 'rejected', processed_at = datetime('now') WHERE id = ?").run(claim.id);
  res.json({ message: 'Claim rejected.' });
};

module.exports = {
  runTriggerCheck, getEnvironment, getClaims, getClaim,
  simulatePayout, adminGetAllClaims, adminApproveClaim, adminRejectClaim,
};
