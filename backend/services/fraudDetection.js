// services/fraudDetection.js — Intelligent fraud detection for claims
const { getDb } = require('../config/database');

/**
 * Comprehensive fraud detection engine
 * Runs multiple checks and returns a composite fraud score (0-1)
 * Score > 0.7 → Auto-reject; 0.4-0.7 → Manual review; < 0.4 → Auto-approve
 */
const detectFraud = (claim, user, policy, triggerEvent) => {
  const db = getDb();
  const flags = [];
  let fraudScore = 0;

  // ── Check 1: Duplicate claim in same 24h window ───────────────────────────
  const recentClaim = db.prepare(`
    SELECT COUNT(*) as cnt FROM claims
    WHERE user_id = ? AND trigger_type = ? AND created_at >= datetime('now', '-1 day')
  `).get(user.id, claim.trigger_type);

  if (recentClaim.cnt > 0) {
    flags.push({ type: 'DUPLICATE_CLAIM', severity: 'HIGH', detail: 'Duplicate claim submitted within 24 hours' });
    fraudScore += 0.45;
  }

  // ── Check 2: Claim submitted outside policy period ────────────────────────
  const now = new Date();
  const policyStart = new Date(policy.start_date);
  const policyEnd = new Date(policy.end_date);

  if (now < policyStart || now > policyEnd) {
    flags.push({ type: 'OUT_OF_COVERAGE_PERIOD', severity: 'CRITICAL', detail: 'Claim submitted outside active policy window' });
    fraudScore += 0.6;
  }

  // ── Check 3: Location mismatch — city in claim vs policy city ────────────
  if (claim.location && policy.city) {
    const claimCity = claim.location.toLowerCase();
    const policyCity = policy.city.toLowerCase();
    if (!claimCity.includes(policyCity) && !policyCity.includes(claimCity)) {
      flags.push({ type: 'LOCATION_MISMATCH', severity: 'HIGH', detail: `Claim location "${claim.location}" doesn't match policy city "${policy.city}"` });
      fraudScore += 0.35;
    }
  }

  // ── Check 4: Trigger threshold validation ─────────────────────────────────
  // Verify the disruption actually crossed the parametric threshold
  if (triggerEvent && !triggerEvent.breached) {
    flags.push({ type: 'THRESHOLD_NOT_BREACHED', severity: 'HIGH', detail: 'Disruption did not meet parametric trigger threshold' });
    fraudScore += 0.5;
  }

  // ── Check 5: Claim frequency anomaly ─────────────────────────────────────
  const monthlyClaimCount = db.prepare(`
    SELECT COUNT(*) as cnt FROM claims
    WHERE user_id = ? AND created_at >= datetime('now', '-30 days')
  `).get(user.id);

  if (monthlyClaimCount.cnt >= 4) {
    flags.push({ type: 'HIGH_CLAIM_FREQUENCY', severity: 'MEDIUM', detail: `${monthlyClaimCount.cnt} claims in last 30 days (threshold: 4)` });
    fraudScore += 0.25;
  }

  // ── Check 6: Payout amount anomaly ───────────────────────────────────────
  const avgPayout = db.prepare(`
    SELECT AVG(payout_amount) as avg FROM claims
    WHERE user_id = ? AND status = 'paid'
  `).get(user.id);

  if (avgPayout.avg && claim.payout_amount > avgPayout.avg * 2.5) {
    flags.push({ type: 'PAYOUT_ANOMALY', severity: 'MEDIUM', detail: 'Requested payout significantly above historical average' });
    fraudScore += 0.2;
  }

  // ── Check 7: Policy too new for claim ─────────────────────────────────────
  const daysSincePolicy = (now - policyStart) / (1000 * 60 * 60 * 24);
  if (daysSincePolicy < 1) {
    flags.push({ type: 'POLICY_TOO_NEW', severity: 'MEDIUM', detail: 'Claim submitted within 24 hours of policy activation' });
    fraudScore += 0.20;
  }

  // Cap fraud score at 1
  fraudScore = Math.min(fraudScore, 1.0);

  const decision = fraudScore >= 0.7 ? 'REJECT' : fraudScore >= 0.4 ? 'REVIEW' : 'APPROVE';

  return {
    fraudScore: +fraudScore.toFixed(3),
    flags,
    decision,
    autoApprove: decision === 'APPROVE',
    reason: decision === 'APPROVE' ? 'All fraud checks passed — auto-approved'
           : decision === 'REVIEW' ? 'Moderate fraud signals — queued for review'
           : 'High fraud probability — auto-rejected',
  };
};

module.exports = { detectFraud };
