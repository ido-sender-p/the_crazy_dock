// Styles for the credits page only. Served as /assets/page-credits.<hash>.css and linked by Layout (page="credits").
export const creditsCss = `
  .credits-page { padding: 56px 0 100px; max-width: 980px; }
  .credits-page h2 { font-size: 1.15rem; margin-top: 32px; }
  .credits-page p { font-size: 0.95rem; }
  .credits-page .table-wrap { overflow-x: auto; margin-top: 12px; }
  .credits-page table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  .credits-page th, .credits-page td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border); vertical-align: top; }
  .credits-page th { color: var(--ink-soft); font-weight: 600; }
`;
