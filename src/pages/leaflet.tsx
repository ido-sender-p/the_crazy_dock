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

// Loads Leaflet, then runs the shared marker init against the given element.
export function LeafletMap(opts: { elementId: string; radius: number; zoomControl?: boolean }) {
  const init = `
    (function () {
      var docks = ${safeJsonForScript(MARKERS)};
      var escapeHtml = function (s) {
        return String(s).replace(/[&<>"']/g, function (ch) {
          return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
        });
      };
      var map = L.map(${safeJsonForScript(opts.elementId)}, { scrollWheelZoom: false, zoomControl: ${opts.zoomControl === false ? "false" : "true"} }).setView([20, 10], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);
      docks.forEach(function (d) {
        // Dock names can come from user submissions once approved, so this must
        // stay HTML-escaped: bindPopup renders its argument as raw HTML.
        L.circleMarker([d.a, d.o], { radius: ${opts.radius}, color: '#0b2545', weight: 1.5, fillColor: '#2ec4b6', fillOpacity: 0.9 })
          .addTo(map)
          .bindPopup('<strong>' + escapeHtml(d.n) + '</strong><br>' + escapeHtml(String(d.t).replace(/_/g, ' ')) + '<br><a href="/docks/' + encodeURIComponent(d.s) + '">View dock</a>');
      });
      // Open zoomed in on the hand-written entries (Capri), not on the whole world map the
      // full catalogue would give; every dock is still on the map to pan to.
      var focus = docks.filter(function (d) { return d.f; });
      if (!focus.length) focus = docks;
      if (focus.length) {
        var bounds = L.latLngBounds(focus.map(function (d) { return [d.a, d.o]; }));
        map.fitBounds(bounds.pad(0.5), { maxZoom: 6 });
      }
    })();
  `;
  return (
    <>
      <script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""
      ></script>
      <script>{raw(init)}</script>
    </>
  );
}
