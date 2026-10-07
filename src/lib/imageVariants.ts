// Catalogue photos exist in R2 as the original (dock-<slug>) plus resized JPEGs written by
// scripts/make-variants.mjs (dock-<slug>.w640, dock-<slug>.w1280). Anything else (user uploads,
// the hand-written Capri photo) has no variants and is returned unchanged.
const CATALOGUE_PHOTO = /^\/uploads\/dock-[A-Za-z0-9_-]+$/;

export function photoVariant(url: string, size: "w640" | "w1280"): string {
  return CATALOGUE_PHOTO.test(url) ? `${url}.${size}` : url;
}
