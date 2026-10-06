import { Layout } from "../layout";
import { docks, continents } from "../data";
import { raw } from "hono/html";
import { WORLD_MAP_VIEWBOX, CONTINENT_SHAPES } from "../continents";
import { LeafletCss, LeafletMap } from "./leaflet";
import { CardThumb, placeLabel } from "./shared";

const PAGE_CSS = `
  .hero { min-height: clamp(32rem, 82svh, 52rem); }
  .hero .wrap { max-width: 1320px; padding-top: 3.75rem; padding-bottom: 5.5rem; text-align: center; }
  /* soft dark pool behind the text so the light, busy part of the photo never sits under it */
  .hero::before {
    content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;
    background: radial-gradient(ellipse 75% 65% at 50% 52%, rgba(4,14,26,0.6) 0%, rgba(4,14,26,0.35) 45%, rgba(4,14,26,0) 80%);
  }
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
    font-weight: 500;
    line-height: 1.6;
    margin: 1.75rem auto 0;
    max-width: 38rem;
    color: #fff;
    text-shadow: 0 1px 3px rgba(0,0,0,0.6), 0 2px 18px rgba(0,0,0,0.55);
  }
  .hero-actions { display: flex; gap: 0.9rem; flex-wrap: wrap; justify-content: center; margin-top: 2.75rem; }
  /* plain serif text link with an arrow, no button chrome */
  .hero .hero-link {
    display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0;
    font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: clamp(1.05rem, 1.5vw, 1.25rem);
    color: #fff; text-decoration: none; text-shadow: 0 1px 3px rgba(0,0,0,0.6), 0 2px 18px rgba(0,0,0,0.55);
  }
  .hero .hero-link svg { width: 0.7em; height: 0.45em; position: relative; top: 0.14em; transition: transform 0.2s ease; }
  .hero .hero-link svg path { vector-effect: non-scaling-stroke; }
  .hero .hero-link:hover svg { transform: translateX(3px); }
  /* the photo dissolves into the page background so the hero flows into the next section */
  .hero::after {
    content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 48%; z-index: 0; pointer-events: none;
    background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, var(--bg) 92%);
  }

  /* one literary voice for every section: Fraunces, deep sea navy, plenty of air */
  section.block { padding: clamp(3rem, 8vw, 6rem) 0; }
  section.block .kicker { font-size: 0.72rem; font-weight: 500; letter-spacing: 0.2em; }
  section.block h2 {
    font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: clamp(1.5rem, 2.6vw, 2rem);
    letter-spacing: -0.005em; margin: 0.9rem 0 2.25rem;
  }

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
  .submit-cta .btn-cta { background: #fff; color: var(--ink); box-shadow: 0 4px 14px rgba(0,0,0,0.25); }

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
  .featured-card .copy { padding: clamp(1.5rem, 3.5vw, 2.75rem); display: flex; flex-direction: column; justify-content: center; }
  .featured-card .tag { font-size: 0.72rem; font-weight: 500; color: var(--accent-text); text-transform: uppercase; letter-spacing: 0.16em; }
  .featured-card h3 { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: clamp(1.3rem, 2vw, 1.6rem); margin: 0.6rem 0 0.9rem; }
  .featured-card p { font-family: 'Fraunces', Georgia, serif; font-weight: 300; color: #24405c; font-size: 1rem; line-height: 1.8; }
  @media (max-width: 640px) { .featured-card { grid-template-columns: 1fr; } .featured-card img, .featured-card .thumb-ph { aspect-ratio: 16 / 10; } .featured-card .copy { padding: 1.5rem 1.25rem; } }

  /* story block right after the hero: same serif, same navy, lots of air */
  .log { margin-top: 0; }
  .log-entry { display: grid; grid-template-columns: 1fr; justify-items: center; text-align: center; gap: 2rem; padding: clamp(2.5rem, 7vw, 5.5rem) 0; }
  .log-num { width: 3.5rem; height: 3.5rem; }
  .log-entry > div { max-width: 38rem; }
  .log-entry h3 {
    font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: clamp(1.25rem, 2vw, 1.55rem);
    letter-spacing: -0.005em; color: var(--ink); margin: 0 0 1.75rem;
  }
  .log-entry p {
    font-family: 'Fraunces', Georgia, serif; font-weight: 300; font-size: clamp(1.02rem, 1.4vw, 1.15rem);
    line-height: 1.9; color: #24405c; margin: 0 auto;
  }
  .log-entry p + p { margin-top: 1.75rem; }
  /* Get started: three steps, text first; the dashed route only links them in the gaps */
  .journey { max-width: 44rem; margin: 0 auto; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .step { display: flex; flex-direction: column; align-items: center; }
  .step-icon { width: 3.1rem; height: 3.1rem; margin-bottom: 1.4rem; color: var(--accent); }
  .step-icon svg { width: 100%; height: 100%; display: block; }
  .step h3 {
    font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: clamp(1.4rem, 2vw, 1.625rem);
    line-height: 1.25; letter-spacing: -0.005em; color: var(--ink); margin: 0 0 1rem;
  }
  .step p {
    font-family: 'Fraunces', Georgia, serif; font-weight: 400; font-size: clamp(1.05rem, 1.4vw, 1.125rem);
    line-height: 1.62; color: #1d3a56; max-width: 40rem; margin: 0;
  }
  .route { width: 1.4rem; height: 4.5rem; margin: 2.5rem 0; color: var(--accent); opacity: 0.75; }
  .route svg { width: 100%; height: 100%; display: block; }

  .submit-cta {
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, #0b2545 0%, #0b2545 60%, #123a63 100%);
    color: #fff;
    border-radius: 20px;
    padding: clamp(2.25rem, 6vw, 4rem);
    text-align: center;
  }
  .submit-cta .dock-scene { position: absolute; right: 10px; bottom: 0; width: 260px; height: auto; opacity: 0.9; }
  .submit-cta .cast-line { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.9; pointer-events: none; }
  .submit-cta .birds { position: absolute; left: 24px; top: 18px; width: 120px; height: 50px; opacity: 0.85; pointer-events: none; }
  .submit-cta h2 { color: #fff; font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: clamp(1.5rem, 2.6vw, 2rem); margin: 0 0 1.75rem; }

  /* hero and sections are all centered */
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
            <a class="hero-link" href="#map">
              Explore docks on the map
              <svg aria-hidden="true" viewBox="0 0 32 16" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 8h29M23.5 1.5L30 8l-6.5 6.5" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <section class="block wrap">
        <div class="log">
          <div class="log-entry">
            <svg class="log-num" aria-hidden="true" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <g fill="#b99a5f">
                <polygon points="48.4,48.4 51.6,51.6 74,26" />
                <polygon points="51.6,48.4 48.4,51.6 26,26" />
                <polygon points="51.6,48.4 48.4,51.6 74,74" />
                <polygon points="48.4,48.4 51.6,51.6 26,74" />
              </g>
              <g fill="#e2c995">
                <polygon points="50,4 44,46 50,50" />
                <polygon points="4,50 46,44 50,50" />
                <polygon points="50,96 44,54 50,50" />
                <polygon points="96,50 54,44 50,50" />
              </g>
              <g fill="#a98a52">
                <polygon points="50,4 56,46 50,50" />
                <polygon points="4,50 46,56 50,50" />
                <polygon points="50,96 56,54 50,50" />
                <polygon points="96,50 54,56 50,50" />
              </g>
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
        <div class="journey">
          <div class="step">
            <div class="step-icon"><svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="M50 4l6 40 40 6-40 6-6 40-6-40-40-6 40-6z" /><path transform="rotate(45 50 50) translate(50 50) scale(.5) translate(-50 -50)" d="M50 4l6 40 40 6-40 6-6 40-6-40-40-6 40-6z" opacity="0.6" /></svg></div>
            <h3>Explore &amp; rate</h3>
            <p>Wander the site and discover the photos people have shared. Found one you love? Rate it and keep exploring.</p>
          </div>
          <div class="route" aria-hidden="true"><svg viewBox="0 0 20 72" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="1 7"><path d="M10 2C18 14 2 24 10 36s8 22 0 34" /></svg></div>
          <div class="step">
            <div class="step-icon"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="20" cy="8" r="3.2" /><path d="M20 11.2V35" /><path d="M13 17h14" /><path d="M7 25c1 6.5 6.5 10 13 10s12-3.5 13-10" /><path d="M4.5 26.5L7 25l2 3" /><path d="M35.5 26.5L33 25l-2 3" /></svg></div>
            <h3>Save your favorites</h3>
            <p>Found a spot you want to remember? Mark it as a favorite. Maybe it becomes a future trip, or a note to the photographer.</p>
          </div>
          <div class="route" aria-hidden="true"><svg viewBox="0 0 20 72" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="1 7"><path d="M10 2C18 14 2 24 10 36s8 22 0 34" /></svg></div>
          <div class="step">
            <div class="step-icon"><svg viewBox="0 0 40 36" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6,29 Q20,34 34,29" /><path d="M20,29 L20,4" /><path d="M20,6 Q31,15 20,26 Z" fill="currentColor" fill-opacity="0.15" /><path d="M8,26 Q17,17 20,8 Z" fill="currentColor" fill-opacity="0.15" /><path d="M2,32 Q8,30 14,32 Q20,34 26,32 Q32,30 38,32" stroke-width="1" opacity="0.5" /></svg></div>
            <h3>Join in</h3>
            <p>Want to take a bigger part? Create an account, upload a photo with your own memory, and share it with the community.</p>
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
