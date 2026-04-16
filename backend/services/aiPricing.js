// services/aiPricing.js — AI-powered dynamic premium calculation engine
// Simulates an ML model with weighted risk factors for weekly insurance pricing

/**
 * City-level base risk multipliers derived from historical disruption data
 * (Mumbai has monsoons; Delhi has pollution; Bangalore has traffic)
 */
const CITY_BASE_RISK = {
  Mumbai:    { base: 120, weatherRisk: 0.85, pollutionRisk: 0.3, floodRisk: 0.7 },
  Delhi:     { base: 110, weatherRisk: 0.6,  pollutionRisk: 0.95, floodRisk: 0.4 },
  Bangalore: { base: 100, weatherRisk: 0.5,  pollutionRisk: 0.55, floodRisk: 0.2 },
  Chennai:   { base: 115, weatherRisk: 0.75, pollutionRisk: 0.4,  floodRisk: 0.65 },
  Hyderabad: { base: 105, weatherRisk: 0.55, pollutionRisk: 0.5,  floodRisk: 0.35 },
  Pune:      { base: 95,  weatherRisk: 0.6,  pollutionRisk: 0.4,  floodRisk: 0.3  },
  Kolkata:   { base: 108, weatherRisk: 0.7,  pollutionRisk: 0.6,  floodRisk: 0.6  },
};

/**
 * Zone-level safety adjustments (historical waterlogging & curfew data)
 * Negative = safer zone (discount), Positive = risky zone (surcharge)
 */
const ZONE_ADJUSTMENTS = {
  Central:  0.0,
  North:    0.05,
  South:   -0.05,
  East:     0.08,
  West:    -0.03,
  Suburbs:  0.10,
};

/**
 * Platform risk factor — delivery segment affects disruption exposure
 */
const PLATFORM_RISK = {
  Zomato:   1.05,  // Peak rain = highest food delivery drop
  Swiggy:   1.05,
  Zepto:    1.12,  // Q-commerce operates in extreme conditions
  Blinkit:  1.10,
  Amazon:   0.95,  // E-commerce has more indoor pickup
  Flipkart: 0.95,
  Dunzo:    1.08,
};

/**
 * Simulated ML model: Gradient Boosted decision tree outputs
 * Inputs: city, zone, platform, avg_weekly_income, historical_claims
 * Output: recommended weekly premium with breakdown
 */
const calculatePremium = ({ city, zone, platform, avgWeeklyIncome, historicalClaims = 0 }) => {
  const cityData = CITY_BASE_RISK[city] || CITY_BASE_RISK['Mumbai'];
  const basePremium = cityData.base;

  // ── Risk Factor 1: Weather Risk (monsoon / extreme heat intensity) ──────────
  const weatherFactor = 1 + (cityData.weatherRisk * 0.3);

  // ── Risk Factor 2: Pollution Risk (AQI-based coverage adjustment) ──────────
  const pollutionFactor = 1 + (cityData.pollutionRisk * 0.15);

  // ── Risk Factor 3: Zone-level historical disruption ───────────────────────
  const zoneAdj = ZONE_ADJUSTMENTS[zone] || 0;
  const zoneFactor = 1 + zoneAdj;

  // ── Risk Factor 4: Platform delivery segment ──────────────────────────────
  const platformFactor = PLATFORM_RISK[platform] || 1.0;

  // ── Risk Factor 5: Historical claims (fraud / moral hazard penalty) ────────
  const historyFactor = 1 + Math.min(historicalClaims * 0.045, 0.40);

  // ── Income-proportional coverage floor ────────────────────────────────────
  const incomeBasedPremium = avgWeeklyIncome * 0.045;

  // ── Final ML-weighted premium ──────────────────────────────────────────────
  const rawPremium = (basePremium * weatherFactor * pollutionFactor * zoneFactor * platformFactor * historyFactor);

  // Blend model output with income-based anchor
  const blendedPremium = (rawPremium * 0.65) + (incomeBasedPremium * 0.35);

  // ── Coverage amount = 70% of average weekly income (parametric) ───────────
  const coverageAmount = Math.round(avgWeeklyIncome * 0.70);

  // Round to nearest ₹5
  const weeklyPremium = Math.round(blendedPremium / 5) * 5;

  // Calculate Weighted Risk Score (0-100)
  const riskScore = Math.min(
    Math.round(((weatherFactor + pollutionFactor + zoneFactor + platformFactor + historyFactor - 5) / 1.5) * 100),
    100
  );

  const riskLevel = riskScore > 70 ? 'HIGH' : riskScore > 35 ? 'MEDIUM' : 'LOW';

  return {
    weeklyPremium,
    coverageAmount,
    breakdown: {
      basePremium: Math.round(basePremium),
      weatherFactor: +weatherFactor.toFixed(3),
      pollutionFactor: +pollutionFactor.toFixed(3),
      zoneFactor: +zoneFactor.toFixed(3),
      platformFactor: +platformFactor.toFixed(3),
      historyFactor: +historyFactor.toFixed(3),
    },
    riskScore,
    riskLevel,
    recommendation: riskLevel === 'LOW' ? 'Low Risk — High Value Coverage' :
                    riskLevel === 'MEDIUM' ? 'Moderate Risk — Highly Recommended' :
                    'High Risk Zone — Critical Protection Required',
  };
};

module.exports = { calculatePremium };
