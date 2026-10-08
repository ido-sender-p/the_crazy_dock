// Styles for the home page only. Served as /assets/page-home.<hash>.css and linked by Layout (page="home").
import { featuredCss } from "../featured";

export const homeCss = `
  .hero { min-height: clamp(32rem, 82svh, 52rem); }
  .hero .wrap { max-width: var(--page-max); padding-top: 3.75rem; padding-bottom: 5.5rem; text-align: center; }
  /* soft dark pool behind the text so the light, busy part of the photo never sits under it */
  .hero::before {
    content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;
    background: radial-gradient(ellipse 75% 65% at 50% 52%, rgba(4,14,26,0.6) 0%, rgba(4,14,26,0.35) 45%, rgba(4,14,26,0) 80%);
  }
  .hero h1 {
    font-family: var(--font-serif);
    font-weight: 600;
    font-size: clamp(2.2rem, 5.2vw, 3.9rem);
    letter-spacing: -0.01em;
    line-height: 1.15;
    margin: 0;
    max-width: none;
    color: var(--white);
    text-shadow: 0 2px 24px rgba(0,0,0,0.45);
  }
  .hero p.tagline {
    font-family: var(--font-serif);
    font-weight: 400;
    font-size: clamp(1rem, 1.6vw, 1.2rem);
    font-weight: 500;
    line-height: 1.6;
    margin: clamp(2.25rem, 4.5vw, 3.5rem) auto 0; /* air between the headline and the mission line */
    max-width: 38rem;
    color: var(--white);
    text-shadow: 0 1px 3px rgba(0,0,0,0.6), 0 2px 18px rgba(0,0,0,0.55);
  }
  .hero-actions { display: flex; gap: 0.9rem; flex-wrap: wrap; justify-content: center; margin-top: 2.75rem; }
  /* plain serif text link with an arrow, no button chrome */
  .hero .hero-link {
    display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0;
    font-family: var(--font-serif); font-weight: 500; font-size: clamp(1.05rem, 1.5vw, 1.25rem);
    color: var(--white); text-decoration: none; text-shadow: 0 1px 3px rgba(0,0,0,0.6), 0 2px 18px rgba(0,0,0,0.55);
  }
  .hero .hero-link svg { width: 0.7em; height: 0.45em; position: relative; top: 0.14em; transition: transform 0.2s ease; }
  .hero .hero-link svg path { vector-effect: non-scaling-stroke; }
  .hero .hero-link:hover svg { transform: translateX(3px); }
  /* the photo dissolves into the page background so the hero flows into the next section */
  .hero::after {
    content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 48%; z-index: 0; pointer-events: none;
    background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, var(--bg) 92%);
  }

  /* one literary voice for every section: Fraunces, deep sea navy, plenty of air */
  section.block { padding-block: clamp(3rem, 8vw, 6rem); }
  section.block.wrap { max-width: calc(var(--page-max) + 2 * var(--gutter)); }
  section.block .kicker { font-size: 0.72rem; font-weight: 500; letter-spacing: 0.2em; }
  section.block h2 {
    font-family: var(--font-serif); font-weight: 500; font-size: clamp(1.5rem, 2.6vw, 2rem);
    letter-spacing: -0.005em; margin: 0.9rem 0 2.25rem;
  }

  .world-map { width: 100%; margin-top: 8px; }
  .world-map svg { width: 100%; height: auto; display: block; }
  .world-map a { text-decoration: none; }
  .world-map .shape { fill: var(--accent-dark); fill-opacity: 0.24; transition: fill-opacity var(--ease); }
  .world-map a:hover .shape { fill-opacity: 0.42; }
  .world-map .label {
    font-family: var(--font-serif-bare); font-weight: 600; fill: var(--ink);
    text-anchor: middle; pointer-events: none;
  }

  .map-teaser {
    position: relative;
    display: block;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--surface);
  }
  #home-map { width: 100%; height: auto; aspect-ratio: 16 / 8; background: var(--navy); }
  /* the button floats over the map corner; z-index keeps it above Leaflet's panes and controls */
  .map-teaser-copy { position: absolute; top: 0.9rem; right: 0.9rem; z-index: var(--z-above-map); display: flex; }
  .map-teaser-copy .btn-cta {
    display: inline-flex; align-items: center; gap: 9px; padding: 10px 20px; font-size: 0.85rem;
  }
  .map-teaser-copy .btn-cta svg { width: 16px; height: 16px; }
  .map-teaser-copy .btn-cta { box-shadow: 0 4px 14px rgba(var(--navy-rgb), 0.35); }
  /* on dark panels the navy button would vanish, so it flips to white with navy text */
  .submit-cta .btn-cta { background: var(--white); color: var(--ink); box-shadow: 0 4px 14px rgba(0,0,0,0.25); }

${featuredCss}

  /* story block right after the hero: same serif, same navy, lots of air */
  .log { margin-top: 0; }
  .log-entry { display: grid; grid-template-columns: 1fr; justify-items: center; text-align: center; gap: 2rem; padding: clamp(2.5rem, 7vw, 5.5rem) 0; }
  .log-num { width: 3.5rem; height: 3.5rem; }
  .log-entry > div { max-width: 38rem; }
  .log-entry h3 {
    font-family: var(--font-serif); font-weight: 500; font-size: clamp(1.25rem, 2vw, 1.55rem);
    letter-spacing: -0.005em; color: var(--ink); margin: 0 0 1.75rem;
  }
  .log-entry p {
    font-family: var(--font-serif); font-weight: 300; font-size: clamp(1.02rem, 1.4vw, 1.15rem);
    line-height: 1.9; color: var(--ink-prose); margin: 0 auto;
  }
  .log-entry p + p { margin-top: 1.75rem; }
  /* Get started: three steps, text first; the dashed route only links them in the gaps */
  .journey { max-width: 44rem; margin: 0 auto; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .step { display: flex; flex-direction: column; align-items: center; }
  .step-icon { width: 3.1rem; height: 3.1rem; margin-bottom: 1.4rem; color: var(--accent); }
  .step-icon svg { width: 100%; height: 100%; display: block; }
  .step h3 {
    font-family: var(--font-serif); font-weight: 500; font-size: clamp(1.4rem, 2vw, 1.625rem);
    line-height: 1.25; letter-spacing: -0.005em; color: var(--ink); margin: 0 0 1rem;
  }
  .step p {
    font-family: var(--font-serif); font-weight: 400; font-size: clamp(1.05rem, 1.4vw, 1.125rem);
    line-height: 1.62; color: var(--ink-prose-strong); max-width: 40rem; margin: 0;
  }
  .route { width: 1.4rem; height: 4.5rem; margin: 2.5rem 0; color: var(--accent); opacity: 0.75; }
  .route svg { width: 100%; height: 100%; display: block; }

  .submit-cta {
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, var(--navy) 0%, var(--navy) 60%, var(--navy-lift) 100%);
    color: var(--white);
    border-radius: 20px;
    padding: clamp(2.25rem, 6vw, 4rem);
    text-align: center;
  }
  .submit-cta .dock-scene { position: absolute; right: 10px; bottom: 0; width: 260px; height: auto; opacity: 0.9; }
  .submit-cta .cast-line { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.9; pointer-events: none; }
  .submit-cta .birds { position: absolute; left: 24px; top: 18px; width: 120px; height: 50px; opacity: 0.85; pointer-events: none; }
  .submit-cta h2 { color: var(--white); font-family: var(--font-serif); font-weight: 500; font-size: clamp(1.5rem, 2.6vw, 2rem); margin: 0 0 1.75rem; }

  /* hero and sections are all centered */
  section.block, .map-teaser-copy, .featured-card .copy { text-align: center; }

  @media (max-width: 640px) {
    #home-map { aspect-ratio: 4 / 3; }
    .submit-cta { padding: 32px 20px; }
    .submit-cta .dock-scene, .submit-cta .cast-line, .submit-cta .birds { display: none; }
  }
  .band-white { background: var(--white); }
  section.block.flush-top { padding-top: 0; }
  section.block.featured-gap { padding-top: 160px; }
`;
