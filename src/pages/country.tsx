import { Layout } from "../layout";
import { raw } from "hono/html";
import { seaColor, waveUrl, type Water } from "../waveCard";

const PAGE_CSS = `
  .country-page { padding: 40px 0 80px; }
  .country-page h1 { font-size: 2.2rem; margin-top: 6px; }
  .country-page .kicker {
    display: flex; align-items: center; gap: 8px;
    color: var(--ink); font-weight: 600; font-size: 0.9rem;
    margin-top: 32px; padding-bottom: 8px; border-bottom: 1px solid var(--border);
  }
  .country-page .kicker:first-of-type { margin-top: 24px; }
  .country-page .kicker i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex: none; }
  .country-page .kicker .count { color: var(--ink-soft); font-weight: 400; }

  .card-grid {
    display: grid; gap: 18px 14px; margin: 18px 0 0;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  }
  .wave-card {
    position: relative;
    display: flex; align-items: center; justify-content: center; text-align: center;
    background: var(--surface); border: 1px solid var(--border); border-bottom: none;
    border-radius: 10px 10px 0 0;
    padding: 16px 16px 20px; color: var(--ink);
  }
  .wave-card .name { font-weight: 600; font-size: 0.9rem; }
  .wave-card .wave {
    position: absolute; left: -1px; right: -1px; bottom: -11px; height: 14px;
    background-repeat: repeat-x; background-size: 40px 14px;
  }

  .lake-card {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
    text-align: center; background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    padding: 14px 16px 12px; color: var(--ink);
  }
  .lake-card svg { width: 42px; height: auto; }
  .lake-card .name { font-weight: 600; font-size: 0.9rem; }

  .empty { margin-top: 28px; padding: 28px; border: 1px dashed var(--border); border-radius: 12px; color: var(--ink-soft); }
`;

type Entry = { name: string; sea: string; family: Water };

function LakeIcon() {
  return (
    <svg viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="19.5" rx="16" ry="4.5" fill="var(--accent)" fill-opacity="0.2" stroke="var(--accent-dark)" stroke-width="1.1" />
      <path
        d="M5,19.5 L13,6.5 L18,13.5 L25,3.5 L35,19.5"
        stroke="var(--ink)"
        stroke-width="1.3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

const FAMILY_ORDER: Water[] = [
  "atlantic",
  "pacific",
  "indian",
  "mediterranean",
  "caspian",
  "melanesia",
  "micronesia",
  "polynesia",
  "australasia",
  "lake",
];

function EntryGroup({ kicker, entries }: { kicker: string; entries: Entry[] }) {
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
      {groups.map(({ sea, family, items }) => (
        <>
          <div class="kicker">
            <i style={`background:${seaColor(sea)}`} />
            {kicker} — {sea} <span class="count">— {items.length}</span>
          </div>
          <div class="card-grid">
            {family === "lake"
              ? items.map((e) => (
                  <div class="lake-card">
                    <LakeIcon />
                    <span class="name">{e.name}</span>
                  </div>
                ))
              : items.map((e) => (
                  <div class="wave-card">
                    <span class="name">{e.name}</span>
                    <span class="wave" style={`background-image:${waveUrl(seaColor(e.sea))}`} />
                  </div>
                ))}
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
  path: string;
}) {
  return (
    <Layout title={`${opts.name} — Docks & Cities | Wildock`} description={`Docks, piers and marinas documented in ${opts.name}.`} path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap country-page">
        <nav class="breadcrumb">
          <a href="/">Wildock</a> / <a href={`/continents/${opts.continentSlug}`}>{opts.continentName}</a> / {opts.name}
        </nav>
        <h1>{opts.name}</h1>

        {opts.states && opts.states.length > 0 ? (
          <EntryGroup kicker="States" entries={opts.states} />
        ) : opts.cities.length > 0 ? (
          <EntryGroup kicker="Cities" entries={opts.cities} />
        ) : (
          <div class="empty">No cities documented here yet — the catalogue is growing daily.</div>
        )}
      </div>
    </Layout>
  );
}
