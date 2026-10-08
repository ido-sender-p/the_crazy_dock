// Adds an `ab` field ("About" extras) to src/catalogue.json. Run it after build-catalogue.mjs (which rewrites the file).
// Only verified facts are used: the cached OpenStreetMap tags of each dock (scripts/data/osm-*.json) plus the length and
// year already in the catalogue, and the Wikipedia blurb of the settlement from fetch-place-blurbs.mjs (`pb`, credited via `pt`). Nothing is invented: a dock without extra facts simply gets no extras.
import { readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const DATA = new URL("./data/", import.meta.url);
const CATALOGUE = new URL("../src/catalogue.json", import.meta.url);

const tagsById = new Map();
for (const f of (await readdir(DATA)).filter((f) => /^osm-[A-Z]{2}\.json$/.test(f))) {
  const j = JSON.parse(await readFile(new URL(f, DATA), "utf8"));
  for (const e of j.elements ?? j) tagsById.set(e.id, e.tags ?? {});
}

// Wikipedia leads start with a bracket of pronunciations and native spellings; keep the sentence, drop the bracket.
const noPron = (t) => t.replace(/\s*\([^()]*(?:\[|pronounced|\b(?:UK|US|Turkish|Welsh|Spanish|Japanese|Greek|Italian|French|German|Latin):|[^\x20-\x7e])[^()]*\)/, "");
const yes = (v) => /^(yes|true)$/i.test(v ?? "");
const safeHours = (v) => (v && v.length <= 70 && /^[\x20-\x7e]+$/.test(v) ? v : "");

function extras(d, t) {
  const out = [];
  const cats = (t["seamark:harbour:category"] ?? "").split(";");
  const ferry = yes(t.ferry) || t.amenity === "ferry_terminal" || cats.includes("ferry");
  if (ferry) out.push("Ferries call here, so you can catch a boat from this spot.");
  if (cats.includes("fishing") || t.harbour === "fishing") out.push("It is a working fishing harbour.");
  if (cats.includes("cargo") || cats.includes("tanker")) out.push("It handles cargo ships.");
  if (cats.includes("passenger") && !ferry) out.push("Passenger ships use it.");
  if (yes(t.floating)) out.push("The structure floats on the water.");
  if (t.surface === "wood") out.push("The walking surface is wood.");
  if (yes(t.lit)) out.push("It is lit at night.");
  if (yes(t.power_supply)) out.push("Shore power is available.");
  else if (t.power_supply === "no") out.push("There is no shore power.");
  if (["yes", "wlan", "wifi"].includes(t.internet_access)) out.push("Wi-Fi is available.");
  if (t.wheelchair === "yes") out.push("Wheelchair access is available.");
  else if (t.wheelchair === "limited") out.push("Wheelchair access is limited.");
  const hours = safeHours(t.opening_hours);
  if (hours) out.push(`Opening hours listed on OpenStreetMap: ${hours}.`);
  if (d.lengthM > 0) out.push(`It is about ${d.lengthM} m long.`);
  if (d.yearBuilt) out.push(`It dates from ${d.yearBuilt}.`);
  return out.join(" ");
}

const blurbs = await readFile(new URL("place-blurbs.json", DATA), "utf8").then(JSON.parse, () => ({}));
const rows = JSON.parse(await readFile(CATALOGUE, "utf8"));
let withExtras = 0, withBlurb = 0;
for (const d of rows) {
  const text = extras(d, tagsById.get(d.osm) ?? {});
  if (text) { d.ab = text; withExtras++; } else delete d.ab;
  const b = blurbs[`${d.settlement}|${d.country}`];
  // a blurb whose pronunciation bracket could not be removed cleanly (nested brackets) is left out rather than shown messy
  const blurb = b && noPron(noPron(b.text)).replace(/\s*—\s*/g, ", ");
  if (blurb && !/\[|pronounced/.test(blurb)) { d.pb = blurb; d.pt = b.title; withBlurb++; } else { delete d.pb; delete d.pt; }
}
await writeFile(CATALOGUE, JSON.stringify(rows));
console.log(`about extras: ${withExtras}, place blurbs: ${withBlurb}, of ${rows.length} docks`);
