// Looks for a Wikimedia Commons photo for catalogue docks that have none. Two searches, both strict about the subject:
//   A) Commons text search for the dock's name (and its place), keeping files geotagged within 2 km;
//   B) geotagged Commons files within 1.5 km, as enrich-osm.mjs does at 400 m.
// A file is only a candidate when its own title has a distinctive word of the dock's name and a harbour word
// (so "Olive grove" or a map never passes), it is a JPEG/PNG of at least 1000 px with a usable CC licence and author.
// Nothing is downloaded or changed: results go to scripts/data/photo-candidates.json for review.
// Usage: node scripts/find-photos.mjs [--limit N] [--withheld=Florida]   (resumable: docks already in the file are skipped)
import { readFile, writeFile } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";
import { slugify } from "./lib/slugify.mjs";
import { cleanAuthor, authorUsable } from "./lib/clean.mjs";
import { photoTargets } from "./lib/photoTargets.mjs";
import { getJson, licenseOk, stripHtml } from "./import-wikidata.mjs";

const OUT = new URL("./data/photo-candidates.json", import.meta.url);
const limitAt = process.argv.indexOf("--limit");
const LIMIT = limitAt > 0 ? Number(process.argv[limitAt + 1]) : Infinity;

const GENERIC = /^(port|harbour|harbor|marina|pier|limani|yacht|yachts|club|nautical|the|and|fishing|small|ferry|terminal|new|old|city|municipal|public|boat|boats|dock|docks|marine|wharf|quay|basin|landing|ramp|park|state|county|beach|bay|key|island|saint|fort)$/;
const distinctive = (name) => slugify(name).split("-").filter((w) => w.length >= 4 && !GENERIC.test(w));
const KEYWORD = /\b(marina|harbou?rs?|ports?|piers?|quays?|jetty|jetties|yachts?|boats?|docks?|moles?|moorings?|limani|wharf|breakwater|ferry)\b/i;
const BAD_TITLE = /\b(map|logo|flag|plan|diagram|coat of arms|schema|timetable|poster|stamp|church|monastery|castle|restaurant|airport|hotel|olive|recycling|cat|dog|flowers?|sunset|panoramio|interior|street|square|sign|menu|aerial map|screenshot)\b/i;
const rad = (d) => (d * Math.PI) / 180;
const metres = (a, b) => 6371000 * 2 * Math.asin(Math.sqrt(Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2));

const PROPS = "imageinfo|coordinates|categories";
async function pagesByTitles(titles) {
  const out = [];
  for (let i = 0; i < titles.length; i += 40) {
    const q = new URLSearchParams({ action: "query", format: "json", prop: PROPS, iiprop: "url|size|extmetadata|mime", iiurlwidth: "1600", cllimit: "30", titles: titles.slice(i, i + 40).join("|") });
    const j = await getJson(`https://commons.wikimedia.org/w/api.php?${q}`);
    await sleep(300);
    out.push(...Object.values(j?.query?.pages ?? {}));
  }
  return out;
}

function usable(page) {
  const ii = page?.imageinfo?.[0];
  if (!ii || !/image\/(jpeg|png)/.test(ii.mime) || !ii.thumburl || ii.width < 1000) return null;
  const md = ii.extmetadata ?? {};
  const license = md.LicenseShortName?.value;
  if (!licenseOk(license, stripHtml(md.UsageTerms?.value))) return null;
  const author = cleanAuthor(stripHtml(md.Artist?.value));
  if (!authorUsable(author, license)) return null;
  const cats = (page.categories ?? []).map((c) => c.title).join(" ");
  const text = `${page.title} ${cats} ${stripHtml(md.ImageDescription?.value)}`.toLowerCase();
  return { title: page.title, license, author, commonsUrl: ii.descriptionurl, thumb: ii.thumburl, width: ii.width, height: ii.height, text };
}

function judge(dock, page, dist) {
  const info = usable(page);
  if (!info || BAD_TITLE.test(info.title)) return null;
  // strict: the file's own title must carry a distinctive word of the dock's name AND a harbour word
  const title = info.title.replace(/^File:/, "").toLowerCase();
  const toks = distinctive(dock.name);
  const hits = toks.filter((w) => title.includes(w)).length;
  if (!toks.length || hits === 0 || !KEYWORD.test(title)) return null;
  const c = page.coordinates?.[0];
  const d = c ? metres(dock, { lat: c.lat, lon: c.lon }) : dist ?? null;
  if (d != null && d > 600) return null;
  // no coordinates: the title must also name the place, otherwise it could be any harbour with a similar name
  if (d == null) {
    const place = [dock.settlement, dock.stateProvince].flatMap((p) => slugify(p ?? "").split("-")).filter((w) => w.length >= 4 && w !== "saint");
    if (!place.some((w) => title.includes(w))) return null;
  }
  const score = hits * 30 - (d ?? 400) / 60 + Math.min(info.width, 4000) / 2000;
  return { ...info, text: undefined, distance: d == null ? null : Math.round(d), hits, keyHit: true, score: +score.toFixed(1) };
}

async function searchFor(dock) {
  const cands = new Map();
  const add = (page, dist) => { const j = judge(dock, page, dist); if (j && (!cands.has(j.title) || cands.get(j.title).score < j.score)) cands.set(j.title, j); };
  // A) text search on the name
  // Commons search needs every word to match, so use the dock's distinctive words alone and with one harbour word
  const key = distinctive(dock.name).join(" ");
  const queries = key ? [key, ...["harbour", "marina", "port", "pier"].map((w) => `${key} ${w}`)] : [];
  for (const q of queries) {
    const j = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=15&srsearch=${encodeURIComponent(q)}`);
    await sleep(300);
    const titles = (j?.query?.search ?? []).map((s) => s.title);
    if (titles.length) for (const p of await pagesByTitles(titles)) add(p);
  }
  // B) geosearch
  const g = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&format=json&list=geosearch&gscoord=${dock.lat}|${dock.lon}&gsradius=1500&gsnamespace=6&gslimit=60`);
  await sleep(300);
  const hits = g?.query?.geosearch ?? [];
  const dist = new Map(hits.map((h) => [h.title, h.dist]));
  if (hits.length) for (const p of await pagesByTitles(hits.map((h) => h.title))) add(p, dist.get(p.title));
  return [...cands.values()].sort((a, b) => b.score - a.score).slice(0, 3);
}

const rows = await photoTargets();
const results = await readFile(OUT, "utf8").then(JSON.parse, () => ({}));
const todo = rows.filter((d) => !(d.slug in results)).slice(0, LIMIT);
console.log(`${rows.length} docks without a photo, ${todo.length} to search`);
let n = 0;
for (const d of todo) {
  try { results[d.slug] = await searchFor(d); } catch (e) { console.log("error", d.slug, String(e).slice(0, 80)); continue; }
  if (++n % 10 === 0) { await writeFile(OUT, JSON.stringify(results, null, 1)); console.log(`${n}/${todo.length}  with candidates: ${Object.values(results).filter((r) => r.length).length}`); }
}
await writeFile(OUT, JSON.stringify(results, null, 1));
console.log(`done: ${Object.values(results).filter((r) => r.length).length} of ${Object.keys(results).length} docks have at least one candidate`);
