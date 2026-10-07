import { Layout } from "../components/layout";
import type { Dock } from "../data";
import { CardThumb } from "../components/card";
import { placeLabel } from "../lib/places";

export function CategoryPage(opts: {
  title: string;
  intro: string;
  path: string;
  matches: Dock[];
}) {
  return (
    <Layout page="category" title={`${opts.title} | Wildock`} description={opts.intro} path={opts.path}>
      <div class="wrap cat-page">
        <nav class="breadcrumb">
          <a href="/">Wildock</a> / {opts.title}
        </nav>
        <h1>{opts.title}</h1>
        <p class="intro">{opts.intro}</p>
        {opts.matches.length > 0 ? (
          <div class="list">
            {opts.matches.map((d, i) => (
              <a href={`/docks/${d.slug}`}>
                <CardThumb src={d.imageUrl} priority={i < 4} />
                <div class="copy">
                  <h3>{d.name}</h3>
                  <p>{placeLabel(d.settlement, d.country)}</p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div class="empty">No docks documented here yet. The catalogue is growing daily.</div>
        )}
      </div>
    </Layout>
  );
}
