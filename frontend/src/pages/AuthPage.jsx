import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { RidingBike, MovingBikeStrip } from '../components/BikeGraphic';

const CITIES    = ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Pune','Kolkata'];
const ZONES     = ['Central','North','South','East','West','Suburbs'];
const PLATFORMS = ['Zomato','Swiggy','Zepto','Blinkit','Amazon','Flipkart','Dunzo'];

const Field = ({ label, hint, ...props }) => (
  <div style={{ marginBottom:14 }}>
    <label className="font-mono" style={{ display:'block', fontSize:9, color:'#505050', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:7 }}>{label}</label>
    <input {...props} style={{
      width:'100%', padding:'11px 14px', borderRadius:8,
      background:'#111', border:'1px solid #222', color:'#f0f0f0',
      fontSize:14, fontFamily:'DM Sans, sans-serif', outline:'none', transition:'border-color 0.15s',
    }}
      onFocus={e => e.target.style.borderColor='#00ff87'}
      onBlur={e => e.target.style.borderColor='#222'}
    />
    {hint && <div className="font-mono" style={{ fontSize:10, color:'#404040', marginTop:5 }}>{hint}</div>}
  </div>
);

const SelectF = ({ label, options, ...props }) => (
  <div style={{ marginBottom:14 }}>
    <label className="font-mono" style={{ display:'block', fontSize:9, color:'#505050', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:7 }}>{label}</label>
    <div style={{ position:'relative' }}>
      <select {...props} style={{
        width:'100%', padding:'11px 36px 11px 14px', borderRadius:8,
        background:'#111', border:'1px solid #222', color:'#f0f0f0',
        fontSize:14, fontFamily:'DM Sans, sans-serif', outline:'none', appearance:'none', cursor:'pointer',
      }}
        onFocus={e => e.target.style.borderColor='#00ff87'}
        onBlur={e => e.target.style.borderColor='#222'}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="10" height="6" viewBox="0 0 10 6" fill="none">
        <path d="M1 1l4 4 4-4" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  </div>
);

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(1);
  const [phone, setPhone]     = useState('');
  const [otp, setOtp]         = useState('');
  const [step, setStep]       = useState(1);
  const [form, setForm] = useState({ name:'', phone:'', platform:'Zepto', platform_id:'', aadhaar_last4:'', city:'Mumbai', zone:'Central', avg_weekly_income:'3500' });
  const { login } = useAuth();
  const navigate  = useNavigate();
  const upd = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async e => {
    e.preventDefault();
    if (step===1) { setStep(2); return; }
    setLoading(true);
    try { const { data } = await api.post('/auth/register', form); login(data.token, data.user); toast.success('Welcome to ShramInsure 🛡️'); navigate('/dashboard'); }
    catch (err) { toast.error(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };
  const handleOtpReq = async e => {
    e.preventDefault(); setLoading(true);
    try { const { data } = await api.post('/auth/request-otp', { phone }); toast.success(`OTP: ${data.otp}`, { duration:15000, icon:'🔐' }); setOtpStep(2); }
    catch (err) { toast.error(err.response?.data?.error || 'Not found'); }
    finally { setLoading(false); }
  };
  const handleVerify = async e => {
    e.preventDefault(); setLoading(true);
    try { const { data } = await api.post('/auth/login', { phone, otp }); login(data.token, data.user); toast.success('Welcome back 👋'); navigate('/dashboard'); }
    catch (err) { toast.error(err.response?.data?.error || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#080808', display:'flex', position:'relative', overflow:'hidden' }}>

      {/* BG radial glow */}
      <div style={{ position:'fixed', top:'-30%', left:'-10%', width:'70vw', height:'70vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(0,255,135,0.04) 0%, transparent 65%)', pointerEvents:'none' }}/>
      <div style={{ position:'fixed', bottom:'-20%', right:'-5%', width:'50vw', height:'50vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(0,200,100,0.03) 0%, transparent 65%)', pointerEvents:'none' }}/>

      {/* ── LEFT PANEL ── */}
      <div style={{
        width:'44%', flexShrink:0, display:'flex', flexDirection:'column',
        background:'#0a0a0a', borderRight:'1px solid #181818',
        padding:'0', position:'relative', overflow:'hidden',
      }}>
        {/* Top corner accent */}
        <div style={{ position:'absolute', top:0, left:0, width:180, height:180, background:'radial-gradient(circle at 0 0, rgba(0,255,135,0.07), transparent 70%)', pointerEvents:'none' }}/>

        <div style={{ padding:'40px 40px 0', flex:1, display:'flex', flexDirection:'column' }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:48 }}>
            <div style={{ width:42, height:42, borderRadius:11, background:'rgba(0,255,135,0.07)', border:'1px solid rgba(0,255,135,0.22)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#00ff87" strokeWidth="1.8" fill="rgba(0,255,135,0.08)"/>
                <path d="M12 22V12M3 7l9 5 9-5" stroke="#00ff87" strokeWidth="1.5"/>
              </svg>
            </div>
            <div>
              <div className="font-syne" style={{ fontSize:20, fontWeight:800, letterSpacing:'-0.02em', color:'#f0f0f0' }}>ShramInsure</div>
              <div className="font-mono" style={{ fontSize:9, color:'#00ff87', letterSpacing:'0.12em', marginTop:2 }}>INCOME PROTECTION · PHASE 3</div>
            </div>
          </div>

          {/* Hero bike + headline */}
          <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:32 }}>
            <div className="animate-float">
              <RidingBike size={110} />
            </div>
            <div>
              <AnimatePresence mode="wait">
                <motion.div key={isLogin?'l':'s'} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.22}}>
                  <div className="font-mono" style={{ fontSize:9, color:'#404040', letterSpacing:'0.14em', marginBottom:8, textTransform:'uppercase' }}>{isLogin?'Sign In':'Join Now'}</div>
                  <h2 className="font-syne" style={{ fontSize:32, fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.1, color:'#f0f0f0' }}>
                    {isLogin ? 'Welcome\nBack.' : 'Protect Your\nIncome.'}
                  </h2>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <p style={{ fontSize:14, color:'#606060', lineHeight:1.65, maxWidth:300, marginBottom:28 }}>
            {isLogin
              ? 'Log in to check your active coverage, zero-touch claims, and live disruption status.'
              : 'AI-powered income protection for India\'s gig delivery workers. Zero paperwork. Auto-claims.'}
          </p>

          {/* Hackathon phase tag */}
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:9, background:'rgba(0,255,135,0.04)', border:'1px solid rgba(0,255,135,0.1)', marginBottom:20 }}>
            <span style={{ fontSize:14 }}>🏆</span>
            <div>
              <div className="font-mono" style={{ fontSize:9, color:'var(--green)', letterSpacing:'0.1em' }}>DEVTRAILS 2026 · PHASE 3</div>
              <div style={{ fontSize:12, color:'#606060', marginTop:2 }}>March 21 – April 4 · "Protect Your Worker"</div>
            </div>
          </div>

          {/* Feature list */}
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { icon:'⚡', label:'Zero-touch auto claims', sub:'Parametric triggers, no forms' },
              { icon:'🤖', label:'AI dynamic pricing', sub:'ML-based weekly premium' },
              { icon:'🔒', label:'Fraud-protected payouts', sub:'Score-based validation' },
              { icon:'🌍', label:'15M+ workers covered', sub:'Zomato · Swiggy · Zepto · Blinkit' },
            ].map(f => (
              <div key={f.label} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, background:'rgba(255,255,255,0.02)', border:'1px solid #1a1a1a' }}>
                <span style={{ fontSize:14, flexShrink:0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#c0c0c0' }}>{f.label}</div>
                  <div style={{ fontSize:11, color:'#505050', marginTop:1 }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Moving bike strip at bottom */}
        <div style={{ marginTop:'auto' }}>
          <MovingBikeStrip />
        </div>

        {/* Toggle button */}
        <div style={{ padding:'20px 40px' }}>
          <button onClick={() => { setIsLogin(!isLogin); setOtpStep(1); setStep(1); }}
            style={{ width:'100%', padding:'11px 20px', borderRadius:8, background:'transparent', border:'1px solid #252525', color:'#707070', fontSize:13, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}
            onMouseEnter={e=>{e.target.style.borderColor='#383838';e.target.style.color='#f0f0f0';}}
            onMouseLeave={e=>{e.target.style.borderColor='#252525';e.target.style.color='#707070';}}>
            {isLogin ? 'New here? Create Account →' : '← Already have an account?'}
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 48px' }}>
        <div style={{ width:'100%', maxWidth:380 }}>
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div key="login" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.22}}>
                <div className="font-mono" style={{ fontSize:10, color:'#404040', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8 }}>Authentication</div>
                <h2 className="font-syne" style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.02em', color:'#f0f0f0', marginBottom:4 }}>Sign In</h2>
                <p style={{ fontSize:13, color:'#606060', marginBottom:28 }}>Enter your registered phone number</p>

                <AnimatePresence mode="wait">
                  {otpStep===1 ? (
                    <motion.form key="s1" onSubmit={handleOtpReq} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                      <div style={{ marginBottom:14 }}>
                        <label className="font-mono" style={{ display:'block', fontSize:9, color:'#505050', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:7 }}>Phone Number</label>
                        <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
                          <span className="font-mono" style={{ position:'absolute', left:14, fontSize:13, color:'#505050', fontWeight:700 }}>+91</span>
                          <input type="tel" required maxLength={10} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="9876543210"
                            style={{ width:'100%', padding:'11px 14px 11px 48px', borderRadius:8, background:'#111', border:'1px solid #222', color:'#f0f0f0', fontSize:14, fontFamily:'Space Mono', outline:'none', transition:'border-color 0.15s' }}
                            onFocus={e=>e.target.style.borderColor='#00ff87'} onBlur={e=>e.target.style.borderColor='#222'}/>
                        </div>
                        <div className="font-mono" style={{ fontSize:10, color:'#404040', marginTop:6 }}>Demo: <span style={{ color:'#00ff87' }}>9876543210</span> or <span style={{ color:'#f59e0b' }}>9999999999</span> (admin)</div>
                      </div>
                      <button type="submit" disabled={loading} style={{ width:'100%', padding:'13px', borderRadius:8, background:loading?'#1a1a1a':'#00ff87', border:'none', color:loading?'#505050':'#000', fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
                        {loading ? 'Sending…' : 'Get OTP →'}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form key="s2" onSubmit={handleVerify} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                      <div style={{ marginBottom:20 }}>
                        <label className="font-mono" style={{ display:'block', fontSize:9, color:'#505050', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:7 }}>Verification Code</label>
                        <input type="text" maxLength={6} required value={otp} onChange={e=>setOtp(e.target.value)} placeholder="······"
                          style={{ width:'100%', padding:'14px', borderRadius:8, background:'#111', border:'1px solid #222', color:'#00ff87', fontSize:28, fontFamily:'Space Mono', textAlign:'center', letterSpacing:'0.5em', outline:'none', transition:'border-color 0.15s' }}
                          onFocus={e=>e.target.style.borderColor='#00ff87'} onBlur={e=>e.target.style.borderColor='#222'}/>
                        <div className="font-mono" style={{ fontSize:10, color:'#404040', marginTop:6, textAlign:'center' }}>Check toast notification for your OTP</div>
                      </div>
                      <button type="submit" disabled={loading} style={{ width:'100%', padding:'13px', borderRadius:8, background:loading?'#1a1a1a':'#00ff87', border:'none', color:loading?'#505050':'#000', fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', marginBottom:10 }}>
                        {loading ? 'Verifying…' : 'Sign In →'}
                      </button>
                      <button type="button" onClick={()=>setOtpStep(1)} style={{ width:'100%', padding:'11px', borderRadius:8, background:'transparent', border:'1px solid #222', color:'#606060', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                        ← Change number
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div key="signup" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.22}}>
                <div className="font-mono" style={{ fontSize:10, color:'#404040', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8 }}>Registration · Step {step}/2</div>
                <h2 className="font-syne" style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.02em', color:'#f0f0f0', marginBottom:16 }}>Create Account</h2>
                <div style={{ height:2, background:'#1a1a1a', borderRadius:1, marginBottom:22, overflow:'hidden' }}>
                  <motion.div animate={{width:step===1?'50%':'100%'}} transition={{duration:0.3}} style={{ height:'100%', background:'#00ff87', borderRadius:1 }}/>
                </div>
                <form onSubmit={handleSignup}>
                  {step===1 ? (
                    <>
                      <Field label="Full Name" name="name" value={form.name} onChange={upd} placeholder="Ravi Kumar" required/>
                      <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={upd} placeholder="9876543210" required maxLength={10}/>
                      <Field label="Aadhaar Last 4" name="aadhaar_last4" value={form.aadhaar_last4} onChange={upd} placeholder="Optional" maxLength={4}/>
                      <Field label="Avg Weekly Income (₹)" name="avg_weekly_income" type="number" value={form.avg_weekly_income} onChange={upd} required/>
                    </>
                  ) : (
                    <>
                      <SelectF label="Platform" name="platform" value={form.platform} onChange={upd} options={PLATFORMS}/>
                      <Field label="Worker / Platform ID" name="platform_id" value={form.platform_id} onChange={upd} placeholder="ZPT-123456" required/>
                      <SelectF label="City" name="city" value={form.city} onChange={upd} options={CITIES}/>
                      <SelectF label="Operating Zone" name="zone" value={form.zone} onChange={upd} options={ZONES}/>
                    </>
                  )}
                  <div style={{ display:'flex', gap:10, marginTop:4 }}>
                    {step===2 && (
                      <button type="button" onClick={()=>setStep(1)} style={{ flex:1, padding:'12px', borderRadius:8, background:'transparent', border:'1px solid #222', color:'#808080', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>← Back</button>
                    )}
                    <button type="submit" disabled={loading} style={{ flex:2, padding:'12px', borderRadius:8, background:loading?'#1a1a1a':'#00ff87', border:'none', color:loading?'#505050':'#000', fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
                      {loading ? 'Processing…' : step===1 ? 'Continue →' : '🛡️ Get Protected'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
