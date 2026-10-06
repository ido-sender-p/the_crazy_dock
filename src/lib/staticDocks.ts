import { docks, type Dock } from "../data";

// Lookups over the static catalogue, built once at module load instead of
// filtering the whole array on every request.

function groupBy(key: (d: Dock) => string): Map<string, Dock[]> {
  const map = new Map<string, Dock[]>();
  for (const d of docks) {
    const k = key(d);
    if (!k) continue;
    const list = map.get(k);
    if (list) list.push(d);
    else map.set(k, [d]);
  }
  return map;
}

export const staticBySlug = new Map<string, Dock>(docks.map((d) => [d.slug, d]));
const byContinent = groupBy((d) => d.continentSlug);
const byCountryName = groupBy((d) => d.country);
const byCountryCode = groupBy((d) => d.countryCode);
const byRegion = groupBy((d) => d.stateProvinceSlug);
const bySettlement = groupBy((d) => d.settlementSlug);

const NONE: Dock[] = [];
export const staticInContinent = (slug: string) => byContinent.get(slug) ?? NONE;
export const staticInCountryName = (name: string) => byCountryName.get(name) ?? NONE;
export const staticInCountryCode = (code: string) => byCountryCode.get(code) ?? NONE;
export const staticInRegion = (slug: string) => byRegion.get(slug) ?? NONE;
export const staticInSettlement = (slug: string) => bySettlement.get(slug) ?? NONE;

// Slugs we generate from user submissions are plain lowercase kebab-case, so
// anything else can't be a live dock and never needs a D1 lookup.
export function looksLikeLiveSlug(slug: string): boolean {
  return slug.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
