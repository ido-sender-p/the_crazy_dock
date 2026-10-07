// Step 2 of adding a country from OpenStreetMap: turns the Overpass candidates (import-osm.mjs) into docks.json
// entries, the same file import-wikidata.mjs fills. Usage: node scripts/enrich-osm.mjs GR CY [--limit N]
//   - names: name:en, else a Latin name, else a transliteration of the Greek name
//   - place: Nominatim reverse geocode (1 request/second, as its usage policy requires)
//   - text: the Wikipedia summary when the Wikidata item has an English article, else a short factual sentence set
//     written only from OpenStreetMap tags (type, place, berths, operator, facilities); nothing is invented
//   - photo: the Wikidata image (P18), else a Commons file geotagged within a few hundred metres whose title or
//     categories match the place; only CC0 / public domain / CC BY / CC BY-SA with a known author, as before
// Resumable: finished candidates are cached in scripts/data/osm-enriched.json. Nothing is written to D1 or R2.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import { slugify } from "./lib/slugify.mjs";
import { cleanAuthor, authorUsable, cleanPlace } from "./lib/clean.mjs";
import { getJson, wikiSummary, download, licenseOk, stripHtml } from "./import-wikidata.mjs";

const UA = "WildockBot/0.1 (https://wildock.com; idosender1@gmail.com)";
const DATA = new URL("./data/", import.meta.url);
const IMG_DIR = new URL("./images/", DATA);
// Country names as the site spells them (src/continents.ts). "US-FL" is Florida: country United States, state Florida.
const COUNTRY = {
  GR: "Greece", CY: "Cyprus", "US-FL": "United States",
  BS: "Bahamas", CU: "Cuba", JM: "Jamaica", HT: "Haiti", DO: "Dominican Republic", PR: "Puerto Rico", VI: "US Virgin Islands",
  VG: "British Virgin Islands", KY: "Cayman Islands", TC: "Turks and Caicos Islands", AI: "Anguilla", AG: "Antigua and Barbuda",
  KN: "Saint Kitts and Nevis", MS: "Montserrat", GP: "Guadeloupe", DM: "Dominica", MQ: "Martinique", LC: "Saint Lucia",
  VC: "Saint Vincent and the Grenadines", BB: "Barbados", GD: "Grenada", TT: "Trinidad and Tobago", AW: "Aruba", CW: "Curaçao",
  SX: "Sint Maarten", MF: "Saint Martin", BL: "Saint Barthélemy", BQ: "Caribbean Netherlands", BZ: "Belize",
};
const CONTINENT = (iso) => (iso === "GR" || iso === "CY" ? "europe" : "north-america");
const REGION_ALIASES = { "Ioanian Islands": "Ionian Islands", Athos: "Mount Athos" };
const GR_REGIONS = { 69: "Mount Athos", A: "Eastern Macedonia and Thrace", B: "Central Macedonia", C: "Western Macedonia", D: "Epirus", E: "Thessaly", F: "Ionian Islands", G: "Western Greece", H: "Central Greece", I: "Attica", J: "Peloponnese", K: "North Aegean", L: "South Aegean", M: "Crete" };

const args = process.argv.slice(2);
const limitAt = args.indexOf("--limit");
const LIMIT = limitAt >= 0 ? Number(args[limitAt + 1]) : Infinity;
const ISOS = args.filter((a, i) => /^[A-Z]{2}(-[A-Z]{2})?$/.test(a) && !(limitAt >= 0 && i === limitAt + 1));

// ---- names -----------------------------------------------------------------------------------------------
const DIGRAPHS = [["αι", "ai"], ["ει", "ei"], ["οι", "oi"], ["ου", "ou"], ["υι", "yi"], ["μπ", "b"], ["ντ", "d"], ["γγ", "ng"], ["γκ", "g"], ["γχ", "nch"], ["τσ", "ts"], ["τζ", "tz"]];
const GREEK = { α: "a", β: "v", γ: "g", δ: "d", ε: "e", ζ: "z", η: "i", θ: "th", ι: "i", κ: "k", λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o", π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "y", φ: "f", χ: "ch", ψ: "ps", ω: "o" };
function transliterate(s) {
  let t = s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  t = t.replace(/(α|ε|η)υ/g, (m, v) => GREEK[v] + "@").replace(/@(?=[θκξπστφχψ]|$|\s)/g, "f").replace(/@/g, "v");
  for (const [g, l] of DIGRAPHS) t = t.split(g).join(l);
  t = [...t].map((c) => GREEK[c] ?? c).join("");
  return t.replace(/\b\w/g, (c) => c.toUpperCase());
}
const isLatin = (s) => /^[\p{Script=Latin}\d\s'’.,&()\-/]+$/u.test(s);
// Shops, charter offices, camps and the like are sometimes tagged leisure=marina; they are not places to dock.
const NOT_A_DOCK = /\b(charter|boat hire|boat rental|rent(als?)?|camps?|camping|office|restaurant|taverna|cafe|hotel|resort|apartments?|villas?|shop|store|school|diving|dive|boatyard|shipyard|chandlers?|holidays|travel|tours?|sales|supermarket|bar)\b|\byachts?\b(?!.*\b(club|harbou?r|port|marina|mooring)\b)/i;
const GENERIC_NAME = /^(port|harbou?r|marina|pier|jetty|quay|ferry terminal|ferry|limani|lim[ae]ni|small harbou?r|fishing harbou?r|yacht harbou?r)$/i;

// A bare place name ("Kos", "Milos") is not recognisable as a dock: add what it is.
const HAS_KIND = /(port|marina|marine|harbou?r|pier|quay|jetty|limani|limenas|limenisko|dock|mole|wharf|terminal|yacht|nautical|club|katafygio|skala)/i;
export const withKind = (name, type, label) => (HAS_KIND.test(name) ? name : `${name} ${label === "marina" ? "Marina" : label === "ferry terminal" ? "Ferry Terminal" : type === "industrial" ? "Port" : label === "pier" ? "Pier" : "Harbour"}`);

function pickName(tags) {
  const en = tags["name:en"] || tags.int_name;
  if (en && isLatin(en)) return { name: en.trim(), translit: false };
  const n = tags.name?.trim();
  if (n && isLatin(n)) return { name: n, translit: false };
  const src = tags["name:el"] || n;
  if (src && /[Ͱ-Ͽἀ-῿]/.test(src)) return { name: transliterate(src).trim(), translit: true };
  return null;
}

// ---- candidates ------------------------------------------------------------------------------------------
const rad = (d) => (d * Math.PI) / 180;
const metres = (a, b) => 6371000 * 2 * Math.asin(Math.sqrt(Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2));
const tokens = (name) => slugify(name).split("-").filter((w) => w.length >= 4 && !/^(port|harbour|harbor|marina|pier|limani|yacht|club|nautical|port|the|and|fishing|small|ferry|terminal|new|old)$/.test(w));

function kindOf(t) {
  if (t.leisure === "marina") return { type: "marina", rank: 5, label: "marina" };
  if (t.harbour === "yes") return { type: "pier", rank: 4, label: t["harbour:category"] === "fishing" || /fish/i.test(t["seamark:harbour:category"] ?? "") ? "fishing harbour" : "harbour" };
  if (t["seamark:type"] === "harbour") return { type: "pier", rank: 3.5, label: /fish/i.test(t["seamark:harbour:category"] ?? "") ? "fishing harbour" : "harbour" };
  if (t.amenity === "ferry_terminal") return { type: "pier", rank: 3, label: "ferry terminal" };
  if (t.man_made === "pier") return { type: "pier", rank: 2, label: "pier" };
  return { type: "industrial", rank: 1, label: "port" };
}

function candidatesFor(iso, rows) {
  const out = [];
  for (const r of rows) {
    const t = r.tags;
    if (t.disused || t.abandoned || t["disused:leisure"] || t.access === "private" || t.access === "no") continue;
    const picked = pickName(t);
    if (!picked || picked.name.length < 3 || GENERIC_NAME.test(picked.name) || NOT_A_DOCK.test(picked.name) || /disused|\bold\b.*\(|\bproposed\b/i.test(picked.name)) continue;
    const kind = kindOf(t);
    out.push({ ...r, iso, ...picked, name: withKind(picked.name, kind.type, kind.label), kind });
  }
  out.sort((a, b) => b.kind.rank - a.kind.rank || a.id.localeCompare(b.id));
  const kept = [];
  for (const c of out) {
    const twin = kept.find((k) => {
      const d = metres(k, c);
      if (d < 150) return true;
      if (d < 900) return tokens(k.name).some((w) => tokens(c.name).includes(w));
      return false;
    });
    if (twin) {
      for (const [key, v] of Object.entries(c.tags)) if (!(key in twin.tags)) twin.tags[key] = v; // keep the richer data
      continue;
    }
    kept.push(c);
  }
  return kept;
}

const tidyPlace = (s) => String(s ?? "").replace(/^(Municipal Unit|Municipality|Regional Unit|Community|Local Community|Municipal Community) of /i, "").replace(/\s+(Municipal Unit|Municipality|Regional Unit|Community)$/i, "").replace(/\s+/g, " ").trim();

// ---- place (Nominatim) ----------------------------------------------------------------------------------
async function reverse(c) {
  const j = await getJson(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&accept-language=en&lat=${c.lat}&lon=${c.lon}`);
  await sleep(1100);
  const a = j?.address ?? {};
  // The most local named place first, then the island, then the municipality; administrative wording is stripped.
  let settlement = tidyPlace(a.city ?? a.town ?? a.village ?? a.hamlet ?? a.suburb ?? a.island ?? a.municipality ?? a.county ?? "");
  if (settlement && !isLatin(settlement)) settlement = transliterate(settlement); // Nominatim has no English name for some villages
  let state = "";
  if (c.iso === "GR") state = GR_REGIONS[(a["ISO3166-2-lvl5"] ?? "").replace("GR-", "")] ?? REGION_ALIASES[a.state] ?? "";
  else if (c.iso === "CY") state = (a.state_district ?? "").replace(/\s+District$/i, "");
  else if (c.iso === "US-FL") state = "Florida";
  else state = ""; // island nations and territories have no state tier on the site
  return { stateRaw: a.state ?? "", settlement: cleanPlace(settlement.replace(/^Municipality of /i, ""), COUNTRY[c.iso]), stateProvince: state };
}

// ---- Wikidata / Wikipedia -------------------------------------------------------------------------------
async function wikidataFor(ids) {
  const out = {};
  for (let i = 0; i < ids.length; i += 40) {
    const chunk = ids.slice(i, i + 40);
    const j = await getJson(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims|sitelinks&ids=${chunk.join("|")}`);
    await sleep(400);
    for (const [id, e] of Object.entries(j?.entities ?? {})) {
      const claim = (p) => e.claims?.[p]?.[0]?.mainsnak?.datavalue?.value;
      out[id] = { image: claim("P18"), article: e.sitelinks?.enwiki?.title };
    }
  }
  return out;
}

// ---- Commons --------------------------------------------------------------------------------------------
// A photo must show a harbour-type subject (keyword in its title, categories or description); a name match alone is not
// enough (a file called "Olive grove on Mongonisi" is not a photo of the Mongonisi harbour).
const KEYWORD = /\b(marina|harbou?rs?|ports?|piers?|quays?|jetty|jetties|yachts?|boats?|docks?|moles?|moorings?|limani|wharf|breakwater)\b/i;
const BAD_TITLE = /\b(map|logo|flag|plan|diagram|coat of arms|schema|ferry timetable|poster|stamp|beach|church|monastery|castle|restaurant|airport|hotel|olive|recycling|cat|dog|flowers?|sunset|panoramio|interior|street|square)\b/i;

function infoFromPage(page) {
  const ii = page?.imageinfo?.[0];
  if (!ii || !/image\/(jpeg|png)/.test(ii.mime) || !ii.thumburl || ii.width < 1000) return null;
  const md = ii.extmetadata ?? {};
  const license = md.LicenseShortName?.value;
  if (!licenseOk(license, stripHtml(md.UsageTerms?.value))) return null;
  const author = cleanAuthor(stripHtml(md.Artist?.value));
  if (!authorUsable(author, license)) return null;
  return { license, author, commonsUrl: ii.descriptionurl, thumb: ii.thumburl, ext: ii.mime === "image/png" ? "png" : "jpg", width: ii.width, height: ii.height, text: `${page.title} ${stripHtml(md.Categories?.value)} ${stripHtml(md.ImageDescription?.value)}`.toLowerCase() };
}

async function commonsPages(titles) {
  const j = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size|extmetadata|mime&iiurlwidth=1600&titles=${encodeURIComponent(titles.join("|"))}`);
  await sleep(300);
  return Object.values(j?.query?.pages ?? {});
}

async function photoFor(c, p18) {
  if (p18) {
    const [page] = await commonsPages(["File:" + p18.replace(/_/g, " ")]);
    const info = infoFromPage(page);
    if (info) return info;
  }
  const g = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&format=json&list=geosearch&gscoord=${c.lat}|${c.lon}&gsradius=400&gsnamespace=6&gslimit=40`);
  await sleep(300);
  const hits = g?.query?.geosearch ?? [];
  if (!hits.length) return null;
  const dist = new Map(hits.map((h) => [h.title, h.dist]));
  const toks = tokens(c.name);
  let best = null;
  for (let i = 0; i < hits.length; i += 40) {
    for (const page of await commonsPages(hits.slice(i, i + 40).map((h) => h.title))) {
      const info = infoFromPage(page);
      if (!info || BAD_TITLE.test(page.title)) continue;
      const d = dist.get(page.title) ?? 999;
      const nameHit = toks.some((w) => info.text.includes(w));
      const keyHit = KEYWORD.test(info.text);
      if (!keyHit || !(nameHit || d <= 150)) continue;
      const score = (nameHit ? 30 : 0) + (keyHit ? 10 : 0) - d / 50 + Math.min(info.width, 4000) / 2000;
      if (!best || score > best.score) best = { ...info, score };
    }
  }
  return best;
}

// ---- text from tags -------------------------------------------------------------------------------------
const FACILITIES = [["fuel", "fuel"], ["water", "fresh water"], ["electricity", "electricity"], ["toilets", "toilets"], ["shower", "showers"], ["laundry", "laundry"], ["sanitary_dump_station", "a pump-out station"], ["crane", "a crane"], ["slipway", "a slipway"], ["repair", "repair services"], ["provisions", "provisions"], ["restaurant", "a restaurant"]];
const list = (a) => (a.length <= 1 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a.at(-1));

// Returns { text, facts }: the sentences and how many real details (beyond type and place) they carry.
function describe(c, place) {
  const t = c.tags;
  const where = [place.settlement, place.stateProvince, COUNTRY[c.iso]].filter((x, i, a) => x && a.indexOf(x) === i).join(", ");
  const article = /^[aeiou]/i.test(c.kind.label) ? "an" : "a";
  const parts = [`${c.name} is ${article} ${c.kind.label} in ${where}.`];
  let facts = 0;
  const add = (sentence) => { parts.push(sentence); facts++; };
  const berths = Number(t.capacity ?? t["capacity:berths"] ?? t["seamark:small_craft_facility:capacity"]);
  if (berths > 4 && berths < 20000) add(`It has about ${berths} ${c.kind.type === "marina" ? "berths" : "mooring places"}.`);
  const op = (t.operator ?? "").trim();
  if (op && isLatin(op) && op.length < 60) add(`It is operated by ${op}.`);
  const has = FACILITIES.filter(([k]) => /^(yes|true)$/i.test(t[k] ?? "") || t[`seamark:small_craft_facility:category`]?.split(";").includes(k)).map(([, label]) => label);
  if (has.length) add(`Facilities include ${list(has)}.`);
  const vhf = (t["seamark:radio_station:channel"] ?? t["vhf"] ?? t["seamark:calling-in_point:channel"] ?? "").toString().match(/\d{1,2}/)?.[0];
  if (vhf) add(`It can be called on VHF channel ${vhf}.`);
  if (t.fee === "yes") add("Mooring is charged.");
  else if (t.fee === "no") add("Mooring is free.");
  const year = /^\d{4}/.exec(t.start_date ?? t.opening_date ?? "")?.[0];
  if (year && +year > 1500 && +year <= new Date().getFullYear()) add(`It dates from ${year}.`);
  const note = (t["description:en"] ?? t.description ?? "").replace(/\s+/g, " ").trim();
  if (note && isLatin(note) && note.length >= 25 && note.length <= 220) add(note.replace(/[.!?]*$/, "."));
  return { text: parts.join(" "), facts };
}

const cleanWeb = (u) => {
  try { const x = new URL(/^https?:\/\//i.test(u) ? u : "https://" + u); return /^https?:$/.test(x.protocol) && x.hostname.includes(".") ? x.href : ""; } catch { return ""; }
};

// ---- main -----------------------------------------------------------------------------------------------
const readJsonOr = async (url, fb) => { try { return JSON.parse(await readFile(url, "utf8")); } catch { return fb; } };
await mkdir(IMG_DIR, { recursive: true });
const docksUrl = new URL("docks.json", DATA);
const cacheUrl = new URL("osm-enriched.json", DATA);
const docks = await readJsonOr(docksUrl, []);
const cache = await readJsonOr(cacheUrl, {});
const usedSlugs = new Set(docks.map((d) => d.slug));
const knownQids = new Set(docks.map((d) => d.qid));

let cands = [];
for (const iso of ISOS) {
  const rows = await readJsonOr(new URL(`osm-${iso}.json`, DATA), null);
  if (!rows) throw new Error(`run import-osm.mjs ${iso} first`);
  const c = candidatesFor(iso, rows);
  console.log(iso, rows.length, "elements ->", c.length, "named, deduplicated places");
  cands.push(...c);
}
cands = cands.filter((c) => !cache[c.id]).slice(0, LIMIT);
const wd = await wikidataFor([...new Set(cands.map((c) => c.tags.wikidata).filter((q) => /^Q\d+$/.test(q ?? "")))]);

let n = 0;
for (const c of cands) {
  try {
    const place = await reverse(c);
    if (c.iso === "US-FL" && place.stateRaw !== "Florida") { cache[c.id] = { skipped: "outside Florida" }; continue; } // box queries also catch Georgia, Alabama, the Bahamas
    const w = wd[c.tags.wikidata] ?? {};
    const enTitle = w.article ?? (/^en:/.test(c.tags.wikipedia ?? "") ? c.tags.wikipedia.slice(3) : "");
    const sum = enTitle ? await wikiSummary(enTitle) : null;
    const photo = await photoFor(c, w.image);
    const info = describe(c, place);
    const web = cleanWeb(c.tags.website ?? c.tags["contact:website"] ?? "");
    let slug = slugify(c.name);
    if (!slug) { cache[c.id] = { skipped: "slug" }; continue; }
    if (usedSlugs.has(slug)) slug = `${slug}-${slugify(place.settlement || c.iso)}`;
    for (let k = 2; usedSlugs.has(slug); k++) slug = `${slugify(c.name)}-${k}`;
    let imageFile;
    if (photo) {
      imageFile = `osm-${c.id.replace("/", "-")}.${photo.ext}`;
      if (!(existsSync(new URL(imageFile, IMG_DIR)) || (await download(photo.thumb, new URL(imageFile, IMG_DIR))))) imageFile = undefined;
    }
    usedSlugs.add(slug);
    const entry = {
      slug, name: c.name, dockType: c.kind.type, continentSlug: CONTINENT(c.iso), country: COUNTRY[c.iso],
      stateProvince: place.stateProvince, settlement: place.settlement, lat: +c.lat.toFixed(5), lon: +c.lon.toFixed(5), lengthM: 0, yearBuilt: null,
      description: sum ? sum.text : info.text,
      facts: sum ? 5 : info.facts,
      descriptionSource: sum ? `Wikipedia|${sum.url}` : `OpenStreetMap|https://www.openstreetmap.org/${c.id}`,
      imageAttribution: photo && imageFile ? `Photo: ${photo.author}, ${photo.license}, via Wikimedia Commons|${photo.commonsUrl}` : "",
      imageOrientation: photo && photo.height > photo.width ? "portrait" : "landscape",
      qid: `osm:${c.id}`, translit: c.translit || undefined,
    };
    if (imageFile) entry.imageFile = imageFile;
    if (web) { entry.web = web; entry.facts++; }
    docks.push(entry);
    cache[c.id] = { slug };
  } catch (e) {
    console.log("error", c.id, String(e).slice(0, 100));
    continue;
  }
  if (++n % 20 === 0) {
    await writeFile(docksUrl, JSON.stringify(docks, null, 2));
    await writeFile(cacheUrl, JSON.stringify(cache));
    console.log(`${n}/${cands.length}  photos so far: ${docks.filter((d) => d.qid?.startsWith("osm:") && d.imageFile).length}`);
  }
}
await writeFile(docksUrl, JSON.stringify(docks, null, 2));
await writeFile(cacheUrl, JSON.stringify(cache));
const mine = docks.filter((d) => d.qid?.startsWith("osm:"));
console.log("done:", mine.length, "OSM docks,", mine.filter((d) => d.imageFile).length, "with photo,", mine.filter((d) => d.descriptionSource.startsWith("Wikipedia")).length, "with Wikipedia text");
