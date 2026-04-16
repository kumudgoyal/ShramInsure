import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  CloudRain, 
  ThermometerSun, 
  Wind, 
  Zap, 
  Ban, 
  Waves, 
  Ambulance,
  CheckCircle,
  BarChart3,
  IndianRupee,
  AlertTriangle,
  X,
  Activity,
  ArrowRight,
  ShieldAlert,
  Search,
  RefreshCw
} from 'lucide-react';

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
  FLOOD_ALERT: Waves, 
  ACCIDENT: Ambulance 
};
const TriggerIcon = ({ type, className, size=24 }) => {
  const Icon = TRIGGER_ICON[type] || Zap;
  return <Icon className={className} size={size} />;
};

const TRIGGER_LABEL  = { WEATHER_RAIN:'Heavy Rain', WEATHER_HEAT:'Extreme Heat', POLLUTION_AQI:'Air Quality Emergency', WEATHER_STORM:'Storm Warning', CIVIL_CURFEW:'Zone Curfew', FLOOD_ALERT:'Flood Alert', ACCIDENT:'Accidental Cover' };
const TRIGGER_THRESH = { WEATHER_RAIN:'> 65 mm/hr', WEATHER_HEAT:'> 42°C', POLLUTION_AQI:'AQI > 200', WEATHER_STORM:'> 50 km/h', CIVIL_CURFEW:'Active curfew', FLOOD_ALERT:'> 0.5m water', ACCIDENT:'Active after 12mo' };

// Animated counter
const CountUp = ({ value, prefix = '' }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
    if (end === 0) return;
    const duration = 800;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display.toLocaleString('en-IN')}</span>;
};

export default function ClaimsPage() {
  const [claims, setClaims]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [paying, setPaying]     = useState(false);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter]     = useState('all');

  const [success, setSuccess]   = useState(null);

  const fetch_ = async () => {
    try {
      const { data } = await api.get('/claims');
      setClaims(data.claims);
    } catch { toast.error('Failed to load claims'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch_(); }, []);

  const runScan = async () => {
    setScanning(true);
    try {
      const { data } = await api.post('/claims/trigger-check', {});
      if (data.claimsCreated > 0) { toast.success(`${data.claimsCreated} claim(s) auto-filed 🛡️`, { icon: <ShieldAlert className="text-primary" size={20} /> }); fetch_(); }
      else toast('No new disruptions detected', { icon: <CheckCircle className="text-primary" size={20} /> });
    } catch { toast.error('Scan failed'); }
    finally { setScanning(false); }
  };

  const payout = async (id) => {
    setPaying(true);
    try {
      const { data } = await api.post(`/claims/simulate-payout/${id}`, { upi_id:'worker@upi' });
      setSuccess(data);
      setSelected(null);
      fetch_();
    } catch (err) { toast.error(err.response?.data?.error || 'Payout failed'); }
    finally { setPaying(false); }
  };

  const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter);
  const totals = {
    total: claims.length,
    paid: claims.filter(c => c.status === 'paid').length,
    pending: claims.filter(c => c.status === 'pending').length,
    totalPayout: claims.filter(c => c.status === 'paid').reduce((s, c) => s + (parseFloat(c.payout_amount) || 0), 0),
  };
  const FILTERS = ['all', 'pending', 'approved', 'paid'];

  return (
    <div className="container py-8 max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="font-mono text-[10px] text-text-muted tracking-[0.2em] uppercase">Disruption Ledger</div>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-primary/30 text-primary font-bold tracking-wider uppercase bg-primary/5">Zero-Touch Claims</span>
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter text-white leading-none">
            Parametric Ledger
          </h1>
          <p className="text-text-secondary mt-6 text-base lg:text-lg font-medium max-w-2xl leading-relaxed">
            Real-time monitoring of 6 disruption vectors for automated payout triggering and sub-second settlement.
          </p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={runScan}
          disabled={scanning}
          className={`
            px-8 py-4 rounded-[2rem] flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group
            ${scanning ? 'bg-surface-3 text-text-muted cursor-not-allowed' : 'bg-white text-black hover:bg-primary shadow-xl shadow-primary/10'}
          `}
        >
          <motion.span
            animate={scanning ? { rotate: 360 } : {}}
            transition={{ duration:1, repeat:Infinity, ease:'linear' }}
          >
            {scanning ? <RefreshCw size={16} /> : <Zap size={16} fill="currentColor" />}
          </motion.span>
          {scanning ? 'Initiating Scan' : 'Audit Triggers'}
        </motion.button>
      </div>

      {/* Trigger reference - Premium Horizontal Scroll / Grid */}
      <div className="mb-12">
        <div className="font-mono text-[9px] text-text-muted tracking-[0.3em] font-black uppercase mb-8 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
            Surveillance Infrastructure
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {type:'WEATHER_RAIN'},{type:'WEATHER_HEAT'},{type:'POLLUTION_AQI'},
            {type:'WEATHER_STORM'},{type:'CIVIL_CURFEW'},{type:'FLOOD_ALERT'},
          ].map(({type}, i) => (
            <motion.div
              key={type}
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass p-5 rounded-[1.5rem] aspect-square border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center text-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-2xl bg-surface-3 flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform duration-500 relative z-10">
                <TriggerIcon type={type} size={24} className="text-text-muted group-hover:text-primary transition-colors" />
              </div>
              <div className="text-[11px] font-black text-white mb-1 leading-tight tracking-tight relative z-10">{TRIGGER_LABEL[type]}</div>
              <div className="font-mono text-[8px] text-text-muted group-hover:text-primary font-black uppercase tracking-tighter transition-colors relative z-10">{TRIGGER_THRESH[type]}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* KPI Overlays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label:'Total Events', val:totals.total, accent:'var(--text-muted)' },
          { label:'Settled Claims', val:totals.paid, accent:'var(--primary)' },
          { label:'Sync Pending', val:totals.pending, accent:'#facc15' },
          { label:'Capital Dispatched', val:totals.totalPayout, accent:'#60a5fa', prefix:'₹' },
        ].map((s,i) => (
          <motion.div
            key={i}
            initial={{ opacity:0, y:12 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="glass p-6 rounded-[1.5rem] relative overflow-hidden group shadow-lg shadow-black/20 flex flex-col justify-between min-h-[140px]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-[40px] -mr-10 -mt-10 transition-opacity group-hover:opacity-20" style={{ background: s.accent }} />
            <div className="font-mono text-[9px] text-text-muted mt-1 uppercase font-black tracking-[0.2em] relative z-10">{s.label}</div>
            <div className="font-display text-4xl font-black text-white tracking-tighter group-hover:text-primary transition-colors relative z-10" style={ i !== 0 ? { color: s.accent } : {} }>
              {s.prefix}<CountUp value={s.val} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters Hub */}
      <div className="flex flex-wrap items-center gap-2 mb-6 bg-surface-2/40 p-1.5 rounded-2xl border border-white/5 w-fit shadow-inner">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
              ${filter === f 
                ? 'bg-primary/15 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,255,135,0.1)]' 
                : 'text-text-muted hover:text-white hover:bg-white/5 border border-transparent'}
            `}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Claims List - Modern List View */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-surface-2/50 rounded-2xl animate-pulse glass border-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 glass rounded-[3rem] border-dashed border-white/5 grayscale opacity-40">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8">
            <BarChart3 size={48} className="text-text-muted" />
          </div>
          <h2 className="font-display text-2xl font-black text-white mb-2 uppercase tracking-tighter">Immutable Ledger Empty</h2>
          <p className="font-mono text-[10px] text-text-muted uppercase font-black tracking-widest">No recorded disruptions match target security vectors.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, idx) => {
            const sc = STATUS_COLOR[c.status] || STATUS_COLOR.pending;
            const payoutAmt = parseFloat(c.payout_amount) || 0;
            const fraudSev = c.fraud_score >= 0.7 ? '#ef4444' : c.fraud_score >= 0.4 ? '#eab308' : '#22c55e';
            
            return (
              <motion.div
                key={c.id}
                initial={{ opacity:0, x:-10 }}
                animate={{ opacity:1, x:0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setSelected(c)}
                className="glass p-5 rounded-[1.5rem] border-white/[0.04] hover:border-white/10 hover:bg-white/[0.03] transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: sc.text }} />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-2">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-xl bg-surface-3 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 border border-white/5">
                      <TriggerIcon type={c.trigger_type} size={22} className="text-text-muted group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="font-mono text-sm font-black text-white tracking-tight group-hover:text-primary transition-colors">{c.claim_number}</span>
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border" style={{ borderColor: sc.border, background: sc.bg }}>
                          <span className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ background: sc.text, boxShadow: `0 0 5px ${sc.text}` }} />
                          <span className="font-mono text-[8px] font-black uppercase tracking-widest" style={{ color: sc.text }}>{c.status}</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full ml-1" style={{ background: fraudSev, boxShadow: `0 0 10px ${fraudSev}44` }} />
                      </div>
                      <div className="font-mono text-[9px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-3">
                        <span className="group-hover:text-white transition-colors">{TRIGGER_LABEL[c.trigger_type] || c.trigger_type}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span>{new Date(c.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 w-full md:w-auto mt-4 md:mt-0">
                    <div className="text-left md:text-right flex-1 md:flex-none">
                      <div className="font-display text-2xl font-black text-white leading-none group-hover:text-primary transition-colors">
                        ₹{payoutAmt.toFixed(0)}
                      </div>
                      <div className="font-mono text-[8px] text-text-muted mt-1.5 uppercase font-bold tracking-widest">Settlement Value</div>
                    </div>
                    
                    {c.status === 'approved' && (
                        <button
                          onClick={e => { e.stopPropagation(); payout(c.id); }}
                          disabled={paying}
                          className="px-6 py-2.5 rounded-xl bg-primary text-black text-[9px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 whitespace-nowrap ml-auto md:ml-0"
                        >
                          {paying ? 'LOADING…' : 'DISPATCH PAYOUT'}
                        </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Success Receipt Modal */}
      <AnimatePresence>
        {success && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
                onClick={()=>setSuccess(null)}
            />
            <motion.div 
                initial={{scale:0.9, opacity:0, y:20}} 
                animate={{scale:1, opacity:1, y:0}} 
                exit={{scale:0.9, opacity:0, y:20}}
                className="glass max-w-sm w-full p-8 rounded-[2.5rem] border-primary/20 text-center relative overflow-hidden shadow-2xl shadow-primary/10"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20">
                <IndianRupee size={40} className="text-primary" />
              </div>
              <h2 className="font-display text-3xl font-black text-white mb-4 tracking-tighter">Capital Dispatched</h2>
              <p className="text-text-muted text-sm font-medium mb-8">Payout successfully broadcasted to your registered node.</p>
              
              <div className="space-y-3 mb-8">
                {[
                  { label:'Credit Amount', val:`₹${success.amount}`, bold:true, color:'text-primary' },
                  { label:'Protocol', val:'Instant UPI Sync', bold:false, color:'text-white' },
                  { label:'Txn Node ID', val:success.txnId?.slice(0,12)+'...', bold:false, color:'text-text-muted' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-3 rounded-2xl bg-surface-3/50 border border-white/5">
                    <span className="font-mono text-[9px] text-text-muted uppercase font-bold tracking-widest">{item.label}</span>
                    <span className={`font-mono text-xs font-black ${item.color} ${item.bold?'text-sm':''}`}>{item.val}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={()=>setSuccess(null)} 
                className="w-full py-4 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl"
              >
                Acknowledge Receipt
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity:0, scale:0.95, y:20 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.95, y:20 }}
              className="glass max-w-xl w-full p-8 rounded-[2.5rem] border-white/10 relative shadow-2xl shadow-black/40"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="font-mono text-[9px] text-text-muted tracking-[0.2em] font-black uppercase mb-1">Chain Transaction Object</div>
                  <h2 className="font-display text-2xl font-black text-white">{selected.claim_number}</h2>
                </div>
                <button 
                    onClick={() => setSelected(null)}
                    className="w-10 h-10 rounded-xl glass border-white/5 flex items-center justify-center text-text-muted hover:text-white transition-colors"
                ><X size={18} /></button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { k:'Trigger Vector',    v:TRIGGER_LABEL[selected.trigger_type] || selected.trigger_type, full:true },
                  { k:'Vector Threshold',  v:TRIGGER_THRESH[selected.trigger_type] || 'N/A' },
                  { k:'Current Status',   v:selected.status.toUpperCase() },
                  { k:'Payout Entitlement', v:`₹${(parseFloat(selected.payout_amount)||0).toFixed(0)}` },
                  { k:'Validation Date',  v:new Date(selected.created_at).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' }) },
                  { k:'Fraud Risk Vector', v:`${((selected.fraud_score||0)*100).toFixed(0)}% Confidence` },
                  { k:'Trigger Source',  v:selected.auto_triggered===1 ? 'Parametric / AI' : 'Manual / Override' },
                ].map((item, i) => (
                  <div key={i} className={`p-4 rounded-2xl bg-surface-2/40 border border-white/5 ${item.full?'col-span-2':''}`}>
                    <div className="font-mono text-[8px] text-text-muted uppercase font-bold tracking-widest mb-1">{item.k}</div>
                    <div className="font-mono text-[11px] font-black text-white">{item.v}</div>
                  </div>
                ))}
              </div>

              {selected.status === 'approved' && (
                <button
                  onClick={() => payout(selected.id)}
                  disabled={paying}
                  className="w-full py-5 rounded-2xl bg-primary text-black text-sm font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/30"
                >
                  {paying ? 'SYNCHRONIZING…' : 'AUTHORIZE SETTLEMENT DISPATCH'}
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
