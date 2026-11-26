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
};

interface CompanyState {
  name: string;
  slug: string;
  startingPrice: string;
  color: string;
}

// State availability data
const STATE_COMPANIES: Record<string, CompanyState[]> = {
  AL: [{ name: 'Atmos', slug: 'atmos', startingPrice: '$350K+', color: '#7C3AED' }],
  AK: [],
  AZ: [
    { name: 'ICON', slug: 'icon', startingPrice: '$150K+', color: '#1E4063' },
    { name: 'Dvele', slug: 'dvele', startingPrice: '$467K', color: '#059669' },
    { name: 'Method Homes', slug: 'method-homes', startingPrice: '$170K', color: '#C9A84C' },
    { name: 'Boxabl', slug: 'boxabl', startingPrice: '$195K', color: '#D97706' },
    { name: 'Fading West', slug: 'fading-west', startingPrice: '$200K (B2B)', color: '#6B7280' },
  ],
  AR: [{ name: 'Atmos', slug: 'atmos', startingPrice: '$350K+', color: '#7C3AED' }],
  CA: [
    { name: 'ICON', slug: 'icon', startingPrice: '$150K+', color: '#1E4063' },
    { name: 'Dvele', slug: 'dvele', startingPrice: '$467K', color: '#059669' },
    { name: 'Plant Prefab', slug: 'plant-prefab', startingPrice: '$300K+', color: '#7C3AED' },
    { name: 'Mighty Buildings', slug: 'mighty-buildings', startingPrice: '$233K', color: '#DC2626' },
    { name: 'Abodu', slug: 'abodu', startingPrice: '$299K', color: '#D97706' },
    { name: 'Boxabl', slug: 'boxabl', startingPrice: '$195K', color: '#6B7280' },
    { name: 'Cover', slug: 'cover', startingPrice: 'Quote', color: '#102A43' },
    { name: 'Villa Homes', slug: 'villa-homes', startingPrice: '$225K', color: '#059669' },
    { name: 'Method Homes', slug: 'method-homes', startingPrice: '$170K', color: '#C9A84C' },
  ],
  CO: [
    { name: 'Method Homes', slug: 'method-homes', startingPrice: '$170K', color: '#C9A84C' },
    { name: 'Fading West', slug: 'fading-west', startingPrice: '$200K (B2B)', color: '#6B7280' },
    { name: 'Villa Homes', slug: 'villa-homes', startingPrice: '$225K', color: '#059669' },
  ],
  CT: [],
  DE: [],
  FL: [{ name: 'Atmos', slug: 'atmos', startingPrice: '$350K+', color: '#7C3AED' }],
  GA: [{ name: 'Atmos', slug: 'atmos', startingPrice: '$350K+', color: '#7C3AED' }],
  HI: [{ name: 'Fading West', slug: 'fading-west', startingPrice: '$200K (B2B)', color: '#6B7280' }],
  ID: [
    { name: 'Method Homes', slug: 'method-homes', startingPrice: '$170K', color: '#C9A84C' },
    { name: 'Plant Prefab', slug: 'plant-prefab', startingPrice: '$300K+', color: '#7C3AED' },
    { name: 'Fading West', slug: 'fading-west', startingPrice: '$200K (B2B)', color: '#6B7280' },
  ],
  IL: [{ name: 'Acre Designs', slug: 'acre-designs', startingPrice: '$300K+', color: '#059669' }],
  IN: [{ name: 'Acre Designs', slug: 'acre-designs', startingPrice: '$300K+', color: '#059669' }],
  IA: [{ name: 'Acre Designs', slug: 'acre-designs', startingPrice: '$300K+', color: '#059669' }],
  KS: [{ name: 'Acre Designs', slug: 'acre-designs', startingPrice: '$300K+', color: '#059669' }],
  KY: [],
  LA: [{ name: 'Atmos', slug: 'atmos', startingPrice: '$350K+', color: '#7C3AED' }],
  ME: [],
  MD: [],
  MA: [],
  MI: [{ name: 'Acre Designs', slug: 'acre-designs', startingPrice: '$300K+', color: '#059669' }],
  MN: [{ name: 'Acre Designs', slug: 'acre-designs', startingPrice: '$300K+', color: '#059669' }],
  MS: [{ name: 'Atmos', slug: 'atmos', startingPrice: '$350K+', color: '#7C3AED' }],
  MO: [{ name: 'Acre Designs', slug: 'acre-designs', startingPrice: '$300K+', color: '#059669' }],
  MT: [
    { name: 'Method Homes', slug: 'method-homes', startingPrice: '$170K', color: '#C9A84C' },
    { name: 'Fading West', slug: 'fading-west', startingPrice: '$200K (B2B)', color: '#6B7280' },
    { name: 'Plant Prefab', slug: 'plant-prefab', startingPrice: '$300K+', color: '#7C3AED' },
  ],
  NE: [{ name: 'Acre Designs', slug: 'acre-designs', startingPrice: '$300K+', color: '#059669' }],
  NV: [
    { name: 'Boxabl', slug: 'boxabl', startingPrice: '$195K', color: '#D97706' },
    { name: 'Plant Prefab', slug: 'plant-prefab', startingPrice: '$300K+', color: '#7C3AED' },
  ],
  NH: [],
  NJ: [],
  NM: [
    { name: 'Boxabl', slug: 'boxabl', startingPrice: '$195K', color: '#D97706' },
    { name: 'Fading West', slug: 'fading-west', startingPrice: '$200K (B2B)', color: '#6B7280' },
    { name: 'Plant Prefab', slug: 'plant-prefab', startingPrice: '$300K+', color: '#7C3AED' },
  ],
  NY: [],
  NC: [{ name: 'Atmos', slug: 'atmos', startingPrice: '$350K+', color: '#7C3AED' }],
  ND: [],
  OH: [{ name: 'Acre Designs', slug: 'acre-designs', startingPrice: '$300K+', color: '#059669' }],
  OK: [],
  OR: [
    { name: 'Method Homes', slug: 'method-homes', startingPrice: '$170K', color: '#C9A84C' },
    { name: 'Plant Prefab', slug: 'plant-prefab', startingPrice: '$300K+', color: '#7C3AED' },
  ],
  PA: [],
  RI: [],
  SC: [
    { name: 'Boxabl', slug: 'boxabl', startingPrice: '$195K', color: '#D97706' },
    { name: 'Atmos', slug: 'atmos', startingPrice: '$350K+', color: '#7C3AED' },
  ],
  SD: [],
  TN: [{ name: 'Atmos', slug: 'atmos', startingPrice: '$350K+', color: '#7C3AED' }],
  TX: [
    { name: 'ICON', slug: 'icon', startingPrice: '$150K+', color: '#1E4063' },
    { name: 'Mighty Buildings', slug: 'mighty-buildings', startingPrice: '$233K', color: '#DC2626' },
    { name: 'Boxabl', slug: 'boxabl', startingPrice: '$195K', color: '#D97706' },
    { name: 'Atmos', slug: 'atmos', startingPrice: '$350K+', color: '#7C3AED' },
  ],
  UT: [
    { name: 'Fading West', slug: 'fading-west', startingPrice: '$200K (B2B)', color: '#6B7280' },
    { name: 'Plant Prefab', slug: 'plant-prefab', startingPrice: '$300K+', color: '#7C3AED' },
  ],
  VT: [],
  VA: [],
  WA: [
    { name: 'Dvele', slug: 'dvele', startingPrice: '$467K', color: '#059669' },
    { name: 'Method Homes', slug: 'method-homes', startingPrice: '$170K', color: '#C9A84C' },
    { name: 'Plant Prefab', slug: 'plant-prefab', startingPrice: '$300K+', color: '#7C3AED' },
  ],
  WV: [],
  WI: [{ name: 'Acre Designs', slug: 'acre-designs', startingPrice: '$300K+', color: '#059669' }],
  WY: [
    { name: 'Fading West', slug: 'fading-west', startingPrice: '$200K (B2B)', color: '#6B7280' },
    { name: 'Plant Prefab', slug: 'plant-prefab', startingPrice: '$300K+', color: '#7C3AED' },
  ],
};

const STATE_GRID = [
  // Row 1
  ['', '', '', '', '', '', '', '', '', 'ME'],
  // Row 2
  ['WA', 'ID', 'MT', 'ND', 'MN', 'IL', 'WI', 'MI', '', 'NH'],
  // Row 3
  ['OR', 'NV', 'WY', 'SD', 'IA', 'IN', 'OH', 'PA', 'NY', 'VT'],
  // Row 4
  ['CA', 'UT', 'CO', 'NE', 'MO', 'KY', 'WV', 'VA', 'MD', 'MA'],
  // Row 5
  ['', 'AZ', 'NM', 'KS', 'AR', 'TN', 'NC', 'DE', 'NJ', 'RI'],
  // Row 6
  ['AK', '', '', 'OK', 'LA', 'MS', 'AL', 'GA', 'SC', 'CT'],
  // Row 7
  ['HI', '', 'TX', '', '', '', 'FL', '', '', ''],
];

function getStateBg(code: string): string {
  if (!code) return 'transparent';
  const companies = STATE_COMPANIES[code] || [];
  const n = companies.length;
  if (n === 0) return '#E5E7EB';
  if (n === 1) return '#FBF7F0';
  if (n <= 4) return '#E8D49A';
  return '#C9A84C';
}

function getStateFg(code: string): string {
  const companies = STATE_COMPANIES[code] || [];
  const n = companies.length;
  if (n === 0) return '#9CA3AF';
  if (n >= 5) return '#102A43';
  return '#102A43';
}

export default function StatesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedCompanies = selected ? (STATE_COMPANIES[selected] || []) : [];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <a href="/" style={{ color: C.accentLight, textDecoration: 'none', fontSize: '14px' }}>← Prefab Intel</a>
        <span style={{ color: C.muted }}>|</span>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>State Availability Map</span>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
          Where Can You Build?
        </h1>
        <p style={{ color: C.muted, marginBottom: '32px', fontSize: '16px' }}>
          Click any state to see which companies serve it and their starting prices.
        </p>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[
            { color: '#C9A84C', label: 'Many options (5+)' },
            { color: '#E8D49A', label: 'Some options (2–4)' },
            { color: '#FBF7F0', label: 'Few options (1)', border: '1px solid #C9A84C' },
            { color: '#E5E7EB', label: 'None available' },
          ].map(({ color, label, border }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '4px', background: color,
                border: border || '1px solid rgba(0,0,0,0.1)',
              }} />
              <span style={{ color: C.muted }}>{label}</span>
            </div>
          ))}
        </div>

        {/* State Grid */}
        <div style={{
          background: C.surface, borderRadius: '16px', border: `1px solid ${C.border}`,
          padding: '28px', marginBottom: '32px', overflowX: 'auto',
        }}>
          <div style={{ minWidth: '600px' }}>
            {STATE_GRID.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: '4px', marginBottom: '4px', justifyContent: 'flex-end' }}>
                {row.map((code, ci) => {
                  if (!code) return <div key={ci} style={{ width: '52px', height: '52px' }} />;
                  const companies = STATE_COMPANIES[code] || [];
                  const isSelected = selected === code;
                  return (
                    <button
                      key={ci}
                      onClick={() => setSelected(selected === code ? null : code)}
                      title={`${code}: ${companies.length} company${companies.length !== 1 ? 'ies' : ''}`}
                      style={{
                        width: '52px', height: '52px',
                        borderRadius: '8px',
                        border: isSelected ? `2px solid ${C.navy}` : '1px solid rgba(0,0,0,0.1)',
                        background: getStateBg(code),
                        color: getStateFg(code),
                        fontSize: '12px',
                        fontWeight: isSelected ? 700 : 600,
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: '2px',
                        transition: '0.15s',
                        boxShadow: isSelected ? `0 0 0 2px ${C.navy}` : undefined,
                        transform: isSelected ? 'scale(1.08)' : undefined,
                        position: 'relative',
                        zIndex: isSelected ? 2 : 1,
                      }}
                    >
                      <span>{code}</span>
                      {companies.length > 0 && (
                        <span style={{ fontSize: '10px', fontWeight: 400, opacity: 0.8 }}>{companies.length}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Selected State Details */}
        {selected && (
          <div style={{
            background: C.surface, borderRadius: '16px', border: `2px solid ${C.accent}`,
            padding: '28px', marginBottom: '32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '10px',
                background: getStateBg(selected),
                border: `1px solid ${C.accent}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '14px', color: C.navy,
              }}>{selected}</div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: C.navy }}>
                  {selectedCompanies.length > 0
                    ? `${selectedCompanies.length} company${selectedCompanies.length !== 1 ? 'ies' : ''} available`
                    : 'No companies currently serving this state'}
                </h2>
                <p style={{ color: C.muted, margin: '4px 0 0', fontSize: '14px' }}>
                  {selectedCompanies.length === 0
                    ? 'Most prefab companies are expanding — check back or contact companies directly about custom delivery.'
                    : `Companies with verified service to ${selected}`}
                </p>
              </div>
            </div>
            {selectedCompanies.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {selectedCompanies.map((co, i) => (
                  <div key={i} style={{
                    background: C.surface2, borderRadius: '12px', padding: '16px 20px',
                    border: `1px solid ${C.border}`,
                    borderLeft: `4px solid ${co.color}`,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: C.navy, marginBottom: '4px' }}>{co.name}</div>
                    <div style={{ color: C.accent, fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
                      From {co.startingPrice}
                    </div>
                    <a href={`/?company=${co.slug}`} style={{
                      color: C.muted, fontSize: '13px', textDecoration: 'none',
                    }}>View profile →</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!selected && (
          <div style={{ textAlign: 'center', color: C.muted, fontSize: '15px', padding: '20px' }}>
            👆 Click any state to see available companies
          </div>
        )}

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'States with 5+ options', value: Object.values(STATE_COMPANIES).filter(cs => cs.length >= 5).length, color: C.accent },
            { label: 'States with any option', value: Object.values(STATE_COMPANIES).filter(cs => cs.length > 0).length, color: C.navy },
            { label: 'States with no options', value: 50 - Object.values(STATE_COMPANIES).filter(cs => cs.length > 0).length, color: C.muted },
            { label: 'Best covered state', value: 'CA (9 companies)', color: C.accentDark },
          ].map((stat, i) => (
            <div key={i} style={{
              background: C.surface, borderRadius: '12px', padding: '20px',
              border: `1px solid ${C.border}`, textAlign: 'center',
            }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: C.muted }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
