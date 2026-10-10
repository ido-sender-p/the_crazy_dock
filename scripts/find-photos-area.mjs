// Third photo search, for docks that still have none: a photo of the water close by (coast, bay, beach, harbour view...),
// shown on the page as "View near <dock>" so it never claims to be the dock itself.
// Wikimedia Commons files geotagged within 2 km whose own categories or title show water, with a usable CC licence and author,
// at least 1000 px wide, landscape. People, vehicles, interiors, signs and maps are excluded. Nothing is downloaded:
// results go to scripts/data/photo-candidates-area.json (nearest first) for review. Resumable.
// Usage: node scripts/find-photos-area.mjs [--limit N] [--withheld=Florida]
import { readFile, writeFile } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";
import { cleanAuthor, authorUsable } from "./lib/clean.mjs";
import { photoTargets } from "./lib/photoTargets.mjs";
import { getJson, licenseOk, stripHtml } from "./import-wikidata.mjs";

const OUT = new URL("./data/photo-candidates-area.json", import.meta.url);
const limitAt = process.argv.indexOf("--limit");
const LIMIT = limitAt > 0 ? Number(process.argv[limitAt + 1]) : Infinity;
const RADIUS = 2000;

const WATER = /\b(sea|seas|coast|coastal|coastline|beach|beaches|bay|bays|gulf|shore|shoreline|seaside|seafront|waterfront|harbou?rs?|marinas?|ports?|lagoon|island|islands|cove|strait|channel|ocean|inlet|river|canal|sound|bayou|mangroves?|piers?|docks?|boats?|sailboats?|yachts?|ferry|bridge over|intracoastal|keys?|reef|sunset over|sunrise over)\b/i;
const BAD = /\b(map|logo|flag|plan|diagram|coat of arms|timetable|poster|stamp|sign|menu|screenshot|panoramio|interior|portrait|wedding|festival|party|people|man|woman|girl|boy|child|children|car|cars|bus|truck|train|railway|locomotive|aircraft|airplane|plane|helicopter|motorcycle|bike|cycling|race|crash|accident|police|fire|military|soldiers?|tank|missile|memorial|grave|cemetery|church|cathedral|mosque|temple|hotel|restaurant|bar|pub|shop|store|supermarket|mall|office|school|hospital|stadium|museum|statue|monument|graffiti|food|fish market|dead|dog|cat|bird|birds|flower|flowers|insect|snake|spider|alligator|crocodile|snow|ice|night)\b/i;
const rad = (d) => (d * Math.PI) / 180;
const api = (params) => getJson(`https://commons.wikimedia.org/w/api.php?${new URLSearchParams({ format: "json", ...params })}`).then(async (r) => { await sleep(250); return r; });

async function filePages(titles) {
  const out = [];
  for (let i = 0; i < titles.length; i += 40) {
    const j = await api({ action: "query", prop: "imageinfo|categories", iiprop: "url|size|extmetadata|mime", iiurlwidth: "1600", cllimit: "40", titles: titles.slice(i, i + 40).join("|") });
    out.push(...Object.values(j?.query?.pages ?? {}));
  }
  return out;
}

function usable(page) {
  const ii = page?.imageinfo?.[0];
  if (!ii || !/image\/jpeg/.test(ii.mime) || !ii.thumburl || ii.width < 1000 || ii.width < ii.height * 1.2) return null;
  const md = ii.extmetadata ?? {};
  const license = md.LicenseShortName?.value;
  if (!licenseOk(license, stripHtml(md.UsageTerms?.value))) return null;
  const author = cleanAuthor(stripHtml(md.Artist?.value));
  if (!authorUsable(author, license)) return null;
  const cats = (page.categories ?? []).map((c) => c.title.replace(/^Category:/, "")).join(" | ");
  return { title: page.title, license, author, commonsUrl: ii.descriptionurl, thumb: ii.thumburl, width: ii.width, height: ii.height, cats, desc: stripHtml(md.ImageDescription?.value).slice(0, 160) };
}

async function search(dock) {
  const g = await api({ action: "query", list: "geosearch", gscoord: `${dock.lat}|${dock.lon}`, gsradius: String(RADIUS), gsnamespace: "6", gslimit: "100" });
  const hits = g?.query?.geosearch ?? [];
  if (!hits.length) return [];
  const dist = new Map(hits.map((h) => [h.title, h.dist]));
  const out = [];
  for (const p of await filePages(hits.map((h) => h.title))) {
    const u = usable(p);
    if (!u) continue;
    const text = `${u.title.replace(/^File:/, "")} ${u.cats}`;
    if (BAD.test(text) || !WATER.test(text)) continue;
    const d = dist.get(p.title) ?? RADIUS;
    const water = (text.match(new RegExp(WATER.source, "gi")) ?? []).length;
    out.push({ ...u, distance: Math.round(d), water, score: +(Math.min(water, 4) * 6 - d / 80 + Math.min(u.width, 4000) / 2000).toFixed(1) });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 4);
}

const rows = await photoTargets();
const results = await readFile(OUT, "utf8").then(JSON.parse, () => ({}));
const todo = rows.filter((d) => !(d.slug in results)).slice(0, LIMIT);
console.log(`${rows.length} docks without a photo, ${todo.length} to search`);
let n = 0;
for (const d of todo) {
  try { results[d.slug] = await search(d); } catch (e) { console.log("error", d.slug, String(e).slice(0, 80)); continue; }
  if (++n % 10 === 0) { await writeFile(OUT, JSON.stringify(results, null, 1)); console.log(`${n}/${todo.length}  with candidates: ${Object.values(results).filter((r) => r.length).length}`); }
}
await writeFile(OUT, JSON.stringify(results, null, 1));
console.log(`done: ${Object.values(results).filter((r) => r.length).length} of ${Object.keys(results).length} docks have at least one candidate`);
