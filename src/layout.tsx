import type { FC, PropsWithChildren } from "hono/jsx";
import { raw } from "hono/html";

const GLOBAL_CSS = `
  :root {
    --ink: #0b2545;
    --ink-soft: #45607a;
    --bg: #ffffff;
    --surface: #ffffff;
    --accent: #2ec4b6;
    --accent-dark: #17a094;
    --coral: #ff6b6b;
    --border: #e7e2d6;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Inter', system-ui, sans-serif;
    background: var(--bg);
    color: var(--ink);
    line-height: 1.55;
  }
  h1, h2, h3 { font-family: 'Fraunces', Georgia, serif; margin: 0 0 0.4em; line-height: 1.15; }
  a { color: inherit; }
  .wrap { max-width: 1320px; margin: 0 auto; padding: 0 24px; }

  .hero {
    position: relative;
    display: flex;
    align-items: center;
    color: #fff;
    overflow: hidden;
    background-image: linear-gradient(100deg, rgba(4,14,26,0.78) 0%, rgba(4,14,26,0.55) 32%, rgba(4,14,26,0.15) 58%, rgba(4,14,26,0.25) 100%), linear-gradient(180deg, rgba(6,20,36,0.15) 0%, rgba(6,20,36,0.3) 60%, rgba(6,20,36,0.75) 100%), url('https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Lighthouse_in_Chania._Crete%2C_Greece.jpg/1280px-Lighthouse_in_Chania._Crete%2C_Greece.jpg');
    background-size: cover;
    background-position: center 65%;
  }
  .hero .wrap { position: relative; z-index: 1; }

  header.site {
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  header.site:has(~ .hero) {
    position: absolute;
    top: 0; left: 0; right: 0; z-index: 5;
    background: transparent;
    border-bottom: none;
  }
  header.site .wrap {
    display: flex; align-items: center; justify-content: space-between; height: 64px; gap: 20px;
    max-width: none;
  }
  .logo { font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.3rem; text-decoration: none; color: var(--ink); white-space: nowrap; }
  .logo span { color: var(--accent-dark); }
  header.site:has(~ .hero) .logo { color: #fff; }
  header.site:has(~ .hero) .logo span { color: var(--accent); }
  .header-actions { display: flex; align-items: center; gap: 10px; }
  .icon-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 38px; height: 38px; border-radius: 50%;
    border: 1px solid var(--border); background: var(--surface); color: var(--ink-soft);
    cursor: pointer; transition: border-color 0.15s ease, color 0.15s ease;
  }
  .icon-btn:hover { border-color: var(--accent); color: var(--accent-dark); }
  .icon-btn svg { width: 18px; height: 18px; }
  header.site:has(~ .hero) .icon-btn {
    background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.4); color: #fff;
  }
  header.site:has(~ .hero) .icon-btn:hover { border-color: #fff; color: #fff; }
  .btn-login {
    display: inline-flex; align-items: center; text-decoration: none;
    border: 1px solid var(--border); border-radius: 999px;
    padding: 9px 18px; font-size: 0.88rem; font-weight: 600; color: var(--ink);
    white-space: nowrap; transition: border-color 0.15s ease, color 0.15s ease;
  }
  .btn-login:hover { border-color: var(--accent); color: var(--accent-dark); }
  header.site:has(~ .hero) .btn-login { border-color: rgba(255,255,255,0.7); color: #fff; }
  header.site:has(~ .hero) .btn-login:hover { border-color: #fff; }

  /* Logo + two icon buttons + login pill can outrun very narrow phones
     (~320px). The icons are the least essential nav, so they're what gives
     first when space runs out. */
  @media (max-width: 400px) {
    .icon-btn { display: none; }
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
  .a11y-seg button.active { background: var(--accent); color: #fff; }
  .a11y-check { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--ink); cursor: pointer; }
  .a11y-reset {
    align-self: flex-start; border: none; background: none; color: var(--accent-dark);
    font-size: 0.8rem; font-weight: 600; cursor: pointer; padding: 0; text-decoration: underline;
  }

  html.a11y-text-large { font-size: 112.5%; }
  html.a11y-text-larger { font-size: 125%; }
  html.a11y-contrast {
    --ink: #000000; --ink-soft: #202020; --bg: #ffffff; --surface: #ffffff;
    --accent: #006b60; --accent-dark: #00453e; --border: #000000;
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
  .breadcrumb a { text-decoration: none; color: var(--accent-dark); }

  .btn-cta {
    display: inline-block;
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    color: #fff;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 12px 22px;
    border-radius: 999px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(23,160,148,0.28); }
`;

export const Layout: FC<
  PropsWithChildren<{ title: string; description: string; jsonLd?: object; path?: string }>
> = ({ title, description, jsonLd, path = "/", children }) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`https://wildock.com${path}`} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600&family=Cinzel:wght@600;700&family=GFS+Didot&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap"
        rel="stylesheet"
      />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      <style>{raw(GLOBAL_CSS)}</style>
    </head>
    <body>
      <header class="site">
        <div class="wrap">
          <a class="logo" href="/">
            Wild<span>ock</span>
          </a>
          <div class="header-actions">
            <a class="icon-btn" href="/search" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="4.5" r="1.6" fill="currentColor" stroke="none" />
                  <path d="M4 8.5c2.5 1 5.3 1.5 8 1.5s5.5-.5 8-1.5" />
                  <path d="M12 10v11" />
                  <path d="M12 14l-4 7" />
                  <path d="M12 14l4 7" />
                  <path d="M8.5 13.5l7-1.5" />
                </svg>
              </button>
              <div class="a11y-panel" id="a11y-panel" hidden>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
              btn.classList.toggle('active', (btn.getAttribute('data-a11y-text') || '') === (prefs.text || ''));
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
          }
          function closePanel() {
            panel.setAttribute('hidden', '');
            toggle.setAttribute('aria-expanded', 'false');
          }

          toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            if (panel.hasAttribute('hidden')) openPanel(); else closePanel();
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
      {children}
      <footer class="site">
        <div class="wrap">
          <span>© {new Date().getFullYear()} Wildock, a global catalogue of docks, piers & marinas.</span>
          <span>
            <a href="/accessibility">Accessibility</a> · <a href="/sitemap.xml">Sitemap</a>
          </span>
        </div>
      </footer>
    </body>
  </html>
);
