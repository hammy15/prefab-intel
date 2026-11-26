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
  textSec: '#2D4A6B',
  muted: '#6B7280',
  warning: '#D97706',
  red: '#DC2626',
  green: '#059669',
};

interface LenderRow {
  type: string;
  conventional: boolean;
  fha: boolean;
  va: boolean;
  jumbo: boolean;
  notes: string;
}

const LENDER_COMPAT: LenderRow[] = [
  { type: 'Standard Modular (Dvele, Method, Fading West)', conventional: true, fha: true, va: true, jumbo: true, notes: 'Full conventional financing available; treated like site-built' },
  { type: 'Panelized (Plant Prefab, Acre, Cover)', conventional: true, fha: true, va: true, jumbo: true, notes: 'Most lenders treat as conventional construction' },
  { type: 'ADU (Abodu, Villa Homes)', conventional: true, fha: false, va: false, jumbo: true, notes: 'FHA/VA typically exclude ADUs; conventional and portfolio loans work best' },
  { type: '3D Printed (ICON)', conventional: false, fha: false, va: false, jumbo: false, notes: '⚠ Limited: Wells Fargo now offers ICON Wolf Ranch mortgages (milestone 2026). Most banks still decline.' },
  { type: '3D Printed (Mighty Buildings)', conventional: false, fha: false, va: false, jumbo: false, notes: '⚠ Very limited: company sold in distress Jan 2025; financing is project-by-project' },
  { type: 'Foldable Modular (Boxabl)', conventional: false, fha: false, va: false, jumbo: false, notes: '⚠ Waitlist product; financing options limited; some RV/chattel loans used' },
  { type: 'B2B Only (Z Modular)', conventional: false, fha: false, va: false, jumbo: false, notes: 'Developer construction loans only — not consumer mortgages' },
];

type CreditTier = 'excellent' | 'good' | 'fair';
type LoanTerm = 15 | 20 | 30;

function getRate(term: LoanTerm, credit: CreditTier): number {
  const base = { 15: 5.9, 20: 6.3, 30: 6.75 };
  const adj = { excellent: -0.5, good: 0, fair: 0.75 };
  return base[term] + adj[credit];
}

function monthlyPayment(principal: number, annualRate: number, termYears: number): number {
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString();
}

export default function MortgagePage() {
  const [homePrice, setHomePrice] = useState(500000);
  const [downPct, setDownPct] = useState(20);
  const [term, setTerm] = useState<LoanTerm>(30);
  const [credit, setCredit] = useState<CreditTier>('good');

  const calc = useMemo(() => {
    const down = homePrice * (downPct / 100);
    const principal = homePrice - down;
    const rate = getRate(term, credit);
    const monthly = monthlyPayment(principal, rate, term);
    const totalPaid = monthly * term * 12;
    const totalInterest = totalPaid - principal;
    const pmi = downPct < 20 ? Math.round(principal * 0.0085 / 12) : 0;

    return { down, principal, rate, monthly, totalPaid, totalInterest, pmi };
  }, [homePrice, downPct, term, credit]);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <a href="/" style={{ color: C.accentLight, textDecoration: 'none', fontSize: '14px' }}>← Prefab Intel</a>
        <span style={{ color: C.muted }}>|</span>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>Prefab Mortgage Calculator</span>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
          Prefab Mortgage Calculator
        </h1>
        <p style={{ color: C.muted, marginBottom: '32px', fontSize: '16px' }}>
          Monthly payment estimates + lender compatibility by company type.
        </p>

        {/* Warning Banner */}
        <div style={{
          background: '#FEF3C7',
          border: '1px solid #D97706',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '32px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: C.warning, marginBottom: '6px' }}>
              3D-Printed Homes Have Limited Lender Options
            </div>
            <p style={{ color: '#78350F', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
              <strong>Milestone:</strong> Wells Fargo now offers mortgages for ICON Wolf Ranch homes in Georgetown, TX (2026) — the first major bank to do so for 3D-printed construction.
              However, most conventional lenders still decline 3D-printed homes. Boxabl buyers often use chattel loans or owner financing.
              Modular and panelized homes (Dvele, Method, Plant Prefab, Acre) qualify for standard conventional/FHA/VA mortgages.
            </p>
          </div>
        </div>

        {/* Calculator */}
        <div style={{
          background: C.surface,
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 24px rgba(16,42,67,0.08)',
          marginBottom: '40px',
          border: `1px solid ${C.border}`,
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '28px', color: C.navy }}>Your Numbers</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '28px', marginBottom: '32px' }}>
            {/* Home Price */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: C.navyLight }}>
                Home Price — <span style={{ color: C.accent }}>{fmt(homePrice)}</span>
              </label>
              <input
                type="range" min={150000} max={3000000} step={10000} value={homePrice}
                onChange={e => setHomePrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: C.accent }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.muted, marginTop: '4px' }}>
                <span>$150K</span><span>$3M</span>
              </div>
            </div>

            {/* Down Payment */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: C.navyLight }}>
                Down Payment — <span style={{ color: C.accent }}>{downPct}% ({fmt(homePrice * downPct / 100)})</span>
              </label>
              <input
                type="range" min={3} max={50} step={1} value={downPct}
                onChange={e => setDownPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: C.accent }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.muted, marginTop: '4px' }}>
                <span>3%</span><span>50%</span>
              </div>
              {downPct < 20 && (
                <div style={{ fontSize: '12px', color: C.warning, marginTop: '4px' }}>
                  ⚠ PMI required below 20% (est. {fmt(calc.pmi)}/mo)
                </div>
              )}
            </div>

            {/* Loan Term */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: C.navyLight }}>
                Loan Term
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {([15, 20, 30] as LoanTerm[]).map(t => (
                  <button key={t} onClick={() => setTerm(t)} style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: '1.5px solid',
                    borderColor: term === t ? C.accent : C.border,
                    background: term === t ? C.accentLight : C.surface,
                    color: term === t ? C.accentDark : C.muted,
                    fontWeight: term === t ? 700 : 400,
                    cursor: 'pointer', fontSize: '14px',
                  }}>{t}yr</button>
                ))}
              </div>
            </div>

            {/* Credit Score */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: C.navyLight }}>
                Credit Score Tier
              </label>
              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                {([
                  { k: 'excellent', label: 'Excellent (740+)', rate: 'Best rates' },
                  { k: 'good', label: 'Good (680–739)', rate: 'Standard rates' },
                  { k: 'fair', label: 'Fair (620–679)', rate: '+0.75% rate adj.' },
                ] as Array<{ k: CreditTier; label: string; rate: string }>).map(({ k, label, rate }) => (
                  <button key={k} onClick={() => setCredit(k)} style={{
                    padding: '10px 14px', borderRadius: '8px', border: '1.5px solid',
                    borderColor: credit === k ? C.accent : C.border,
                    background: credit === k ? C.accentLight : C.surface,
                    color: credit === k ? C.accentDark : C.muted,
                    fontWeight: credit === k ? 600 : 400,
                    cursor: 'pointer', fontSize: '13px', textAlign: 'left',
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span>{label}</span><span style={{ fontSize: '12px' }}>{rate}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ background: C.navy, borderRadius: '12px', padding: '28px' }}>
            <div style={{ color: C.accentLight, fontSize: '14px', marginBottom: '8px' }}>
              Estimated Rate: {calc.rate.toFixed(2)}% APR (illustrative — actual rates vary by lender)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
              <div>
                <div style={{ color: C.accentLight, fontSize: '12px', marginBottom: '4px' }}>Monthly Payment</div>
                <div style={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}>{fmt(calc.monthly)}</div>
                {calc.pmi > 0 && <div style={{ color: C.warning, fontSize: '12px' }}>+ {fmt(calc.pmi)}/mo PMI</div>}
              </div>
              <div>
                <div style={{ color: C.accentLight, fontSize: '12px', marginBottom: '4px' }}>Loan Amount</div>
                <div style={{ color: '#fff', fontSize: '24px', fontWeight: 600 }}>{fmt(calc.principal)}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{fmt(calc.down)} down</div>
              </div>
              <div>
                <div style={{ color: C.accentLight, fontSize: '12px', marginBottom: '4px' }}>Total Interest</div>
                <div style={{ color: '#fff', fontSize: '24px', fontWeight: 600 }}>{fmt(calc.totalInterest)}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>over {term} years</div>
              </div>
              <div>
                <div style={{ color: C.accentLight, fontSize: '12px', marginBottom: '4px' }}>Total Cost</div>
                <div style={{ color: '#fff', fontSize: '24px', fontWeight: 600 }}>{fmt(calc.totalPaid + calc.down)}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>principal + interest + down</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lender Compatibility Table */}
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Lender Compatibility by Company Type</h2>
        <div style={{ background: C.surface, borderRadius: '16px', border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: '40px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: C.navy, color: '#fff' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 600, minWidth: '240px' }}>Company Type</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600 }}>Conventional</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600 }}>FHA</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600 }}>VA</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600 }}>Jumbo</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 600 }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {LENDER_COMPAT.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? C.surface : C.surface2, borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: C.navy }}>{row.type}</td>
                    {[row.conventional, row.fha, row.va, row.jumbo].map((ok, j) => (
                      <td key={j} style={{ padding: '16px', textAlign: 'center', fontSize: '18px' }}>
                        {ok
                          ? <span style={{ color: C.green }}>✓</span>
                          : <span style={{ color: C.red }}>✗</span>
                        }
                      </td>
                    ))}
                    <td style={{ padding: '16px 20px', color: C.muted, fontSize: '13px', lineHeight: '1.5' }}>
                      {row.notes.startsWith('⚠') ? (
                        <span style={{ color: C.warning }}>{row.notes}</span>
                      ) : row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {[
            {
              icon: '🏦',
              title: 'Wells Fargo ICON Milestone',
              body: 'In 2026, Wells Fargo began offering mortgages for ICON Wolf Ranch 3D-printed homes in Georgetown, TX. This is the first major traditional bank to mainstream 3D-printed home financing — a historic inflection point.',
              color: C.green,
            },
            {
              icon: '📋',
              title: 'Construction vs. Permanent Loan',
              body: 'Most prefab buyers need a construction loan (draws as work progresses) that converts to a permanent mortgage. Ask your lender about one-time-close (OTC) construction loans — they save closing costs and lock your rate.',
              color: C.navy,
            },
            {
              icon: '⚡',
              title: 'ADU-Specific Financing',
              body: 'ADUs (Abodu, Villa Homes) are often financed via HELOCs, cash-out refi on primary home, or portfolio loans. FHA and VA typically exclude ADUs from their programs. Fannie Mae HomeStyle allows ADU renovation financing.',
              color: C.accent,
            },
          ].map((card, i) => (
            <div key={i} style={{
              background: C.surface, borderRadius: '14px',
              border: `1px solid ${C.border}`,
              padding: '24px',
              borderTop: `4px solid ${card.color}`,
            }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{card.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: '10px', color: C.navy }}>{card.title}</div>
              <div style={{ color: C.muted, fontSize: '14px', lineHeight: '1.6' }}>{card.body}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', color: C.muted, fontSize: '13px', paddingBottom: '40px' }}>
          Estimates are illustrative only. Actual rates and lender availability vary. Consult a licensed mortgage broker for prefab-specific financing options.
        </div>
      </div>
    </div>
  );
}
