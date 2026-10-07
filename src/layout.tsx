import type { FC, PropsWithChildren } from "hono/jsx";
import { raw } from "hono/html";
import { safeJsonForScript } from "./lib/html";
import { siteCssUrl, heroCssUrl, pageCssUrl, scriptUrl } from "./lib/assets";
import type { PageName } from "./styles";
import type { ClientScriptName } from "./client";


// Only hero pages (home, auth) include this: the transparent header over the
// photo, keyed off a body class rather than :has() so the logo always shows.
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
