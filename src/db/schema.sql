CREATE TABLE IF NOT EXISTS docks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL DEFAULT 'osm',  -- osm | user_submission
  osm_type TEXT,                       -- node | way | relation (osm rows only)
  osm_id INTEGER,                      -- (osm rows only)
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
  length_m REAL,
  year_built INTEGER,
  source_tags TEXT,                    -- raw OSM tags as JSON, kept for re-enrichment
  published INTEGER NOT NULL DEFAULT 0, -- 0 until description/image pass thin-content check
  review_status TEXT NOT NULL DEFAULT 'pending', -- pending | blocked | published | rejected (user_submission rows)
  block_reason TEXT,                   -- set when review_status = 'blocked' (route doesn't exist yet)
  source_updated_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (osm_type, osm_id)
);

CREATE INDEX IF NOT EXISTS idx_docks_continent ON docks (continent_slug);
CREATE INDEX IF NOT EXISTS idx_docks_country ON docks (country_code);
CREATE INDEX IF NOT EXISTS idx_docks_state_province ON docks (state_province_slug);
CREATE INDEX IF NOT EXISTS idx_docks_settlement ON docks (settlement_slug);
CREATE INDEX IF NOT EXISTS idx_docks_type ON docks (dock_type);
CREATE INDEX IF NOT EXISTS idx_docks_published ON docks (published);

-- Auth: gates the "submit a new marina" form behind a real account.
-- Google-only accounts get password_hash = 'oauth:google' — verifyPassword
-- already rejects anything that doesn't parse as "pbkdf2$...", so that
-- placeholder can never itself be used to log in via the password form.
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

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL DEFAULT (datetime('now', '+30 days'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);

-- Brute-force throttling: count recent failures per email before checking
-- a password, independent of whether that email even has an account.
CREATE TABLE IF NOT EXISTS login_failures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_login_failures_email ON login_failures (email, attempted_at);

-- Extra community photos for a dock that already exists (the "Got a better
-- photo?" box on the dock page), separate from the initial dock submission.
-- dock_slug is a plain string, not a foreign key — the dock it points at
-- may be one of the hardcoded data.ts entries or a published D1 row, and
-- those two don't share a table.
CREATE TABLE IF NOT EXISTS dock_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dock_slug TEXT NOT NULL,
  submitted_by INTEGER NOT NULL REFERENCES users (id),
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,        -- denormalized count of ratings, kept in sync with photo_votes
  avg_rating REAL NOT NULL DEFAULT 0,      -- denormalized AVG(rating), same source of truth
  review_status TEXT NOT NULL DEFAULT 'pending', -- pending | published | rejected
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dock_photos_slug ON dock_photos (dock_slug, review_status);

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

-- Saved/favorited docks. dock_slug is a plain string for the same reason as
-- dock_photos.dock_slug — it may point at a hardcoded data.ts entry or a
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

-- Comments on a dock photo. Separate from photo_votes (the 1-10 rating) —
-- comments are plain discussion text and, unlike ratings, are shown openly.
CREATE TABLE IF NOT EXISTS photo_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  photo_id INTEGER NOT NULL REFERENCES dock_photos (id),
  user_id INTEGER NOT NULL REFERENCES users (id),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_photo_comments_photo ON photo_comments (photo_id, created_at);
