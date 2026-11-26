'use client';

import { useState, useMemo } from 'react';

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
};

const PHASE_COLORS = {
  Design: '#7C3AED',
  Permitting: '#D97706',
  Factory: '#1E4063',
  Delivery: '#059669',
  'Site/Foundation': '#6B7280',
  Assembly: '#C9A84C',
  Inspections: '#DC2626',
  'Move-In': '#059669',
};

interface Phase {
  name: string;
  minWeeks: number;
  maxWeeks: number;
}

interface CompanyTimeline {
  name: string;
  slug: string;
  totalMin: number;
  totalMax: number;
  speedScore: number;
  phases: Phase[];
  note?: string;
}

const COMPANIES_TIMELINE: CompanyTimeline[] = [
  {
    name: 'Fading West', slug: 'fading-west',
    totalMin: 6, totalMax: 7, speedScore: 10,
    note: '🏆 Industry record: 40 days start to CO. Factory build: 9–17 days.',
    phases: [
      { name: 'Design', minWeeks: 0.3, maxWeeks: 0.5 },
      { name: 'Factory', minWeeks: 1.5, maxWeeks: 2.5 },
      { name: 'Delivery', minWeeks: 0.5, maxWeeks: 1 },
      { name: 'Site/Foundation', minWeeks: 1.5, maxWeeks: 2 },
      { name: 'Assembly', minWeeks: 1, maxWeeks: 1 },
      { name: 'Inspections', minWeeks: 0.5, maxWeeks: 1 },
    ],
  },
  {
    name: 'Boxabl', slug: 'boxabl',
    totalMin: 8, totalMax: 14, speedScore: 9,
    note: '⚡ 1-day unfold on site. Factory: 8–12 weeks. Waitlist adds time.',
    phases: [
      { name: 'Design', minWeeks: 0.5, maxWeeks: 1 },
      { name: 'Factory', minWeeks: 8, maxWeeks: 12 },
      { name: 'Delivery', minWeeks: 0.5, maxWeeks: 1 },
      { name: 'Assembly', minWeeks: 0.1, maxWeeks: 0.1 },
      { name: 'Inspections', minWeeks: 0.5, maxWeeks: 1 },
    ],
  },
  {
    name: 'ICON', slug: 'icon',
    totalMin: 10, totalMax: 28, speedScore: 8,
    note: '3D printing on-site. 24hrs to print the shell. Interior finishing takes 7–20 weeks.',
    phases: [
      { name: 'Design', minWeeks: 1, maxWeeks: 2 },
      { name: 'Permitting', minWeeks: 2, maxWeeks: 8 },
      { name: 'Site/Foundation', minWeeks: 1, maxWeeks: 2 },
      { name: 'Factory', minWeeks: 0.1, maxWeeks: 0.1 }, // 24hr print
      { name: 'Assembly', minWeeks: 7, maxWeeks: 20 }, // finishing
      { name: 'Inspections', minWeeks: 1, maxWeeks: 2 },
    ],
  },
  {
    name: 'Method Homes', slug: 'method-homes',
    totalMin: 16, totalMax: 24, speedScore: 8,
    phases: [
      { name: 'Design', minWeeks: 1, maxWeeks: 3 },
      { name: 'Permitting', minWeeks: 3, maxWeeks: 6 },
      { name: 'Factory', minWeeks: 14, maxWeeks: 20 },
      { name: 'Site/Foundation', minWeeks: 1, maxWeeks: 2 },
      { name: 'Assembly', minWeeks: 0.5, maxWeeks: 1 },
      { name: 'Inspections', minWeeks: 1, maxWeeks: 2 },
    ],
  },
  {
    name: 'Dvele', slug: 'dvele',
    totalMin: 18, totalMax: 28, speedScore: 7,
    phases: [
      { name: 'Design', minWeeks: 1, maxWeeks: 3 },
      { name: 'Permitting', minWeeks: 3, maxWeeks: 8 },
      { name: 'Factory', minWeeks: 16, maxWeeks: 24 },
      { name: 'Delivery', minWeeks: 0.5, maxWeeks: 1 },
      { name: 'Assembly', minWeeks: 0.5, maxWeeks: 1 },
      { name: 'Inspections', minWeeks: 1, maxWeeks: 2 },
    ],
  },
  {
    name: 'Acre Designs', slug: 'acre-designs',
    totalMin: 16, totalMax: 26, speedScore: 7,
    phases: [
      { name: 'Design', minWeeks: 1, maxWeeks: 3 },
      { name: 'Permitting', minWeeks: 3, maxWeeks: 6 },
      { name: 'Factory', minWeeks: 16, maxWeeks: 26 },
      { name: 'Delivery', minWeeks: 0.5, maxWeeks: 1 },
      { name: 'Assembly', minWeeks: 1, maxWeeks: 1.5 },
      { name: 'Inspections', minWeeks: 1, maxWeeks: 2 },
    ],
  },
  {
    name: 'Cover', slug: 'cover',
    totalMin: 16, totalMax: 26, speedScore: 7,
    phases: [
      { name: 'Design', minWeeks: 1, maxWeeks: 4 },
      { name: 'Permitting', minWeeks: 4, maxWeeks: 8 },
      { name: 'Factory', minWeeks: 12, maxWeeks: 20 },
      { name: 'Delivery', minWeeks: 0.5, maxWeeks: 1 },
      { name: 'Assembly', minWeeks: 4, maxWeeks: 8 },
      { name: 'Inspections', minWeeks: 1, maxWeeks: 2 },
    ],
  },
  {
    name: 'Plant Prefab', slug: 'plant-prefab',
    totalMin: 23, totalMax: 42, speedScore: 6,
    phases: [
      { name: 'Design', minWeeks: 1, maxWeeks: 4 },
      { name: 'Permitting', minWeeks: 4, maxWeeks: 10 },
      { name: 'Factory', minWeeks: 20, maxWeeks: 36 },
      { name: 'Delivery', minWeeks: 0.5, maxWeeks: 1 },
      { name: 'Assembly', minWeeks: 1.5, maxWeeks: 3 },
      { name: 'Inspections', minWeeks: 1, maxWeeks: 2 },
    ],
  },
  {
    name: 'Abodu', slug: 'abodu',
    totalMin: 36, totalMax: 54, speedScore: 5,
    note: '⚡ 1-day on-site install. But permitting + factory queue takes 36–54 weeks.',
    phases: [
      { name: 'Design', minWeeks: 1, maxWeeks: 2 },
      { name: 'Permitting', minWeeks: 2, maxWeeks: 20 },
      { name: 'Factory', minWeeks: 28, maxWeeks: 48 },
      { name: 'Delivery', minWeeks: 0.5, maxWeeks: 1 },
      { name: 'Assembly', minWeeks: 0.1, maxWeeks: 0.1 },
      { name: 'Inspections', minWeeks: 0.5, maxWeeks: 1 },
    ],
  },
  {
    name: 'Villa Homes', slug: 'villa-homes',
    totalMin: 48, totalMax: 56, speedScore: 4,
    note: 'Slowest due to extensive CA permitting queue. Factory build is fast once in queue.',
    phases: [
      { name: 'Design', minWeeks: 1, maxWeeks: 3 },
      { name: 'Permitting', minWeeks: 3, maxWeeks: 16 },
      { name: 'Factory', minWeeks: 24, maxWeeks: 30 },
      { name: 'Delivery', minWeeks: 1, maxWeeks: 2 },
      { name: 'Site/Foundation', minWeeks: 8, maxWeeks: 12 },
      { name: 'Assembly', minWeeks: 2, maxWeeks: 4 },
      { name: 'Inspections', minWeeks: 1, maxWeeks: 2 },
    ],
  },
];

const TRADITIONAL = {
  name: 'Traditional Build',
  totalMin: 52,
  totalMax: 78,
  note: 'Industry average: 12–18 months from permit to CO',
};

function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + Math.round(weeks * 7));
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TimelinePage() {
  const [selectedSlug, setSelectedSlug] = useState('dvele');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [showMid, setShowMid] = useState<'min' | 'max'>('min');

  const selected = COMPANIES_TIMELINE.find(c => c.slug === selectedSlug) || COMPANIES_TIMELINE[0];

  const moveInDate = useMemo(() => {
    const start = new Date(startDate);
    const weeks = showMid === 'min' ? selected.totalMin : selected.totalMax;
    return addWeeks(start, weeks);
  }, [startDate, selected, showMid]);

  const totalWeeks = showMid === 'min' ? selected.totalMin : selected.totalMax;
  const maxWeeks = Math.max(TRADITIONAL.totalMax, ...COMPANIES_TIMELINE.map(c => c.totalMax));

  const phaseColor = (name: string) => PHASE_COLORS[name as keyof typeof PHASE_COLORS] || C.accent;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <a href="/" style={{ color: C.accentLight, textDecoration: 'none', fontSize: '14px' }}>← Prefab Intel</a>
        <span style={{ color: C.muted }}>|</span>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>Interactive Build Timeline</span>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
          Build Timeline Visualizer
        </h1>
        <p style={{ color: C.muted, marginBottom: '32px', fontSize: '16px' }}>
          See how long each phase takes — and when you can move in.
        </p>

        {/* Controls */}
        <div style={{
          background: C.surface, borderRadius: '16px', padding: '28px',
          border: `1px solid ${C.border}`, marginBottom: '32px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px',
        }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: C.navyLight }}>
              Select Company
            </label>
            <select
              value={selectedSlug}
              onChange={e => setSelectedSlug(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: `1.5px solid ${C.accent}`, background: C.surface,
                color: C.text, fontSize: '15px', outline: 'none', cursor: 'pointer',
              }}
            >
              {COMPANIES_TIMELINE.sort((a, b) => a.totalMin - b.totalMin).map(co => (
                <option key={co.slug} value={co.slug}>
                  {co.name} ({co.totalMin}–{co.totalMax} wk)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: C.navyLight }}>
              When do you want to start?
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: `1.5px solid ${C.border}`, background: C.surface,
                color: C.text, fontSize: '15px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: C.navyLight }}>
              Estimate
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['min', 'max'] as const).map(m => (
                <button key={m} onClick={() => setShowMid(m)} style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: '1.5px solid',
                  borderColor: showMid === m ? C.accent : C.border,
                  background: showMid === m ? C.accentLight : C.surface,
                  color: showMid === m ? C.accentDark : C.muted,
                  fontWeight: showMid === m ? 700 : 400, cursor: 'pointer', fontSize: '14px',
                }}>
                  {m === 'min' ? 'Best Case' : 'Realistic'}
                </button>
              ))}
            </div>
          </div>

          {/* Move-in date */}
          <div style={{ background: C.navy, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: C.accentLight, fontSize: '12px', marginBottom: '4px' }}>Estimated Move-In Date</div>
            <div style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>{formatDate(moveInDate)}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '4px' }}>
              {totalWeeks} weeks from start
            </div>
          </div>
        </div>

        {/* Phase breakdown for selected company */}
        {selected.note && (
          <div style={{
            background: '#FEF3C7', border: '1px solid #D97706', borderRadius: '10px',
            padding: '14px 20px', marginBottom: '24px', fontSize: '14px', color: '#78350F',
          }}>
            {selected.note}
          </div>
        )}

        {/* Gantt Chart */}
        <div style={{ background: C.surface, borderRadius: '16px', border: `1px solid ${C.border}`, padding: '28px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: C.navy }}>
            Phase Breakdown — {selected.name}
          </h2>

          {selected.phases.map((phase, i) => {
            const pct = (showMid === 'min' ? phase.minWeeks : phase.maxWeeks) / totalWeeks * 100;
            const startPct = selected.phases.slice(0, i).reduce((sum, p) => sum + (showMid === 'min' ? p.minWeeks : p.maxWeeks) / totalWeeks * 100, 0);
            return (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600, color: phaseColor(phase.name) }}>{phase.name}</span>
                  <span style={{ color: C.muted }}>
                    {showMid === 'min' ? phase.minWeeks : phase.maxWeeks} wk
                    {phase.minWeeks !== phase.maxWeeks && ` (${phase.minWeeks}–${phase.maxWeeks} wk)`}
                  </span>
                </div>
                <div style={{ background: C.surface2, borderRadius: '8px', height: '28px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute',
                    left: `${startPct}%`,
                    width: `${pct}%`,
                    height: '100%',
                    background: phaseColor(phase.name),
                    borderRadius: '6px',
                    display: 'flex', alignItems: 'center', paddingLeft: '8px',
                    minWidth: '4px',
                  }}>
                    {pct > 8 && <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}>{phase.name}</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Timeline scale */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.muted }}>
              <span>Week 0</span>
              <span>Week {Math.round(totalWeeks / 2)}</span>
              <span>Week {totalWeeks} → Move In</span>
            </div>
          </div>
        </div>

        {/* Phase Legend */}
        <div style={{ marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {Object.entries(PHASE_COLORS).map(([phase, color]) => (
            <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: color }} />
              <span style={{ color: C.muted }}>{phase}</span>
            </div>
          ))}
        </div>

        {/* All Companies Comparison */}
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>All Companies Timeline Comparison</h2>
        <div style={{ background: C.surface, borderRadius: '16px', border: `1px solid ${C.border}`, padding: '28px', marginBottom: '40px' }}>
          {/* Traditional baseline */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ fontWeight: 700, color: C.muted }}>Traditional Build (baseline)</span>
              <span style={{ color: C.muted }}>{TRADITIONAL.totalMin}–{TRADITIONAL.totalMax} weeks</span>
            </div>
            <div style={{ background: '#F3F4F6', borderRadius: '8px', height: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                width: `${(TRADITIONAL.totalMax / maxWeeks) * 100}%`,
                height: '100%',
                background: '#D1D5DB',
                borderRadius: '6px',
                display: 'flex', alignItems: 'center', paddingLeft: '10px',
              }}>
                <span style={{ color: '#6B7280', fontSize: '11px', fontWeight: 600 }}>52–78 weeks traditional</span>
              </div>
            </div>
          </div>

          {COMPANIES_TIMELINE.sort((a, b) => a.totalMin - b.totalMin).map(co => (
            <div key={co.slug} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                <span
                  style={{ fontWeight: co.slug === selectedSlug ? 700 : 400, color: co.slug === selectedSlug ? C.accent : C.navy, cursor: 'pointer' }}
                  onClick={() => setSelectedSlug(co.slug)}
                >
                  {co.name}
                  {co.slug === selectedSlug && ' ◀ selected'}
                </span>
                <span style={{ color: C.muted }}>{co.totalMin}–{co.totalMax} wk</span>
              </div>
              <div style={{ background: C.surface2, borderRadius: '8px', height: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  width: `${(co.totalMax / maxWeeks) * 100}%`,
                  height: '100%',
                  background: co.slug === selectedSlug ? C.accent : C.navyLight,
                  borderRadius: '6px',
                  display: 'flex', alignItems: 'center', paddingLeft: '10px',
                  opacity: co.slug === selectedSlug ? 1 : 0.65,
                }}>
                  <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}>{co.totalMin}–{co.totalMax} wk</span>
                </div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.muted }}>
            <span>0 weeks</span><span>20 weeks</span><span>40 weeks</span><span>60 weeks</span><span>78+ weeks</span>
          </div>
        </div>
      </div>
    </div>
  );
}
