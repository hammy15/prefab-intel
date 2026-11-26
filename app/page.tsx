'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { COMPANIES, ZURU_TECH, MARKET_INSIGHTS, Company, AvailabilityStatus, Sentiment } from '../lib/data';

// ─── Status Indicators ───────────────────────────────────────────────────────

function StatusDot({ status, waitlistInfo }: { status: AvailabilityStatus; waitlistInfo?: string }) {
  const configs: Record<AvailabilityStatus, { color: string; label: string; dot: string }> = {
    available: { color: '#10B981', label: 'Available Now', dot: '#10B981' },
    waitlist: { color: '#D97706', label: waitlistInfo ? `Waitlist: ${waitlistInfo}` : 'Waitlist', dot: '#F59E0B' },
    b2b_only: { color: '#DC2626', label: 'Not Consumer-Facing', dot: '#EF4444' },
    defunct: { color: '#6B7280', label: 'Legacy / Defunct', dot: '#9CA3AF' },
  };
  const cfg = configs[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: cfg.color }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: cfg.dot, flexShrink: 0,
        boxShadow: status !== 'defunct' ? `0 0 0 3px ${cfg.dot}22` : 'none',
        animation: status === 'available' ? 'pulse 2s infinite' : 'none',
      }} />
      {cfg.label}
    </span>
  );
}

// ─── Speed Meter ─────────────────────────────────────────────────────────────

function SpeedMeter({ score, label }: { score: number; label: string }) {
  if (score === 0) return null;
  const pct = (score / 10) * 100;
  const color = score >= 8 ? '#10B981' : score >= 6 ? '#C9A84C' : score >= 4 ? '#D97706' : '#EF4444';
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Speed vs. Traditional
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color }}>
          {score >= 8 ? 'Fast' : score >= 5 ? 'Medium' : 'Slower'}
        </span>
      </div>
      <div style={{ height: 6, background: 'rgba(16,42,67,0.08)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: 3, transition: 'width 0.8s ease-out',
        }} />
      </div>
      <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3, textAlign: 'right' }}>
        52-wk traditional baseline
      </div>
    </div>
  );
}

// ─── Build Timeline Steps ─────────────────────────────────────────────────────

function BuildTimeline({ steps, totalWeeks }: { steps: { label: string; duration: string; icon: string }[]; totalWeeks: string }) {
  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ textAlign: 'center', minWidth: 90 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg, #C9A84C, #A8882B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px', fontSize: 18, boxShadow: '0 2px 8px rgba(201,168,76,0.3)',
              }}>
                <span role="img" aria-label={step.label}>{step.icon}</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#102A43' }}>{step.label}</div>
              <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>{step.duration}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 24, height: 2, background: 'linear-gradient(90deg, #C9A84C, #E8D49A)', flexShrink: 0, margin: '0 2px', marginBottom: 24 }} />
            )}
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 16, padding: '10px 16px',
        background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.03))',
        borderRadius: 8, border: '1px solid rgba(201,168,76,0.2)',
        fontSize: 12, color: '#102A43', fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ color: '#C9A84C', fontSize: 16 }}>⏱</span>
        Total Timeline: <strong>{totalWeeks}</strong>
      </div>
    </div>
  );
}

// ─── Walkable Tour Modal ───────────────────────────────────────────────────────

function TourModal({ company, onClose }: { company: Company; onClose: () => void }) {
  const [imgIndex, setImgIndex] = useState(0);
  const images = company.tourImages;
  const [animating, setAnimating] = useState(false);

  const navigate = useCallback((dir: 1 | -1) => {
    if (animating) return;
    setAnimating(true);
    setImgIndex(prev => {
      const next = prev + dir;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
    setTimeout(() => setAnimating(false), 300);
  }, [images.length, animating]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const totalWks = company.buildMetrics.totalWeeks;
  const speedScore = company.buildMetrics.speedScore;
  const pct = (speedScore / 10) * 100;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ padding: 16 }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 900,
          maxHeight: '92vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(16,42,67,0.3)',
          animation: 'scaleIn 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface)',
        }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
              {company.name} — Walkable Tour
            </h2>
            <StatusDot status={company.status} waitlistInfo={company.waitlistInfo} />
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--surface2)', border: '1px solid var(--border)',
              fontSize: 18, color: 'var(--muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {/* Photo Gallery */}
          <div style={{ position: 'relative', background: '#000', height: 340 }}>
            {images.length > 0 && (
              <img
                key={imgIndex}
                src={images[imgIndex].url}
                alt={images[imgIndex].caption}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  opacity: animating ? 0 : 1,
                  transition: 'opacity 0.3s ease',
                }}
              />
            )}
            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button onClick={() => navigate(-1)} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 44, height: 44, borderRadius: '50%', border: 'none',
                  background: 'rgba(255,255,255,0.9)', cursor: 'pointer',
                  fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s',
                }}>‹</button>
                <button onClick={() => navigate(1)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 44, height: 44, borderRadius: '50%', border: 'none',
                  background: 'rgba(255,255,255,0.9)', cursor: 'pointer',
                  fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s',
                }}>›</button>
              </>
            )}
            {/* Caption */}
            {images[imgIndex] && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(16,42,67,0.85))',
                padding: '32px 20px 16px',
                color: '#fff', fontSize: 13, fontStyle: 'italic',
              }}>
                {images[imgIndex].caption}
              </div>
            )}
            {/* Dot nav */}
            <div style={{
              position: 'absolute', top: 12, right: 12,
              display: 'flex', gap: 6,
            }}>
              {images.map((_, i) => (
                <button key={i} onClick={() => setImgIndex(i)} style={{
                  width: i === imgIndex ? 20 : 8, height: 8,
                  borderRadius: 4, border: 'none',
                  background: i === imgIndex ? '#C9A84C' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', transition: 'all 0.3s', padding: 0,
                }} />
              ))}
            </div>
            {/* Keyboard hint */}
            <div style={{
              position: 'absolute', bottom: 12, right: 16,
              fontSize: 11, color: 'rgba(255,255,255,0.6)',
            }}>← → keys to navigate</div>
          </div>

          {/* Body */}
          <div style={{ padding: '24px' }}>
            {/* Build Metrics Row */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16, marginBottom: 24,
            }}>
              {[
                { label: 'Factory Build', value: company.buildMetrics.factoryWeeks, icon: '🏭' },
                { label: 'On-Site Assembly', value: company.buildMetrics.onsiteDays, icon: '🔧' },
                { label: 'Total Timeline', value: company.buildMetrics.totalWeeks, icon: '⏱' },
              ].map(m => (
                <div key={m.label} style={{
                  background: 'var(--surface2)', borderRadius: 12,
                  padding: '14px 16px', textAlign: 'center',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}><span role="img" aria-label={m.label}>{m.icon}</span></div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>{m.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Speed bar */}
            {speedScore > 0 && (
              <div style={{
                marginBottom: 24, padding: '16px',
                background: 'var(--surface2)', borderRadius: 12,
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>Build Speed vs. Traditional (52 wk)</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: speedScore >= 8 ? '#10B981' : speedScore >= 5 ? '#C9A84C' : '#D97706' }}>
                    {speedScore >= 8 ? 'Fast' : speedScore >= 5 ? 'Medium' : 'Slower'} · {speedScore}/10
                  </span>
                </div>
                <div style={{ height: 10, background: 'rgba(16,42,67,0.08)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: `linear-gradient(90deg, #C9A84C, #10B981)`,
                    borderRadius: 5,
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>Slower</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>Fastest</span>
                </div>
              </div>
            )}

            {/* Build Timeline */}
            {company.buildSteps.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 15, marginBottom: 12, color: 'var(--navy)' }}>Build Timeline</h4>
                <BuildTimeline steps={company.buildSteps} totalWeeks={company.buildMetrics.totalWeeks} />
              </div>
            )}

            {/* Social Quotes */}
            {company.socialQuotes.length > 0 && (
              <div>
                <h4 style={{ fontSize: 15, marginBottom: 12, color: 'var(--navy)' }}>Community Voices</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {company.socialQuotes.map((q, i) => (
                    <div key={i} style={{
                      padding: '14px 16px',
                      background: q.sentiment === 'positive' ? 'rgba(16,185,129,0.04)' : q.sentiment === 'negative' ? 'rgba(239,68,68,0.04)' : 'var(--surface2)',
                      borderRadius: 10,
                      borderLeft: `3px solid ${q.sentiment === 'positive' ? '#10B981' : q.sentiment === 'negative' ? '#EF4444' : '#C9A84C'}`,
                    }}>
                      <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)', fontStyle: 'italic', marginBottom: 6 }}>
                        "{q.text}"
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>— {q.source}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Company Card ──────────────────────────────────────────────────────────────

function CompanyCard({ company, rank }: { company: Company; rank: number }) {
  const [tourOpen, setTourOpen] = useState(false);
  const isDefunct = company.status === 'defunct';

  const sentimentColors: Record<Sentiment, string> = {
    very_positive: '#059669',
    positive: '#10B981',
    mixed: '#D97706',
    negative: '#DC2626',
  };
  const sentimentLabels: Record<Sentiment, string> = {
    very_positive: 'Very Positive',
    positive: 'Positive',
    mixed: 'Mixed',
    negative: 'Negative',
  };

  const typeLabels: Record<string, string> = {
    modular: 'Modular',
    '3d_printed': '3D Printed',
    panelized: 'Panelized',
    volumetric: 'Volumetric',
  };

  return (
    <>
      <div style={{
        background: isDefunct ? 'rgba(255,255,255,0.6)' : 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: isDefunct ? 'none' : 'var(--warm-shadow)',
        border: `1px solid ${isDefunct ? 'rgba(16,42,67,0.06)' : 'var(--border)'}`,
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        opacity: isDefunct ? 0.65 : 1,
        display: 'flex',
        flexDirection: 'column',
      }}
        onMouseEnter={e => {
          if (!isDefunct) {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = 'translateY(-4px)';
            el.style.boxShadow = '0 12px 40px rgba(16,42,67,0.14), 0 0 0 1px rgba(201,168,76,0.3)';
          }
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = '';
          el.style.boxShadow = isDefunct ? 'none' : 'var(--warm-shadow)';
        }}
      >
        {/* Hero image area */}
        <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          <img
            src={company.heroImage}
            alt={company.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: isDefunct
              ? 'linear-gradient(to bottom, rgba(107,114,128,0.4), rgba(16,42,67,0.6))'
              : 'linear-gradient(to bottom, transparent 40%, rgba(16,42,67,0.7))',
          }} />
          {/* Rank badge */}
          <div style={{
            position: 'absolute', top: 12, left: 12,
            width: 32, height: 32, borderRadius: '50%',
            background: isDefunct ? '#6B7280' : 'linear-gradient(135deg, #C9A84C, #A8882B)',
            color: '#fff', fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {rank}
          </div>
          {/* Type badge */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            padding: '3px 10px', borderRadius: 100,
            background: 'rgba(255,255,255,0.9)',
            fontSize: 10, fontWeight: 600, color: '#102A43',
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            {typeLabels[company.type] || company.type}
          </div>
          {/* Company name on image */}
          <div style={{ position: 'absolute', bottom: 12, left: 16 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {company.name}
            </h3>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4, marginBottom: 12, flex: 1 }}>
            {company.tagline}
          </p>

          {/* Availability status */}
          <div style={{ marginBottom: 12 }}>
            <StatusDot status={company.status} waitlistInfo={company.waitlistInfo} />
          </div>

          {/* Pricing */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 8, marginBottom: 12,
          }}>
            <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Starting</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginTop: 2 }}>
                {company.startingPrice === 'N/A' || company.startingPrice.startsWith('N/A') || company.startingPrice.startsWith('Request') || company.startingPrice.startsWith('Developer') || company.startingPrice.startsWith('Now')
                  ? isDefunct ? 'N/A' : 'Quote'
                  : company.startingPrice.split(' ')[0]}
              </div>
            </div>
            <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>$/sqft</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginTop: 2 }}>
                {company.pricePerSqft === 'N/A' ? 'N/A' : company.pricePerSqft.split('(')[0].split(';')[0].trim()}
              </div>
            </div>
          </div>

          {/* Build metrics */}
          {!isDefunct && company.buildMetrics.speedScore > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{
                display: 'flex', gap: 8, marginBottom: 6,
              }}>
                <div style={{ flex: 1, textAlign: 'center', background: 'var(--surface2)', borderRadius: 6, padding: '6px 4px' }}>
                  <div style={{ fontSize: 10, color: '#6B7280' }}>Factory</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--navy)' }}>{company.buildMetrics.factoryWeeks}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', background: 'var(--surface2)', borderRadius: 6, padding: '6px 4px' }}>
                  <div style={{ fontSize: 10, color: '#6B7280' }}>On-site</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--navy)' }}>{company.buildMetrics.onsiteDays}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', background: 'var(--surface2)', borderRadius: 6, padding: '6px 4px' }}>
                  <div style={{ fontSize: 10, color: '#6B7280' }}>Total</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--navy)' }}>{company.buildMetrics.totalWeeks}</div>
                </div>
              </div>
              <SpeedMeter score={company.buildMetrics.speedScore} label="Speed" />
            </div>
          )}

          {/* Scores */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[
              { label: 'Design', score: company.designScore, color: '#C9A84C' },
              { label: 'Sustainability', score: company.sustainabilityScore, color: '#10B981' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.score}/10</span>
                </div>
                <div style={{ height: 4, background: 'rgba(16,42,67,0.08)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${s.score * 10}%`, background: s.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Sentiment */}
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Community Sentiment:
            </span>{' '}
            <span style={{ fontSize: 11, fontWeight: 600, color: sentimentColors[company.communitysentiment] }}>
              {sentimentLabels[company.communitysentiment]}
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setTourOpen(true)}
              style={{
                flex: 1, padding: '9px 0',
                background: 'linear-gradient(135deg, #C9A84C, #A8882B)',
                border: 'none', borderRadius: 8,
                color: '#fff', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(201,168,76,0.3)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
            >
              View Tour
            </button>
            {!isDefunct && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1, padding: '9px 0',
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--navy)', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  textDecoration: 'none',
                }}
              >
                Website ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {tourOpen && <TourModal company={company} onClose={() => setTourOpen(false)} />}
    </>
  );
}

// ─── Comparison Table ──────────────────────────────────────────────────────────

type SortKey = 'rank' | 'startingPrice' | 'designScore' | 'sustainabilityScore' | 'name';

function ComparisonTable() {
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(1); }
  };

  const sorted = [...COMPANIES].sort((a, b) => {
    let av: number | string, bv: number | string;
    if (sortKey === 'rank') { av = a.rank; bv = b.rank; }
    else if (sortKey === 'designScore') { av = a.designScore; bv = b.designScore; }
    else if (sortKey === 'sustainabilityScore') { av = a.sustainabilityScore; bv = b.sustainabilityScore; }
    else if (sortKey === 'name') { av = a.name; bv = b.name; }
    else { av = a.rank; bv = b.rank; }
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sortDir;
    return String(av).localeCompare(String(bv)) * sortDir;
  });

  const statusColors: Record<AvailabilityStatus, string> = {
    available: '#059669',
    waitlist: '#D97706',
    b2b_only: '#DC2626',
    defunct: '#6B7280',
  };
  const statusLabels: Record<AvailabilityStatus, string> = {
    available: 'Available',
    waitlist: 'Waitlist',
    b2b_only: 'B2B Only',
    defunct: 'Defunct',
  };
  const sentimentColors: Record<Sentiment, string> = {
    very_positive: '#059669',
    positive: '#10B981',
    mixed: '#D97706',
    negative: '#DC2626',
  };
  const sentimentShort: Record<Sentiment, string> = {
    very_positive: 'Very Positive',
    positive: 'Positive',
    mixed: 'Mixed',
    negative: 'Negative',
  };

  const Th = ({ k, children }: { k?: SortKey; children: React.ReactNode }) => (
    <th
      onClick={k ? () => handleSort(k) : undefined}
      style={{
        padding: '10px 14px', fontSize: 11, fontWeight: 600,
        color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em',
        background: 'var(--surface2)', borderBottom: '1px solid var(--border)',
        whiteSpace: 'nowrap', cursor: k ? 'pointer' : 'default',
        userSelect: 'none', fontFamily: 'Inter, sans-serif',
      }}
    >
      {children}{k && sortKey === k ? (sortDir === 1 ? ' ↑' : ' ↓') : k ? ' ↕' : ''}
    </th>
  );

  return (
    <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--warm-shadow)' }}>
      <table style={{ minWidth: 1100 }}>
        <thead>
          <tr>
            <Th k="rank">#</Th>
            <Th k="name">Company</Th>
            <Th>Type</Th>
            <Th>Starting Price</Th>
            <Th>$/sqft</Th>
            <Th>Factory Time</Th>
            <Th>Total Timeline</Th>
            <Th>States</Th>
            <Th k="sustainabilityScore">Sustain.</Th>
            <Th k="designScore">Design</Th>
            <Th>Sentiment</Th>
            <Th>Status</Th>
            <Th>Link</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((co, i) => (
            <tr
              key={co.id}
              style={{
                borderBottom: '1px solid var(--border)',
                background: i % 2 === 0 ? 'var(--surface)' : 'rgba(251,247,240,0.4)',
                opacity: co.status === 'defunct' ? 0.6 : 1,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(201,168,76,0.05)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'var(--surface)' : 'rgba(251,247,240,0.4)'; }}
            >
              <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'Inter' }}>{co.rank}</td>
              <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: 13, color: 'var(--navy)', whiteSpace: 'nowrap', fontFamily: 'Inter' }}>{co.name}</td>
              <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--muted)', fontFamily: 'Inter' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 100,
                  background: 'var(--surface2)', fontSize: 11, fontWeight: 500, color: 'var(--navy)',
                }}>
                  {co.type.replace('_', ' ')}
                </span>
              </td>
              <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--navy)', fontFamily: 'Inter', whiteSpace: 'nowrap' }}>
                {co.startingPrice.startsWith('N/A') || co.startingPrice.startsWith('Developer') || co.startingPrice.startsWith('Now') ? '—' : co.startingPrice.split('(')[0].trim()}
              </td>
              <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--muted)', fontFamily: 'Inter', whiteSpace: 'nowrap' }}>
                {co.pricePerSqft === 'N/A' ? '—' : co.pricePerSqft.split('(')[0].trim()}
              </td>
              <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--muted)', fontFamily: 'Inter', whiteSpace: 'nowrap' }}>
                {co.buildMetrics.factoryWeeks !== 'N/A' ? co.buildMetrics.factoryWeeks : '—'}
              </td>
              <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--muted)', fontFamily: 'Inter', whiteSpace: 'nowrap' }}>
                {co.buildMetrics.totalWeeks !== 'N/A' ? co.buildMetrics.totalWeeks : '—'}
              </td>
              <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--muted)', fontFamily: 'Inter', maxWidth: 150 }}>
                {co.statesAvailable.split(';')[0].split('(')[0].split('+')[0].trim()}
              </td>
              <td style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'Inter' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: co.sustainabilityScore >= 9 ? '#059669' : co.sustainabilityScore >= 7 ? '#10B981' : '#D97706' }}>
                  {co.sustainabilityScore}/10
                </span>
              </td>
              <td style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'Inter' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: co.designScore >= 9 ? '#7C3AED' : co.designScore >= 7 ? '#C9A84C' : '#6B7280' }}>
                  {co.designScore}/10
                </span>
              </td>
              <td style={{ padding: '12px 14px', fontFamily: 'Inter' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: sentimentColors[co.communitysentiment] }}>
                  {sentimentShort[co.communitysentiment]}
                </span>
              </td>
              <td style={{ padding: '12px 14px', fontFamily: 'Inter' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                  background: `${statusColors[co.status]}15`,
                  color: statusColors[co.status],
                  border: `1px solid ${statusColors[co.status]}30`,
                }}>
                  {statusLabels[co.status]}
                </span>
              </td>
              <td style={{ padding: '12px 14px', fontFamily: 'Inter' }}>
                {co.status !== 'defunct' && (
                  <a href={co.website} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, color: 'var(--accent-dark)', fontWeight: 500 }}>
                    Visit ↗
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── ZURU Hero Section ────────────────────────────────────────────────────────

function ZURUHeroSection() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #102A43 0%, #1E4063 50%, #102A43 100%)',
      borderRadius: 24, overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(16,42,67,0.3)',
      marginBottom: 48,
      position: 'relative',
    }}>
      {/* Background texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(201,168,76,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(201,168,76,0.05) 0%, transparent 50%)',
      }} />

      <div style={{ position: 'relative', padding: '48px 48px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            padding: '4px 14px', borderRadius: 100,
            background: 'rgba(201,168,76,0.15)',
            border: '1px solid rgba(201,168,76,0.4)',
            fontSize: 11, fontWeight: 700, color: '#C9A84C',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            fontFamily: 'Inter',
          }}>
            Disruptor Watch
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter' }}>
            Pre-commercial · Malibu 2027 delivery target
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          {/* Left column */}
          <div>
            <h1 style={{
              fontSize: 42, fontWeight: 900, color: '#fff',
              lineHeight: 1.1, marginBottom: 20,
              fontFamily: 'Playfair Display, Georgia, serif',
            }}>
              ZURU Tech
              <span style={{ display: 'block', color: '#C9A84C', fontSize: 28, marginTop: 4 }}>
                The Biggest Bet in Housing
              </span>
            </h1>

            {/* Sam Parr quote */}
            <div style={{
              borderLeft: '3px solid #C9A84C',
              paddingLeft: 20, marginBottom: 24,
            }}>
              <p style={{
                fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)',
                fontStyle: 'italic', marginBottom: 8,
                fontFamily: 'Playfair Display, Georgia, serif',
              }}>
                "{ZURU_TECH.samParrQuote}"
              </p>
              <p style={{ fontSize: 12, color: '#C9A84C', fontWeight: 600, fontFamily: 'Inter' }}>
                — {ZURU_TECH.samParrSource}
              </p>
            </div>

            {/* Key stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {[
                { label: 'Self-Funded', value: '$1B+', sub: 'Mowbray brothers\' own capital' },
                { label: 'Malibu Lots', value: '16', sub: '$60-80M post-LA fires' },
                { label: 'Factory Output', value: '~1/day', sub: 'China pilot factory' },
                { label: 'Target Price', value: '$28-56', sub: 'per sqft aspirational' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 12, padding: '14px 16px',
                  border: '1px solid rgba(201,168,76,0.15)',
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#C9A84C', fontFamily: 'Inter' }}>{stat.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginTop: 2, fontFamily: 'Inter' }}>{stat.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1, fontFamily: 'Inter' }}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div>
            {/* Claims with verified badges */}
            <h4 style={{ fontSize: 13, fontWeight: 600, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter' }}>
              Key Claims
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {ZURU_TECH.keyClaims.map((claim, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700,
                    flexShrink: 0, fontFamily: 'Inter', marginTop: 1,
                    background: claim.verified ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: claim.verified ? '#6EE7B7' : '#FCA5A5',
                    border: `1px solid ${claim.verified ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  }}>
                    {claim.verified ? '✓ Verified' : '? Unverified'}
                  </span>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 500, marginBottom: 2, fontFamily: 'Inter' }}>{claim.claim}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter' }}>{claim.note}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline to Malibu */}
            <div style={{
              background: 'rgba(201,168,76,0.08)', borderRadius: 12,
              padding: '16px', border: '1px solid rgba(201,168,76,0.2)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'Inter' }}>
                Malibu Project Timeline
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { phase: 'LA Fires', time: 'Jan 2026', done: true },
                  { phase: 'Lots Acquired', time: 'Early 2026', done: true },
                  { phase: 'Design Phase', time: 'Mid 2026', done: true },
                  { phase: 'Factory Production', time: 'Late 2026', done: false },
                  { phase: 'Malibu Delivery', time: '2027 Target', done: false },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: item.done ? '#C9A84C' : 'rgba(201,168,76,0.2)',
                      border: `2px solid ${item.done ? '#C9A84C' : 'rgba(201,168,76,0.4)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: item.done ? '#102A43' : 'rgba(201,168,76,0.4)',
                    }}>
                      {item.done ? '✓' : '○'}
                    </div>
                    <span style={{ fontSize: 12, color: item.done ? '#fff' : 'rgba(255,255,255,0.4)', flex: 1, fontFamily: 'Inter' }}>{item.phase}</span>
                    <span style={{ fontSize: 11, color: item.done ? '#C9A84C' : 'rgba(201,168,76,0.4)', fontFamily: 'Inter' }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Market Insights Bar ──────────────────────────────────────────────────────

function MarketInsightsBar() {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div style={{ marginBottom: 56 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>
        Market Intelligence
      </h2>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, fontFamily: 'Inter' }}>
        Five verified insights from the prefab market research.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        {MARKET_INSIGHTS.map(insight => (
          <div
            key={insight.id}
            onClick={() => setExpanded(expanded === insight.id ? null : insight.id)}
            style={{
              background: 'var(--surface)',
              borderRadius: 16, padding: '20px',
              border: `1px solid ${expanded === insight.id ? insight.color + '40' : 'var(--border)'}`,
              boxShadow: expanded === insight.id ? `0 8px 32px ${insight.color}20` : 'var(--warm-shadow)',
              cursor: 'pointer',
              transition: 'all 0.25s',
              borderTop: `3px solid ${insight.color}`,
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${insight.color}15`, border: `1px solid ${insight.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: insight.color,
              marginBottom: 12, fontFamily: 'Inter',
            }}>
              {insight.icon}
            </div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 4, lineHeight: 1.3, fontFamily: 'Inter' }}>
              {insight.title}
            </h4>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.4, fontFamily: 'Inter' }}>
              {insight.subtitle}
            </p>
            {expanded === insight.id && (
              <p style={{
                fontSize: 12, color: 'var(--text)', lineHeight: 1.6,
                marginTop: 10, paddingTop: 10,
                borderTop: '1px solid var(--border)',
                fontFamily: 'Inter',
                animation: 'fadeIn 0.3s ease-out',
              }}>
                {insight.detail}
              </p>
            )}
            <div style={{ fontSize: 11, color: 'var(--accent-dark)', fontWeight: 600, fontFamily: 'Inter', marginTop: 4 }}>
              {expanded === insight.id ? 'Show less ↑' : 'Read more ↓'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [filterStatus, setFilterStatus] = useState<AvailabilityStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = COMPANIES.filter(co => {
    if (filterStatus !== 'all' && co.status !== filterStatus) return false;
    if (filterType !== 'all' && co.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return co.name.toLowerCase().includes(q) || co.tagline.toLowerCase().includes(q) || co.statesAvailable.toLowerCase().includes(q);
    }
    return true;
  });

  const statusOptions: { value: AvailabilityStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available Now' },
    { value: 'waitlist', label: 'Waitlist' },
    { value: 'b2b_only', label: 'B2B Only' },
    { value: 'defunct', label: 'Defunct' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'modular', label: 'Modular' },
    { value: '3d_printed', label: '3D Printed' },
    { value: 'panelized', label: 'Panelized' },
    { value: 'volumetric', label: 'Volumetric' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #FBF7F0 0%, #F5EFE6 50%, #FBF7F0 100%)',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
        padding: '48px 0 40px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '4px 16px', borderRadius: 100,
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.3)',
              fontSize: 11, fontWeight: 700, color: '#A8882B',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 20, fontFamily: 'Inter',
            }}>
              Research Dated November 25, 2026
            </div>
            <h1 style={{
              fontSize: 'clamp(36px, 6vw, 72px)',
              fontWeight: 900, color: 'var(--navy)',
              lineHeight: 1.05, marginBottom: 16,
              fontFamily: 'Playfair Display, Georgia, serif',
            }}>
              Prefab Intel
            </h1>
            <p style={{
              fontSize: 'clamp(16px, 2vw, 22px)',
              color: 'var(--navy)', opacity: 0.6,
              maxWidth: 600, margin: '0 auto 8px',
              fontFamily: 'Playfair Display, Georgia, serif',
              fontStyle: 'italic',
            }}>
              The definitive ranking of luxury prefab, modular & innovative home companies
            </p>
            <p style={{
              fontSize: 14, color: 'var(--muted)',
              maxWidth: 560, margin: '0 auto',
              fontFamily: 'Inter', lineHeight: 1.6,
            }}>
              15 companies ranked and rated. Verified build times, real community sentiment,
              walkable virtual tours, and the market insights that actually matter.
            </p>
          </div>

          {/* Quick stats */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap',
          }}>
            {[
              { value: '15', label: 'Companies Ranked' },
              { value: '$583M', label: 'ICON Series D Lead' },
              { value: '40 Days', label: 'Fading West Record' },
              { value: '2027', label: 'ZURU Malibu Target' },
              { value: '$307B', label: 'Market by 2035' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-dark)', fontFamily: 'Inter' }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Inter' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>

        {/* ZURU Hero */}
        <ZURUHeroSection />

        {/* Market Insights */}
        <MarketInsightsBar />

        {/* Filters and view toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          marginBottom: 24, paddingBottom: 24,
          borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--navy)', marginRight: 8 }}>
            Rankings
          </h2>

          {/* Search */}
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search companies..."
            style={{
              padding: '8px 14px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--surface)',
              fontSize: 13, color: 'var(--navy)', fontFamily: 'Inter',
              outline: 'none', width: 180,
              boxShadow: 'var(--warm-shadow)',
            }}
          />

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as AvailabilityStatus | 'all')}
            style={{
              padding: '8px 12px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--surface)',
              fontSize: 13, color: 'var(--navy)', fontFamily: 'Inter',
              cursor: 'pointer', outline: 'none',
              boxShadow: 'var(--warm-shadow)',
            }}
          >
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--surface)',
              fontSize: 13, color: 'var(--navy)', fontFamily: 'Inter',
              cursor: 'pointer', outline: 'none',
              boxShadow: 'var(--warm-shadow)',
            }}
          >
            {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            {(['cards', 'table'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  fontFamily: 'Inter', cursor: 'pointer', transition: 'all 0.2s',
                  border: '1px solid var(--border)',
                  background: viewMode === mode ? 'linear-gradient(135deg, #C9A84C, #A8882B)' : 'var(--surface)',
                  color: viewMode === mode ? '#fff' : 'var(--navy)',
                  boxShadow: viewMode === mode ? '0 2px 8px rgba(201,168,76,0.3)' : 'var(--warm-shadow)',
                }}
              >
                {mode === 'cards' ? '⊞ Cards' : '⊟ Table'}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div style={{ marginBottom: 20, fontSize: 13, color: 'var(--muted)', fontFamily: 'Inter' }}>
          Showing {filteredCompanies.length} of {COMPANIES.length} companies
        </div>

        {/* View */}
        {viewMode === 'table' ? (
          <ComparisonTable />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
          }}>
            {filteredCompanies.map(co => (
              <CompanyCard key={co.id} company={co} rank={co.rank} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 64, paddingTop: 32,
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginBottom: 8, fontFamily: 'Playfair Display, Georgia, serif' }}>
            Prefab Intel
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 500, margin: '0 auto 16px', fontFamily: 'Inter', lineHeight: 1.6 }}>
            Research compiled November 2026. Build times, pricing, and status reflect verified public information at time of publication. Always verify current availability and pricing directly with companies before making decisions.
          </p>
          <p style={{ fontSize: 11, color: 'var(--muted-light)', fontFamily: 'Inter' }}>
            Commissioned by Owen Hammond · Paradigm Drift Research
          </p>
        </div>
      </div>
    </main>
  );
}
