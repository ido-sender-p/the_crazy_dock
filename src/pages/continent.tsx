import { Layout } from "../layout";
import type { Dock } from "../data";
import { countriesByContinent, oceanByCountry } from "../continents";
import { slugify } from "../data";
import { seaColor, waveUrl, type Water } from "../waveCard";
import { CardThumb, placeLabel, FAMILY_ORDER, LakeIcon } from "./shared";

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
    <Layout page="continent" title={`Countries in ${opts.name} | Wildock`} description={opts.intro} path={opts.path}>
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
