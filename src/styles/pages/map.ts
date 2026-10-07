// Styles for the map page only. Served as /assets/page-map.<hash>.css and linked by Layout (page="map").
export const mapCss = `
  .map-page { padding: clamp(2.5rem, 6vw, 4.5rem) 0 clamp(4rem, 9vw, 7rem); }
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
  .list-title { font-size: 1.2rem; margin: 8px 0 0; }
  .pin-list { columns: 240px; column-gap: 20px; margin-top: 12px; padding: 0; list-style: none; font-size: 0.88rem; }
  .pin-list li { break-inside: avoid; padding: 4px 0; }
  .pin-list a { color: var(--ink); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
  .pin-list a:hover { color: var(--accent-text); text-decoration: underline; }
  .pin-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-dark); flex-shrink: 0; }
  .pin-list .coords { font-size: 0.75rem; color: var(--ink-soft); }
`;
