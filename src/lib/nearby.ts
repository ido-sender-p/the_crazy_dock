// What is around a dock, counted from OpenStreetMap by scripts/enrich-nearby.mjs
// (places within about 1 km; beaches and stations within 1.5 km; malls and ferry terminals within 2.5 km).

export type Nearby = {
  eat: number; // restaurants, cafes, bars, pubs, fast food, ice cream
  stay: number; // hotels, hostels, guest houses, apartments
  shops: number;
  sights: number; // attractions, museums, galleries, viewpoints
  historic: number;
  beaches: number;
  stations: number;
  ferries: number;
  capped: boolean; // the count hit the query limit, so show "N+"
  malls: string[];
  landmarks: string[];
};

// A one-line feel for the neighbourhood, from a weighted score of visitor-facing places.
export function vibe(n: Nearby, dockType: string): { label: string; blurb: string } {
  const score = n.eat + n.stay * 2 + n.sights * 3 + n.shops / 2 + n.historic + (n.beaches ? 10 : 0);
  if (score >= 250) return { label: "Busy waterfront destination", blurb: "Plenty to eat, see and buy within a short walk." };
  if (score >= 90) return { label: "Lively and walkable", blurb: "Restaurants, shops and sights are all close by." };
  if (score >= 25) return { label: "Relaxed, with the essentials nearby", blurb: "A handful of places to eat and shop within walking distance." };
  if (score >= 6) return { label: "Quiet, a few places nearby", blurb: "Not much around, so plan ahead." };
  return dockType === "industrial"
    ? { label: "Working port", blurb: "Mostly cargo and industry, with few visitor amenities close by." }
    : { label: "Remote and quiet", blurb: "Very little around the dock itself." };
}

export function count(n: number, capped: boolean) {
  return capped && n >= 100 ? `${n}+` : String(n);
}
