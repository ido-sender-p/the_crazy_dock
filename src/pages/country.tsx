import { Layout } from "../layout";
import { raw } from "hono/html";
import { seaColor, waveUrl, type Water } from "../waveCard";
import { slugify, type Dock } from "../data";
import { CardThumb, placeLabel, FAMILY_ORDER, LakeIcon } from "./shared";

const PAGE_CSS = `
  .country-page { padding: 40px 0 80px; }
  .country-page h1 { font-size: 2.2rem; margin-top: 6px; }
  .country-page .sea-head {
    display: flex; align-items: center; gap: 8px;
    color: var(--ink); font-weight: 600; font-size: 0.9rem;
    margin-top: 32px; padding-bottom: 8px; border-bottom: 1px solid var(--border);
  }
  .country-page .sea-head.first { margin-top: 24px; }
  .country-page .sea-head i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex: none; }
  .country-page .sea-head .count { color: var(--ink-soft); font-weight: 400; }

  .card-grid {
    display: grid; gap: 18px 14px; margin: 18px 0 0;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  }
  .wave-card {
    position: relative;
    display: flex; align-items: center; justify-content: center; text-align: center;
    background: var(--surface); border: 1px solid var(--border); border-bottom: none;
    border-radius: 10px 10px 0 0;
    padding: 16px 16px 20px; color: var(--ink); text-decoration: none;
    transition: transform 0.15s ease, filter 0.15s ease;
  }
  a.wave-card:hover { transform: translateY(-2px); filter: brightness(1.02); }
  .wave-card .name { font-weight: 600; font-size: 0.9rem; }
  .wave-card .wave {
    position: absolute; left: -1px; right: -1px; bottom: -11px; height: 14px;
    background-repeat: repeat-x; background-size: 40px 14px;
  }

  .lake-card {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
    text-align: center; background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    padding: 14px 16px 12px; color: var(--ink); text-decoration: none;
    transition: transform 0.15s ease, filter 0.15s ease;
  }
  a.lake-card:hover { transform: translateY(-2px); filter: brightness(1.02); }
  .lake-card svg { width: 42px; height: auto; }
  .lake-card .name { font-weight: 600; font-size: 0.9rem; }

  .country-page .empty { margin-top: 28px; padding: 28px; font-size: 1rem; }
  .country-page .list { margin-top: 18px; }
`;

type Entry = { name: string; sea: string; family: Water };

function EntryGroup({ kicker, entries, linkBase }: { kicker: string; entries: Entry[]; linkBase: string }) {
  if (entries.length === 0) return null;
  const bySea = new Map<string, { family: Water; items: Entry[] }>();
  for (const e of entries) {
    if (!bySea.has(e.sea)) bySea.set(e.sea, { family: e.family, items: [] });
    bySea.get(e.sea)!.items.push(e);
  }
  const groups = [...bySea.entries()]
    .map(([sea, { family, items }]) => ({ sea, family, items }))
    .sort((a, b) => FAMILY_ORDER.indexOf(a.family) - FAMILY_ORDER.indexOf(b.family) || a.sea.localeCompare(b.sea));

  return (
    <>
      {groups.map(({ sea, family, items }, gi) => (
        <>
          <div class={gi === 0 ? "sea-head first" : "sea-head"}>
            <i style={`background:${seaColor(sea)}`} aria-hidden="true" />
            {kicker} · {sea} <span class="count">· {items.length}</span>
          </div>
          <div class="card-grid">
            {items.map((e) =>
              family === "lake" ? (
                <a class="lake-card" href={`${linkBase}/${slugify(e.name)}`}>
                  <LakeIcon />
                  <span class="name">{e.name}</span>
                </a>
              ) : (
                <a class="wave-card" href={`${linkBase}/${slugify(e.name)}`}>
                  <span class="name">{e.name}</span>
                  <span class="wave" style={`background-image:${waveUrl(seaColor(e.sea))}`} />
                </a>
              ),
            )}
          </div>
        </>
      ))}
    </>
  );
}

export function CountryPage(opts: {
  name: string;
  continentName: string;
  continentSlug: string;
  cities: Entry[];
  states?: Entry[];
  matches?: Dock[];
  path: string;
}) {
  return (
    <Layout title={`${opts.name}: Docks & Cities | Wildock`} description={`Docks, piers and marinas documented in ${opts.name}.`} path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap country-page">
        <nav class="breadcrumb">
          <a href="/">Wildock</a> / <a href={`/continents/${opts.continentSlug}`}>{opts.continentName}</a> / {opts.name}
        </nav>
        <h1>{opts.name}</h1>

        {opts.states && opts.states.length > 0 ? (
          <EntryGroup kicker="States" entries={opts.states} linkBase="/regions" />
        ) : opts.cities.length > 0 ? (
          <EntryGroup kicker="Cities" entries={opts.cities} linkBase="/cities" />
        ) : (
          <div class="empty">No cities documented here yet. The catalogue is growing daily.</div>
        )}

        {opts.matches && opts.matches.length > 0 && (
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
