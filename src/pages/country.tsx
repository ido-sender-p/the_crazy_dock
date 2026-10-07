import { Layout } from "../layout";
import { seaClass, type Water } from "../waveCard";
import { slugify, type Dock } from "../data";
import { CardThumb, placeLabel, FAMILY_ORDER, LakeIcon } from "./shared";

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
            <i class={`sea-dot ${seaClass(sea)}`} aria-hidden="true" />
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
                  <span class={`wave ${seaClass(e.sea)}`} />
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
    <Layout page="country" title={`${opts.name}: Docks & Cities | Wildock`} description={`Docks, piers and marinas documented in ${opts.name}.`} path={opts.path}>
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
