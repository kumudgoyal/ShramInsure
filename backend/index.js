const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors());
app.use(express.json());

// Helper function to handle database queries
const runQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const getQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// 1. Signup Endpoint
app.post('/api/auth/register', async (req, res) => {
  const { phone, platform_id, aadhaar_last4 } = req.body;

  if (!phone || !platform_id) {
    return res.status(400).json({ error: 'Phone and Platform ID are required.' });
  }

  try {
    const query = `INSERT INTO users (phone, platform_id, aadhaar_last4) VALUES (?, ?, ?)`;
    const result = await runQuery(query, [phone, platform_id, aadhaar_last4]);
    // Get the created user
    db.get('SELECT id, phone, platform_id FROM users WHERE id = ?', [result.lastID], (err, user) => {
      if (err) return res.status(500).json({ error: 'Failed to retrieve user after registration' });

      // Create JWT token for auto-login
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
      res.status(201).json({ 
        message: 'Registration successful',
        token,
        user
      });
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Phone or Platform ID already exists.' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Request OTP Endpoint
app.post('/api/auth/request-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  try {
    const user = await getQuery(`SELECT * FROM users WHERE phone = ?`, [phone]);
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sign up first.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5-minute expiry

    await runQuery(`UPDATE users SET otp = ?, otp_expiry = ? WHERE phone = ?`, [otp, expiry, phone]);

    // MOCK: In a real app, send OTP via SMS. For now, we'll log it and send it back for testing.
    console.log(`OTP for ${phone}: ${otp}`);
    res.json({ message: 'OTP sent successfully!', otp }); // Send OTP back for easy testing
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Login/Verify OTP Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { phone, otp, bypass_otp } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone is required.' });
  }

  try {
    const user = await getQuery(`SELECT * FROM users WHERE phone = ?`, [phone]);
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sign up first.' });
    }

    if (!otp || user.otp !== otp || new Date(user.otp_expiry) < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired OTP.' });
    }
    // Clear local OTP after successful login
    await runQuery(`UPDATE users SET otp = NULL, otp_expiry = NULL WHERE phone = ?`, [phone]);

    const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login successful!', token, user: { phone: user.phone, platform_id: user.platform_id } });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
