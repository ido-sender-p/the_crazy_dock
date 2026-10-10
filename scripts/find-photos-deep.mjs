// Second, more inventive photo search for docks that still have none (see find-photos.mjs for the strict first pass).
// All sources are Wikimedia projects, so the licences are the same as before (CC0, public domain, CC BY, CC BY-SA with a known author):
//   wikidata   a Wikidata item found by the dock's name, within 1.5 km, that has an image (P18) or a Commons category (P373)
//   wikipedia  the lead image of a Wikipedia article (English, then the local language) near the dock whose title names it
//   category   a Commons category named after the dock (or "<name> harbour" ...), the files inside it
//   geo        a Commons file geotagged within 250 m whose own categories show a harbour subject (marina, harbour, pier, port)
// Nothing is downloaded or changed: results go to scripts/data/photo-candidates-deep.json for review.
// Usage: node scripts/find-photos-deep.mjs [--limit N] [--withheld=Florida]   (resumable)
import { readFile, writeFile } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";
import { slugify } from "./lib/slugify.mjs";
import { cleanAuthor, authorUsable } from "./lib/clean.mjs";
import { photoTargets } from "./lib/photoTargets.mjs";
import { getJson, licenseOk, stripHtml } from "./import-wikidata.mjs";

const OUT = new URL("./data/photo-candidates-deep.json", import.meta.url);
const FIRST = new URL("./data/photo-candidates.json", import.meta.url);
const limitAt = process.argv.indexOf("--limit");
const LIMIT = limitAt > 0 ? Number(process.argv[limitAt + 1]) : Infinity;

const GENERIC = /^(port|harbour|harbor|marina|pier|limani|yacht|yachts|club|nautical|the|and|fishing|small|ferry|terminal|new|old|city|municipal|public|boat|boats|dock|docks|marine|wharf|quay|basin|landing|ramp|park|state|county|beach|bay|key|island|saint|fort)$/;
const distinctive = (name) => slugify(name).split("-").filter((w) => w.length >= 4 && !GENERIC.test(w));
const KEYWORD = /\b(marinas?|harbou?rs?|ports?|piers?|quays?|jetty|jetties|yacht|yachts|docks?|moles?|moorings?|limani|wharf|breakwater|ferry|boat)\b/i;
const BAD = /\b(map|logo|flag|plan|diagram|coat of arms|schema|timetable|poster|stamp|church|monastery|castle|restaurant|airport|hotel|panoramio|interior|sign|menu|screenshot|portrait|film festival)\b/i;
const rad = (d) => (d * Math.PI) / 180;
const metres = (a, b) => 6371000 * 2 * Math.asin(Math.sqrt(Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2));
const api = (host, params) => getJson(`https://${host}/w/api.php?${new URLSearchParams({ format: "json", ...params })}`).then(async (r) => { await sleep(250); return r; });

async function filePages(titles) {
  const out = [];
  for (let i = 0; i < titles.length; i += 40) {
    const j = await api("commons.wikimedia.org", { action: "query", prop: "imageinfo|coordinates|categories", iiprop: "url|size|extmetadata|mime", iiurlwidth: "1600", cllimit: "40", titles: titles.slice(i, i + 40).join("|") });
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
  const cats = (page.categories ?? []).map((c) => c.title.replace(/^Category:/, "")).join(" | ");
  return { title: page.title, license, author, commonsUrl: ii.descriptionurl, thumb: ii.thumburl, width: ii.width, height: ii.height, cats };
}

async function search(dock) {
  const toks = distinctive(dock.name);
  const key = toks.join(" ");
  const found = new Map();
  const keep = (page, via, base, dist) => {
    const u = usable(page);
    if (!u || BAD.test(u.title) || BAD.test(u.cats)) return;
    const c = page.coordinates?.[0];
    const d = c ? metres(dock, { lat: c.lat, lon: c.lon }) : dist ?? null;
    if (d != null && d > 2000) return;
    const score = base - (d ?? 500) / 100 + Math.min(u.width, 4000) / 4000;
    if (!found.has(u.title) || found.get(u.title).score < score) found.set(u.title, { ...u, via, distance: d == null ? null : Math.round(d), score: +score.toFixed(1) });
  };

  // wikidata: items by name, within 1.5 km
  if (key) {
    const s = await api("www.wikidata.org", { action: "wbsearchentities", search: dock.name, language: "en", limit: "6", type: "item" });
    const ids = (s?.search ?? []).map((x) => x.id);
    if (ids.length) {
      const e = await api("www.wikidata.org", { action: "wbgetentities", props: "claims|labels", ids: ids.join("|") });
      for (const ent of Object.values(e?.entities ?? {})) {
        const cl = (p) => ent.claims?.[p]?.[0]?.mainsnak?.datavalue?.value;
        const co = cl("P625");
        if (!co || metres(dock, { lat: co.latitude, lon: co.longitude }) > 1500) continue;
        const d = metres(dock, { lat: co.latitude, lon: co.longitude });
        if (typeof cl("P18") === "string") for (const p of await filePages(["File:" + cl("P18").replace(/_/g, " ")])) keep(p, "wikidata", 60, d);
        if (typeof cl("P373") === "string") {
          const m = await api("commons.wikimedia.org", { action: "query", list: "categorymembers", cmtitle: "Category:" + cl("P373"), cmtype: "file", cmlimit: "12" });
          const t = (m?.query?.categorymembers ?? []).map((x) => x.title);
          if (t.length) for (const p of await filePages(t)) keep(p, "wikidata", 50, d);
        }
      }
    }
  }

  // wikipedia: lead image of nearby articles that name the dock (English, then the country's own wiki is skipped for cost)
  for (const lang of ["en"]) {
    const g = await api(`${lang}.wikipedia.org`, { action: "query", list: "geosearch", gscoord: `${dock.lat}|${dock.lon}`, gsradius: "1500", gslimit: "15" });
    const arts = (g?.query?.geosearch ?? []).filter((a) => toks.some((w) => slugify(a.title).includes(w)) || (a.dist <= 200 && KEYWORD.test(a.title)));
    if (arts.length) {
      const p = await api(`${lang}.wikipedia.org`, { action: "query", prop: "pageimages", piprop: "name", pageids: arts.map((a) => a.pageid).join("|") });
      const dist = new Map(arts.map((a) => [String(a.pageid), a.dist]));
      const files = Object.values(p?.query?.pages ?? {}).filter((x) => x.pageimage).map((x) => ({ f: "File:" + x.pageimage.replace(/_/g, " "), d: dist.get(String(x.pageid)) }));
      if (files.length) for (const pg of await filePages(files.map((x) => x.f))) keep(pg, "wikipedia", 45, files.find((x) => x.f === pg.title)?.d);
    }
  }

  // category: a Commons category named after the dock
  if (key) {
    for (const q of [key, `${key} ${dock.settlement ?? ""}`.trim()]) {
      const s = await api("commons.wikimedia.org", { action: "query", list: "search", srnamespace: "14", srlimit: "5", srsearch: q });
      for (const hit of s?.query?.search ?? []) {
        const t = hit.title.replace(/^Category:/, "").toLowerCase();
        if (!toks.some((w) => t.includes(w)) || !KEYWORD.test(t)) continue;
        const m = await api("commons.wikimedia.org", { action: "query", list: "categorymembers", cmtitle: hit.title, cmtype: "file", cmlimit: "12" });
        const files = (m?.query?.categorymembers ?? []).map((x) => x.title);
        if (files.length) for (const p of await filePages(files)) keep(p, "category", 40);
      }
    }
  }

  // geo: very close files whose categories show a harbour subject
  const g = await api("commons.wikimedia.org", { action: "query", list: "geosearch", gscoord: `${dock.lat}|${dock.lon}`, gsradius: "250", gsnamespace: "6", gslimit: "40" });
  const near = g?.query?.geosearch ?? [];
  if (near.length) {
    const dist = new Map(near.map((h) => [h.title, h.dist]));
    for (const p of await filePages(near.map((h) => h.title))) {
      const u = usable(p);
      if (u && (KEYWORD.test(u.cats) || toks.some((w) => u.cats.toLowerCase().includes(w)))) keep(p, "geo", 30, dist.get(p.title));
    }
  }
  return [...found.values()].sort((a, b) => b.score - a.score).slice(0, 4);
}

const first = await readFile(FIRST, "utf8").then(JSON.parse, () => ({}));
const rows = await photoTargets();
const results = await readFile(OUT, "utf8").then(JSON.parse, () => ({}));
const todo = rows.filter((d) => !(d.slug in results)).slice(0, LIMIT);
console.log(`${rows.length} docks without a photo, ${todo.length} to search (${Object.values(first).filter((r) => r.length).length} also have first-pass candidates)`);
let n = 0;
for (const d of todo) {
  try { results[d.slug] = await search(d); } catch (e) { console.log("error", d.slug, String(e).slice(0, 80)); continue; }
  if (++n % 10 === 0) { await writeFile(OUT, JSON.stringify(results, null, 1)); console.log(`${n}/${todo.length}  with candidates: ${Object.values(results).filter((r) => r.length).length}`); }
}
await writeFile(OUT, JSON.stringify(results, null, 1));
console.log(`done: ${Object.values(results).filter((r) => r.length).length} of ${Object.keys(results).length} docks have at least one candidate`);
