// The "Pick of the week" card, used by the home page and the map page (components/featured.tsx).
export const featuredCss = `
  .featured-card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    background: var(--surface);
    text-decoration: none;
    color: var(--ink);
  }
  .featured-card img, .featured-card .thumb-ph { width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: cover; object-position: center 40%; display: block; }
  .featured-card .thumb-ph { background: var(--border); }
  .featured-card .copy { padding: clamp(1.5rem, 3.5vw, 2.75rem); display: flex; flex-direction: column; justify-content: center; }
  .featured-card .tag { font-size: 0.72rem; font-weight: 500; color: var(--accent-text); text-transform: uppercase; letter-spacing: 0.16em; }
  .featured-card h3 { font-family: var(--font-serif); font-weight: 500; font-size: clamp(1.3rem, 2vw, 1.6rem); margin: 0.6rem 0 0.9rem; }
  .featured-card p { font-family: var(--font-serif); font-weight: 300; color: var(--ink-prose); font-size: 1rem; line-height: 1.8; }
  @media (max-width: 640px) { .featured-card { grid-template-columns: 1fr; } .featured-card img, .featured-card .thumb-ph { aspect-ratio: 16 / 10; } .featured-card .copy { padding: 1.5rem 1.25rem; } }
`;
