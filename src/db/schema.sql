CREATE TABLE IF NOT EXISTS docks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  osm_type TEXT NOT NULL,              -- node | way | relation
  osm_id INTEGER NOT NULL,
  slug TEXT NOT NULL UNIQUE,
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

  lat REAL NOT NULL,
  lon REAL NOT NULL,
  description TEXT,                    -- unique per-page copy, required for publish
  image_url TEXT,
  image_attribution TEXT,
  length_m REAL,
  year_built INTEGER,
  source_tags TEXT,                    -- raw OSM tags as JSON, kept for re-enrichment
  published INTEGER NOT NULL DEFAULT 0, -- 0 until description/image pass thin-content check
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
