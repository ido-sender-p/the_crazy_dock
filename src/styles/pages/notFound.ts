// Styles for the 404 page only. Served as /assets/page-notFound.<hash>.css and linked by Layout (page="notFound").
export const notFoundCss = `
  .not-found-page { padding-block: clamp(3rem, 9vw, 6rem) clamp(4rem, 10vw, 7rem); max-width: calc(560px + 2 * var(--gutter)); }
  .not-found-page .kicker { margin: 0 0 8px; }
  .not-found-page .search-form { display: flex; gap: 10px; margin: 24px 0 20px; }
  .not-found-page .search-form input {
    flex: 1; min-width: 0; padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius-pill);
    font-size: 0.95rem; font-family: inherit; color: var(--ink);
  }
  .not-found-page .search-form input:focus-visible { border-color: var(--accent-dark); }
  .not-found-page .search-form button {
    border: none; border-radius: var(--radius-pill); padding: 0 22px; background: var(--ink); color: var(--white);
    font-size: 0.9rem; cursor: pointer; font-family: inherit;
  }
`;
