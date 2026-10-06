import type { FC, PropsWithChildren } from "hono/jsx";
import { raw } from "hono/html";
import { safeJsonForScript } from "./lib/html";
import { siteCssUrl, heroCssUrl, pageCssUrl, scriptUrl } from "./lib/assets";
import type { PageName } from "./styles";
import type { ClientScriptName } from "./client";

const GLOBAL_CSS = `
  :root {
    --ink: #0b2545;
    --ink-soft: #45607a;
    --bg: #ffffff;
    --surface: #ffffff;
    --accent: #c9a24d; /* gold */
    --accent-dark: #8a6a14;
    --accent-text: #7a5c0e; /* accent for text on white, 6.2:1 */
    --on-accent: #06121f; /* text on accent fills, 5.8:1 or better */
    --coral: #ff6b6b;
    --border: #e7e2d6;
  }
  * { box-sizing: border-box; }
  :focus-visible { outline: 2px solid var(--accent-dark); outline-offset: 2px; }
  main:focus { outline: none; }
  .skip-link {
    position: absolute; left: 8px; top: -60px; z-index: 100; background: var(--ink); color: #fff;
    padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem;
  }
  .skip-link:focus { top: 8px; }
  body {
    margin: 0;
    font-family: 'Inter', system-ui, sans-serif;
    background: var(--bg);
    color: var(--ink);
    line-height: 1.55;
  }
  h1, h2, h3 { font-family: 'Fraunces', Georgia, serif; margin: 0 0 0.4em; line-height: 1.15; }
  /* one editorial voice across the site: Fraunces headings and prose in deep navy, calm and spaced */
  main h1 { font-weight: 500; font-size: clamp(1.75rem, 3.2vw, 2.4rem); letter-spacing: -0.01em; }
  main h2, main h3 { font-weight: 500; letter-spacing: -0.005em; }
  main p, main figcaption, main dd { font-family: 'Fraunces', Georgia, serif; line-height: 1.7; }
  a { color: inherit; }
  .wrap { max-width: 1320px; margin: 0 auto; padding: 0 24px; }

  header.site {
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  header.site .wrap {
    display: flex; align-items: center; justify-content: space-between; height: 64px; gap: 20px;
    max-width: none;
  }
  /* compass star, very widely spaced thin wordmark, and a tapered wave swoosh, stacked */
  .logo { display: inline-flex; flex-direction: column; align-items: center; gap: 0.42rem; line-height: 1; text-decoration: none; color: var(--ink); white-space: nowrap; }
  .logo .logo-star { width: 0.85rem; height: 0.85rem; fill: currentColor; }
  .logo .logo-word { font-family: 'Montserrat', 'Inter', sans-serif; font-weight: 300; font-size: 0.8rem; letter-spacing: 0.9em; margin-right: -0.9em; }
  .logo .logo-wave { width: 3.2rem; height: 0.5rem; fill: currentColor; }
  .header-actions { display: flex; align-items: center; gap: 10px; }
  .icon-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 38px; height: 38px; border-radius: 50%;
    border: 1px solid var(--border); background: transparent; color: var(--ink-soft);
    cursor: pointer; transition: border-color 0.15s ease, color 0.15s ease;
  }
  .icon-btn:hover { border-color: var(--accent); color: var(--accent-text); }
  .icon-btn svg { width: 18px; height: 18px; }
  .btn-login {
    display: inline-flex; align-items: center; text-decoration: none;
    border: 1px solid var(--border); border-radius: 999px;
    padding: 9px 18px; font-size: 0.88rem; font-weight: 600; color: var(--ink);
    white-space: nowrap; transition: border-color 0.15s ease, color 0.15s ease;
  }
  .btn-login:hover { border-color: var(--accent); color: var(--accent-text); }

  /* Logo + icons + login pill can outrun very narrow phones (~320px). The
     search icon gives first; the accessibility button always stays. */
  @media (max-width: 400px) {
    .icon-optional { display: none; }
    .header-actions { gap: 6px; }
    .btn-login { padding: 8px 12px; }
  }

  .a11y-wrap { position: relative; }
  .a11y-panel {
    position: absolute; top: 48px; right: 0; z-index: 20; width: 230px;
    background: var(--surface); color: var(--ink); border: 1px solid var(--border); border-radius: 12px;
    padding: 16px; box-shadow: 0 14px 32px rgba(11,37,69,0.18);
    display: flex; flex-direction: column; gap: 14px;
  }
  .a11y-panel[hidden] { display: none; }
  .a11y-row { display: flex; flex-direction: column; gap: 8px; }
  .a11y-label { font-size: 0.75rem; font-weight: 600; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.05em; }
  .a11y-seg { display: flex; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
  .a11y-seg button {
    flex: 1; border: none; border-right: 1px solid var(--border); background: var(--surface); color: var(--ink);
    padding: 7px 0; cursor: pointer; font-family: inherit; font-size: 0.85rem;
  }
  .a11y-seg button:last-child { border-right: none; }
  .a11y-seg button.active { background: var(--ink); color: #fff; }
  .a11y-check { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--ink); cursor: pointer; }
  .a11y-reset {
    align-self: flex-start; border: none; background: none; color: var(--accent-text);
    font-size: 0.8rem; font-weight: 600; cursor: pointer; padding: 0; text-decoration: underline;
  }

  html.a11y-text-large { font-size: 112.5%; }
  html.a11y-text-larger { font-size: 125%; }
  html.a11y-contrast {
    --ink: #000000; --ink-soft: #202020; --bg: #ffffff; --surface: #ffffff;
    --accent: #6b4a12; --accent-dark: #4a3208; --accent-text: #4a3208; --on-accent: #ffffff; --border: #000000;
  }
  html.a11y-underline a:not(.icon-btn):not(.btn-login):not(.btn-cta):not(.logo) { text-decoration: underline; }
  html.a11y-reduce-motion, html.a11y-reduce-motion * { transition: none !important; animation: none !important; }
  html.a11y-grayscale { filter: grayscale(1); }
  html.a11y-readable-font, html.a11y-readable-font * {
    font-family: Arial, Helvetica, sans-serif !important; letter-spacing: 0.01em;
  }
  html.a11y-big-cursor, html.a11y-big-cursor * {
    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path d="M3 2l7.6 19.2 2.5-8 8-2.4z" fill="black" stroke="white" stroke-width="1.2"/></svg>') 2 2, auto !important;
  }
  .a11y-reading-guide {
    position: fixed; left: 0; right: 0; height: 34px; margin-top: -17px; pointer-events: none; z-index: 9999;
    background: rgba(255,214,0,0.28); border-top: 2px solid rgba(153,109,0,0.75); border-bottom: 2px solid rgba(153,109,0,0.75);
    display: none;
  }
  .a11y-reading-guide.active { display: block; }

  footer.site { border-top: 1px solid var(--border); margin-top: 80px; padding: 32px 0; color: var(--ink-soft); font-size: 0.85rem; }
  footer.site .wrap { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  footer.site a { color: var(--ink-soft); }

  .breadcrumb { font-size: 0.85em; color: var(--ink-soft); margin-bottom: 16px; }
  .breadcrumb a { text-decoration: none; color: var(--accent-text); }

  .btn-cta {
    display: inline-block;
    background: var(--ink);
    color: #fff;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 12px 22px;
    border-radius: 999px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(11,37,69,0.3); }

  /* Shared across pages */
  .kicker {
    color: var(--accent-text); font-weight: 500; font-size: 0.72rem; text-transform: uppercase;
    letter-spacing: 0.2em;
  }
  .empty {
    padding: 24px; border: 1px dashed var(--border); border-radius: 12px; color: var(--ink-soft); font-size: 0.9rem;
  }
  .error {
    background: #fdecea; border: 1px solid #f3b4ab; color: #9c2c1f;
    padding: 10px 14px; border-radius: 10px; font-size: 0.88rem; margin-bottom: 16px;
  }
  .success {
    background: #eafaf3; border: 1px solid #9fe0c0; color: #146b43;
    padding: 10px 14px; border-radius: 10px; font-size: 0.88rem; margin-bottom: 16px;
  }
  .back-link { display: inline-block; margin-top: 18px; font-size: 0.85rem; color: var(--ink-soft); text-decoration: none; }
  .back-link:hover { color: var(--accent-text); }
  .photo-input {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }
  .photo-input:focus-visible + label { outline: 2px solid var(--accent-dark); outline-offset: 2px; }
  .profile-head { display: flex; align-items: center; gap: 18px; margin-bottom: 20px; }
  .profile-avatar {
    width: 64px; height: 64px; border-radius: 50%; flex: none; object-fit: cover;
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    color: var(--on-accent); display: flex; align-items: center; justify-content: center;
    font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.5rem;
  }
  .list { display: grid; gap: 16px; margin-top: 28px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
  .list a {
    display: block; background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    overflow: hidden; text-decoration: none; color: var(--ink);
  }
  .list img, .list .thumb-ph { width: 100%; height: 140px; object-fit: cover; display: block; }
  .list .thumb-ph { background: var(--border); }
  .list .copy { padding: 14px; }
  .list h3 { font-size: 1rem; margin: 0 0 4px; }
  .list p { margin: 0; font-size: 0.85rem; color: var(--ink-soft); }
`;

// Only hero pages (home, auth) include this: the transparent header over the
// photo, keyed off a body class rather than :has() so the logo always shows.
const HERO_CSS = `
  .hero {
    position: relative;
    display: flex;
    align-items: center;
    color: #fff;
    overflow: hidden;
    background-image: linear-gradient(rgba(5,32,48,0.38), rgba(5,32,48,0.38)), linear-gradient(180deg, rgba(6,20,36,0.15) 0%, rgba(6,20,36,0.3) 60%, rgba(6,20,36,0.75) 100%), url('https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Lighthouse_in_Chania._Crete%2C_Greece.jpg/1280px-Lighthouse_in_Chania._Crete%2C_Greece.jpg');
    background-size: cover;
    background-position: center 65%;
  }
  .hero .wrap { position: relative; z-index: 1; }
  body.hero-page header.site {
    position: absolute;
    top: 0; left: 0; right: 0; z-index: 5;
    background: transparent;
    border-bottom: none;
  }
  body.hero-page header.site .logo { color: #fff; }
  body.hero-page header.site .icon-btn {
    background: transparent; border-color: rgba(255,255,255,0.4); color: #fff;
  }
  body.hero-page header.site .icon-btn:hover { border-color: #fff; color: #fff; }
  body.hero-page header.site .btn-login { border-color: rgba(255,255,255,0.7); color: #fff; }
  body.hero-page header.site .btn-login:hover { border-color: #fff; }
  body.hero-page header.site :focus-visible { outline-color: #fff; }
`;

export const Layout: FC<
  PropsWithChildren<{
    title: string;
    description: string;
    jsonLd?: object;
    path?: string;
    noindex?: boolean; // private/utility pages: no canonical, robots noindex
    hero?: boolean; // transparent header over a hero photo
    page?: PageName; // page stylesheet in src/styles/pages (linked as /assets/page-<name>.<hash>.css)
    scripts?: ClientScriptName[]; // extra client scripts from src/client, loaded deferred after "site"
  }>
> = ({ title, description, jsonLd, path = "/", noindex, hero, page, scripts = [], children }) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <link rel="canonical" href={`https://wildock.com${path}`} />
      )}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
      <link
        href={`https://fonts.googleapis.com/css2?family=Fraunces:wght@300;400;500;600;700&family=Inter:wght@400;500;600&family=Montserrat:wght@300&display=swap`}
        rel="stylesheet"
      />
      {jsonLd && <script type="application/ld+json">{raw(safeJsonForScript(jsonLd))}</script>}
      <style>{raw(GLOBAL_CSS)}</style>
      {hero && <style>{raw(HERO_CSS)}</style>}
      <link rel="stylesheet" href={siteCssUrl} />
      {hero && <link rel="stylesheet" href={heroCssUrl} />}
      {page && <link rel="stylesheet" href={pageCssUrl(page)} />}
      <script defer src={scriptUrl("site")}></script>
      {scripts.map((n) => <script defer src={scriptUrl(n)}></script>)}
    </head>
    <body class={hero ? "hero-page" : undefined}>
      <a class="skip-link" href="#main">Skip to content</a>
      <header class="site">
        <div class="wrap">
          <a class="logo" href="/" aria-label="Wildock home">
            <svg class="logo-star" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 0l1 10.9L24 12l-11 1.1L12 24l-1-10.9L0 12l11-1.1z" />
              <path transform="rotate(45 12 12) translate(12 12) scale(.55) translate(-12 -12)" d="M12 0l1 10.9L24 12l-11 1.1L12 24l-1-10.9L0 12l11-1.1z" />
            </svg>
            <span class="logo-word" aria-hidden="true">WILDOCK</span>
            <svg class="logo-wave" aria-hidden="true" viewBox="0 0 100 14" preserveAspectRatio="none">
              <path d="M2 12C20 3 40 1 58 5s27 5 40-2C86 13 62 11 50 8S18 6 2 12z" />
            </svg>
          </a>
          <div class="header-actions">
            <a class="icon-btn icon-optional" href="/search" aria-label="Search">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </a>
            <div class="a11y-wrap">
              <button
                class="icon-btn"
                type="button"
                aria-label="Accessibility options"
                aria-expanded="false"
                aria-controls="a11y-panel"
                id="a11y-toggle"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="4.5" r="1.6" fill="currentColor" stroke="none" />
                  <path d="M4 8.5c2.5 1 5.3 1.5 8 1.5s5.5-.5 8-1.5" />
                  <path d="M12 10v11" />
                  <path d="M12 14l-4 7" />
                  <path d="M12 14l4 7" />
                  <path d="M8.5 13.5l7-1.5" />
                </svg>
              </button>
              <div class="a11y-panel" id="a11y-panel" role="group" aria-label="Accessibility options" hidden>
                <div class="a11y-row">
                  <span class="a11y-label">Text size</span>
                  <div class="a11y-seg">
                    <button type="button" data-a11y-text="">A</button>
                    <button type="button" data-a11y-text="large">A+</button>
                    <button type="button" data-a11y-text="larger">A++</button>
                  </div>
                </div>
                <label class="a11y-check"><input type="checkbox" id="a11y-contrast-check" /> High contrast</label>
                <label class="a11y-check"><input type="checkbox" id="a11y-grayscale-check" /> Grayscale</label>
                <label class="a11y-check"><input type="checkbox" id="a11y-underline-check" /> Underline links</label>
                <label class="a11y-check"><input type="checkbox" id="a11y-font-check" /> Readable font</label>
                <label class="a11y-check"><input type="checkbox" id="a11y-cursor-check" /> Big cursor</label>
                <label class="a11y-check"><input type="checkbox" id="a11y-guide-check" /> Reading guide</label>
                <label class="a11y-check"><input type="checkbox" id="a11y-motion-check" /> Reduce motion</label>
                <button type="button" class="a11y-reset" id="a11y-reset">Reset</button>
              </div>
            </div>
            <a class="icon-btn" href="/profile" aria-label="Profile" id="profile-link" style="display:none;">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
            </a>
            <a class="btn-login" href="/login" id="auth-link">Log in</a>
          </div>
        </div>
      </header>
      <script>{raw(`
        (function () {
          if (document.cookie.split('; ').indexOf('ui_logged_in=1') === -1) return;
          var authLink = document.getElementById('auth-link');
          var profileLink = document.getElementById('profile-link');
          if (authLink) authLink.style.display = 'none';
          if (profileLink) profileLink.style.display = 'inline-flex';
        })();
      `)}</script>
      <script>{raw(`
        (function () {
          var STORAGE_KEY = 'wildock-a11y';
          var toggle = document.getElementById('a11y-toggle');
          var panel = document.getElementById('a11y-panel');
          if (!toggle || !panel) return;
          var textButtons = panel.querySelectorAll('[data-a11y-text]');
          var contrastCheck = document.getElementById('a11y-contrast-check');
          var grayscaleCheck = document.getElementById('a11y-grayscale-check');
          var underlineCheck = document.getElementById('a11y-underline-check');
          var fontCheck = document.getElementById('a11y-font-check');
          var cursorCheck = document.getElementById('a11y-cursor-check');
          var guideCheck = document.getElementById('a11y-guide-check');
          var motionCheck = document.getElementById('a11y-motion-check');
          var resetBtn = document.getElementById('a11y-reset');

          var guideBar = document.createElement('div');
          guideBar.className = 'a11y-reading-guide';
          document.body.appendChild(guideBar);
          function onGuideMove(e) { guideBar.style.top = e.clientY + 'px'; }

          function load() {
            try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { return {}; }
          }
          function save(prefs) {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (e) {}
          }
          function apply(prefs) {
            var cl = document.documentElement.classList;
            cl.remove(
              'a11y-text-large', 'a11y-text-larger', 'a11y-contrast', 'a11y-grayscale',
              'a11y-underline', 'a11y-readable-font', 'a11y-big-cursor', 'a11y-reduce-motion',
            );
            if (prefs.text === 'large') cl.add('a11y-text-large');
            if (prefs.text === 'larger') cl.add('a11y-text-larger');
            if (prefs.contrast) cl.add('a11y-contrast');
            if (prefs.grayscale) cl.add('a11y-grayscale');
            if (prefs.underline) cl.add('a11y-underline');
            if (prefs.font) cl.add('a11y-readable-font');
            if (prefs.cursor) cl.add('a11y-big-cursor');
            if (prefs.motion) cl.add('a11y-reduce-motion');
            textButtons.forEach(function (btn) {
              var on = (btn.getAttribute('data-a11y-text') || '') === (prefs.text || '');
              btn.classList.toggle('active', on);
              btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
            if (contrastCheck) contrastCheck.checked = !!prefs.contrast;
            if (grayscaleCheck) grayscaleCheck.checked = !!prefs.grayscale;
            if (underlineCheck) underlineCheck.checked = !!prefs.underline;
            if (fontCheck) fontCheck.checked = !!prefs.font;
            if (cursorCheck) cursorCheck.checked = !!prefs.cursor;
            if (guideCheck) guideCheck.checked = !!prefs.guide;
            if (motionCheck) motionCheck.checked = !!prefs.motion;

            guideBar.classList.toggle('active', !!prefs.guide);
            document.removeEventListener('mousemove', onGuideMove);
            if (prefs.guide) document.addEventListener('mousemove', onGuideMove);
          }

          var prefs = load();
          apply(prefs);

          function openPanel() {
            panel.removeAttribute('hidden');
            toggle.setAttribute('aria-expanded', 'true');
            var first = panel.querySelector('button, input');
            if (first) first.focus();
          }
          function closePanel() {
            panel.setAttribute('hidden', '');
            toggle.setAttribute('aria-expanded', 'false');
          }

          toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            if (panel.hasAttribute('hidden')) openPanel(); else closePanel();
          });
          // Tabbing out of the panel closes it without stealing focus back.
          panel.addEventListener('focusout', function (e) {
            var next = e.relatedTarget;
            if (next && !panel.contains(next) && next !== toggle) closePanel();
          });
          document.addEventListener('click', function (e) {
            if (panel.hasAttribute('hidden')) return;
            if (panel.contains(e.target) || toggle.contains(e.target)) return;
            closePanel();
          });
          document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !panel.hasAttribute('hidden')) {
              closePanel();
              toggle.focus();
            }
          });

          textButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
              var value = btn.getAttribute('data-a11y-text') || '';
              if (value) prefs.text = value; else delete prefs.text;
              save(prefs);
              apply(prefs);
            });
          });
          if (contrastCheck) contrastCheck.addEventListener('change', function () {
            prefs.contrast = contrastCheck.checked; save(prefs); apply(prefs);
          });
          if (grayscaleCheck) grayscaleCheck.addEventListener('change', function () {
            prefs.grayscale = grayscaleCheck.checked; save(prefs); apply(prefs);
          });
          if (underlineCheck) underlineCheck.addEventListener('change', function () {
            prefs.underline = underlineCheck.checked; save(prefs); apply(prefs);
          });
          if (fontCheck) fontCheck.addEventListener('change', function () {
            prefs.font = fontCheck.checked; save(prefs); apply(prefs);
          });
          if (cursorCheck) cursorCheck.addEventListener('change', function () {
            prefs.cursor = cursorCheck.checked; save(prefs); apply(prefs);
          });
          if (guideCheck) guideCheck.addEventListener('change', function () {
            prefs.guide = guideCheck.checked; save(prefs); apply(prefs);
          });
          if (motionCheck) motionCheck.addEventListener('change', function () {
            prefs.motion = motionCheck.checked; save(prefs); apply(prefs);
          });
          if (resetBtn) resetBtn.addEventListener('click', function () {
            prefs = {}; save(prefs); apply(prefs);
          });
        })();
      `)}</script>
      <main id="main" tabindex={-1}>{children}</main>
      <footer class="site">
        <div class="wrap">
          <span>© {new Date().getFullYear()} Wildock, a global catalogue of docks, piers & marinas.</span>
          <span>
            <a href="/credits">Credits</a> · <a href="/accessibility">Accessibility</a> · <a href="/sitemap.xml">Sitemap</a>
          </span>
        </div>
      </footer>
    </body>
  </html>
);
