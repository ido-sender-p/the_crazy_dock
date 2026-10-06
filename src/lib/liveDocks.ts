import type { Dock } from "../data";
import { staticBySlug, looksLikeLiveSlug } from "./staticDocks";

// Published (review_status = 'published') user submissions, read live from D1
// and merged into the same listing pages that render the static `docks`
// array, so approving a submission makes it appear immediately, no deploy.

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
  image_orientation: string | null;
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
    imageOrientation: r.image_orientation === "portrait" ? "portrait" : "landscape",
    lengthM: r.length_m ?? 0,
    yearBuilt: r.year_built,
  };
}

const SELECT = `SELECT slug, name, dock_type, continent, continent_slug, country, country_code,
  state_province, state_province_slug, settlement, settlement_type, settlement_slug,
  lat, lon, description, image_url, image_attribution, image_orientation, length_m, year_built
  FROM docks WHERE source = 'user_submission' AND review_status = 'published'`;

async function findPublishedDockBySlug(db: D1Database, slug: string): Promise<Dock | null> {
  const row = await db.prepare(`${SELECT} AND slug = ?`).bind(slug).first<DockRow>();
  return row ? toDock(row) : null;
}

// The one dock-by-slug resolver. Checks the static catalogue first, and only
// asks D1 when the slug could be a user-submitted one.
export async function resolveDock(db: D1Database | undefined, slug: string): Promise<Dock | null> {
  const staticDock = staticBySlug.get(slug);
  if (staticDock) return staticDock;
  if (!db || !looksLikeLiveSlug(slug)) return null;
  return findPublishedDockBySlug(db, slug);
}

// Many slugs at once (favorites): static ones from memory, the rest with
// WHERE slug IN (...) in chunks (D1 allows 100 bound parameters). Keeps order.
export async function resolveDocks(db: D1Database | undefined, slugs: string[]): Promise<Dock[]> {
  const found = new Map<string, Dock>();
  const missing: string[] = [];
  for (const slug of slugs) {
    const d = staticBySlug.get(slug);
    if (d) found.set(slug, d);
    else if (looksLikeLiveSlug(slug)) missing.push(slug);
  }
  if (db && missing.length) {
    const chunks: string[][] = [];
    for (let i = 0; i < missing.length; i += 90) chunks.push(missing.slice(i, i + 90));
    const results = await Promise.all(
      chunks.map((chunk) =>
        db
          .prepare(`${SELECT} AND slug IN (${chunk.map(() => "?").join(",")})`)
          .bind(...chunk)
          .all<DockRow>(),
      ),
    );
    for (const r of results) for (const row of r.results) found.set(row.slug, toDock(row));
  }
  return slugs.map((s) => found.get(s)).filter((d): d is Dock => !!d);
}

async function listLive(db: D1Database, where: string, value: string): Promise<Dock[]> {
  const result = await db.prepare(`${SELECT} AND ${where} = ? LIMIT 500`).bind(value).all<DockRow>();
  return result.results.map(toDock);
}

export const findPublishedDocksByContinent = (db: D1Database, slug: string) => listLive(db, "continent_slug", slug);
export const findPublishedDocksByCountryName = (db: D1Database, country: string) => listLive(db, "country", country);
export const findPublishedDocksBySettlementSlug = (db: D1Database, slug: string) => listLive(db, "settlement_slug", slug);
export const findPublishedDocksByRegionSlug = (db: D1Database, slug: string) => listLive(db, "state_province_slug", slug);

export type LiveSitemapRow = {
  slug: string;
  settlement_type: string | null;
  settlement_slug: string | null;
  state_province_slug: string | null;
};

export async function findLiveSitemapRows(db: D1Database): Promise<LiveSitemapRow[]> {
  const result = await db
    .prepare(
      `SELECT slug, settlement_type, settlement_slug, state_province_slug FROM docks
       WHERE source = 'user_submission' AND review_status = 'published' LIMIT 5000`,
    )
    .all<LiveSitemapRow>();
  return result.results;
}
