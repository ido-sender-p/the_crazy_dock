import { Layout } from "../layout";
import type { Dock } from "../data";
import { raw } from "hono/html";
import { countriesByContinent, oceanByCountry } from "../continents";
import { slugify } from "../data";
import { seaColor, waveUrl, type Water } from "../waveCard";
import { CardThumb, placeLabel, FAMILY_ORDER, LakeIcon } from "./shared";

const PAGE_CSS = `
  .continent-page { padding: 40px 0 80px; }
  .continent-page h1 { font-size: 2.2rem; margin-top: 6px; }

  .continent-page .sea-head {
    display: flex; align-items: center; gap: 8px;
    color: var(--ink); font-weight: 600; font-size: 0.9rem;
    margin-top: 36px; padding-bottom: 8px; border-bottom: 1px solid var(--border);
  }
  .continent-page .sea-head.first { margin-top: 28px; }
  .continent-page .sea-head i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex: none; }
  .continent-page .sea-head .count { color: var(--ink-soft); font-weight: 400; }

  .country-grid {
    display: grid; gap: 18px 14px; margin: 18px 0 0;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  }
  .country-card {
    position: relative;
    display: flex; align-items: center; justify-content: center; text-align: center;
    background: var(--surface); border: 1px solid var(--border); border-bottom: none;
    border-radius: 10px 10px 0 0;
    padding: 16px 16px 20px; color: var(--ink); text-decoration: none;
    transition: transform 0.15s ease, filter 0.15s ease;
  }
  .country-card:hover { transform: translateY(-2px); filter: brightness(1.02); }
  .country-card .name { font-weight: 600; font-size: 0.9rem; }
  .country-card .wave {
    position: absolute; bottom: -11px; height: 14px;
    background-repeat: repeat-x; background-size: 40px 14px;
  }

  .country-card.lake { border-bottom: 1px solid var(--border); border-radius: 12px; padding-bottom: 14px; }
  .country-card.lake svg { width: 38px; height: auto; margin-bottom: 8px; }

`;

function Wave({ seas }: { seas: string[] }) {
  const n = seas.length;
  return (
    <>
      {seas.map((sea, i) => (
        <span
          class="wave"
          style={`left:${(i / n) * 100}%; width:${100 / n}%; background-image:${waveUrl(seaColor(sea))};`}
        />
      ))}
    </>
  );
}

export function ContinentPage(opts: { name: string; slug: string; intro: string; path: string; matches: Dock[] }) {
  const countries = countriesByContinent[opts.slug] ?? [];

  const bySea = new Map<string, { family: Water; names: string[] }>();
  for (const name of countries) {
    const entries = oceanByCountry[name] ?? [];
    const primary = entries[0];
    if (!primary) continue;
    if (!bySea.has(primary.sea)) bySea.set(primary.sea, { family: primary.family, names: [] });
    bySea.get(primary.sea)!.names.push(name);
  }
  const groups = [...bySea.entries()]
    .map(([sea, { family, names }]) => ({ sea, family, names }))
    .sort((a, b) => FAMILY_ORDER.indexOf(a.family) - FAMILY_ORDER.indexOf(b.family) || a.sea.localeCompare(b.sea));

  return (
    <Layout title={`Countries in ${opts.name} | Wildock`} description={opts.intro} path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap continent-page">
        <nav class="breadcrumb">
          <a href="/">Wildock</a> / {opts.name}
        </nav>
        <h1>{opts.name}</h1>

        {groups.map(({ sea, family, names }, gi) => (
          <>
            <div class={gi === 0 ? "sea-head first" : "sea-head"}>
              <i style={`background:${seaColor(sea)}`} aria-hidden="true" />
              {sea} <span class="count">· {names.length}</span>
            </div>
            <div class="country-grid">
              {names.map((name) => {
                const seas = (oceanByCountry[name] ?? []).map((e) => e.sea);
                return family === "lake" ? (
                  <a class="country-card lake" href={`/countries/${slugify(name)}`}>
                    <LakeIcon />
                    <span class="name">{name}</span>
                  </a>
                ) : (
                  <a class="country-card" href={`/countries/${slugify(name)}`}>
                    <span class="name">{name}</span>
                    <Wave seas={seas} />
                  </a>
                );
              })}
            </div>
          </>
        ))}

        {opts.matches.length > 0 && (
          <div class="list">
            {opts.matches.map((d) => (
              <a href={`/docks/${d.slug}`}>
                <CardThumb src={d.imageUrl} />
                <div class="copy">
                  <h3>{d.name}</h3>
                  <p>{placeLabel(d.settlement, d.country)}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
