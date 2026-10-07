// Styles for the search page only. Served as /assets/page-search.<hash>.css and linked by Layout (page="search").
export const searchCss = `
  .search-page { padding-block: 56px 100px; max-width: calc(680px + 2 * var(--gutter)); }

  .search-form { display: flex; gap: 10px; margin: 20px 0 18px; }
  .search-form input {
    flex: 1; min-width: 0; /* lets the field shrink on very narrow phones instead of pushing the button off-screen */ padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius-pill);
    font-size: 0.95rem; font-family: inherit; color: var(--ink);
  }
  .search-form input:focus-visible { border-color: var(--accent-dark); }
  .search-form button {
    border: none; border-radius: var(--radius-pill); padding: 0 22px; background: var(--ink); color: var(--white);
    font-weight: 600; cursor: pointer; font-size: 0.9rem;
  }

  .search-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; }
  .search-filters a {
    display: inline-flex; align-items: center; gap: 6px; text-decoration: none;
    border: 1px solid var(--border); border-radius: var(--radius-pill); padding: 7px 16px;
    font-size: 0.85rem; font-weight: 600; color: var(--ink-soft);
    transition: border-color var(--ease), background var(--ease), color var(--ease);
  }
  .search-filters a:hover { border-color: var(--accent); color: var(--accent-text); }
  .search-filters a.active { background: var(--ink); border-color: var(--ink); color: var(--white); }

  .search-page section { margin-top: 28px; }
  .search-page .kicker { font-size: 0.78rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .search-page .kicker svg { width: 14px; height: 14px; }
  .result-list { display: flex; flex-direction: column; gap: 10px; }
  .result-row {
    display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit;
    padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface);
    transition: border-color var(--ease), transform var(--ease);
  }
  .result-row:hover { border-color: var(--accent); transform: translateY(-1px); }
  .result-icon {
    width: 38px; height: 38px; border-radius: 50%; flex: none; object-fit: cover;
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    color: var(--on-accent); display: flex; align-items: center; justify-content: center;
    font-family: var(--font-serif-bare); font-weight: 600; font-size: 0.9rem;
  }
  .result-icon.location { background: var(--surface); border: 1px solid var(--border); color: var(--accent-text); }
  .result-icon svg { width: 17px; height: 17px; }
  .result-row .name { font-weight: 600; font-size: 0.92rem; }
  .result-row .place { color: var(--ink-soft); font-size: 0.83rem; }
`;
