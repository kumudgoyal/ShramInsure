// routes/geo.js — Geolocation endpoints
'use strict';
const router = require('express').Router();
const { reverseGeocode, CITY_COORDS } = require('../services/triggerMonitor');

/**
 * GET /api/geo/cities — All supported cities with metadata
 */
router.get('/cities', (_req, res) => {
  res.json({ cities: CITY_COORDS });
});

/**
 * GET /api/geo/reverse?lat=&lng= — Reverse geocode → city
 */
router.get('/reverse', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
  try {
    const result = await reverseGeocode(parseFloat(lat), parseFloat(lng));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
