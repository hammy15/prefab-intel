'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { COMPANIES } from '@/lib/data';
import type { Company } from '@/lib/data';

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
  gold: '#FFF3CD',
  goldBorder: '#C9A84C',
};

type RowDef = {
  key: string;
  label: string;
  get: (c: Company) => string | number;
  winner?: 'min' | 'max' | 'custom';
  customWinner?: (vals: (string | number)[]) => number; // returns index of winner
};

const ROWS: RowDef[] = [
  { key: 'type', label: 'Type', get: c => c.type.replace(/_/g, ' ') },
  { key: 'price', label: 'Starting Price', get: c => c.startingPrice },
  { key: 'sqft', label: 'Size Range', get: c => c.sqFtRange },
  { key: 'timeline', label: 'Factory Build', get: c => c.buildMetrics.factoryWeeks },
  { key: 'onsite', label: 'On-Site Days', get: c => c.buildMetrics.onsiteDays },
  { key: 'speed', label: 'Speed Score', get: c => `${c.buildMetrics.speedScore}/10`, winner: 'custom',
    customWinner: vals => {
      const scores = vals.map(v => parseInt(String(v)));
      const max = Math.max(...scores);
      return scores.indexOf(max);
    }
  },
  { key: 'states', label: 'States Served', get: c => c.statesAvailable },
  { key: 'sustainability', label: 'Sustainability Score', get: c => `${c.sustainabilityScore}/10`, winner: 'custom',
    customWinner: vals => {
      const scores = vals.map(v => parseInt(String(v)));
      const max = Math.max(...scores);
      return scores.indexOf(max);
    }
  },
  { key: 'design', label: 'Design Score', get: c => `${c.designScore}/10`, winner: 'custom',
    customWinner: vals => {
      const scores = vals.map(v => parseInt(String(v)));
      const max = Math.max(...scores);
      return scores.indexOf(max);
    }
  },
  { key: 'sentiment', label: 'Sentiment', get: c => c.communitysentiment.replace(/_/g, ' ') },
  { key: 'status', label: 'Status', get: c => c.status.replace(/_/g, ' ') },
  { key: 'hq', label: 'HQ', get: c => c.hq },
  { key: 'founded', label: 'Founded', get: c => c.founded },
  { key: 'structure', label: 'Structure System', get: c => c.techSpecs?.structure || 'N/A' },
  { key: 'rvalue', label: 'R-Value', get: c => c.techSpecs?.rValue || 'N/A' },
  { key: 'foundation', label: 'Foundation', get: c => c.techSpecs?.foundation || 'N/A' },
  { key: 'hvac', label: 'HVAC', get: c => c.techSpecs?.hvac || 'N/A' },
  { key: 'windows', label: 'Windows', get: c => c.techSpecs?.windows || 'N/A' },
  { key: 'fireRating', label: 'Fire Rating', get: c => c.techSpecs?.fireRating || 'N/A' },
  { key: 'warranty', label: 'Warranty', get: c => c.techSpecs?.warranty || 'N/A' },
  { key: 'certs', label: 'Certifications', get: c => c.techSpecs?.certifications?.join(', ') || 'N/A' },
];

function getWinnerIndex(row: RowDef, vals: (string | number)[]): number | null {
  if (!row.winner) return null;
  if (row.winner === 'custom' && row.customWinner) return row.customWinner(vals);
  return null;
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Loading comparator…</div>}>
      <CompareInner />
    </Suspense>
  );
}

function CompareInner() {
  const searchParams = useSearchParams();

  const initialIds = searchParams?.getAll('c').map(Number).filter(Boolean) ?? [];
  const [selectedIds, setSelectedIds] = useState<number[]>(initialIds.length > 0 ? initialIds.slice(0, 3) : []);

  const selected = selectedIds.map(id => COMPANIES.find(c => c.id === id)).filter(Boolean) as Company[];

  const addCompany = useCallback((id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }, []);

  const shareUrl = useCallback(() => {
    const params = selectedIds.map(id => `c=${id}`).join('&');
    const url = `${window.location.origin}/compare?${params}`;
    navigator.clipboard.writeText(url).then(() => alert('URL copied to clipboard!'));
  }, [selectedIds]);

  const sentimentColor = (s: string) => {
    if (s.includes('very_positive') || s.includes('very positive')) return C.accent;
    if (s.includes('positive')) return C.accent;
    if (s.includes('mixed')) return '#D97706';
    return '#DC2626';
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <a href="/" style={{ color: C.accentLight, textDecoration: 'none', fontSize: '14px' }}>← Prefab Intel</a>
        <span style={{ color: C.muted }}>|</span>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>Side-by-Side Comparator</span>
      </div>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
          Compare Companies
        </h1>
        <p style={{ color: C.muted, marginBottom: '32px', fontSize: '16px' }}>
          Select up to 3 companies for a side-by-side comparison. 🥇 Gold = winner in that category.
        </p>

        {/* Company Selector */}
        <div style={{
          background: C.surface, borderRadius: '16px', padding: '24px',
          border: `1px solid ${C.border}`, marginBottom: '32px',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '16px', color: C.navy }}>
            Select Companies ({selectedIds.length}/3 selected):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {COMPANIES.map(co => {
              const isSelected = selectedIds.includes(co.id);
              const isFull = selectedIds.length >= 3 && !isSelected;
              return (
                <button
                  key={co.id}
                  onClick={() => !isFull && addCompany(co.id)}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', border: '1.5px solid',
                    borderColor: isSelected ? C.accent : C.border,
                    background: isSelected ? C.accentLight : isFull ? '#f9f9f9' : C.surface,
                    color: isSelected ? C.accentDark : isFull ? C.muted : C.text,
                    fontWeight: isSelected ? 700 : 400,
                    cursor: isFull ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    opacity: isFull ? 0.5 : 1,
                    transition: '0.15s',
                  }}
                >
                  {isSelected ? '✓ ' : ''}{co.name}
                </button>
              );
            })}
          </div>
          {selectedIds.length > 0 && (
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <button onClick={shareUrl} style={{
                padding: '10px 20px', borderRadius: '8px',
                background: C.navy, color: '#fff', border: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: '14px',
              }}>
                🔗 Share Comparison
              </button>
              <button onClick={() => setSelectedIds([])} style={{
                padding: '10px 20px', borderRadius: '8px',
                background: 'transparent', color: C.muted, border: `1px solid ${C.border}`,
                cursor: 'pointer', fontSize: '14px',
              }}>
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {selected.length > 0 ? (
          <div style={{ background: C.surface, borderRadius: '16px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: C.navy }}>
                    <th style={{ padding: '16px 20px', textAlign: 'left', color: C.accentLight, fontWeight: 600, minWidth: '160px' }}>Category</th>
                    {selected.map((co, i) => (
                      <th key={i} style={{ padding: '16px 20px', textAlign: 'left', color: '#fff', fontWeight: 700, minWidth: '200px' }}>
                        <div style={{ color: C.accent, fontSize: '11px', fontWeight: 400, marginBottom: '2px' }}>Rank #{co.rank}</div>
                        {co.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, rowIdx) => {
                    const vals = selected.map(c => row.get(c));
                    const winnerIdx = getWinnerIndex(row, vals);
                    return (
                      <tr key={row.key} style={{ background: rowIdx % 2 === 0 ? C.surface : C.surface2, borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '14px 20px', fontWeight: 600, color: C.navyLight, fontSize: '13px' }}>
                          {row.label}
                        </td>
                        {vals.map((val, colIdx) => {
                          const isWinner = winnerIdx === colIdx;
                          return (
                            <td key={colIdx} style={{
                              padding: '14px 20px',
                              background: isWinner ? C.gold : undefined,
                              borderLeft: isWinner ? `3px solid ${C.goldBorder}` : undefined,
                              color: C.text,
                              fontSize: '13px',
                              lineHeight: '1.5',
                            }}>
                              {isWinner && <span style={{ color: C.accentDark, fontWeight: 700, marginRight: '6px' }}>🥇</span>}
                              {String(val)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{
            background: C.surface, borderRadius: '16px', padding: '60px',
            textAlign: 'center', border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚖️</div>
            <h3 style={{ fontWeight: 600, marginBottom: '8px', color: C.navy }}>Select companies above to compare</h3>
            <p style={{ color: C.muted }}>Choose up to 3 companies to see a side-by-side breakdown of all specs</p>
          </div>
        )}
      </div>
    </div>
  );
}
