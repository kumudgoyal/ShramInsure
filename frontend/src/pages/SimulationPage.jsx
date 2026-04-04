import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SIMS = [
  { id:'rain',      label:'Heavy Rain',        icon:'🌧', color:'#60a5fa', desc:'Monsoon surge >65mm/hr',       endpoint:'/simulate/rain' },
  { id:'pollution', label:'Air Quality Crisis', icon:'💨', color:'#a78bfa', desc:'AQI hazardous >200',           endpoint:'/simulate/pollution' },
  { id:'curfew',    label:'Zone Curfew',        icon:'🚫', color:'#f87171', desc:'Civil restriction',            endpoint:'/simulate/curfew' },
  { id:'flood',     label:'Flood Alert',        icon:'🌊', color:'#34d399', desc:'Water level >0.5m',            endpoint:'/simulate/flood' },
  { id:'heat',      label:'Extreme Heat',       icon:'🌡', color:'#fb923c', desc:'Temperature >42°C',            endpoint:'/simulate/heat' },
];

const STEP_COLOR = { done:'#60a5fa', paid:'#00ff87', blocked:'#f87171', pending:'#facc15' };

function PayoutCelebration({ amount, txnId, onClose }) {
  return (
    <motion.div
      initial={{ opacity:0, scale:0.7 }}
      animate={{ opacity:1, scale:1 }}
      exit={{ opacity:0, scale:0.85 }}
      style={{
        position:'fixed', inset:0, zIndex:999,
        display:'flex', alignItems:'center', justifyContent:'center',
        background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)',
      }}
      onClick={onClose}
    >
      <motion.div
        animate={{ y:[0,-8,0] }}
        transition={{ repeat:Infinity, duration:2, ease:'easeInOut' }}
        style={{
          padding:'40px 52px', borderRadius:20, textAlign:'center',
          background:'linear-gradient(135deg, rgba(0,255,135,0.12), rgba(0,201,104,0.06))',
          border:'1.5px solid rgba(0,255,135,0.35)',
          boxShadow:'0 0 80px rgba(0,255,135,0.18)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize:56, marginBottom:12 }}>🎉</div>
        <div className="font-syne" style={{ fontSize:44, fontWeight:900, color:'#00ff87', letterSpacing:'-0.03em', lineHeight:1 }}>
          ₹{Number(amount).toLocaleString('en-IN')}
        </div>
        <div style={{ fontSize:14, color:'var(--text-secondary)', marginTop:10, marginBottom:6 }}>Auto-credited to your UPI wallet</div>
        <div className="font-mono" style={{ fontSize:11, color:'var(--text-muted)', letterSpacing:'0.08em' }}>TXN: {txnId}</div>
        <div style={{ marginTop:6 }}>
          <div className="font-mono" style={{ fontSize:10, color:'rgba(0,255,135,0.6)', letterSpacing:'0.1em' }}>ZERO-TOUCH · INSTANT · PARAMETRIC</div>
        </div>
        <button onClick={onClose} style={{
          marginTop:22, padding:'9px 26px', borderRadius:8,
          background:'rgba(0,255,135,0.12)', border:'1px solid rgba(0,255,135,0.3)',
          color:'#00ff87', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
        }}>Close</button>
      </motion.div>
    </motion.div>
  );
}

function RiskMeter({ score }) {
  const pct = Math.round((score || 0) * 100);
  const color = pct > 70 ? '#f87171' : pct > 40 ? '#facc15' : '#00ff87';
  const label = pct > 70 ? 'HIGH RISK' : pct > 40 ? 'MODERATE' : 'LOW RISK';
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ position:'relative', width:72, height:72, margin:'0 auto 8px' }}>
        <svg viewBox="0 0 36 36" style={{ width:72, height:72, transform:'rotate(-90deg)' }}>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e1e1e" strokeWidth="3"/>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${(pct/100)*100} 100`} strokeLinecap="round"/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span className="font-syne" style={{ fontSize:15, fontWeight:800, color }}>{pct}</span>
        </div>
      </div>
      <div className="font-mono" style={{ fontSize:9, color, letterSpacing:'0.1em' }}>{label}</div>
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
  const [risk, setRisk]             = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/predict/loss').catch(() => null),
      api.post('/risk/calculate', {}).catch(() => null),
    ]).then(([pred, rsk]) => {
      if (pred) setPrediction(pred.data);
      if (rsk) setRisk(rsk.data);
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
        toast.error('Fraud detected — payout blocked 🚨');
      } else {
        toast('Claim queued for review ⏳');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Simulation failed. Create a policy first.');
    } finally { setRunning(null); }
  };

  return (
    <div style={{ padding:'28px 32px', maxWidth:1100 }}>

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
      <div style={{ marginBottom:26 }}>
        <div className="font-mono" style={{ fontSize:10, color:'var(--text-muted)', letterSpacing:'0.14em', marginBottom:6 }}>DISASTER SIMULATION ENGINE</div>
        <h1 className="font-syne" style={{ fontSize:30, fontWeight:800, letterSpacing:'-0.02em', color:'var(--text-primary)', lineHeight:1.1 }}>
          Live Demo Simulator
        </h1>
        <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:6 }}>
          Click any disruption to trigger the full zero-touch claim pipeline — watch each step execute live.
        </p>
      </div>

      {/* Live Conditions Strip */}
      {!loadingData && prediction && (
        <motion.div
          initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          style={{ marginBottom:22, padding:'16px 20px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)' }}
        >
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div>
              <div className="font-mono" style={{ fontSize:9, color:'var(--green)', letterSpacing:'0.14em', textTransform:'uppercase' }}>Live Conditions — {prediction.city}</div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginTop:2 }}>Income Loss Prediction</div>
            </div>
            <div style={{
              padding:'5px 14px', borderRadius:6, fontSize:12, fontWeight:700,
              background: prediction.risk24h > 70 ? 'rgba(248,113,113,0.1)' : prediction.risk24h > 40 ? 'rgba(250,204,21,0.1)' : 'rgba(0,255,135,0.07)',
              border: `1px solid ${prediction.risk24h > 70 ? 'rgba(248,113,113,0.3)' : prediction.risk24h > 40 ? 'rgba(250,204,21,0.3)' : 'rgba(0,255,135,0.2)'}`,
              color: prediction.risk24h > 70 ? '#f87171' : prediction.risk24h > 40 ? '#facc15' : '#00ff87',
            }}>
              {prediction.risk24h}% 24h Risk
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
            {[
              { label:'Est. Loss Today', val:`₹${prediction.estimatedLoss24h}`, sub:'Income at risk', accent:'#f87171' },
              { label:'7-Day Loss Est.', val:`₹${prediction.totalWeeklyLoss}`, sub:'This week forecast', accent:'#fb923c' },
              { label:'Coverage Active', val:`₹${(prediction.coverageAmount||0).toLocaleString('en-IN')}`, sub:'Your protection', accent:'#00ff87' },
              { label:'Active Disruptions', val:prediction.disruptions?.length||0, sub:'Conditions triggering', accent:'#60a5fa' },
            ].map((k,i) => (
              <div key={i} style={{ padding:'12px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)' }}>
                <div className="font-syne" style={{ fontSize:20, fontWeight:800, color:k.accent }}>{k.val}</div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-primary)', marginTop:5 }}>{k.label}</div>
                <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', marginTop:2 }}>{k.sub}</div>
              </div>
            ))}
          </div>
          {prediction.disruptions?.length > 0 && (
            <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
              {prediction.disruptions.map((d,i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:20,
                  background: d.active ? 'rgba(248,113,113,0.1)' : 'rgba(250,204,21,0.07)',
                  border: `1px solid ${d.active ? 'rgba(248,113,113,0.25)' : 'rgba(250,204,21,0.2)'}`,
                }}>
                  <span>{d.icon}</span>
                  <span style={{ fontSize:11, fontWeight:600, color: d.active ? '#f87171' : '#facc15' }}>{d.label}</span>
                  <span className="font-mono" style={{ fontSize:9, color:'var(--text-muted)' }}>{d.value}{d.unit}</span>
                  {d.active && <span className="font-mono" style={{ fontSize:9, color:'#f87171' }}>LIVE</span>}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Trigger Buttons */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:28 }}>
        {SIMS.map(sim => (
          <motion.button
            key={sim.id}
            whileHover={{ y:-4, scale:1.02 }}
            whileTap={{ scale:0.97 }}
            onClick={() => run(sim)}
            disabled={!!running}
            style={{
              padding:'22px 14px', borderRadius:14,
              background: running === sim.id ? sim.color + '14' : 'var(--surface-1)',
              border: '1.5px solid ' + (running === sim.id ? sim.color : result?.simulationType?.includes(sim.id.toUpperCase()) ? sim.color+'60' : 'var(--border)'),
              cursor: running ? 'not-allowed' : 'pointer',
              textAlign:'center', opacity: running && running !== sim.id ? 0.4 : 1,
              transition:'all 0.2s',
            }}
          >
            <div style={{ fontSize:30, marginBottom:10, display:'inline-block',
              animation: running===sim.id ? 'wheelSpin 1s linear infinite' : 'none' }}>
              {running===sim.id ? '⚡' : sim.icon}
            </div>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)', marginBottom:5 }}>{sim.label}</div>
            <div className="font-mono" style={{ fontSize:9, color: running===sim.id ? sim.color : 'var(--text-muted)', letterSpacing:'0.06em' }}>
              {running===sim.id ? 'PROCESSING...' : sim.desc}
            </div>
            {running===sim.id && (
              <div style={{ marginTop:8, display:'flex', gap:4, justifyContent:'center' }}>
                {[0,1,2].map(i => (
                  <motion.div key={i}
                    animate={{ opacity:[0.3,1,0.3], scale:[0.8,1.1,0.8] }}
                    transition={{ repeat:Infinity, duration:0.9, delay:i*0.3 }}
                    style={{ width:4, height:4, borderRadius:'50%', background:sim.color }}
                  />
                ))}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Pipeline + Result */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, alignItems:'start' }}>

        {/* Left: Step-by-step pipeline */}
        <AnimatePresence>
          {visSteps.length > 0 && (
            <motion.div
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              style={{ padding:'22px 24px', borderRadius:14, background:'var(--surface-1)', border:'1px solid var(--border)' }}
            >
              <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:18 }}>
                Zero-Touch Pipeline — Live Execution
              </div>
              <div style={{ display:'flex', flexDirection:'column' }}>
                {visSteps.map((step, i) => {
                  const col = STEP_COLOR[step.status] || '#60a5fa';
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }}
                      transition={{ delay:0.04 }}
                      style={{ display:'flex', gap:14 }}
                    >
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:30, flexShrink:0 }}>
                        <div style={{
                          width:28, height:28, borderRadius:'50%',
                          background: col + '16', border:'1.5px solid ' + col,
                          display:'flex', alignItems:'center', justifyContent:'center', fontSize:13,
                        }}>
                          {step.status==='paid'?'✅':step.status==='blocked'?'🚫':step.icon}
                        </div>
                        {i < visSteps.length-1 && (
                          <div style={{ width:1, flexGrow:1, minHeight:16, background:'var(--border)', margin:'3px 0' }}/>
                        )}
                      </div>
                      <div style={{ paddingBottom:14, paddingTop:3 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:col }}>{step.label}</div>
                        <div className="font-mono" style={{ fontSize:10, color:'var(--text-secondary)', marginTop:2, lineHeight:1.5 }}>{step.detail}</div>
                        {step.fraudData && step.fraudData.flags?.length > 0 && (
                          <div style={{ marginTop:6, display:'flex', flexWrap:'wrap', gap:4 }}>
                            {step.fraudData.flags.map((f,fi) => (
                              <span key={fi} style={{
                                fontSize:9, padding:'2px 7px', borderRadius:4,
                                background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)',
                                color:'#f87171', fontFamily:'Space Mono',
                              }}>{f.type}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {running && (
                <div style={{ display:'flex', gap:5, marginTop:4, paddingLeft:44 }}>
                  {[0,1,2].map(i => (
                    <motion.div key={i}
                      animate={{ opacity:[0.3,1,0.3] }}
                      transition={{ repeat:Infinity, duration:0.8, delay:i*0.27 }}
                      style={{ width:5, height:5, borderRadius:'50%', background:'#60a5fa' }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right: Result panel */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              style={{ display:'flex', flexDirection:'column', gap:14 }}
            >
              {/* Outcome card */}
              <div style={{
                padding:'22px 24px', borderRadius:14,
                background: result.claim?.status==='paid' ? 'rgba(0,255,135,0.05)' : result.claim?.status==='rejected' ? 'rgba(248,113,113,0.05)' : 'rgba(250,204,21,0.05)',
                border: `1px solid ${result.claim?.status==='paid' ? 'rgba(0,255,135,0.2)' : result.claim?.status==='rejected' ? 'rgba(248,113,113,0.2)' : 'rgba(250,204,21,0.2)'}`,
              }}>
                <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:12 }}>Simulation Result</div>
                <div className="font-syne" style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)', marginBottom:4 }}>{result.summary}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:16 }}>
                  {[
                    { label:'Claim #', val:result.claim?.claimNumber },
                    { label:'Status', val:result.claim?.status?.toUpperCase() },
                    { label:'Payout', val:`₹${result.claim?.payoutAmount?.toFixed(0)}` },
                    { label:'Fraud Score', val:`${((result.fraud?.fraudScore||0)*100).toFixed(0)}/100` },
                  ].map((k,i) => (
                    <div key={i} style={{ padding:'10px 12px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)' }}>
                      <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.1em', textTransform:'uppercase' }}>{k.label}</div>
                      <div className="font-syne" style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginTop:3 }}>{k.val}</div>
                    </div>
                  ))}
                </div>
                {result.payout && (
                  <div style={{ marginTop:14, padding:'12px 14px', borderRadius:8, background:'rgba(0,255,135,0.08)', border:'1px solid rgba(0,255,135,0.2)' }}>
                    <div className="font-mono" style={{ fontSize:9, color:'#00ff87', letterSpacing:'0.12em', marginBottom:4 }}>UPI PAYMENT CONFIRMED</div>
                    <div style={{ fontSize:12, color:'var(--text-primary)' }}>₹{result.payout.amount.toFixed(0)} → {result.payout.upiId}</div>
                    <div className="font-mono" style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>TXN: {result.payout.txnId}</div>
                  </div>
                )}
              </div>

              {/* Fraud detail */}
              {result.fraud && (
                <div style={{ padding:'18px 20px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)' }}>
                  <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:10 }}>Fraud Analysis Detail</div>
                  <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12 }}>
                    <RiskMeter score={result.fraud.fraudScore} />
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{result.fraud.reason}</div>
                      <div className="font-mono" style={{ fontSize:10, color:'var(--text-muted)', marginTop:4 }}>
                        Decision: <span style={{ color: result.fraud.decision==='APPROVE'?'#00ff87':result.fraud.decision==='REJECT'?'#f87171':'#facc15' }}>
                          {result.fraud.decision}
                        </span>
                      </div>
                    </div>
                  </div>
                  {result.fraud.flags?.length > 0 ? (
                    result.fraud.flags.map((f,i) => (
                      <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:6 }}>
                        <span style={{ fontSize:11 }}>⚠️</span>
                        <div>
                          <span className="font-mono" style={{ fontSize:10, color:'#f87171' }}>{f.type}</span>
                          <span style={{ fontSize:10, color:'var(--text-muted)', marginLeft:6 }}>{f.detail}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span>✅</span>
                      <span style={{ fontSize:12, color:'#00ff87' }}>All fraud checks passed</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Placeholder before first run */}
        {!visSteps.length && !result && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ gridColumn:'1/-1', padding:'40px', borderRadius:14, background:'var(--surface-1)', border:'1px dashed var(--border)', textAlign:'center' }}
          >
            <div style={{ fontSize:40, marginBottom:14 }}>⚡</div>
            <div className="font-syne" style={{ fontSize:18, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>Click a disruption above to start</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', maxWidth:400, margin:'0 auto' }}>
              Watch the zero-touch claim pipeline execute — trigger detection → fraud check → auto payout — in real time.
            </div>
            <div style={{ marginTop:20, display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
              {['Disruption Detected','Worker Verified','Loss Calculated','Fraud Checked','Payout Credited'].map((s,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:20,
                  background:'var(--surface-2)', border:'1px solid var(--border)' }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)' }}/>
                  <span className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.08em' }}>{s}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* 7-day forecast strip */}
      {prediction?.forecast7d && (
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }}
          style={{ marginTop:22, padding:'20px 24px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)' }}
        >
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:2 }}>Income Loss Forecast</div>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>7-Day Disruption Outlook</div>
            </div>
            <div className="font-mono" style={{ fontSize:10, color:'var(--text-muted)' }}>
              Total at risk: <span style={{ color:'#f87171' }}>₹{prediction.totalWeeklyLoss}</span>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8 }}>
            {prediction.forecast7d.map((d,i) => {
              const col = d.riskPercent > 70 ? '#f87171' : d.riskPercent > 40 ? '#facc15' : '#00ff87';
              return (
                <div key={i} style={{ textAlign:'center', padding:'12px 6px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)' }}>
                  <div className="font-mono" style={{ fontSize:10, color:'var(--text-muted)', marginBottom:8 }}>{d.day}</div>
                  <div style={{ position:'relative', width:36, height:36, margin:'0 auto 8px' }}>
                    <svg viewBox="0 0 36 36" style={{ width:36, height:36, transform:'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e1e1e" strokeWidth="3"/>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke={col} strokeWidth="3"
                        strokeDasharray={`${d.riskPercent} 100`} strokeLinecap="round"/>
                    </svg>
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span className="font-mono" style={{ fontSize:8, color:col }}>{d.riskPercent}%</span>
                    </div>
                  </div>
                  <div className="font-syne" style={{ fontSize:12, fontWeight:700, color:col }}>₹{d.estimatedLoss}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
