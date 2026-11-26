'use client';

import { useState, useEffect } from 'react';

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

const COMPANIES = [
  'ICON', 'Dvele', 'Plant Prefab', 'Method Homes', 'Mighty Buildings',
  'Abodu', 'Boxabl', 'Cover', 'Villa Homes', 'Acre Designs', 'Fading West', 'Atmos',
];

interface Review {
  id: string;
  company_name: string;
  rating: number;
  review_text: string;
  reviewer_name: string;
  location: string;
  verified_owner: boolean;
  created_at: string;
}

function StarRating({ value, onChange, size = 24 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{
            fontSize: `${size}px`,
            cursor: onChange ? 'pointer' : 'default',
            color: star <= (hover || value) ? C.accent : '#D1D5DB',
            transition: '0.1s',
            userSelect: 'none',
          }}
        >★</span>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  return (
    <div style={{
      background: C.surface,
      borderRadius: '12px',
      padding: '20px 24px',
      border: `1px solid ${C.border}`,
      boxShadow: '0 2px 12px rgba(16,42,67,0.06)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: '16px', color: C.navy }}>{review.company_name}</span>
          {review.verified_owner && (
            <span style={{
              marginLeft: '8px', fontSize: '11px', fontWeight: 600,
              background: `rgba(201,168,76,0.15)`, color: C.accentDark,
              padding: '2px 8px', borderRadius: '20px', border: `1px solid ${C.accentLight}`,
            }}>✓ Verified Owner</span>
          )}
        </div>
        <StarRating value={review.rating} size={18} />
      </div>
      <p style={{ color: C.text, lineHeight: '1.6', marginBottom: '12px', fontSize: '15px' }}>{review.review_text}</p>
      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: C.muted }}>
        <span>👤 {review.reviewer_name}</span>
        {review.location && <span>📍 {review.location}</span>}
        <span style={{ marginLeft: 'auto' }}>{date}</span>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Form state
  const [company, setCompany] = useState('');
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function fetchReviews() {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/prefab_reviews?order=created_at.desc&limit=20`,
        { headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' } }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setFetchError(`Could not load reviews (${msg}). The table may need to be created — see schema.sql.`);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchReviews(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company || rating === 0 || !text.trim() || !name.trim()) {
      setSubmitError('Please fill in all required fields and select a star rating.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/prefab_reviews`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          company_name: company,
          rating,
          review_text: text.trim(),
          reviewer_name: name.trim(),
          location: location.trim(),
          verified_owner: isOwner,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `${res.status}`);
      }
      setSubmitted(true);
      setCompany(''); setRating(0); setText(''); setName(''); setLocation(''); setIsOwner(false);
      setTimeout(() => fetchReviews(), 1000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setSubmitError(`Submission failed: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  // Compute per-company avg rating from loaded reviews
  const companyRatings: Record<string, { avg: number; count: number }> = {};
  for (const r of reviews) {
    if (!companyRatings[r.company_name]) companyRatings[r.company_name] = { avg: 0, count: 0 };
    companyRatings[r.company_name].avg += r.rating;
    companyRatings[r.company_name].count++;
  }
  for (const k of Object.keys(companyRatings)) {
    companyRatings[k].avg = companyRatings[k].avg / companyRatings[k].count;
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: `1.5px solid ${C.border}`, background: C.surface,
    color: C.text, fontSize: '15px', outline: 'none',
    fontFamily: 'Inter, sans-serif',
  };
  const labelStyle = { display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px', color: C.navyLight } as const;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <a href="/" style={{ color: C.accentLight, textDecoration: 'none', fontSize: '14px' }}>← Prefab Intel</a>
        <span style={{ color: C.muted }}>|</span>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>Owner Reviews</span>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
          Real Owner Reviews
        </h1>
        <p style={{ color: C.muted, marginBottom: '40px', fontSize: '16px' }}>
          Firsthand experiences from prefab homeowners — no PR, no filters.
        </p>

        {/* Rating summary */}
        {Object.keys(companyRatings).length > 0 && (
          <div style={{
            background: C.surface, borderRadius: '12px', padding: '20px 24px',
            border: `1px solid ${C.border}`, marginBottom: '32px',
          }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '16px' }}>Community Ratings</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {Object.entries(companyRatings).map(([co, { avg, count }]) => (
                <div key={co} style={{
                  background: C.surface2, borderRadius: '8px', padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{co}</span>
                  <StarRating value={Math.round(avg)} size={14} />
                  <span style={{ fontSize: '12px', color: C.muted }}>({count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Form */}
        <div style={{
          background: C.surface, borderRadius: '16px', padding: '32px',
          border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(16,42,67,0.08)',
          marginBottom: '40px',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>Share Your Experience</h2>

          {submitted ? (
            <div style={{
              textAlign: 'center', padding: '40px 20px',
              color: C.success, fontSize: '18px', fontWeight: 600,
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>✓</div>
              Thank you! Your review has been submitted.
              <div style={{ marginTop: '12px' }}>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    padding: '10px 24px', borderRadius: '8px', border: 'none',
                    background: C.navy, color: '#fff', fontWeight: 600, cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >Write Another Review</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Company *</label>
                  <select value={company} onChange={e => setCompany(e.target.value)} style={inputStyle}>
                    <option value="">Select company…</option>
                    {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Your Name *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="First name + last initial" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                    placeholder="City, State" style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Rating *</label>
                <StarRating value={rating} onChange={setRating} size={36} />
                <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>
                  {rating === 1 ? 'Poor' : rating === 2 ? 'Below average' : rating === 3 ? 'Average' : rating === 4 ? 'Good' : rating === 5 ? 'Excellent!' : 'Click to rate'}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Your Review *</label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Share your honest experience — build quality, timeline, communication, what surprised you…"
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: '1.6' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <input
                  type="checkbox" id="owner-check" checked={isOwner}
                  onChange={e => setIsOwner(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: C.accent, cursor: 'pointer' }}
                />
                <label htmlFor="owner-check" style={{ fontWeight: 500, fontSize: '15px', cursor: 'pointer' }}>
                  I am a verified owner / completed buyer
                </label>
              </div>

              {submitError && (
                <div style={{
                  padding: '12px 16px', background: '#FEF2F2', borderRadius: '8px',
                  color: C.error, fontSize: '14px', marginBottom: '16px', border: '1px solid #FECACA',
                }}>{submitError}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px 32px', borderRadius: '10px', border: 'none',
                  background: submitting ? C.muted : C.navy,
                  color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '16px', transition: '0.15s',
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>

        {/* Reviews list */}
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>Recent Reviews</h2>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: C.muted }}>Loading reviews…</div>
        )}

        {fetchError && (
          <div style={{
            padding: '16px 20px', background: '#FEF9EE', borderRadius: '10px',
            color: '#92400E', fontSize: '14px', border: '1px solid #FDE68A', marginBottom: '20px',
          }}>⚠️ {fetchError}</div>
        )}

        {!loading && !fetchError && reviews.length === 0 && (
          <div style={{
            background: C.surface, borderRadius: '12px', padding: '40px',
            textAlign: 'center', border: `1px solid ${C.border}`, color: C.muted,
          }}>
            No reviews yet — be the first to share your experience!
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
        </div>
      </div>
    </div>
  );
}
