import { useState, useEffect, useRef } from 'react';
import { geo } from '../utils/api';

export default function CitySelect({ value, onChange, label = 'City', geoCity, geoLoading }) {
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);
  const [cities, setCities] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    geo.cities().then(r => setCities(r.cities || [])).catch(() => {
      setCities([
        'Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Pune','Kolkata',
        'Ahmedabad','Jaipur','Surat','Lucknow','Nagpur','Indore','Bhopal',
        'Patna','Vadodara','Gurgaon','Noida','Chandigarh','Kochi','Visakhapatnam',
      ].map(c => ({ city: c })));
    });
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query
    ? cities.filter(c => c.city.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : cities.slice(0, 8);

  return (
    <div className="form-group" ref={ref} style={{ position: 'relative' }}>
      <label className="label">
        🏙️ {label}
        {geoLoading && <span style={{ marginLeft: '.4rem', fontSize: '.65rem', color: 'var(--accent-amber)' }}>⏳ detecting…</span>}
        {geoCity && !geoLoading && <span style={{ marginLeft: '.4rem', fontSize: '.65rem', color: 'var(--accent-green)' }}>📍 auto-detected</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          placeholder={value || 'Search city…'}
          value={open ? query : value}
          onFocus={() => { setOpen(true); setQuery(''); }}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          readOnly={!open}
          style={{ cursor: 'pointer', paddingRight: '2rem' }}
        />
        <span style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: '.8rem' }}>
          {open ? '▲' : '▼'}
        </span>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
          background: 'var(--bg-card)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
          maxHeight: 220, overflowY: 'auto', marginTop: 4,
        }}>
          {filtered.length === 0
            ? <div style={{ padding: '.75rem 1rem', color: 'var(--text-muted)', fontSize: '.85rem' }}>No cities found</div>
            : filtered.map(c => (
                <div key={c.city}
                  onClick={() => { onChange(c.city); setQuery(''); setOpen(false); }}
                  style={{
                    padding: '.6rem 1rem', cursor: 'pointer', fontSize: '.875rem',
                    color: c.city === value ? 'var(--accent-green)' : 'var(--text-primary)',
                    background: c.city === value ? 'rgba(16,185,129,.08)' : 'transparent',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                  onMouseLeave={e => e.currentTarget.style.background = c.city === value ? 'rgba(16,185,129,.08)' : 'transparent'}
                >
                  {c.city}
                  {c.state && <span style={{ marginLeft: '.5rem', fontSize: '.72rem', color: 'var(--text-muted)' }}>{c.state}</span>}
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
}
