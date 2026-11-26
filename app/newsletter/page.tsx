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
  muted: '#6B7280',
  error: '#DC2626',
  success: '#16A34A',
};

const SUPABASE_URL = 'https://oapahwsqehtxawrvsqkg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YFvoGX2PUJTIyWWHGctD-Q_-A-EKzOr';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming',
];

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/prefab_waitlist`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          state: state || null,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `${res.status}`);
      }
      setSubmitted(true);
      setEmail(''); setState('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Sign-up failed: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif', color: C.text }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <a href="/" style={{ color: C.accentLight, textDecoration: 'none', fontSize: '14px' }}>← Prefab Intel</a>
        <span style={{ color: C.muted }}>|</span>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>Newsletter</span>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '80px 24px' }}>
        {/* Logo / badge */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: '24px', padding: '8px 20px', marginBottom: '24px',
          }}>
            <span style={{ fontSize: '18px' }}>📬</span>
            <span style={{ fontWeight: 700, fontSize: '14px', color: C.navyLight, letterSpacing: '0.05em' }}>
              PREFAB INTEL WEEKLY
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '42px', fontWeight: 700, lineHeight: '1.2',
            color: C.navy, marginBottom: '16px',
          }}>
            The Weekly Brief on<br />
            <span style={{ color: C.accent }}>Factory-Built Homes</span>
          </h1>

          <p style={{ color: C.muted, fontSize: '17px', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto' }}>
            Every week: price changes, waitlist openings, new state expansions, and community intel —
            all in a 3-minute read.
          </p>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
          marginBottom: '40px',
        }}>
          {[
            { icon: '📊', title: 'Price Intel', desc: 'Per-sqft trends across 12 companies' },
            { icon: '🗺️', title: 'State Updates', desc: 'New markets + permit changes' },
            { icon: '👥', title: 'Owner Stories', desc: 'Real builds, real timelines' },
          ].map(f => (
            <div key={f.title} style={{
              background: C.surface, borderRadius: '12px', padding: '16px',
              border: `1px solid ${C.border}`, textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{f.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: C.navy, marginBottom: '4px' }}>{f.title}</div>
              <div style={{ fontSize: '12px', color: C.muted }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Sign-up card */}
        <div style={{
          background: C.surface, borderRadius: '20px', padding: '40px',
          border: `1px solid ${C.border}`,
          boxShadow: '0 8px 40px rgba(16,42,67,0.10)',
        }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ fontWeight: 700, fontSize: '24px', color: C.navy, marginBottom: '8px' }}>
                You&apos;re in!
              </h2>
              <p style={{ color: C.muted, fontSize: '16px' }}>
                First issue lands in your inbox this Friday.<br />
                Check your spam folder if you don&apos;t see it.
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontWeight: 700, fontSize: '22px', color: C.navy, marginBottom: '6px' }}>
                Subscribe Free
              </h2>
              <p style={{ color: C.muted, fontSize: '14px', marginBottom: '24px' }}>
                No spam. Unsubscribe anytime. 1,200+ subscribers.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: C.navyLight, marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '10px',
                      border: `1.5px solid ${C.border}`, background: C.bg,
                      color: C.text, fontSize: '15px', outline: 'none',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: C.navyLight, marginBottom: '6px' }}>
                    Your State <span style={{ color: C.muted, fontWeight: 400 }}>(optional — for local coverage)</span>
                  </label>
                  <select
                    value={state} onChange={e => setState(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '10px',
                      border: `1.5px solid ${C.border}`, background: C.bg,
                      color: C.text, fontSize: '15px', outline: 'none', cursor: 'pointer',
                    }}
                  >
                    <option value="">Select state (optional)…</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {error && (
                  <div style={{
                    padding: '12px 16px', background: '#FEF2F2', borderRadius: '8px',
                    color: C.error, fontSize: '14px', marginBottom: '14px', border: '1px solid #FECACA',
                  }}>{error}</div>
                )}

                <button
                  type="submit" disabled={submitting}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                    background: submitting ? C.muted : C.navy,
                    color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '16px', fontFamily: 'Inter, sans-serif', transition: '0.15s',
                  }}
                >
                  {submitting ? 'Subscribing…' : 'Subscribe to Prefab Intel Weekly →'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '12px', color: C.muted, marginTop: '12px' }}>
                  Every Friday · Free forever · 3-minute read
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
