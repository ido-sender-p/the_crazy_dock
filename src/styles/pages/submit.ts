// Styles for the submit page only. Served as /assets/page-submit.<hash>.css and linked by Layout (page="submit").
export const submitCss = `
  .submit-page { padding: 60px 0 100px; max-width: 620px; }

  .submit-page p.intro { color: var(--ink-soft); margin-bottom: 8px; }
  .submit-page div.who { color: var(--ink-soft); font-size: 0.85rem; margin-bottom: 28px; }
  .submit-page div.who a { color: var(--accent-text); text-decoration: none; }
  .submit-page form { display: flex; flex-direction: column; gap: 16px; }
  .submit-page .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 560px) { .submit-page .row { grid-template-columns: 1fr; } }
  .submit-page label { font-size: 0.85rem; font-weight: 600; color: var(--ink); display: block; margin-bottom: 6px; }
  .submit-page input, .submit-page select {
    width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: var(--radius-md);
    font-size: 0.95rem; font-family: inherit; color: var(--ink);
  }
  .submit-page input:focus, .submit-page select:focus {
    outline: 2px solid var(--accent); outline-offset: 1px;
  }
  .submit-page .photo-note { font-size: 0.8rem; color: var(--ink-soft); margin: 0; }
  .submit-page button.btn-cta { border: none; cursor: pointer; margin-top: 6px; align-self: flex-start; }
  .submit-page .success { padding: 18px 20px; border-radius: var(--radius-lg); font-size: 0.95rem; }
  .submit-page form .error { margin-bottom: 0; }
  .submit-page .logout-form { display: inline; }
  .submit-page .logout-btn { border: none; background: none; padding: 0; font: inherit; color: var(--accent-text); cursor: pointer; }
`;
