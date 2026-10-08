// Step 1 of adding a country from OpenStreetMap (for places Wikidata/Wikipedia barely cover, e.g. Greece):
// downloads candidate marinas, harbours, ferry terminals and named piers via Overpass and caches them in
// scripts/data/osm-<ISO>.json. Usage: node scripts/import-osm.mjs GR CY
// Codes: an ISO 3166-1 country (GR) or an ISO 3166-2 region (US-FL). (c) OpenStreetMap contributors, ODbL. Resumable (cached files are reused); nothing is written to D1 or R2.
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const UA = "WildockBot/0.1 (https://wildock.com; idosender1@gmail.com)";
const ENDPOINTS = ["https://overpass.private.coffee/api/interpreter", "https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter"];

const FILTERS = `
  nwr["leisure"="marina"]%S;
  nwr["harbour"="yes"]%S;
  nwr["seamark:type"="harbour"]%S;
  nwr["amenity"="ferry_terminal"]%S;
  nwr["man_made"="pier"]["name"]%S;
  nwr["landuse"="port"]["name"]%S;`;
const areaQuery = (iso) => `[out:json][timeout:280];
area["${iso.includes("-") ? "ISO3166-2" : "ISO3166-1"}"="${iso}"]->.a;
(${FILTERS.replaceAll("%S", "(area.a)")}
);
out center tags;`;
const bboxQuery = (b) => `[out:json][timeout:120];
(${FILTERS.replaceAll("%S", `(${b.join(",")})`)}
);
out center tags;`;

// Whole states are too heavy for the public servers in one request: Florida is fetched as a grid of boxes
// (the box also covers neighbouring land and sea; enrich-osm.mjs keeps only places whose reverse geocode says Florida).
function florida() {
  const tiles = [];
  for (let lat = 24.3; lat < 31.1; lat += 1.2) for (let lon = -87.7; lon < -79.8; lon += 1.5) tiles.push([+lat.toFixed(1), +lon.toFixed(1), +(lat + 1.2).toFixed(1), +(lon + 1.5).toFixed(1)]);
  return tiles;
}

async function overpassQuery(q, label) {
  for (let round = 0; round < 1; round++) {
    for (const ep of ENDPOINTS) {
      try {
        const r = await fetch(ep, { method: "POST", body: "data=" + encodeURIComponent(q), headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" }, signal: AbortSignal.timeout(300000) });
        if (!r.ok) { console.log(label, ep, "HTTP", r.status); continue; }
        const j = await r.json();
        if (j.elements) return j.elements;
      } catch (e) { console.log(label, ep, String(e).slice(0, 80)); }
    }
    await sleep(20000 * (round + 1));
  }
  throw new Error("Overpass failed for " + label);
}

async function overpass(iso) {
  if (iso !== "US-FL") return overpassQuery(areaQuery(iso), iso);
  // Each box is cached in osm-tiles/, so a rerun only fetches the boxes that are still missing; a failed box does not stop the others.
  await mkdir(new URL("./data/osm-tiles/", import.meta.url), { recursive: true });
  const seen = new Map();
  let failed = 0;
  // A box the servers cannot answer is split into four and retried (down to about 0.15 degrees), so dense coasts still get through.
  const tile = async (b, depth = 0) => {
    const file = new URL(`./data/osm-tiles/FL-${b.join("_")}.json`, import.meta.url);
    if (existsSync(file)) return JSON.parse(await readFile(file, "utf8"));
    try {
      const els = await overpassQuery(bboxQuery(b), `US-FL ${b}`);
      await writeFile(file, JSON.stringify(els));
      return els;
    } catch {
      if (depth >= 3) { failed++; console.log("US-FL tile failed, rerun later:", b.join(",")); return []; }
      const [s0, w0, n0, e0] = b, ms = +((s0 + n0) / 2).toFixed(3), mw = +((w0 + e0) / 2).toFixed(3);
      const parts = [[s0, w0, ms, mw], [s0, mw, ms, e0], [ms, w0, n0, mw], [ms, mw, n0, e0]];
      const out = [], failedBefore = failed;
      for (const p of parts) out.push(...(await tile(p, depth + 1)));
      if (failed === failedBefore) await writeFile(file, JSON.stringify(out)); // cached as complete only if every part answered
      return out;
    }
  };
  for (const b of florida()) {
    for (const e of await tile(b)) seen.set(`${e.type}/${e.id}`, e);
    console.log("US-FL box", b.join(","), "total so far", seen.size);
  }
  if (failed) throw new Error(`${failed} Florida boxes still missing`);
  return [...seen.values()];
}

for (const iso of process.argv.slice(2)) {
  const file = new URL(`./data/osm-${iso}.json`, import.meta.url);
  if (existsSync(file)) { console.log(iso, "cached"); continue; }
  let els;
  try { els = await overpass(iso); } catch (e) { console.log(iso, "FAILED, rerun later:", String(e).slice(0, 80)); continue; }
  const rows = els.map((e) => ({ id: `${e.type}/${e.id}`, lat: e.lat ?? e.center?.lat, lon: e.lon ?? e.center?.lon, tags: e.tags ?? {} })).filter((r) => r.lat != null);
  await writeFile(file, JSON.stringify(rows));
  console.log(iso, rows.length, "elements");
}
