// Styles for the country page only. Served as /assets/page-country.<hash>.css and linked by Layout (page="country").
import { seaCss } from "../../waveCard";

export const countryCss = `
  .country-page { padding: clamp(2.5rem, 6vw, 4.5rem) 0 clamp(4rem, 9vw, 7rem); }
  .country-page .breadcrumb, .country-page .kicker, .country-page h1 { text-align: center; }
  .country-page h1 { margin-top: 6px; }
  .country-page .sea-head {
    display: flex; align-items: center; gap: 8px;
    color: var(--ink); font-weight: 600; font-size: 0.9rem;
    margin-top: 32px; padding-bottom: 8px; border-bottom: 1px solid var(--border);
  }
  .country-page .sea-head.first { margin-top: 24px; }
  .country-page .sea-head i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex: none; }
  .country-page .sea-head .count { color: var(--ink-soft); font-weight: 400; }

  .card-grid {
    display: grid; gap: 18px 14px; margin: 18px 0 0;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  }
  .wave-card {
    position: relative;
    display: flex; align-items: center; justify-content: center; text-align: center;
    background: var(--surface); border: 1px solid var(--border); border-bottom: none;
    border-radius: 10px 10px 0 0;
    padding: 16px 16px 20px; color: var(--ink); text-decoration: none;
    transition: transform 0.15s ease, filter 0.15s ease;
  }
  a.wave-card:hover { transform: translateY(-2px); filter: brightness(1.02); }
  .wave-card .name { font-weight: 600; font-size: 0.9rem; }
  .wave-card .wave {
    position: absolute; left: -1px; right: -1px; bottom: -11px; height: 14px;
    background-repeat: repeat-x; background-size: 40px 14px;
  }

  .lake-card {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
    text-align: center; background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    padding: 14px 16px 12px; color: var(--ink); text-decoration: none;
    transition: transform 0.15s ease, filter 0.15s ease;
  }
  a.lake-card:hover { transform: translateY(-2px); filter: brightness(1.02); }
  .lake-card svg { width: 42px; height: auto; }
  .lake-card .name { font-weight: 600; font-size: 0.9rem; }

  .country-page .empty { margin-top: 28px; padding: 28px; font-size: 1rem; }
  .country-page .list { margin-top: 18px; }
` + "\n" + seaCss;
