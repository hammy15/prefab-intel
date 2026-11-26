'use client';

import { useState, useMemo } from 'react';

// ── Idaho Dawn palette ──────────────────────────────────────────
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
};

// ── Company data ────────────────────────────────────────────────
interface CompanyData {
  name: string;
  states: string[]; // list of state abbreviations OR special tokens
  stateNote: string;
  minSqftPerSqft: number; // $/sqft low
  maxSqftPerSqft: number; // $/sqft high
  minTotalK: number;      // minimum total project $K
  b2bOnly: boolean;
  types: ('ADU' | 'Primary Home' | 'Investment')[];
  slug: string;
}

const COMPANIES: CompanyData[] = [
  {
    name: 'ICON',
    states: ['TX', 'ALL_EXPANDING'],
    stateNote: 'TX primary, expanding nationwide',
    minSqftPerSqft: 180, maxSqftPerSqft: 320, minTotalK: 150,
    b2bOnly: false,
    types: ['ADU', 'Primary Home', 'Investment'],
    slug: 'icon',
  },
  {
    name: 'Dvele',
    states: ['CA', 'AZ', 'WA'],
    stateNote: 'CA, AZ, WA',
    minSqftPerSqft: 350, maxSqftPerSqft: 500, minTotalK: 467,
    b2bOnly: false,
    types: ['Primary Home'],
    slug: 'dvele',
  },
  {
    name: 'Plant Prefab',
    states: ['CA', 'OR', 'WA', 'NV', 'AZ', 'ID', 'MT', 'CO', 'UT', 'NM'],
    stateNote: 'CA + Western US',
    minSqftPerSqft: 300, maxSqftPerSqft: 500, minTotalK: 300,
    b2bOnly: false,
    types: ['Primary Home', 'Investment'],
    slug: 'plant-prefab',
  },
  {
    name: 'Method Homes',
    states: ['WA', 'OR', 'CA', 'ID', 'MT'],
    stateNote: 'WA, OR, CA, ID, MT',
    minSqftPerSqft: 225, maxSqftPerSqft: 450, minTotalK: 170,
    b2bOnly: false,
    types: ['ADU', 'Primary Home', 'Investment'],
    slug: 'method-homes',
  },
  {
    name: 'Mighty Buildings',
    states: ['CA', 'TX'],
    stateNote: 'CA, TX',
    minSqftPerSqft: 300, maxSqftPerSqft: 685, minTotalK: 233,
    b2bOnly: false,
    types: ['ADU', 'Primary Home'],
    slug: 'mighty-buildings',
  },
  {
    name: 'Abodu',
    states: ['CA'],
    stateNote: 'California only',
    minSqftPerSqft: 350, maxSqftPerSqft: 600, minTotalK: 299,
    b2bOnly: false,
    types: ['ADU'],
    slug: 'abodu',
  },
  {
    name: 'Boxabl',
    states: ['CA', 'NV', 'AZ', 'TX', 'NM', 'SC'],
    stateNote: 'CA, NV, AZ, TX, NM, SC',
    minSqftPerSqft: 160, maxSqftPerSqft: 320, minTotalK: 150,
    b2bOnly: false,
    types: ['ADU', 'Primary Home', 'Investment'],
    slug: 'boxabl',
  },
  {
    name: 'Cover',
    states: ['CA_SOUTH'],
    stateNote: 'Southern California only',
    minSqftPerSqft: 500, maxSqftPerSqft: 750, minTotalK: 500,
    b2bOnly: false,
    types: ['ADU', 'Primary Home'],
    slug: 'cover',
  },
  {
    name: 'Villa Homes',
    states: ['CA', 'CO'],
    stateNote: 'CA, CO',
    minSqftPerSqft: 200, maxSqftPerSqft: 380, minTotalK: 225,
    b2bOnly: false,
    types: ['ADU', 'Primary Home'],
    slug: 'villa-homes',
  },
  {
    name: 'Acre Designs',
    states: ['KS', 'MO', 'NE', 'IA', 'IL', 'OH', 'IN', 'MI', 'WI', 'MN', 'ALL_EXPANDING'],
    stateNote: 'KS + Midwest, expanding',
    minSqftPerSqft: 250, maxSqftPerSqft: 400, minTotalK: 300,
    b2bOnly: false,
    types: ['Primary Home'],
    slug: 'acre-designs',
  },
  {
    name: 'Fading West',
    states: ['CO', 'MT', 'WY', 'UT', 'ID', 'AZ', 'NM'],
    stateNote: 'CO + Mountain West (B2B only)',
    minSqftPerSqft: 150, maxSqftPerSqft: 250, minTotalK: 0,
    b2bOnly: true,
    types: ['Primary Home', 'Investment'],
    slug: 'fading-west',
  },
  {
    name: 'Atmos',
    states: ['TX', 'FL', 'GA', 'SC', 'NC', 'TN', 'AL', 'MS', 'LA', 'AR'],
    stateNote: 'TX + Southeast',
    minSqftPerSqft: 200, maxSqftPerSqft: 350, minTotalK: 350,
    b2bOnly: false,
    types: ['Primary Home'],
    slug: 'atmos',
  },
];

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
];

// Cost adders by state group
function getSiteWorkRange(state: string): [number, number] {
  const highCost = ['CA', 'NY', 'MA', 'WA', 'HI', 'CT', 'NJ'];
  const midCost = ['CO', 'OR', 'FL', 'AZ', 'NV', 'MD', 'VA'];
  if (highCost.includes(state)) return [120000, 150000];
  if (midCost.includes(state)) return [90000, 120000];
  return [60000, 90000];
}
function getPermitRange(state: string): [number, number] {
  const highCost = ['CA', 'NY', 'MA', 'WA', 'HI'];
  if (highCost.includes(state)) return [10000, 15000];
  return [2000, 8000];
}
const DELIVERY_RANGE: [number, number] = [15000, 25000];
function getUtilityRange(state: string): [number, number] {
  const rural = ['MT', 'WY', 'ND', 'SD', 'ID', 'AK'];
  if (rural.includes(state)) return [25000, 40000];
  return [10000, 25000];
}

function servesState(company: CompanyData, state: string): boolean {
  if (company.states.includes('ALL_EXPANDING')) return true;
  if (state === 'CA' && company.states.includes('CA_SOUTH')) return true; // Southern CA is in CA
  return company.states.includes(state);
}

type ProjectType = 'ADU' | 'Primary Home' | 'Investment';

interface MatchResult {
  company: CompanyData;
  baseEstLow: number;
  baseEstHigh: number;
  allInLow: number;
  allInHigh: number;
  score: number;
  reasons: string[];
}

export default function CalculatorPage() {
  const [state, setState] = useState('');
  const [sqft, setSqft] = useState(1500);
  const [projectType, setProjectType] = useState<ProjectType>('Primary Home');
  const [budgetK, setBudgetK] = useState(600);

  const results = useMemo((): MatchResult[] => {
    if (!state) return [];

    const [siteL, siteH] = getSiteWorkRange(state);
    const [permitL, permitH] = getPermitRange(state);
    const [utilL, utilH] = getUtilityRange(state);
    const [delL, delH] = DELIVERY_RANGE;

    const overhead: [number, number] = [
      siteL + permitL + delL + utilL,
      siteH + permitH + delH + utilH,
    ];

    const matches: MatchResult[] = [];

    for (const co of COMPANIES) {
      if (co.b2bOnly) continue;
      if (!servesState(co, state)) continue;
      if (!co.types.includes(projectType)) continue;

      const baseL = Math.round((co.minSqftPerSqft * sqft) / 1000) * 1000;
      const baseH = Math.round((co.maxSqftPerSqft * sqft) / 1000) * 1000;
      const minBase = co.minTotalK * 1000;
      const effBaseL = Math.max(baseL, minBase);
      const effBaseH = Math.max(baseH, minBase);

      const allInL = effBaseL + overhead[0];
      const allInH = effBaseH + overhead[1];

      const budgetDollars = budgetK * 1000;
      if (allInL > budgetDollars * 1.3) continue; // filter out if even low estimate is 30% over budget

      let score = 100;
      const reasons: string[] = [];

      // Budget fit
      if (allInH <= budgetDollars) {
        score += 30;
        reasons.push('Fits your budget');
      } else if (allInL <= budgetDollars) {
        score += 10;
        reasons.push('May fit budget (high end slightly over)');
      }

      // Type match
      if (co.types.includes(projectType)) {
        score += 20;
        reasons.push(`Specializes in ${projectType}`);
      }

      // Price efficiency
      const midPerSqft = (co.minSqftPerSqft + co.maxSqftPerSqft) / 2;
      if (midPerSqft < 300) {
        score += 15;
        reasons.push('Budget-friendly per sqft');
      } else if (midPerSqft < 450) {
        score += 10;
        reasons.push('Mid-range pricing');
      } else {
        score += 5;
        reasons.push('Premium pricing');
      }

      // State coverage (direct vs expanding)
      if (co.states.includes('ALL_EXPANDING')) {
        score += 5;
        reasons.push('Expanding to your area — verify availability');
      } else {
        score += 15;
        reasons.push(`Directly serves ${state}`);
      }

      matches.push({
        company: co,
        baseEstLow: effBaseL,
        baseEstHigh: effBaseH,
        allInLow: allInL,
        allInHigh: allInH,
        score,
        reasons,
      });
    }

    return matches.sort((a, b) => b.score - a.score);
  }, [state, sqft, projectType, budgetK]);

  const top3 = results.slice(0, 3);

  const [siteL, siteH] = state ? getSiteWorkRange(state) : [60000, 150000];
  const [permitL, permitH] = state ? getPermitRange(state) : [2000, 15000];
  const [utilL, utilH] = state ? getUtilityRange(state) : [10000, 40000];
  const [delL, delH] = DELIVERY_RANGE;

  const fmtK = (n: number) => `$${Math.round(n / 1000)}K`;
  const fmtRange = (l: number, h: number) => `${fmtK(l)} – ${fmtK(h)}`;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <a href="/" style={{ color: C.accentLight, textDecoration: 'none', fontSize: '14px' }}>← Prefab Intel</a>
        <span style={{ color: C.muted }}>|</span>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>All-In Cost Calculator</span>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
          True All-In Cost Estimator
        </h1>
        <p style={{ color: C.muted, marginBottom: '40px', fontSize: '16px' }}>
          Base price + site work + permits + delivery + utilities — the full picture.
        </p>

        {/* Input Panel */}
        <div style={{
          background: C.surface,
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 24px rgba(16,42,67,0.08)',
          marginBottom: '40px',
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '28px' }}>
            {/* State */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: C.navyLight }}>
                Your State
              </label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px',
                  border: `1.5px solid ${state ? C.accent : C.border}`,
                  background: C.surface, color: C.text, fontSize: '15px',
                  outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="">Select state…</option>
                {US_STATES.map(s => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Project Type */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: C.navyLight }}>
                Project Type
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['ADU', 'Primary Home', 'Investment'] as ProjectType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setProjectType(t)}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: '1.5px solid',
                      borderColor: projectType === t ? C.accent : C.border,
                      background: projectType === t ? C.accentLight : C.surface,
                      color: projectType === t ? C.accentDark : C.muted,
                      fontWeight: projectType === t ? 600 : 400,
                      cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap',
                      transition: '0.15s',
                    }}
                  >{t}</button>
                ))}
              </div>
            </div>

            {/* Square footage */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: C.navyLight }}>
                Square Footage — <span style={{ color: C.accent, fontWeight: 700 }}>{sqft.toLocaleString()} sqft</span>
              </label>
              <input
                type="range" min={400} max={5000} step={50} value={sqft}
                onChange={e => setSqft(Number(e.target.value))}
                style={{ width: '100%', accentColor: C.accent, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.muted, marginTop: '4px' }}>
                <span>400 sqft</span><span>5,000 sqft</span>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: C.navyLight }}>
                All-In Budget — <span style={{ color: C.accent, fontWeight: 700 }}>${budgetK}K</span>
              </label>
              <input
                type="range" min={150} max={3000} step={25} value={budgetK}
                onChange={e => setBudgetK(Number(e.target.value))}
                style={{ width: '100%', accentColor: C.accent, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.muted, marginTop: '4px' }}>
                <span>$150K</span><span>$3M</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown Banner */}
        {state && (
          <div style={{
            background: C.navy,
            borderRadius: '12px',
            padding: '24px 28px',
            marginBottom: '36px',
            color: '#fff',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: C.accentLight }}>
              True All-In Cost Components · {US_STATES.find(s => s.code === state)?.name}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Factory Base Price', note: 'varies by company', low: 0, high: 0, special: true },
                { label: 'Site Work', note: 'grading, foundation', low: siteL, high: siteH },
                { label: 'Permits & Fees', note: 'state + local', low: permitL, high: permitH },
                { label: 'Delivery', note: 'crane + transport', low: delL, high: delH },
                { label: 'Utilities', note: 'connect/install', low: utilL, high: utilH },
              ].map(item => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontSize: '12px', color: C.accentLight, marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                    {item.special ? 'See below' : fmtRange(item.low, item.high)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{item.note}</div>
                </div>
              ))}
              <div style={{ background: `rgba(201,168,76,0.2)`, borderRadius: '8px', padding: '14px', border: `1px solid ${C.accent}` }}>
                <div style={{ fontSize: '12px', color: C.accentLight, marginBottom: '4px' }}>Overhead (excl. base)</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: C.accent }}>
                  {fmtRange(siteL + permitL + delL + utilL, siteH + permitH + delH + utilH)}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>added to base price</div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {!state && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: C.muted, fontSize: '16px' }}>
            Select your state to see matching companies and cost estimates ↑
          </div>
        )}

        {state && results.length === 0 && (
          <div style={{
            background: C.surface, borderRadius: '12px', padding: '40px', textAlign: 'center',
            border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>🏗️</div>
            <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>No matches found</h3>
            <p style={{ color: C.muted }}>Try increasing your budget or changing your state/type. The prefab market is still expanding.</p>
          </div>
        )}

        {top3.length > 0 && (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
              Top {top3.length} Match{top3.length > 1 ? 'es' : ''} for You
            </h2>

            {/* Top 3 comparison cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              {top3.map((result, idx) => (
                <div
                  key={result.company.name}
                  style={{
                    background: C.surface,
                    borderRadius: '14px',
                    border: `2px solid ${idx === 0 ? C.accent : C.border}`,
                    padding: '24px',
                    boxShadow: idx === 0 ? `0 8px 32px rgba(201,168,76,0.15)` : '0 4px 16px rgba(16,42,67,0.06)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {idx === 0 && (
                    <div style={{
                      position: 'absolute', top: 0, right: 0,
                      background: C.accent, color: '#fff',
                      fontSize: '11px', fontWeight: 700,
                      padding: '4px 12px', borderBottomLeftRadius: '8px',
                    }}>BEST MATCH</div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: idx === 0 ? C.accentLight : C.surface2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', fontWeight: 800, color: C.accent,
                    }}>{idx + 1}</div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '18px', margin: 0 }}>{result.company.name}</h3>
                      <div style={{ fontSize: '12px', color: C.muted }}>{result.company.stateNote}</div>
                    </div>
                  </div>

                  <div style={{ background: C.surface2, borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: C.muted, marginBottom: '4px' }}>Estimated Base Price</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: C.navy }}>
                      {fmtRange(result.baseEstLow, result.baseEstHigh)}
                    </div>
                    <div style={{ fontSize: '12px', color: C.muted, marginTop: '8px', marginBottom: '4px' }}>True All-In Cost</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: C.accent }}>
                      {fmtRange(result.allInLow, result.allInHigh)}
                    </div>
                    <div style={{ fontSize: '11px', color: C.muted, marginTop: '4px' }}>
                      {result.company.minSqftPerSqft}–{result.company.maxSqftPerSqft} $/sqft base
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.reasons.map(r => (
                      <span key={r} style={{
                        fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
                        background: C.surface2, color: C.textSec, fontWeight: 500,
                      }}>✓ {r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Full results list */}
            {results.length > 3 && (
              <>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: C.navyLight }}>
                  All Matching Companies ({results.length})
                </h3>
                <div style={{
                  background: C.surface, borderRadius: '12px',
                  border: `1px solid ${C.border}`,
                  overflow: 'hidden',
                }}>
                  {results.map((result, idx) => (
                    <div
                      key={result.company.name}
                      style={{
                        padding: '16px 20px',
                        borderBottom: idx < results.length - 1 ? `1px solid ${C.border}` : 'none',
                        display: 'flex', alignItems: 'center', gap: '16px',
                      }}
                    >
                      <div style={{ width: '28px', textAlign: 'center', fontWeight: 700, color: C.muted, fontSize: '14px' }}>
                        #{idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600 }}>{result.company.name}</span>
                        <span style={{ fontSize: '13px', color: C.muted, marginLeft: '8px' }}>{result.company.stateNote}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: C.muted }}>All-In Estimate</div>
                        <div style={{ fontWeight: 700, color: C.accent }}>{fmtRange(result.allInLow, result.allInHigh)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Disclaimer */}
            <div style={{ marginTop: '32px', padding: '16px 20px', background: C.surface2, borderRadius: '10px', fontSize: '13px', color: C.muted }}>
              <strong style={{ color: C.navy }}>Disclaimer:</strong> These are estimates only. Base prices vary by design, finish level, and configuration.
              Site work varies dramatically based on lot conditions. Always get contractor quotes and verify company availability in your area before committing.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
