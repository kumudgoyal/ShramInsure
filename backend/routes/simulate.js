// routes/simulate.js — Demo simulation triggers
const router = require('express').Router();
const { simulateRain, simulatePollution, simulateCurfew, simulateFlood, simulateHeat, getSimulations } = require('../controllers/simulationController');
const { protect } = require('../middleware/auth');

router.post('/rain',       protect, simulateRain);
router.post('/pollution',  protect, simulatePollution);
router.post('/curfew',     protect, simulateCurfew);
router.post('/flood',      protect, simulateFlood);
router.post('/heat',       protect, simulateHeat);
router.get('/history',     protect, getSimulations);

module.exports = router;
