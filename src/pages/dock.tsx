import { Layout } from "../components/layout";
import { type Dock, type PhotoKind } from "../data";
import { slugify } from "../lib/slug";
import { raw } from "hono/html";
import { safeJsonForScript } from "../lib/html";
import type { DockPhoto } from "../lib/gallery";
import { parsePhotoCredit, WIKIPEDIA_LICENSE, ODBL_URL } from "../lib/credits";
import { vibe, count, type Nearby } from "../lib/nearby";
import { SETTLEMENT_PATH } from "../lib/places";
import { placeLabel } from "../lib/places";
import { AroundIconSvg, type AroundIcon } from "../components/icons";
import { photoVariant } from "../lib/imageVariants";
import { SITE_ORIGIN } from "../lib/site";

const GALLERY_PREVIEW_LIMIT = 6;

// A small tag saying who supplied the photo; kind 3 (not the dock itself) is the loudest.
const PHOTO_KIND_LABEL: Record<PhotoKind, string> = { 1: "Visitor photo", 2: "Wildock photo", 3: "Not the dock itself" };
function PhotoKindTag({ kind }: { kind: PhotoKind }) {
  return <span class={`photo-kind kind-${kind}`}>{PHOTO_KIND_LABEL[kind]}</span>;
}

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

// "About": the dock's own description, extra verified facts, then a short note on the settlement it belongs to (Wikipedia).
// One small line names the sources and their licences (CC BY-SA and ODbL both only ask for attribution and a licence link).
function AboutBlock({ d }: { d: Dock }) {
  const blurb = d.placeBlurb;
  if (!d.description && !d.aboutExtras && !blurb) return null;
  const [srcName, srcUrl] = (d.descriptionSource ?? "").split("|");
  const fromOsm = srcName === "OpenStreetMap" || !!d.aboutExtras;
  const wiki: { title: string; url: string }[] = [];
  if (srcName && srcName !== "OpenStreetMap" && srcUrl) wiki.push({ title: d.name, url: srcUrl });
  if (blurb) wiki.push({ title: blurb.title, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(blurb.title.replace(/ /g, "_"))}` });
  return (
    <section class="about" aria-labelledby="about-title">
      <h2 id="about-title">About</h2>
      {d.description && <p class="desc">{d.description}</p>}
      {d.aboutExtras && <p class="desc">{d.aboutExtras}</p>}
      {blurb && <p class="desc"><strong>{d.settlement}.</strong> {blurb.text}</p>}
      <p class="desc-source">
        Sources:{" "}
        {wiki.map((w, i) => (
          <>
            {i > 0 && " and "}
            <a href={w.url} target="_blank" rel="noopener noreferrer">{w.title}</a>
          </>
        ))}
        {wiki.length > 0 && <> on Wikipedia (<a href={WIKIPEDIA_LICENSE.url} target="_blank" rel="noopener noreferrer license">{WIKIPEDIA_LICENSE.name}</a>, shortened)</>}
        {wiki.length > 0 && fromOsm && "; "}
        {fromOsm && <><a href={srcName === "OpenStreetMap" && srcUrl ? srcUrl : "https://www.openstreetmap.org/copyright"} target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors (<a href={ODBL_URL} target="_blank" rel="noopener noreferrer license">ODbL</a>)</>}.
      </p>
    </section>
  );
}

// "Around the dock": counts of nearby places from OpenStreetMap plus a one-line feel.
function AroundSection({ name, nearby, dockType }: { name: string; nearby: Nearby; dockType: string }) {
  const v = vibe(nearby, dockType);
  const tiles: [number, string, AroundIcon][] = [
    [nearby.eat, "places to eat & drink", "eat"],
    [nearby.stay, "places to stay", "stay"],
    [nearby.shops, "shops", "shops"],
    [nearby.sights, "sights & museums", "sights"],
    [nearby.historic, "historic sites", "historic"],
    [nearby.beaches, "beaches", "beaches"],
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
          {shown.map(([n, label, icon]) => (
            <li><AroundIconSvg name={icon} /><span class="num">{count(n, nearby.capped)}</span><span class="lbl">{label}</span></li>
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

// Only these fields ever reach the page: votes and averages stay server-side.
type ClientPhoto = Pick<DockPhoto, "id" | "image_url" | "title" | "caption"> & {
  yourRating: number | null;
  isTop: boolean;
};



export function DockPage(
  d: Dock & { photos?: DockPhoto[]; isLoggedIn?: boolean; yourRatings?: Record<number, number>; isFavorited?: boolean },
) {
  // Catalogue docks can lack a state or settlement, so every tier is optional.
  const hasState = !!(d.stateProvince && d.stateProvinceSlug);
  const hasSettlement = !!(d.settlement && d.settlementSlug);
  const place = placeLabel(d.settlement, d.stateProvince, d.country);
  const titlePlace = placeLabel(d.settlement, d.country);
  const typeLabel = d.dockType === "industrial" ? "port" : d.dockType.replaceAll("_", " ");

  const address: Record<string, string> = { "@type": "PostalAddress" };
  if (d.settlement) address.addressLocality = d.settlement;
  if (d.stateProvince) address.addressRegion = d.stateProvince;
  if (d.country) address.addressCountry = d.country;
  // Breadcrumb trail for search results: the same chain the visible breadcrumb shows.
  const trail: [string, string][] = [["Wildock", "/"]];
  if (d.continent) trail.push([d.continent, `/continents/${d.continentSlug}`]);
  if (d.country) trail.push([d.country, `/countries/${d.countryCode || slugify(d.country)}`]);
  if (hasState) trail.push([d.stateProvince, `/regions/${d.stateProvinceSlug}`]);
  if (hasSettlement) trail.push([d.settlement, `/${SETTLEMENT_PATH[d.settlementType]}/${d.settlementSlug}`]);
  // The source link of the description (Wikipedia article or OpenStreetMap element), as a sameAs reference.
  const sourceUrl = d.descriptionSource?.split("|")[1];
  const sameAs = [sourceUrl, d.website].filter((u): u is string => !!u && /^https?:\/\//.test(u));
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristAttraction",
        "@id": `${SITE_ORIGIN}/docks/${d.slug}#place`,
        url: `${SITE_ORIGIN}/docks/${d.slug}`,
        name: d.name,
        description: d.description,
        ...(d.imageUrl && d.photoKind !== 3 ? { image: photoVariant(d.imageUrl, "full") } : {}),
        geo: { "@type": "GeoCoordinates", latitude: d.lat, longitude: d.lon },
        hasMap: `https://www.openstreetmap.org/?mlat=${d.lat}&mlon=${d.lon}#map=15/${d.lat}/${d.lon}`,
        address,
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [...trail.map(([name, href], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE_ORIGIN + href })), { "@type": "ListItem", position: trail.length + 1, name: d.name }],
      },
    ],
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

  // Landscape photos become a full-width hero with the title on top of it; portrait and photo-less docks keep a plain heading.
  const bleed = !!d.imageUrl && d.imageOrientation !== "portrait";
  const crumbs = (
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
          <a href={`/${SETTLEMENT_PATH[d.settlementType]}/${d.settlementSlug}`}>{d.settlement}</a> /{" "}
        </>
      )}
      {d.name}
    </nav>
  );
  const actions = (
    <div class="hero-actions-row">
      <form method="post" action={`/docks/${d.slug}/favorite`}>
        <button class={`favorite-btn${d.isFavorited ? " active" : ""}`} type="submit" aria-pressed={d.isFavorited ? "true" : "false"}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill={d.isFavorited ? "currentColor" : "none"} stroke="currentColor" stroke-width="2">
            <path d="M12 4l2.47 5.77 6.28.55-4.75 4.13 1.42 6.13L12 17.27l-5.42 3.31 1.42-6.13-4.75-4.13 6.28-.55L12 4z" />
          </svg>
          {d.isFavorited ? "Favorited" : "Save"}
        </button>
      </form>
      <button class="share-btn" type="button" id="share-btn" data-title={d.name}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 15V3M8 7l4-4 4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
        </svg>
        <span id="share-label">Share</span>
      </button>
      {photos.length > 0 && (
        <a class="photos-btn" href="#more-photos">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          +{photos.length} {photos.length === 1 ? "photo" : "photos"}
        </a>
      )}
    </div>
  );

  return (
    <Layout page="dock" scripts={["dock", "map"]}
      title={`${d.name}${titlePlace ? ` · ${titlePlace}` : ""} | Wildock`}
      description={d.description.slice(0, 155)}
      jsonLd={jsonLd}
      path={`/docks/${d.slug}`}
    >
      <div class="wrap dock-page dock-head">
        {crumbs}
        <h1 class="plain-title">{d.name}</h1>
        <p class="meta">{place ? `${place} · ${typeLabel}` : typeLabel}</p>
        {actions}
      </div>
      {bleed && (
        <div class="wrap dock-photo-row" data-photo-kind={d.photoKind ?? 2}>
          <button class="dock-photo" type="button" id="hero-open" aria-label={`View larger photo of ${d.name}`}>
            <img src={photoVariant(d.imageUrl, "full")} alt={d.photoKind === 3 ? `View near ${d.name}` : d.name} decoding="async" fetchpriority="high" />
          </button>
          <p class="photo-credit">
            <PhotoKindTag kind={d.photoKind ?? 2} />{" "}
            {d.photoKind === 3 && <><strong>No photo of this dock yet.</strong> This is the view nearby. </>}
            <PhotoCreditLine value={d.imageAttribution} />
          </p>
        </div>
      )}
      <div class="wrap dock-page dock-body">
        {!d.imageUrl ? (
          <div class="no-photo-yet">
            <p>No photo yet. Be the first to add one.</p>
            <a class="btn-cta" href={`/docks/${d.slug}/add-photo`}>Submit a photo</a>
          </div>
        ) : d.imageOrientation === "portrait" ? (
          <div class="hero-split">
            <button class="hero-frame-split" type="button" id="hero-open" aria-label={`View larger photo of ${d.name}`}>
              <img class="hero-img-split" src={photoVariant(d.imageUrl, "w1280")} alt={d.name} decoding="async" fetchpriority="high" />
            </button>
            <div class="hero-split-text">
              <AboutBlock d={d} />
              <span class="hero-credit"><PhotoCreditLine value={d.imageAttribution} /></span>
            </div>
          </div>
        ) : (
          <AboutBlock d={d} />
        )}
        {!d.imageUrl && <AboutBlock d={d} />}
        <div class="info-band">
          <dl class="facts">
            <div><dt>Type</dt><dd>{typeLabel}</dd></div>
            {d.settlement && <div><dt>Place</dt><dd><a href={`/${SETTLEMENT_PATH[d.settlementType]}/${d.settlementSlug}`}>{d.settlement}</a></dd></div>}
            {hasState && <div><dt>Region</dt><dd><a href={`/regions/${d.stateProvinceSlug}`}>{d.stateProvince}</a></dd></div>}
            <div><dt>Country</dt><dd><a href={`/countries/${d.countryCode || slugify(d.country)}`}>{d.country}</a></dd></div>
            {d.lengthM > 0 && <div><dt>Length</dt><dd>{d.lengthM} m</dd></div>}
            {d.yearBuilt != null && <div><dt>Built</dt><dd>{d.yearBuilt}</dd></div>}
            <div><dt>Coordinates</dt><dd>{d.lat.toFixed(4)}, {d.lon.toFixed(4)}</dd></div>
            {d.website && <div><dt>Website</dt><dd><a href={d.website} target="_blank" rel="nofollow noopener noreferrer">{new URL(d.website).hostname.replace(/^www\./, "")}</a></dd></div>}
          </dl>
          <div class="mini-map">
            <div id="dock-map" class="dock-map" data-leaflet data-lat={d.lat} data-lon={d.lon} data-zoom="13" role="region" aria-label={`Map showing where ${d.name} is`} />
            <p class="map-caption">
              {d.lat.toFixed(4)}, {d.lon.toFixed(4)} ·{" "}
              <a href={`https://www.openstreetmap.org/?mlat=${d.lat}&mlon=${d.lon}#map=15/${d.lat}/${d.lon}`} target="_blank" rel="noopener noreferrer">Open in OpenStreetMap</a>
            </p>
          </div>
        </div>
        {d.nearby && <AroundSection name={d.name} nearby={d.nearby} dockType={d.dockType} />}
        {photos.length > 0 && (
          <div class="gallery-section" id="more-photos">
            <h2>More photos of {d.name}</h2>
            <div class="gallery-grid">
              {photos.slice(0, GALLERY_PREVIEW_LIMIT).map((p, i) => {
                const isLastTile = i === GALLERY_PREVIEW_LIMIT - 1;
                const remaining = photos.length - GALLERY_PREVIEW_LIMIT;
                return (
                  <button class="gallery-tile" data-index={i} data-photo-kind="1" type="button">
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
            <img src={photoVariant(d.imageUrl, "full")} alt={d.name} loading="lazy" />
          </div>
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
      {photos.length > 0 && <script type="application/json" id="dock-data">{raw(safeJsonForScript({ photos, slug: d.slug }))}</script>}
    </Layout>
  );
}
