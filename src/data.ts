// Hardcoded pilot data , stands in for D1 until the Overpass pipeline is wired up.
//
// Geographic breakdown (matches how the pSEO URL/category structure is organized):
//   Continent -> Country -> State/Province -> Settlement (City | Town | Village) -> Dock
// Not every level always has its own page yet, but every dock carries the full chain
// so breadcrumbs and future category pages don't need a data migration to appear.

export type SettlementType = "city" | "town" | "village";

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

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

export type Dock = {
  slug: string;
  name: string;
  dockType: "pier" | "marina" | "floating_dock" | "industrial";

  continent: string;
  continentSlug: string;

  country: string;
  countryCode: string; // "gr" | "hr" | "it" for the legacy demo entries; "" for D1-backed submissions, which route by country-name slug instead

  stateProvince: string; // state/province/autonomous region , the tier below country
  stateProvinceSlug: string;

  settlement: string; // city, town or village , the tier below state/province
  settlementType: SettlementType;
  settlementSlug: string;

  lat: number;
  lon: number;
  description: string;
  imageUrl: string;
  imageAttribution: string;
  // Drives which dock-page layout renders: a phone-shot portrait photo gets
  // the side-by-side "featured card" treatment (photo next to the story),
  // a landscape one gets the photo-above-text layout. Unknown/undetected
  // falls back to landscape.
  imageOrientation: "portrait" | "landscape";
  lengthM: number;
  yearBuilt: number | null;
};

export const docks: Dock[] = [
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
    lengthM: 80,
    yearBuilt: null,
  },
];

export const dockTypes: { slug: Dock["dockType"]; label: string; blurb: string; emoji: string }[] = [
  { slug: "marina", label: "Marinas", blurb: "Berths, breakwaters & yacht harbours", emoji: "⛵" },
  { slug: "pier", label: "Piers", blurb: "Historic & recreational piers", emoji: "🌉" },
  { slug: "floating_dock", label: "Floating Docks", blurb: "Modular & pontoon structures", emoji: "🟦" },
  { slug: "industrial", label: "Industrial Docks", blurb: "Loading docks & cargo berths", emoji: "🏗️" },
];

export const countries: { code: Dock["countryCode"]; name: string }[] = [
  { code: "gr", name: "Greece" },
  { code: "hr", name: "Croatia" },
  { code: "it", name: "Italy" },
];

export const continents: { slug: string; name: string }[] = [
  { slug: "europe", name: "Europe" },
  { slug: "asia", name: "Asia" },
  { slug: "africa", name: "Africa" },
  { slug: "north-america", name: "North America" },
  { slug: "south-america", name: "South America" },
  { slug: "oceania", name: "Oceania" },
];

export function dockCountForType(type: Dock["dockType"]) {
  return docks.filter((d) => d.dockType === type).length;
}
