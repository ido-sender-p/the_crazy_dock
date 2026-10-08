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
  /* search field and the map link side by side, both as frosted boxes over the photo */
  .hero-actions { display: flex; gap: 1rem; justify-content: center; align-items: stretch; margin: 2.75rem auto 0; max-width: 46rem; }
  .hero-search, .hero .hero-link {
    display: flex; align-items: center; gap: 0.7rem; min-height: 3.5rem; padding: 0 1.25rem;
    background: rgba(14, 30, 50, 0.55); border: 1px solid rgba(255, 255, 255, 0.28); border-radius: 12px;
    -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); box-shadow: 0 6px 22px rgba(0, 0, 0, 0.22);
    color: var(--white);
  }
  .hero-search { flex: 1 1 0; min-width: 0; margin: 0; }
  .hero-search:focus-within { border-color: rgba(255, 255, 255, 0.75); }
  .hero-search-icon, .hero-link-icon { width: 1.25rem; height: 1.25rem; flex: none; opacity: 0.85; }
  .hero-search input {
    flex: 1; min-width: 0; background: transparent; border: none; outline: none; padding: 0.9rem 0;
    font-family: var(--font-sans); font-size: 1rem; color: var(--white);
  }
  .hero-search input::placeholder { color: rgba(255, 255, 255, 0.72); opacity: 1; }
  .hero-search input::-webkit-search-cancel-button { display: none; }
  .hero .hero-link {
    flex: 0 0 auto; font-family: var(--font-serif); font-weight: 500; font-size: clamp(1rem, 1.4vw, 1.15rem);
    text-decoration: none; white-space: nowrap; transition: background var(--ease), border-color var(--ease);
  }
  .hero .hero-link:hover { background: rgba(14, 30, 50, 0.72); border-color: rgba(255, 255, 255, 0.5); }
  .hero .hero-link:focus-visible { outline: 2px solid var(--white); outline-offset: 3px; }
  .hero .hero-link-arrow { width: 0.8em; height: 0.5em; transition: transform 0.2s ease; }
  .hero .hero-link-arrow path { vector-effect: non-scaling-stroke; }
  .hero .hero-link:hover .hero-link-arrow { transform: translateX(3px); }
  @media (max-width: 720px) { .hero-actions { flex-direction: column; } .hero .hero-link { justify-content: center; } }
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

  /* By continent: one card per continent, with its outline in its own colour */
  .continent-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-top: 8px; }
  .continent-card {
    display: flex; flex-direction: column; align-items: center; gap: 0.9rem;
    padding: 1.4rem 0.75rem 1.1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
    color: var(--ink); text-decoration: none; transition: transform var(--ease), box-shadow var(--ease);
  }
  .continent-card:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(11, 37, 69, 0.08); }
  .continent-card .shape { width: 100%; height: 6.25rem; display: block; }
  .continent-card .name { font-family: var(--font-serif); font-weight: 500; font-size: 1rem; line-height: 1.25; min-height: 2.5em; display: flex; align-items: center; }
  .continent-card .arrow { width: 1.4rem; height: 0.7rem; color: var(--ink-soft); transition: transform 0.2s ease; }
  .continent-card:hover .arrow { transform: translateX(3px); }
  .c-north-america .shape { fill: #8fa886; }
  .c-south-america .shape { fill: #7a9a6a; }
  .c-europe .shape { fill: #e6c47a; }
  .c-africa .shape { fill: #e0905c; }
  .c-asia .shape { fill: #9db9d6; }
  .c-oceania .shape { fill: #ee9c82; }
  @media (max-width: 960px) { .continent-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 520px) { .continent-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } .continent-card .shape { height: 4.5rem; } }

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
