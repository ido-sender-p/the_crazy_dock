# Wildock

A catalogue of docks, piers and marinas worldwide (wildock.com). Hono on Cloudflare Workers, D1 (accounts, submissions,
messages, photo votes), R2 (photos). The browsable catalogue itself is a static JSON file bundled into the Worker, so
reading it costs no database reads.

Current catalogue: 944 docks. Wikidata and Wikipedia (the original 335 big ports, piers and marinas), plus Greece,
Cyprus, Florida and the Caribbean islands from OpenStreetMap.

## Standing rules (read these first)

These come from the owner and apply to every change.

1. **Priorities, in order: security, then speed, then everything else.** Prefer the safer or faster option even if the
   code gets slightly longer.
2. **Nothing may break.** Before changing anything that already works, capture how it behaves now (HTML dump of the
   affected routes, computed styles, a headless-browser run), change it, and prove it is identical or differs only in
   the intended way. A deliberate visible change is reported as such. See "How to verify" below.
3. **Production deploys only when the owner writes "deploy".** Approval of a plan is not approval to deploy. Uploads to
   production R2 and any bulk or heavy action are asked about first, with an estimate. Otherwise work locally.
4. **Stay inside the Cloudflare free tier** (budget below). Before anything that could approach a limit, stop and ask.
5. **Secrets are never printed, logged or committed.** Tokens live in `.env` (git-ignored) and are exported into the
   shell for a single command. Use only the token that was named for the job.
6. **No em-dashes in text visitors read** (page copy, labels, descriptions). Code comments may use them. See `CLAUDE.md`.
7. **All design lives in `src/styles`, all browser JavaScript in `src/client`.** No inline CSS, no inline scripts.
8. **No public sign-ups yet.** Registration is closed in code (`SIGNUP_ALLOWLIST` in `wrangler.toml`, empty = nobody) until the checklist in `ROADMAP.md` is done.

## Where things live

```
src/
  index.tsx            app wiring: security headers, CSRF, no-store for logged-in pages, routes
  env.ts               Worker bindings
  data.ts, catalogue.json, continents.ts, continentShapes.ts
                       the static catalogue, the browse hierarchy, and the generated continent outlines
  components/          layout.tsx (every page), icons, card, featured (Pick of the week), places (place grids, list cap)
  pages/               one file per page: markup only, no CSS or JS inline
  routes/              URL handlers (catalog, auth, account, gallery, messages, admin, assets, uploads, ...)
  lib/                 server logic: db, sessions, validation, search, caching, assets registry, places, slug,
                       imageVariants (photo URLs), imageMetadata (EXIF stripping), imageValidation
  middleware/          security headers (CSP), body limits
  styles/              ALL design: tokens, base, chrome, components, hero, featured, sea, and pages/<page>.ts
  client/              browser JavaScript, one module per concern (site, dock, map, editProfile, addPhoto)
  db/schema.sql        the D1 schema (re-runnable)
scripts/               catalogue pipeline (below) and its data in scripts/data (git-ignored)
```

## Cloudflare free-tier budget (never exceed; ask first)

| Resource | Free limit | Where we stand / how we stay under |
|---|---|---|
| Worker requests | 100,000 per day (then errors until 00:00 UTC) | Every page, asset and `/uploads` file is one request. Photos go through `img.wildock.com` (R2 custom domain, CDN cached, not Worker requests). Hashed CSS/JS are immutable. Pages are cached at the edge and memoised per isolate. |
| D1 reads / writes | 5M rows read, 100k written per day | The catalogue is static JSON, so listing pages read nothing. D1 only holds accounts, submissions, messages, votes. Anonymous pages use the edge cache so a hit costs no reads. |
| D1 storage | 5 GB | Tiny. |
| R2 storage | 10 GB | About 0.6 GB used. Photos are one original (about 1600px) plus, for the older docks, two resized copies. |
| R2 writes / reads | 1M writes, 10M reads per month | A full photo batch is a few hundred writes. Reads are served by the CDN. |
| Cloudflare Images transformations | 5,000 unique per month; above that new transformations fail with error 9422 (cached ones keep working) | Only the card size (640px) is transformed, and only for docks outside Greece and the first 335. About 190 used so far. Count unique images before adding a big region. Paid plan would be $0.50 per extra 1,000. |
| Worker bundle | 3 MiB gzip | About 254 KiB gzip. The catalogue adds roughly 0.35 KB gzip per dock. |
| Worker startup | 400 ms | About 38 ms. Never do random values or async work at module scope. |
| Web Analytics | free | Manual snippet, see Security. |

Nominatim (1 request per second, descriptive User-Agent) and the public Overpass servers are not Cloudflare, but the
same spirit applies: slow, polite, resumable.

## Design lives in one place

Everything visual is in `src/styles/`. `tokens.ts` holds every shared colour, font, radius, timing, layout size and
z-index as a CSS custom property, so changing the look means editing that file. Brand values (`--navy`, `--gold`,
`--white`) never change; semantic ones (`--ink`, `--accent`) are what high-contrast mode swaps, so never write
`var(--ink)` where you mean the fixed brand navy.

`components.ts` is for rules used by more than one page; a rule used by one page goes in `styles/pages/<page>.ts`;
a block shared by two specific pages gets its own module (`styles/featured.ts`).

Design decisions the owner asked for, kept on purpose:
- Navy and gold palette, Fraunces serif for headings and prose, Inter for UI. Gold accents, navy buttons.
- Home hero: lighthouse photo, headline, mission line, then a search field and an "or just explore on the map" link
  side by side as frosted boxes. The search field shows one of ten prompts at random per visit (picked in the browser by
  `client/site.ts`, because the page is cached). The header search icon is removed on the home page only.
- "By continent": six cards with each continent's real outline in its own colour (`continentShapes.ts`, generated from
  Natural Earth by `scripts/make-continent-shapes.mjs`).
- "Pick of the week" is one component (`components/featured.tsx`) used on the home page and under the map on `/map`.
- Mobile gutters on every page: pages use `padding-block` and a `max-width` that adds the gutter, so text never touches
  the screen edge on phones while desktop stays unchanged.
- Maps use the OpenStreetMap look. Switching to self-hosted tiles is on the roadmap and would change the look.

## How assets work

Stylesheets and scripts are strings in `src/styles` and `src/client`. `lib/assets.ts` registers each one under a
content-hashed URL (`/assets/site.<hash>.css`, `/assets/dock.<hash>.js`, `/assets/markers.<hash>.json`) and
`routes/assets.tsx` serves them with a one-year immutable cache. `Layout` links the site stylesheet and script on every
page, plus `page="<name>"` (its stylesheet) and `scripts={["<name>"]}` (client scripts).

The edge cache (`lib/edgeCache.ts`) is keyed by path, the deployed version (`version_metadata` binding) and
`assetVersion`, so HTML cached before a deploy is never served against assets that no longer exist.

## Photos

All catalogue photos are in the R2 bucket `wildock-photos` under `dock-<slug>` and are served from
`https://img.wildock.com/<key>` (an R2 custom domain). A Cache Rule keeps successful responses for a year and does
**not** cache errors. Do not undo that: with errors cached, a photo requested before it was uploaded keeps returning
404 until the cache is purged.

Two ways to get a smaller size (`lib/imageVariants.ts`, the only place URLs are built):
- **Pre-made files** (the first 335 docks and Greece): `dock-<slug>.w640` (cards) and `dock-<slug>.w1280` (top of a dock
  page), made by `npm run catalogue:variants`. The original is the full-size lightbox image.
- **Cloudflare Images** (rows with `tx: 1`: Cyprus, Florida, Caribbean): only the original is uploaded; cards use
  `/cdn-cgi/image/width=640,quality=75,format=auto,metadata=none/<original url>`, the top of a dock page uses the
  original. This keeps one file per photo, at the cost of the 5,000-per-month transformation budget above.

User uploads (`/uploads/<uuid>`) are stored without copies, cached for a day (takedowns), and have EXIF, GPS, camera
and text metadata removed on the way in (`lib/imageMetadata.ts`); only the display orientation is kept.

Photo credits: Commons photos only with CC0, public domain, CC BY or CC BY-SA and a known author; the credit and licence
link are shown on the dock page and on `/credits`.

## Catalogue pipeline

All steps are resumable and write to `scripts/data/` (git-ignored). Nothing here touches D1 or production R2 except the
explicit upload step.

1. **Wikidata, Wikipedia, Commons** (the original set): `npm run catalogue:import`.
2. **OpenStreetMap regions** (where Wikidata is thin): `node scripts/import-osm.mjs GR CY US-FL BS ...` (ISO country
   codes, or `US-FL` for Florida, which is fetched as a grid of boxes that split themselves when the public Overpass
   servers time out). Then `node scripts/enrich-osm.mjs <codes>`: names (English, Latin, or transliterated Greek),
   place and region from Nominatim, photo from Wikidata or a geotagged Commons file whose title or categories show a
   harbour-type subject, and a short description written only from OpenStreetMap tags (type, place, berths, operator,
   facilities, VHF channel, fee, website). Nothing is invented.
3. **Build**: `npm run catalogue:build` writes `src/catalogue.json`. An OpenStreetMap dock is published only with a photo
   or at least `MIN_OSM_FACTS` real details; thinner entries stay in `docks.json` for later.
3b. **About**: `node scripts/fetch-place-blurbs.mjs` (first two sentences of each settlement's Wikipedia article, only on an exact title match within 15 km), then `node scripts/build-about.mjs`. Run the second one after every `catalogue:build`, which rewrites `src/catalogue.json` without the `ab`, `pb` and `pt` fields. The dock page shows them under an About heading with one small Sources line (Wikipedia CC BY-SA 4.0, OpenStreetMap ODbL). Lightly rewording the text does not remove the licence duty, so the credit stays.
3c. **Photos for docks without one**: `node scripts/find-photos.mjs` and `find-photos-deep.mjs` (Wikimedia Commons, strict name and place match), `find-photos-area.mjs` (the water within 2 km). They only write candidate files; look at the pictures, then `node scripts/apply-photos.mjs slug=File.jpg ...` (add `--area` for nearby views). Never apply a photo nobody has looked at.
3d. **Photo kinds** (`PhotoKind` in `src/data.ts`, `pk` in the catalogue): 1 a visitor's upload, 2 the owner's (every catalogue and hand-written photo, kept as the owner's even if later replaced), 3 the owner's view of the water near the dock, not the dock itself (loudest tag and an amber frame). Visitor photos from `dock_photos` are kind 1 by definition and a community cover photo shown as the main photo is kind 1.
4. **Around the dock** (restaurants, hotels, shops, sights nearby): `node scripts/enrich-nearby.mjs [slugs...]`, slow.
5. **Photo sizes**: `npm run catalogue:variants` (skips rows that use Cloudflare Images and files that exist).
6. **Local preview of photos**: stop the dev server, then `npm run catalogue:images` (local R2). The preview points at
   `img.wildock.com`, so photos not yet uploaded to production show broken locally.
7. **Upload to production R2**: only on the owner's say-so. `scripts/data/r2-upload-list.txt` lists key and file; use
   `wrangler r2 object put wildock-photos/<key> --file=<file> --remote` with the Workers token, three at a time. Verify
   every key answers 200 on `img.wildock.com` (and a sample of `/cdn-cgi/image/...` URLs) **before** deploying.

## Browsing hierarchy

Continent, country, region (state or province), place, dock. Territories (Puerto Rico, the Virgin Islands, Aruba and so
on) are countries in `continents.ts`. Place and region pages are keyed by slug, so two places with the same name get
distinct slugs (`data.ts`, `disambiguate`): the largest group keeps the plain slug, the others get the country or state
appended. Pages that could hold hundreds of docks (country, region, continent) show a grid of regions or places with
counts and at most 48 cards, photos first (`components/places.tsx`, `LIST_LIMIT`).

Docks without a photo are normal: the page shows the OpenStreetMap-derived description with its credit, a "no photo yet"
prompt, and a website link when OpenStreetMap has one.

## Security model worth knowing

`middleware/security.ts` sets a strict Content-Security-Policy with **no `unsafe-inline`**: no inline `<script>`,
`<style>`, `style=""` or `on*=` anywhere. Pages hand data to scripts as `<script type="application/json">` blocks (which
the browser never runs) and sea colours come from generated classes (`styles/sea.ts`). If you add inline code the page
will silently break; add a client module instead.

- A fresh random nonce is added to `script-src` on every response. No page script uses it. It lets Cloudflare's own
  injected JavaScript Detections script run, because Cloudflare reads the nonce from the header.
- Cloudflare Web Analytics is installed as a manual external snippet in `Layout` (token in `lib/site.ts`, public), with
  only `static.cloudflareinsights.com` allowed in `script-src` and `cloudflareinsights.com` in `connect-src`. The
  dashboard setting is "Enable with JS Snippet installation" so Cloudflare does not inject a second, inline copy.
- `img-src` allows `img.wildock.com`. User uploads are served from `/uploads` with their own sandboxed CSP.
- Login is throttled per email and IP; passwordless accounts still pay the hashing cost (no account enumeration).

## How to verify a change

Used for every refactor and design edit so that nothing silently breaks:
- `npx tsc --noEmit` (with `noUnusedLocals`).
- Dump the HTML of the affected routes before and after (mask the asset hashes); identical, or only the intended diff.
- Headless Chrome (puppeteer-core): computed-style fingerprints for design changes (wait 500 ms after mode classes),
  horizontal overflow at 1280, 800 and 400 px, console scan for Content-Security-Policy violations, every `<img>`
  loaded, every place link answers 200.
- For photo work: every R2 key and a sample of transformed URLs answer 200 on the live domain before deploying.
- After deploying: re-run the browser check against https://wildock.com.

## Deploy

`npx wrangler deploy` with the Workers token exported for that one command, only on "deploy". Domains: `wildock.com`
(Worker custom domain), `www.` (301 to the apex, a Redirect Rule), `img.` (R2 custom domain). More subdomains are planned
in `ROADMAP.md`.

## Recipes

- **New page**: component in `pages/`, stylesheet `styles/pages/<name>.ts` registered in `styles/index.ts` (`PAGE_STYLES`),
  route in `routes/`, `<Layout page="<name>" ...>`.
- **New client script**: `client/<name>.ts` exporting `<name>Js`, registered in `client/index.ts`, then `scripts={["<name>"]}`.
- **New region of docks**: the catalogue pipeline above. Add the country to `continents.ts` (`countriesByContinent`,
  `oceanByCountry`) and to `COUNTRY` in `scripts/enrich-osm.mjs`. Estimate photos against the Cloudflare Images budget
  first.
- **Local database**: `npm run db:migrate:local` applies `src/db/schema.sql` to the local D1.
- **Local dev**: `npm run dev` (port 8787). Do not run two Wrangler instances on the same `.wrangler` state, and stop the
  dev server before `catalogue:images`.

## Notes

- `countries` in `data.ts` has one entry (Italy) and `legacyDocks` one hand-written dock (Marina Piccola). Both are
  deliberate: they set the map's opening view and the featured card. Do not remove `countryCode`.
- `public/images/marina-piccola-capri.jpg` is the source of the photo stored in R2 as `marina-piccola-capri-cover`.
