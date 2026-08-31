import { Layout } from "../layout";
import { docks } from "../data";
import { raw } from "hono/html";
import { safeJsonForScript } from "../lib/html";

const PAGE_CSS = `
  .map-page { padding: 48px 0 80px; }
  .map-page h1 { font-size: 2rem; }
  .map-page p.intro { color: var(--ink-soft); max-width: 620px; }
  .map-canvas {
    margin: 32px 0;
    border-radius: 20px;
    border: 1px solid var(--border);
    overflow: hidden;
  }
  #wildock-map { height: 460px; width: 100%; background: #0b2545; }
  .pin-list { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); margin-top: 12px; }
  .pin-list a {
    display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--ink);
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;
  }
  .pin-list a:hover { border-color: var(--accent); }
  .pin-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent-dark); flex-shrink: 0; }
  .pin-list .coords { font-size: 0.75rem; color: var(--ink-soft); }
`;

const MAP_MARKERS = docks.map((d) => ({ name: d.name, slug: d.slug, lat: d.lat, lon: d.lon }));

const MAP_INIT_JS = `
  var docks = ${safeJsonForScript(MAP_MARKERS)};
  var escapeHtml = function (s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  };
  var map = L.map('wildock-map', { scrollWheelZoom: false }).setView([20, 10], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);
  docks.forEach(function (d) {
    // Dock names can come from user submissions once approved, so this must
    // stay HTML-escaped — bindPopup renders its argument as raw HTML.
    L.circleMarker([d.lat, d.lon], { radius: 7, color: '#0b2545', weight: 1.5, fillColor: '#2ec4b6', fillOpacity: 0.9 })
      .addTo(map)
      .bindPopup('<strong>' + escapeHtml(d.name) + '</strong><br><a href="/docks/' + encodeURIComponent(d.slug) + '">View dock</a>');
  });
  if (docks.length) {
    var bounds = L.latLngBounds(docks.map(function (d) { return [d.lat, d.lon]; }));
    map.fitBounds(bounds.pad(0.5), { maxZoom: 6 });
  }
`;

export function MapPage() {
  return (
    <Layout
      title="Map | Wildock"
      description="Every documented dock, pier and marina plotted on an interactive map."
      path="/map"
    >
      <style>{raw(PAGE_CSS)}</style>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""
      />
      <div class="wrap map-page">
        <nav class="breadcrumb">
          <a href="/">Wildock</a> / Map
        </nav>
        <h1>Every dock, on the map</h1>
        <p class="intro">
          Every documented location, pinned on a real, zoomable map. Click a pin to open its page.
        </p>

        <div class="map-canvas">
          <div id="wildock-map" />
        </div>
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossorigin=""
        ></script>
        <script>{raw(MAP_INIT_JS)}</script>

        <div class="pin-list">
          {docks.map((d) => (
            <a href={`/docks/${d.slug}`}>
              <span class="pin-dot" />
              <span>
                <strong>{d.name}</strong>
                <br />
                <span class="coords">{d.settlement}, {d.country} · {d.lat.toFixed(3)}, {d.lon.toFixed(3)}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}
