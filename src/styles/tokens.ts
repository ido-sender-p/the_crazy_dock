// Design tokens: the one place to change the look. Every colour, font, radius, timing and layout size used in
// more than one place is a CSS custom property here; the stylesheets in this folder only reference them.
//
// Two groups of colours, on purpose:
//   fixed brand values (--navy, --gold, --white ...) never change;
//   semantic ones (--ink, --accent ...) are what the "High contrast" accessibility mode swaps (tokensContrastCss).
// So a hard-coded brand colour is written var(--navy), never var(--ink), or it would turn black in contrast mode.
export const tokensCss = `
  :root {
    /* brand */
    --navy: #0b2545;
    --navy-rgb: 11, 37, 69;
    --navy-lift: #123a63;
    --gold: #c9a24d;
    --gold-rgb: 201, 162, 77;
    --white: #ffffff;

    /* semantic: swapped by high-contrast mode */
    --ink: var(--navy);
    --ink-soft: #45607a;
    --bg: #ffffff;
    --surface: #ffffff;
    --accent: var(--gold);
    --accent-dark: #8a6a14;
    --accent-text: #7a5c0e; /* accent for text on white, 6.2:1 */
    --on-accent: #06121f; /* text on accent fills, 5.8:1 or better */
    --border: #e7e2d6;

    /* prose and warm accents */
    --ink-prose: #24405c;
    --ink-prose-strong: #1d3a56;
    --amber: #8a5a12;

    /* type */
    --font-serif: 'Fraunces', Georgia, serif;
    --font-serif-bare: 'Fraunces', serif;
    --font-sans: 'Inter', system-ui, sans-serif;
    --font-logo: 'Montserrat', 'Inter', sans-serif;

    /* shape and motion */
    --radius-sm: 8px;
    --radius-md: 10px;
    --radius-lg: 12px;
    --radius-xl: 14px;
    --radius-pill: 999px;
    --ease: 0.15s ease;

    /* layout */
    --page-max: 1320px;
    --gutter: 24px;
    --header-h: 64px;

    /* stacking order, lowest to highest */
    --z-raise: 1;
    --z-header: 5;
    --z-panel: 20;
    --z-lightbox: 50;
    --z-skip: 100;
    --z-above-map: 1000; /* above Leaflet's own panes and controls */
    --z-guide: 9999;
  }
`;

// High-contrast mode (html.a11y-contrast): swaps only the semantic tokens above.
export const tokensContrastCss = `
  html.a11y-contrast {
    --ink: #000000; --ink-soft: #202020; --bg: #ffffff; --surface: #ffffff;
    --accent: #6b4a12; --accent-dark: #4a3208; --accent-text: #4a3208; --on-accent: #ffffff; --border: #000000;
  }
`;
