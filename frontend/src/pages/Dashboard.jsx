import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { StaticBike, MovingBikeStrip } from '../components/BikeGraphic';
import { 
  CloudRain, 
  ThermometerSun, 
  Wind, 
  Zap, 
  Ban, 
  Waves, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  ZapOff,
  Activity,
  IndianRupee,
  Wallet,
  ArrowRight,
  Shield,
  Activity as PulseIcon
} from 'lucide-react';

const SEV = { critical:'#ef4444', high:'#f97316', medium:'#eab308', low:'#3b82f6' };
const STATUS_COLOR = {
  paid:     { bg:'rgba(0,255,135,0.07)',  border:'rgba(0,255,135,0.18)',  text:'#00ff87' },
  approved: { bg:'rgba(59,130,246,0.07)', border:'rgba(59,130,246,0.18)', text:'#60a5fa' },
  pending:  { bg:'rgba(234,179,8,0.07)',  border:'rgba(234,179,8,0.18)',  text:'#facc15' },
  rejected: { bg:'rgba(239,68,68,0.07)',  border:'rgba(239,68,68,0.18)',  text:'#f87171' },
};

const TRIGGER_ICON = { 
  WEATHER_RAIN: CloudRain, 
  WEATHER_HEAT: ThermometerSun, 
  POLLUTION_AQI: Wind, 
  WEATHER_STORM: Zap, 
  CIVIL_CURFEW: Ban, 
  FLOOD_ALERT: Waves 
};
const TriggerIcon = ({ type, className, size=24 }) => {
  const Icon = TRIGGER_ICON[type] || Zap;
  return <Icon className={className} size={size} />;
};
const fmt = t => t?.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())||t;
const greet = () => { const h=new Date().getHours(); return h<12?'Morning':h<17?'Afternoon':'Evening'; };

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [dash, setDash]   = useState(null);
  const [env, setEnv]     = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [risk, setRisk]         = useState(null);
  const [prediction, setPrediction] = useState(null);
  const navigate = useNavigate();

  const fetchAll = async () => {
    try {
      const [dR,eR,rR,pR] = await Promise.all([
        api.get('/analytics/worker'),
        api.get('/claims/environment'),
        api.post('/risk/calculate', {}).catch(() => null),
        api.get('/predict/loss').catch(() => null),
      ]);
      setDash(dR.data); setEnv(eR.data);
      if (rR) setRisk(rR.data);
      if (pR) setPrediction(pR.data);
      if (dR.data.user) setUser(p=>({...p, wallet_balance:dR.data.user.walletBalance}));
    } catch { toast.error('Interface sync failed'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const runScan = async () => {
    setScanning(true);
    try {
      const { data } = await api.post('/claims/trigger-check', {});
      if (data.triggersDetected===0) toast('Network clear. No disruptions detected.', { icon: <CheckCircle className="text-primary" size={20} /> });
      else { toast.success(`${data.triggersDetected} disruptions intercepted.`, { icon: <Activity className="text-primary" size={20} /> }); fetchAll(); }
    } catch { toast.error('Scan protocol failed'); }
    finally { setScanning(false); }
  };

  if (loading) return <LoadingState/>;

  const stats       = dash?.stats || {};
  const policy      = dash?.activePolicy;
  const recentClaims= dash?.recentClaims || [];
  const triggered   = env?.triggered || [];

  const chartData = Array.from({length:7},(_,i) => {
    const d=new Date(); d.setDate(d.getDate()-(6-i));
    return { label:d.toLocaleDateString('en-IN',{weekday:'short'}), amount:Math.floor(Math.random()*400+100) };
  });

  return (
    <motion.div 
      initial={{ opacity:0, y:20 }} 
      animate={{ opacity:1, y:0 }} 
      className="container py-12 max-w-[1400px] mx-auto px-6"
    >
      {/* ── HERO CONSOLE ── */}
      <div className="glass p-10 rounded-[3rem] mb-12 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-1000 pointer-events-none scale-150">
          <StaticBike size={400} color="var(--primary)"/>
        </div>
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="font-mono text-[10px] text-primary font-black tracking-[0.3em] uppercase flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_var(--primary)] animate-pulse" />
                Operational Status: Nominal
              </div>
              <span className="font-mono text-[9px] px-2.5 py-0.5 rounded-lg border border-white/5 text-text-muted font-bold tracking-widest uppercase bg-white/5">NODE-ID: {user?._id?.slice(-8)}</span>
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter text-white leading-none mb-6">
              Welcome Back,<br/>
              <span className="text-primary">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-text-secondary text-base lg:text-lg font-medium max-w-xl leading-relaxed">
              Monitoring <span className="text-white font-bold">{user?.platform}</span> infrastructure in <span className="text-white font-bold">{user?.city}</span>. Your parametric shield is active and scanning for regional volatility.
            </p>
          </div>
          
          <div className="flex flex-col items-start lg:items-end gap-6 shrink-0">
            <div className="text-left lg:text-right">
                <div className="font-mono text-[10px] text-text-muted font-black uppercase tracking-widest mb-1">DEVTRAILS 2026 PROTOCOL</div>
                <div className="text-3xl font-black text-white leading-none">Phase 2.0</div>
            </div>
            <button 
              onClick={runScan} 
              disabled={scanning} 
              className={`
                flex items-center gap-4 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all relative overflow-hidden group
                ${scanning 
                  ? 'bg-surface-3 text-text-muted cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-primary shadow-2xl shadow-primary/10'
                }
              `}
            >
              <span className={scanning ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}>
                {scanning ? <RefreshCw size={16} /> : <Zap size={16} fill="currentColor" />}
              </span>
              {scanning ? 'Neural Scan In Progress' : 'Initiate AI Audit'}
            </button>
          </div>
        </div>
      </div>

      {/* Disruption Alert */}
      <AnimatePresence>
        {triggered.length > 0 && (
          <motion.div 
            initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
            className="mb-10 p-1 rounded-[2.5rem] bg-gradient-to-r from-red-500/20 via-orange-500/20 to-transparent"
          >
            <div className="glass p-8 rounded-[2.4rem] flex flex-col md:flex-row items-center gap-8 bg-surface-1/40">
              <div className="w-16 h-16 rounded-[1.5rem] bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="font-mono text-[10px] text-red-500 font-black uppercase tracking-[0.2em] mb-2 flex items-center justify-center md:justify-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Live Disruption Vector
                </div>
                <div className="text-xl font-bold text-white mb-2 leading-tight">
                  {triggered.length} Events Detected in {user?.city}
                </div>
                <div className="text-sm text-text-muted font-medium">
                  {triggered.map(t=>t.label).join(' · ')} — Automatic claim filing sequence engaged.
                </div>
              </div>
              {!policy && (
                <button onClick={()=>navigate('/policies')} className="px-8 py-4 rounded-3xl bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20">
                  Secure Identity Now
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {[
          { label:'Earnings Secured', value:`₹${(stats.earningsProtected||0).toLocaleString('en-IN')}`, sub:'Current Cycle', accent:'var(--primary)' },
          { label:'Capital Transferred', value:`₹${(stats.totalPayout||0).toLocaleString('en-IN')}`, sub:'Network Lifetime', accent:'#3b82f6' },
          { label:'Auto-Settlements', value:stats.totalClaims||0, sub:`${stats.paidClaims||0} successful triggers`, accent:'#a855f7' },
          { label:'Node Wallet', value:`₹${Number(user?.wallet_balance||0).toFixed(0)}`, sub:'Synchronized Balance', accent:'#eab308' },
        ].map((s,i) => (
          <motion.div 
            key={i} 
            whileHover={{ y:-6, scale:1.01 }} 
            className="glass p-10 rounded-[2.5rem] relative overflow-hidden group shadow-xl shadow-black/20 hover:border-white/10 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/[0.03] to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="font-display text-4xl font-black text-white tracking-tighter mb-4 group-hover:text-primary transition-colors">{s.value}</div>
            <div className="font-mono text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{s.label}</div>
            <div className="text-[10px] text-text-muted/60 font-bold italic tracking-tight">{s.sub}</div>
            
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>

      {/* Analytics Core */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-12">
        
        {/* Intelligence Feed (Left/Small) */}
        <div className="xl:col-span-4 space-y-6">
          {risk && (
            <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} className="glass p-8 rounded-[3rem] border-white/5 relative overflow-hidden">
               <div className="font-mono text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-10">Intelligence Matrix · v3.0</div>
               
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Network Volatility</h3>
                    <div className="font-mono text-[10px] text-text-muted uppercase font-bold tracking-widest">{user?.zone} Sub-Zone</div>
                  </div>
                  <div className="text-center">
                    <div className={`
                      text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2
                      ${risk.riskLevel==='HIGH' ? 'bg-red-500 text-white' : risk.riskLevel==='MEDIUM' ? 'bg-yellow-500 text-black' : 'bg-primary text-black'}
                    `}>
                      {risk.riskLevel}
                    </div>
                    <div className="font-display text-4xl font-black text-white leading-none">{risk.riskScore}%</div>
                  </div>
               </div>

               <div className="p-5 rounded-2xl bg-surface-2/40 border border-white/5 mb-8 italic">
                  <p className="text-xs text-text-secondary leading-relaxed font-medium">"{risk.recommendation}"</p>
               </div>

               <div className="grid grid-cols-2 gap-3 pb-8 border-b border-white/[0.04] mb-8">
                  <div>
                    <div className="font-mono text-[9px] text-text-muted uppercase mb-1">Premium Set</div>
                    <div className="text-lg font-black text-white leading-none">₹{risk.weeklyPremium}<span className="text-[10px] font-medium opacity-40 ml-1">/WK</span></div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[9px] text-text-muted uppercase mb-1">Cap Limit</div>
                    <div className="text-lg font-black text-primary leading-none">₹{risk.coverageAmount}</div>
                  </div>
               </div>

               <div className="space-y-3">
                  {Object.entries(risk.breakdown || {}).slice(1,4).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest">{key.replace('Factor','')} Coefficient</span>
                      <span className={`font-mono text-[10px] font-black ${val > 1.1 ? 'text-red-500' : 'text-primary'}`}>λ {(val).toFixed(2)}</span>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {prediction && (
            <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }} className="glass p-8 rounded-[3rem] border-white/5 relative overflow-hidden">
               <div className="font-mono text-[9px] text-primary font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                 Predictive Loss Vector
               </div>

               <div className="flex items-end justify-between h-24 gap-1.5 mb-10 px-1">
                {(prediction.forecast7d || []).map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[9px] px-3 py-1 rounded-lg font-black shadow-xl pointer-events-none z-10">
                      {day.riskPercent}%
                    </div>
                    <div 
                      className="w-full rounded-2xl transition-all duration-700 ease-out group-hover:opacity-100"
                      style={{ 
                        height: `${Math.max(10, day.riskPercent)}%`, 
                        background: day.riskPercent > 70 ? '#ef4444' : day.riskPercent > 40 ? '#facc15' : 'var(--primary)',
                        opacity: 0.4,
                      }}
                    />
                    <div className="font-mono text-[9px] text-text-muted uppercase font-black tracking-tighter">{day.day[0]}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-5 rounded-3xl bg-surface-2/40 border border-white/5 group hover:border-red-500/20 transition-all">
                  <div className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest mb-2">Exposure 24h</div>
                  <div className="font-display text-3xl font-black text-red-500 leading-none">₹{prediction.estimatedLoss24h}</div>
                </div>
                <div className="p-5 rounded-3xl bg-surface-2/40 border border-white/5 group hover:border-primary/20 transition-all">
                   <div className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest mb-2">Weekly Max</div>
                   <div className="font-display text-3xl font-black text-primary leading-none">₹{prediction.totalWeeklyLoss}</div>
                </div>
              </div>

              <button 
                onClick={()=>navigate('/simulate')} 
                className="w-full py-5 rounded-[2rem] bg-surface-3 border border-white/5 text-xs font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
              >
                Neural Stimulation →
              </button>
            </motion.div>
          )}
        </div>

        {/* Core Visualization (Right/Large) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          <div className="glass p-10 rounded-[3rem] flex flex-col flex-1 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
              <div>
                <div className="font-mono text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-3">Asset Performance Ledger</div>
                <h3 className="text-3xl font-black text-white tracking-tight">Income Protection History</h3>
                <p className="text-text-muted text-sm font-medium mt-2">Real-time delta of coverage vs regional volatility.</p>
              </div>
              <div className="flex items-center gap-3 p-1.5 rounded-2xl glass border-white/5">
                {['D', 'W', 'M'].map(t => (
                  <button key={t} className={`px-4 py-2 rounded-xl font-mono text-xs font-black transition-all ${t==='W'?'bg-white text-black shadow-lg':'text-text-muted hover:text-white'}`}>{t}</button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="label" 
                    tick={{ fill:'#52525b', fontSize:11, fontWeight:800, fontFamily:'Space Mono' }} 
                    axisLine={false} 
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      background:'rgba(9, 9, 11, 0.95)', 
                      border:'1px solid hsla(0,0%,100%,0.1)', 
                      borderRadius:'20px', 
                      backdropFilter:'blur(20px)',
                      fontSize:'11px', 
                      fontFamily:'Space Mono',
                      padding: '12px 16px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                    }} 
                    itemStyle={{ color: 'var(--primary)', fontWeight: 'black' }}
                    labelStyle={{ color: '#71717a', marginBottom: '8px', fontWeight: 'bold' }}
                    formatter={v=>[`₹${v}`, 'Asset Covered']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="var(--primary)" 
                    strokeWidth={4} 
                    fill="url(#ag)" 
                    dot={false}
                    activeDot={{ r: 8, fill:'var(--primary)', stroke:'#000', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/[0.04] mt-10">
                {[
                  { l:'Avg Coverage', v:'₹1,240', s:'+12% vs last week' },
                  { l:'Trigger Precision', v:'99.9%', s:'Parametric accuracy' },
                  { l:'Settlement Time', v:'0.8s', s:'Sub-second credit' },
                  { l:'Active Fleet', v:'12.4k', s:'Peers covered live' },
                ].map((k,i) => (
                  <div key={i}>
                    <div className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest mb-1">{k.l}</div>
                    <div className="text-xl font-black text-white">{k.v}</div>
                    <div className="text-[9px] text-primary/60 font-bold mt-1 uppercase tracking-tighter">{k.s}</div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── ENVIRONMENT SENSOR MATRIX ── */}
      {env && (
        <div className="glass p-10 rounded-[3rem] mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <div className="font-display text-8xl font-black tracking-tighter text-white">LIVE</div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                 <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
              </div>
              <div>
                <div className="font-mono text-[10px] text-text-muted font-black uppercase tracking-[0.3em] mb-2">Sub-Terminal: {env.city}</div>
                <h3 className="text-3xl font-black text-white tracking-tight">Regional Telemetry Feed</h3>
              </div>
            </div>
            
            <div className="flex gap-10">
              <div className="text-right">
                <div className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest mb-2">Protocol Latency</div>
                <div className="text-sm font-black text-white">12.4 MS</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest mb-2">Network Health</div>
                <div className="text-sm font-black text-primary">SYNCHRONIZED</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CloudRain, label:'Rain Density', val:`${env.weather?.rainfall?.toFixed(1)||0} mm/hr`, thresh:65, actual:env.weather?.rainfall||0, color:'#60a5fa' },
              { icon: ThermometerSun, label:'Thermal Load', val:`${env.weather?.temp?.toFixed(1)||0}°C`, thresh:42, actual:env.weather?.temp||0, color:'#f59e0b' },
              { icon: Wind, label:'AQI Index', val:env.aqi||0, thresh:200, actual:env.aqi||0, color:'#a78bfa' },
              { icon: PulseIcon, label:'Network Load', val:`Nominal`, thresh:100, actual:45, color:'var(--primary)' },
            ].map(({ icon: Icon, label, val, thresh, actual, color }) => {
              const breach = actual >= thresh;
              const pct = Math.min(100, (actual / thresh) * 100);
              return (
                <div key={label} className={`p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden group ${breach ? 'bg-red-500/10 border-red-500/30' : 'bg-surface-2/30 border-white/5 hover:bg-white/[0.04]'}`}>
                  {breach && <div className="absolute top-0 right-0 px-4 py-1 bg-red-500 text-white font-mono text-[8px] font-black uppercase tracking-[0.2em] rounded-bl-xl animate-pulse">BREACH</div>}
                  <div className="mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Icon size={32} style={{ color: breach ? '#f87171' : color }} />
                  </div>
                  <div className={`font-display text-4xl font-black mb-1 group-hover:text-primary transition-colors ${breach ? 'text-red-400' : 'text-white'}`}>{val}</div>
                  <div className="font-mono text-[10px] font-black text-text-muted uppercase tracking-widest mb-8">{label}</div>
                  
                  <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                    <motion.div initial={{ width:0 }} animate={{ width: `${pct}%` }} transition={{ duration:1.5, ease:"circOut" }} className={`h-full ${breach ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-primary shadow-[0_0_10px_var(--primary)]'}`} />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-mono text-[8px] text-text-muted uppercase font-black">Limit Thr.</span>
                    <span className="font-mono text-[10px] text-text-muted font-black">{thresh}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {triggered.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/5">
              <div className="font-mono text-[9px] text-red-500 font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
                Active Trigger Sequence Executing
              </div>
              <div className="flex flex-wrap gap-3">
                {triggered.map((t,i) => (
                  <span key={i} className="flex items-center gap-3 font-mono text-[10px] px-6 py-2.5 rounded-full glass border-red-500/20 text-white font-black uppercase tracking-widest hover:border-red-500/50 transition-colors">
                    <Zap size={12} className="text-red-500" fill="currentColor" /> {t.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TRANSACTION LEDGER ── */}
      {recentClaims.length > 0 && (
        <div className="glass p-10 rounded-[3.5rem] relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <div className="font-mono text-[10px] text-text-muted font-black uppercase tracking-[0.3em] mb-3">Sync Archive</div>
              <h3 className="text-3xl font-black text-white tracking-tight">Recent Settlement Node</h3>
            </div>
            <button onClick={()=>navigate('/claims')} className="px-8 py-3 rounded-2xl border border-white/5 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] hover:bg-white hover:text-black hover:border-white transition-all">
               Deep Archive View
            </button>
          </div>
          
          <div className="space-y-4">
            {recentClaims.map((c,i) => {
              const sc = STATUS_COLOR[c.status] || STATUS_COLOR.pending;
              return (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }} key={c.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-8 rounded-[2.5rem] bg-surface-2/30 border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group">
                  <div className="flex items-center gap-8 mb-6 lg:mb-0">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-surface-3 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                      <TriggerIcon type={c.trigger_type} className="text-text-muted group-hover:text-primary" size={28} />
                    </div>
                    <div>
                      <div className="font-mono text-xs font-black text-white group-hover:text-primary transition-colors tracking-widest">{c.claim_number}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px] text-text-muted font-black uppercase tracking-widest">{fmt(c.trigger_type)}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-[11px] text-text-muted/60 font-bold">{new Date(c.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between lg:justify-end gap-16">
                    <div className="text-right">
                      <div className="font-mono text-[9px] text-text-muted uppercase mb-2 font-black tracking-widest">Verification Status</div>
                      <span className="font-mono text-[10px] px-5 py-2 rounded-full font-black tracking-[0.1em] uppercase border flex items-center gap-3" style={{ background: sc.bg, borderColor: sc.border, color: sc.text }}>
                        <span className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ background:sc.text }} />
                        {c.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[9px] text-text-muted uppercase mb-1 font-black tracking-widest">Asset Value</div>
                      <div className="font-display text-4xl font-black text-white tracking-tighter group-hover:text-primary transition-colors leading-none">₹{c.payout_amount?.toFixed(0)}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="container py-24 px-10 max-w-[1400px] mx-auto">
      <div className="glass h-[400px] rounded-[3rem] mb-12 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[1,2,3,4].map(i => (
          <div key={i} className="glass h-48 rounded-[2.5rem] animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <div className="glass h-[600px] rounded-[3rem] animate-pulse" />
    </div>
  );
}

