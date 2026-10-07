import { photoVariant } from "../lib/imageVariants";

// Card thumbnail for the shared .list grid: the name sits in the adjacent heading, so the image is decorative; a neutral
// block stands in when a dock has no photo.

// `priority` is for the first cards of a page whose main content is the list: they load eagerly and
// first, since they are the likely largest contentful paint. Everything else stays lazy.
export function CardThumb({ src, priority = false }: { src: string; priority?: boolean }) {
  return src ? (
    <img src={photoVariant(src, "w640")} alt="" width={400} height={140} loading={priority ? "eager" : "lazy"} fetchpriority={priority ? "high" : undefined} decoding="async" />
  ) : (
    <div class="thumb-ph" aria-hidden="true" />
  );
}
