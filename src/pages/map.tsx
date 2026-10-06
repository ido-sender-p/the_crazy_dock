import { Layout } from "../layout";
import { docks } from "../data";
import { raw } from "hono/html";
import { LeafletCss, LeafletMap } from "./leaflet";

const PAGE_CSS = `
  .map-page { padding: clamp(2.5rem, 6vw, 4.5rem) 0 clamp(4rem, 9vw, 7rem); }
  .map-page h1, .map-page p.intro { text-align: center; }
  .map-page p.intro { margin-inline: auto; }

  .map-page p.intro { color: var(--ink-soft); max-width: 40rem; }
  .map-canvas {
    margin: 32px 0;
    border-radius: 20px;
    border: 1px solid var(--border);
    overflow: hidden;
  }
  #wildock-map { height: 460px; width: 100%; background: #0b2545; }
  .list-title { font-size: 1.2rem; margin: 8px 0 0; }
  .pin-list { columns: 240px; column-gap: 20px; margin-top: 12px; padding: 0; list-style: none; font-size: 0.88rem; }
  .pin-list li { break-inside: avoid; padding: 4px 0; }
  .pin-list a { color: var(--ink); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
  .pin-list a:hover { color: var(--accent-text); text-decoration: underline; }
  .pin-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-dark); flex-shrink: 0; }
  .pin-list .coords { font-size: 0.75rem; color: var(--ink-soft); }
`;

export function MapPage() {
  return (
    <Layout
      title="Map | Wildock"
      description="Every documented dock, pier and marina plotted on an interactive map."
      path="/map"
    >
      <style>{raw(PAGE_CSS)}</style>
      <LeafletCss />
      <div class="wrap map-page">
        <nav class="breadcrumb">
          <a href="/">Wildock</a> / Map
        </nav>
        <h1>Every dock, on the map</h1>
        <p class="intro">
          Every documented location, pinned on a real, zoomable map. Click a pin to open its page.
        </p>

        <div class="map-canvas">
          <div id="wildock-map" role="region" aria-label="Map of all docks" />
        </div>
        <LeafletMap elementId="wildock-map" radius={7} />

        <h2 class="list-title">All docks</h2>
        <ul class="pin-list">
          {docks.map((d) => (
            <li>
              <a href={`/docks/${d.slug}`}>
                <span class="pin-dot" aria-hidden="true" />
                <span>
                  {d.name} <span class="coords">{[d.settlement, d.country].filter(Boolean).join(", ")}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
