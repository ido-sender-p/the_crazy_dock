// Counts what is around each catalogue dock from OpenStreetMap (Overpass API, ODbL) and caches the
// result in scripts/data/nearby.json, keyed by slug. Resumable: slugs already cached are skipped.
//   node scripts/enrich-nearby.mjs            all docks in src/catalogue.json
//   node scripts/enrich-nearby.mjs slug1 ...  only these
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const UA = "WildockBot/0.1 (https://wildock.com; idosender1@gmail.com)";
// The main instance is often overloaded; these are tried in rotation on failure.
const ENDPOINTS = ["https://overpass.private.coffee/api/interpreter", "https://overpass-api.de/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter"];
const CACHE = new URL("./data/nearby.json", import.meta.url);
const WALK = 1000; // metres for everyday places
const FAR = 2500; // metres for malls and big attractions

const catalogue = JSON.parse(await readFile(new URL("../src/catalogue.json", import.meta.url), "utf8"));
const cache = existsSync(CACHE) ? JSON.parse(await readFile(CACHE, "utf8")) : {};
const only = process.argv.slice(2);
const todo = catalogue.filter((d) => (only.length ? only.includes(d.slug) : !cache[d.slug]));

// One light request per dock; the counting happens here. Elements are capped at CAP, so a very busy
// waterfront reports "CAP+" rather than an exact figure.
const CAP = 500;
function query(lat, lon) {
  const a = (r) => `(around:${r},${lat},${lon})`;
  return `[out:json][timeout:60];
(
  nwr["amenity"~"^(restaurant|cafe|bar|pub|fast_food|ice_cream|biergarten)$"]${a(WALK)};
  nwr["tourism"~"^(hotel|hostel|guest_house|apartment|motel|resort|attraction|museum|gallery|viewpoint|theme_park|aquarium|zoo)$"]${a(WALK)};
  nwr["shop"]${a(WALK)};
  nwr["historic"]${a(WALK)};
  nwr["natural"="beach"]${a(WALK * 1.5)};
  nwr["railway"~"^(station|halt)$"]${a(WALK * 1.5)};
  nwr["amenity"="ferry_terminal"]${a(FAR)};
  nwr["shop"="mall"]${a(FAR)};
);
out tags ${CAP};`;
}

async function run(q) {
  for (let i = 0; i < 6; i++) {
    const url = ENDPOINTS[i % ENDPOINTS.length];
    try {
      const r = await fetch(url, { method: "POST", headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ data: q }), signal: AbortSignal.timeout(45000) });
      if (r.ok) return await r.json();
      if (r.status === 429 || r.status >= 500) { await sleep(4000 * (i + 1)); continue; }
      return null;
    } catch { await sleep(2000 * (i + 1)); }
  }
  return null;
}

let done = 0;
for (const d of todo) {
  const j = await run(query(d.lat, d.lon));
  if (!j || j.remark) { console.log("FAIL", d.slug, j?.remark ?? ""); continue; }
  const els = j.elements.map((e) => e.tags ?? {});
  const n = (pred) => els.filter(pred).length;
  const names = (pred) => [...new Set(els.filter(pred).map((t) => t.name).filter(Boolean))];
  const food = /^(restaurant|cafe|bar|pub|fast_food|ice_cream|biergarten)$/;
  const stay = /^(hotel|hostel|guest_house|apartment|motel|resort)$/;
  const sight = /^(attraction|museum|gallery|viewpoint|theme_park|aquarium|zoo)$/;
  cache[d.slug] = {
    capped: els.length >= CAP,
    food: n((t) => food.test(t.amenity ?? "")),
    stay: n((t) => stay.test(t.tourism ?? "")),
    shops: n((t) => t.shop && t.shop !== "mall"),
    sights: n((t) => sight.test(t.tourism ?? "")),
    historic: n((t) => t.historic),
    beach: n((t) => t.natural === "beach"),
    station: n((t) => t.railway),
    ferry: n((t) => t.amenity === "ferry_terminal"),
    malls: names((t) => t.shop === "mall").slice(0, 3),
    landmarks: names((t) => t.tourism === "attraction" || t.tourism === "museum").slice(0, 4),
  };
  if (++done % 10 === 0) { await writeFile(CACHE, JSON.stringify(cache)); console.log(`${done}/${todo.length}`); }
  await sleep(1500);
}
await writeFile(CACHE, JSON.stringify(cache));
console.log("cached", Object.keys(cache).length);
