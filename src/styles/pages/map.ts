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

  .map-featured { margin-top: 48px; text-align: center; }
  .map-featured .kicker { margin-bottom: 4px; }
  .map-featured .featured-card { text-align: left; margin-top: 20px; }
  .map-featured .featured-card .copy { text-align: center; }
  ${featuredCss}
`;
