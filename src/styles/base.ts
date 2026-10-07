// Reset, typography and layout primitives (.wrap, headings, links, focus).
export const baseCss = `
  * { box-sizing: border-box; }
  :focus-visible { outline: 2px solid var(--accent-dark); outline-offset: 2px; }
  main:focus { outline: none; }
  .skip-link {
    position: absolute; left: 8px; top: -60px; z-index: 100; background: var(--ink); color: #fff;
    padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem;
  }
  .skip-link:focus { top: 8px; }
  body {
    margin: 0;
    font-family: 'Inter', system-ui, sans-serif;
    background: var(--bg);
    color: var(--ink);
    line-height: 1.55;
  }
  h1, h2, h3 { font-family: 'Fraunces', Georgia, serif; margin: 0 0 0.4em; line-height: 1.15; }
  /* one editorial voice across the site: Fraunces headings and prose in deep navy, calm and spaced */
  main h1 { font-weight: 500; font-size: clamp(1.75rem, 3.2vw, 2.4rem); letter-spacing: -0.01em; }
  main h2, main h3 { font-weight: 500; letter-spacing: -0.005em; }
  main p, main figcaption, main dd { font-family: 'Fraunces', Georgia, serif; line-height: 1.7; }
  a { color: inherit; }
  .wrap { max-width: 1320px; margin: 0 auto; padding: 0 24px; }
`;
