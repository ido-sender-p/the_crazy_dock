import { Layout } from "../layout";
import type { Dock } from "../data";
import { raw } from "hono/html";

const PAGE_CSS = `
  .cat-page { padding: 40px 0 80px; }
  .cat-page h1 { font-size: 2rem; }
  .cat-page p.intro { color: var(--ink-soft); max-width: 640px; }
  .list { display: grid; gap: 16px; margin-top: 28px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
  .list a {
    display: block; background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    overflow: hidden; text-decoration: none; color: var(--ink);
  }
  .list img { width: 100%; height: 140px; object-fit: cover; display: block; }
  .list .copy { padding: 14px; }
  .list h3 { font-size: 1rem; margin: 0 0 4px; }
  .list p { margin: 0; font-size: 0.85rem; color: var(--ink-soft); }
  .empty { margin-top: 28px; padding: 28px; border: 1px dashed var(--border); border-radius: 12px; color: var(--ink-soft); }
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
                <img src={d.imageUrl} alt={d.name} />
                <div class="copy">
                  <h3>{d.name}</h3>
                  <p>{d.settlement}, {d.country}</p>
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
