import { countriesByContinent, citiesByCountry } from "../continents";
import { continents } from "../data";

// A submission can only auto-publish into the continent -> country -> city
// browse hierarchy if that country and city already exist there (the same
// hierarchy /continents and /countries pages render from). If not, the
// approval blocks instead of silently publishing into a dead end.
export type RouteCheck =
  | { ok: true; continent: string; continentSlug: string; country: string; settlement: string }
  | { ok: false; reason: string };

export function checkSubmissionRoute(country: string, settlement: string): RouteCheck {
  let continentSlug: string | undefined;
  let canonicalCountry: string | undefined;
  for (const [slug, names] of Object.entries(countriesByContinent)) {
    const match = names.find((n) => n.toLowerCase() === country.trim().toLowerCase());
    if (match) {
      continentSlug = slug;
      canonicalCountry = match;
      break;
    }
  }
  if (!continentSlug || !canonicalCountry) {
    return { ok: false, reason: `Country "${country}" isn't in the continent browse hierarchy yet.` };
  }

  const cities = citiesByCountry[canonicalCountry] ?? [];
  const cityMatch = cities.find((c) => c.name.toLowerCase() === settlement.trim().toLowerCase());
  if (!cityMatch) {
    return { ok: false, reason: `City "${settlement}" isn't listed under ${canonicalCountry} in the browse hierarchy yet.` };
  }

  const continent = continents.find((ct) => ct.slug === continentSlug);
  return {
    ok: true,
    continent: continent?.name ?? continentSlug,
    continentSlug,
    country: canonicalCountry,
    settlement: cityMatch.name,
  };
}
