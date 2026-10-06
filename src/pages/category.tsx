import { Layout } from "../layout";
import type { Dock } from "../data";
import { raw } from "hono/html";
import { CardThumb, placeLabel } from "./shared";

const PAGE_CSS = `
  .cat-page { padding: clamp(2.5rem, 6vw, 4.5rem) 0 clamp(4rem, 9vw, 7rem); }
  .cat-page .breadcrumb, .cat-page h1, .cat-page p.intro { text-align: center; }
  .cat-page p.intro { margin-inline: auto; }

  .cat-page p.intro { color: var(--ink-soft); max-width: 40rem; }
  .cat-page .empty { margin-top: 28px; padding: 28px; font-size: 1rem; }
`;

export function CategoryPage(opts: {
  title: string;
  intro: string;
  path: string;
  matches: Dock[];
}) {
  return (
    <Layout title={`${opts.title} | Wildock`} description={opts.intro} path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap cat-page">
        <nav class="breadcrumb">
          <a href="/">Wildock</a> / {opts.title}
        </nav>
        <h1>{opts.title}</h1>
        <p class="intro">{opts.intro}</p>
        {opts.matches.length > 0 ? (
          <div class="list">
            {opts.matches.map((d) => (
              <a href={`/docks/${d.slug}`}>
                <CardThumb src={d.imageUrl} />
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
