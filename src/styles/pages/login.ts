// Styles for the login page only. Served as /assets/page-login.<hash>.css and linked by Layout (page="login").
export const loginCss = `
  .hero.auth-hero {
    min-height: calc(100vh - var(--header-h));
    /* 100vh includes the address bar on mobile Safari/Chrome, so the hero
       is taller than the visible area until the browser chrome collapses.
       dvh tracks the actual visible viewport; vh above is just the fallback
       for browsers that don't support it yet. */
    min-height: calc(100dvh - var(--header-h));
    padding: 100px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .auth-card {
    width: 100%;
    max-width: 400px;
    background: rgba(255,255,255,0.97);
    border-radius: 20px;
    padding: 40px 36px;
    box-shadow: 0 30px 70px rgba(4,14,26,0.4);
  }
  .auth-icon {
    width: 40px; height: 40px; margin: 0 auto 18px; color: var(--accent-text);
    display: flex; align-items: center; justify-content: center;
  }
  .auth-icon svg { width: 100%; height: 100%; }
  .auth-card h1 {
    font-family: var(--font-serif); font-weight: 600; font-size: 1.7rem;
    text-align: center; margin: 0 0 6px; color: var(--ink);
  }
  .auth-card p.intro { color: var(--ink-soft); text-align: center; font-size: 0.9rem; margin: 0 0 26px; }
  .auth-card form { display: flex; flex-direction: column; gap: 16px; }
  .auth-card label { font-size: 0.8rem; font-weight: 600; color: var(--ink); display: block; margin-bottom: 6px; }
  .auth-card input {
    width: 100%; padding: 12px 14px; border: 1px solid var(--border); border-radius: var(--radius-md);
    font-size: 0.95rem; font-family: inherit; color: var(--ink); background: var(--white);
    transition: border-color var(--ease), box-shadow var(--ease);
  }
  .auth-card input:focus {
    border-color: var(--accent-dark); box-shadow: 0 0 0 3px rgba(var(--gold-rgb), 0.25);
  }
  .auth-card .error { font-size: 0.85rem; text-align: center; }
  .auth-card button.btn-cta {
    border: none; cursor: pointer; margin-top: 6px; width: 100%; text-align: center;
    font-size: 0.95rem; padding: 13px 22px;
  }
  .auth-card .forgot {
    display: block; text-align: center; margin-top: 18px; font-size: 0.85rem;
    color: var(--ink-soft); text-decoration: none;
  }
  .auth-card .forgot:hover { color: var(--accent-text); }
  .auth-card .switch {
    text-align: center; margin-top: 14px; font-size: 0.85rem; color: var(--ink-soft);
  }
  .auth-card .switch a { color: var(--accent-text); font-weight: 600; text-decoration: none; }
  .auth-card .switch a:hover { text-decoration: underline; }
  .auth-card p.body { color: var(--ink-soft); text-align: center; font-size: 0.92rem; line-height: 1.55; margin: 0 0 22px; }

  .btn-google {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: var(--radius-md);
    background: var(--white); color: var(--ink); text-decoration: none;
    font-size: 0.9rem; font-weight: 600; margin-bottom: 20px;
    transition: border-color var(--ease), box-shadow var(--ease);
  }
  .btn-google:hover { border-color: #c3c9d1; box-shadow: 0 2px 8px rgba(var(--navy-rgb), 0.08); }
  .btn-google svg { width: 18px; height: 18px; }
  .auth-divider { display: flex; align-items: center; gap: 12px; margin: 0 0 20px; color: var(--ink-soft); font-size: 0.78rem; }
  .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
`;
