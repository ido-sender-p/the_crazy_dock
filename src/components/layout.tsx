import type { FC, PropsWithChildren } from "hono/jsx";
import { raw } from "hono/html";
import { safeJsonForScript } from "../lib/html";
import { siteCssUrl, heroCssUrl, pageCssUrl, scriptUrl } from "../lib/assets";
import { HERO_IMAGE_URL } from "../styles/hero";
import { SITE_ORIGIN } from "../lib/site";
import type { PageName } from "../styles";
import type { ClientScriptName } from "../client";


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
        <link rel="canonical" href={`${SITE_ORIGIN}${path}`} />
      )}
      {hero && <link rel="preconnect" href="https://upload.wikimedia.org" />}
      {hero && <link rel="preload" as="image" href={HERO_IMAGE_URL} fetchpriority="high" />}
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
            <a class="icon-btn profile-link-hidden" href="/profile" aria-label="Profile" id="profile-link">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
            </a>
            <a class="btn-login" href="/login" id="auth-link">Log in</a>
          </div>
        </div>
      </header>
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
