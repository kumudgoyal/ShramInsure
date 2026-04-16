import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { RidingBike, MovingBikeStrip } from '../components/BikeGraphic';
import { 
  Zap, 
  ChevronDown, 
  ShieldCheck, 
  Key, 
  CheckCircle, 
  Info, 
  Shield, 
  Phone, 
  Lock, 
  User, 
  MapPin, 
  CreditCard, 
  Wallet, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const CITIES    = ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Pune','Kolkata'];
const ZONES     = ['Central','North','South','East','West','Suburbs'];
const PLATFORMS = ['Zomato','Swiggy','Zepto','Blinkit','Amazon','Flipkart','Dunzo'];

const Field = ({ label, hint, ...props }) => (
  <div className="mb-6">
    <label className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest mb-3 block">{label}</label>
    <div className="relative group">
      <input 
        {...props} 
        className="w-full bg-surface-3/50 border border-white/10 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary/50 transition-all placeholder:text-white/10"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity text-primary">
        <Zap size={14} fill="currentColor" />
      </div>
    </div>
    {hint && <div className="font-mono text-[9px] text-text-muted mt-2 font-bold uppercase tracking-tight">{hint}</div>}
  </div>
);

const SelectF = ({ label, options, ...props }) => (
  <div className="mb-6">
    <label className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest mb-3 block">{label}</label>
    <div className="relative group">
      <select 
        {...props} 
        className="w-full bg-surface-3/50 border border-white/10 p-4 rounded-2xl text-sm font-bold text-white appearance-none outline-none focus:border-primary/50 transition-all cursor-pointer"
      >
        {options.map(o => <option key={o} value={o} className="bg-surface-0">{o}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
        <ChevronDown size={14} />
      </div>
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
    try { const { data } = await api.post('/auth/register', form); login(data.token, data.user); toast.success('Welcome to GigShield', { icon: <ShieldCheck className="text-primary" size={20} /> }); navigate('/dashboard'); }
    catch (err) { toast.error(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };
  const handleOtpReq = async e => {
    e.preventDefault(); setLoading(true);
    try { const { data } = await api.post('/auth/request-otp', { phone }); toast.success(`OTP: ${data.otp}`, { duration:15000, icon: <Key className="text-primary" size={20} /> }); setOtpStep(2); }
    catch (err) { toast.error(err.response?.data?.error || 'Not found'); }
    finally { setLoading(false); }
  };
  const handleVerify = async e => {
    e.preventDefault(); setLoading(true);
    try { const { data } = await api.post('/auth/login', { phone, otp }); login(data.token, data.user); toast.success('Welcome back', { icon: <CheckCircle className="text-primary" size={20} /> }); navigate('/dashboard'); }
    catch (err) { toast.error(err.response?.data?.error || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col md:flex-row relative overflow-hidden font-body">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      {/* ── LEFT BRANDING PANEL ── */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] bg-surface-1/40 border-r border-white/5 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(0,255,135,0.08),transparent_50%)]" />
        </div>
        
        <div className="w-full max-w-md px-12 relative z-10">
          {/* Logo Header */}
          <div className="flex items-center gap-4 mb-16">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
               <Shield size={28} fill="currentColor" fillOpacity={0.1} />
            </div>
            <div>
              <div className="font-display text-2xl font-black text-white tracking-tight leading-none">GigShield</div>
              <div className="font-mono text-[9px] text-primary font-black uppercase tracking-[0.2em] mt-1.5">Hyper-Parametric Edge</div>
            </div>
          </div>

          <div className="mb-12">
            <AnimatePresence mode="wait">
              <motion.div 
                key={isLogin?'l':'s'} 
                initial={{ opacity:0, y:20 }} 
                animate={{ opacity:1, y:0 }} 
                exit={{ opacity:0, y:-20 }}
              >
                <div className="font-mono text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-4">Core Protocol v2.5</div>
                <h1 className="font-display text-5xl font-black text-white leading-[1.1] tracking-tighter mb-6">
                  {isLogin ? "Neural\nAccess Node." : "Activate\nIncome Shield."}
                </h1>
                <p className="text-text-secondary text-base font-medium leading-relaxed max-w-sm">
                  {isLogin 
                    ? "Establish a secure connection to your parametric ledger and monitor real-time disruption vectors."
                    : "AI-governed income security for the modern gig economy. Zero paperwork, sub-second settlements."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Value Matrix */}
          <div className="grid grid-cols-1 gap-3 mb-12">
            {[
              { label:'Zero-Touch Settlements', sub:'Parametric automation, no claims process.' },
              { label:'Neural Risk Pricing', sub:'Dynamic HSL-weighted premium sets.' },
            ].map((f, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4 group hover:bg-white/[0.04] transition-all">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_var(--primary)]" />
                <div>
                  <div className="text-sm font-bold text-white mb-0.5">{f.label}</div>
                  <div className="text-[11px] text-text-muted font-medium">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="font-mono text-[9px] text-text-muted font-bold uppercase tracking-widest pl-2">System Interoperability</div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                {PLATFORMS.slice(0,5).map(p => <span key={p} className="font-display text-xs font-black text-white tracking-widest uppercase">{p}</span>)}
            </div>
          </div>
        </div>

        {/* Futuristic Bike Visualization */}
        <div className="absolute bottom-0 left-0 w-full opacity-10">
          <MovingBikeStrip />
        </div>
      </div>

      {/* ── RIGHT AUTH PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 relative">
        <div className="w-full max-w-[400px]">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div key="login" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                <div className="font-mono text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Auth Sequence Initiated
                </div>
                <h2 className="font-display text-3xl font-black text-white mb-2 leading-none">Synchronize Node</h2>
                <p className="text-text-secondary text-sm font-medium mb-12">Authorize access using your registered terminal.</p>

                <AnimatePresence mode="wait">
                  {otpStep===1 ? (
                    <motion.form key="s1" onSubmit={handleOtpReq} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                      <div className="mb-8">
                        <label className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest mb-3 block">Phone Terminal ID</label>
                        <div className="relative group flex items-center">
                          <span className="absolute left-5 font-mono text-sm font-black text-primary">+91</span>
                          <input 
                            type="tel" required maxLength={10} 
                            value={phone} onChange={e=>setPhone(e.target.value)} 
                            placeholder="9876543210"
                            className="w-full bg-surface-3/50 border border-white/10 p-5 pl-16 rounded-[2rem] text-sm font-black text-white outline-none focus:border-primary/50 transition-all font-mono tracking-widest"
                          />
                        </div>
                        <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                          <Info size={18} className="text-primary" />
                          <div className="font-mono text-[9px] text-primary/80 font-bold uppercase leading-relaxed">
                            Debug: <span className="text-white">9876543210</span> (User) <span className="opacity-40">•</span> <span className="text-white">9999999999</span> (Admin)
                          </div>
                        </div>
                      </div>
                      <button 
                        type="submit" disabled={loading} 
                        className="w-full py-5 rounded-[2rem] bg-white text-black text-sm font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-2xl shadow-primary/20 disabled:opacity-50"
                      >
                        {loading ? 'REQUESTING…' : 'DISPATCH OTP →'}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form key="s2" onSubmit={handleVerify} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                      <div className="mb-8">
                        <label className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest mb-3 block">Verification Vector</label>
                        <input 
                          type="text" maxLength={6} required 
                          value={otp} onChange={e=>setOtp(e.target.value)} 
                          placeholder="······"
                          className="w-full bg-surface-3/50 border border-primary/30 p-6 rounded-[2rem] text-4xl font-black text-primary text-center tracking-[0.5em] outline-none focus:border-primary transition-all font-mono"
                        />
                        <div className="font-mono text-[9px] text-text-muted mt-4 font-bold uppercase text-center tracking-widest">Intercept security toast for 6-digit key</div>
                      </div>
                      <button 
                        type="submit" disabled={loading} 
                        className="w-full py-5 rounded-[2rem] bg-primary text-black text-sm font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-3xl shadow-primary/30 mb-4"
                      >
                        {loading ? 'VERIFYING…' : 'AUTHORIZE LOGIN →'}
                      </button>
                      <button 
                        type="button" onClick={()=>setOtpStep(1)} 
                        className="w-full py-2 text-text-muted font-mono text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                      >
                        ← Re-enter Terminal ID
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
                
                <div className="mt-16 pt-8 border-t border-white/[0.04]">
                   <button 
                    onClick={() => { setIsLogin(false); setStep(1); }}
                    className="flex flex-col gap-1 items-start group"
                  >
                    <span className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest">New Node?</span>
                    <span className="text-sm font-bold text-white group-hover:text-primary transition-colors underline decoration-white/10 underline-offset-4">Register Coverage Node →</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="signup" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                <div className="font-mono text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Node Registration {step}/2
                </div>
                <h2 className="font-display text-3xl font-black text-white mb-2 leading-none">Forge Identity</h2>
                <div className="h-1 bg-white/5 rounded-full mb-12 overflow-hidden flex">
                  <motion.div 
                    animate={{ width: step===1 ? '50%' : '100%' }} 
                    className="h-full bg-primary shadow-[0_0_10px_var(--primary)]"
                  />
                </div>

                <form onSubmit={handleSignup} className="space-y-0">
                  {step===1 ? (
                    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
                      <Field label="Full Name" name="name" value={form.name} onChange={upd} placeholder="Ravi Kumar" required/>
                      <Field label="Phone Terminal" name="phone" type="tel" value={form.phone} onChange={upd} placeholder="9876543210" required maxLength={10}/>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Aadhaar Mask" name="aadhaar_last4" value={form.aadhaar_last4} onChange={upd} placeholder="Last 4" maxLength={4}/>
                        <Field label="Weekly Income (₹)" name="avg_weekly_income" type="number" value={form.avg_weekly_income} onChange={upd} required/>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
                      <div className="grid grid-cols-2 gap-4">
                        <SelectF label="Platform" name="platform" value={form.platform} onChange={upd} options={PLATFORMS}/>
                        <Field label="Platform UID" name="platform_id" value={form.platform_id} onChange={upd} placeholder="ZPT-XXXX" required/>
                      </div>
                      <SelectF label="City Infrastructure" name="city" value={form.city} onChange={upd} options={CITIES}/>
                      <SelectF label="Regional Zone" name="zone" value={form.zone} onChange={upd} options={ZONES}/>
                    </motion.div>
                  )}
                  
                  <div className="flex flex-col gap-4 mt-12">
                    <button 
                        type="submit" disabled={loading} 
                        className="w-full py-5 rounded-[2rem] bg-primary text-black text-sm font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-3xl shadow-primary/30"
                    >
                      {loading ? 'PROCESSING…' : step===1 ? 'PROCEED TO NETWORK →' : 'ACTIVATE PROTECTION'}
                    </button>
                    {step===2 && (
                      <button 
                        type="button" onClick={()=>setStep(1)} 
                        className="w-full py-2 text-text-muted font-mono text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                      >
                        ← Back to Identity
                      </button>
                    )}
                  </div>
                </form>

                <div className="mt-16 pt-8 border-t border-white/[0.04]">
                   <button 
                    onClick={() => { setIsLogin(true); }}
                    className="flex flex-col gap-1 items-start group"
                  >
                    <span className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest">Already Protected?</span>
                    <span className="text-sm font-bold text-white group-hover:text-primary transition-colors underline decoration-white/10 underline-offset-4">Synchronize Node Wallet →</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
