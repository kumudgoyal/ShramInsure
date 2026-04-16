import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { StaticBike, MovingBikeStrip } from '../components/BikeGraphic';
import { 
  ShieldCheck, 
  Brain, 
  Building2, 
  MapPin, 
  Bike, 
  FileText, 
  X, 
  ChevronDown, 
  Bot, 
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';

const CITIES  = ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Pune','Kolkata'];
const ZONES   = ['Central','North','South','East','West','Suburbs'];
const STATUS_COLOR = {
  active:    { bg:'rgba(0,255,135,0.07)',  border:'rgba(0,255,135,0.18)',  text:'#00ff87' },
  expired:   { bg:'rgba(100,116,139,0.07)',border:'rgba(100,116,139,0.18)',text:'#64748b' },
  cancelled: { bg:'rgba(239,68,68,0.07)',  border:'rgba(239,68,68,0.18)',  text:'#f87171' },
};
const PLATFORM_RISK = {Zomato:'1.05×',Swiggy:'1.05×',Zepto:'1.12×',Blinkit:'1.10×',Amazon:'0.95×',Flipkart:'0.95×',Dunzo:'1.08×'};

export default function PoliciesPage() {
  const { user, setUser } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showQuote, setShowQuote] = useState(false);
  const [quote, setQuote]         = useState(null);
  const [ql, setQl]               = useState(false);
  const [creating, setCreating]   = useState(false);
  const [qf, setQf] = useState({ city:'Mumbai', zone:'Central', weeks:4 });
  const [showBreakdown, setShowBreakdown] = useState(false);

  const fetch_ = async () => {
    try { const { data } = await api.get('/policies'); setPolicies(data.policies); }
    catch { toast.error('Failed to load policies'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch_(); }, []);

  const getQuote = async () => {
    setQl(true);
    try { const { data } = await api.post('/policies/quote', qf); setQuote(data.quote); setShowBreakdown(false); }
    catch (err) { toast.error(err.response?.data?.error||'Quote failed'); }
    finally { setQl(false); }
  };
  const createPolicy = async () => {
    setCreating(true);
    try { await api.post('/policies', qf); toast.success("Policy activated! You're covered", { icon: <ShieldCheck className="text-primary" size={20} /> }); setShowQuote(false); setQuote(null); fetch_(); }
    catch (err) { toast.error(err.response?.data?.error||'Failed'); }
    finally { setCreating(false); }
  };
  const cancel_ = async (id) => {
    if (!confirm('Cancel this policy?')) return;
    try { await api.put(`/policies/${id}/cancel`); toast.success('Cancelled'); fetch_(); }
    catch (err) { toast.error(err.response?.data?.error||'Failed'); }
  };

  return (
    <div className="container py-8 max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="font-mono text-[10px] text-text-muted tracking-[0.2em] uppercase">Coverage Console</div>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-primary/30 text-primary font-bold tracking-wider uppercase bg-primary/5">Node Verified</span>
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter text-white leading-none">
            Shield Ledger
          </h1>
          <p className="text-text-secondary mt-6 text-base lg:text-lg font-medium max-w-2xl leading-relaxed">
            AI-priced weekly income protection powered by real-time risk telemetry and neural prediction models.
          </p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowQuote(true)}
          className="bg-white text-black px-10 py-4 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/10 hover:bg-primary transition-all"
        >
          Initialize Coverage
        </motion.button>
      </div>

      {/* AI Pricing Matrix Strip */}
      <div className="glass p-8 rounded-[2rem] border-white/5 mb-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
          <Bot size={180} className="text-white" />
        </div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
            <Brain size={24} className="text-primary" />
          </div>
          <div>
            <div className="font-mono text-[9px] text-primary tracking-[0.2em] font-black uppercase">Neural Pricing Core</div>
            <div className="text-lg font-bold text-white mt-1">Real-time Risk Weighting</div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:'City Node Risk', desc:'Historical meteorological & disruption datasets.', icon: Building2, color: '#60a5fa' },
            { label:'Zone Calibrator', desc:'Hyper-local waterlogging & curfew metrics.', icon: MapPin, color: '#f59e0b' },
            { label:'Segment Factor', desc:'Platform delivery segment exposure multiplier.', icon: Bike, color: '#a78bfa' },
            { label:'Claim History', desc:'Iterative risk adjustment based on node history.', icon: FileText, color: 'var(--primary)' },
          ].map((f, i) => (
            <motion.div 
              key={f.label}
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="p-8 rounded-[2rem] bg-surface-2/40 border border-white/5 hover:bg-white/[0.02] transition-colors group"
            >
              <div className="mb-4">
                <f.icon size={32} style={{ color: f.color }} className="opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-[13px] font-bold text-white mb-2">{f.label}</div>
              <div className="text-[11px] text-text-secondary leading-relaxed font-medium">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quote Interactive Drawer */}
      <AnimatePresence>
        {showQuote && (
          <motion.div 
            initial={{ opacity:0, y:20 }} 
            animate={{ opacity:1, y:0 }} 
            exit={{ opacity:0, y:20 }} 
            className="mb-10 overflow-hidden"
          >
            <div className="glass p-8 rounded-[2.5rem] border-primary/20 relative">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="font-mono text-[9px] text-primary tracking-[0.2em] font-black uppercase">Calculator UI v2.4</div>
                  <h2 className="font-display text-2xl font-black text-white mt-2">Instant Coverage Quote</h2>
                </div>
                <button 
                  onClick={()=>{setShowQuote(false);setQuote(null);}} 
                  className="w-10 h-10 rounded-xl glass border-white/5 flex items-center justify-center text-text-muted hover:text-white transition-colors"
                ><X size={18} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  { label:'Deployment City', key:'city', opts:CITIES },
                  { label:'Operating Zone', key:'zone', opts:ZONES }
                ].map(({label, key, opts}) => (
                  <div key={key}>
                    <label className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest mb-3 block">{label}</label>
                    <div className="relative group">
                      <select 
                        value={qf[key]} 
                        onChange={e=>setQf(p=>({...p,[key]:e.target.value}))} 
                        className="w-full bg-surface-3/50 border border-white/10 p-4 rounded-2xl text-sm font-bold text-white appearance-none outline-none focus:border-primary/50 transition-all cursor-pointer"
                      >
                        {opts.map(o=><option key={o} className="bg-surface-0">{o}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>
                ))}
                <div>
                  <label className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest mb-3 block">Deployment weeks</label>
                  <input 
                    type="number" min={1} max={52} 
                    value={qf.weeks} 
                    onChange={e=>setQf(p=>({...p,weeks:Number(e.target.value)}))} 
                    className="w-full bg-surface-3/50 border border-white/10 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                <button 
                  onClick={getQuote} 
                  disabled={ql} 
                  className={`
                    px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                    ${ql ? 'bg-surface-3 text-text-muted opacity-50' : 'bg-white text-black hover:bg-primary shadow-xl'}
                  `}
                >
                  {ql ? 'PROCESSING NODE…' : 'CALCULATE PREMIUM SET'}
                </button>

                {quote && (
                  <motion.div 
                    initial={{ opacity:0, x:20 }} 
                    animate={{ opacity:1, x:0 }} 
                    className="flex-1 glass border-primary/30 p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-8"
                  >
                    <div className="flex-1">
                      <div className="font-mono text-[10px] text-primary font-black uppercase tracking-widest leading-none mb-4">Calculation Complete</div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-4xl font-black text-white">₹{quote.weeklyPremium}</span>
                        <span className="font-mono text-xs text-text-secondary font-bold uppercase tracking-tighter">/ weekly credit</span>
                      </div>
                      <div className="font-mono text-[9px] text-text-muted mt-4 font-bold uppercase tracking-tight flex flex-wrap gap-x-4 gap-y-1">
                        <span>Cover: ₹{(quote.coverageAmount||0).toLocaleString('en-IN')}</span>
                        <span>•</span>
                        <span>Risk Score: {(quote.riskScore*100).toFixed(0)}%</span>
                        <span>•</span>
                        <span className="text-primary">{quote.recommendation}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
                      <button 
                        onClick={()=>setShowBreakdown(v=>!v)} 
                        className="px-6 py-3 rounded-xl border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 transition-all"
                      >
                        {showBreakdown ? 'CLOSE BREAKDOWN' : 'VIEW BREAKDOWN'}
                      </button>
                      <button 
                        onClick={createPolicy} 
                        disabled={creating} 
                        className="px-8 py-3 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        {creating ? 'SYNCING…' : 'COMMIT POLICY →'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Advanced Pricing Telemetry Breakdown */}
              <AnimatePresence>
                {quote && showBreakdown && (
                  <motion.div 
                    initial={{ opacity:0, height:0 }} 
                    animate={{ opacity:1, height:'auto' }} 
                    exit={{ opacity:0, height:0 }} 
                    className="mt-8 border-t border-white/[0.04] pt-8"
                  >
                    <div className="font-mono text-[9px] text-text-muted tracking-[0.2em] font-black uppercase mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Factor Attribution Weights
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {quote.breakdown && Object.entries(quote.breakdown).map(([k,v]) => (
                        <div key={k} className="p-4 rounded-2xl bg-surface-3/40 border border-white/5 text-center">
                          <div className="font-display text-xl font-black text-primary mb-1">
                            {typeof v==='number' ? (v >= 1 ? v.toFixed(2) : `+${(v*100).toFixed(0)}%`) : v}
                          </div>
                          <div className="font-mono text-[8px] text-text-muted uppercase font-bold tracking-tighter">
                            {k.replace(/([A-Z])/g,' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Ledger Listing */}
      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i=><div key={i} className="h-44 bg-surface-2/50 rounded-3xl animate-pulse glass border-white/5"/>)}
        </div>
      ) : policies.length===0 ? (
        <div className="flex flex-col items-center justify-center py-24 glass rounded-[3rem] border-dashed border-white/5">
          <motion.div 
            animate={{ y:[0,-15,0] }} 
            transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
            className="mb-10 opacity-30"
          >
            <StaticBike size={180} color="var(--primary)"/>
          </motion.div>
          <h2 className="font-display text-3xl font-black text-white mb-3">No Active Protection</h2>
          <p className="text-text-muted text-sm font-medium mb-10 max-w-xs text-center">Your node is currently vulnerable to climatic and platform disruptions.</p>
          <button 
            onClick={()=>setShowQuote(true)} 
            className="px-10 py-4 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-primary transition-all"
          >
            Initiate Coverage Calibration
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {policies.map((p,idx) => {
            const sc = STATUS_COLOR[p.status]||STATUS_COLOR.expired;
            const pct = Math.max(5,((new Date(p.end_date)-new Date())/(new Date(p.end_date)-new Date(p.start_date)))*100);
            
            return (
              <motion.div 
                key={p.id} 
                initial={{ opacity:0, y:20 }} 
                animate={{ opacity:1, y:0 }} 
                transition={{ delay:idx*0.05 }}
                className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group hover:border-white/10 transition-all"
              >
                {/* Decorative Visual Backdrop */}
                <div className="absolute -right-12 -bottom-10 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 pointer-events-none group-hover:scale-110 group-hover:-rotate-12">
                  <StaticBike size={240} color="var(--primary)"/>
                </div>

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-surface-3 flex items-center justify-center shadow-2xl border border-white/5">
                        <ShieldCheck size={28} className="text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <span className="font-mono text-lg font-black text-white tracking-tight">{p.policy_number}</span>
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/5">
                            <span className="w-2 h-2 rounded-full" style={{ background: sc.text }} />
                            <span className="font-mono text-[9px] font-black uppercase tracking-widest" style={{ color: sc.text }}>{p.status}</span>
                          </div>
                        </div>
                        <div className="font-mono text-xs text-text-muted font-bold uppercase tracking-[0.1em]">
                          {p.city} Node <span className="mx-2 text-white/10">|</span> {p.zone} Zone Surveillance
                        </div>
                      </div>
                    </div>
                    
                    {p.status==='active' && (
                      <button 
                        onClick={()=>cancel_(p.id)} 
                        className="px-6 py-2.5 rounded-xl border border-red-500/20 text-red-500/60 text-[10px] font-black uppercase tracking-widest hover:text-red-500 hover:bg-red-500/5 transition-all"
                      >
                        Terminate Node Coverage
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    {[
                      { l:'Weekly Premium Entitlement', v:`₹${p.weekly_premium}`, h:'Amount' },
                      { l:'Total Capital Insured', v:`₹${(p.coverage_amount||0).toLocaleString('en-IN')}`, h:'Coverage' },
                      { l:'Contract Expiration', v:new Date(p.end_date).toLocaleDateString('en-IN', { dateStyle:'medium' }), h:'Expiry' },
                      { l:'Node Risk Vector', v:`${(p.risk_score*100).toFixed(0)}% Coefficient`, h:'Risk' }
                    ].map((item, i)=>(
                      <div key={i}>
                        <div className="font-mono text-[9px] text-text-muted mb-2 uppercase font-black tracking-widest">{item.l}</div>
                        <div className="font-display text-xl font-bold text-white">{item.v}</div>
                      </div>
                    ))}
                  </div>

                  {p.status==='active' && (
                    <div className="relative">
                      <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden shadow-inner flex">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${pct.toFixed(0)}%` }} 
                          transition={{ duration:2, delay:0.5, ease:'circOut' }} 
                          className="h-full bg-gradient-to-r from-primary to-primary-dim rounded-full shadow-[0_0_15px_rgba(0,255,135,0.4)]"
                        />
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="font-mono text-[9px] text-text-muted uppercase font-black tracking-widest">Temporal Coverage Integrity</span>
                        <span className="font-mono text-[9px] text-primary font-black">{pct.toFixed(0)}% REMAINING</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
