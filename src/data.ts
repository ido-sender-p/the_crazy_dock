// Hardcoded pilot data — stands in for D1 until the Overpass pipeline is wired up.
//
// Geographic breakdown (matches how the pSEO URL/category structure is organized):
//   Continent -> Country -> State/Province -> Settlement (City | Town | Village) -> Dock
// Not every level always has its own page yet, but every dock carries the full chain
// so breadcrumbs and future category pages don't need a data migration to appear.

export type SettlementType = "city" | "town" | "village";

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export type Dock = {
  slug: string;
  name: string;
  dockType: "pier" | "marina" | "floating_dock" | "industrial";

  continent: string;
  continentSlug: string;

  country: string;
  countryCode: "gr" | "hr" | "it";

  stateProvince: string; // state/province/autonomous region — the tier below country
  stateProvinceSlug: string;

  settlement: string; // city, town or village — the tier below state/province
  settlementType: SettlementType;
  settlementSlug: string;

  lat: number;
  lon: number;
  description: string;
  imageUrl: string;
  imageAttribution: string;
  lengthM: number;
  yearBuilt: number | null;
};

export const docks: Dock[] = [
  {
    slug: "old-venetian-harbour-pier-chania",
    name: "Old Venetian Harbour Pier",
    dockType: "pier",
    continent: "Europe",
    continentSlug: "europe",
    country: "Greece",
    countryCode: "gr",
    stateProvince: "Crete",
    stateProvinceSlug: "crete",
    settlement: "Chania",
    settlementType: "city",
    settlementSlug: "chania",
    lat: 35.5169,
    lon: 24.0186,
    description:
      "A stone pier guarding the entrance to Chania's Venetian harbour, built in the 14th century as part of the old fortifications. Today it's a popular sunset walk lined with the old lighthouse at its tip, with the harbour's cafes and boats visible along the curve of the quay.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Chania_old_harbour.jpg/800px-Chania_old_harbour.jpg",
    imageAttribution: "Wikimedia Commons (demo placeholder)",
    lengthM: 550,
    yearBuilt: 1320,
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

export function dockCountForCountry(code: Dock["countryCode"]) {
  return docks.filter((d) => d.countryCode === code).length;
}

export function dockCountForContinent(slug: string) {
  return docks.filter((d) => d.continentSlug === slug).length;
}

export function totalPhotoCount() {
  return docks.filter((d) => d.imageUrl).length;
}
