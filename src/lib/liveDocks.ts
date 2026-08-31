import { docks, type Dock } from "../data";

// Published (review_status = 'published') user submissions, read live from D1
// and merged into the same listing pages that render the static `docks`
// array — so approving a submission makes it appear immediately, no deploy.

type DockRow = {
  slug: string;
  name: string;
  dock_type: string;
  continent: string | null;
  continent_slug: string | null;
  country: string | null;
  country_code: string | null;
  state_province: string | null;
  state_province_slug: string | null;
  settlement: string | null;
  settlement_type: string | null;
  settlement_slug: string | null;
  lat: number | null;
  lon: number | null;
  description: string | null;
  image_url: string | null;
  image_attribution: string | null;
  length_m: number | null;
  year_built: number | null;
};

function toDock(r: DockRow): Dock {
  return {
    slug: r.slug,
    name: r.name,
    dockType: r.dock_type as Dock["dockType"],
    continent: r.continent ?? "",
    continentSlug: r.continent_slug ?? "",
    country: r.country ?? "",
    countryCode: r.country_code ?? "",
    stateProvince: r.state_province ?? "",
    stateProvinceSlug: r.state_province_slug ?? "",
    settlement: r.settlement ?? "",
    settlementType: (r.settlement_type as Dock["settlementType"]) ?? "city",
    settlementSlug: r.settlement_slug ?? "",
    lat: r.lat ?? 0,
    lon: r.lon ?? 0,
    description: r.description ?? "",
    imageUrl: r.image_url ?? "",
    imageAttribution: r.image_attribution ?? "",
    lengthM: r.length_m ?? 0,
    yearBuilt: r.year_built,
  };
}

const SELECT = `SELECT slug, name, dock_type, continent, continent_slug, country, country_code,
  state_province, state_province_slug, settlement, settlement_type, settlement_slug,
  lat, lon, description, image_url, image_attribution, length_m, year_built
  FROM docks WHERE source = 'user_submission' AND review_status = 'published'`;

export async function findPublishedDockBySlug(db: D1Database, slug: string): Promise<Dock | null> {
  const row = await db.prepare(`${SELECT} AND slug = ?`).bind(slug).first<DockRow>();
  return row ? toDock(row) : null;
}

// Checks the static catalogue first, then falls back to D1 — the same
// two-source lookup every dock-detail route already does, pulled out so
// features that just need "the dock for this slug" (favorites, etc.) don't
// each reimplement it.
export async function resolveDock(db: D1Database | undefined, slug: string): Promise<Dock | null> {
  const staticDock = docks.find((d) => d.slug === slug);
  if (staticDock) return staticDock;
  if (!db) return null;
  return findPublishedDockBySlug(db, slug);
}

export async function findPublishedDocksByContinent(db: D1Database, continentSlug: string): Promise<Dock[]> {
  const result = await db.prepare(`${SELECT} AND continent_slug = ?`).bind(continentSlug).all<DockRow>();
  return result.results.map(toDock);
}

export async function findPublishedDocksByCountryName(db: D1Database, country: string): Promise<Dock[]> {
  const result = await db.prepare(`${SELECT} AND country = ?`).bind(country).all<DockRow>();
  return result.results.map(toDock);
}

export async function findPublishedDocksBySettlementSlug(db: D1Database, slug: string): Promise<Dock[]> {
  const result = await db.prepare(`${SELECT} AND settlement_slug = ?`).bind(slug).all<DockRow>();
  return result.results.map(toDock);
}

export async function findPublishedDocksByType(db: D1Database, dockType: string): Promise<Dock[]> {
  const result = await db.prepare(`${SELECT} AND dock_type = ?`).bind(dockType).all<DockRow>();
  return result.results.map(toDock);
}
