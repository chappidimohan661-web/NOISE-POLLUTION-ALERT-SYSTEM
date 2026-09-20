/*
# Noise Pollution Alert System — Initial Schema

## Overview
Creates the core tables for the AI-Based Noise Pollution Alert System.

## New Tables

### noise_readings
Stores every simulated sensor reading with its AI analysis result.
- `id` — auto-incrementing primary key
- `noise_level` — measured noise in decibels (float)
- `safe_limit` — AI-determined threshold for the reading's time period (float)
- `time_period` — morning / afternoon / evening / night
- `status` — Safe / Moderate / High / Dangerous
- `ai_recommendation` — text recommendation from AI logic
- `recorded_at` — when the reading was taken (defaults to now())

## Security
- RLS enabled on all tables.
- Policies scoped to anon + authenticated (no login required to read/write sensor data).
*/

CREATE TABLE IF NOT EXISTS noise_readings (
  id          bigserial PRIMARY KEY,
  noise_level float     NOT NULL,
  safe_limit  float     NOT NULL,
  time_period text      NOT NULL CHECK (time_period IN ('morning','afternoon','evening','night')),
  status      text      NOT NULL CHECK (status IN ('Safe','Moderate','High','Dangerous')),
  ai_recommendation text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE noise_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_noise" ON noise_readings;
CREATE POLICY "anon_select_noise" ON noise_readings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_noise" ON noise_readings;
CREATE POLICY "anon_insert_noise" ON noise_readings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_noise" ON noise_readings;
CREATE POLICY "anon_update_noise" ON noise_readings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_noise" ON noise_readings;
CREATE POLICY "anon_delete_noise" ON noise_readings FOR DELETE
  TO anon, authenticated USING (true);
