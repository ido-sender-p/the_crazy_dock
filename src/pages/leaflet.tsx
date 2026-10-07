import { raw } from "hono/html";
import { docks } from "../data";
import { safeJsonForScript } from "../lib/html";

// Short keys keep the inlined payload small with hundreds of docks:
// n name, s slug, a lat, o lon, t type, f 1 for the hand-written entries that set the opening view.
const MARKERS = docks.map((d) => ({
  n: d.name,
  s: d.slug,
  a: Math.round(d.lat * 1e4) / 1e4,
  o: Math.round(d.lon * 1e4) / 1e4,
  t: d.dockType,
  f: d.countryCode ? 1 : 0,
}));

export function LeafletCss() {
  return (
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin=""
    />
  );
}

// Leaflet itself plus the markers as a JSON data block. The init lives in client/map.ts and finds the
// map container by [data-leaflet] (with data-radius and data-zoom-control), so no inline JS is needed.
export function LeafletMap() {
  return (
    <>
      <script type="application/json" id="map-data">{raw(safeJsonForScript(MARKERS))}</script>
      <script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""
      ></script>
    </>
  );
}
