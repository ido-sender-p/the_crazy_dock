// For each settlement in the catalogue, fetches the first two sentences of its Wikipedia article (text is CC BY-SA,
// credited on the dock page). A dock only gets a blurb when a Wikipedia article within 15 km has exactly the settlement's
// name (ignoring a bracketed qualifier), so a wrong town is never described. Resumable: results are cached in
// scripts/data/place-blurbs.json (git-ignored), including the misses. Usage: node scripts/fetch-place-blurbs.mjs
import { readFile, writeFile } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";

const UA = "WildockBot/0.1 (https://wildock.com; idosender1@gmail.com)";
const API = "https://en.wikipedia.org/w/api.php";
const CACHE = new URL("./data/place-blurbs.json", import.meta.url);
const rows = JSON.parse(await readFile(new URL("../src/catalogue.json", import.meta.url), "utf8"));
const cache = await readFile(CACHE, "utf8").then(JSON.parse, () => ({}));

const norm = (s) => s.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, " ").trim();
async function get(params) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(`${API}?format=json&origin=*&${new URLSearchParams(params)}`, { headers: { "User-Agent": UA } });
      if (r.ok) return await r.json();
    } catch { /* retry */ }
    await sleep(1500 * (i + 1));
  }
  return null;
}

// one lookup per settlement, using the first dock found there
const todo = new Map();
for (const d of rows) {
  if (!d.settlement) continue;
  const key = `${d.settlement}|${d.country}`;
  if (!(key in cache) && !todo.has(key)) todo.set(key, d);
}
console.log(`${todo.size} settlements to look up (${Object.keys(cache).length} cached)`);

let n = 0;
for (const [key, d] of todo) {
  const geo = await get({ action: "query", list: "geosearch", gscoord: `${d.lat}|${d.lon}`, gsradius: "10000", gslimit: "50" });
  await sleep(120);
  const want = norm(d.settlement);
  const hit = (geo?.query?.geosearch ?? []).find((p) => norm(p.title) === want);
  let entry = null;
  if (hit) {
    const x = await get({ action: "query", prop: "extracts", exintro: "1", explaintext: "1", exsentences: "2", redirects: "1", pageids: String(hit.pageid) });
    await sleep(120);
    const text = Object.values(x?.query?.pages ?? {})[0]?.extract?.replace(/\s+/g, " ").trim();
    if (text && text.length >= 60 && !/may refer to|disambiguation/i.test(text)) entry = { title: hit.title, text: text.slice(0, 600) };
  }
  cache[key] = entry;
  if (++n % 25 === 0) { await writeFile(CACHE, JSON.stringify(cache)); console.log(`${n}/${todo.size}`); }
}
await writeFile(CACHE, JSON.stringify(cache));
const found = Object.values(cache).filter(Boolean).length;
console.log(`done: ${found} blurbs of ${Object.keys(cache).length} settlements`);
