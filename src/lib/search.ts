import { docks, continents, slugify, type Dock } from "../data";
import { countriesByContinent, citiesByCountry } from "../continents";

export type UserSearchResult = { id: number; username: string; avatar_url: string | null };

export async function searchUsers(db: D1Database, query: string): Promise<UserSearchResult[]> {
  const result = await db
    .prepare("SELECT id, username, avatar_url FROM users WHERE username LIKE ? ESCAPE '\\' ORDER BY username LIMIT 20")
    .bind(likePattern(query))
    .all<UserSearchResult>();
  return result.results;
}

type DockRow = {
  slug: string;
  name: string;
  dock_type: string;
  country: string | null;
  settlement: string | null;
};

// Searches both sources of truth for docks: the hardcoded data.ts entries
// and published user submissions in D1 — the same split every other
// dock-listing feature (favorites, liveDocks) already has to handle.
export async function searchDocks(db: D1Database | undefined, query: string): Promise<DockRow[]> {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const staticMatches: DockRow[] = docks
    .filter(
      (d: Dock) =>
        d.name.toLowerCase().includes(needle) ||
        d.settlement.toLowerCase().includes(needle) ||
        d.country.toLowerCase().includes(needle),
    )
    .map((d) => ({ slug: d.slug, name: d.name, dock_type: d.dockType, country: d.country, settlement: d.settlement }));

  if (!db) return staticMatches;

  const result = await db
    .prepare(
      `SELECT slug, name, dock_type, country, settlement FROM docks
       WHERE source = 'user_submission' AND review_status = 'published'
       AND (name LIKE ? ESCAPE '\\' OR settlement LIKE ? ESCAPE '\\' OR country LIKE ? ESCAPE '\\')
       LIMIT 20`,
    )
    .bind(likePattern(query), likePattern(query), likePattern(query))
    .all<DockRow>();

  const seen = new Set(staticMatches.map((d) => d.slug));
  return [...staticMatches, ...result.results.filter((d) => !seen.has(d.slug))];
}

export type LocationSearchResult = { kind: "continent" | "country" | "city"; label: string; sublabel: string; href: string };

// Pure in-memory search over the illustrative browse hierarchy (continents,
// countries, cities) — no DB round trip needed, unlike users/docks. These
// pages are deliberately left out of sitemap.xml (thin/no real dock content
// yet), but they're still real, navigable pages worth surfacing in search.
export function searchLocations(query: string): LocationSearchResult[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const results: LocationSearchResult[] = [];

  for (const ct of continents) {
    if (ct.name.toLowerCase().includes(needle)) {
      results.push({ kind: "continent", label: ct.name, sublabel: "Continent", href: `/continents/${ct.slug}` });
    }
  }

  for (const names of Object.values(countriesByContinent)) {
    for (const name of names) {
      if (name.toLowerCase().includes(needle)) {
        results.push({ kind: "country", label: name, sublabel: "Country", href: `/countries/${slugify(name)}` });
      }
    }
  }

  for (const [country, cities] of Object.entries(citiesByCountry)) {
    for (const city of cities) {
      if (city.name.toLowerCase().includes(needle)) {
        results.push({ kind: "city", label: city.name, sublabel: country, href: `/cities/${slugify(city.name)}` });
      }
    }
  }

  return results.slice(0, 20);
}

function likePattern(raw: string): string {
  const escaped = raw.trim().replace(/[\\%_]/g, (ch) => `\\${ch}`);
  return `%${escaped}%`;
}
