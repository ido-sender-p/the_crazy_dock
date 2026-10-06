// Copies catalogue photos from scripts/data/images into the LOCAL R2 (the .wrangler/state
// `wrangler dev` uses) so the local preview shows them. Production upload is separate:
//   wrangler r2 object put wildock-photos/dock-<slug> --file=... --remote
// scripts/data/r2-upload-list.txt lists every dock-<slug> key and its local file for that.
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { getPlatformProxy } from "wrangler";
import { imagePathsBySlug, writeUploadList } from "./lib/images.mjs";

const docks = JSON.parse(await readFile(new URL("../src/catalogue.json", import.meta.url), "utf8"));
const paths = await imagePathsBySlug();
const listed = await writeUploadList(docks.map((d) => d.slug));
console.log(`wrote scripts/data/r2-upload-list.txt (${listed} keys)`);

const { env, dispose } = await getPlatformProxy({
  configPath: fileURLToPath(new URL("../wrangler.toml", import.meta.url)),
});
let n = 0;
for (const d of docks) {
  const path = paths.get(d.slug);
  if (!path || !existsSync(path)) { console.warn(`skip ${d.slug}: image file missing`); continue; }
  const bytes = await readFile(path);
  const png = bytes[0] === 0x89 && bytes[1] === 0x50;
  await env.PHOTOS.put(`dock-${d.slug}`, bytes, { httpMetadata: { contentType: png ? "image/png" : "image/jpeg" } });
  if (++n % 50 === 0) console.log(`${n}/${docks.length}`);
}
console.log(`local R2: ${n} photos`);
await dispose();
