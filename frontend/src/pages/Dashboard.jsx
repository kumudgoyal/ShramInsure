import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { StaticBike, MovingBikeStrip } from '../components/BikeGraphic';

const SEV = { critical:'#ef4444', high:'#f97316', medium:'#eab308', low:'#3b82f6' };
const STATUS_COLOR = {
  paid:     { bg:'rgba(0,255,135,0.07)',  border:'rgba(0,255,135,0.18)',  text:'#00ff87' },
  approved: { bg:'rgba(59,130,246,0.07)', border:'rgba(59,130,246,0.18)', text:'#60a5fa' },
  pending:  { bg:'rgba(234,179,8,0.07)',  border:'rgba(234,179,8,0.18)',  text:'#facc15' },
  rejected: { bg:'rgba(239,68,68,0.07)',  border:'rgba(239,68,68,0.18)',  text:'#f87171' },
};
const TRIGGER_EMOJI = { WEATHER_RAIN:'🌧', WEATHER_HEAT:'🌡', POLLUTION_AQI:'💨', WEATHER_STORM:'⛈', CIVIL_CURFEW:'🚫', FLOOD_ALERT:'🌊' };
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
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const runScan = async () => {
    setScanning(true);
    try {
      const { data } = await api.post('/claims/trigger-check', {});
      if (data.triggersDetected===0) toast('No active disruptions right now.', {icon:'✅'});
      else { toast.success(`${data.triggersDetected} disruption(s) — ${data.claimsCreated} claim(s) auto-filed.`); fetchAll(); }
    } catch { toast.error('Scan failed'); }
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
    <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }} style={{ padding:'28px 32px', maxWidth:1140 }}>

      {/* ── HERO HEADER ── */}
      <div style={{ marginBottom:26, padding:'24px 28px', borderRadius:14, background:'var(--surface-1)', border:'1px solid var(--border)', position:'relative', overflow:'hidden' }}>
        {/* Big faded bike BG */}
        <div style={{ position:'absolute', right:-20, top:'50%', transform:'translateY(-50%)', opacity:0.06, pointerEvents:'none' }}>
          <StaticBike size={220} color="#00ff87"/>
        </div>
        <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div className="font-mono" style={{ fontSize:10, color:'var(--text-muted)', letterSpacing:'0.14em', marginBottom:6 }}>WORKER DASHBOARD</div>
            <h1 className="font-syne" style={{ fontSize:30, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.1, color:'var(--text-primary)' }}>
              Good {greet()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:6 }}>{user?.platform} Partner · {user?.city}, {user?.zone} Zone</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
            <button onClick={runScan} disabled={scanning} style={{
              display:'flex', alignItems:'center', gap:8, padding:'11px 22px', borderRadius:9,
              background:scanning?'var(--surface-3)':'var(--green)',
              color:scanning?'var(--text-muted)':'#000',
              border:'none', cursor:scanning?'not-allowed':'pointer',
              fontSize:13, fontWeight:700, fontFamily:'inherit', transition:'all 0.15s', opacity:scanning?0.6:1,
            }}>
              <span style={{ display:'inline-block', animation:scanning?'wheelSpin 1s linear infinite':'none' }}>⚡</span>
              {scanning ? 'Scanning…' : 'Trigger Scan'}
            </button>
            {/* DEVTrails badge */}
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:6, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.18)' }}>
              <span style={{ fontSize:12 }}>🏆</span>
              <span className="font-mono" style={{ fontSize:9, color:'#f59e0b', letterSpacing:'0.08em' }}>DEVTrails 2026 · Phase 2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert banner */}
      <AnimatePresence>
        {triggered.length > 0 && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
            style={{ marginBottom:20, padding:'14px 18px', borderRadius:10, background:'rgba(249,115,22,0.07)', border:'1px solid rgba(249,115,22,0.2)', display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:22 }}>⚠️</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#fb923c' }}>Active Disruptions in {user?.city}</div>
              <div style={{ fontSize:12, color:'rgba(251,146,60,0.65)', marginTop:3 }}>{triggered.map(t=>t.label).join(' · ')} — Claims may be auto-triggered</div>
            </div>
            {!policy && (
              <button onClick={()=>navigate('/policies')} style={{ padding:'8px 16px', borderRadius:7, background:'#f97316', border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                Get Covered
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label:'Earnings Protected', value:`₹${(stats.earningsProtected||0).toLocaleString('en-IN')}`, sub:'This month', accent:'var(--green)' },
          { label:'Total Payouts', value:`₹${(stats.totalPayout||0).toLocaleString('en-IN')}`, sub:'Lifetime', accent:'#60a5fa' },
          { label:'Total Claims', value:stats.totalClaims||0, sub:`${stats.paidClaims||0} approved & paid`, accent:'#a78bfa' },
          { label:'Wallet Balance', value:`₹${Number(user?.wallet_balance||0).toFixed(0)}`, sub:'Available', accent:'#fbbf24' },
        ].map((s,i) => (
          <motion.div key={i} whileHover={{y:-2}} style={{ padding:'18px 20px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)', cursor:'default', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:s.accent, opacity:0.8 }}/>
            <div className="font-syne" style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.02em', color:'var(--text-primary)', lineHeight:1, marginTop:4 }}>{s.value}</div>
            <div style={{ fontSize:12, fontWeight:500, color:'var(--text-secondary)', marginTop:8 }}>{s.label}</div>
            <div className="font-mono" style={{ fontSize:10, color:'var(--text-muted)', marginTop:3 }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── AI RISK + PREDICTION STRIP ── */}
      {(risk !== null || prediction !== null) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

          {/* AI Risk Score */}
          {risk && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
              style={{ padding:'18px 20px', borderRadius:12, background:'var(--surface-1)', border:`1px solid ${risk.riskLevel==='HIGH'?'rgba(248,113,113,0.2)':risk.riskLevel==='MEDIUM'?'rgba(250,204,21,0.15)':'rgba(0,255,135,0.12)'}` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div>
                  <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:3 }}>AI Risk Score · Live</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>Your Risk Intelligence</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  {(() => {
                    const pct = Math.round((risk.riskScore||0)*100);
                    const col = pct>70?'#f87171':pct>40?'#facc15':'#00ff87';
                    return (
                      <div>
                        <div style={{ position:'relative', width:52, height:52 }}>
                          <svg viewBox="0 0 36 36" style={{ width:52, height:52, transform:'rotate(-90deg)' }}>
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e1e1e" strokeWidth="3"/>
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke={col} strokeWidth="3"
                              strokeDasharray={`${pct} 100`} strokeLinecap="round"/>
                          </svg>
                          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <span className="font-syne" style={{ fontSize:12, fontWeight:800, color:col }}>{pct}</span>
                          </div>
                        </div>
                        <div className="font-mono" style={{ fontSize:8, color:col, letterSpacing:'0.08em', marginTop:2 }}>{risk.riskLevel}</div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                {(risk.factors||[]).slice(0,3).map((f,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:12 }}>{f.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontSize:11, color:'var(--text-secondary)' }}>{f.name}</span>
                        <span className="font-mono" style={{ fontSize:10, color: f.impact==='high'?'#f87171':f.impact==='low'?'#00ff87':'#facc15' }}>{f.impact}</span>
                      </div>
                      <div style={{ height:2, background:'var(--surface-3)', borderRadius:1, marginTop:3, overflow:'hidden' }}>
                        <div style={{ width:`${Math.min(100,(f.factor-0.9)*200)}%`, height:'100%', background: f.impact==='high'?'#f87171':f.impact==='low'?'#00ff87':'#facc15', borderRadius:1 }}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:12, padding:'8px 10px', borderRadius:7, background:'var(--surface-2)', border:'1px solid var(--border)' }}>
                <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', marginBottom:2 }}>Weekly Premium</div>
                <div className="font-syne" style={{ fontSize:18, fontWeight:800, color:'var(--text-primary)' }}>₹{risk.weeklyPremium}<span style={{ fontSize:11, fontWeight:400, color:'var(--text-muted)' }}>/week</span></div>
              </div>
            </motion.div>
          )}

          {/* Income Predictor */}
          {prediction && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
              style={{ padding:'18px 20px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div>
                  <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:3 }}>Income Loss Predictor</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>Next 24h Outlook</div>
                </div>
                <div style={{
                  padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight:700,
                  background: prediction.risk24h>70?'rgba(248,113,113,0.1)':prediction.risk24h>40?'rgba(250,204,21,0.1)':'rgba(0,255,135,0.07)',
                  border:`1px solid ${prediction.risk24h>70?'rgba(248,113,113,0.3)':prediction.risk24h>40?'rgba(250,204,21,0.3)':'rgba(0,255,135,0.2)'}`,
                  color:prediction.risk24h>70?'#f87171':prediction.risk24h>40?'#facc15':'#00ff87',
                }}>{prediction.risk24h}% risk</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {[
                  { label:'Loss Today', val:`₹${prediction.estimatedLoss24h}`, accent:'#f87171' },
                  { label:'7-Day Est.', val:`₹${prediction.totalWeeklyLoss}`, accent:'#fb923c' },
                ].map((k,i) => (
                  <div key={i} style={{ padding:'10px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)' }}>
                    <div className="font-syne" style={{ fontSize:18, fontWeight:800, color:k.accent }}>{k.val}</div>
                    <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:3 }}>{k.label}</div>
                  </div>
                ))}
              </div>
              {(prediction.disruptions||[]).slice(0,2).map((d,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, padding:'7px 10px', borderRadius:7,
                  background:d.active?'rgba(248,113,113,0.06)':'var(--surface-2)', border:`1px solid ${d.active?'rgba(248,113,113,0.18)':'var(--border)'}` }}>
                  <span>{d.icon}</span>
                  <span style={{ fontSize:11, color: d.active?'#f87171':'var(--text-secondary)', flex:1 }}>{d.label}</span>
                  <span className="font-mono" style={{ fontSize:9, color:'var(--text-muted)' }}>{Math.round(d.impact*100)}% impact</span>
                  {d.active && <span className="font-mono" style={{ fontSize:8, color:'#f87171', background:'rgba(248,113,113,0.1)', padding:'1px 5px', borderRadius:3 }}>LIVE</span>}
                </div>
              ))}
              <button onClick={()=>navigate('/simulate')} style={{ marginTop:8, width:'100%', padding:'8px', borderRadius:7,
                background:'rgba(0,255,135,0.06)', border:'1px solid rgba(0,255,135,0.15)',
                color:'var(--green)', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                Run Simulation →
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Policy + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        {/* Policy card */}
        <div style={{ padding:'20px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', bottom:-10, right:-10, opacity:0.07 }}>
            <StaticBike size={100} color="#00ff87"/>
          </div>
          <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:14 }}>Active Policy</div>
          {policy ? (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <span className="font-mono" style={{ fontSize:12, color:'var(--green)' }}>{policy.policy_number}</span>
                <span className="font-mono" style={{ fontSize:9, padding:'3px 8px', borderRadius:4, background:'rgba(0,255,135,0.08)', border:'1px solid rgba(0,255,135,0.18)', color:'var(--green)', letterSpacing:'0.06em' }}>LIVE</span>
              </div>
              {[
                ['Weekly Premium', `₹${policy.weekly_premium}`],
                ['Coverage', `₹${(policy.coverage_amount||0).toLocaleString('en-IN')}`],
                ['Expires', new Date(policy.end_date).toLocaleDateString('en-IN')],
                ['Risk Score', `${(policy.risk_score*100).toFixed(0)}%`],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:10, marginBottom:10, borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{k}</span>
                  <span className="font-mono" style={{ fontSize:12, color:'var(--text-primary)', fontWeight:700 }}>{v}</span>
                </div>
              ))}
              <div style={{ height:2, background:'var(--surface-3)', borderRadius:1, marginTop:4, overflow:'hidden' }}>
                <motion.div initial={{width:0}}
                  animate={{width:`${Math.max(5,((new Date(policy.end_date)-new Date())/(new Date(policy.end_date)-new Date(policy.start_date)))*100).toFixed(0)}%`}}
                  transition={{duration:1.2, delay:0.3}}
                  style={{ height:'100%', background:'var(--green)', borderRadius:1 }}/>
              </div>
              <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', marginTop:5 }}>Coverage remaining</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'24px 0', gap:12 }}>
              <div style={{ fontSize:36 }}>🛡️</div>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>No Active Policy</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>AI-priced coverage for your zone</div>
              <button onClick={()=>navigate('/policies')} style={{ padding:'9px 18px', borderRadius:8, background:'var(--green)', border:'none', color:'#000', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Get Covered
              </button>
            </div>
          )}
        </div>

        {/* Chart */}
        <div style={{ padding:'20px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <div>
              <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase' }}>Weekly Activity</div>
              <div style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', marginTop:4 }}>Earnings Protection History</div>
            </div>
            <span className="font-mono" style={{ fontSize:10, color:'var(--text-muted)' }}>7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={155}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff87" stopOpacity={0.18}/>
                  <stop offset="95%" stopColor="#00ff87" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{fill:'#404040',fontSize:10,fontFamily:'Space Mono'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#404040',fontSize:10,fontFamily:'Space Mono'}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v}`}/>
              <Tooltip contentStyle={{background:'#101010',border:'1px solid #222',borderRadius:8,color:'#f0f0f0',fontSize:12,fontFamily:'Space Mono'}} formatter={v=>[`₹${v}`,'Protected']}/>
              <Area type="monotone" dataKey="amount" stroke="#00ff87" strokeWidth={1.5} fill="url(#ag)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live environment */}
      {env && (
        <div style={{ padding:'20px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div className="live-dot"/>
              <div>
                <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase' }}>Live Environment Monitor</div>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginTop:1 }}>{env.city} — Parametric Trigger Status</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span className="font-mono" style={{ fontSize:9, color:'var(--text-muted)' }}>5 automated triggers · Mock API</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon:'🌧', label:'Rainfall', val:`${env.weather?.rainfall?.toFixed(1)||0} mm/hr`, thresh:65, actual:env.weather?.rainfall||0, trigger:'WEATHER_RAIN' },
              { icon:'🌡', label:'Temperature', val:`${env.weather?.temp?.toFixed(1)||0}°C`, thresh:42, actual:env.weather?.temp||0, trigger:'WEATHER_HEAT' },
              { icon:'💨', label:'AQI Index', val:env.aqi||0, thresh:200, actual:env.aqi||0, trigger:'POLLUTION_AQI' },
              { icon:'🌬', label:'Wind Speed', val:`${env.weather?.windSpeed?.toFixed(0)||0} km/h`, thresh:50, actual:env.weather?.windSpeed||0, trigger:'WEATHER_STORM' },
            ].map(({icon,label,val,thresh,actual,trigger}) => {
              const breach = actual >= thresh;
              const pct = Math.min(100,(actual/thresh)*100);
              return (
                <div key={label} style={{
                  padding:'14px', borderRadius:10,
                  background:breach?'rgba(239,68,68,0.05)':'var(--surface-2)',
                  border:`1px solid ${breach?'rgba(239,68,68,0.18)':'var(--border)'}`,
                }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:20 }}>{icon}</span>
                    {breach && <span className="font-mono" style={{ fontSize:8, color:'#f87171', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', padding:'2px 6px', borderRadius:3, letterSpacing:'0.06em' }}>TRIGGER</span>}
                  </div>
                  <div className="font-syne" style={{ fontSize:19, fontWeight:700, color:breach?'#f87171':'var(--text-primary)', marginBottom:3 }}>{val}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:8 }}>{label}</div>
                  {/* Progress bar */}
                  <div style={{ height:2, background:'var(--surface-3)', borderRadius:1, overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:breach?'#ef4444':'var(--green)', borderRadius:1, transition:'width 0.5s' }}/>
                  </div>
                  <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', marginTop:4 }}>Threshold: {thresh}</div>
                </div>
              );
            })}
          </div>
          {triggered.length > 0 && (
            <div style={{ marginTop:14, display:'flex', flexWrap:'wrap', gap:8 }}>
              {triggered.map((t,i) => (
                <span key={i} className="font-mono" style={{ fontSize:10, padding:'4px 10px', borderRadius:5, letterSpacing:'0.06em', background:`${SEV[t.severity]||'#555'}18`, border:`1px solid ${SEV[t.severity]||'#555'}40`, color:SEV[t.severity]||'#888' }}>⚡ {t.label}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bike strip + AI pricing info */}
      <div style={{ marginBottom:20, padding:'16px 20px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div>
            <div className="font-mono" style={{ fontSize:9, color:'var(--green)', letterSpacing:'0.14em', textTransform:'uppercase' }}>Dynamic Premium Engine</div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginTop:3 }}>AI pricing based on your zone, platform & historical data</div>
          </div>
          <button onClick={()=>navigate('/policies')} style={{ padding:'8px 16px', borderRadius:7, background:'rgba(0,255,135,0.08)', border:'1px solid rgba(0,255,135,0.18)', color:'var(--green)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            View Policies →
          </button>
        </div>
        <MovingBikeStrip/>
      </div>

      {/* Recent claims */}
      {recentClaims.length > 0 && (
        <div style={{ padding:'20px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase' }}>Recent Claims</div>
            <button onClick={()=>navigate('/claims')} style={{ fontSize:12, color:'var(--green)', background:'none', border:'none', cursor:'pointer', fontFamily:'monospace' }}>View all →</button>
          </div>
          {recentClaims.map((c,i) => {
            const sc = STATUS_COLOR[c.status] || STATUS_COLOR.pending;
            return (
              <div key={c.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:i<recentClaims.length-1?'1px solid var(--border)':'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:38, height:38, borderRadius:9, background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{TRIGGER_EMOJI[c.trigger_type]||'⚡'}</div>
                  <div>
                    <div className="font-mono" style={{ fontSize:11, fontWeight:700, color:'var(--text-primary)' }}>{c.claim_number}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{fmt(c.trigger_type)} · {new Date(c.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span className="font-mono" style={{ fontSize:9, padding:'3px 8px', borderRadius:4, background:sc.bg, border:`1px solid ${sc.border}`, color:sc.text, letterSpacing:'0.06em', textTransform:'uppercase' }}>{c.status}</span>
                  <span className="font-syne" style={{ fontSize:17, fontWeight:700, color:'var(--text-primary)' }}>₹{c.payout_amount?.toFixed(0)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div style={{ padding:'28px 32px' }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height:80, background:'var(--surface-2)', borderRadius:12, marginBottom:14, opacity:1-i*0.2 }}/>
      ))}
    </div>
  );
}
