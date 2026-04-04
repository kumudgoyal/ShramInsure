// index.js — ShramInsure Phase 3 Backend Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString().slice(11,19)}] ${req.method} ${req.path}`);
    next();
  });
}

const startServer = async () => {
  const { initDb } = require('./config/database');
  await initDb();

  // Routes loaded AFTER db is ready
  app.use('/api/auth',       require('./routes/auth'));
  app.use('/api/policies',   require('./routes/policies'));
  app.use('/api/claims',     require('./routes/claims'));
  app.use('/api/analytics',  require('./routes/analytics'));
  app.use('/api/risk',       require('./routes/risk'));
  app.use('/api/predict',    require('./routes/predict'));
  app.use('/api/simulate',   require('./routes/simulate'));
  app.use('/api/fraud',      require('./routes/fraud'));

  app.get('/api/health', (_req, res) => res.json({
    status: 'ok',
    service: 'ShramInsure API v3.0',
    features: ['AI Risk Engine','Zero-Touch Claims','Fraud Detection','Income Predictor','Simulation Engine','Accidental Cover'],
    timestamp: new Date().toISOString(),
  }));

  app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  });

  app.listen(PORT, () => {
    console.log('\n🛡️  ShramInsure API v3.0 → http://localhost:' + PORT);
    console.log('🧠  AI Risk Engine : POST /api/risk/calculate');
    console.log('🌦️  Income Predictor: GET  /api/predict/loss');
    console.log('🎯  Simulations    : POST /api/simulate/rain | /api/simulate/pollution');
    console.log('👤  Demo worker    : phone=9876543210');
    console.log('🔑  Admin          : phone=9999999999\n');
  });
};

startServer().catch(err => { console.error('Startup error:', err); process.exit(1); });
