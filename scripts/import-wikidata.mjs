// Builds a dock catalogue from public sources and writes it to scripts/data/ (gitignored):
//   - Wikidata SPARQL: candidate marinas/piers/harbours with coordinates + a Commons photo
//   - Wikipedia REST summary: description text (CC BY-SA, credited on the dock page)
//   - Wikimedia Commons API: photo licence + author; only CC0 / public domain / CC BY / CC BY-SA kept
//     (CC BY / CC BY-SA also need a known author, so those with "Unknown author" are dropped)
// Photos are downloaded as 1600px-wide thumbnails (~300-700KB each).
//
// Output: scripts/data/docks.json, scripts/data/images/<qid>.jpg|png
// Resumable: QIDs already in docks.json (or rejected.json) are skipped on re-run.
// Nothing is written to D1 or R2 here; see load-images.mjs for local R2.
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { countriesByContinent } from "../src/continents.ts";
import { slugify } from "./lib/slugify.mjs";
import { cleanDescription, cleanAuthor, authorUsable, cleanPlace } from "./lib/clean.mjs";

const TARGET = Number(process.argv[2] ?? 500);
const PER_COUNTRY_CAP = 40;
const GAP_MS = 300;
const SAVE_EVERY = 25;
const UA = "WildockBot/0.1 (https://wildock.com; idosender1@gmail.com)";
const OUT = new URL("./data/", import.meta.url);
const IMG_DIR = new URL("./data/images/", import.meta.url);

const CLASS_MAP = {
  Q721207: { type: "marina", w: 30 },
  Q863454: { type: "pier", w: 30 },
  Q283202: { type: "pier", w: 20 }, // harbor
  Q3375626: { type: "pier", w: 10 }, // jetty-ish
  Q44782: { type: "industrial", w: 0 }, // port
  Q11354770: { type: "marina", w: 10 },
};

const countryToContinent = {};
for (const [cont, names] of Object.entries(countriesByContinent)) for (const n of names) countryToContinent[n] = cont;

// Fetch with a 30s timeout and retries (network errors, 429/503/504 honoring Retry-After).
async function fetchRetry(url, headers, { tries = 4, timeoutMs = 30000 } = {}) {
  for (let i = 0; i < tries; i++) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA, ...headers }, signal: ctl.signal });
      if (r.ok) return Buffer.from(await r.arrayBuffer());
      if (![429, 503, 504].includes(r.status)) return null;
      const ra = Number(r.headers.get("retry-after"));
      await sleep((Number.isFinite(ra) && ra > 0 ? Math.min(ra, 120) : 2 ** i * 2) * 1000);
    } catch {
      await sleep(2 ** i * 1000);
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

async function getJson(url) {
  const b = await fetchRetry(url, { Accept: "application/json" });
  try { return b ? JSON.parse(b.toString("utf8")) : null; } catch { return null; }
}

async function sparql() {
  // MIN/MAX instead of SAMPLE so reruns are deterministic; admin and state travel together in one value.
  const q = `SELECT ?item (MIN(?l) AS ?label) (MIN(?c) AS ?cls) (MIN(?cn) AS ?country) (MIN(?co) AS ?coord)
    (MIN(?im) AS ?img) (MIN(?ar) AS ?article) (MIN(?pair) AS ?adminPair) (MAX(?len) AS ?length) (MIN(?yr) AS ?year) WHERE {
    VALUES ?c { ${Object.keys(CLASS_MAP).map((k) => "wd:" + k).join(" ")} }
    ?item wdt:P31 ?c; wdt:P17 ?ctry; wdt:P625 ?co; wdt:P18 ?im.
    ?ctry rdfs:label ?cn FILTER(LANG(?cn)="en")
    ?item rdfs:label ?l FILTER(LANG(?l)="en")
    OPTIONAL { ?ar schema:about ?item; schema:isPartOf <https://en.wikipedia.org/> }
    OPTIONAL { ?item wdt:P131 ?a. ?a rdfs:label ?al FILTER(LANG(?al)="en")
      OPTIONAL { ?a wdt:P131 ?s. ?s rdfs:label ?sl FILTER(LANG(?sl)="en") }
      BIND(CONCAT(?al, "|", COALESCE(?sl, "")) AS ?pair) }
    OPTIONAL { ?item wdt:P2043 ?len }
    OPTIONAL { ?item wdt:P571 ?yr }
  } GROUP BY ?item`;
  const j = await getJson("https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(q));
  if (!j) throw new Error("SPARQL failed");
  return j.results.bindings;
}

function parseCoord(wkt) {
  const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(wkt);
  return m ? { lon: +m[1], lat: +m[2] } : null;
}

const OK_LICENSE = /^(cc0|cc[- ]by(-sa)?[- ][\d.]+|public domain|pd\b|pd-)/i;
const NC_ND = /(^|[ \-])(nc|nd)([ \-]|$)/i;
export function licenseOk(name, usageTerms = "") {
  if (!name) return false;
  if (NC_ND.test(name) || NC_ND.test(usageTerms ?? "")) return false;
  if (/fair use|gfdl only/i.test(name)) return false;
  return OK_LICENSE.test(name.trim());
}

const stripHtml = (s) => (s ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'").replace(/\s+/g, " ").trim();

async function commonsInfo(file) {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size|extmetadata|mime&iiurlwidth=1600&titles=${encodeURIComponent("File:" + file)}`;
  const j = await getJson(u);
  const page = j && Object.values(j.query?.pages ?? {})[0];
  const ii = page?.imageinfo?.[0];
  if (!ii || !/image\/(jpeg|png)/.test(ii.mime) || !ii.thumburl) return null;
  const md = ii.extmetadata ?? {};
  const license = md.LicenseShortName?.value;
  if (!licenseOk(license, stripHtml(md.UsageTerms?.value))) return null;
  if (ii.width < 1000) return null;
  const author = cleanAuthor(stripHtml(md.Artist?.value));
  if (!authorUsable(author, license)) return null;
  return {
    license,
    author,
    commonsUrl: ii.descriptionurl,
    thumb: ii.thumburl,
    ext: ii.mime === "image/png" ? "png" : "jpg",
    width: ii.width,
    height: ii.height,
  };
}

async function wikiSummary(title) {
  const j = await getJson("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title));
  if (!j || j.type !== "standard") return null;
  const text = cleanDescription(j.extract);
  if (!text) return null;
  return { text, url: j.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}` };
}

async function download(url, path) {
  const b = await fetchRetry(url, {});
  if (!b || b.length < 1000) return 0;
  await writeFile(path, b);
  return b.length;
}

const safeDecode = (s) => { try { return decodeURIComponent(s); } catch { return null; } };

async function readJsonOr(url, fallback) {
  try { return JSON.parse(await readFile(url, "utf8")); } catch { return fallback; }
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true });
  const docksUrl = new URL("docks.json", OUT);
  const rejectedUrl = new URL("rejected.json", OUT);
  const results = await readJsonOr(docksUrl, []);
  const rejected = new Set(await readJsonOr(rejectedUrl, []));
  const doneQids = new Set(results.map((r) => r.qid));
  const usedSlugs = new Set(results.map((r) => r.slug));
  const perCountry = {};
  for (const r of results) perCountry[r.country] = (perCountry[r.country] ?? 0) + 1;
  if (results.length) console.log("Resuming with", results.length, "docks");

  const raw = await sparql();
  console.log("SPARQL candidates:", raw.length);

  const cands = [];
  for (const b of raw) {
    const country = b.country.value;
    const continent = countryToContinent[country];
    const coord = parseCoord(b.coord.value);
    const cls = CLASS_MAP[b.cls.value.split("/").pop()];
    const label = b.label.value;
    if (!continent || !coord || !cls || /^Q\d+$/.test(label) || !b.article) continue;
    const imgFile = safeDecode(b.img.value.split("/Special:FilePath/").pop());
    const wikiTitle = safeDecode(b.article.value.split("/wiki/").pop());
    if (!imgFile || !wikiTitle) continue;
    const pair = b.adminPair?.value ?? "";
    const sep = pair.indexOf("|");
    cands.push({
      qid: b.item.value.split("/").pop(),
      name: label,
      dockType: cls.type,
      country,
      continentSlug: continent,
      admin: sep < 0 ? "" : pair.slice(0, sep),
      state: sep < 0 ? "" : pair.slice(sep + 1),
      lat: coord.lat,
      lon: coord.lon,
      lengthM: b.length ? Math.round(+b.length.value) : 0,
      yearBuilt: b.year ? new Date(b.year.value).getUTCFullYear() : null,
      imgFile: imgFile.replace(/_/g, " "),
      wikiTitle,
      score: 100 + cls.w,
    });
  }
  // Only entries with a Wikipedia article: that is our reliable, citable text source.
  const pool = cands.sort((a, b) => b.score - a.score || a.qid.localeCompare(b.qid, "en", { numeric: true }));
  console.log("With Wikipedia article:", pool.length);

  const save = async () => {
    await writeFile(docksUrl, JSON.stringify(results, null, 2));
    await writeFile(rejectedUrl, JSON.stringify([...rejected]));
  };
  let bytes = 0;
  let sinceSave = 0;
  try {
    for (const c of pool) {
      if (results.length >= TARGET) break;
      if (doneQids.has(c.qid) || rejected.has(c.qid)) continue;
      if ((perCountry[c.country] ?? 0) >= PER_COUNTRY_CAP) continue;
      const info = await commonsInfo(c.imgFile);
      await sleep(GAP_MS);
      const sum = info ? await wikiSummary(c.wikiTitle) : null;
      await sleep(GAP_MS);
      if (!info || !sum) { rejected.add(c.qid); continue; }
      let slug = slugify(c.name);
      if (!slug) { rejected.add(c.qid); continue; }
      if (usedSlugs.has(slug)) slug = `${slug}-${slugify(c.country)}`;
      for (let n = 2; usedSlugs.has(slug); n++) slug = `${slugify(c.name)}-${n}`;
      const imageFile = `${c.qid}.${info.ext}`;
      const size = await download(info.thumb, new URL(imageFile, IMG_DIR));
      if (!size) continue;
      bytes += size;
      usedSlugs.add(slug);
      doneQids.add(c.qid);
      perCountry[c.country] = (perCountry[c.country] ?? 0) + 1;
      results.push({
        slug,
        name: c.name,
        dockType: c.dockType,
        continentSlug: c.continentSlug,
        country: c.country,
        stateProvince: cleanPlace(c.state, c.country),
        settlement: cleanPlace(c.admin, c.country),
        lat: c.lat,
        lon: c.lon,
        lengthM: c.lengthM,
        yearBuilt: c.yearBuilt,
        description: sum.text,
        descriptionSource: `Wikipedia|${sum.url}`,
        imageAttribution: `Photo: ${info.author}, ${info.license}, via Wikimedia Commons|${info.commonsUrl}`,
        imageOrientation: info.height > info.width ? "portrait" : "landscape",
        imageFile,
        qid: c.qid,
      });
      if (++sinceSave >= SAVE_EVERY) {
        sinceSave = 0;
        await save();
        console.log(`${results.length}/${TARGET} (${(bytes / 1e6).toFixed(1)} MB this run)`);
      }
    }
  } finally {
    await save();
  }
  console.log(`Done: ${results.length} docks, ~${(bytes / 1e6).toFixed(1)} MB of images this run`);
  console.log("Per country:", perCountry);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
export { sparql, fetchRetry, getJson, wikiSummary, download, stripHtml };
