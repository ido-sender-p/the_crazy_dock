// Styles for the category page only. Served as /assets/page-category.<hash>.css and linked by Layout (page="category").
export const categoryCss = `
  .cat-page { padding: clamp(2.5rem, 6vw, 4.5rem) 0 clamp(4rem, 9vw, 7rem); }
  .cat-page .breadcrumb, .cat-page h1, .cat-page p.intro { text-align: center; }
  .cat-page p.intro { margin-inline: auto; }

  .cat-page p.intro { color: var(--ink-soft); max-width: 40rem; }
  .cat-page .empty { margin-top: 28px; padding: 28px; font-size: 1rem; }
`;
