import type { Dock } from "../data";
import type { Water } from "../styles/sea";

// URL segment of each kind of settlement page: /cities/:slug, /towns/:slug, /villages/:slug.
export const SETTLEMENT_PATH: Record<Dock["settlementType"], string> = {
  city: "cities",
  town: "towns",
  village: "villages",
};

export const SETTLEMENT_ROUTE_PATHS = (Object.entries(SETTLEMENT_PATH) as [Dock["settlementType"], string][]).map(
  ([type, path]) => ({ path, type }),
);

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

// Fixed family display order so sections line up the same way on every
// continent and country page.
export const FAMILY_ORDER: Water[] = [
  "atlantic",
  "pacific",
  "indian",
  "mediterranean",
  "caspian",
  "melanesia",
  "micronesia",
  "polynesia",
  "australasia",
  "lake",
];

// "Settlement, Country" skipping tiers the catalogue has no value for.
export function placeLabel(...parts: (string | null | undefined)[]) {
  return parts.filter(Boolean).join(", ");
}
