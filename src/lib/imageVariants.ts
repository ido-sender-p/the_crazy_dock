// Catalogue photos live in R2 and are served from IMG_ORIGIN (a CDN-cached custom domain). Two ways to get a smaller size:
//   - pre-made files: dock-<slug>.w640 and dock-<slug>.w1280, written by scripts/make-variants.mjs (Greece and the first 335 docks);
//   - Cloudflare Images: docks flagged `tx` have only the original in R2, and the card size is made on demand through
//     /cdn-cgi/image (free plan: 5,000 unique transformations a month, so only the card size is transformed; the
//     top-of-page photo is the original).
// Anything else (user uploads, the hand-written Capri photo) is returned unchanged, same-origin.
import { IMG_ORIGIN } from "./site";
import { docks } from "../data";

const CATALOGUE_PHOTO = /^\/uploads\/(dock-[A-Za-z0-9_-]+)$/;
const TRANSFORMED = new Set(docks.filter((d) => d.imageTransform).map((d) => `dock-${d.slug}`));

export function photoVariant(url: string, size: "w640" | "w1280" | "full"): string {
  const key = CATALOGUE_PHOTO.exec(url)?.[1];
  if (!key) return url;
  if (TRANSFORMED.has(key)) {
    if (size !== "w640") return `${IMG_ORIGIN}/${key}`;
    // metadata=none: drop EXIF from the resized copy (the default keeps copyright data)
    return `/cdn-cgi/image/width=640,quality=75,format=auto,metadata=none/${IMG_ORIGIN}/${key}`;
  }
  return `${IMG_ORIGIN}/${key}${size === "full" ? "" : `.${size}`}`;
}
