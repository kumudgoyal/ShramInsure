import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { StaticBike } from './BikeGraphic';

import { 
  LayoutDashboard, 
  Shield, 
  Activity, 
  Terminal, 
  ShieldCheck, 
  Lock, 
  Menu, 
  LogOut, 
  Clock, 
  Zap, 
  User, 
  Wallet,
  Settings,
  ChevronRight,
  X
} from 'lucide-react';

const NAV = [
  { to:'/dashboard', label:'Overview',  sub:'Stats & live env',    icon: LayoutDashboard },
  { to:'/policies',  label:'Policies',  sub:'Coverage plans',      icon: Shield },
  { to:'/claims',    label:'Claims',    sub:'Payouts & triggers',   icon: Activity },
  { to:'/simulate',  label:'Simulate',  sub:'Demo & live triggers', icon: Terminal },
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
  const [open, setOpen] = useState(false);
  useEffect(() => { const t = setInterval(() => setTick(new Date()), 1000); return () => clearInterval(t); }, []);
useEffect(() => {
  setOpen(false);
}, [location.pathname]);
  const handleLogout = () => { logout(); toast.success('Signed out'); navigate('/'); };
  const initials = user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || 'GP';
  const timeStr = tick.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
  const months = parseFloat(user?.premium_paid_months || 0);
  const accidentalActive = user?.accidental_cover_active === 1 || user?.accidental_cover_active === true;
  const monthsLeft = Math.max(0, 12 - months);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-surface-0 font-body">
      {open && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* ── SIDEBAR ── */}
      <aside
        onClick={(e) => e.stopPropagation()}
        className={`fixed z-50 top-0 left-0 h-full glass border-r border-border transform transition-all duration-500 ease-in-out
        ${open ? 'translate-x-0 opacity-100' : '-translate-x-full md:translate-x-0 opacity-100'} 
        md:static w-full max-w-[280px] flex flex-col overflow-hidden`}
      >
        {/* Animated accent line */}
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary to-transparent"
        />

        {/* Logo Section */}
        <div className="p-8 border-b border-white/[0.04]">
          <div className="flex items-center gap-4">
            <ShieldLogo />
            <div>
              <div className="font-display text-lg font-bold tracking-tight text-white leading-none">ShramInsure</div>
              <div className="font-mono text-[9px] text-primary tracking-[0.2em] mt-1.5 uppercase font-black">Secure Node</div>
            </div>
          </div>
        </div>

        {/* Live Status Bar */}
        <div className="px-8 py-3.5 border-b border-white/[0.04] bg-white/[0.02] flex items-center justify-between">
          <span className="font-mono text-[10px] text-text-muted font-bold tracking-tight">{timeStr}</span>
          <div className="flex items-center gap-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="font-mono text-[9px] text-primary font-black tracking-widest uppercase">Live</span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-4 mx-4 mt-6 glass rounded-2xl border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <span className="font-display text-sm font-black text-black">{initials}</span>
            </motion.div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{user?.name||'Gig Partner'}</div>
              <div className="font-mono text-[9px] text-text-muted uppercase tracking-wider mt-1">{user?.platform} · {user?.city}</div>
            </div>
          </div>
          
          <div className="mt-6 pt-5 border-t border-white/[0.04]">
            <div className="font-mono text-[9px] text-text-muted uppercase tracking-[0.15em] font-bold mb-1">Compute Balance</div>
            <motion.div
              key={user?.wallet_balance}
              initial={{ opacity:0, y:5 }}
              animate={{ opacity:1, y:0 }}
              className="font-display text-2xl font-bold text-white tracking-tight"
            >
              ₹{Number(user?.wallet_balance||0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              <span className="text-xs text-text-muted ml-0.5 font-medium italic">.avg</span>
            </motion.div>
          </div>
        </div>

        {/* Accidental Protection Status */}
        <div className="mx-4 mt-4 p-4 glass rounded-2xl border-white/[0.06] bg-white/[0.01]">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-text-muted uppercase font-bold tracking-widest">Protection Layer</span>
            {accidentalActive ? <ShieldCheck size={16} className="text-primary" /> : <Lock size={16} className="text-text-muted" />}
          </div>
          {accidentalActive ? (
            <div className="text-[10px] font-black text-primary uppercase tracking-wider animate-pulse flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
              </span>
              Premium Shield Active
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-mono text-[9px] text-text-muted uppercase font-bold">Unlocking Level</span>
                <span className="font-mono text-[9px] text-[#f59e0b] font-black">Stage {months.toFixed(0)}/12</span>
              </div>
              <div className="h-1 w-full bg-surface-3 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (months/12)*100)}%` }}
                  className="h-full bg-gradient-to-r from-[#f59e0b] to-primary rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 mt-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="px-4 mb-4 font-mono text-[9px] text-text-muted uppercase tracking-[0.2em] font-black">Main Interface</div>
          {NAV.map(({to, label, sub, icon: Icon}) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} className="block no-underline">
              {({isActive}) => (
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                    ${isActive ? 'glass bg-primary/10 border-primary/20 shadow-lg shadow-black/20' : 'hover:bg-white/[0.04]'}
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500
                    ${isActive ? 'bg-primary shadow-[0_0_15px_rgba(0,255,135,0.3)] scale-110' : 'bg-surface-3 group-hover:bg-surface-2'}
                  `}>
                    <Icon size={14} className={isActive ? 'text-black' : 'text-text-muted group-hover:text-text-secondary'} strokeWidth={isActive ? 3 : 2} />
                  </div>
                  <div>
                    <div className={`text-sm font-bold tracking-tight transition-colors ${isActive ? 'text-white' : 'text-text-secondary group-hover:text-white'}`}>{label}</div>
                    <div className="font-mono text-[8px] text-text-muted mt-0.5 font-bold uppercase tracking-tight">{sub}</div>
                  </div>
                  {isActive && (
                    <motion.div layoutId="active-pill" className="ml-auto w-1 h-4 bg-primary rounded-full" />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}

          {user?.is_admin && (
            <div className="mt-8 pt-6 border-t border-white/[0.04] space-y-2">
              <div className="px-4 mb-4 font-mono text-[9px] text-text-muted uppercase tracking-[0.2em] font-black">Authorized Only</div>
              <NavLink to="/admin" className="block no-underline">
                {({isActive}) => (
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`
                      flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                      ${isActive ? 'glass bg-[#f59e0b15] border-[#f59e0b30] shadow-lg shadow-black/20' : 'hover:bg-white/[0.04]'}
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500
                      ${isActive ? 'bg-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-110' : 'bg-surface-3 group-hover:bg-surface-2'}
                    `}>
                      <Settings size={14} className={isActive ? 'text-black' : 'text-text-muted group-hover:text-text-secondary'} strokeWidth={isActive ? 3 : 2} />
                    </div>
                    <div>
                      <div className={`text-sm font-bold tracking-tight transition-colors ${isActive ? 'text-white' : 'text-[#f59e0b]'}`}>Admin Panel</div>
                      <div className="font-mono text-[8px] text-text-muted mt-0.5 font-bold uppercase tracking-tight">System Oversight</div>
                    </div>
                  </motion.div>
                )}
              </NavLink>
            </div>
          )}
        </nav>

        {/* Footer / Control Section */}
        <div className="p-4 mt-auto border-t border-white/[0.04]">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-red-500/80 hover:text-red-400 hover:bg-red-500/5 transition-all uppercase tracking-widest font-mono"
          >
            <LogOut size={14} />
            De-Authorize
          </motion.button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        
        {/* Top Intelligence Bar */}
        <header className="flex-shrink-0 h-16 glass border-b border-border flex items-center justify-between px-6 z-30">
          
          <div className="flex items-center gap-6">
            <button
              className="md:hidden text-2xl text-white hover:text-primary transition-colors pr-4 border-r border-white/10"
              onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)] animate-pulse" />
              <div className="font-mono text-[10px] text-text-secondary tracking-[0.1em] font-bold uppercase">
                <span className="text-text-muted">ROOT /</span> {location.pathname.replace('/','') || 'dashboard'} 
                <span className="ml-3 px-2 py-0.5 rounded-md bg-white/[0.04] text-text-muted">WS-{Math.random().toString(36).substr(2, 4).toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-8">
            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="font-mono text-[9px] text-text-muted uppercase font-bold tracking-tight">Active Platform</div>
                <div className="text-[11px] font-bold text-white uppercase">{user?.platform || 'GigShield'}</div>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div>
                <div className="font-mono text-[9px] text-text-muted uppercase font-bold tracking-tight">System Load</div>
                <div className="text-[11px] font-bold text-primary">OPTIMAL</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 glass px-3 py-1.5 rounded-lg border-white/[0.04] bg-primary/5">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </div>
              <span className="font-mono text-[9px] text-primary font-black tracking-widest uppercase">Sync Active</span>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-0/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3, ease: 'circOut' }}
              className="min-h-full"
            >
              <Outlet/>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
