// Turns scripts/data/docks.json (from import-wikidata.mjs) into src/catalogue.json,
// the static catalogue bundled into the Worker. No D1 involved, so it costs zero
// database reads. Fields derivable at load time are dropped here and rebuilt in src/data.ts.
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { slugify } from "./lib/slugify.mjs";
import { cleanDescription, cleanAuthor, authorUsable, cleanPlace } from "./lib/clean.mjs";
import { imagePathsBySlug, writeUploadList } from "./lib/images.mjs";

const CONTINENTS = ["europe", "asia", "africa", "north-america", "south-america", "oceania"];
const DOCK_TYPES = ["pier", "marina", "floating_dock", "industrial"];
const ORIENTATIONS = ["portrait", "landscape"];
const MIN_DESC = 250;
const MIN_DESC_OSM = 60; // descriptions written from OpenStreetMap tags are short and factual
const OSM = "https://www.openstreetmap.org/";
const MAX_PORT_SHARE = 0.6;
const WIKI = "https://en.wikipedia.org/wiki/";
const COMMONS = "https://commons.wikimedia.org/wiki/";

const all = JSON.parse(await readFile(new URL("./data/docks.json", import.meta.url), "utf8"));
// Places around each dock from scripts/enrich-nearby.mjs (optional: docks without an entry just omit the section).
const nearby = await readFile(new URL("./data/nearby.json", import.meta.url), "utf8").then(JSON.parse, () => ({}));
const images = await imagePathsBySlug();

const dropped = { description: 0, author: 0, image: 0 };
const clean = [];
for (const d of all) {
  const fromOsm = d.descriptionSource.startsWith("OpenStreetMap|");
  const description = cleanDescription(d.description, { min: fromOsm ? MIN_DESC_OSM : MIN_DESC });
  if (!description) { dropped.description++; continue; }
  let imageAttribution = "";
  // OpenStreetMap-sourced docks may have no photo yet (shown with a "submit a photo" prompt); Wikipedia docks always need one.
  if (d.imageAttribution || !fromOsm) {
    const m = /^Photo: (.*), ([^,]+), via Wikimedia Commons\|(.*)$/.exec(d.imageAttribution);
    if (!m) { dropped.author++; continue; }
    const author = cleanAuthor(m[1].replace(/(unknown author)+/gi, "Unknown author"));
    if (!authorUsable(author, m[2])) { dropped.author++; continue; }
    if (!existsSync(images.get(d.slug) ?? "")) { dropped.image++; continue; }
    imageAttribution = `Photo: ${author}, ${m[2]}, via Wikimedia Commons|${m[3]}`;
  }
  clean.push({
    ...d,
    name: d.name.replace(/\s*[—–]\s*/g, " - "),
    description,
    stateProvince: cleanPlace(d.stateProvince, d.country),
    settlement: cleanPlace(d.settlement, d.country, { strict: true }),
    imageAttribution,
  });
}

// Piers and marinas all in; ports are capped so they stay <= 60% of the catalogue,
// picked round-robin across countries (longest description first) for spread.
const others = clean.filter((d) => d.dockType !== "industrial");
const portsAll = clean.filter((d) => d.dockType === "industrial");
const portLimit = Math.floor((others.length * MAX_PORT_SHARE) / (1 - MAX_PORT_SHARE));
const byCountry = new Map();
for (const p of [...portsAll].sort((a, b) => b.description.length - a.description.length)) {
  if (!byCountry.has(p.country)) byCountry.set(p.country, []);
  byCountry.get(p.country).push(p);
}
const ports = new Set();
for (let round = 0; ports.size < Math.min(portLimit, portsAll.length); round++) {
  for (const list of byCountry.values()) {
    if (list[round] && ports.size < portLimit) ports.add(list[round].slug);
  }
}
const picked = clean.filter((d) => d.dockType !== "industrial" || ports.has(d.slug));

const out = picked.map((d) => {
  const wikiSource = d.descriptionSource.startsWith(`Wikipedia|${WIKI}`);
  if (!wikiSource && !d.descriptionSource.startsWith(`OpenStreetMap|${OSM}`)) throw new Error(`unexpected descriptionSource for ${d.slug}`);
  if (d.imageAttribution && !d.imageAttribution.includes(`|${COMMONS}`)) throw new Error(`unexpected imageAttribution url for ${d.slug}`);
  const row = {
    slug: d.slug,
    name: d.name,
    dockType: d.dockType,
    continentSlug: d.continentSlug,
    country: d.country,
    stateProvince: d.stateProvince,
    settlement: d.settlement,
    lat: d.lat,
    lon: d.lon,
    description: d.description,
    ...(wikiSource ? { wiki: d.descriptionSource.slice(`Wikipedia|${WIKI}`.length) } : { osm: d.descriptionSource.slice(`OpenStreetMap|${OSM}`.length) }),
    imageAttribution: d.imageAttribution.replace(`|${COMMONS}`, "|"),
    imageOrientation: d.imageOrientation,
  };
  const nb = nearby[d.slug];
  if (nb) {
    row.nb = [nb.food, nb.stay, nb.shops, nb.sights, nb.historic, nb.beach, nb.station, nb.ferry, nb.capped ? 1 : 0];
    if (nb.malls?.length) row.ml = nb.malls;
    if (nb.landmarks?.length) row.lm = nb.landmarks;
  }
  if (d.lengthM) row.lengthM = d.lengthM;
  if (d.yearBuilt != null) row.yearBuilt = d.yearBuilt;
  return row;
});

function validate(rows) {
  const seen = new Set();
  const fail = (r, msg) => { throw new Error(`catalogue invalid (${r.slug}): ${msg}`); };
  for (const r of rows) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.slug ?? "")) fail(r, "bad slug");
    if (seen.has(r.slug)) fail(r, "duplicate slug");
    seen.add(r.slug);
    if (!r.name) fail(r, "empty name");
    if (!r.country || !slugify(r.country)) fail(r, "empty country");
    if (!(r.lat >= -90 && r.lat <= 90) || !(r.lon >= -180 && r.lon <= 180)) fail(r, "lat/lon out of range");
    if (!r.description) fail(r, "empty description");
    if (/[—–]/.test(r.description + r.imageAttribution)) fail(r, "dash in text");
    if (!/[.!?]["”’)]?$/.test(r.description)) fail(r, "description does not end with punctuation");
    if (r.imageAttribution && !r.imageAttribution.startsWith("Photo: ")) fail(r, "bad imageAttribution");
    if (!r.wiki && !/^(node|way|relation)\/\d+$/.test(r.osm ?? "")) fail(r, "no description source");
    if (!DOCK_TYPES.includes(r.dockType)) fail(r, "bad dockType");
    if (!ORIENTATIONS.includes(r.imageOrientation)) fail(r, "bad imageOrientation");
    if (!CONTINENTS.includes(r.continentSlug)) fail(r, "bad continentSlug");
    if (r.stateProvince === r.country || r.settlement === r.country) fail(r, "state/settlement equals country");
  }
}
validate(out);

const target = new URL("../src/catalogue.json", import.meta.url);
await writeFile(target, JSON.stringify(out));
const listed = await writeUploadList(out.filter((r) => r.imageAttribution).map((r) => r.slug));
const counts = {};
for (const r of out) counts[r.dockType] = (counts[r.dockType] ?? 0) + 1;
console.log(out.length, "docks ->", fileURLToPath(target));
console.log("by type:", counts, "dropped:", dropped, "upload list:", listed);
