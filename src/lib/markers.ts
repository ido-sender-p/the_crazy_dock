import { docks } from "../data";

// Map markers with short keys, served as /assets/markers.<hash>.json and fetched by client/map.ts when the map
// scrolls into view (instead of riding along inside the HTML of every home and map page):
// n name, s slug, a lat, o lon, t type, f 1 for the hand-written entries that set the opening view.
export const markersJson = JSON.stringify(
  docks.map((d) => ({
    n: d.name,
    s: d.slug,
    a: Math.round(d.lat * 1e4) / 1e4,
    o: Math.round(d.lon * 1e4) / 1e4,
    t: d.dockType,
    f: d.countryCode ? 1 : 0,
  })),
);
