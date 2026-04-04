import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  paid:     { bg:'rgba(0,255,135,0.07)',  border:'rgba(0,255,135,0.18)',  text:'#00ff87' },
  approved: { bg:'rgba(59,130,246,0.07)', border:'rgba(59,130,246,0.18)', text:'#60a5fa' },
  pending:  { bg:'rgba(234,179,8,0.07)',  border:'rgba(234,179,8,0.18)',  text:'#facc15' },
  rejected: { bg:'rgba(239,68,68,0.07)',  border:'rgba(239,68,68,0.18)',  text:'#f87171' },
};
const TRIGGER_EMOJI  = { WEATHER_RAIN:'🌧', WEATHER_HEAT:'🌡', POLLUTION_AQI:'💨', WEATHER_STORM:'⛈', CIVIL_CURFEW:'🚫', FLOOD_ALERT:'🌊', ACCIDENT:'🚑' };
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
      if (data.claimsCreated > 0) { toast.success(`${data.claimsCreated} claim(s) auto-filed 🛡️`); fetch_(); }
      else toast('No new disruptions detected', { icon:'✅' });
    } catch { toast.error('Scan failed'); }
    finally { setScanning(false); }
  };

  const payout = async (id) => {
    setPaying(true);
    try {
      const { data } = await api.post(`/claims/simulate-payout/${id}`, { upi_id:'worker@upi' });
      const amt = parseFloat(data.amount) || 0;
      toast.success(`₹${amt.toFixed(0)} credited! TXN: ${data.txnId} 💸`, { duration:6000 });
      setSelected(null); fetch_();
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
  const FILTERS = ['all','pending','approved','paid','rejected'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ padding:'28px 32px', maxWidth:1000 }}
    >
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
        <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }}>
          <div className="font-mono" style={{ fontSize:10, color:'var(--text-muted)', letterSpacing:'0.14em', marginBottom:6 }}>ZERO-TOUCH CLAIMS MANAGEMENT</div>
          <h1 className="font-syne" style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.02em', color:'var(--text-primary)', lineHeight:1.1 }}>Claims Ledger</h1>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:6 }}>Automated parametric trigger system · 6 disruption types monitored</p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={runScan}
          disabled={scanning}
          style={{
            padding:'11px 22px', borderRadius:9,
            background: scanning ? 'var(--surface-3)' : 'rgba(249,115,22,0.85)',
            border:'none', color: scanning ? 'var(--text-muted)' : '#fff',
            fontSize:13, fontWeight:700, cursor: scanning ? 'not-allowed' : 'pointer', fontFamily:'inherit',
          }}
        >
          <motion.span
            animate={scanning ? { rotate: 360 } : {}}
            transition={{ duration:1, repeat:Infinity, ease:'linear' }}
            style={{ display:'inline-block', marginRight:6 }}
          >⚡</motion.span>
          {scanning ? 'Scanning…' : 'Simulate Disruption'}
        </motion.button>
      </div>

      {/* Trigger types reference */}
      <motion.div
        initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
        style={{ marginBottom:20, padding:'16px 20px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)' }}
      >
        <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:12 }}>
          Parametric Triggers — Auto-Claim Thresholds
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10 }}>
          {[
            {type:'WEATHER_RAIN'},{type:'WEATHER_HEAT'},{type:'POLLUTION_AQI'},
            {type:'WEATHER_STORM'},{type:'CIVIL_CURFEW'},{type:'FLOOD_ALERT'},
          ].map(({type}, i) => (
            <motion.div
              key={type}
              initial={{ opacity:0, scale:0.9 }}
              animate={{ opacity:1, scale:1 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              whileHover={{ scale:1.04, y:-2 }}
              style={{ padding:'10px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)', textAlign:'center', cursor:'default' }}
            >
              <div style={{ fontSize:18, marginBottom:5 }}>{TRIGGER_EMOJI[type]}</div>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text-primary)', lineHeight:1.3 }}>{TRIGGER_LABEL[type]}</div>
              <div className="font-mono" style={{ fontSize:9, color:'var(--green)', marginTop:5 }}>{TRIGGER_THRESH[type]}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {[
          {label:'Total Claims', val:totals.total, accent:'var(--text-muted)', isNum:true},
          {label:'Paid Out',     val:totals.paid,  accent:'var(--green)', isNum:true},
          {label:'Pending',      val:totals.pending, accent:'#facc15', isNum:true},
          {label:'Total Payout', val:totals.totalPayout, accent:'#60a5fa', isNum:false, prefix:'₹'},
        ].map((s,i) => (
          <motion.div
            key={i}
            initial={{ opacity:0, y:12 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            style={{ padding:'16px 18px', borderRadius:10, background:'var(--surface-1)', border:'1px solid var(--border)', position:'relative', overflow:'hidden' }}
          >
            <motion.div
              style={{ position:'absolute', top:0, left:0, right:0, height:2, background:s.accent, originX:0 }}
              initial={{ scaleX:0 }}
              animate={{ scaleX:1 }}
              transition={{ delay: 0.3 + i * 0.07, duration:0.5 }}
            />
            <div className="font-syne" style={{ fontSize:24, fontWeight:800, color:'var(--text-primary)', marginTop:4 }}>
              {s.isNum ? <CountUp value={s.val} /> : <CountUp value={s.val} prefix={s.prefix} />}
            </div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:6 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
        {FILTERS.map(f => (
          <motion.button
            key={f}
            whileHover={{ scale:1.05 }}
            whileTap={{ scale:0.97 }}
            onClick={() => setFilter(f)}
            style={{
              padding:'6px 14px', borderRadius:6,
              border:`1px solid ${filter===f ? 'var(--green)' : 'var(--border)'}`,
              background: filter===f ? 'rgba(0,255,135,0.08)' : 'transparent',
              color: filter===f ? 'var(--green)' : 'var(--text-muted)',
              fontFamily:'Space Mono', fontSize:10, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer',
            }}
          >{f}</motion.button>
        ))}
      </div>

      {/* Claims list */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[1,2,3].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.4,0.7,0.4] }}
              transition={{ duration:1.5, repeat:Infinity, delay:i*0.2 }}
              style={{ height:70, background:'var(--surface-2)', borderRadius:10 }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ textAlign:'center', padding:'60px 0' }}>
          <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:2, repeat:Infinity }} style={{ fontSize:40, marginBottom:12 }}>📋</motion.div>
          <div className="font-syne" style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>No Claims Yet</div>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>Run a disruption scan to auto-file claims</p>
        </motion.div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map((c, idx) => {
            const sc = STATUS_COLOR[c.status] || STATUS_COLOR.pending;
            const payoutAmt = parseFloat(c.payout_amount) || 0;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale:1.01, borderColor:'var(--border-bright)' }}
                onClick={() => setSelected(c)}
                style={{ padding:'16px 20px', borderRadius:10, background:'var(--surface-1)', border:'1px solid var(--border)', cursor:'pointer', transition:'border-color 0.15s' }}
              >
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <motion.div
                      whileHover={{ rotate: [0,-10,10,0] }}
                      transition={{ duration:0.4 }}
                      style={{ width:40, height:40, borderRadius:9, background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}
                    >
                      {TRIGGER_EMOJI[c.trigger_type] || '⚡'}
                    </motion.div>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                        <span className="font-mono" style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)' }}>{c.claim_number}</span>
                        <span className="font-mono" style={{ fontSize:9, padding:'2px 7px', borderRadius:3, background:sc.bg, border:`1px solid ${sc.border}`, color:sc.text, letterSpacing:'0.06em', textTransform:'uppercase' }}>{c.status}</span>
                        {c.auto_triggered===1 && <span className="font-mono" style={{ fontSize:9, padding:'2px 7px', borderRadius:3, background:'rgba(0,255,135,0.05)', border:'1px solid rgba(0,255,135,0.12)', color:'#00c968', letterSpacing:'0.06em' }}>AUTO</span>}
                      </div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{TRIGGER_LABEL[c.trigger_type] || c.trigger_type} · {new Date(c.created_at).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div className="font-syne" style={{ fontSize:20, fontWeight:800, color: payoutAmt > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      ₹{payoutAmt.toFixed(0)}
                    </div>
                    {c.status === 'approved' && (
                      <motion.button
                        whileHover={{ scale:1.05 }}
                        whileTap={{ scale:0.97 }}
                        onClick={e => { e.stopPropagation(); payout(c.id); }}
                        disabled={paying}
                        style={{ marginTop:4, padding:'5px 12px', borderRadius:6, background:'var(--green)', border:'none', color:'#000', fontSize:11, fontWeight:700, cursor: paying ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}
                      >
                        Claim Payout
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setSelected(null)}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:100, backdropFilter:'blur(4px)' }}
            />
            <motion.div
              initial={{ opacity:0, y:30, scale:0.94 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:20, scale:0.96 }}
              transition={{ type:'spring', stiffness:320, damping:28 }}
              style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:101, width:'100%', maxWidth:480, padding:'28px', borderRadius:14, background:'var(--surface-1)', border:'1px solid var(--border-bright)' }}
            >
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
                <div>
                  <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:4 }}>Claim Detail</div>
                  <div className="font-syne" style={{ fontSize:20, fontWeight:800, color:'var(--text-primary)' }}>{selected.claim_number}</div>
                </div>
                <motion.button
                  whileHover={{ scale:1.1, rotate:90 }}
                  onClick={() => setSelected(null)}
                  style={{ width:28, height:28, borderRadius:'50%', background:'var(--surface-3)', border:'1px solid var(--border)', color:'var(--text-secondary)', fontSize:13, cursor:'pointer' }}
                >✕</motion.button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:22 }}>
                {[
                  ['Trigger Type', TRIGGER_LABEL[selected.trigger_type] || selected.trigger_type],
                  ['Threshold', TRIGGER_THRESH[selected.trigger_type] || '—'],
                  ['Status', selected.status.toUpperCase()],
                  ['Payout Amount', `₹${(parseFloat(selected.payout_amount)||0).toFixed(0)}`],
                  ['Filed On', new Date(selected.created_at).toLocaleString('en-IN')],
                  ['Fraud Score', `${((selected.fraud_score||0)*100).toFixed(0)}%`],
                  ['Auto-Filed', selected.auto_triggered===1 ? 'Yes — Parametric' : 'No — Manual'],
                  ['Claim #', selected.claim_number],
                ].map(([k,v], i) => (
                  <motion.div
                    key={k}
                    initial={{ opacity:0, y:6 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ padding:'12px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)' }}
                  >
                    <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:5 }}>{k}</div>
                    <div className="font-mono" style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)' }}>{v}</div>
                  </motion.div>
                ))}
              </div>
              {selected.status === 'approved' && (
                <motion.button
                  whileHover={{ scale:1.02 }}
                  whileTap={{ scale:0.98 }}
                  onClick={() => payout(selected.id)}
                  disabled={paying}
                  style={{ width:'100%', padding:'13px', borderRadius:9, background:'var(--green)', border:'none', color:'#000', fontSize:14, fontWeight:700, cursor: paying ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}
                >
                  {paying ? '⏳ Processing…' : '💸 Claim Payout →'}
                </motion.button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
