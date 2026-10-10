// Static dock catalogue: a few hand-written entries plus the generated one in catalogue.json.
//
// Geographic breakdown (matches how the pSEO URL/category structure is organized):
//   Continent -> Country -> State/Province -> Settlement (City | Town | Village) -> Dock
// Not every level always has its own page yet, but every dock carries the full chain
// so breadcrumbs and future category pages don't need a data migration to appear.

export type SettlementType = "city" | "town" | "village";


// Listing pages merge the hardcoded `docks` array with live D1 rows, and a
// dock can legitimately exist in both (e.g. seeded into D1 so it shows on a
// user's own profile, while also living in the static catalogue), so dedupe
// by slug so it never renders twice on the same page. First occurrence wins.
export function dedupeDocksBySlug<T extends { slug: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

// Who supplied a dock's main photo: 1 a visitor (uploaded through the site), 2 the owner (everything in the catalogue and the
// hand-written entries; kept even if a photo is later removed or replaced), 3 the owner too, but the photo shows the water
// near the dock and not the dock itself. Shown on the dock page and recorded in the catalogue as `pk`.
export type PhotoKind = 1 | 2 | 3;

export type Dock = {
  slug: string;
  name: string;
  dockType: "pier" | "marina" | "floating_dock" | "industrial";

  continent: string;
  continentSlug: string;

  country: string;
  countryCode: string; // "it" for the legacy demo entry; "" for D1-backed submissions, which route by country-name slug instead

  stateProvince: string; // state/province/autonomous region, the tier below country
  stateProvinceSlug: string;

  settlement: string; // city, town or village, the tier below state/province
  settlementType: SettlementType;
  settlementSlug: string;

  lat: number;
  lon: number;
  description: string;
  imageUrl: string;
  imageAttribution: string;
  descriptionSource?: string; // "Name|url", shown as a credit under the description
  // Drives which dock-page layout renders: a phone-shot portrait photo gets
  // the side-by-side "featured card" treatment (photo next to the story),
  // a landscape one gets the photo-above-text layout. Unknown/undetected
  // falls back to landscape.
  imageOrientation: "portrait" | "landscape";
  lengthM: number;
  yearBuilt: number | null;
  website?: string; // official site, from OpenStreetMap (http or https only)
  photoKind?: PhotoKind;
  imageTransform?: boolean; // photo is one original in R2; card sizes come from Cloudflare Images (see lib/imageVariants.ts)
  nearby?: Nearby; // places around the dock, from OpenStreetMap; absent for hand-written entries
  aboutExtras?: string; // extra verified facts for the About section (OpenStreetMap tags, length, year)
  placeBlurb?: { text: string; title: string }; // first sentences of the settlement's Wikipedia article (CC BY-SA)
};

import catalogue from "./catalogue.json";
import type { Nearby } from "./lib/nearby";
import { slugify } from "./lib/slug";

const legacyDocks: Dock[] = [
  {
    slug: "marina-piccola-capri",
    name: "Marina Piccola",
    dockType: "marina",
    continent: "Europe",
    continentSlug: "europe",
    country: "Italy",
    countryCode: "it",
    stateProvince: "Campania",
    stateProvinceSlug: "campania",
    settlement: "Capri",
    settlementType: "town",
    settlementSlug: "capri",
    lat: 40.5457,
    lon: 14.2264,
    description:
      "Marina Piccola is the small bay on Capri's southern shore, tucked beneath the cliffs where the Faraglioni sea stacks rise straight out of the water just offshore. I walked it alone on November 4, 2025, the harbour packed with tourists chasing the same view. My partner was a country away that day, so I kept weaving through the crowd until I found one quiet corner between the boats, sat down, and called her. We talked for a long time, her voice carrying across the distance while the sea stacks just sat there, unbothered, like they'd seen this before.",
    imageUrl: "/uploads/marina-piccola-capri-cover",
    imageAttribution: "Photo by Ido Sender",
    imageOrientation: "portrait",
    photoKind: 2,
    lengthM: 80,
    yearBuilt: null,
  },
];

export const continents: { slug: string; name: string }[] = [
  { slug: "europe", name: "Europe" },
  { slug: "asia", name: "Asia" },
  { slug: "africa", name: "Africa" },
  { slug: "north-america", name: "North America" },
  { slug: "south-america", name: "South America" },
  { slug: "oceania", name: "Oceania" },
];

// Compact catalogue row written by scripts/build-catalogue.mjs (which asserts the
// union-typed fields below). Derived fields are rebuilt in toDock().
type CatalogueRow = {
  slug: string;
  name: string;
  dockType: Dock["dockType"];
  continentSlug: string;
  country: string;
  stateProvince: string;
  settlement: string;
  lat: number;
  lon: number;
  description: string;
  wiki?: string; // Wikipedia article path (the description source)
  osm?: string; // OpenStreetMap element, e.g. "node/123" (the description source when there is no Wikipedia article)
  imageAttribution: string; // "Photo: ..., via Wikimedia Commons|File:Name.jpg"; "" when the dock has no photo yet
  imageOrientation: Dock["imageOrientation"];
  lengthM?: number;
  yearBuilt?: number;
  web?: string;
  pk?: number; // photo kind, see PhotoKind: 2 the owner's photo of the dock, 3 the owner's view of the water nearby
  tx?: number; // 1: photo has no pre-made sizes: card sizes come from Cloudflare Images
  nb?: [number, number, number, number, number, number, number, number, 0 | 1]; // eat, stay, shops, sights, historic, beaches, stations, ferries, capped
  ab?: string; // extra verified facts, see scripts/build-about.mjs
  pb?: string; // Wikipedia blurb about the settlement
  pt?: string; // title of that Wikipedia article
  ml?: string[]; // mall names
  lm?: string[]; // landmark names
};

// tsc checks the JSON's field names and primitive types against CatalogueRow; only the
// string-literal unions widen to string in JSON, hence the narrow cast (validated at build time).
type LooseRow = Omit<CatalogueRow, "dockType" | "imageOrientation" | "nb"> & { dockType: string; imageOrientation: string; nb?: number[] };
const rows: LooseRow[] = catalogue;

function toDock(r: CatalogueRow): Dock {
  return {
    slug: r.slug,
    name: r.name,
    dockType: r.dockType,
    continent: continents.find((c) => c.slug === r.continentSlug)?.name ?? "",
    continentSlug: r.continentSlug,
    country: r.country,
    countryCode: "",
    stateProvince: r.stateProvince,
    stateProvinceSlug: slugify(r.stateProvince),
    settlement: r.settlement,
    settlementType: "city",
    settlementSlug: slugify(r.settlement),
    lat: r.lat,
    lon: r.lon,
    description: r.description,
    imageUrl: r.imageAttribution ? `/uploads/dock-${r.slug}` : "",
    imageAttribution: r.imageAttribution.replace("|File:", "|https://commons.wikimedia.org/wiki/File:"),
    descriptionSource: r.wiki ? `Wikipedia|https://en.wikipedia.org/wiki/${r.wiki}` : `OpenStreetMap|https://www.openstreetmap.org/${r.osm}`,
    imageOrientation: r.imageOrientation,
    lengthM: r.lengthM ?? 0,
    yearBuilt: r.yearBuilt ?? null,
    website: r.web,
    aboutExtras: r.ab,
    placeBlurb: r.pb && r.pt ? { text: r.pb, title: r.pt } : undefined,
    photoKind: r.imageAttribution ? (r.pk === 3 ? 3 : 2) : undefined,
    imageTransform: r.tx === 1,
    nearby: r.nb && {
      eat: r.nb[0], stay: r.nb[1], shops: r.nb[2], sights: r.nb[3], historic: r.nb[4],
      beaches: r.nb[5], stations: r.nb[6], ferries: r.nb[7], capped: r.nb[8] === 1,
      malls: r.ml ?? [], landmarks: r.lm ?? [],
    },
  };
}

// Static catalogue built from Wikidata/Wikipedia/Commons by scripts/build-catalogue.mjs.
// Legacy entries come first so the homepage featured dock stays the same.
export const docks: Dock[] = [...legacyDocks, ...(rows as CatalogueRow[]).map(toDock)];

// Place pages are keyed by slug alone, so two places that share a name (Georgetown in Guyana and the Cayman Islands,
// Hamilton in Ontario and Bermuda) would merge into one page. The largest group keeps the plain slug; the others get
// their country (or, for settlements inside a state, the state) appended. Deterministic: same catalogue, same slugs.
function disambiguate(key: "settlementSlug" | "stateProvinceSlug", context: (d: Dock) => string) {
  const groups = new Map<string, Map<string, Dock[]>>();
  for (const d of docks) {
    const slug = d[key];
    if (!slug) continue;
    const ctx = context(d);
    const byCtx = groups.get(slug) ?? new Map<string, Dock[]>();
    byCtx.set(ctx, [...(byCtx.get(ctx) ?? []), d]);
    groups.set(slug, byCtx);
  }
  for (const [slug, byCtx] of groups) {
    if (byCtx.size < 2) continue;
    const ordered = [...byCtx.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
    for (const [ctx, list] of ordered.slice(1)) for (const d of list) d[key] = `${slug}-${slugify(ctx)}`;
  }
}
disambiguate("stateProvinceSlug", (d) => d.country);
disambiguate("settlementSlug", (d) => d.stateProvince ? `${d.country}/${d.stateProvince}` : d.country);

export const countries: { code: Dock["countryCode"]; name: string }[] = [{ code: "it", name: "Italy" }];
