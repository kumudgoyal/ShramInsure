// src/pages/AuthPage.jsx — Q-Commerce Worker Registration + OTP Login
// Searchable all-India city dropdown + geolocation auto-detect
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { auth, detectCity } from '../utils/api';
import CitySelect from '../components/CitySelect';

// ── Q-Commerce platforms only ────────────────────────────────────────────────
const PLATFORMS = ['Zepto', 'Blinkit', 'Instamart', 'Dunzo'];
const ZONES     = ['Central', 'North', 'South', 'East', 'West', 'Suburbs'];



// ── Main Auth Page ────────────────────────────────────────────────────────────
export default function AuthPage() {
  const [tab, setTab]   = useState('login');
  const [step, setStep] = useState('phone');
  const [loading, setLoading]     = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [phone, setPhone]   = useState('');
  const [otp, setOtp]       = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [geoCity, setGeoCity] = useState(null);
  const [form, setForm] = useState({
    name: '', phone: '', platform: 'Zepto', platform_id: '',
    city: 'Mumbai', zone: 'Central', avg_weekly_income: 3500,
  });

  const { login }  = useAuth();
  const navigate   = useNavigate();
  const toast      = useToast();

  // Auto-detect city on mount
  useEffect(() => {
    setGeoLoading(true);
    detectCity().then(city => {
      setGeoLoading(false);
      if (city) { setGeoCity(city); setForm(f => ({ ...f, city })); toast.info(`📍 Location detected: ${city}`); }
    }).catch(() => setGeoLoading(false));
  }, []);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleRequestOtp = async () => {
    if (!/^\d{10}$/.test(phone)) return toast.error('Enter a valid 10-digit phone number');
    setLoading(true);
    try {
      const r = await auth.requestOtp(phone);
      setDemoOtp(r.otp || '');
      setStep('otp');
      toast.success('OTP sent!');
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!otp) return toast.error('Enter your OTP');
    setLoading(true);
    try {
      const r = await auth.login({ phone, otp });
      login(r.token, r.user);
      toast.success(`Welcome back, ${r.user.name}! 🛡️`);
      navigate('/dashboard');
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!form.name || !form.phone || !form.platform_id) return toast.error('Name, phone and Worker ID are required');
    if (!/^\d{10}$/.test(form.phone)) return toast.error('Phone must be 10 digits');
    setLoading(true);
    try {
      const r = await auth.register(form);
      login(r.token, r.user);
      toast.success('Account created! Welcome to ShramInsure 🛡️');
      navigate('/dashboard');
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{
        flex: '0 0 460px', display: 'none', flexDirection: 'column', justifyContent: 'center',
        padding: '3rem 2.5rem', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg,#020c18 0%,#030f0a 100%)',
        borderRight: '1px solid var(--border)',
      }} className="auth-hero">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 60%,rgba(16,185,129,.1) 0%,transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '2.5rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--grad-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>ShramInsure</div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>Q-Commerce Worker Protection</div>
            </div>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '1rem' }}>
            Your income,<br />
            <span style={{ background: 'var(--grad-green)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              protected automatically
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', lineHeight: 1.75, marginBottom: '2rem' }}>
            The moment weather disrupts your delivery — rain, heat, AQI — we detect it and transfer your income protection payout instantly. No forms. No calls. No waiting.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem', marginBottom: '2rem' }}>
            {[
              { icon: '🌧️', label: 'Heavy Rain > 65mm/hr',    action: 'Auto payout within minutes' },
              { icon: '💨', label: 'AQI > 200 (Hazardous)',   action: 'Income protection activated' },
              { icon: '🌡️', label: 'Extreme Heat > 42°C',     action: 'Zero-touch claim triggered' },
              { icon: '🌀', label: 'Storm > 50 km/h winds',    action: 'Auto-approved & paid' },
            ].map(t => (
              <div key={t.label} style={{ display: 'flex', gap: '.8rem', alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{t.icon}</div>
                <div>
                  <div style={{ fontSize: '.82rem', fontWeight: 600 }}>{t.label}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--accent-green)' }}>{t.action}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[{ v: '₹0', l: 'Paperwork' }, { v: '< 5min', l: 'Payout Time' }, { v: '100%', l: 'Automated' }].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-green)' }}>{s.v}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form panel ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }} className="auth-mobile-logo">
            <div style={{ fontSize: '2rem', marginBottom: '.3rem' }}>🛡️</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>ShramInsure</h2>
            <p style={{ fontSize: '.78rem', color: 'var(--text-secondary)' }}>Q-Commerce Delivery Worker Protection</p>
          </div>

          {/* Demo credentials */}
          <div style={{ background: 'rgba(59,130,246,.05)', border: '1px solid rgba(59,130,246,.18)', borderRadius: 'var(--radius-md)', padding: '.65rem 1rem', marginBottom: '1.2rem', fontSize: '.78rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '.3rem' }}>🧪 Demo Access</div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              Worker: <code style={{ background: 'var(--bg-card2)', padding: '1px 6px', borderRadius: 4 }}>9876543210</code>
              &emsp;Admin: <code style={{ background: 'var(--bg-card2)', padding: '1px 6px', borderRadius: 4 }}>9999999999</code>
              <span style={{ color: 'var(--text-muted)' }}> → OTP shown on screen</span>
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 3, marginBottom: '1.2rem' }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setStep('phone'); setOtp(''); setDemoOtp(''); }}
                style={{
                  flex: 1, padding: '.55rem', border: 'none', cursor: 'pointer', borderRadius: 9,
                  fontWeight: 600, fontSize: '.875rem', fontFamily: 'inherit', transition: 'all .2s',
                  background: tab === t ? 'var(--grad-green)' : 'transparent',
                  color: tab === t ? '#fff' : 'var(--text-secondary)',
                  boxShadow: tab === t ? '0 2px 8px rgba(16,185,129,.3)' : 'none',
                }}>
                {t === 'login' ? '🔑 Login' : '📝 Register'}
              </button>
            ))}
          </div>

          {/* ── LOGIN ─────────────────────────────────────────────────── */}
          {tab === 'login' && (
            <div className="card" style={{ animation: 'fadeUp .25s ease' }}>
              {step === 'phone' ? (
                <>
                  <div className="form-group">
                    <label className="label">📱 Mobile Number</label>
                    <input className="input" placeholder="10-digit mobile number" value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10}
                      onKeyDown={e => e.key === 'Enter' && handleRequestOtp()} autoFocus />
                  </div>
                  <button className="btn btn-primary btn-block btn-lg" onClick={handleRequestOtp} disabled={loading || phone.length !== 10}>
                    {loading ? <><span className="spinner" /> Sending OTP…</> : '📲 Get OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '.9rem', padding: '.6rem .9rem', background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.15)', borderRadius: 'var(--radius-sm)', fontSize: '.82rem' }}>
                    OTP sent to <strong>{phone}</strong>
                    {demoOtp && <div style={{ color: 'var(--accent-green)', fontWeight: 700, marginTop: '.3rem', fontSize: '.88rem' }}>Demo OTP: {demoOtp}</div>}
                  </div>
                  <div className="form-group">
                    <label className="label">🔐 Enter OTP</label>
                    <input className="input" placeholder="6-digit OTP" value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} maxLength={6}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()} autoFocus
                      style={{ fontSize: '1.3rem', letterSpacing: '.3rem', textAlign: 'center' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '.75rem' }}>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setStep('phone'); setOtp(''); }}>← Back</button>
                    <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleLogin} disabled={loading || otp.length < 4}>
                      {loading ? <><span className="spinner" /> Verifying…</> : '✅ Login'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── REGISTER ──────────────────────────────────────────────── */}
          {tab === 'register' && (
            <div className="card" style={{ animation: 'fadeUp .25s ease' }}>
              {/* Single persona badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', padding: '.6rem .9rem', background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.18)', borderRadius: 'var(--radius-md)', marginBottom: '1.1rem' }}>
                <span style={{ fontSize: '1.4rem' }}>🛵</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '.88rem' }}>Q-Commerce Delivery Worker</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>Income Loss Only · Weekly Parametric Cover</div>
                </div>
                <span className="badge badge-green" style={{ fontSize: '.62rem' }}>AUTO-CLAIM</span>
              </div>

              <div className="form-group">
                <label className="label">👤 Full Name *</label>
                <input className="input" placeholder="Your full name" value={form.name}
                  onChange={e => f('name', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="label">📱 Phone Number *</label>
                <input className="input" placeholder="10-digit mobile number" value={form.phone} maxLength={10}
                  onChange={e => f('phone', e.target.value.replace(/\D/g, ''))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                <div className="form-group">
                  <label className="label">🛵 Platform *</label>
                  <select className="input" value={form.platform} onChange={e => f('platform', e.target.value)}>
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">🆔 Worker ID *</label>
                  <input className="input" placeholder="e.g. ZPT-RK-001" value={form.platform_id}
                    onChange={e => f('platform_id', e.target.value)} />
                </div>
              </div>

              {/* Searchable city + zone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                <CitySelect value={form.city} onChange={c => f('city', c)} label="City" geoCity={geoCity} geoLoading={geoLoading} />
                <div className="form-group">
                  <label className="label">📍 Zone</label>
                  <select className="input" value={form.zone} onChange={e => f('zone', e.target.value)}>
                    {ZONES.map(z => <option key={z}>{z}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="label">💰 Avg. Weekly Income (₹)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '.9rem' }}>₹</span>
                  <input className="input" type="number" min={500} max={20000} value={form.avg_weekly_income}
                    onChange={e => f('avg_weekly_income', e.target.value)}
                    style={{ paddingLeft: '1.8rem' }} />
                </div>
                <div style={{ marginTop: '.3rem', fontSize: '.72rem', color: 'var(--text-muted)' }}>
                  Coverage = 70% = ₹{Math.round(parseFloat(form.avg_weekly_income || 3500) * 0.7).toLocaleString('en-IN')}/week
                </div>
              </div>

              <div style={{ padding: '.55rem .8rem', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '.74rem', color: 'var(--text-muted)', marginBottom: '.9rem' }}>
                📋 <strong style={{ color: 'var(--text-secondary)' }}>Income Loss Only</strong> · Zero-touch claims · Auto UPI payout on parametric trigger breach
              </div>

              <button className="btn btn-primary btn-block btn-lg" onClick={handleRegister} disabled={loading}>
                {loading ? <><span className="spinner" /> Creating account…</> : '🚀 Create Account — Free'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .auth-hero { display: flex !important; }
          .auth-mobile-logo { display: none !important; }
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
