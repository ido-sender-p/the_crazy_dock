// Browsing helpers for pages that can hold hundreds of docks: a grid of places (regions or settlements) with their dock
// counts, and a cap on the card list so a page never renders a thousand cards.
import { seaClass } from "../styles/sea";
import type { Dock } from "../data";
import { SETTLEMENT_PATH } from "../lib/places";

export type Place = { name: string; href: string; count: number };

// Cards shown on a listing before it switches to "pick a place" (or just stops).
export const LIST_LIMIT = 48;

export function placesIn(list: Dock[], by: "settlement" | "region"): Place[] {
  const map = new Map<string, Place>();
  for (const d of list) {
    const name = by === "settlement" ? d.settlement : d.stateProvince;
    const slug = by === "settlement" ? d.settlementSlug : d.stateProvinceSlug;
    if (!name || !slug) continue;
    const href = by === "settlement" ? `/${SETTLEMENT_PATH[d.settlementType]}/${slug}` : `/regions/${slug}`;
    const p = map.get(href);
    if (p) p.count++;
    else map.set(href, { name, href, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// Docks with a photo first (stable within each group), cut to the limit.
export function featuredFirst(list: Dock[], n = LIST_LIMIT): Dock[] {
  return [...list.filter((d) => d.imageUrl), ...list.filter((d) => !d.imageUrl)].slice(0, n);
}

export function PlaceGrid({ title, places, sea }: { title: string; places: Place[]; sea: string }) {
  if (places.length === 0) return null;
  return (
    <>
      <div class="sea-head first">
        <i class={`sea-dot ${seaClass(sea)}`} aria-hidden="true" />
        {title} <span class="count">· {places.length}</span>
      </div>
      <div class="card-grid">
        {places.map((p) => (
          <a class="wave-card" href={p.href}>
            <span class="name">
              {p.name} <span class="count">· {p.count}</span>
            </span>
            <span class={`wave ${seaClass(sea)}`} />
          </a>
        ))}
      </div>
    </>
  );
}

export function ListNote({ shown, total, hint }: { shown: number; total: number; hint: string }) {
  if (shown >= total) return null;
  return <p class="list-note">Showing {shown} of {total} docks. {hint}</p>;
}
