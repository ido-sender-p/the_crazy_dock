-- Safe to re-run: every statement is CREATE ... IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS docks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL DEFAULT 'user_submission', -- only user submissions live in D1, the static catalogue is in code
  submitted_by INTEGER REFERENCES users (id), -- (user_submission rows only)
  slug TEXT UNIQUE,
  name TEXT NOT NULL,
  dock_type TEXT NOT NULL,             -- pier | marina | floating_dock | industrial | other

  -- Geographic breakdown: Continent > Country > State/Province > Settlement (City|Town|Village)
  continent TEXT,
  continent_slug TEXT,
  country TEXT,
  country_code TEXT,
  state_province TEXT,                 -- state/province/autonomous region, tier below country
  state_province_slug TEXT,
  settlement TEXT,                     -- city, town or village, tier below state/province
  settlement_type TEXT,                -- city | town | village
  settlement_slug TEXT,

  lat REAL,
  lon REAL,
  description TEXT,                    -- unique per-page copy, required for publish
  image_url TEXT,
  image_attribution TEXT,
  image_orientation TEXT NOT NULL DEFAULT 'landscape', -- portrait | landscape, detected from the uploaded photo
  length_m REAL,
  year_built INTEGER,
  review_status TEXT NOT NULL DEFAULT 'pending', -- pending | blocked | published | rejected
  block_reason TEXT,                   -- set when review_status = 'blocked'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_docks_continent ON docks (continent_slug);
CREATE INDEX IF NOT EXISTS idx_docks_country_name ON docks (country);
CREATE INDEX IF NOT EXISTS idx_docks_state_province ON docks (state_province_slug);
CREATE INDEX IF NOT EXISTS idx_docks_settlement ON docks (settlement_slug);
CREATE INDEX IF NOT EXISTS idx_docks_source_status ON docks (source, review_status);
CREATE INDEX IF NOT EXISTS idx_docks_submitter ON docks (submitted_by, review_status);

-- Auth: gates the "submit a new marina" form behind a real account.
-- Google-only accounts get password_hash = 'oauth:google' (GOOGLE_PASSWORD_SENTINEL
-- in lib/auth.ts). verifyPassword already rejects anything that doesn't parse
-- as "pbkdf2$...", so that placeholder can never be used to log in via the
-- password form.
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,         -- pbkdf2$iterations$saltHex$hashHex, never plaintext
  google_id TEXT,                      -- Google's stable "sub" claim, once linked
  avatar_url TEXT,                     -- /uploads/<r2 key>, null until they upload one
  date_of_birth TEXT,                  -- YYYY-MM-DD, optional
  location TEXT,                       -- free-text place of residence, optional
  is_admin INTEGER NOT NULL DEFAULT 0, -- only admins can review/approve submissions
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users (google_id);
-- Case-insensitive unique usernames. Also serves the prefix search (a
-- username COLLATE NOCASE range scan).
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username COLLATE NOCASE);

-- token is the SHA-256 hex of the cookie value, never the raw token.
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL DEFAULT (datetime('now', '+30 days'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);

-- Brute-force throttling: count recent failures per email and per client IP
-- before checking a password, independent of whether that email even has an
-- account. Old rows are purged whenever a new failure is recorded.
CREATE TABLE IF NOT EXISTS login_failures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  ip TEXT NOT NULL DEFAULT 'unknown',
  attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_login_failures_email ON login_failures (email, attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_failures_ip ON login_failures (ip, attempted_at);

-- Per-IP signup throttle, purged on insert the same way.
CREATE TABLE IF NOT EXISTS signup_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_signup_attempts_ip ON signup_attempts (ip, attempted_at);

-- Extra community photos for a dock that already exists (the "Got a better
-- photo?" box on the dock page), separate from the initial dock submission.
-- dock_slug is a plain string, not a foreign key. The dock it points at
-- may be one of the hardcoded data.ts entries or a published D1 row, and
-- those two don't share a table.
CREATE TABLE IF NOT EXISTS dock_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dock_slug TEXT NOT NULL,
  submitted_by INTEGER NOT NULL REFERENCES users (id),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',          -- short name, shown on the gallery tile
  caption TEXT NOT NULL,                   -- the longer story, shown in the lightbox
  image_orientation TEXT NOT NULL DEFAULT 'landscape', -- portrait | landscape, same detection as docks.image_orientation
  votes INTEGER NOT NULL DEFAULT 0,        -- denormalized count of ratings, kept in sync with photo_votes
  avg_rating REAL NOT NULL DEFAULT 0,      -- denormalized AVG(rating), same source of truth
  review_status TEXT NOT NULL DEFAULT 'pending', -- pending | published | rejected
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dock_photos_slug ON dock_photos (dock_slug, review_status);
CREATE INDEX IF NOT EXISTS idx_dock_photos_review ON dock_photos (review_status, created_at);
CREATE INDEX IF NOT EXISTS idx_dock_photos_submitter ON dock_photos (submitted_by, review_status);

-- One rating (1-10) per user per photo. The PK doubles as the uniqueness
-- constraint, so re-rating is an upsert (ON CONFLICT DO UPDATE) rather than
-- needing an app-level check-then-write race condition.
CREATE TABLE IF NOT EXISTS photo_votes (
  photo_id INTEGER NOT NULL REFERENCES dock_photos (id),
  user_id INTEGER NOT NULL REFERENCES users (id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (photo_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_photo_votes_user ON photo_votes (user_id, created_at);

-- Saved/favorited docks. dock_slug is a plain string for the same reason as
-- dock_photos.dock_slug, it may point at a hardcoded data.ts entry or a
-- published D1 row, and those two don't share a table.
CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER NOT NULL REFERENCES users (id),
  dock_slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, dock_slug)
);

-- Private user-to-user messages, more like email than live chat: no typing
-- indicators or delivery state, just a subject/body and a read marker.
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL REFERENCES users (id),
  recipient_id INTEGER NOT NULL REFERENCES users (id),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages (recipient_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id, created_at);

-- Comments on a dock photo. Separate from photo_votes (the 1-10 rating);
-- comments are plain discussion text and, unlike ratings, are shown openly.
CREATE TABLE IF NOT EXISTS photo_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  photo_id INTEGER NOT NULL REFERENCES dock_photos (id),
  user_id INTEGER NOT NULL REFERENCES users (id),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_photo_comments_photo ON photo_comments (photo_id, created_at);
CREATE INDEX IF NOT EXISTS idx_photo_comments_user ON photo_comments (user_id, created_at);
