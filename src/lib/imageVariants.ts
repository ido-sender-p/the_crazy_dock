// Catalogue photos exist in R2 as the original (dock-<slug>) plus resized JPEGs written by
// scripts/make-variants.mjs (dock-<slug>.w640, dock-<slug>.w1280), all served from IMG_ORIGIN.
// Anything else (user uploads, the hand-written Capri photo) is returned unchanged, same-origin.
import { IMG_ORIGIN } from "./site";

const CATALOGUE_PHOTO = /^\/uploads\/(dock-[A-Za-z0-9_-]+)$/;

export function photoVariant(url: string, size: "w640" | "w1280" | "full"): string {
  const key = CATALOGUE_PHOTO.exec(url)?.[1];
  if (!key) return url;
  return `${IMG_ORIGIN}/${key}${size === "full" ? "" : `.${size}`}`;
}
