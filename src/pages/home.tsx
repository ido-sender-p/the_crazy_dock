import { Layout } from "../layout";
import { docks, continents } from "../data";
import { WORLD_MAP_VIEWBOX, CONTINENT_SHAPES } from "../continents";
import { LeafletCss, LeafletMap } from "./leaflet";
import { CardThumb, placeLabel } from "./shared";

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
    <Layout page="home"
      hero
      title="Wildock: A Global Catalogue of Docks, Piers & Marinas"
      description="Explore thousands of docks, piers, marinas and floating structures from around the world, each documented with photos, history and precise location."
      jsonLd={jsonLd}
      path="/"
    >

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
