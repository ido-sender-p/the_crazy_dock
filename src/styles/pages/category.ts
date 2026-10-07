// Styles for the category page only. Served as /assets/page-category.<hash>.css and linked by Layout (page="category").
import { seaCss } from "../sea";

export const categoryCss = `
  .cat-page { padding-block: clamp(2.5rem, 6vw, 4.5rem) clamp(4rem, 9vw, 7rem); max-width: calc(var(--page-max) + 2 * var(--gutter)); }
  .cat-page .breadcrumb, .cat-page h1, .cat-page p.intro { text-align: center; }
  .cat-page p.intro { margin-inline: auto; }

  .cat-page p.intro { color: var(--ink-soft); max-width: 40rem; }
  .cat-page .empty { margin-top: 28px; padding: 28px; font-size: 1rem; }

  .wave-card .wave {
    position: absolute; left: -1px; right: -1px; bottom: -11px; height: 14px;
    background-repeat: repeat-x; background-size: 40px 14px;
  }
` + "\n" + seaCss;
