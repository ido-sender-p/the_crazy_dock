import { Layout } from "../layout";
import type { Dock } from "../data";
import { raw } from "hono/html";
import { safeJsonForScript } from "../lib/html";
import type { DockPhoto } from "../lib/gallery";

const GALLERY_PREVIEW_LIMIT = 6;

const PAGE_CSS = `
  .dock-page { padding: 40px 0 80px; }
  .dock-page figure { margin: 0; text-align: center; }
  .dock-page .hero-frame {
    display: inline-flex; max-width: 100%; background: var(--surface);
    border: 1px solid var(--border); border-radius: 14px; overflow: hidden;
    padding: 0; cursor: pointer; transition: opacity 0.15s ease;
  }
  .dock-page .hero-frame:hover { opacity: 0.9; }
  .dock-page img.hero-img {
    display: block; width: auto; height: auto; max-width: 100%; max-height: 620px;
  }

  .hero-lightbox {
    position: fixed; inset: 0; z-index: 50; background: rgba(6,14,26,0.92);
    display: none; align-items: center; justify-content: center; padding: 40px 20px; cursor: zoom-out;
  }
  .hero-lightbox.open { display: flex; }
  .hero-lightbox img { max-width: 100%; max-height: 90vh; border-radius: 10px; display: block; }
  .hero-lightbox .lb-close {
    position: fixed; top: 20px; right: 20px; border: none; background: rgba(255,255,255,0.12); color: #fff;
    border-radius: 50%; width: 44px; height: 44px; cursor: pointer; display: flex;
    align-items: center; justify-content: center; transition: background 0.15s ease;
  }
  .hero-lightbox .lb-close:hover { background: rgba(255,255,255,0.24); }
  .hero-lightbox .lb-close svg { width: 20px; height: 20px; }
  .dock-page figcaption { font-size: 0.75rem; color: var(--ink-soft); margin-top: 6px; }

  .no-photo-yet {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
    border: 1.5px dashed var(--border); border-radius: 14px; padding: 48px 16px;
    text-align: center; color: var(--ink-soft); margin: 24px 0 32px;
  }

  .hero-split {
    display: grid; grid-template-columns: 1fr 1fr; align-items: stretch;
    border: 1px solid var(--border); border-radius: 14px; overflow: hidden; margin: 24px 0 32px;
  }
  .hero-frame-split { border: none; padding: 0; margin: 0; cursor: pointer; display: block; background: none; }
  .hero-img-split { width: 100%; height: 100%; min-height: 320px; object-fit: cover; display: block; transition: opacity 0.15s ease; }
  .hero-frame-split:hover .hero-img-split { opacity: 0.9; }
  .hero-split-text { padding: 32px; display: flex; flex-direction: column; justify-content: center; gap: 12px; }
  .hero-split-text .desc { margin: 0; }
  .hero-split-text .hero-credit { font-size: 0.75rem; color: var(--ink-soft); }
  @media (max-width: 700px) {
    .hero-split { grid-template-columns: 1fr; }
    .hero-img-split { min-height: 240px; }
  }
  .dock-page h1 { font-size: 2.1rem; margin-top: 4px; }
  .dock-page .meta { color: var(--ink-soft); margin-bottom: 24px; }
  .dock-page .title-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .favorite-btn {
    display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--border);
    background: var(--surface); border-radius: 999px; padding: 7px 14px; cursor: pointer;
    font-size: 0.82rem; font-weight: 600; color: var(--ink); transition: border-color 0.15s ease;
  }
  .favorite-btn:hover { border-color: var(--accent); }
  .favorite-btn svg { width: 15px; height: 15px; }
  .favorite-btn.active { color: #c98a2b; border-color: #c98a2b; }
  .favorite-btn.active svg { fill: #c98a2b; }
  .facts {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px; margin: 28px 0; padding: 20px; background: var(--surface);
    border: 1px solid var(--border); border-radius: 12px;
  }
  .facts dt { font-weight: 600; color: var(--ink-soft); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }
  .facts dd { margin: 4px 0 0; font-size: 1.05rem; }
  .dock-page p.desc {
    font-family: 'Fraunces', Georgia, serif; font-size: 1.15rem; line-height: 1.7;
    max-width: 66ch; color: var(--ink); border-left: 3px solid var(--accent);
    padding: 4px 0 4px 22px; margin: 32px 0;
  }

  .gallery-section { margin: 36px 0; }
  .gallery-section h2 { font-size: 1.2rem; margin: 0 0 16px; }
  .gallery-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
  .gallery-tile {
    position: relative; display: block; border: none; padding: 0; margin: 0; cursor: pointer;
    border-radius: 10px; overflow: hidden; background: var(--surface); text-align: left;
    aspect-ratio: 4 / 3;
  }
  .gallery-tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .gallery-tile .caption {
    position: absolute; left: 0; right: 0; bottom: 0; padding: 6px 8px;
    background: linear-gradient(0deg, rgba(0,0,0,0.72), rgba(0,0,0,0));
    color: #fff; font-size: 0.72rem; line-height: 1.3;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .gallery-tile .more-overlay {
    position: absolute; inset: 0; background: rgba(11,37,69,0.72);
    color: #fff; display: flex; align-items: center; justify-content: center;
    font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.3rem;
  }
  .gallery-tile .leader-badge {
    position: absolute; top: 6px; right: 6px; background: rgba(201,138,43,0.92); color: #fff;
    font-size: 0.68rem; font-weight: 600; padding: 3px 8px; border-radius: 999px;
    display: flex; align-items: center; gap: 3px;
  }
  .gallery-tile .leader-badge svg { width: 11px; height: 11px; }

  .gallery-lightbox {
    position: fixed; inset: 0; z-index: 50; background: rgba(6,14,26,0.92);
    display: none; align-items: center; justify-content: center; padding: 40px 20px;
  }
  .gallery-lightbox.open { display: flex; }
  .gallery-lightbox figure { margin: 0; max-width: 900px; width: 100%; text-align: center; }
  .gallery-lightbox img { max-width: 100%; max-height: 72vh; border-radius: 10px; display: block; margin: 0 auto; }
  .gallery-lightbox h3#lb-title { color: #fff; font-family: 'Fraunces', serif; font-size: 1.15rem; margin: 16px 0 0; }
  .gallery-lightbox figcaption { color: #cddbe7; margin-top: 6px; font-size: 0.92rem; line-height: 1.5; }
  .gallery-lightbox .lb-close, .gallery-lightbox .lb-prev, .gallery-lightbox .lb-next {
    position: fixed; border: none; background: rgba(255,255,255,0.12); color: #fff;
    border-radius: 50%; width: 44px; height: 44px; cursor: pointer; display: flex;
    align-items: center; justify-content: center; transition: background 0.15s ease;
  }
  .gallery-lightbox .lb-close:hover, .gallery-lightbox .lb-prev:hover, .gallery-lightbox .lb-next:hover {
    background: rgba(255,255,255,0.24);
  }
  .gallery-lightbox .lb-close { top: 20px; right: 20px; }
  .gallery-lightbox .lb-prev { left: 20px; top: 50%; transform: translateY(-50%); }
  .gallery-lightbox .lb-next { right: 20px; top: 50%; transform: translateY(-50%); }
  .gallery-lightbox svg { width: 20px; height: 20px; }
  .lb-vote { margin-top: 16px; text-align: center; }
  .lb-vote .leader-tag {
    display: none; align-items: center; gap: 6px; justify-content: center;
    color: #f0c674; font-size: 0.85rem; font-weight: 600; margin-bottom: 10px;
  }
  .lb-vote .leader-tag.show { display: inline-flex; }
  .lb-vote .leader-tag svg { width: 15px; height: 15px; }
  .lb-vote .feedback { color: var(--accent); font-size: 0.82rem; margin-bottom: 10px; min-height: 1.2em; }
  .rating-row { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
  .rating-row button {
    width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.08); color: #fff; font-size: 0.8rem; font-weight: 600;
    cursor: pointer; transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }
  .rating-row button:hover { background: rgba(255,255,255,0.2); }
  .rating-row button.selected { background: var(--accent); border-color: var(--accent); color: #06121f; }
  .lb-vote a { color: #eef4f8; font-size: 0.85rem; text-decoration: underline; }

  .lb-comments { margin-top: 22px; text-align: left; max-width: 480px; margin-left: auto; margin-right: auto; }
  .lb-comments h4 { color: #eef4f8; font-size: 0.85rem; margin: 0 0 10px; font-weight: 600; }
  .lb-comments-list { display: flex; flex-direction: column; gap: 10px; max-height: 180px; overflow-y: auto; margin-bottom: 12px; }
  .lb-comment { font-size: 0.85rem; color: #d7e2ec; }
  .lb-comment .who { font-weight: 600; color: #f0c674; margin-right: 6px; }
  .lb-comments-empty { font-size: 0.82rem; color: #8fa3b8; }
  .lb-comment-form { display: flex; gap: 8px; }
  .lb-comment-form textarea {
    flex: 1; resize: none; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.08); color: #fff; padding: 8px 10px; font-family: inherit; font-size: 0.85rem;
  }
  .lb-comment-form button {
    border: none; border-radius: 8px; padding: 0 16px; background: var(--accent); color: #06121f;
    font-weight: 600; cursor: pointer; font-size: 0.85rem;
  }

  .contribute {
    margin-top: 40px; padding: 24px; border: 1px dashed var(--border); border-radius: 14px;
    display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
  }
  .contribute h3 { margin: 0 0 4px; font-size: 1.1rem; }
  .contribute p { margin: 0; color: var(--ink-soft); font-size: 0.9rem; max-width: 46ch; }
`;

const settlementPathPrefix: Record<Dock["settlementType"], string> = {
  city: "cities",
  town: "towns",
  village: "villages",
};

function galleryScript(photos: (DockPhoto & { yourRating: number | null; isTop: boolean })[], dockSlug: string) {
  return `
    (function () {
      var photos = ${safeJsonForScript(photos)};
      var dockSlug = ${safeJsonForScript(dockSlug)};
      var box = document.getElementById('gallery-lightbox');
      var img = document.getElementById('lb-img');
      var caption = document.getElementById('lb-caption');
      var titleEl = document.getElementById('lb-title');
      var leaderTag = document.getElementById('lb-leader');
      var feedback = document.getElementById('lb-feedback');
      var ratingButtons = document.querySelectorAll('.rating-row button');
      var commentsList = document.getElementById('lb-comments-list');
      var commentInput = document.getElementById('lb-comment-input');
      var commentSubmit = document.getElementById('lb-comment-submit');
      if (!box || !img || !caption || !photos.length) return;
      var index = 0;

      function renderComments(comments) {
        if (!commentsList) return;
        commentsList.textContent = '';
        if (!comments.length) {
          var empty = document.createElement('div');
          empty.className = 'lb-comments-empty';
          empty.textContent = 'No comments yet.';
          commentsList.appendChild(empty);
          return;
        }
        comments.forEach(function (c) {
          var row = document.createElement('div');
          row.className = 'lb-comment';
          var who = document.createElement('span');
          who.className = 'who';
          who.textContent = c.username;
          row.appendChild(who);
          row.appendChild(document.createTextNode(c.body));
          commentsList.appendChild(row);
        });
        commentsList.scrollTop = commentsList.scrollHeight;
      }

      function loadComments() {
        var p = photos[index];
        fetch('/docks/' + dockSlug + '/photos/' + p.id + '/comments')
          .then(function (r) { return r.json(); })
          .then(function (data) { renderComments(data.comments || []); });
      }

      if (commentSubmit && commentInput) {
        commentSubmit.addEventListener('click', function () {
          var text = commentInput.value.trim();
          if (!text) return;
          var p = photos[index];
          fetch('/docks/' + dockSlug + '/photos/' + p.id + '/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: text }),
          })
            .then(function (r) { return r.json(); })
            .then(function (data) {
              if (!data.comment) return;
              commentInput.value = '';
              loadComments();
            });
        });
      }
      // No counts or scores are ever shown — only whether this photo is the
      // current #1 (isTop, decided server-side), and which number, if any,
      // the viewer themselves already picked.
      function updateRatingUI() {
        var p = photos[index];
        if (leaderTag) leaderTag.classList.toggle('show', !!p.isTop);
        if (feedback) feedback.textContent = '';
        ratingButtons.forEach(function (btn) {
          btn.classList.toggle('selected', Number(btn.dataset.value) === p.yourRating);
        });
      }
      function show(i) {
        index = (i + photos.length) % photos.length;
        img.src = photos[index].image_url;
        img.alt = photos[index].title;
        if (titleEl) titleEl.textContent = photos[index].title;
        caption.textContent = photos[index].caption;
        updateRatingUI();
        loadComments();
      }
      function open(i) { show(i); box.classList.add('open'); }
      function close() { box.classList.remove('open'); }
      document.querySelectorAll('.gallery-tile').forEach(function (tile) {
        tile.addEventListener('click', function () { open(Number(tile.dataset.index)); });
      });
      document.getElementById('lb-close').addEventListener('click', close);
      document.getElementById('lb-prev').addEventListener('click', function () { show(index - 1); });
      document.getElementById('lb-next').addEventListener('click', function () { show(index + 1); });
      box.addEventListener('click', function (e) { if (e.target === box) close(); });
      document.addEventListener('keydown', function (e) {
        if (!box.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(index - 1);
        if (e.key === 'ArrowRight') show(index + 1);
      });
      ratingButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var p = photos[index];
          var rating = Number(btn.dataset.value);
          fetch('/docks/' + dockSlug + '/photos/' + p.id + '/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating: rating }),
          })
            .then(function (r) { return r.json(); })
            .then(function (data) {
              if (typeof data.avgRating !== 'number') return;
              p.yourRating = rating;
              ratingButtons.forEach(function (b) {
                b.classList.toggle('selected', Number(b.dataset.value) === rating);
              });
              if (feedback) feedback.textContent = 'Thanks for rating!';
            });
        });
      });
    })();
  `;
}

export function DockPage(
  d: Dock & { photos?: DockPhoto[]; isLoggedIn?: boolean; yourRatings?: Record<number, number>; isFavorited?: boolean },
) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: d.name,
    description: d.description,
    image: d.imageUrl,
    geo: { "@type": "GeoCoordinates", latitude: d.lat, longitude: d.lon },
    address: {
      "@type": "PostalAddress",
      addressLocality: d.settlement,
      addressRegion: d.stateProvince,
      addressCountry: d.country,
    },
  };

  // The only ranking signal shown to visitors: whichever photo currently has
  // the highest average rating, and only once someone has actually rated
  // something (otherwise every photo would misleadingly look "#1").
  const rawPhotos = d.photos ?? [];
  const topPhotoId = rawPhotos.some((p) => p.votes > 0)
    ? rawPhotos.reduce((best, p) => (p.avg_rating > best.avg_rating ? p : best)).id
    : null;

  const yourRatings = d.yourRatings ?? {};
  const photos = rawPhotos.map((p) => ({
    ...p,
    yourRating: yourRatings[p.id] ?? null,
    isTop: p.id === topPhotoId,
  }));

  return (
    <Layout
      title={`${d.name} · ${d.settlement}, ${d.country} | Wildock`}
      description={d.description.slice(0, 155)}
      jsonLd={jsonLd}
      path={`/docks/${d.slug}`}
    >
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap dock-page">
        <nav class="breadcrumb">
          <a href="/">Wildock</a> / <a href={`/continents/${d.continentSlug}`}>{d.continent}</a> /{" "}
          <a href={`/countries/${d.countryCode}`}>{d.country}</a> /{" "}
          <a href={`/regions/${d.stateProvinceSlug}`}>{d.stateProvince}</a> /{" "}
          <a href={`/${settlementPathPrefix[d.settlementType]}/${d.settlementSlug}`}>{d.settlement}</a> / {d.name}
        </nav>
        <div class="title-row">
          <h1>{d.name}</h1>
          <form method="post" action={`/docks/${d.slug}/favorite`}>
            <button class={`favorite-btn${d.isFavorited ? " active" : ""}`} type="submit">
              <svg viewBox="0 0 24 24" fill={d.isFavorited ? "currentColor" : "none"} stroke="currentColor" stroke-width="2">
                <path d="M12 4l2.47 5.77 6.28.55-4.75 4.13 1.42 6.13L12 17.27l-5.42 3.31 1.42-6.13-4.75-4.13 6.28-.55L12 4z" />
              </svg>
              {d.isFavorited ? "Favorited" : "Save"}
            </button>
          </form>
        </div>
        <p class="meta">{d.settlement}, {d.stateProvince}, {d.country} · {d.dockType.replace("_", " ")}</p>
        {!d.imageUrl ? (
          <div class="no-photo-yet">
            <p>No photo yet. Be the first to add one.</p>
            <a class="btn-cta" href={`/docks/${d.slug}/add-photo`}>Submit a photo</a>
          </div>
        ) : d.imageOrientation === "portrait" ? (
          <div class="hero-split">
            <button class="hero-frame-split" type="button" id="hero-open" aria-label={`View larger photo of ${d.name}`}>
              <img class="hero-img-split" src={d.imageUrl} alt={d.name} />
            </button>
            <div class="hero-split-text">
              {d.description && <p class="desc">{d.description}</p>}
              <span class="hero-credit">{d.imageAttribution}</span>
            </div>
          </div>
        ) : (
          <>
            <figure>
              <button class="hero-frame" type="button" id="hero-open" aria-label={`View larger photo of ${d.name}`}>
                <img class="hero-img" src={d.imageUrl} alt={d.name} />
              </button>
              <figcaption>{d.imageAttribution}</figcaption>
            </figure>
            {d.description && <p class="desc">{d.description}</p>}
          </>
        )}
        <dl class="facts">
          <div><dt>Type</dt><dd>{d.dockType.replace("_", " ")}</dd></div>
          <div><dt>Length</dt><dd>{d.lengthM} m</dd></div>
          <div><dt>Built</dt><dd>{d.yearBuilt ?? "Unknown"}</dd></div>
          <div><dt>Coordinates</dt><dd>{d.lat.toFixed(4)}, {d.lon.toFixed(4)}</dd></div>
        </dl>
        {photos.length > 0 && (
          <div class="gallery-section">
            <h2>More photos of {d.name}</h2>
            <div class="gallery-grid">
              {photos.slice(0, GALLERY_PREVIEW_LIMIT).map((p, i) => {
                const isLastTile = i === GALLERY_PREVIEW_LIMIT - 1;
                const remaining = photos.length - GALLERY_PREVIEW_LIMIT;
                return (
                  <button class="gallery-tile" data-index={i} type="button">
                    <img src={p.image_url} alt={p.title} loading="lazy" />
                    {isLastTile && remaining > 0 ? (
                      <span class="more-overlay">+{remaining} more</span>
                    ) : (
                      <>
                        {p.isTop && (
                          <span class="leader-badge">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            #1
                          </span>
                        )}
                        <span class="caption">{p.title}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div class="contribute">
          <div>
            <h3>Got a better photo of {d.name}?</h3>
            <p>Photographers & sailors welcome. Send us your shot and we'll add it here.</p>
          </div>
          <a class="btn-cta" href={`/docks/${d.slug}/add-photo`}>Submit a photo</a>
        </div>
      </div>

      <div class="hero-lightbox" id="hero-lightbox">
        <button class="lb-close" id="hero-close" type="button" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <img src={d.imageUrl} alt={d.name} />
      </div>
      <script>{raw(`
        (function () {
          var openBtn = document.getElementById('hero-open');
          var box = document.getElementById('hero-lightbox');
          var closeBtn = document.getElementById('hero-close');
          if (!openBtn || !box || !closeBtn) return;
          function open() { box.classList.add('open'); }
          function close() { box.classList.remove('open'); }
          openBtn.addEventListener('click', open);
          closeBtn.addEventListener('click', close);
          box.addEventListener('click', function (e) { if (e.target === box) close(); });
          document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && box.classList.contains('open')) close();
          });
        })();
      `)}</script>

      {photos.length > 0 && (
        <div class="gallery-lightbox" id="gallery-lightbox">
          <button class="lb-close" id="lb-close" type="button" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <button class="lb-prev" id="lb-prev" type="button" aria-label="Previous photo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button class="lb-next" id="lb-next" type="button" aria-label="Next photo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
          <figure>
            <img id="lb-img" src="" alt="" />
            <h3 id="lb-title"></h3>
            <figcaption id="lb-caption"></figcaption>
            <div class="lb-vote">
              <span class="leader-tag" id="lb-leader">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                Currently #1
              </span>
              <p class="feedback" id="lb-feedback"></p>
              {d.isLoggedIn ? (
                <div class="rating-row">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <button type="button" data-value={i + 1}>{i + 1}</button>
                  ))}
                </div>
              ) : (
                <a href={`/login?next=${encodeURIComponent(`/docks/${d.slug}`)}`}>Log in to rate this photo</a>
              )}
            </div>
            <div class="lb-comments">
              <h4>Comments</h4>
              <div class="lb-comments-list" id="lb-comments-list"></div>
              {d.isLoggedIn ? (
                <div class="lb-comment-form">
                  <textarea id="lb-comment-input" rows={1} maxlength={500} placeholder="Add a comment…"></textarea>
                  <button type="button" id="lb-comment-submit">Post</button>
                </div>
              ) : (
                <a href={`/login?next=${encodeURIComponent(`/docks/${d.slug}`)}`}>Log in to comment</a>
              )}
            </div>
          </figure>
        </div>
      )}
      {photos.length > 0 && <script>{raw(galleryScript(photos, d.slug))}</script>}
    </Layout>
  );
}
