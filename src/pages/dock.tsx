import { Layout } from "../layout";
import type { Dock } from "../data";
import { buildMailto } from "../lib/contact";
import { raw } from "hono/html";

const PAGE_CSS = `
  .dock-page { padding: 40px 0 80px; }
  .dock-page img.hero-img { width: 100%; max-height: 420px; object-fit: cover; border-radius: 14px; }
  .dock-page figcaption { font-size: 0.75rem; color: var(--ink-soft); margin-top: 6px; }
  .dock-page h1 { font-size: 2.1rem; margin-top: 4px; }
  .dock-page .meta { color: var(--ink-soft); margin-bottom: 24px; }
  .facts {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px; margin: 28px 0; padding: 20px; background: var(--surface);
    border: 1px solid var(--border); border-radius: 12px;
  }
  .facts dt { font-weight: 600; color: var(--ink-soft); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }
  .facts dd { margin: 4px 0 0; font-size: 1.05rem; }
  .dock-page p.desc { font-size: 1.05rem; max-width: 68ch; }
  .contribute {
    margin-top: 40px; padding: 24px; border: 1px dashed var(--border); border-radius: 14px;
    display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
  }
  .contribute h3 { margin: 0 0 4px; font-size: 1.1rem; }
  .contribute p { margin: 0; color: var(--ink-soft); font-size: 0.9rem; max-width: 46ch; }
`;

const settlementPathPrefix: Record<Dock["settlementType"], string> = {
  city: "cities",
  town: "towns",
  village: "villages",
};

export function DockPage(d: Dock) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: d.name,
    description: d.description,
    image: d.imageUrl,
    geo: { "@type": "GeoCoordinates", latitude: d.lat, longitude: d.lon },
    address: {
      "@type": "PostalAddress",
      addressLocality: d.settlement,
      addressRegion: d.stateProvince,
      addressCountry: d.country,
    },
  };

  const contributeMailto = buildMailto(
    `Photo for ${d.name} — Wildock`,
    `Hi Wildock team,\n\nI have a photo of ${d.name} (${d.settlement}, ${d.country}).\nPage: https://wildock.com/docks/${d.slug}\n\nPlease attach your photo to this email before sending.\n\nAnything worth knowing about the shot (when/where taken, story)?\n`,
  );

  return (
    <Layout
      title={`${d.name} — ${d.settlement}, ${d.country} | Wildock`}
      description={d.description.slice(0, 155)}
      jsonLd={jsonLd}
      path={`/docks/${d.slug}`}
    >
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap dock-page">
        <nav class="breadcrumb">
          <a href="/">Wildock</a> / <a href={`/continents/${d.continentSlug}`}>{d.continent}</a> /{" "}
          <a href={`/countries/${d.countryCode}`}>{d.country}</a> /{" "}
          <a href={`/regions/${d.stateProvinceSlug}`}>{d.stateProvince}</a> /{" "}
          <a href={`/${settlementPathPrefix[d.settlementType]}/${d.settlementSlug}`}>{d.settlement}</a> / {d.name}
        </nav>
        <h1>{d.name}</h1>
        <p class="meta">{d.settlement}, {d.stateProvince}, {d.country} · {d.dockType.replace("_", " ")}</p>
        <figure>
          <img class="hero-img" src={d.imageUrl} alt={d.name} />
          <figcaption>{d.imageAttribution}</figcaption>
        </figure>
        <p class="desc">{d.description}</p>
        <dl class="facts">
          <div><dt>Type</dt><dd>{d.dockType.replace("_", " ")}</dd></div>
          <div><dt>Length</dt><dd>{d.lengthM} m</dd></div>
          <div><dt>Built</dt><dd>{d.yearBuilt ?? "Unknown"}</dd></div>
          <div><dt>Coordinates</dt><dd>{d.lat.toFixed(4)}, {d.lon.toFixed(4)}</dd></div>
        </dl>
        <div class="contribute">
          <div>
            <h3>Got a better photo of {d.name}?</h3>
            <p>Photographers & sailors welcome — send us your shot and we'll add it here.</p>
          </div>
          <a class="btn-cta" href={contributeMailto}>Submit a photo</a>
        </div>
      </div>
    </Layout>
  );
}
