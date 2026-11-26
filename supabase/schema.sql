-- ============================================================
-- Prefab Intel — Supabase Schema
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/oapahwsqehtxawrvsqkg/sql
-- ============================================================

-- 1. prefab_reviews
-- Stores owner reviews for prefab companies
CREATE TABLE IF NOT EXISTS prefab_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name    TEXT NOT NULL,
  rating          SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text     TEXT NOT NULL,
  reviewer_name   TEXT NOT NULL,
  location        TEXT,
  verified_owner  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (allow public reads, authenticated inserts)
ALTER TABLE prefab_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read reviews"
  ON prefab_reviews FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can submit reviews"
  ON prefab_reviews FOR INSERT WITH CHECK (TRUE);

-- Index for company filtering
CREATE INDEX IF NOT EXISTS idx_prefab_reviews_company ON prefab_reviews (company_name);
CREATE INDEX IF NOT EXISTS idx_prefab_reviews_created ON prefab_reviews (created_at DESC);


-- 2. prefab_waitlist
-- Newsletter signups — email + optional state
CREATE TABLE IF NOT EXISTS prefab_waitlist (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT NOT NULL,
  company_interest    TEXT[],           -- optional: array of company names
  state               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT prefab_waitlist_email_key UNIQUE (email)
);

ALTER TABLE prefab_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON prefab_waitlist FOR INSERT WITH CHECK (TRUE);

-- Note: no SELECT policy — only admins can read waitlist


-- 3. prefab_alerts
-- Per-company email alert signups
CREATE TABLE IF NOT EXISTS prefab_alerts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  company_name  TEXT NOT NULL,
  alert_type    TEXT NOT NULL CHECK (alert_type IN ('waitlist_open', 'price_drop', 'new_state', 'new_model')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT prefab_alerts_unique UNIQUE (email, company_name, alert_type)
);

ALTER TABLE prefab_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can set alerts"
  ON prefab_alerts FOR INSERT WITH CHECK (TRUE);

-- Index for querying by company
CREATE INDEX IF NOT EXISTS idx_prefab_alerts_company ON prefab_alerts (company_name);
CREATE INDEX IF NOT EXISTS idx_prefab_alerts_type ON prefab_alerts (alert_type);


-- ============================================================
-- Verification query — run after creation:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('prefab_reviews', 'prefab_waitlist', 'prefab_alerts');
-- ============================================================
