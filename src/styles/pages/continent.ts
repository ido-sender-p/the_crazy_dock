// Styles for the continent page only. Served as /assets/page-continent.<hash>.css and linked by Layout (page="continent").
import { seaCss } from "../sea";

export const continentCss = `
  .continent-page { padding-block: clamp(2.5rem, 6vw, 4.5rem) clamp(4rem, 9vw, 7rem); max-width: calc(var(--page-max) + 2 * var(--gutter)); }
  .continent-page .breadcrumb, .continent-page .kicker, .continent-page h1 { text-align: center; }
  .continent-page h1 { margin-top: 6px; }

  /* roomier than the shared .sea-head: the continent page stacks many of them */
  .continent-page .sea-head { margin-top: 36px; }
  .continent-page .sea-head.first { margin-top: 28px; }

  .country-card .wave-strip { position: absolute; left: 0; right: 0; bottom: -11px; height: 14px; display: flex; }
  .country-card .wave-strip .wave { flex: 1 1 0; background-repeat: repeat-x; background-size: 40px 14px; }

  .country-card.lake { border-bottom: 1px solid var(--border); border-radius: var(--radius-lg); padding-bottom: 14px; }
  .country-card.lake svg { width: 38px; height: auto; margin-bottom: 8px; }

` + "\n" + seaCss;
