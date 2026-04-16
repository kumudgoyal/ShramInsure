import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { 
  CloudRain, 
  Wind, 
  Ban, 
  Waves, 
  ThermometerSun, 
  PartyPopper, 
  PlugZap, 
  AlertTriangle, 
  ShieldCheck, 
  Check, 
  Activity, 
  Zap, 
  Search, 
  ShieldAlert, 
  RefreshCw,
  IndianRupee,
  Database,
  Cpu,
  Verified,
  ArrowRight
} from 'lucide-react';

const SIMS = [
  { id:'rain',      label:'Heavy Rain',        icon: CloudRain, color:'#60a5fa', desc:'Monsoon surge >65mm/hr',       endpoint:'/simulate/rain' },
  { id:'pollution', label:'Air Quality Crisis', icon: Wind, color:'#a78bfa', desc:'AQI hazardous >200',           endpoint:'/simulate/pollution' },
  { id:'curfew',    label:'Zone Curfew',        icon: Ban, color:'#f87171', desc:'Civil restriction',            endpoint:'/simulate/curfew' },
  { id:'flood',     label:'Flood Alert',        icon: Waves, color:'#34d399', desc:'Water level >0.5m',            endpoint:'/simulate/flood' },
  { id:'heat',      label:'Extreme Heat',       icon: ThermometerSun, color:'#fb923c', desc:'Temperature >42°C',            endpoint:'/simulate/heat' },
];

const STEP_COLOR = { done:'#60a5fa', paid:'#00ff87', blocked:'#f87171', pending:'#facc15' };

function PayoutCelebration({ amount, txnId, onClose }) {
  return (
    <motion.div
      initial={{ opacity:0 }}
      animate={{ opacity:1 }}
      exit={{ opacity:0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale:0.9, opacity:0, y:20 }}
        animate={{ scale:1, opacity:1, y:0 }}
        exit={{ scale:0.9, opacity:0, y:20 }}
        className="glass max-w-sm w-full p-10 rounded-[3rem] border-primary/20 text-center relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 shadow-3xl shadow-primary/20">
          <PartyPopper size={48} className="text-primary" />
        </div>
        
        <div className="font-display text-5xl font-black text-primary leading-none tracking-tight">
          ₹{Number(amount).toLocaleString('en-IN')}
        </div>
        
        <div className="text-text-secondary mt-4 text-sm font-medium">Auto-credited to node wallet</div>
        
        <div className="mt-8 space-y-3">
          <div className="flex justify-between items-center px-4 py-3 rounded-2xl bg-surface-3/50 border border-white/5">
            <span className="font-mono text-[9px] text-text-muted uppercase font-bold tracking-widest">Protocol</span>
            <span className="font-mono text-[10px] font-black text-white">ZERO-TOUCH PARAMETRIC</span>
          </div>
          <div className="flex justify-between items-center px-4 py-3 rounded-2xl bg-surface-3/50 border border-white/5">
            <span className="font-mono text-[9px] text-text-muted uppercase font-bold tracking-widest">Txn Node</span>
            <span className="font-mono text-[10px] font-black text-text-muted">{txnId?.slice(0,16)}...</span>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-full mt-10 py-4 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl"
        >
          Acknowledge Receipt
        </button>
      </motion.div>
    </motion.div>
  );
}

function RiskMeter({ score, size = 72 }) {
  const pct = Math.round((score || 0) * 100);
  const color = pct > 70 ? '#ef4444' : pct > 40 ? '#facc15' : '#22c55e';
  const label = pct > 70 ? 'CRITICAL' : pct > 40 ? 'MODERATE' : 'OPTIMAL';
  
  return (
    <div className="text-center group">
      <div className="relative mb-3 flex justify-center" style={{ width: size, height: size, margin: '0 auto' }}>
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/[0.05]" strokeWidth="3"/>
          <motion.circle 
            cx="18" cy="18" r="16" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray="100 100"
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: 100 - pct }}
            strokeLinecap="round"
            transition={{ duration: 1.5, ease: "circOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-lg font-black text-white leading-none">{pct}%</span>
        </div>
      </div>
      <div className="font-mono text-[8px] font-black tracking-widest uppercase" style={{ color }}>{label}</div>
    </div>
  );
}

export default function SimulationPage() {
  const { user, setUser } = useAuth();
  const [running, setRunning]       = useState(null);
  const [result, setResult]         = useState(null);
  const [visSteps, setVisSteps]     = useState([]);
  const [showPayout, setShowPayout] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/predict/loss').catch(() => null),
      api.post('/risk/calculate', {}).catch(() => null),
    ]).then(([pred, rsk]) => {
      if (pred) setPrediction(pred.data);
    }).finally(() => setLoadingData(false));
  }, []);

  const run = async (sim) => {
    setRunning(sim.id); setResult(null); setVisSteps([]); setShowPayout(false);
    try {
      const { data } = await api.post(sim.endpoint, {});
      for (let i = 0; i < data.steps.length; i++) {
        await new Promise(r => setTimeout(r, 540));
        setVisSteps(data.steps.slice(0, i + 1));
      }
      setResult(data);
      if (data.payout) {
        setTimeout(() => setShowPayout(true), 400);
        if (data.walletBalance !== undefined) setUser(p => ({ ...p, wallet_balance: data.walletBalance }));
      } else if (data.claim?.status === 'rejected') {
        toast.error('Security Breach - Automatic Block Initiated 🚨', { icon: <ShieldAlert className="text-red-500" size={20} /> });
      } else {
        toast('Node Sync Initiated', { icon: <RefreshCw className="text-primary animate-spin" size={20} /> });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Node creation failed. Verify active policy.');
    } finally { setRunning(null); }
  };

  return (
    <div className="container py-8 max-w-7xl mx-auto px-6">

      <AnimatePresence>
        {showPayout && result?.payout && (
          <PayoutCelebration
            amount={result.payout.amount}
            txnId={result.payout.txnId}
            onClose={() => setShowPayout(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="font-mono text-[10px] text-text-muted tracking-[0.2em] uppercase">Security Simulation</div>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-primary/30 text-primary font-bold tracking-wider uppercase bg-primary/5">Protocol Testnet</span>
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter text-white leading-none">
            Stress Test Env
          </h1>
          <p className="text-text-secondary mt-6 text-base lg:text-lg font-medium max-w-2xl leading-relaxed">
            Execute disruption vectors to validate the zero-touch parametric claim pipeline and neural response latency.
          </p>
        </motion.div>
      </div>

      {/* Live Intelligence Matrix */}
      {!loadingData && prediction && (
        <motion.div
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          className="glass p-10 rounded-[3rem] border-white/5 mb-12"
        >
          <div className="flex items-start justify-between mb-10">
            <div>
              <div className="font-mono text-[9px] text-primary tracking-[0.3em] font-black uppercase mb-2 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)] animate-pulse" />
                Intelligence Matrix: {prediction.city}
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Loss Prediction Core</h3>
            </div>
            <div className={`
              px-6 py-2.5 rounded-2xl text-xs font-black tracking-widest uppercase border 
              ${prediction.risk24h > 70 ? 'bg-red-500 text-white' : prediction.risk24h > 40 ? 'bg-yellow-500 text-black' : 'bg-primary text-black'}
            `}>
              {prediction.risk24h}% Risk Vector
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label:'Est. Loss 24h', val:`₹${prediction.estimatedLoss24h}`, sub:'Income exposure', accent:prediction.risk24h > 50 ? '#ef4444' : 'var(--primary)' },
              { label:'7-Day Forecast', val:`₹${prediction.totalWeeklyLoss}`, sub:'Weekly projection', accent:'#f59e0b' },
              { label:'Node Protection', val:`₹${(prediction.coverageAmount||0).toLocaleString('en-IN')}`, sub:'Active coverage', accent:'var(--primary)' },
              { label:'Active Vectors', val:prediction.disruptions?.length||0, sub:'Current triggers', accent:'#3b82f6' },
            ].map((k,i) => (
              <div key={i} className="p-8 rounded-[2.5rem] bg-surface-2/40 border border-white/5 group hover:border-white/10 transition-all">
                <div className="font-display text-4xl font-black mb-3 transition-transform group-hover:scale-105 tracking-tighter" style={{ color: k.accent }}>{k.val}</div>
                <div className="font-mono text-[9px] text-white mb-2 uppercase font-black tracking-widest">{k.label}</div>
                <div className="font-mono text-[8px] text-text-muted font-bold uppercase tracking-widest">{k.sub}</div>
              </div>
            ))}
          </div>

          {prediction.disruptions?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-6 border-t border-white/[0.04]">
              {prediction.disruptions.map((d,i) => (
                <div key={i} className={`
                  flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-tight
                  ${d.active ? 'bg-red-500/5 border-red-500/20 text-red-500' : 'bg-surface-3/50 border-white/10 text-text-muted'}
                `}>
                  <div className="opacity-80">
                    {d.id === 'rain' ? <CloudRain size={14} /> : d.id === 'heat' ? <ThermometerSun size={14} /> : <Activity size={14} />}
                  </div>
                  <span>{d.label}</span>
                  <span className="font-mono opacity-60">{d.value}{d.unit}</span>
                  {d.active && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-1" />}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Disruption Trigger Grid */}
      <div className="font-mono text-[9px] text-text-muted tracking-[0.2em] font-black uppercase mb-6 flex items-center gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        Manual Vector Override
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {SIMS.map(sim => (
          <motion.button
            key={sim.id}
            whileHover={{ scale:1.02, y:-4 }}
            whileTap={{ scale:0.98 }}
            onClick={() => run(sim)}
            disabled={!!running}
            className={`
              glass p-6 rounded-[2rem] border-white/5 flex flex-col items-center text-center transition-all group
              ${running === sim.id ? 'border-primary/40 bg-primary/5' : 'hover:bg-white/[0.02] hover:border-white/10'}
              ${running && running !== sim.id ? 'opacity-40 grayscale' : 'opacity-100'}
            `}
          >
            <div className={`
              w-16 h-16 rounded-2xl mb-4 flex items-center justify-center shadow-inner transition-all duration-500 group-hover:scale-110
              ${running === sim.id ? 'bg-primary/20 animate-pulse' : 'bg-surface-3'}
            `}>
              {running === sim.id ? <Zap size={32} className="text-primary" fill="currentColor" /> : <sim.icon size={32} className="text-text-muted group-hover:text-primary transition-colors" />}
            </div>
            <div className="text-sm font-black text-white mb-1 tracking-tight">{sim.label}</div>
            <div className="font-mono text-[9px] text-text-muted font-bold uppercase tracking-widest leading-tight px-2 group-hover:text-white transition-colors">
              {running === sim.id ? 'PROCESSING…' : sim.desc}
            </div>
            
            {running === sim.id && (
              <div className="mt-4 flex gap-1.5">
                {[0,1,2].map(i => (
                  <motion.div key={i}
                    animate={{ opacity:[0.3,1,0.3], scale:[0.8,1.1,0.8] }}
                    transition={{ repeat:Infinity, duration:0.9, delay:i*0.3 }}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                  />
                ))}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Result Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left: Execution Trace */}
        <AnimatePresence>
          {visSteps.length > 0 && (
            <motion.div
              initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
              className="glass p-8 rounded-[2.5rem] border-white/5"
            >
              <div className="font-mono text-[9px] text-text-muted tracking-[0.2em] font-black uppercase mb-10 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                Execution Pipeline Trace
              </div>
              
              <div className="space-y-0 relative">
                <div className="absolute left-[1.35rem] top-4 bottom-4 w-px bg-white/[0.05]" />
                {visSteps.map((step, i) => {
                  const col = STEP_COLOR[step.status] || '#3b82f6';
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                      className="flex gap-6 pb-8 relative group"
                    >
                      <div className="z-10 bg-surface-1 flex items-center justify-center">
                        <div 
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-500 border"
                          style={{ 
                            background: `${col}15`, 
                            borderColor: `${col}30`,
                            color: col,
                            boxShadow: step.status === 'paid' ? `0 0 20px ${col}44` : 'none'
                          }}
                        >
                          {step.status==='paid' ? <Check size={20} /> : step.status==='blocked' ? <AlertTriangle size={20} /> : <Activity size={20} />}
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="text-[13px] font-bold text-white mb-1 group-hover:text-primary transition-colors">{step.label}</div>
                        <div className="font-mono text-[10px] text-text-muted leading-relaxed font-medium uppercase tracking-tight">{step.detail}</div>
                        
                        {step.fraudData && step.fraudData.flags?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {step.fraudData.flags.map((f,fi) => (
                              <span key={fi} className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-[9px] font-black uppercase tracking-widest">
                                {f.type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {running && (
                <div className="flex items-center gap-3 mt-4 pl-[3.5rem]">
                  <div className="flex gap-1.5">
                    {[0,1,2].map(i => (
                      <motion.div key={i}
                        animate={{ opacity:[0.3,1,0.3] }}
                        transition={{ repeat:Infinity, duration:0.8, delay:i*0.27 }}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[9px] text-text-muted uppercase font-black">Syncing Node…</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right: Analysis Report */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
              className="space-y-6"
            >
              {/* Outcome Shield */}
              <div className={`
                glass p-8 rounded-[2.5rem] relative overflow-hidden group border
                ${result.claim?.status==='paid' ? 'border-primary/20 bg-primary/5' : result.claim?.status==='rejected' ? 'border-red-500/20 bg-red-500/5' : 'border-yellow-500/20 bg-yellow-500/5'}
              `}>
                <div className="font-mono text-[9px] text-text-muted tracking-[0.2em] font-black uppercase mb-8">Post-Action Report</div>
                <div className="font-display text-4xl lg:text-5xl font-black text-white mb-6 leading-none tracking-tighter">{result.summary}</div>
                
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { label:'Network UID', val:result.claim?.claimNumber },
                    { label:'Status Code', val:result.claim?.status?.toUpperCase() },
                    { label:'Capital Transferred', val:`₹${result.claim?.payoutAmount?.toFixed(0)}` },
                    { label:'Integrity Conf.', val:`${((result.fraud?.fraudScore||0)*100).toFixed(0)}/100` },
                  ].map((k,i) => (
                    <div key={i} className="p-4 rounded-2xl bg-surface-3/30 border border-white/5 group-hover:bg-surface-3/50 transition-all">
                      <div className="font-mono text-[8px] text-text-muted uppercase font-black mb-1">{k.label}</div>
                      <div className="font-mono text-[12px] font-black text-white">{k.val}</div>
                    </div>
                  ))}
                </div>

                {result.payout && (
                  <motion.div 
                    initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }}
                    className="p-6 rounded-[1.5rem] bg-primary/10 border border-primary/20 shadow-lg shadow-primary/10"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <IndianRupee size={18} className="text-primary" />
                      </div>
                      <div className="font-mono text-[10px] text-primary font-black uppercase tracking-widest">Payout Synchronized</div>
                    </div>
                    <div className="font-display text-2xl font-black text-white mb-1">₹{result.payout.amount.toFixed(0)} → {result.payout.upiId}</div>
                    <div className="font-mono text-[9px] text-text-muted font-bold uppercase tracking-widest">Node ID: {result.payout.txnId.slice(0,20)}…</div>
                  </motion.div>
                )}
              </div>

              {/* Fraud Neural Analysis */}
              {result.fraud && (
                <div className="glass p-8 rounded-[2.5rem] border-white/5">
                  <div className="font-mono text-[9px] text-text-muted tracking-[0.2em] font-black uppercase mb-8">Security Analysis Matrix</div>
                  <div className="flex items-center gap-8 mb-10">
                    <RiskMeter score={result.fraud.fraudScore} size={90} />
                    <div>
                      <div className="text-lg font-bold text-white mb-2 leading-tight">{result.fraud.reason}</div>
                      <div className="font-mono text-[10px] font-black uppercase tracking-widest">
                        Decision: <span style={{ color: result.fraud.decision==='APPROVE'?'#22c55e':result.fraud.decision==='REJECT'?'#ef4444':'#eab308' }}>
                          {result.fraud.decision}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {result.fraud.flags?.length > 0 ? (
                      result.fraud.flags.map((f,i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                          <AlertTriangle className="text-red-500 shrink-0" size={20} />
                          <div>
                            <div className="font-mono text-[10px] text-red-500 font-bold uppercase mb-1">{f.type}</div>
                            <div className="text-[11px] text-text-muted font-medium">{f.detail}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                        <ShieldCheck className="text-primary shrink-0" size={24} />
                        <div className="text-[12px] font-bold text-primary uppercase tracking-widest">Zero Compromise Detected</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!visSteps.length && !result && (
          <motion.div
            initial={{ opacity:0, scale:0.98 }} animate={{ opacity:1, scale:1 }}
            className="lg:col-span-2 py-24 glass rounded-[3rem] border-dashed border-white/10 text-center relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 grayscale opacity-40">
                <PlugZap size={48} className="text-text-muted" />
              </div>
              <h2 className="font-display text-3xl font-black text-white mb-3">Initialize Simulation Vector</h2>
              <p className="text-text-muted text-sm font-medium mb-12 max-w-sm mx-auto">
                Select a disruption vector from the matrix above to initiate the real-time claim validation sequence.
              </p>
              
              <div className="flex justify-center gap-3 flex-wrap max-w-2xl mx-auto">
                {['Detection', 'Validation', 'Neural Check', 'Consensus', 'Settlement'].map((s,i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-2 rounded-full border border-white/5 bg-white/[0.02]">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                    <span className="font-mono text-[9px] text-text-muted font-black uppercase tracking-widest">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
