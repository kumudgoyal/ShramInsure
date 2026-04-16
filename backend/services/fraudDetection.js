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

  // ── Check 2: Location mismatch — city in claim vs policy city ────────────
  if (claim.location && policy.city) {
    const claimCity = claim.location.toLowerCase();
    const policyCity = policy.city.toLowerCase();
    if (!claimCity.includes(policyCity) && !policyCity.includes(claimCity)) {
      flags.push({ type: 'LOCATION_MISMATCH', severity: 'HIGH', detail: `Claim location "${claim.location}" doesn't match policy city "${policy.city}"` });
      fraudScore += 0.35;
    }
  }

  // ── Check 3: GPS Mismatch (Simulated) ─────────────────────────────────────
  // We simulate a GPS mismatch if the user is "out of zone" (15% chance for demo)
  const gps_mismatch_sim = Math.random() < 0.15;
  if (gps_mismatch_sim) {
    flags.push({ type: 'GPS_MISMATCH', severity: 'CRITICAL', detail: 'Device GPS coordinates were outside the insured perimeter at trigger time' });
    fraudScore += 0.50;
  }

  // ── Check 4: Weather Validation (Mismatch Check) ──────────────────────────
  // Check if the reported trigger type matches the current environment data
  if (triggerEvent && triggerEvent.type === 'WEATHER_RAIN' && triggerEvent.value < 40) {
    flags.push({ type: 'WEATHER_MISMATCH', severity: 'HIGH', detail: 'Rainfall intensity reported is inconsistent with local meteorological stations' });
    fraudScore += 0.40;
  }

  // ── Check 5: Claim frequency anomaly ─────────────────────────────────────
  const weeklyClaimCount = db.prepare(`
    SELECT COUNT(*) as cnt FROM claims
    WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
  `).get(user.id);

  if (weeklyClaimCount.cnt >= 3) {
    flags.push({ type: 'SENSITIVE_FREQUENCY', severity: 'MEDIUM', detail: `${weeklyClaimCount.cnt} claims in last 7 days (Limit: 2)` });
    fraudScore += 0.30;
  }

  // Cap fraud score at 1
  fraudScore = Math.min(fraudScore, 1.0);

  const decision = fraudScore >= 0.7 ? 'REJECT' : fraudScore >= 0.4 ? 'REVIEW' : 'APPROVE';
  const fraudLevel = fraudScore >= 0.7 ? 'HIGH' : fraudScore >= 0.4 ? 'MEDIUM' : 'LOW';

  return {
    fraudScore: +fraudScore.toFixed(3),
    fraudLevel,
    flags,
    decision,
    autoApprove: decision === 'APPROVE',
    reason: decision === 'APPROVE' ? 'All fraud checks passed — auto-approved'
           : decision === 'REVIEW' ? `Moderate fraud signals (${fraudLevel}) — queued for review`
           : `High fraud probability (${fraudLevel}) — auto-rejected`,
  };
};

module.exports = { detectFraud };
