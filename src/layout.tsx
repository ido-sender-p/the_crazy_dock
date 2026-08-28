import type { FC, PropsWithChildren } from "hono/jsx";
import { raw } from "hono/html";

const GLOBAL_CSS = `
  :root {
    --ink: #0b2545;
    --ink-soft: #45607a;
    --bg: #fbf9f4;
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
  .wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }

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
  header.site .wrap { display: flex; align-items: center; justify-content: space-between; height: 64px; gap: 20px; }
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
            <button class="icon-btn" type="button" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </button>
            <button class="icon-btn" type="button" aria-label="Accessibility options">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="4.5" r="1.6" fill="currentColor" stroke="none" />
                <path d="M4 8.5c2.5 1 5.3 1.5 8 1.5s5.5-.5 8-1.5" />
                <path d="M12 10v11" />
                <path d="M12 14l-4 7" />
                <path d="M12 14l4 7" />
                <path d="M8.5 13.5l7-1.5" />
              </svg>
            </button>
            <a class="btn-login" href="#">Log in</a>
          </div>
        </div>
      </header>
      {children}
      <footer class="site">
        <div class="wrap">
          <span>© {new Date().getFullYear()} Wildock — a global catalogue of docks, piers & marinas.</span>
          <span>
            <a href="/sitemap.xml">Sitemap</a>
          </span>
        </div>
      </footer>
    </body>
  </html>
);
