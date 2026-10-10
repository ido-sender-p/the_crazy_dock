// The R2 keys the catalogue needs and where each file lives locally, shared by r2-sync.mjs and verify-live.mjs.
// Keys: `dock-<slug>` (the original) and, for rows without `tx`, `dock-<slug>.w640` and `.w1280` (made by make-variants.mjs).
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = new URL("../../", import.meta.url);
export const LIVE = "https://img.wildock.com/";

export async function wantedKeys() {
  const catalogue = JSON.parse(await readFile(new URL("src/catalogue.json", ROOT), "utf8"));
  const listed = new Map((await readFile(new URL("scripts/data/r2-upload-list.txt", ROOT), "utf8")).split("\n").filter(Boolean).map((l) => l.split("\t")));
  const want = [];
  for (const d of catalogue) {
    if (!d.imageAttribution) continue;
    const key = `dock-${d.slug}`;
    const file = listed.get(key);
    if (!file) continue;
    want.push({ key, file, type: /\.png$/i.test(file) ? "image/png" : "image/jpeg", slug: d.slug, tx: d.tx === 1 });
    if (d.tx !== 1) for (const w of ["w640", "w1280"]) want.push({ key: `${key}.${w}`, file: fileURLToPath(new URL(`scripts/data/variants/${d.slug}.${w}.jpg`, ROOT)), type: "image/jpeg", slug: d.slug, tx: false });
  }
  return want;
}

// HEAD every url, `limit` at a time; returns the ones that did not answer 200.
export async function notLive(items, urlOf, limit = 8) {
  const bad = [];
  let i = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const it = items[i++];
      const status = await fetch(urlOf(it), { method: "HEAD" }).then((r) => r.status, () => 0);
      if (status !== 200) bad.push({ ...it, status });
    }
  }));
  return bad;
}

export const localFileExists = (p) => existsSync(p);
