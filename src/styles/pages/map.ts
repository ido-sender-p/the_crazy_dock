// Styles for the map page only. Served as /assets/page-map.<hash>.css and linked by Layout (page="map").
import { featuredCss } from "../featured";

export const mapCss = `
  .map-page { padding-block: clamp(2.5rem, 6vw, 4.5rem) clamp(4rem, 9vw, 7rem); max-width: calc(var(--page-max) + 2 * var(--gutter)); }
  .map-page h1, .map-page p.intro { text-align: center; }
  .map-page p.intro { margin-inline: auto; }

  .map-page p.intro { color: var(--ink-soft); max-width: 40rem; }
  .map-canvas {
    margin: 32px 0;
    border-radius: 20px;
    border: 1px solid var(--border);
    overflow: hidden;
  }
  #wildock-map { height: 460px; width: 100%; background: var(--navy); }

  /* same look as the home page's Pick of the week: its heading scale and spacing, centred card text */
  .map-featured { margin-top: 64px; text-align: center; }
  .map-featured .kicker { font-size: 0.72rem; font-weight: 500; letter-spacing: 0.2em; }
  .map-featured h2 {
    font-family: var(--font-serif); font-weight: 500; font-size: clamp(1.5rem, 2.6vw, 2rem);
    letter-spacing: -0.005em; margin: 0.9rem 0 2.25rem;
  }
  .map-featured .featured-card { text-align: left; }
  .map-featured .featured-card .copy { text-align: center; }
  ${featuredCss}
`;
