import { Layout } from "../layout";
import { docks, dockTypes, continents, dockCountForType } from "../data";
import { buildMailto } from "../lib/contact";
import { raw } from "hono/html";

const PAGE_CSS = `
  .hero {
    background: radial-gradient(120% 160% at 15% 0%, #123a63 0%, #0b2545 55%, #082038 100%);
    color: #fff;
    padding: 88px 0 96px;
    position: relative;
    overflow: hidden;
  }
  .hero .wrap { position: relative; z-index: 1; max-width: 680px; }
  .hero .shore { position: absolute; right: 0; bottom: -1px; width: 46%; max-width: 560px; height: auto; z-index: 0; pointer-events: none; }
  @media (max-width: 860px) { .hero .shore { display: none; } }
  .hero .sun { position: absolute; left: 4%; top: 8%; width: 150px; height: 150px; z-index: 0; pointer-events: none; }
  @media (max-width: 860px) { .hero .sun { width: 100px; height: 100px; } }
  .hero h1 {
    font-family: 'Cinzel', 'Fraunces', Georgia, serif;
    font-weight: 600;
    font-size: clamp(2.1rem, 4.6vw, 3rem);
    letter-spacing: 0.05em;
    margin: 12px 0 16px;
    color: #fff;
    text-shadow: 0 2px 14px rgba(0,0,0,0.35);
  }
  .hero p.lede {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 1.05rem;
    line-height: 1.55;
    color: #cfe0ee;
    max-width: 540px;
    margin: 0;
  }
  .hero .wave { position: absolute; left: 0; right: 0; bottom: -1px; line-height: 0; }


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
    font-size: 1.05rem; color: var(--ink); max-width: 68ch; line-height: 1.5;
  }

  .trail { position: relative; margin-top: 32px; max-width: 620px; padding-left: 46px; }
  .trail::before {
    content: ''; position: absolute; left: 5px; top: 4px; bottom: 4px; width: 20px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='40' viewBox='0 0 20 40'%3E%3Cpath d='M10,0 C18,10 2,10 10,20 C18,30 2,30 10,40' fill='none' stroke='%23c9c2b0' stroke-width='2' stroke-dasharray='4 4' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: repeat-y; background-size: 20px 40px;
  }
  .sailboat { position: relative; z-index: 2; width: 60px; margin: 0 auto; color: var(--accent-dark); background: var(--bg); }
  .sailboat svg { width: 100%; height: auto; display: block; }
  .trail-stop { position: relative; padding-bottom: 48px; }
  .trail-stop:last-child { padding-bottom: 0; }
  .dock-marker {
    position: absolute; left: -46px; top: -4px; z-index: 1;
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    color: var(--accent-dark); background: var(--bg);
  }
  .dock-marker svg { width: 100%; height: 100%; }
  .trail-stop h3 { position: relative; z-index: 2; font-family: 'Fraunces', serif; font-size: 1.1rem; margin: 0 0 6px; background: var(--bg); padding: 0 10px; display: inline-block; }
  .trail-stop p { position: relative; z-index: 2; color: var(--ink-soft); font-size: 0.95rem; max-width: 56ch; margin: 0; background: var(--bg); padding: 2px 10px; }
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

  /* center all text on this page */
  .hero .wrap, section.block, .map-teaser-copy, .featured-card .copy { text-align: center; }
  section.block p.intro, .lede, .how-note, .log-entry p, .trail-stop p { margin-left: auto; margin-right: auto; }
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

// Real coastline data (Natural Earth continents), simplified and projected onto one
// shared 1000x460 canvas so every shape sits at its true relative position/size — this
// renders as a loose world map rather than a grid of icons.
const WORLD_MAP_VIEWBOX = "0 0 1000 460";
const CONTINENT_SHAPES: Record<string, { d: string; cx: number; cy: number }> = {
  europe: {
    d: "M530.5,151.7 L507.8,140.4 L457,156.1 L506.4,106.2 L567.7,97.3 L543.2,95.4 L546.6,80.6 L523,109.9 L498.8,100.8 L534.3,70.6 L597.7,75.6 L572.2,77.1 L587.6,86.5 L667.9,75.5 L642.9,105.8 L654.6,122.7 L614.2,125.3 L617,149.4 L571.9,132.6 L546.1,162.8 L517.7,137.5 L530.5,151.7 Z",
    cx: 562.5,
    cy: 116.7,
  },
  asia: {
    d: "M642.8,191.8 L617.1,180.6 L650.2,202.1 L604.6,228.9 L584.3,161.7 L556.3,152.9 L654.6,122.7 L676.6,61 L684.1,79.7 L773.4,47.6 L985,72 L920,122.5 L945,90.2 L860.2,111.2 L877.5,119.6 L843.6,166.2 L811.7,155.1 L816.8,193.6 L780.6,205.7 L776.4,240.2 L762,227.2 L773.8,260.5 L736.2,198.6 L699.5,241.7 L686.6,202.2 L642.8,191.8 Z",
    cx: 770.7,
    cy: 154.1,
  },
  africa: {
    d: "M485.4,248.1 L460.5,251.5 L434.6,223.1 L439.1,198 L468.3,164.2 L510.9,160.2 L512.1,170.2 L536.3,179.9 L544,172.4 L578.8,177 L578.9,187 L573.6,181.8 L602,232.2 L626.3,231.3 L617.2,251.6 L592.7,277.2 L597.3,305.3 L579.9,318.9 L582.3,331.6 L561.2,356.3 L539.2,361.3 L516.3,314.4 L522.1,294.8 L520.2,280.5 L507.7,266 L510.6,253.5 L494.1,245.8 L485.4,248.1 Z",
    cx: 530.5,
    cy: 260.8,
  },
  "north-america": {
    d: "M311.6,106.7 L328.3,119.1 L285.5,129.3 L313.6,138.1 L268.7,155.8 L259.5,194.1 L243.1,179.3 L211.1,187.7 L216.5,212 L241.5,204.5 L258.2,244.1 L191,210.4 L163,175.2 L171.2,195.3 L110.7,101.2 L66.5,92.9 L28.3,111.5 L46.6,99.4 L15,81.3 L47.1,65.4 L216.7,78.6 L220.1,63.6 L256.8,71.5 L219.3,98.1 L257.8,122 L267.5,89.9 L311.6,106.7 Z",
    cx: 171.7,
    cy: 153.9,
  },
  "south-america": {
    d: "M372.9,315.3 L366.3,328.1 L347.7,335.1 L332.6,360.8 L321.3,354.6 L325.5,367.1 L302,378 L306.3,383 L295.2,392.4 L300.2,397.9 L292.9,410 L279.2,412.4 L272.5,394.4 L281.1,388.1 L288.1,319.9 L257.3,281.2 L267.9,240.1 L283.8,229.5 L283.9,239 L288.4,230.2 L311.1,234.3 L324,248.9 L340.6,252.7 L344.4,261 L336.6,268.7 L351.7,265.9 L384.6,278.6 L372.9,315.3 Z",
    cx: 321,
    cy: 321,
  },
  oceania: {
    d: "M905.7,331.2 L910.3,336.5 L909.6,351.6 L901.3,368.8 L891.4,373.3 L887.3,369.7 L883.4,372.5 L875,370.1 L868.2,359.3 L864.8,362.6 L867.3,354.9 L862.3,361.8 L857.3,354.7 L848.9,351.9 L806.6,361.2 L798.9,337.3 L801.7,337.5 L801.2,325.1 L820.7,318.8 L834.6,303 L844.9,306.5 L847.3,298.8 L853.3,298 L851.2,295.2 L864,297.5 L860.9,305.8 L873.9,313.6 L880.8,294.2 L891,316.9 L905.7,331.2 Z",
    cx: 854.6,
    cy: 333.8,
  },
};

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
          <h1>From the thunder of the tide to the ancient lake legends</h1>
          <p class="lede">Weathered walls, working boats, and the people who breathe life into the docks. A port is built on their stories. Here, we share them.</p>
        </div>

        <svg class="sun" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#f4fbfa" stop-opacity="0.8" />
              <stop offset="45%" stop-color="#eaf6f3" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#eaf6f3" stop-opacity="0" />
            </radialGradient>
          </defs>
          <circle cx="75" cy="75" r="75" fill="url(#sunGlow)" />
          <circle cx="75" cy="75" r="26" fill="none" stroke="#f4fbfa" stroke-width="0.5" opacity="0.8" />
        </svg>

        <svg class="shore" viewBox="0 0 700 420" preserveAspectRatio="xMaxYMax meet" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#f4fbfa" stop-opacity="0.18" />
              <stop offset="100%" stop-color="#f4fbfa" stop-opacity="0" />
            </radialGradient>
          </defs>
          <g transform="translate(0,-40)">
          <g fill="#04121f" opacity="0.9">
            <ellipse cx="470" cy="392" rx="46" ry="34" />
            <ellipse cx="555" cy="400" rx="34" ry="26" />
            <ellipse cx="600" cy="378" rx="26" ry="20" />
          </g>
          <g fill="#0a2440" opacity="0.75">
            <ellipse cx="345" cy="404" rx="32" ry="22" />
            <ellipse cx="400" cy="410" rx="24" ry="16" />
            <ellipse cx="640" cy="400" rx="30" ry="20" />
          </g>
          <g fill="none" stroke="#eaf6f3" stroke-linecap="round">
            <path opacity="0.55" stroke-width="3" d="M230,340 C300,318 350,352 420,332 C490,312 540,344 610,326 C635,318 655,322 680,314" />
            <path opacity="0.4" stroke-width="3" d="M200,368 C280,348 330,378 410,360 C480,342 540,370 620,352 C645,346 660,350 685,344" />
            <path opacity="0.3" stroke-width="2.5" d="M180,396 C250,380 320,402 400,386 C470,370 540,398 630,382 C650,378 665,382 685,376" />
          </g>
          <g fill="#f4fbfa">
            <circle opacity="0.5" cx="440" cy="368" r="2.5" />
            <circle opacity="0.4" cx="500" cy="358" r="2" />
            <circle opacity="0.45" cx="560" cy="370" r="2.5" />
            <circle opacity="0.35" cx="480" cy="392" r="2" />
            <circle opacity="0.4" cx="610" cy="360" r="2" />
          </g>
          <g fill="none" stroke="#eaf6f3" stroke-linecap="round">
            <path opacity="0.6" stroke-width="3" d="M700,255 C620,248 520,258 430,268" />
            <path opacity="0.6" stroke-width="3" d="M700,270 C620,264 520,274 430,284" />
            <path opacity="0.55" stroke-width="2.5" d="M430,268 L430,284" />
            <path opacity="0.45" stroke-width="2" d="M480,262 L480,300" />
            <path opacity="0.4" stroke-width="2" d="M545,259 L545,312" />
            <path opacity="0.35" stroke-width="2" d="M615,256 L615,322" />
            <path opacity="0.3" stroke-width="2" d="M675,253 L675,332" />
          </g>
          <circle cx="500" cy="216" r="30" fill="url(#lampGlow)" />
          <g fill="none" stroke="#eaf6f3" stroke-linecap="round" stroke-linejoin="round">
            <path opacity="0.55" stroke-width="2.4" d="M500,261 L500,224" />
            <path opacity="0.6" stroke-width="1.6" d="M488,224 Q500,215 512,224" />
            <path opacity="0.6" stroke-width="1.4" d="M488,224 L512,224" />
            <path opacity="0.6" stroke-width="1.6" d="M491,218 Q500,215 509,218" />
            <path opacity="0.6" stroke-width="1.4" d="M491,218 L509,218" />
            <circle opacity="0.5" stroke-width="1.2" cx="500" cy="213" r="1.6" fill="#f4fbfa" />
          </g>
          <circle opacity="0.4" cx="500" cy="224" r="2" fill="#f4fbfa" />
          </g>
        </svg>

        <svg class="wave" viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#fbf9f4" d="M0,32L80,29C160,26,320,20,480,22C640,24,800,34,960,36C1120,38,1280,32,1360,29L1440,26L1440,60L0,60Z" />
        </svg>
      </section>

      <section class="block wrap">
        <div class="kicker">How it works</div>
        <h2>Photos uploaded by the people who were there</h2>
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

      <section class="block wrap">
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
