'use client';

import { useState } from 'react';

const C = {
  bg: '#FBF7F0',
  surface: '#FFFFFF',
  surface2: '#F5EFE6',
  border: 'rgba(16,42,67,0.1)',
  accent: '#C9A84C',
  accentLight: '#E8D49A',
  accentDark: '#A8882B',
  navy: '#102A43',
  navyLight: '#1E4063',
  text: '#102A43',
  textSec: '#2D4A6B',
  muted: '#6B7280',
  error: '#DC2626',
  success: '#16A34A',
};

const SUPABASE_URL = 'https://oapahwsqehtxawrvsqkg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YFvoGX2PUJTIyWWHGctD-Q_-A-EKzOr';

const TOP_COMPANIES = [
  'ICON', 'Dvele', 'Plant Prefab', 'Method Homes',
  'Mighty Buildings', 'Abodu', 'Boxabl', 'Cover',
];

const ALERT_TYPES = [
  { value: 'waitlist_open', label: 'Waitlist opens' },
  { value: 'new_state', label: 'New state availability' },
  { value: 'price_drop', label: 'Price drop' },
  { value: 'new_model', label: 'New model/design' },
];

interface AlertSignupProps {
  compact?: boolean;
  title?: string;
}

export default function AlertSignup({ compact = false, title = 'Get Alerts' }: AlertSignupProps) {
  const [email, setEmail] = useState('');
  const [companies, setCompanies] = useState<string[]>([]);
  const [alertType, setAlertType] = useState('waitlist_open');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const toggleCompany = (c: string) => {
    setCompanies(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (companies.length === 0) {
      setError('Select at least one company to watch.');
      return;
    }
    setSubmitting(true);
    setError('');

    // Submit one row per company
    try {
      const rows = companies.map(c => ({
        email: email.trim().toLowerCase(),
        company_name: c,
        alert_type: alertType,
      }));

      const res = await fetch(`${SUPABASE_URL}/rest/v1/prefab_alerts`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(rows),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `${res.status}`);
      }
      setSubmitted(true);
      setEmail(''); setCompanies([]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Failed to set alert: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  const pad = compact ? '20px' : '28px';

  if (submitted) {
    return (
      <div style={{
        background: C.surface, borderRadius: '12px', padding: pad,
        border: `1px solid ${C.border}`, textAlign: 'center',
      }}>
        <div style={{ fontSize: compact ? '32px' : '48px', marginBottom: '8px' }}>🔔</div>
        <div style={{ fontWeight: 700, color: C.success, fontSize: compact ? '16px' : '18px' }}>
          Alert set! We&apos;ll email you when things change.
        </div>
        <button
          onClick={() => setSubmitted(false)}
          style={{
            marginTop: '12px', padding: '8px 20px', borderRadius: '8px',
            border: `1px solid ${C.border}`, background: C.surface2,
            color: C.navyLight, cursor: 'pointer', fontSize: '13px', fontWeight: 500,
          }}
        >Set Another Alert</button>
      </div>
    );
  }

  return (
    <div style={{
      background: C.surface, borderRadius: '12px', padding: pad,
      border: `1px solid ${C.border}`,
      boxShadow: compact ? 'none' : '0 4px 20px rgba(16,42,67,0.08)',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: compact ? '16px' : '20px' }}>
        <span style={{ fontSize: compact ? '18px' : '22px' }}>🔔</span>
        <h3 style={{ fontWeight: 700, fontSize: compact ? '16px' : '20px', color: C.navy, margin: 0 }}>{title}</h3>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: C.navyLight, marginBottom: '5px' }}>
            Email Address *
          </label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@email.com"
            style={{
              width: '100%', padding: '9px 12px', borderRadius: '8px',
              border: `1.5px solid ${C.border}`, background: C.bg,
              color: C.text, fontSize: '14px', outline: 'none',
              fontFamily: 'Inter, sans-serif',
            }}
          />
        </div>

        {/* Companies */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: C.navyLight, marginBottom: '8px' }}>
            Watch These Companies *
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {TOP_COMPANIES.map(c => (
              <button
                key={c} type="button" onClick={() => toggleCompany(c)}
                style={{
                  padding: '5px 11px', borderRadius: '20px', fontSize: '12px',
                  border: `1.5px solid ${companies.includes(c) ? C.accent : C.border}`,
                  background: companies.includes(c) ? C.accentLight : C.surface2,
                  color: companies.includes(c) ? C.accentDark : C.muted,
                  fontWeight: companies.includes(c) ? 600 : 400,
                  cursor: 'pointer', transition: '0.1s',
                }}
              >{companies.includes(c) ? '✓ ' : ''}{c}</button>
            ))}
          </div>
        </div>

        {/* Alert type */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: C.navyLight, marginBottom: '5px' }}>
            Alert Me When
          </label>
          <select
            value={alertType} onChange={e => setAlertType(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: '8px',
              border: `1.5px solid ${C.border}`, background: C.bg,
              color: C.text, fontSize: '14px', outline: 'none', cursor: 'pointer',
            }}
          >
            {ALERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', background: '#FEF2F2', borderRadius: '8px',
            color: C.error, fontSize: '13px', marginBottom: '12px', border: '1px solid #FECACA',
          }}>{error}</div>
        )}

        <button
          type="submit" disabled={submitting}
          style={{
            width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
            background: submitting ? C.muted : C.accent,
            color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
            fontSize: '14px', transition: '0.15s',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {submitting ? 'Setting Alert…' : '🔔 Set Alert'}
        </button>
      </form>
    </div>
  );
}
