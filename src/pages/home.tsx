import { Layout } from "../layout";
import { docks, dockTypes, continents, dockCountForType } from "../data";
import { buildMailto } from "../lib/contact";
import { raw } from "hono/html";
import { WORLD_MAP_VIEWBOX, CONTINENT_SHAPES } from "../continents";

const PAGE_CSS = `
  .hero {
    position: relative;
    min-height: 560px;
    display: flex;
    align-items: center;
    color: #fff;
    overflow: hidden;
    background-image: linear-gradient(100deg, rgba(4,14,26,0.78) 0%, rgba(4,14,26,0.55) 32%, rgba(4,14,26,0.15) 58%, rgba(4,14,26,0.25) 100%), linear-gradient(180deg, rgba(6,20,36,0.15) 0%, rgba(6,20,36,0.3) 60%, rgba(6,20,36,0.75) 100%), url('https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Lighthouse_in_Chania._Crete%2C_Greece.jpg/1280px-Lighthouse_in_Chania._Crete%2C_Greece.jpg');
    background-size: cover;
    background-position: center 65%;
  }
  .hero .wrap { position: relative; z-index: 1; max-width: 1080px; padding-top: 60px; padding-bottom: 60px; text-align: left; }
  .hero h1 {
    font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(2.2rem, 5.2vw, 3.9rem);
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin: 0;
    max-width: none;
    color: #fff;
    text-shadow: 0 2px 24px rgba(0,0,0,0.45);
  }

  section.block { padding: 64px 0; }
  section.block .kicker { color: var(--accent-dark); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; }
  section.block h2 { font-size: 1.8rem; margin-top: 6px; }
  section.block p.intro { color: var(--ink-soft); max-width: 620px; margin-bottom: 32px; }

  .grid { display: grid; gap: 20px; }
  .grid.types { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }

  .card-link {
    display: block;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 22px;
    text-decoration: none;
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  }
  .card-link:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(11,37,69,0.08); border-color: var(--accent); }
  .card-link .emoji { font-size: 1.8rem; }
  .world-map { width: 100%; margin-top: 8px; }
  .world-map svg { width: 100%; height: auto; display: block; }
  .world-map a { text-decoration: none; }
  .world-map .shape { fill: var(--accent-dark); fill-opacity: 0.24; transition: fill-opacity 0.15s ease; }
  .world-map a:hover .shape { fill-opacity: 0.42; }
  .world-map .label {
    font-family: 'Fraunces', serif; font-weight: 600; fill: var(--ink);
    text-anchor: middle; pointer-events: none;
  }
  .card-link h3 { font-size: 1.05rem; margin: 10px 0 4px; }
  .card-link p { margin: 0; font-size: 0.85rem; color: var(--ink-soft); }
  .card-link .count { display: inline-block; margin-top: 10px; font-size: 0.75rem; font-weight: 600; color: var(--accent-dark); }

  .map-teaser {
    display: block;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--surface);
  }
  #home-map { height: 320px; width: 100%; background: #0b2545; }
  .map-teaser-copy { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; }
  .map-teaser-copy strong { font-family: 'Fraunces', serif; font-size: 1.1rem; }
  .map-teaser-copy span:last-child { color: var(--ink-soft); font-size: 0.85rem; }
  .map-teaser-copy .btn-cta { padding: 8px 16px; font-size: 0.8rem; }

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
  .featured-card img { width: 100%; height: 100%; object-fit: cover; display: block; min-height: 260px; }
  .featured-card .copy { padding: 32px; display: flex; flex-direction: column; justify-content: center; }
  .featured-card .tag { font-size: 0.75rem; font-weight: 600; color: var(--accent-dark); text-transform: uppercase; letter-spacing: 0.05em; }
  .featured-card h3 { font-size: 1.5rem; margin: 8px 0 10px; }
  .featured-card p { color: var(--ink-soft); font-size: 0.95rem; }
  @media (max-width: 640px) { .featured-card { grid-template-columns: 1fr; } .featured-card img { min-height: 200px; } }

  .log { margin-top: 28px; border-top: 1px solid var(--border); }
  .log-entry {
    display: grid; grid-template-columns: 56px 1fr; gap: 20px;
    padding: 26px 0; border-bottom: 1px solid var(--border);
  }
  @media (max-width: 560px) { .log-entry { grid-template-columns: 36px 1fr; gap: 14px; } }
  .log-num { color: var(--accent-dark); width: 60px; height: 60px; }
  .log-entry h3 { font-family: 'Fraunces', serif; font-size: 1.15rem; margin: 0 0 6px; }
  .log-entry p {
    color: var(--ink); font-family: 'GFS Didot', 'Fraunces', serif;
    font-size: 1.15rem; line-height: 1.5; max-width: 60ch; margin: 0;
  }
  .how-note {
    margin-top: 22px; font-family: 'Fraunces', serif; font-style: italic;
    font-size: 0.9rem; color: var(--ink); max-width: 68ch; line-height: 1.5;
  }

  .trail { position: relative; margin-top: 32px; max-width: 620px; padding-left: 46px; }
  .trail::before {
    content: ''; position: absolute; left: 5px; top: 4px; bottom: 4px; width: 20px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='40' viewBox='0 0 20 40'%3E%3Cpath d='M10,0 C18,10 2,10 10,20 C18,30 2,30 10,40' fill='none' stroke='%23c9c2b0' stroke-width='2' stroke-dasharray='4 4' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: repeat-y; background-size: 20px 40px;
  }
  .sailboat { position: relative; z-index: 2; width: 60px; margin: 0 auto; color: var(--accent-dark); background: #ffffff; }
  .sailboat svg { width: 100%; height: auto; display: block; }
  .trail-stop { position: relative; padding-bottom: 48px; }
  .trail-stop:last-child { padding-bottom: 0; }
  .dock-marker {
    position: absolute; left: -46px; top: -4px; z-index: 1;
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    color: var(--accent-dark); background: #ffffff;
  }
  .dock-marker svg { width: 100%; height: 100%; }
  .trail-stop h3 { position: relative; z-index: 2; font-family: 'Fraunces', serif; font-size: 1.1rem; margin: 0 0 6px; background: #ffffff; padding: 0 10px; display: inline-block; }
  .trail-stop p { position: relative; z-index: 2; color: var(--ink-soft); font-size: 0.95rem; max-width: 56ch; margin: 0; background: #ffffff; padding: 2px 10px; }
  .footprints { position: absolute; left: -34px; bottom: 10px; width: 26px; height: 26px; opacity: 0.4; }
  .footprints ellipse { fill: var(--accent-dark); }

  .submit-cta {
    background: linear-gradient(135deg, #0b2545, #123a63);
    color: #fff;
    border-radius: 20px;
    padding: 48px;
    text-align: center;
  }
  .submit-cta h2 { color: #fff; font-size: 1.7rem; }
  .submit-cta p { color: #cfe0ee; max-width: 480px; margin: 8px auto 24px; }

  /* center all text on this page (hero stays left-aligned over the photo) */
  section.block, .map-teaser-copy, .featured-card .copy { text-align: center; }
  section.block p.intro, .how-note, .log-entry p, .trail-stop p { margin-left: auto; margin-right: auto; }
  .log-entry, .trail-stop { justify-items: center; }
  .log-entry { grid-template-columns: 1fr; }
  .trail { padding-left: 0; max-width: 480px; margin-left: auto; margin-right: auto; }
  .trail::before { left: 50%; margin-left: -10px; }
  .trail-stop { padding-top: 44px; }
  .dock-marker { position: static; margin: 0 auto 12px; }
  .footprints { position: static; display: block; margin: 10px auto 0; }
`;

const HOME_MAP_MARKERS = docks.map((d) => ({ name: d.name, slug: d.slug, lat: d.lat, lon: d.lon }));

const HOME_MAP_JS = `
  var docks = ${JSON.stringify(HOME_MAP_MARKERS)};
  var map = L.map('home-map', { scrollWheelZoom: false, zoomControl: false }).setView([20, 10], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);
  docks.forEach(function (d) {
    L.circleMarker([d.lat, d.lon], { radius: 6, color: '#0b2545', weight: 1.5, fillColor: '#2ec4b6', fillOpacity: 0.9 })
      .addTo(map)
      .bindPopup('<strong>' + d.name + '</strong><br><a href="/docks/' + d.slug + '">View dock</a>');
  });
  if (docks.length) {
    var bounds = L.latLngBounds(docks.map(function (d) { return [d.lat, d.lon]; }));
    map.fitBounds(bounds.pad(0.5), { maxZoom: 6 });
  }
`;

export function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Wildock",
    url: "https://wildock.com",
    description:
      "A growing global catalogue of docks, piers, marinas and floating structures — searchable by continent and type.",
  };

  const submitMailto = buildMailto(
    "New dock/pier submission — Wildock",
    "Hi Wildock team,\n\nI'd like to submit a dock, pier or marina for the catalogue:\n\nName:\nLocation (city/region/country):\nType (pier/marina/floating dock/industrial):\n\nPlease attach a photo to this email before sending.\n\nAnything else worth knowing about it?\n",
  );

  return (
    <Layout
      title="Wildock — A Global Catalogue of Docks, Piers & Marinas"
      description="Explore thousands of docks, piers, marinas and floating structures from around the world, each documented with photos, history and precise location."
      jsonLd={jsonLd}
      path="/"
    >
      <style>{raw(PAGE_CSS)}</style>

      <section class="hero">
        <div class="wrap">
          <h1>From the whispering seas to the legends of the lakes</h1>
        </div>
      </section>

      <div style="background: #ffffff;">
      <section class="block wrap" style="padding-bottom: 0;">
        <p class="intro" style="font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: 1.8rem; color: var(--ink); line-height: 1.3;">"Great walls, working boats, market stalls, and the people who bring them to life.<br />Docks tells many stories."</p>
        <hr style="border: none; border-top: 1px solid var(--border); max-width: 620px; margin: 40px auto;" />
        <h2>The Photos uploaded by the people who were there</h2>
      </section>

      <section class="block wrap" style="padding-top: 10px;">
        <div class="kicker">Get started</div>
        <h2>Your voyage, from dock to dock</h2>
        <div class="trail">
          <div class="sailboat">
            <svg viewBox="0 0 40 36" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M6,29 Q20,34 34,29" />
              <path d="M20,29 L20,4" />
              <path d="M20,6 Q31,15 20,26 Z" fill="currentColor" fill-opacity="0.15" />
              <path d="M8,26 Q17,17 20,8 Z" fill="currentColor" fill-opacity="0.15" />
              <path d="M2,32 Q8,30 14,32 Q20,34 26,32 Q32,30 38,32" stroke-width="1" opacity="0.5" />
            </svg>
          </div>
          <div class="trail-stop">
            <div class="dock-marker">
              <svg viewBox="0 0 24 34" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M12,4 C16,4 17,10 15,15 C14,19 13,23 12,29 C11,23 10,19 9,15 C7,10 8,4 12,4 Z" />
                <path d="M8.5,12.5 L15.5,12.5" />
                <path d="M8,18.5 L16,18.5" />
                <circle cx="12" cy="2.5" r="1.3" fill="currentColor" stroke="none" />
                <path d="M4,31 Q8,28.5 12,31 Q16,33.5 20,31" stroke-width="1.2" opacity="0.6" />
              </svg>
            </div>
            <h3>Explore &amp; rate</h3>
            <p>
              Wander the site and take in the photos people have shared. Found one you love?
              Rate it, and rate photos as you go, in general.
            </p>
            <svg class="footprints" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="12" cy="10" rx="4" ry="6" transform="rotate(-18 12 10)" />
              <ellipse cx="26" cy="22" rx="4" ry="6" transform="rotate(14 26 22)" />
              <ellipse cx="14" cy="34" rx="4" ry="6" transform="rotate(-16 14 34)" />
            </svg>
          </div>
          <div class="trail-stop">
            <div class="dock-marker">
              <svg viewBox="0 0 24 34" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M12,4 C16,4 17,10 15,15 C14,19 13,23 12,29 C11,23 10,19 9,15 C7,10 8,4 12,4 Z" />
                <path d="M8.5,12.5 L15.5,12.5" />
                <path d="M8,18.5 L16,18.5" />
                <circle cx="12" cy="2.5" r="1.3" fill="currentColor" stroke="none" />
                <path d="M4,31 Q8,28.5 12,31 Q16,33.5 20,31" stroke-width="1.2" opacity="0.6" />
              </svg>
            </div>
            <h3>Save your favorites</h3>
            <p>
              Found a spot you want to remember and come back to? Mark it as a favorite. Maybe it turns
              into a great trip. Maybe you can even reach out to whoever took the photo.
            </p>
            <svg class="footprints" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="12" cy="10" rx="4" ry="6" transform="rotate(-18 12 10)" />
              <ellipse cx="26" cy="22" rx="4" ry="6" transform="rotate(14 26 22)" />
              <ellipse cx="14" cy="34" rx="4" ry="6" transform="rotate(-16 14 34)" />
            </svg>
          </div>
          <div class="trail-stop">
            <div class="dock-marker">
              <svg viewBox="0 0 24 34" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M12,4 C16,4 17,10 15,15 C14,19 13,23 12,29 C11,23 10,19 9,15 C7,10 8,4 12,4 Z" />
                <path d="M8.5,12.5 L15.5,12.5" />
                <path d="M8,18.5 L16,18.5" />
                <circle cx="12" cy="2.5" r="1.3" fill="currentColor" stroke="none" />
                <path d="M4,31 Q8,28.5 12,31 Q16,33.5 20,31" stroke-width="1.2" opacity="0.6" />
              </svg>
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

      <section class="block wrap">
        <div class="log">
          <div class="log-entry">
            <svg class="log-num" viewBox="-6 -6 52 52" fill="none" stroke="currentColor" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
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
            </div>
          </div>
        </div>
        <p class="how-note">
          We encourage high-quality photos, but older photos with a meaningful or touching story are more
          than welcome too. Sometimes the story matters as much as the image.
        </p>
      </section>

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
          <div id="home-map" />
          <span class="map-teaser-copy">
            <span>
              <strong>Explore the map</strong>
              <br />
              <span>{docks.length} location{docks.length === 1 ? "" : "s"} pinned so far</span>
            </span>
            <a class="btn-cta" href="/map">Open full map</a>
          </span>
        </div>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>{raw(HOME_MAP_JS)}</script>
      </section>

      <section class="block wrap" id="types">
        <div class="kicker">Browse</div>
        <h2>By type of structure</h2>
        <div class="grid types">
          {dockTypes.map((t) => (
            <a class="card-link" href={`/type/${t.slug}`}>
              <div class="emoji">{t.emoji}</div>
              <h3>{t.label}</h3>
              <p>{t.blurb}</p>
              <span class="count">{dockCountForType(t.slug)} documented</span>
            </a>
          ))}
        </div>
      </section>

      <section class="block wrap">
        <div class="kicker">Featured</div>
        <h2>Pick of the week</h2>
        <a class="featured-card" href={`/docks/${docks[0].slug}`}>
          <img src={docks[0].imageUrl} alt={docks[0].name} />
          <div class="copy">
            <span class="tag">{docks[0].settlement}, {docks[0].country}</span>
            <h3>{docks[0].name}</h3>
            <p>{docks[0].description.slice(0, 160)}…</p>
          </div>
        </a>
      </section>

      <section class="block wrap">
        <div class="submit-cta">
          <h2>Know a dock, pier or marina we're missing?</h2>
          <p>
            Built for photographers and sailors. Send us a photo of the place and we'll add it to
            the catalogue. Credit guaranteed 📸
          </p>
          <a class="btn-cta" href={submitMailto}>Submit a dock</a>
        </div>
      </section>
    </Layout>
  );
}
