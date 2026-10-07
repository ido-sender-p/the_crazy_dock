// Styles for the country page only. Served as /assets/page-country.<hash>.css and linked by Layout (page="country").
import { seaCss } from "../sea";

export const countryCss = `
  .country-page { padding: clamp(2.5rem, 6vw, 4.5rem) 0 clamp(4rem, 9vw, 7rem); }
  .country-page .breadcrumb, .country-page .kicker, .country-page h1 { text-align: center; }
  .country-page h1 { margin-top: 6px; }

  .wave-card .wave {
    position: absolute; left: -1px; right: -1px; bottom: -11px; height: 14px;
    background-repeat: repeat-x; background-size: 40px 14px;
  }

  .lake-card {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
    text-align: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
    padding: 14px 16px 12px; color: var(--ink); text-decoration: none;
    transition: transform var(--ease), filter var(--ease);
  }
  a.lake-card:hover { transform: translateY(-2px); filter: brightness(1.02); }
  .lake-card svg { width: 42px; height: auto; }
  .lake-card .name { font-weight: 600; font-size: 0.9rem; }

  .country-page .empty { margin-top: 28px; padding: 28px; font-size: 1rem; }
  .country-page .list { margin-top: 18px; }
` + "\n" + seaCss;
