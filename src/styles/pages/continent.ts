// Styles for the continent page only. Served as /assets/page-continent.<hash>.css and linked by Layout (page="continent").
import { seaCss } from "../../waveCard";

export const continentCss = `
  .continent-page { padding: clamp(2.5rem, 6vw, 4.5rem) 0 clamp(4rem, 9vw, 7rem); }
  .continent-page .breadcrumb, .continent-page .kicker, .continent-page h1 { text-align: center; }
  .continent-page h1 { margin-top: 6px; }

  .continent-page .sea-head {
    display: flex; align-items: center; gap: 8px;
    color: var(--ink); font-weight: 600; font-size: 0.9rem;
    margin-top: 36px; padding-bottom: 8px; border-bottom: 1px solid var(--border);
  }
  .continent-page .sea-head.first { margin-top: 28px; }
  .continent-page .sea-head i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex: none; }
  .continent-page .sea-head .count { color: var(--ink-soft); font-weight: 400; }

  .country-grid {
    display: grid; gap: 18px 14px; margin: 18px 0 0;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  }
  .country-card {
    position: relative;
    display: flex; align-items: center; justify-content: center; text-align: center;
    background: var(--surface); border: 1px solid var(--border); border-bottom: none;
    border-radius: 10px 10px 0 0;
    padding: 16px 16px 20px; color: var(--ink); text-decoration: none;
    transition: transform var(--ease), filter var(--ease);
  }
  .country-card:hover { transform: translateY(-2px); filter: brightness(1.02); }
  .country-card .name { font-weight: 600; font-size: 0.9rem; }
  .country-card .wave-strip { position: absolute; left: 0; right: 0; bottom: -11px; height: 14px; display: flex; }
  .country-card .wave-strip .wave { flex: 1 1 0; background-repeat: repeat-x; background-size: 40px 14px; }

  .country-card.lake { border-bottom: 1px solid var(--border); border-radius: var(--radius-lg); padding-bottom: 14px; }
  .country-card.lake svg { width: 38px; height: auto; margin-bottom: 8px; }

` + "\n" + seaCss;
