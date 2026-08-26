import { Layout } from "../layout";
import { docks } from "../data";
import { raw } from "hono/html";

const PAGE_CSS = `
  .map-page { padding: 48px 0 80px; }
  .map-page h1 { font-size: 2rem; }
  .map-page p.intro { color: var(--ink-soft); max-width: 620px; }
  .map-canvas {
    margin: 32px 0;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: radial-gradient(120% 160% at 20% 0%, #123a63 0%, #0b2545 55%, #082038 100%);
    padding: 32px;
    position: relative;
    overflow: hidden;
  }
  .map-canvas svg { width: 100%; height: auto; display: block; }
  .map-badge {
    display: inline-block; margin-top: 16px; padding: 4px 12px; border-radius: 999px;
    background: rgba(255,255,255,0.12); color: #cfe0ee; font-size: 0.75rem; font-weight: 600;
  }
  .pin-list { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); margin-top: 12px; }
  .pin-list a {
    display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--ink);
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;
  }
  .pin-list a:hover { border-color: var(--accent); }
  .pin-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent-dark); flex-shrink: 0; }
  .pin-list .coords { font-size: 0.75rem; color: var(--ink-soft); }
`;

export function MapPage() {
  return (
    <Layout
      title="Map — Wildock"
      description="Every documented dock, pier and marina plotted by coordinates."
      path="/map"
    >
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap map-page">
        <nav class="breadcrumb">
          <a href="/">Wildock</a> / Map
        </nav>
        <h1>Every dock, on the map</h1>
        <p class="intro">
          A visual first look at where the catalogue reaches today. A fully interactive, zoomable map
          is on the roadmap — for now, every documented location is pinned below.
        </p>

        <div class="map-canvas">
          <svg viewBox="0 0 800 320" xmlns="http://www.w3.org/2000/svg">
            <g fill="#7fa8cf" opacity="0.35">
              {Array.from({ length: 20 }).map((_, row) =>
                Array.from({ length: 50 }).map((_, col) =>
                  (row + col) % 3 !== 0 ? <circle cx={col * 16 + 8} cy={row * 16 + 8} r="1.4" /> : null,
                ),
              )}
            </g>
            {docks.map((d) => {
              const x = ((d.lon + 180) / 360) * 800;
              const y = ((90 - d.lat) / 180) * 320;
              return (
                <g>
                  <circle cx={x} cy={y} r="9" fill="#2ec4b6" opacity="0.25" />
                  <circle cx={x} cy={y} r="4" fill="#7fe7dc" stroke="#0b2545" stroke-width="1.5" />
                </g>
              );
            })}
          </svg>
          <span class="map-badge">Interactive map coming soon</span>
        </div>

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
