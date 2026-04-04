import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { StaticBike } from '../components/BikeGraphic';

const PALETTE = ['#00ff87','#60a5fa','#f59e0b','#f87171','#a78bfa','#34d399'];
const TRIGGER_SHORT = { WEATHER_RAIN:'Rain', WEATHER_HEAT:'Heat', POLLUTION_AQI:'AQI', WEATHER_STORM:'Storm', CIVIL_CURFEW:'Curfew', FLOOD_ALERT:'Flood' };
const TRIGGER_EMOJI = { WEATHER_RAIN:'🌧', WEATHER_HEAT:'🌡', POLLUTION_AQI:'💨', WEATHER_STORM:'⛈', CIVIL_CURFEW:'🚫', FLOOD_ALERT:'🌊' };
const ttpStyle = { background:'#101010', border:'1px solid #222', borderRadius:8, color:'#f0f0f0', fontSize:11, fontFamily:'Space Mono' };

export default function AdminPage() {
  const [data, setData]         = useState(null);
  const [claims, setClaims]     = useState([]);
  const [fraudStats, setFraudStats] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [actionL, setActionL]   = useState({});

  const fetchAll = async () => {
    try {
      const [dr, cr, fr] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/claims/admin/all?status=pending'),
        api.get('/fraud/stats').catch(() => null),
      ]);
      setData(dr.data); setClaims(cr.data.claims||[]);
      if (fr) setFraudStats(fr.data);
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const handleClaim = async (id, action) => {
    setActionL(p=>({...p,[id]:true}));
    try { await api.put(`/claims/admin/${id}/${action}`); toast.success(`Claim ${action}d`); fetchAll(); }
    catch { toast.error('Action failed'); }
    finally { setActionL(p=>({...p,[id]:false})); }
  };

  if (loading) return (
    <div style={{ padding:'28px 32px' }}>
      {[1,2,3].map(i=><div key={i} style={{ height:80, background:'var(--surface-2)', borderRadius:12, marginBottom:14 }}/>)}
    </div>
  );

  const s = data?.summary||{};
  const byType = (data?.claimsByType||[]).map((c,i)=>({ name:TRIGGER_SHORT[c.trigger_type]||c.trigger_type, count:c.count, fill:PALETTE[i%PALETTE.length] }));
  const trend  = (data?.claimsTrend||[]).map(t=>({...t, date:t.date?.slice(5)||t.date}));

  return (
    <div style={{ padding:'28px 32px', maxWidth:1200 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <div className="font-mono" style={{ fontSize:10, color:'var(--text-muted)', letterSpacing:'0.14em' }}>ADMIN PANEL</div>
            <span className="font-mono" style={{ fontSize:9, padding:'2px 8px', borderRadius:3, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', color:'#f59e0b', letterSpacing:'0.06em' }}>INSURER VIEW</span>
            <span className="font-mono" style={{ fontSize:9, padding:'2px 8px', borderRadius:3, background:'rgba(0,255,135,0.07)', border:'1px solid rgba(0,255,135,0.18)', color:'var(--green)', letterSpacing:'0.06em' }}>DEVTrails 2026</span>
          </div>
          <h1 className="font-syne" style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.02em', color:'var(--text-primary)', lineHeight:1.1 }}>Risk Analytics</h1>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:6 }}>Fraud detection · Claims management · AI pricing overview · Platform health</p>
        </div>
        <button onClick={fetchAll} style={{ padding:'10px 18px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text-secondary)', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
          ↻ Refresh
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:'Total Workers', val:s.totalUsers||0, sub:'Registered on platform', accent:'#60a5fa' },
          { label:'Active Policies', val:s.activePolicies||0, sub:`₹${(s.totalPremium||0).toFixed(0)}/wk collected`, accent:'var(--green)' },
          { label:'Total Payouts', val:`₹${(s.totalPayouts||0).toLocaleString('en-IN')}`, sub:`Loss ratio: ${((s.lossRatio||0)*100).toFixed(1)}%`, accent:s.lossRatio>0.8?'#f87171':'var(--green)' },
          { label:'Fraud Alerts', val:s.fraudAlerts||0, sub:`${s.pendingClaims||0} pending review`, accent:'#f97316' },
        ].map((k,i)=>(
          <motion.div key={i} whileHover={{y:-2}} style={{ padding:'18px 20px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:k.accent, opacity:0.8 }}/>
            <div className="font-syne" style={{ fontSize:26, fontWeight:800, color:'var(--text-primary)', lineHeight:1, marginTop:4 }}>{k.val}</div>
            <div style={{ fontSize:12, fontWeight:500, color:'var(--text-secondary)', marginTop:8 }}>{k.label}</div>
            <div className="font-mono" style={{ fontSize:10, color:'var(--text-muted)', marginTop:3 }}>{k.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* AI Pricing overview */}
      <div style={{ marginBottom:22, padding:'20px 24px', borderRadius:12, background:'var(--surface-1)', border:'1px solid rgba(0,255,135,0.1)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-20, top:-20, opacity:0.04 }}><StaticBike size={200} color="#00ff87"/></div>
        <div style={{ position:'relative' }}>
          <div className="font-mono" style={{ fontSize:9, color:'var(--green)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:4 }}>AI Dynamic Pricing Model</div>
          <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginBottom:14 }}>Premium Calculation — ML Gradient Boosted Model</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:10 }}>
            {[
              {city:'Mumbai', base:120, risk:'High'},
              {city:'Delhi', base:110, risk:'High'},
              {city:'Bangalore', base:100, risk:'Med'},
              {city:'Chennai', base:115, risk:'High'},
              {city:'Hyderabad', base:105, risk:'Med'},
              {city:'Pune', base:95, risk:'Low'},
              {city:'Kolkata', base:108, risk:'Med'},
            ].map(c=>(
              <div key={c.city} style={{ padding:'10px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)', textAlign:'center' }}>
                <div className="font-syne" style={{ fontSize:16, fontWeight:800, color:'var(--green)' }}>₹{c.base}</div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-primary)', marginTop:3 }}>{c.city}</div>
                <div className="font-mono" style={{ fontSize:9, color: c.risk==='High'?'#f87171':c.risk==='Med'?'#facc15':'var(--green)', marginTop:4 }}>{c.risk} Risk</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:22 }}>
        <div style={{ padding:'20px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)' }}>
          <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:4 }}>Disruption Breakdown</div>
          <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginBottom:18 }}>Claims by Trigger Type</div>
          {byType.length>0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byType}>
                <XAxis dataKey="name" tick={{fill:'#404040',fontSize:10,fontFamily:'Space Mono'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#404040',fontSize:10,fontFamily:'Space Mono'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={ttpStyle}/>
                <Bar dataKey="count" radius={[6,6,0,0]}>{byType.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart/>}
        </div>
        <div style={{ padding:'20px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)' }}>
          <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:4 }}>7-Day Trend</div>
          <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginBottom:18 }}>Volume & Payouts</div>
          {trend.length>0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend}>
                <XAxis dataKey="date" tick={{fill:'#404040',fontSize:10,fontFamily:'Space Mono'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#404040',fontSize:10,fontFamily:'Space Mono'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={ttpStyle}/>
                <Line type="monotone" dataKey="claims" stroke="#00ff87" strokeWidth={1.5} dot={{fill:'#00ff87',r:3}} name="Claims"/>
                <Line type="monotone" dataKey="payout" stroke="#60a5fa" strokeWidth={1.5} dot={{fill:'#60a5fa',r:3}} name="Payout ₹"/>
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart/>}
        </div>
      </div>

      {/* Risk by city */}
      {(data?.riskByCities||[]).length>0 && (
        <div style={{ padding:'20px 24px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)', marginBottom:22 }}>
          <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:4 }}>Geographic Risk Distribution</div>
          <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginBottom:18 }}>Risk Score by City</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:12 }}>
            {data.riskByCities.map((city,i)=>(
              <div key={city.city} style={{ textAlign:'center' }}>
                <div style={{ position:'relative', width:48, height:48, margin:'0 auto 8px' }}>
                  <svg viewBox="0 0 36 36" style={{ width:48, height:48, transform:'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e1e1e" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={PALETTE[i%PALETTE.length]} strokeWidth="3"
                      strokeDasharray={`${(city.avg_risk*100).toFixed(0)} 100`} strokeLinecap="round"/>
                  </svg>
                  <span className="font-mono" style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'var(--text-primary)' }}>
                    {(city.avg_risk*100).toFixed(0)}%
                  </span>
                </div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-primary)' }}>{city.city}</div>
                <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', marginTop:2 }}>{city.policy_count} policies</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fraud alerts */}
      {(data?.recentFraud||[]).length>0 && (
        <div style={{ padding:'20px 24px', borderRadius:12, background:'var(--surface-1)', border:'1px solid rgba(239,68,68,0.15)', marginBottom:22 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <span>🚨</span>
            <div className="font-mono" style={{ fontSize:9, color:'#f87171', letterSpacing:'0.14em', textTransform:'uppercase' }}>Fraud Detection Alerts</div>
          </div>
          {data.recentFraud.map((f,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:i<data.recentFraud.length-1?'1px solid var(--border)':'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>⚠️</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{f.claim_number} — {f.name}</div>
                  <div className="font-mono" style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{f.phone} · {f.trigger_type}</div>
                </div>
              </div>
              <div className="font-syne" style={{ fontSize:16, fontWeight:800, color:'#f87171' }}>{(f.fraud_score*100).toFixed(0)}% risk</div>
            </div>
          ))}
        </div>
      )}

      {/* Fraud Intelligence Panel */}
      {fraudStats && (
        <div style={{ marginBottom:22, padding:'20px 24px', borderRadius:12, background:'var(--surface-1)', border:'1px solid rgba(249,115,22,0.15)' }}>
          <div className="font-mono" style={{ fontSize:9, color:'#f97316', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:14 }}>🔍 Fraud Intelligence Engine</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
            {[
              { label:'Total Claims',     val:fraudStats.totalClaims,                     accent:'#60a5fa' },
              { label:'Flagged Claims',   val:fraudStats.flaggedClaims,                   accent:'#f97316' },
              { label:'Rejected',         val:fraudStats.rejectedClaims,                  accent:'#f87171' },
              { label:'₹ Fraud Saved',    val:`₹${(fraudStats.estimatedSaved||0).toFixed(0)}`, accent:'#00ff87' },
            ].map((k,i) => (
              <div key={i} style={{ padding:'12px 14px', borderRadius:9, background:'var(--surface-2)', border:'1px solid var(--border)' }}>
                <div className="font-syne" style={{ fontSize:22, fontWeight:800, color:k.accent }}>{k.val}</div>
                <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:5 }}>{k.label}</div>
              </div>
            ))}
          </div>
          {fraudStats.topFlags?.length > 0 && (
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', marginBottom:8 }}>Top Fraud Signals</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {fraudStats.topFlags.map((f,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:20,
                    background:'rgba(249,115,22,0.07)', border:'1px solid rgba(249,115,22,0.2)' }}>
                    <span style={{ fontSize:10 }}>⚠️</span>
                    <span className="font-mono" style={{ fontSize:9, color:'#fb923c', letterSpacing:'0.05em' }}>{f.type}</span>
                    <span className="font-mono" style={{ fontSize:9, color:'var(--text-muted)' }}>×{f.count}</span>
                  </div>
                ))}
              </div>
              <div className="font-mono" style={{ fontSize:10, color:'var(--text-muted)', marginTop:8 }}>
                Fraud rate: <span style={{ color: fraudStats.fraudRate > 20 ? '#f87171' : '#facc15' }}>{fraudStats.fraudRate}%</span>
                {' '}· Auto-approved: <span style={{ color:'#00ff87' }}>{fraudStats.autoApprovedClaims}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Claims queue */}
      <div style={{ padding:'20px 24px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:4 }}>Review Queue</div>
            <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>Pending Claims</div>
          </div>
          <span className="font-mono" style={{ fontSize:10, color:'var(--text-muted)' }}>{claims.length} awaiting</span>
        </div>
        {claims.length===0 ? (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <div style={{ fontSize:32, marginBottom:10 }}>✅</div>
            <div style={{ fontSize:14, color:'var(--text-muted)' }}>All clear — no pending claims</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {claims.map(c=>(
              <div key={c.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderRadius:10, background:'var(--surface-2)', border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:'var(--surface-3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{TRIGGER_EMOJI[c.trigger_type]||'⚡'}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{c.claim_number} — {c.name}</div>
                    <div className="font-mono" style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>
                      {c.platform} · {c.city} · Fraud: <span style={{ color:c.fraud_score>0.4?'#f97316':'#00ff87' }}>{(c.fraud_score*100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span className="font-syne" style={{ fontSize:18, fontWeight:800, color:'var(--text-primary)', marginRight:6 }}>₹{c.payout_amount?.toFixed(0)}</span>
                  <button onClick={()=>handleClaim(c.id,'approve')} disabled={actionL[c.id]} style={{ padding:'8px 14px', borderRadius:7, background:'var(--green)', border:'none', color:'#000', fontSize:12, fontWeight:700, cursor:actionL[c.id]?'not-allowed':'pointer', fontFamily:'inherit', opacity:actionL[c.id]?0.5:1 }}>Approve</button>
                  <button onClick={()=>handleClaim(c.id,'reject')} disabled={actionL[c.id]} style={{ padding:'8px 14px', borderRadius:7, background:'transparent', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171', fontSize:12, fontWeight:700, cursor:actionL[c.id]?'not-allowed':'pointer', fontFamily:'inherit', opacity:actionL[c.id]?0.5:1 }}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const EmptyChart = () => (
  <div style={{ height:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', gap:8 }}>
    <span style={{ fontSize:28 }}>📊</span>
    <div style={{ fontSize:11, fontFamily:'Space Mono' }}>No data — trigger disruptions first</div>
  </div>
);
