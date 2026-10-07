// Site chrome: header, logo, icon buttons, footer, accessibility panel and its modes, skip link.
export const chromeCss = `
  header.site {
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  header.site .wrap {
    display: flex; align-items: center; justify-content: space-between; height: var(--header-h); gap: 20px;
    max-width: none;
  }
  /* compass star, very widely spaced thin wordmark, and a tapered wave swoosh, stacked */
  .logo { display: inline-flex; flex-direction: column; align-items: center; gap: 0.42rem; line-height: 1; text-decoration: none; color: var(--ink); white-space: nowrap; }
  .logo .logo-star { width: 0.85rem; height: 0.85rem; fill: currentColor; }
  .logo .logo-word { font-family: var(--font-logo); font-weight: 300; font-size: 0.8rem; letter-spacing: 0.9em; margin-right: -0.9em; }
  .logo .logo-wave { width: 3.2rem; height: 0.5rem; fill: currentColor; }
  .header-actions { display: flex; align-items: center; gap: 10px; }
  .icon-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 38px; height: 38px; border-radius: 50%;
    border: 1px solid var(--border); background: transparent; color: var(--ink-soft);
    cursor: pointer; transition: border-color var(--ease), color var(--ease);
  }
  .icon-btn:hover { border-color: var(--accent); color: var(--accent-text); }
  .icon-btn svg { width: 18px; height: 18px; }
  /* hidden until client/site.ts shows it for logged-in visitors (it sets display inline) */
  .icon-btn.profile-link-hidden { display: none; }
  .btn-login {
    display: inline-flex; align-items: center; text-decoration: none;
    border: 1px solid var(--border); border-radius: var(--radius-pill);
    padding: 9px 18px; font-size: 0.88rem; font-weight: 600; color: var(--ink);
    white-space: nowrap; transition: border-color var(--ease), color var(--ease);
  }
  .btn-login:hover { border-color: var(--accent); color: var(--accent-text); }

  /* Logo + icons + login pill can outrun very narrow phones (~320px). The
     search icon gives first; the accessibility button always stays. */
  @media (max-width: 400px) {
    .icon-optional { display: none; }
    .header-actions { gap: 6px; }
    .btn-login { padding: 8px 12px; }
  }

  .a11y-wrap { position: relative; }
  .a11y-panel {
    position: absolute; top: 48px; right: 0; z-index: var(--z-panel); width: 230px;
    background: var(--surface); color: var(--ink); border: 1px solid var(--border); border-radius: var(--radius-lg);
    padding: 16px; box-shadow: 0 14px 32px rgba(var(--navy-rgb), 0.18);
    display: flex; flex-direction: column; gap: 14px;
  }
  .a11y-panel[hidden] { display: none; }
  .a11y-row { display: flex; flex-direction: column; gap: 8px; }
  .a11y-label { font-size: 0.75rem; font-weight: 600; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.05em; }
  .a11y-seg { display: flex; border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
  .a11y-seg button {
    flex: 1; border: none; border-right: 1px solid var(--border); background: var(--surface); color: var(--ink);
    padding: 7px 0; cursor: pointer; font-family: inherit; font-size: 0.85rem;
  }
  .a11y-seg button:last-child { border-right: none; }
  .a11y-seg button.active { background: var(--ink); color: var(--white); }
  .a11y-check { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--ink); cursor: pointer; }
  .a11y-reset {
    align-self: flex-start; border: none; background: none; color: var(--accent-text);
    font-size: 0.8rem; font-weight: 600; cursor: pointer; padding: 0; text-decoration: underline;
  }

  html.a11y-text-large { font-size: 112.5%; }
  html.a11y-text-larger { font-size: 125%; }
  html.a11y-underline a:not(.icon-btn):not(.btn-login):not(.btn-cta):not(.logo) { text-decoration: underline; }
  html.a11y-reduce-motion, html.a11y-reduce-motion * { transition: none !important; animation: none !important; }
  html.a11y-grayscale { filter: grayscale(1); }
  html.a11y-readable-font, html.a11y-readable-font * {
    font-family: Arial, Helvetica, sans-serif !important; letter-spacing: 0.01em;
  }
  html.a11y-big-cursor, html.a11y-big-cursor * {
    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path d="M3 2l7.6 19.2 2.5-8 8-2.4z" fill="black" stroke="white" stroke-width="1.2"/></svg>') 2 2, auto !important;
  }
  .a11y-reading-guide {
    position: fixed; left: 0; right: 0; height: 34px; margin-top: -17px; pointer-events: none; z-index: var(--z-guide);
    background: rgba(255,214,0,0.28); border-top: 2px solid rgba(153,109,0,0.75); border-bottom: 2px solid rgba(153,109,0,0.75);
    display: none;
  }
  .a11y-reading-guide.active { display: block; }

  footer.site { border-top: 1px solid var(--border); margin-top: 80px; padding: 32px 0; color: var(--ink-soft); font-size: 0.85rem; }
  footer.site .wrap { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  footer.site a { color: var(--ink-soft); }
`;
