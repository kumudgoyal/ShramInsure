import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { StaticBike } from './BikeGraphic';

const NAV = [
  { to:'/dashboard', label:'Overview',  sub:'Stats & live env',    d:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { to:'/policies',  label:'Policies',  sub:'Coverage plans',      d:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { to:'/claims',    label:'Claims',    sub:'Payouts & triggers',   d:'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { to:'/simulate',  label:'Simulate',  sub:'Demo & live triggers', d:'M13 10V3L4 14h7v7l9-11h-7z' },
];

// Animated shield logo
const ShieldLogo = () => (
  <motion.div
    animate={{ scale: [1, 1.07, 1] }}
    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    style={{ width:36, height:36, borderRadius:9, background:'rgba(0,255,135,0.07)',
      border:'1px solid rgba(0,255,135,0.22)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#00ff87" strokeWidth="1.8" fill="rgba(0,255,135,0.08)"/>
      <path d="M12 22V12M3 7l9 5 9-5" stroke="#00ff87" strokeWidth="1.5"/>
    </svg>
  </motion.div>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tick, setTick] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTick(new Date()), 1000); return () => clearInterval(t); }, []);

  const handleLogout = () => { logout(); toast.success('Signed out'); navigate('/'); };
  const initials = user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || 'GP';
  const timeStr = tick.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
  const months = parseFloat(user?.premium_paid_months || 0);
  const accidentalActive = user?.accidental_cover_active === 1 || user?.accidental_cover_active === true;
  const monthsLeft = Math.max(0, 12 - months).toFixed(1);

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--surface)'}}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width:248, flexShrink:0, display:'flex', flexDirection:'column',
        background:'var(--surface-1)', borderRight:'1px solid var(--border)',
        position:'relative', overflow:'hidden',
      }}>
        {/* Animated green left pulse line */}
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{position:'absolute',left:0,top:0,bottom:0,width:2,
            background:'linear-gradient(180deg,transparent,var(--green) 40%,transparent)'}}
        />

        {/* Logo */}
        <div style={{padding:'22px 20px 16px',borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <ShieldLogo />
            <div>
              <div className="font-syne" style={{fontSize:17,fontWeight:800,letterSpacing:'-0.02em',color:'var(--text-primary)',lineHeight:1}}>ShramInsure</div>
              <div className="font-mono" style={{fontSize:9,color:'var(--green)',letterSpacing:'0.12em',marginTop:3}}>INCOME PROTECTION</div>
            </div>
          </div>
        </div>

        {/* Live clock */}
        <div style={{padding:'9px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span className="font-mono" style={{fontSize:10,color:'var(--text-muted)',letterSpacing:'0.03em'}}>{timeStr}</span>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <motion.div
              className="live-dot"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="font-mono" style={{fontSize:9,color:'var(--green)',letterSpacing:'0.1em'}}>LIVE</span>
          </div>
        </div>

        {/* Worker card */}
        <div style={{margin:'14px 14px 0',padding:'13px',background:'var(--surface-2)',borderRadius:10,border:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <motion.div
              whileHover={{ scale: 1.08 }}
              style={{width:36,height:36,borderRadius:'50%',flexShrink:0,
                background:'linear-gradient(135deg,#00ff87,#00c968)',
                display:'flex',alignItems:'center',justifyContent:'center',cursor:'default'}}
            >
              <span className="font-syne" style={{fontSize:12,fontWeight:800,color:'#000'}}>{initials}</span>
            </motion.div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:'var(--text-primary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.name||'Gig Partner'}</div>
              <div className="font-mono" style={{fontSize:9,color:'var(--text-muted)',letterSpacing:'0.04em',marginTop:2,textTransform:'uppercase'}}>{user?.platform} · {user?.city}</div>
            </div>
          </div>
          <div style={{marginTop:12,paddingTop:11,borderTop:'1px solid var(--border)'}}>
            <div className="font-mono" style={{fontSize:9,color:'var(--text-muted)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Wallet Balance</div>
            <motion.div
              key={user?.wallet_balance}
              initial={{ scale: 1.1, color: '#00ff87' }}
              animate={{ scale: 1 }}
              className="font-syne"
              style={{fontSize:24,fontWeight:800,color:'var(--green)',marginTop:2,letterSpacing:'-0.02em',lineHeight:1}}
            >
              ₹{Number(user?.wallet_balance||0).toLocaleString('en-IN',{minimumFractionDigits:2})}
            </motion.div>
          </div>
        </div>

        {/* Accidental cover badge */}
        <motion.div
          animate={accidentalActive ? { borderColor: ['rgba(0,255,135,0.1)', 'rgba(0,255,135,0.4)', 'rgba(0,255,135,0.1)'] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          style={{margin:'8px 14px 0',padding:'9px 12px',
            background: accidentalActive ? 'rgba(0,255,135,0.06)' : 'rgba(255,165,0,0.04)',
            borderRadius:8, border: accidentalActive ? '1px solid rgba(0,255,135,0.2)' : '1px solid rgba(255,165,0,0.15)'}}
        >
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
            <span className="font-mono" style={{fontSize:9,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase'}}>Accidental Cover</span>
            <span style={{fontSize:11}}>{accidentalActive ? '🛡️' : '🔒'}</span>
          </div>
          {accidentalActive
            ? <div className="font-mono" style={{fontSize:10,color:'var(--green)',fontWeight:700}}>ACTIVE · Premium Member</div>
            : <div className="font-mono" style={{fontSize:9,color:'#f59e0b'}}>{monthsLeft} months to activate</div>
          }
          {!accidentalActive && (
            <div style={{marginTop:5,height:3,background:'var(--border)',borderRadius:2,overflow:'hidden'}}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (months/12)*100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{height:'100%',background:'linear-gradient(90deg,#f59e0b,#00ff87)',borderRadius:2}}
              />
            </div>
          )}
        </motion.div>

        {/* Zone badge */}
        <div style={{margin:'6px 14px 0',padding:'7px 12px',background:'rgba(0,255,135,0.03)',borderRadius:7,border:'1px solid rgba(0,255,135,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span className="font-mono" style={{fontSize:10,color:'var(--text-secondary)'}}>{user?.zone} Zone</span>
          {user?.is_admin
            ? <span className="font-mono" style={{fontSize:9,color:'#f59e0b',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',padding:'2px 7px',borderRadius:3,letterSpacing:'0.06em'}}>ADMIN</span>
            : <span className="font-mono" style={{fontSize:9,color:'var(--green)',background:'rgba(0,255,135,0.07)',border:'1px solid rgba(0,255,135,0.18)',padding:'2px 7px',borderRadius:3,letterSpacing:'0.06em'}}>ACTIVE</span>
          }
        </div>

        {/* Tiny bike decoration */}
        <div style={{padding:'10px 14px 0',opacity:0.35}}>
          <StaticBike size={64} color="#00ff87"/>
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:'10px 10px',display:'flex',flexDirection:'column',gap:2}}>
          <div className="font-mono" style={{fontSize:9,color:'var(--text-muted)',letterSpacing:'0.14em',textTransform:'uppercase',paddingLeft:8,marginBottom:5}}>Navigation</div>
          {NAV.map(({to,label,sub,d}) => (
            <NavLink key={to} to={to} style={{textDecoration:'none'}}>
              {({isActive}) => (
                <motion.div
                  whileHover={{ x: 2 }}
                  style={{
                    display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,
                    background:isActive?'rgba(0,255,135,0.07)':'transparent',
                    border:`1px solid ${isActive?'rgba(0,255,135,0.16)':'transparent'}`,
                    transition:'background 0.15s,border 0.15s',cursor:'pointer',position:'relative',
                  }}>
                  {isActive && <motion.div layoutId="nav-indicator" style={{position:'absolute',left:0,top:'22%',bottom:'22%',width:2,background:'var(--green)',borderRadius:2}}/>}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive?'#00ff87':'#505050'} strokeWidth="1.8">
                    <path d={d} strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div style={{fontSize:13,fontWeight:isActive?600:500,color:isActive?'var(--text-primary)':'var(--text-secondary)',lineHeight:1.2}}>{label}</div>
                    <div className="font-mono" style={{fontSize:9,color:'var(--text-muted)',marginTop:2}}>{sub}</div>
                  </div>
                </motion.div>
              )}
            </NavLink>
          ))}
          {user?.is_admin && (
            <NavLink to="/admin" style={{textDecoration:'none'}}>
              {({isActive}) => (
                <motion.div whileHover={{ x: 2 }} style={{
                  display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,
                  background:isActive?'rgba(245,158,11,0.07)':'transparent',
                  border:`1px solid ${isActive?'rgba(245,158,11,0.16)':'transparent'}`,
                  transition:'background 0.15s',cursor:'pointer',position:'relative',
                }}>
                  {isActive && <div style={{position:'absolute',left:0,top:'22%',bottom:'22%',width:2,background:'#f59e0b',borderRadius:2}}/>}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive?'#f59e0b':'#505050'} strokeWidth="1.8">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                  <div>
                    <div style={{fontSize:13,fontWeight:isActive?600:500,color:isActive?'var(--text-primary)':'var(--text-secondary)',lineHeight:1.2}}>Admin</div>
                    <div className="font-mono" style={{fontSize:9,color:'var(--text-muted)',marginTop:2}}>Risk analytics</div>
                  </div>
                </motion.div>
              )}
            </NavLink>
          )}
        </nav>

        {/* Logout */}
        <div style={{padding:'12px 10px',borderTop:'1px solid var(--border)'}}>
          <motion.button
            whileHover={{ x: 3 }}
            onClick={handleLogout}
            style={{width:'100%',display:'flex',alignItems:'center',gap:10,
              padding:'9px 12px',borderRadius:8,border:'none',
              background:'transparent',cursor:'pointer',fontSize:13,color:'var(--text-muted)',fontFamily:'inherit'}}
            onMouseEnter={e=>{e.currentTarget.style.color='#f87171';}}
            onMouseLeave={e=>{e.currentTarget.style.color='var(--text-muted)';}}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </motion.button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{flex:1,overflow:'auto',display:'flex',flexDirection:'column',minWidth:0}}>
        {/* Topbar */}
        <div style={{
          padding:'12px 28px',borderBottom:'1px solid var(--border)',
          display:'flex',alignItems:'center',justifyContent:'space-between',
          background:'var(--surface-1)',flexShrink:0,
        }}>
          <span className="font-mono" style={{fontSize:10,color:'var(--text-muted)',letterSpacing:'0.12em',textTransform:'uppercase'}}>
            ShramInsure / {location.pathname.replace('/','') || 'dashboard'}
          </span>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <motion.div
                className="live-dot"
                animate={{ scale: [1,1.5,1], opacity:[1,0.4,1] }}
                transition={{ duration:1.5, repeat:Infinity }}
              />
              <span className="font-mono" style={{fontSize:10,color:'var(--green)',letterSpacing:'0.06em'}}>Systems Operational</span>
            </div>
            <div style={{height:14,width:1,background:'var(--border)'}}/>
            <span className="font-mono" style={{fontSize:10,color:'var(--text-muted)'}}>{user?.platform}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{opacity:0,y:12}}
            animate={{opacity:1,y:0}}
            exit={{opacity:0,y:-8}}
            transition={{duration:0.25}}
            style={{flex:1}}
          >
            <Outlet/>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
