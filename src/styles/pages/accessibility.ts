// Styles for the accessibility page only. Served as /assets/page-accessibility.<hash>.css and linked by Layout (page="accessibility").
export const accessibilityCss = `
  .accessibility-page { padding-block: 56px 100px; max-width: calc(720px + 2 * var(--gutter)); }
  .accessibility-page h2 { font-size: 1.15rem; margin-top: 32px; }
  .accessibility-page p, .accessibility-page li { font-size: 0.95rem; color: var(--ink); }
  .accessibility-page ul { padding-inline-start: 22px; display: flex; flex-direction: column; gap: 6px; }
  .accessibility-page .updated { color: var(--ink-soft); font-size: 0.85rem; }
  .accessibility-page .notice { margin: 10px 0 0; }
`;
