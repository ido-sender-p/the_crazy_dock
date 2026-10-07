// Makes the smaller photo sizes that pages actually display, next to the original:
//   <slug>.w640.jpg   card thumbnails (about 30-60 KB)
//   <slug>.w1280.jpg  the photo at the top of a dock page and the featured card (about 120-250 KB)
// The original stays for the full-size lightbox. Output goes to scripts/data/variants/ (git-ignored); upload each as the
// R2 key `dock-<slug>.w640` / `dock-<slug>.w1280`. Needs the `sharp` dev dependency.
import { mkdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import sharp from "sharp";
import { imagePathsBySlug } from "./lib/images.mjs";

const OUT = new URL("./data/variants/", import.meta.url);
const SIZES = [
  { name: "w640", width: 640, quality: 74 },
  { name: "w1280", width: 1280, quality: 78 },
];

await mkdir(OUT, { recursive: true });
const catalogue = JSON.parse(await readFile(new URL("../src/catalogue.json", import.meta.url), "utf8"));
const paths = await imagePathsBySlug();
let n = 0, srcBytes = 0, outBytes = { w640: 0, w1280: 0 };
for (const { slug, imageAttribution } of catalogue) {
  if (!imageAttribution) continue; // dock without a photo yet
  if (SIZES.every(({ name }) => existsSync(new URL(`${slug}.${name}.jpg`, OUT)))) continue; // already made
  const src = paths.get(slug);
  if (!src || !existsSync(src)) { console.log("missing source", slug); continue; }
  srcBytes += (await stat(src)).size;
  for (const { name, width, quality } of SIZES) {
    const file = new URL(`${slug}.${name}.jpg`, OUT);
    // .rotate() bakes in any EXIF orientation; re-encoding drops all metadata.
    await sharp(src).rotate().resize({ width, withoutEnlargement: true }).jpeg({ quality, progressive: true, mozjpeg: true }).toFile(file.pathname.replace(/^\/([A-Za-z]:)/, "$1"));
    outBytes[name] += (await stat(file)).size;
  }
  if (++n % 50 === 0) console.log(`${n}/${catalogue.length}`);
}
const mb = (b) => (b / 1e6).toFixed(0) + " MB";
console.log(`${n} photos. originals ${mb(srcBytes)}, w1280 ${mb(outBytes.w1280)}, w640 ${mb(outBytes.w640)}`);
