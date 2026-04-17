// src/components/Layout.jsx — Sidebar + main shell (role-based access)
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LiveBanner from './LiveBanner';
import { useState } from 'react';

// Worker nav only — admin sees different items
const WORKER_NAV = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard'  },
  { to: '/policies',  icon: '🛡️', label: 'My Policy'  },
  { to: '/claims',    icon: '📋', label: 'My Claims'  },
  { to: '/simulate',  icon: '🎯', label: 'Demo Sim'   },
];

const ADMIN_NAV = [
  { to: '/dashboard', icon: '🏠', label: 'Overview'   },
  { to: '/admin',     icon: '⚙️', label: 'Admin Panel', color: 'var(--accent-purple)' },
  { to: '/simulate',  icon: '🎯', label: 'Simulator'  },
];

const riskColor = s => s > 0.65 ? 'var(--accent-rose)' : s > 0.35 ? 'var(--accent-amber)' : 'var(--accent-green)';
const riskLabel = s => s > 0.65 ? 'HIGH RISK' : s > 0.35 ? 'MEDIUM' : 'LOW RISK';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const risk          = parseFloat(user?.risk_score || 0.5);
  const walletBalance = parseFloat(user?.wallet_balance || 0);
  const isAdmin       = Boolean(user?.is_admin);
  const isAccActive   = user?.accidental_cover_active === 1;
  const months        = parseFloat(user?.premium_paid_months || 0);
  const nav           = isAdmin ? ADMIN_NAV : WORKER_NAV;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: 255, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ padding: '1.25rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--grad-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>ShramInsure</div>
              <div style={{ fontSize: '.63rem', color: 'var(--accent-green)', fontWeight: 700, letterSpacing: '.05em' }}>
                {isAdmin ? 'ADMIN PANEL' : 'Q-COMMERCE PROTECTION'}
              </div>
            </div>
          </div>
        </div>

        {/* User card */}
        <div style={{ padding: '.9rem 1.2rem', borderBottom: '1px solid var(--border)', background: isAdmin ? 'rgba(139,92,246,.04)' : 'rgba(16,185,129,.04)' }}>
          <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.35rem' }}>
            {isAdmin ? '⚙️ Administrator' : '🛵 Gig Worker'}
          </div>
          <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '.15rem', color: 'var(--text-primary)' }}>{user?.name || '—'}</div>
          <div style={{ fontSize: '.73rem', color: 'var(--text-secondary)', marginBottom: '.65rem' }}>
            📱 {user?.phone}
            {!isAdmin && ` · ${user?.platform}`}
          </div>

          {/* Risk meter — workers only */}
          {!isAdmin && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: 'var(--text-muted)', marginBottom: '.25rem' }}>
                <span>Risk Score</span>
                <span style={{ color: riskColor(risk), fontWeight: 700 }}>{riskLabel(risk)}</span>
              </div>
              <div className="risk-bar-track" style={{ marginBottom: '.5rem' }}>
                <div className="risk-bar-fill" style={{ width: `${risk * 100}%`, background: riskColor(risk) }} />
              </div>
            </>
          )}

          {/* City */}
          {!isAdmin && (
            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
              📍 {user?.city}, {user?.zone}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '.65rem .75rem' }}>
          {nav.map(({ to, icon, label, color }) => {
            const ac = color || 'var(--accent-green)';
            return (
              <NavLink key={to} to={to} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '.7rem',
                padding: '.6rem .85rem', borderRadius: 'var(--radius-md)',
                marginBottom: '.15rem', textDecoration: 'none', fontSize: '.875rem', fontWeight: 600,
                transition: 'all .15s',
                background: isActive ? `${ac}18` : 'transparent',
                color:      isActive ? ac : 'var(--text-secondary)',
                borderLeft: isActive ? `3px solid ${ac}` : '3px solid transparent',
              })}>
                <span style={{ fontSize: '1.05rem' }}>{icon}</span>
                {label}
              </NavLink>
            );
          })}
        </nav>

        {/* Wallet + logout */}
        <div style={{ padding: '.9rem 1.2rem', borderTop: '1px solid var(--border)' }}>
          {!isAdmin && (
            <div style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.18)', borderRadius: 'var(--radius-md)', padding: '.65rem .9rem', marginBottom: '.65rem' }}>
              <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '.15rem' }}>WALLET BALANCE</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-green)' }}>₹{walletBalance.toLocaleString('en-IN')}</div>
              {isAccActive && <div style={{ fontSize: '.65rem', color: 'var(--accent-green)', marginTop: '.2rem' }}>✅ Accidental Cover Active</div>}
              {!isAccActive && months > 0 && (
                <>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', marginTop: '.4rem', marginBottom: '.2rem' }}>Acc. Cover: {months.toFixed(0)}/12 months paid</div>
                  <div className="risk-bar-track" style={{ height: 4 }}>
                    <div className="risk-bar-fill" style={{ width: `${Math.min((months / 12) * 100, 100)}%`, background: 'var(--accent-amber)' }} />
                  </div>
                </>
              )}
            </div>
          )}
          <button className="btn btn-outline btn-sm btn-block" onClick={handleLogout}>🚪 Sign Out</button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <LiveBanner />

        {/* Story UX banner for workers with payouts */}
        {!isAdmin && walletBalance > 0 && (
          <div style={{
            padding: '.5rem 1.5rem',
            background: 'rgba(16,185,129,.05)',
            borderBottom: '1px solid rgba(16,185,129,.12)',
            fontSize: '.78rem', color: 'var(--accent-green)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '.5rem',
          }}>
            <span>💚</span>
            <span>ShramInsure has auto-credited <strong>₹{walletBalance.toLocaleString('en-IN')}</strong> to your UPI — zero paperwork, zero waiting.</span>
          </div>
        )}

        <div style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '1.75rem 1.5rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
