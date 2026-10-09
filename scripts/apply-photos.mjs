// Applies reviewed photo candidates (from find-photos.mjs / find-photos-deep.mjs) to scripts/data/docks.json:
// downloads each 1600px file and records the Commons credit. Usage: node scripts/apply-photos.mjs slug [slug...]
// Only slugs you name are applied, so every photo is one somebody has looked at. Run `npm run catalogue:build` afterwards.
import { readFile, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { download } from "./import-wikidata.mjs";

const DATA = new URL("./data/", import.meta.url);
const slugs = process.argv.slice(2);
const cands = {};
for (const f of ["photo-candidates.json", "photo-candidates-deep.json"]) {
  const j = await readFile(new URL(f, DATA), "utf8").then(JSON.parse, () => ({}));
  for (const [s, v] of Object.entries(j)) cands[s] = [...(cands[s] ?? []), ...v];
}
const [slugOnly, wanted] = [new Map(), new Map()];
for (const a of slugs) { const [s, t] = a.split("="); slugOnly.set(s, true); if (t) wanted.set(s, t); }

const docksUrl = new URL("docks.json", DATA);
const docks = JSON.parse(await readFile(docksUrl, "utf8"));
const backup = new URL("docks.backup-pre-photos.json", DATA);
if (!existsSync(backup)) await copyFile(docksUrl, backup);

let applied = 0;
for (const s of slugOnly.keys()) {
  const d = docks.find((x) => x.slug === s);
  const list = cands[s] ?? [];
  const c = wanted.has(s) ? list.find((x) => x.title === `File:${wanted.get(s)}`) : list[0];
  if (!d || !c) { console.log("skip", s, d ? "no candidate" : "no dock"); continue; }
  const ext = /\.png$/i.test(c.title) ? "png" : "jpg";
  const imageFile = `osm-${d.qid.replace(/^osm:/, "").replace("/", "-")}.${ext}`;
  if (!existsSync(new URL(`images/${imageFile}`, DATA)) && !(await download(c.thumb, new URL(`images/${imageFile}`, DATA)))) { console.log("download failed", s); continue; }
  d.imageFile = imageFile;
  d.imageAttribution = `Photo: ${c.author}, ${c.license}, via Wikimedia Commons|${c.commonsUrl}`;
  d.imageOrientation = c.height > c.width ? "portrait" : "landscape";
  applied++; console.log("ok", s, "<-", c.title);
}
await writeFile(docksUrl, JSON.stringify(docks, null, 2));
console.log(`applied ${applied} photos`);
