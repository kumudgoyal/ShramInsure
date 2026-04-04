import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { StaticBike, MovingBikeStrip } from '../components/BikeGraphic';

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
    try { await api.post('/policies', qf); toast.success("Policy activated! You're covered 🛡️"); setShowQuote(false); setQuote(null); fetch_(); }
    catch (err) { toast.error(err.response?.data?.error||'Failed'); }
    finally { setCreating(false); }
  };
  const cancel_ = async (id) => {
    if (!confirm('Cancel this policy?')) return;
    try { await api.put(`/policies/${id}/cancel`); toast.success('Cancelled'); fetch_(); }
    catch (err) { toast.error(err.response?.data?.error||'Failed'); }
  };

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }} style={{ padding:'28px 32px', maxWidth:1000 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <div className="font-mono" style={{ fontSize:10, color:'var(--text-muted)', letterSpacing:'0.14em', marginBottom:6 }}>INSURANCE POLICY MANAGEMENT</div>
          <h1 className="font-syne" style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.02em', color:'var(--text-primary)', lineHeight:1.1 }}>My Policies</h1>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:6 }}>AI-priced weekly income protection · Dynamic Premium Calculation</p>
        </div>
        <button onClick={() => setShowQuote(true)} style={{ padding:'11px 22px', borderRadius:9, background:'var(--green)', border:'none', color:'#000', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
          + New Policy
        </button>
      </div>

      {/* AI Pricing explainer strip */}
      <div style={{ marginBottom:20, padding:'16px 20px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:'rgba(0,255,135,0.07)', border:'1px solid rgba(0,255,135,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🤖</div>
          <div>
            <div className="font-mono" style={{ fontSize:9, color:'var(--green)', letterSpacing:'0.12em', textTransform:'uppercase' }}>Dynamic Premium Engine</div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginTop:2 }}>AI-weighted risk factors: City base · Zone adjustment · Platform multiplier · Historical claims</div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {[
            { label:'City Risk', desc:'Historical disruption data per metro', icon:'🏙' },
            { label:'Zone Adj.', desc:'Hyper-local waterlogging & curfew', icon:'📍' },
            { label:'Platform ×', desc:'Delivery segment exposure factor', icon:'🛵' },
            { label:'Claims Hist.', desc:'+3% per prior claim, max 30%', icon:'📋' },
          ].map(f => (
            <div key={f.label} style={{ padding:'10px 12px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:16, marginBottom:5 }}>{f.icon}</div>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text-primary)' }}>{f.label}</div>
              <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2, lineHeight:1.4 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote drawer */}
      <AnimatePresence>
        {showQuote && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} style={{ marginBottom:20, overflow:'hidden' }}>
            <div style={{ padding:'22px', borderRadius:12, background:'var(--surface-1)', border:'1px solid rgba(0,255,135,0.15)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                <div>
                  <div className="font-mono" style={{ fontSize:9, color:'var(--green)', letterSpacing:'0.14em', textTransform:'uppercase' }}>AI Premium Calculator</div>
                  <div style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', marginTop:4 }}>Get an Instant Quote</div>
                </div>
                <button onClick={()=>{setShowQuote(false);setQuote(null);}} style={{ width:28, height:28, borderRadius:'50%', background:'var(--surface-3)', border:'1px solid var(--border)', color:'var(--text-secondary)', fontSize:13, cursor:'pointer' }}>✕</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:16 }}>
                {[{label:'City',key:'city',opts:CITIES},{label:'Zone',key:'zone',opts:ZONES}].map(({label,key,opts}) => (
                  <div key={key}>
                    <label className="font-mono" style={{ display:'block', fontSize:9, color:'var(--text-muted)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:7 }}>{label}</label>
                    <div style={{ position:'relative' }}>
                      <select value={qf[key]} onChange={e=>setQf(p=>({...p,[key]:e.target.value}))} style={{ width:'100%', padding:'10px 32px 10px 12px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text-primary)', fontSize:13, outline:'none', appearance:'none', cursor:'pointer' }}
                        onFocus={e=>e.target.style.borderColor='var(--green)'} onBlur={e=>e.target.style.borderColor='var(--border)'}>
                        {opts.map(o=><option key={o}>{o}</option>)}
                      </select>
                      <svg style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="10" height="6" viewBox="0 0 10 6" fill="none">
                        <path d="M1 1l4 4 4-4" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                ))}
                <div>
                  <label className="font-mono" style={{ display:'block', fontSize:9, color:'var(--text-muted)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:7 }}>Duration (weeks)</label>
                  <input type="number" min={1} max={52} value={qf.weeks} onChange={e=>setQf(p=>({...p,weeks:Number(e.target.value)}))} style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)', color:'var(--text-primary)', fontSize:13, outline:'none', fontFamily:'inherit' }}
                    onFocus={e=>e.target.style.borderColor='var(--green)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                </div>
              </div>
              <div style={{ display:'flex', gap:12, alignItems:'stretch' }}>
                <button onClick={getQuote} disabled={ql} style={{ padding:'11px 22px', borderRadius:8, background:'var(--surface-3)', border:'1px solid var(--border)', color:'var(--text-primary)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity:ql?0.5:1, whiteSpace:'nowrap' }}>
                  {ql ? '⏳ Calculating…' : '🤖 Calculate Premium'}
                </button>
                {quote && (
                  <motion.div initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} style={{ flex:1, display:'flex', alignItems:'center', gap:14, padding:'12px 18px', borderRadius:9, background:'rgba(0,255,135,0.05)', border:'1px solid rgba(0,255,135,0.15)' }}>
                    <div style={{ flex:1 }}>
                      <div className="font-mono" style={{ fontSize:9, color:'var(--green)', letterSpacing:'0.1em', textTransform:'uppercase' }}>AI Quote Ready</div>
                      <div className="font-syne" style={{ fontSize:24, fontWeight:800, color:'var(--green)', marginTop:2 }}>₹{quote.weeklyPremium}/wk</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>Coverage ₹{(quote.coverageAmount||0).toLocaleString('en-IN')} · Risk {(quote.riskScore*100).toFixed(0)}% · {quote.recommendation}</div>
                    </div>
                    {/* Breakdown toggle */}
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      <button onClick={()=>setShowBreakdown(v=>!v)} style={{ padding:'7px 12px', borderRadius:7, background:'transparent', border:'1px solid rgba(0,255,135,0.2)', color:'var(--green)', fontSize:11, cursor:'pointer', fontFamily:'monospace', whiteSpace:'nowrap' }}>
                        {showBreakdown ? 'Hide' : 'Breakdown'}
                      </button>
                      <button onClick={createPolicy} disabled={creating} style={{ padding:'8px 16px', borderRadius:7, background:'var(--green)', border:'none', color:'#000', fontSize:12, fontWeight:700, cursor:creating?'not-allowed':'pointer', fontFamily:'inherit', opacity:creating?0.5:1, whiteSpace:'nowrap' }}>
                        {creating ? 'Activating…' : 'Activate →'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
              {/* Premium breakdown */}
              <AnimatePresence>
                {quote && showBreakdown && (
                  <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} style={{ marginTop:14, overflow:'hidden' }}>
                    <div style={{ padding:'14px', borderRadius:9, background:'var(--surface-2)', border:'1px solid var(--border)' }}>
                      <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12 }}>AI Pricing Breakdown</div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
                        {quote.breakdown && Object.entries(quote.breakdown).map(([k,v]) => (
                          <div key={k} style={{ textAlign:'center', padding:'10px 8px', borderRadius:7, background:'var(--surface-3)', border:'1px solid var(--border)' }}>
                            <div className="font-syne" style={{ fontSize:16, fontWeight:700, color:'var(--green)' }}>{typeof v==='number'?v.toFixed(2):v}</div>
                            <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', marginTop:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>{k.replace(/([A-Z])/g,' $1').trim()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Policy list */}
      {loading ? (
        [1,2].map(i=><div key={i} style={{ height:140, background:'var(--surface-2)', borderRadius:12, marginBottom:12 }}/>)
      ) : policies.length===0 ? (
        <div style={{ textAlign:'center', padding:'60px 0' }}>
          <div className="animate-float" style={{ display:'inline-block', marginBottom:16 }}><StaticBike size={120} color="#00ff87" opacity={0.3}/></div>
          <div className="font-syne" style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>No Policies Yet</div>
          <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:24 }}>Get AI-priced coverage tailored to your delivery zone</p>
          <button onClick={()=>setShowQuote(true)} style={{ padding:'12px 24px', borderRadius:9, background:'var(--green)', border:'none', color:'#000', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Get Covered Now</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {policies.map((p,idx) => {
            const sc = STATUS_COLOR[p.status]||STATUS_COLOR.expired;
            const pct = Math.max(5,((new Date(p.end_date)-new Date())/(new Date(p.end_date)-new Date(p.start_date)))*100);
            return (
              <motion.div key={p.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}}
                style={{ padding:'22px 24px', borderRadius:12, background:'var(--surface-1)', border:'1px solid var(--border)', position:'relative', overflow:'hidden' }}>
                {/* Faded bike bg */}
                <div style={{ position:'absolute', right:-10, bottom:-10, opacity:0.05 }}>
                  <StaticBike size={130} color="#00ff87"/>
                </div>
                <div style={{ position:'relative' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                        <span className="font-mono" style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>{p.policy_number}</span>
                        <span className="font-mono" style={{ fontSize:9, padding:'3px 8px', borderRadius:4, background:sc.bg, border:`1px solid ${sc.border}`, color:sc.text, letterSpacing:'0.06em', textTransform:'uppercase' }}>{p.status}</span>
                      </div>
                      <div className="font-mono" style={{ fontSize:10, color:'var(--text-muted)' }}>{p.city} · {p.zone} Zone</div>
                    </div>
                    {p.status==='active' && (
                      <button onClick={()=>cancel_(p.id)} style={{ padding:'7px 14px', borderRadius:7, background:'transparent', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', fontSize:12, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}
                        onMouseEnter={e=>e.target.style.background='rgba(239,68,68,0.06)'}
                        onMouseLeave={e=>e.target.style.background='transparent'}>
                        Cancel
                      </button>
                    )}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:16 }}>
                    {[['Weekly Premium',`₹${p.weekly_premium}`],['Coverage',`₹${(p.coverage_amount||0).toLocaleString('en-IN')}`],['Expires',new Date(p.end_date).toLocaleDateString('en-IN')],['Risk Score',`${(p.risk_score*100).toFixed(0)}%`]].map(([k,v])=>(
                      <div key={k}>
                        <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>{k}</div>
                        <div className="font-mono" style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {p.status==='active' && (
                    <div>
                      <div style={{ height:2, background:'var(--surface-3)', borderRadius:1, overflow:'hidden' }}>
                        <motion.div initial={{width:0}} animate={{width:`${pct.toFixed(0)}%`}} transition={{duration:1,delay:0.3}} style={{ height:'100%', background:'var(--green)', borderRadius:1 }}/>
                      </div>
                      <div className="font-mono" style={{ fontSize:9, color:'var(--text-muted)', marginTop:5 }}>Coverage remaining</div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
