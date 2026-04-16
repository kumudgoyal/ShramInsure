import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { StaticBike } from '../components/BikeGraphic';
import { 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle, 
  BarChart3, 
  CloudRain, 
  ThermometerSun, 
  Wind, 
  Zap, 
  Ban, 
  Waves,
  Activity,
  ShieldCheck,
  Search,
  Eye,
  Lock,
  ArrowRight
} from 'lucide-react';

const PALETTE = ['#00ff87','#60a5fa','#f59e0b','#f87171','#a78bfa','#34d399'];
const TRIGGER_SHORT = { WEATHER_RAIN:'Rain', WEATHER_HEAT:'Heat', POLLUTION_AQI:'AQI', WEATHER_STORM:'Storm', CIVIL_CURFEW:'Curfew', FLOOD_ALERT:'Flood' };
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
    <div className="container py-8 max-w-7xl mx-auto px-6">
      <div className="h-[200px] glass rounded-[2.5rem] animate-pulse mb-8" />
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[1,2,3,4].map(i => <div key={i} className="h-32 glass rounded-2xl animate-pulse" />)}
      </div>
      <div className="h-[400px] glass rounded-[2.5rem] animate-pulse" />
    </div>
  );

  const s = data?.summary||{};
  const byType = (data?.claimsByType||[]).map((c,i)=>({ name:TRIGGER_SHORT[c.trigger_type]||c.trigger_type, count:c.count, fill:PALETTE[i%PALETTE.length] }));
  const trend  = (data?.claimsTrend||[]).map(t=>({...t, date:t.date?.slice(5)||t.date}));

  return (
    <div className="container py-8 max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="font-mono text-[10px] text-text-muted tracking-[0.2em] uppercase">Security Panel</div>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-[#f59e0b44] text-[#f59e0b] font-bold tracking-wider uppercase">Insurer Node</span>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-primary/30 text-primary font-bold tracking-wider uppercase bg-primary/5">DEVTrails 2026</span>
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter text-white leading-none">
            Network Integrity
          </h1>
          <p className="text-text-secondary mt-6 text-base lg:text-lg font-medium max-w-2xl leading-relaxed">
            Real-time telemetry, claim validation, AI pricing oversight, and decentralized platform health metrics.
          </p>
        </div>
        <button 
          onClick={fetchAll} 
          className="glass px-6 py-2.5 rounded-xl text-text-secondary text-sm font-bold flex items-center gap-2 hover:text-white transition-all border-white/5 group"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          Refresh System
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label:'Total Workers', val:s.totalUsers||0, sub:'Registered Nodes', accent:'#60a5fa' },
          { label:'Active Policies', val:s.activePolicies||0, sub:`₹${(s.totalPremium||0).toFixed(0)} Weekly Premium`, accent:'var(--primary)' },
          { label:'Total Payouts', val:`₹${(s.totalPayouts||0).toLocaleString('en-IN')}`, sub:`Loss Ratio: ${s.lossRatio || 0}`, accent:'#a78bfa' },
          { label:'Fraud Alerts', val:s.fraudAlerts||0, sub:`Risk Score: High`, accent:'#f87171' },
        ].map((k,i)=>(
          <motion.div 
            key={i} 
            whileHover={{ y:-6 }} 
            className="glass p-10 rounded-[2.5rem] relative overflow-hidden group shadow-xl shadow-black/20"
          >
            <div className="font-display text-4xl font-black text-white tracking-tighter group-hover:text-primary transition-colors mb-4">{k.val}</div>
            <div className="font-mono text-[9px] text-text-muted uppercase font-black tracking-[0.2em]">{k.label}</div>
            <div className="font-mono text-[8px] text-text-muted mt-2 uppercase tracking-tight font-bold opacity-60">{k.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Fraud Intelligence Panel */}
      {fraudStats && (
        <div className="glass p-10 rounded-[3rem] mb-16 border-[#f9731633] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <ShieldAlert size={180} className="text-white" />
          </div>
          
          <div className="font-mono text-[9px] text-primary tracking-[0.3em] font-black uppercase mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)] animate-pulse" />
            Neural Fraud Intelligence Matrix / Online
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {[
              { label:'Core Scan Load',      val:fraudStats.totalClaims,                     accent:'#60a5fa' },
              { label:'High Risk Vectors',   val:fraudStats.flaggedClaims,                   accent:'#f97316' },
              { label:'Force Rejected',      val:fraudStats.rejectedClaims,                  accent:'#f87171' },
              { label:'Leak Prevention',     val:`₹${(fraudStats.estimatedSaved||0).toFixed(0)}`, accent:'#00ff87' },
            ].map((k,i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-surface-2/40 border border-white/5 group hover:border-white/10 transition-all">
                <div className="font-display text-3xl font-black text-white mb-2 transition-transform group-hover:scale-105 tracking-tighter">{k.val}</div>
                <div className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest">{k.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="h-2.5 bg-surface-3 rounded-full overflow-hidden flex shadow-inner">
              <motion.div initial={{width:0}} animate={{width:`${(s.fraudProfile?.low / s.fraudAlerts || 1) * 100}%`}} className="h-full bg-[#22c55e]" />
              <motion.div initial={{width:0}} animate={{width:`${(s.fraudProfile?.medium / s.fraudAlerts || 0) * 100}%`}} className="h-full bg-[#eab308]" />
              <motion.div initial={{width:0}} animate={{width:`${(s.fraudProfile?.high / s.fraudAlerts || 0) * 100}%`}} className="h-full bg-[#ef4444]" />
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-white/5">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  <span className="font-mono text-[9px] text-text-muted uppercase font-bold">Safe ({s.fraudProfile?.low || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#eab308]" />
                  <span className="font-mono text-[9px] text-text-muted uppercase font-bold">Suspicious ({s.fraudProfile?.medium || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  <span className="font-mono text-[9px] text-text-muted uppercase font-bold">Critical ({s.fraudProfile?.high || 0})</span>
                </div>
              </div>
              <div className="font-mono text-[10px] text-text-muted uppercase font-bold">
                Platform Fraud Rate: <span className={fraudStats.fraudRate > 20 ? 'text-[#f87171]' : 'text-[#facc15]'}>{fraudStats.fraudRate}%</span>
              </div>
            </div>

            {fraudStats.topFlags?.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                {fraudStats.topFlags.map((f,i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border-[#f9731615] bg-[#f9731605]">
                    <span className="font-mono text-[9px] text-[#fb923c] font-black uppercase tracking-widest">{f.type}</span>
                    <span className="font-mono text-[9px] text-text-muted font-bold">×{f.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="glass p-8 rounded-[2rem] border-white/5">
          <div className="font-mono text-[9px] text-text-muted tracking-[0.2em] font-black uppercase mb-2">Claims Profile</div>
          <h3 className="text-xl font-black text-white tracking-tight mb-8">Disruption Distribution</h3>
          {byType.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byType}>
                <XAxis dataKey="name" tick={{fill:'#71717a',fontSize:9,fontFamily:'Space Mono',fontWeight:600}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip cursor={{fill:'rgba(255,255,255,0.03)'}} contentStyle={ttpStyle}/>
                <Bar dataKey="count" radius={[6,6,0,0]} barSize={40}>
                  {byType.map((e,i)=><Cell key={i} fill={e.fill} fillOpacity={0.8}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart/>}
        </div>

        <div className="glass p-8 rounded-[2rem] border-white/5">
          <div className="font-mono text-[9px] text-text-muted tracking-[0.2em] font-black uppercase mb-2">Platform Status</div>
          <h3 className="text-xl font-black text-white tracking-tight mb-8">Payout Velocity</h3>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trend}>
                <XAxis dataKey="date" tick={{fill:'#71717a',fontSize:9,fontFamily:'Space Mono',fontWeight:600}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={ttpStyle}/>
                <Line type="monotone" dataKey="claims" stroke="var(--primary)" strokeWidth={2.5} dot={{fill:'var(--primary)',r:4}} name="Claims"/>
                <Line type="monotone" dataKey="payout" stroke="#60a5fa" strokeWidth={2.5} dot={{fill:'#60a5fa',r:4}} name="Payouts"/>
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart/>}
        </div>
      </div>

      {/* Geographic Risk */}
      {(data?.riskByCities||[]).length > 0 && (
        <div className="glass p-10 rounded-[3rem] border-white/5 mb-10 overflow-hidden relative">
          <div className="font-mono text-[9px] text-text-muted tracking-[0.2em] font-black uppercase mb-2">Network Topology</div>
          <h3 className="text-2xl font-black text-white tracking-tight mb-12">Geographic Risk Distribution</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6">
            {data.riskByCities.map((city,i)=>(
              <div key={city.city} className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-4 group">
                  <div className="absolute inset-0 bg-white shadow-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: PALETTE[i%PALETTE.length], filter: 'blur(20px)' }} />
                  <svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90 relative">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5"/>
                    <circle cx="18" cy="18" r="16" fill="none" stroke={PALETTE[i%PALETTE.length]} strokeWidth="2.5"
                      strokeDasharray={`${(city.avg_risk*100).toFixed(0)} 100`} strokeLinecap="round" className="transition-all duration-1000"/>
                  </svg>
                  <span className="font-display absolute inset-0 flex items-center justify-center text-sm font-black text-white relative">
                    {(city.avg_risk*100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs font-bold text-white mb-1">{city.city}</div>
                <div className="font-mono text-[8px] text-text-muted uppercase font-bold">{city.policy_count} Units</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Queue */}
      <div className="glass p-10 rounded-[3rem] border-white/5 shadow-2xl shadow-black/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div>
            <div className="font-mono text-[9px] text-text-muted tracking-[0.3em] font-black uppercase mb-2 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Decentralized Verification Queue
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter">Pending Validation Packets</h2>
          </div>
          <div className="glass px-6 py-2.5 rounded-2xl text-[10px] font-black text-primary border-primary/20 uppercase tracking-widest bg-primary/5">
            {claims.length} Units Queueing
          </div>
        </div>

        {claims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-surface-2/20 rounded-[2.5rem] border border-dashed border-white/5 grayscale opacity-40">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <CheckCircle size={32} className="text-primary" />
            </div>
            <div className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">System Clear / No Pending Packets</div>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map(c=>(
              <div key={c.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-surface-2/30 border border-white/5 hover:bg-surface-2/50 transition-colors group">
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div className="w-14 h-14 rounded-2xl bg-surface-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl border border-white/5">
                    <TriggerIcon type={c.trigger_type} size={28} className="text-text-muted group-hover:text-primary" />
                  </div>
                  <div>
                    <div className="font-mono text-sm font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight">
                      {c.claim_number} <span className="text-text-muted mx-2">/</span > {c.name}
                    </div>
                    <div className="font-mono text-[10px] text-text-muted mt-3 font-bold uppercase tracking-widest flex flex-wrap gap-x-6 gap-y-1">
                      <span>{c.platform}</span>
                      <span>{c.city}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-text-muted/40">Fraud Vector:</span> 
                        <span className={`font-black tracking-widest ${c.fraud_score > 0.4 ? 'text-red-400' : 'text-primary'}`}>
                          {(c.fraud_score*100).toFixed(0)}%
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6 pl-20 md:pl-0">
                  <div className="font-display text-3xl font-bold text-white group-hover:text-primary transition-colors mr-6">
                    ₹{c.payout_amount?.toFixed(0)}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={()=>handleClaim(c.id,'approve')} 
                      disabled={actionL[c.id]} 
                      className="px-6 py-2.5 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={()=>handleClaim(c.id,'reject')} 
                      disabled={actionL[c.id]} 
                      className="px-6 py-2.5 rounded-xl bg-transparent border border-red-500/30 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
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
  <div className="h-[200px] flex flex-col items-center justify-center gap-6 glass rounded-2xl border-dashed border-white/5 grayscale opacity-40">
    <BarChart3 size={32} className="text-text-muted" />
    <div className="font-mono text-[9px] uppercase font-black tracking-[0.2em] text-text-muted">No telemetry data recorded</div>
  </div>
);
