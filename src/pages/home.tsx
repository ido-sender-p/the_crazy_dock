import { Layout } from "../layout";
import { docks, dockTypes, continents, dockCountForType, dockCountForContinent, totalPhotoCount } from "../data";
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
  .hero h1 {
    font-family: 'Pirata One', 'Fraunces', Georgia, serif;
    font-weight: 400;
    font-size: clamp(2.4rem, 5.5vw, 3.6rem);
    letter-spacing: 0.015em;
    margin: 12px 0 16px;
    color: #fff;
    text-shadow: 0 2px 14px rgba(0,0,0,0.35);
  }
  .hero .wave { position: absolute; left: 0; right: 0; bottom: -1px; line-height: 0; }

  .stats { position: relative; z-index: 2; margin-top: 0; padding-bottom: 8px; }
  .stats .wrap { max-width: 1240px; }
  .stats-card {
    display: flex;
    background: var(--surface);
    border-radius: 16px;
    box-shadow: 0 24px 48px rgba(11,37,69,0.16), 0 2px 6px rgba(11,37,69,0.06);
    overflow: hidden;
  }
  .stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 6px;
    padding: 16px 20px;
    border-left: 1px solid var(--border);
  }
  .stat:first-child { border-left: none; }
  .stat .stat-icon {
    display: flex; align-items: center; justify-content: center;
    width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(46,196,182,0.15), rgba(23,160,148,0.08));
    color: var(--accent-dark);
  }
  .stat .stat-icon svg { width: 17px; height: 17px; }
  .stat b { font-family: 'Fraunces', serif; font-size: 1.5rem; color: var(--ink); display: block; line-height: 1; }
  .stat span { font-size: 0.72rem; color: var(--ink-soft); display: block; margin-top: 2px; }
  @media (max-width: 720px) { .stats-card { flex-direction: column; } .stat { border-left: none; border-top: 1px solid var(--border); } .stat:first-child { border-top: none; } }

  section.block { padding: 64px 0; }
  section.block .kicker { color: var(--accent-dark); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; }
  section.block h2 { font-size: 1.8rem; margin-top: 6px; }
  section.block p.intro { color: var(--ink-soft); max-width: 620px; margin-bottom: 32px; }

  .grid { display: grid; gap: 20px; }
  .grid.types { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
  .grid.continents { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }

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
  .card-link .badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 40px; height: 40px; border-radius: 10px;
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    color: #fff; font-family: 'Fraunces', serif; font-weight: 600; font-size: 0.85rem; letter-spacing: 0.03em;
  }
  .card-link h3 { font-size: 1.05rem; margin: 10px 0 4px; }
  .card-link p { margin: 0; font-size: 0.85rem; color: var(--ink-soft); }
  .card-link .count { display: inline-block; margin-top: 10px; font-size: 0.75rem; font-weight: 600; color: var(--accent-dark); }

  .map-teaser {
    display: block;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--border);
    text-decoration: none;
    color: var(--ink);
    background: var(--surface);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .map-teaser:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(11,37,69,0.08); }
  .map-teaser svg { width: 100%; height: auto; display: block; }
  .map-teaser-copy { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; }
  .map-teaser-copy strong { font-family: 'Fraunces', serif; font-size: 1.1rem; }
  .map-teaser-copy span:last-child { color: var(--ink-soft); font-size: 0.85rem; }

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

  .submit-cta {
    background: linear-gradient(135deg, #0b2545, #123a63);
    color: #fff;
    border-radius: 20px;
    padding: 48px;
    text-align: center;
  }
  .submit-cta h2 { color: #fff; font-size: 1.7rem; }
  .submit-cta p { color: #cfe0ee; max-width: 480px; margin: 8px auto 24px; }
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
          <h1>From the whispers of the sea to glassy lakes shaped by sailors, captured by us</h1>
        </div>

        <svg class="shore" viewBox="0 0 700 420" preserveAspectRatio="xMaxYMax meet" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0,-70)">
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
          </g>
        </svg>

        <svg class="wave" viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#fbf9f4" d="M0,32L80,29C160,26,320,20,480,22C640,24,800,34,960,36C1120,38,1280,32,1360,29L1440,26L1440,60L0,60Z" />
        </svg>
      </section>

      <section class="block wrap" id="continents">
        <div class="kicker">Browse</div>
        <h2>By continent</h2>
        <p class="intro">
          The long-term goal is every continent — right now the catalogue is deepest in Europe.
        </p>
        <div class="grid continents">
          {continents.map((ct) => (
            <a class="card-link" href={`/continents/${ct.slug}`}>
              <div class="badge">{ct.name.slice(0, 2).toUpperCase()}</div>
              <h3>{ct.name}</h3>
              <span class="count">{dockCountForContinent(ct.slug)} documented</span>
            </a>
          ))}
        </div>
      </section>

      <section class="block wrap" id="map">
        <div class="kicker">Browse</div>
        <h2>By map</h2>
        <p class="intro">
          Prefer to just look? See every documented dock plotted by location.
        </p>
        <a class="map-teaser" href="/map">
          <svg viewBox="0 0 400 140" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="140" fill="#0b2545" />
            <g fill="#7fa8cf" opacity="0.3">
              {Array.from({ length: 8 }).map((_, row) =>
                Array.from({ length: 24 }).map((_, col) =>
                  (row + col) % 3 !== 0 ? <circle cx={col * 17 + 8} cy={row * 17 + 8} r="1.3" /> : null,
                ),
              )}
            </g>
            {docks.map((d) => (
              <circle cx={((d.lon + 180) / 360) * 400} cy={((90 - d.lat) / 180) * 140} r="5" fill="#7fe7dc" stroke="#0b2545" stroke-width="1.5" />
            ))}
          </svg>
          <span class="map-teaser-copy">
            <strong>Explore the map</strong>
            <span>{docks.length} location{docks.length === 1 ? "" : "s"} pinned so far</span>
          </span>
        </a>
      </section>

      <section class="block wrap" id="types">
        <div class="kicker">Browse</div>
        <h2>By type of structure</h2>
        <p class="intro">
          Piers, marinas, floating docks and industrial berths each have their own quirks — browse by
          the kind of structure you're after.
        </p>
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

      <section class="stats">
        <div class="wrap">
          <div class="stats-card">
            <div class="stat">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v13" />
                  <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
                </svg>
              </div>
              <div>
                <b>{docks.length}</b>
                <span>docks documented</span>
              </div>
            </div>
            <div class="stat">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18" />
                  <path d="M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3z" />
                </svg>
              </div>
              <div>
                <b>{continents.length}</b>
                <span>continents on the map</span>
              </div>
            </div>
            <div class="stat">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 3l9 5-9 5-9-5 9-5z" />
                  <path d="M3 13l9 5 9-5" />
                </svg>
              </div>
              <div>
                <b>{dockTypes.length}</b>
                <span>structure types tracked</span>
              </div>
            </div>
            <div class="stat">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="6" width="18" height="14" rx="2" />
                  <path d="M8 6l1.5-2.5h5L16 6" />
                  <circle cx="12" cy="13" r="3.5" />
                </svg>
              </div>
              <div>
                <b>{totalPhotoCount()}</b>
                <span>photos in the catalogue</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="block wrap">
        <div class="submit-cta">
          <h2>Know a dock, pier or marina we're missing?</h2>
          <p>
            Built for photographers and sailors — send us a photo of the place and we'll add it to
            the catalogue. Credit guaranteed 📸
          </p>
          <a class="btn-cta" href={submitMailto}>Submit a dock</a>
        </div>
      </section>
    </Layout>
  );
}
