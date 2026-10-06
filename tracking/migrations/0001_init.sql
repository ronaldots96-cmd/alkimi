-- Alkimi LPs tracking: initial schema (D1 / SQLite).
-- Apply with: npx wrangler d1 execute alkimi-tracking --remote --file=tracking/migrations/0001_init.sql

-- One row per visitor (400-day _alk_sid cookie): first-touch landing URL and the latest non-empty click ids / UTMs.
CREATE TABLE IF NOT EXISTS sessions (
  session_id   TEXT PRIMARY KEY,
  external_id  TEXT NOT NULL,
  fbclid       TEXT DEFAULT '',
  gclid        TEXT DEFAULT '',
  gbraid       TEXT DEFAULT '',
  wbraid       TEXT DEFAULT '',
  msclkid      TEXT DEFAULT '',
  fbc          TEXT DEFAULT '',
  fbp          TEXT DEFAULT '',
  referrer     TEXT DEFAULT '',
  landing_url  TEXT DEFAULT '',
  utm_source   TEXT DEFAULT '',
  utm_medium   TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  utm_content  TEXT DEFAULT '',
  utm_term     TEXT DEFAULT '',
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at);

-- One row per visitor per landing page per experiment (experiment '' / variant 'default' = no test running).
-- Denominator of the conversion rate in the A/B report.
CREATE TABLE IF NOT EXISTS lp_exposures (
  session_id   TEXT NOT NULL,
  lp           TEXT NOT NULL,
  experiment   TEXT NOT NULL DEFAULT '',
  variant      TEXT NOT NULL,
  first_seen   INTEGER NOT NULL,
  utm_source   TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  PRIMARY KEY (session_id, lp, experiment)
);
CREATE INDEX IF NOT EXISTS idx_exposures_exp ON lp_exposures(lp, experiment, variant, first_seen);

-- Server-side conversion events (Lead). PageView is never logged here.
CREATE TABLE IF NOT EXISTS event_log (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id         TEXT,
  event_name         TEXT NOT NULL,
  event_id           TEXT NOT NULL UNIQUE,
  timestamp          INTEGER NOT NULL,
  lp                 TEXT DEFAULT '',
  experiment         TEXT DEFAULT '',
  variant            TEXT DEFAULT 'default',
  is_qa              INTEGER DEFAULT 0,  -- variant forced with ?ab= (QA): excluded from A/B results
  browser            TEXT,
  os                 TEXT,
  is_mobile          INTEGER DEFAULT 0,
  pixel_loaded       INTEGER DEFAULT 0,
  fbp_source         TEXT,
  fbc_present        INTEGER DEFAULT 0,
  is_bot             INTEGER DEFAULT 0,
  bot_reason         TEXT,
  meta_status_code   INTEGER DEFAULT 0,
  meta_response_ok   INTEGER DEFAULT 0,
  meta_response_body TEXT,
  meta_payload_sent  TEXT,
  has_email          INTEGER DEFAULT 0,
  has_phone          INTEGER DEFAULT 0,
  has_name           INTEGER DEFAULT 0,
  raw_email          TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_event_log_ts ON event_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_event_log_exp ON event_log(lp, experiment, variant);
