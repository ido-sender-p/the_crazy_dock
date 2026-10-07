import { Layout } from "../components/layout";
import type { Dock } from "../data";
import { CardThumb } from "../components/card";
import { placeLabel } from "../lib/places";
import { PlaceGrid, ListNote, featuredFirst, LIST_LIMIT, type Place } from "../components/places";

export function CategoryPage(opts: {
  title: string;
  intro: string;
  path: string;
  matches: Dock[];
  // Regions or settlements inside this page, shown as a grid when the page holds too many docks to list at once.
  places?: { title: string; items: Place[]; sea: string };
}) {
  const crowded = !!opts.places && opts.places.items.length > 0 && opts.matches.length > LIST_LIMIT;
  const shown = crowded ? featuredFirst(opts.matches) : opts.matches;
  return (
    <Layout page="category" title={`${opts.title} | Wildock`} description={opts.intro} path={opts.path}>
      <div class="wrap cat-page">
        <nav class="breadcrumb">
          <a href="/">Wildock</a> / {opts.title}
        </nav>
        <h1>{opts.title}</h1>
        <p class="intro">{opts.intro}</p>
        {crowded && opts.places && <PlaceGrid title={opts.places.title} places={opts.places.items} sea={opts.places.sea} />}
        {opts.matches.length > 0 ? (
          <>
          <div class="list">
            {shown.map((d, i) => (
              <a href={`/docks/${d.slug}`}>
                <CardThumb src={d.imageUrl} priority={i < 4} />
                <div class="copy">
                  <h3>{d.name}</h3>
                  <p>{placeLabel(d.settlement, d.country)}</p>
                </div>
              </a>
            ))}
          </div>
          <ListNote shown={shown.length} total={opts.matches.length} hint="Pick a place above to see them all." />
          </>
        ) : (
          <div class="empty">No docks documented here yet. The catalogue is growing daily.</div>
        )}
      </div>
    </Layout>
  );
}
