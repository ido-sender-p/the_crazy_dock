// Maps catalogue slugs to local photo files (scripts/data/images) via docks.json.
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { imageFileOf } from "./clean.mjs";

const DATA = new URL("../data/", import.meta.url);

export async function imagePathsBySlug() {
  const all = JSON.parse(await readFile(new URL("docks.json", DATA), "utf8"));
  return new Map(all.map((d) => [d.slug, fileURLToPath(new URL(`images/${imageFileOf(d)}`, DATA))]));
}

// One "dock-<slug>\t<local path>" line per catalogue dock whose photo exists.
export async function writeUploadList(slugs) {
  const paths = await imagePathsBySlug();
  const lines = [];
  for (const s of slugs) {
    const p = paths.get(s);
    if (p && existsSync(p)) lines.push(`dock-${s}\t${p}`);
  }
  await writeFile(new URL("r2-upload-list.txt", DATA), lines.join("\n") + "\n");
  return lines.length;
}
