import { Layout } from "../layout";
import { docks, continents } from "../data";
import { raw } from "hono/html";
import { WORLD_MAP_VIEWBOX, CONTINENT_SHAPES } from "../continents";
import { LeafletCss, LeafletMap } from "./leaflet";
import { CardThumb, DockIcon, Footprints, placeLabel } from "./shared";

const PAGE_CSS = `
  .hero { min-height: 560px; }
  .hero .wrap { max-width: 1320px; padding-top: 60px; padding-bottom: 60px; text-align: left; }
  .hero h1 {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 600;
    font-size: clamp(2.2rem, 5.2vw, 3.9rem);
    letter-spacing: -0.01em;
    line-height: 1.15;
    margin: 0;
    max-width: none;
    color: #fff;
    text-shadow: 0 2px 24px rgba(0,0,0,0.45);
  }
  .hero p.tagline {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 400;
    font-size: clamp(1rem, 1.6vw, 1.2rem);
    line-height: 1.5;
    margin: 18px 0 0;
    max-width: 620px;
    color: #eef4f8;
    text-shadow: 0 1px 12px rgba(0,0,0,0.35);
  }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 44px; }
  .hero .btn-cta { margin-top: 0; padding: 12px 24px; font-size: 0.95rem; }

  section.block { padding: 64px 0; }
  section.block h2 { font-size: 1.8rem; margin-top: 6px; }

  .world-map { width: 100%; margin-top: 8px; }
  .world-map svg { width: 100%; height: auto; display: block; }
  .world-map a { text-decoration: none; }
  .world-map .shape { fill: var(--accent-dark); fill-opacity: 0.24; transition: fill-opacity 0.15s ease; }
  .world-map a:hover .shape { fill-opacity: 0.42; }
  .world-map .label {
    font-family: 'Fraunces', serif; font-weight: 600; fill: var(--ink);
    text-anchor: middle; pointer-events: none;
  }

  .map-teaser {
    position: relative;
    display: block;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--surface);
  }
  #home-map { width: 100%; height: auto; aspect-ratio: 16 / 8; background: #0b2545; }
  /* the button floats over the map corner; z-index keeps it above Leaflet's panes and controls */
  .map-teaser-copy { position: absolute; top: 0.9rem; right: 0.9rem; z-index: 1000; display: flex; }
  .map-teaser-copy .btn-cta {
    display: inline-flex; align-items: center; gap: 9px; padding: 10px 20px; font-size: 0.85rem;
  }
  .map-teaser-copy .btn-cta svg { width: 16px; height: 16px; }
  .map-teaser-copy .btn-cta { box-shadow: 0 4px 14px rgba(11,37,69,0.35); }
  /* on dark panels the navy button would vanish, so it flips to white with navy text */
  .hero .btn-cta, .submit-cta .btn-cta { background: #fff; color: var(--ink); box-shadow: 0 4px 14px rgba(0,0,0,0.25); }

  .featured-card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    background: var(--surface);
    text-decoration: none;
    color: var(--ink);
  }
  .featured-card img, .featured-card .thumb-ph { width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: cover; object-position: center 40%; display: block; }
  .featured-card .thumb-ph { background: var(--border); }
  .featured-card .copy { padding: 32px; display: flex; flex-direction: column; justify-content: center; }
  .featured-card .tag { font-size: 0.75rem; font-weight: 600; color: var(--accent-text); text-transform: uppercase; letter-spacing: 0.05em; }
  .featured-card h3 { font-size: 1.5rem; margin: 8px 0 10px; }
  .featured-card p { color: var(--ink-soft); font-size: 0.95rem; }
  @media (max-width: 640px) { .featured-card { grid-template-columns: 1fr; } .featured-card img, .featured-card .thumb-ph { aspect-ratio: 16 / 10; } .featured-card .copy { padding: 1.5rem 1.25rem; } }

  .log { margin-top: 28px; border-top: 1px solid var(--border); }
  .log-entry { display: grid; grid-template-columns: 1fr; justify-items: center; gap: 20px; padding: 26px 0; }
  .log-num { color: var(--accent-text); width: 60px; height: 60px; }
  .log-entry h3 { font-family: 'Fraunces', serif; font-size: 1.15rem; margin: 0 0 6px; }
  .log-entry p {
    color: var(--ink); font-family: 'GFS Didot', 'Fraunces', serif;
    font-size: 1.15rem; line-height: 1.5; max-width: 60ch; margin: 0 auto;
  }
  .trail { position: relative; margin: 32px auto 0; max-width: 480px; }
  .trail::before {
    content: ''; position: absolute; left: 50%; margin-left: -10px; top: 4px; bottom: 4px; width: 20px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='40' viewBox='0 0 20 40'%3E%3Cpath d='M10,0 C18,10 2,10 10,20 C18,30 2,30 10,40' fill='none' stroke='%23c9c2b0' stroke-width='2' stroke-dasharray='4 4' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: repeat-y; background-size: 20px 40px;
  }
  .sailboat { position: relative; z-index: 2; width: 60px; margin: 0 auto; color: var(--accent-text); background: #ffffff; }
  .sailboat svg { width: 100%; height: auto; display: block; }
  .trail-stop { position: relative; padding: 44px 0 48px; }
  .trail-stop:last-child { padding-bottom: 0; }
  .dock-marker {
    width: 34px; height: 34px; margin: 0 auto 12px;
    display: flex; align-items: center; justify-content: center;
    color: var(--accent-text); background: #ffffff;
  }
  .dock-marker svg { width: 100%; height: 100%; }
  .trail-stop h3 { position: relative; z-index: 2; font-family: 'Fraunces', serif; font-size: 1.1rem; margin: 0 0 6px; background: #ffffff; padding: 0 10px; display: inline-block; }
  .trail-stop p { position: relative; z-index: 2; color: var(--ink-soft); font-size: 0.95rem; max-width: 56ch; margin: 0 auto; background: #ffffff; padding: 2px 10px; }
  .footprints { display: block; margin: 10px auto 0; width: 26px; height: 26px; opacity: 0.4; }
  .footprints ellipse { fill: var(--accent-dark); }

  .submit-cta {
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, #0b2545 0%, #0b2545 60%, #123a63 100%);
    color: #fff;
    border-radius: 20px;
    padding: 48px;
    text-align: center;
  }
  .submit-cta .dock-scene { position: absolute; right: 10px; bottom: 0; width: 260px; height: auto; opacity: 0.9; }
  .submit-cta .cast-line { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.9; pointer-events: none; }
  .submit-cta .birds { position: absolute; left: 24px; top: 18px; width: 120px; height: 50px; opacity: 0.85; pointer-events: none; }
  .submit-cta h2 { color: #fff; font-size: 1.7rem; }

  /* the hero stays left-aligned over the photo; everything else is centered */
  section.block, .map-teaser-copy, .featured-card .copy { text-align: center; }

  @media (max-width: 640px) {
    #home-map { aspect-ratio: 4 / 3; }
    .submit-cta { padding: 32px 20px; }
    .submit-cta .dock-scene, .submit-cta .cast-line, .submit-cta .birds { display: none; }
  }
`;

export function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Wildock",
    url: "https://wildock.com",
    description:
      "A growing global catalogue of docks, piers, marinas and floating structures, searchable by continent and type.",
  };

  const featured = docks[0];
  const featuredDesc = featured
    ? featured.description.length > 160
      ? `${featured.description.slice(0, 160)}…`
      : featured.description
    : "";

  return (
    <Layout
      hero
      displayFonts
      title="Wildock: A Global Catalogue of Docks, Piers & Marinas"
      description="Explore thousands of docks, piers, marinas and floating structures from around the world, each documented with photos, history and precise location."
      jsonLd={jsonLd}
      path="/"
    >
      <style>{raw(PAGE_CSS)}</style>

      <section class="hero">
        <div class="wrap">
          <h1>From the whisper of seas<br />To the legends of the lakes</h1>
          <p class="tagline">Wildock is on a mission to map every dock in the world and give people a place to share their stories about them.</p>
          <div class="hero-actions">
            <a class="btn-cta" href="#continents">Explore docks around the world</a>
          </div>
        </div>
      </section>

      <section class="block wrap">
        <div class="log">
          <div class="log-entry">
            <svg class="log-num" aria-hidden="true" viewBox="-6 -6 52 52" fill="none" stroke="currentColor" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="24" stroke-width="1" opacity="0.6" />
              <circle cx="20" cy="20" r="18" stroke-width="1.2" />
              <text x="20" y="-1" text-anchor="middle" dominant-baseline="middle" font-size="7" font-family="'Cinzel', serif" fill="currentColor" stroke="none">Β</text>
              <text x="41" y="20" text-anchor="middle" dominant-baseline="middle" font-size="7" font-family="'Cinzel', serif" fill="currentColor" stroke="none">Α</text>
              <text x="20" y="41" text-anchor="middle" dominant-baseline="middle" font-size="7" font-family="'Cinzel', serif" fill="currentColor" stroke="none">Ν</text>
              <text x="-1" y="20" text-anchor="middle" dominant-baseline="middle" font-size="7" font-family="'Cinzel', serif" fill="currentColor" stroke="none">Δ</text>
              {Array.from({ length: 28 }).map((_, i) => {
                const angle = (i / 28) * Math.PI * 2;
                return (
                  <circle
                    cx={20 + 19.2 * Math.cos(angle)}
                    cy={20 + 19.2 * Math.sin(angle)}
                    r="0.7"
                    fill="currentColor"
                    stroke="none"
                    opacity="0.6"
                  />
                );
              })}
              <polygon points="20,6 24,20 16,20" fill="currentColor" stroke="none" />
              <polygon points="20,34 24,20 16,20" fill="none" stroke-width="1.1" />
              <circle cx="20" cy="20" r="1.6" fill="currentColor" stroke="none" />
            </svg>
            <div>
              <h3>The best shot wins the page</h3>
              <p>For each marina or port, the photo with the most votes from the community becomes the one everyone sees first, together with the memory, the moment, and the story behind it.</p>
              <p>To keep exposure fair, the gallery shows photos in a fresh random order every time you open it, regardless of when each one was uploaded.</p>
            </div>
          </div>
        </div>
      </section>


      <div style="background: #ffffff;">
      <section class="block wrap" style="padding-top: 0;">
        <div class="kicker">Get started</div>
        <h2>Your voyage, from dock to dock</h2>
        <div class="trail">
          <div class="sailboat">
            <svg aria-hidden="true" viewBox="0 0 40 36" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M6,29 Q20,34 34,29" />
              <path d="M20,29 L20,4" />
              <path d="M20,6 Q31,15 20,26 Z" fill="currentColor" fill-opacity="0.15" />
              <path d="M8,26 Q17,17 20,8 Z" fill="currentColor" fill-opacity="0.15" />
              <path d="M2,32 Q8,30 14,32 Q20,34 26,32 Q32,30 38,32" stroke-width="1" opacity="0.5" />
            </svg>
          </div>
          <div class="trail-stop">
            <div class="dock-marker">
              <DockIcon />
            </div>
            <h3>Explore &amp; rate</h3>
            <p>
              Wander the site and take in the photos people have shared. Found one you love?
              Rate it, and keep exploring from there.
            </p>
            <Footprints />
          </div>
          <div class="trail-stop">
            <div class="dock-marker">
              <DockIcon />
            </div>
            <h3>Save your favorites</h3>
            <p>
              Found a spot you want to remember? Mark it as a favorite.<br />
              Maybe it turns into a trip, or a note to the photographer.
            </p>
            <Footprints />
          </div>
          <div class="trail-stop">
            <div class="dock-marker">
              <DockIcon />
            </div>
            <h3>Join in</h3>
            <p>
              Want to take a bigger part? Create an account, upload a photo with your own memory
              attached, and share it with everyone.
            </p>
          </div>
        </div>
      </section>
      </div>


      {featured && (
        <section class="block wrap" style="padding-top: 160px;">
          <div class="kicker">Featured</div>
          <h2>Pick of the week</h2>
          <a class="featured-card" href={`/docks/${featured.slug}`}>
            {featured.imageUrl ? (
              <img src={featured.imageUrl} alt="" width={640} height={420} loading="lazy" decoding="async" />
            ) : (
              <div class="thumb-ph" aria-hidden="true" />
            )}
            <div class="copy">
              <span class="tag">{placeLabel(featured.settlement, featured.country)}</span>
              <h3>{featured.name}</h3>
              <p>{featuredDesc}</p>
            </div>
          </a>
        </section>
      )}

      <section class="block wrap" id="continents">
        <div class="kicker">Browse</div>
        <h2>By continent</h2>
        <div class="world-map">
          <svg viewBox={WORLD_MAP_VIEWBOX} xmlns="http://www.w3.org/2000/svg">
            {continents.map((ct) => {
              const shape = CONTINENT_SHAPES[ct.slug];
              return (
                <a href={`/continents/${ct.slug}`}>
                  <path class="shape" d={shape.d} />
                  <text class="label" x={shape.cx} y={shape.cy} font-size="20">{ct.name}</text>
                </a>
              );
            })}
          </svg>
        </div>
      </section>

      <section class="block wrap" id="map">
        <div class="kicker">Browse</div>
        <h2>By map</h2>
        <div class="map-teaser">
          <div id="home-map" role="region" aria-label="Map of docks" />
          <span class="map-teaser-copy">
            <a class="btn-cta" href="/map">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              Open map
            </a>
          </span>
        </div>
        <LeafletCss />
        <LeafletMap elementId="home-map" radius={6} zoomControl={false} />
      </section>

      <section class="block wrap">
        <div class="submit-cta">
          <svg class="birds" viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 14 Q10.5 7 15 14 Q19.5 7 24 14" stroke="#cfe0ee" stroke-width="1.3" stroke-linecap="round" />
            <path d="M48.7 6 Q51.85 1.1 55 6 Q58.15 1.1 61.3 6" stroke="#cfe0ee" stroke-width="1.1" stroke-linecap="round" />
            <path d="M75.35 22 Q79.18 15.98 83 22 Q86.83 15.98 90.65 22" stroke="#cfe0ee" stroke-width="1.2" stroke-linecap="round" />
          </svg>
          <svg class="dock-scene" viewBox="0 0 220 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="0" y="82" width="220" height="18" fill="#0d3059" />
            <path d="M0 82 Q 30 77 60 82 T 120 82 T 180 82 T 220 82 V 100 H 0 Z" fill="#123a63" />
            <line x1="8" y1="52" x2="212" y2="52" stroke="#cfe0ee" stroke-width="3" stroke-linecap="round" />
            <line x1="18" y1="52" x2="18" y2="86" stroke="#cfe0ee" stroke-width="3" stroke-linecap="round" />
            <line x1="68" y1="52" x2="68" y2="86" stroke="#cfe0ee" stroke-width="3" stroke-linecap="round" />
            <line x1="118" y1="52" x2="118" y2="86" stroke="#cfe0ee" stroke-width="3" stroke-linecap="round" />
            <line x1="168" y1="52" x2="168" y2="86" stroke="#cfe0ee" stroke-width="3" stroke-linecap="round" />
            <line x1="204" y1="52" x2="204" y2="86" stroke="#cfe0ee" stroke-width="3" stroke-linecap="round" />
            <line x1="8" y1="41" x2="212" y2="41" stroke="#cfe0ee" stroke-width="1.5" stroke-linecap="round" />
            <line x1="8" y1="41" x2="8" y2="52" stroke="#cfe0ee" stroke-width="1.5" />
            <line x1="33" y1="41" x2="33" y2="52" stroke="#cfe0ee" stroke-width="1.5" />
            <line x1="58" y1="41" x2="58" y2="52" stroke="#cfe0ee" stroke-width="1.5" />
            <line x1="83" y1="41" x2="83" y2="52" stroke="#cfe0ee" stroke-width="1.5" />
            <line x1="108" y1="41" x2="108" y2="52" stroke="#cfe0ee" stroke-width="1.5" />
            <line x1="133" y1="41" x2="133" y2="52" stroke="#cfe0ee" stroke-width="1.5" />
            <line x1="158" y1="41" x2="158" y2="52" stroke="#cfe0ee" stroke-width="1.5" />
            <line x1="183" y1="41" x2="183" y2="52" stroke="#cfe0ee" stroke-width="1.5" />
            <line x1="212" y1="41" x2="212" y2="52" stroke="#cfe0ee" stroke-width="1.5" />
            <circle cx="150" cy="27" r="6" fill="#cfe0ee" />
            <line x1="150" y1="33" x2="150" y2="52" stroke="#cfe0ee" stroke-width="3" stroke-linecap="round" />
            <line x1="150" y1="39" x2="136" y2="32" stroke="#cfe0ee" stroke-width="2.5" stroke-linecap="round" />
            <line x1="136" y1="32" x2="62" y2="13" stroke="#cfe0ee" stroke-width="1.2" stroke-linecap="round" />
          </svg>
          <svg class="cast-line" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M 85 47 C 78 35, 73 16, 71 14 C 68 22, 65 32, 65 42 L 65 99"
              stroke="#cfe0ee"
              stroke-width="1"
              stroke-linecap="round"
              fill="none"
              vector-effect="non-scaling-stroke"
            />
          </svg>
          <h2>Know a dock, pier or marina we're missing?</h2>
          <a class="btn-cta" href="/submit">Submit a dock</a>
        </div>
      </section>
    </Layout>
  );
}
