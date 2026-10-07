import { Layout } from "../layout";
import { slugify, type Dock } from "../data";
import { raw } from "hono/html";
import { safeJsonForScript } from "../lib/html";
import type { DockPhoto } from "../lib/gallery";
import { parsePhotoCredit, WIKIPEDIA_LICENSE } from "../lib/credits";
import { vibe, count, type Nearby } from "../lib/nearby";
import { placeLabel } from "./shared";

const GALLERY_PREVIEW_LIMIT = 6;

// Credits are stored as "text" or "text|url"; with a url the text links out
// (Commons file page, Wikipedia article) as the CC licences require. Only
// http(s) urls become links, anything else renders as plain text.
function Credit({ value, prefix = "" }: { value: string; prefix?: string }) {
  const [text, url] = value.split("|");
  if (!url || !/^https?:\/\//i.test(url.trim())) return <>{prefix}{text}</>;
  return <>{prefix}<a href={url.trim()} target="_blank" rel="noopener noreferrer">{text}</a></>;
}

// Photo credit with a link to the licence and a note that the image was resized and cropped
// (the CC licences ask for both). Credits that don't parse (e.g. user photos) stay plain text.
function PhotoCreditLine({ value }: { value: string }) {
  const c = parsePhotoCredit(value);
  if (!c) return <Credit value={value} />;
  return (
    <>
      Photo: {c.author},{" "}
      {c.licenseUrl ? <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer license">{c.license}</a> : c.license}, via{" "}
      {c.sourceUrl ? <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> : "Wikimedia Commons"}. Resized and
      cropped.
    </>
  );
}

function TextCreditLine({ value }: { value: string }) {
  return (
    <>
      <Credit value={value} prefix="Text from " /> (<a href={WIKIPEDIA_LICENSE.url} target="_blank" rel="noopener noreferrer license">{WIKIPEDIA_LICENSE.name}</a>), shortened.
    </>
  );
}

// "Around the dock": counts of nearby places from OpenStreetMap plus a one-line feel.
function AroundSection({ name, nearby, dockType }: { name: string; nearby: Nearby; dockType: string }) {
  const v = vibe(nearby, dockType);
  const tiles: [number, string][] = [
    [nearby.eat, "places to eat & drink"],
    [nearby.stay, "places to stay"],
    [nearby.shops, "shops"],
    [nearby.sights, "sights & museums"],
    [nearby.historic, "historic sites"],
    [nearby.beaches, "beaches"],
  ];
  const shown = tiles.filter(([n]) => n > 0);
  const extras: string[] = [];
  if (nearby.malls.length) extras.push(`Shopping centre${nearby.malls.length > 1 ? "s" : ""}: ${nearby.malls.join(", ")}`);
  if (nearby.landmarks.length) extras.push(`Worth a look: ${nearby.landmarks.join(", ")}`);
  if (nearby.stations) extras.push("A railway station is within a short walk");
  if (nearby.ferries) extras.push("A ferry terminal is nearby");
  return (
    <section class="around" aria-labelledby="around-h">
      <h2 id="around-h">Around {name}</h2>
      <p class="around-vibe"><strong>{v.label}.</strong> {v.blurb}</p>
      {shown.length > 0 && (
        <ul class="around-tiles">
          {shown.map(([n, label]) => (
            <li><span class="num">{count(n, nearby.capped)}</span><span class="lbl">{label}</span></li>
          ))}
        </ul>
      )}
      {extras.length > 0 && (
        <ul class="around-extras">
          {extras.map((e) => <li>{e}</li>)}
        </ul>
      )}
      <p class="around-src">
        Counted within about 1 km from{" "}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> data (&copy; OpenStreetMap contributors, ODbL).
      </p>
    </section>
  );
}

const settlementPathPrefix: Record<Dock["settlementType"], string> = {
  city: "cities",
  town: "towns",
  village: "villages",
};

// Shared by both lightboxes: keep Tab inside the open dialog.
const FOCUS_TRAP_JS = `
  function focusables(box) {
    return Array.prototype.slice.call(
      box.querySelectorAll('button, a[href], textarea, input, select, [tabindex]:not([tabindex="-1"])'),
    ).filter(function (el) { return !el.disabled && el.getClientRects().length > 0; });
  }
  function trapTab(box, e) {
    if (e.key !== 'Tab') return;
    var f = focusables(box);
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    var outside = !box.contains(document.activeElement);
    if (e.shiftKey && (document.activeElement === first || outside)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || outside)) {
      e.preventDefault();
      first.focus();
    }
  }
`;

// Only these fields ever reach the page: votes and averages stay server-side.
type ClientPhoto = Pick<DockPhoto, "id" | "image_url" | "title" | "caption"> & {
  yourRating: number | null;
  isTop: boolean;
};

function galleryScript(photos: ClientPhoto[], dockSlug: string) {
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
      var closeBtn = document.getElementById('lb-close');
      if (!box || !img || !caption || !closeBtn || !photos.length) return;
      var index = 0;
      var opener = null;
      ${FOCUS_TRAP_JS}
      function say(msg, bad) {
        if (!feedback) return;
        feedback.textContent = msg;
        feedback.classList.toggle('bad', !!bad);
      }
      function isTyping(t) {
        return !!t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
      }
      // Rejects with a message that is safe to show the visitor.
      function api(url, opts) {
        return fetch(url, opts).then(
          function (r) {
            if (r.status === 401) throw new Error('Please log in again');
            if (r.status === 429) throw new Error('Slow down a little, you have reached a limit. Try again later.');
            if (r.status === 404) throw new Error('This photo is no longer available.');
            if (!r.ok) throw new Error('Something went wrong. Please try again.');
            return r.json();
          },
          function () { throw new Error('Network problem. Check your connection and try again.'); },
        );
      }

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
        api('/docks/' + dockSlug + '/photos/' + p.id + '/comments')
          .then(function (data) {
            if (photos[index] === p) renderComments(data.comments || []);
          })
          .catch(function () {
            if (photos[index] !== p || !commentsList) return;
            commentsList.textContent = 'Could not load comments.';
          });
      }

      if (commentSubmit && commentInput) {
        commentSubmit.addEventListener('click', function () {
          var text = commentInput.value.trim();
          if (!text) return;
          var p = photos[index];
          api('/docks/' + dockSlug + '/photos/' + p.id + '/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: text }),
          })
            .then(function (data) {
              if (!data.comment) { say('Could not post your comment.', true); return; }
              commentInput.value = '';
              say('');
              if (photos[index] === p) loadComments();
            })
            .catch(function (err) { say(err.message, true); });
        });
      }
      // No counts or scores are ever shown. Only whether this photo is the
      // current #1 (isTop, decided server-side), and which number, if any,
      // the viewer themselves already picked.
      function markSelected(value) {
        ratingButtons.forEach(function (btn) {
          var on = Number(btn.dataset.value) === value;
          btn.classList.toggle('selected', on);
          btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      }
      function updateRatingUI() {
        var p = photos[index];
        if (leaderTag) leaderTag.classList.toggle('show', !!p.isTop);
        say('');
        markSelected(p.yourRating);
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
      function open(i) {
        opener = document.activeElement;
        show(i);
        box.classList.add('open');
        closeBtn.focus();
      }
      function close() {
        box.classList.remove('open');
        if (opener && opener.focus) opener.focus();
        opener = null;
      }
      document.querySelectorAll('.gallery-tile').forEach(function (tile) {
        tile.addEventListener('click', function () { open(Number(tile.dataset.index)); });
      });
      closeBtn.addEventListener('click', close);
      document.getElementById('lb-prev').addEventListener('click', function () { show(index - 1); });
      document.getElementById('lb-next').addEventListener('click', function () { show(index + 1); });
      box.addEventListener('click', function (e) { if (e.target === box) close(); });
      document.addEventListener('keydown', function (e) {
        if (!box.classList.contains('open')) return;
        if (e.key === 'Escape') { close(); return; }
        trapTab(box, e);
        if (isTyping(e.target)) return;
        if (e.key === 'ArrowLeft') show(index - 1);
        if (e.key === 'ArrowRight') show(index + 1);
      });
      ratingButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var p = photos[index];
          var rating = Number(btn.dataset.value);
          api('/docks/' + dockSlug + '/photos/' + p.id + '/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating: rating }),
          })
            .then(function () {
              p.yourRating = rating;
              if (photos[index] !== p) return;
              markSelected(rating);
              say('Thanks for rating!');
            })
            .catch(function (err) { say(err.message, true); });
        });
      });
    })();
  `;
}

const HERO_LIGHTBOX_JS = `
  (function () {
    var openBtn = document.getElementById('hero-open');
    var box = document.getElementById('hero-lightbox');
    var closeBtn = document.getElementById('hero-close');
    if (!openBtn || !box || !closeBtn) return;
    var opener = null;
    ${FOCUS_TRAP_JS}
    function open() {
      opener = document.activeElement;
      box.classList.add('open');
      closeBtn.focus();
    }
    function close() {
      box.classList.remove('open');
      if (opener && opener.focus) opener.focus();
      opener = null;
    }
    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else trapTab(box, e);
    });
  })();
`;

export function DockPage(
  d: Dock & { photos?: DockPhoto[]; isLoggedIn?: boolean; yourRatings?: Record<number, number>; isFavorited?: boolean },
) {
  // Catalogue docks can lack a state or settlement, so every tier is optional.
  const hasState = !!(d.stateProvince && d.stateProvinceSlug);
  const hasSettlement = !!(d.settlement && d.settlementSlug);
  const place = placeLabel(d.settlement, d.stateProvince, d.country);
  const titlePlace = placeLabel(d.settlement, d.country);
  const typeLabel = d.dockType.replaceAll("_", " ");

  const address: Record<string, string> = { "@type": "PostalAddress" };
  if (d.settlement) address.addressLocality = d.settlement;
  if (d.stateProvince) address.addressRegion = d.stateProvince;
  if (d.country) address.addressCountry = d.country;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: d.name,
    description: d.description,
    ...(d.imageUrl ? { image: d.imageUrl } : {}),
    geo: { "@type": "GeoCoordinates", latitude: d.lat, longitude: d.lon },
    address,
  };

  // The only ranking signal shown to visitors: whichever photo currently has
  // the highest average rating, and only once someone has actually rated
  // something (otherwise every photo would misleadingly look "#1").
  const rawPhotos = d.photos ?? [];
  const topPhotoId = rawPhotos.some((p) => p.votes > 0)
    ? rawPhotos.reduce((best, p) => (p.avg_rating > best.avg_rating ? p : best)).id
    : null;

  const yourRatings = d.yourRatings ?? {};
  const photos: ClientPhoto[] = rawPhotos.map((p) => ({
    id: p.id,
    image_url: p.image_url,
    title: p.title,
    caption: p.caption,
    yourRating: yourRatings[p.id] ?? null,
    isTop: p.id === topPhotoId,
  }));

  const loginHref = `/login?next=${encodeURIComponent(`/docks/${d.slug}`)}`;

  return (
    <Layout page="dock"
      title={`${d.name}${titlePlace ? ` · ${titlePlace}` : ""} | Wildock`}
      description={d.description.slice(0, 155)}
      jsonLd={jsonLd}
      path={`/docks/${d.slug}`}
    >
      <div class="wrap dock-page">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Wildock</a> / <a href={`/continents/${d.continentSlug}`}>{d.continent}</a> /{" "}
          <a href={`/countries/${d.countryCode || slugify(d.country)}`}>{d.country}</a> /{" "}
          {hasState && (
            <>
              <a href={`/regions/${d.stateProvinceSlug}`}>{d.stateProvince}</a> /{" "}
            </>
          )}
          {hasSettlement && (
            <>
              <a href={`/${settlementPathPrefix[d.settlementType]}/${d.settlementSlug}`}>{d.settlement}</a> /{" "}
            </>
          )}
          {d.name}
        </nav>
        <div class="title-row">
          <h1>{d.name}</h1>
          <form method="post" action={`/docks/${d.slug}/favorite`}>
            <button
              class={`favorite-btn${d.isFavorited ? " active" : ""}`}
              type="submit"
              aria-pressed={d.isFavorited ? "true" : "false"}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill={d.isFavorited ? "currentColor" : "none"} stroke="currentColor" stroke-width="2">
                <path d="M12 4l2.47 5.77 6.28.55-4.75 4.13 1.42 6.13L12 17.27l-5.42 3.31 1.42-6.13-4.75-4.13 6.28-.55L12 4z" />
              </svg>
              {d.isFavorited ? "Favorited" : "Save"}
            </button>
          </form>
        </div>
        <p class="meta">{place ? `${place} · ${typeLabel}` : typeLabel}</p>
        {!d.imageUrl ? (
          <div class="no-photo-yet">
            <p>No photo yet. Be the first to add one.</p>
            <a class="btn-cta" href={`/docks/${d.slug}/add-photo`}>Submit a photo</a>
          </div>
        ) : d.imageOrientation === "portrait" ? (
          <div class="hero-split">
            <button class="hero-frame-split" type="button" id="hero-open" aria-label={`View larger photo of ${d.name}`}>
              <img class="hero-img-split" src={d.imageUrl} alt={d.name} decoding="async" />
            </button>
            <div class="hero-split-text">
              {d.description && <p class="desc">{d.description}</p>}
              {d.descriptionSource && <span class="hero-credit"><TextCreditLine value={d.descriptionSource} /></span>}
              <span class="hero-credit"><PhotoCreditLine value={d.imageAttribution} /></span>
            </div>
          </div>
        ) : (
          <>
            <figure>
              <button class="hero-frame" type="button" id="hero-open" aria-label={`View larger photo of ${d.name}`}>
                <img class="hero-img" src={d.imageUrl} alt={d.name} decoding="async" />
              </button>
              <figcaption><PhotoCreditLine value={d.imageAttribution} /></figcaption>
            </figure>
            {d.description && <p class="desc">{d.description}</p>}
            {d.descriptionSource && <p class="desc-source"><TextCreditLine value={d.descriptionSource} /></p>}
          </>
        )}
        <dl class="facts">
          <div><dt>Type</dt><dd>{typeLabel}</dd></div>
          {d.lengthM > 0 && <div><dt>Length</dt><dd>{d.lengthM} m</dd></div>}
          {d.yearBuilt != null && <div><dt>Built</dt><dd>{d.yearBuilt}</dd></div>}
          <div><dt>Coordinates</dt><dd>{d.lat.toFixed(4)}, {d.lon.toFixed(4)}</dd></div>
        </dl>
        {d.nearby && <AroundSection name={d.name} nearby={d.nearby} dockType={d.dockType} />}
        {photos.length > 0 && (
          <div class="gallery-section">
            <h2>More photos of {d.name}</h2>
            <div class="gallery-grid">
              {photos.slice(0, GALLERY_PREVIEW_LIMIT).map((p, i) => {
                const isLastTile = i === GALLERY_PREVIEW_LIMIT - 1;
                const remaining = photos.length - GALLERY_PREVIEW_LIMIT;
                return (
                  <button class="gallery-tile" data-index={i} type="button">
                    <img src={p.image_url} alt={p.title} width={300} height={225} loading="lazy" decoding="async" />
                    {isLastTile && remaining > 0 ? (
                      <span class="more-overlay">+{remaining} more</span>
                    ) : (
                      <>
                        {p.isTop && (
                          <span class="leader-badge">
                            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
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

      {d.imageUrl && (
        <>
          <div class="hero-lightbox" id="hero-lightbox" role="dialog" aria-modal="true" aria-label={`Photo of ${d.name}`}>
            <button class="lb-close" id="hero-close" type="button" aria-label="Close">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
            <img src={d.imageUrl} alt={d.name} />
          </div>
          <script>{raw(HERO_LIGHTBOX_JS)}</script>
        </>
      )}

      {photos.length > 0 && (
        <div class="gallery-lightbox" id="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`Photo gallery for ${d.name}`}>
          <button class="lb-close" id="lb-close" type="button" aria-label="Close">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <button class="lb-prev" id="lb-prev" type="button" aria-label="Previous photo">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button class="lb-next" id="lb-next" type="button" aria-label="Next photo">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
          <figure>
            <img id="lb-img" src={photos[0].image_url} alt={photos[0].title} loading="lazy" />
            <h3 id="lb-title"></h3>
            <figcaption id="lb-caption"></figcaption>
            <div class="lb-vote">
              <span class="leader-tag" id="lb-leader">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                Currently #1
              </span>
              <p class="feedback" id="lb-feedback" role="status" aria-live="polite"></p>
              {d.isLoggedIn ? (
                <div class="rating-row">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <button type="button" data-value={i + 1} aria-label={`Rate ${i + 1} out of 10`} aria-pressed="false">
                      {i + 1}
                    </button>
                  ))}
                </div>
              ) : (
                <a href={loginHref}>Log in to rate this photo</a>
              )}
            </div>
            <div class="lb-comments">
              <h4>Comments</h4>
              <div class="lb-comments-list" id="lb-comments-list"></div>
              {d.isLoggedIn ? (
                <div class="lb-comment-form">
                  <textarea id="lb-comment-input" rows={1} maxlength={500} placeholder="Add a comment…" aria-label="Add a comment"></textarea>
                  <button type="button" id="lb-comment-submit">Post</button>
                </div>
              ) : (
                <a href={loginHref}>Log in to comment</a>
              )}
            </div>
          </figure>
        </div>
      )}
      {photos.length > 0 && <script>{raw(galleryScript(photos, d.slug))}</script>}
    </Layout>
  );
}
