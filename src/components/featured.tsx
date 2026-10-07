// The "Pick of the week" card, shared by the home page and the map page. Today the pick is the first catalogue dock.
import { docks } from "../data";
import { placeLabel } from "../lib/places";
import { photoVariant } from "../lib/imageVariants";

export const featuredDock = docks[0];

export function FeaturedCard() {
  const featured = featuredDock;
  if (!featured) return null;
  const desc = featured.description.length > 160 ? `${featured.description.slice(0, 160)}…` : featured.description;
  return (
    <a class="featured-card" href={`/docks/${featured.slug}`}>
      {featured.imageUrl ? (
        <img src={photoVariant(featured.imageUrl, "w1280")} alt="" width={640} height={420} loading="lazy" decoding="async" />
      ) : (
        <div class="thumb-ph" aria-hidden="true" />
      )}
      <div class="copy">
        <span class="tag">{placeLabel(featured.settlement, featured.country)}</span>
        <h3>{featured.name}</h3>
        <p>{desc}</p>
      </div>
    </a>
  );
}
