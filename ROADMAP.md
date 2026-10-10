# Wildock: Roadmap

What is done, what is running, and what is planned. The rules that apply to all of it (free-tier limits, deploy only on
request, nothing may break, security then speed) are in `README.md`.

## Done

- Static catalogue of 944 docks, one page each, with the browse hierarchy continent, country, region, place, dock.
- Wikipedia text and Commons photos with licences and credits; OpenStreetMap-derived text where no article exists.
- Greece (223 docks), Cyprus, Florida (200) and the Caribbean islands from OpenStreetMap, with photos where a
  relevant, correctly licensed one exists.
- Photos on `img.wildock.com` (R2 custom domain, CDN cached); card and hero sizes from pre-made files (older docks) or
  Cloudflare Images (Cyprus, Florida, Caribbean); EXIF and GPS removed from user uploads.
- Strict CSP with a per-response nonce, Cloudflare Web Analytics and JavaScript Detections working under it.
- Design: one token file, mobile gutters on every page, home hero with side-by-side search and map link and ten rotating
  prompts, "By continent" cards with real outlines, "Pick of the week" on the home page and `/map`.
- Large areas browse by region and place grids with a 48-card cap; same-named places in different countries get distinct
  slugs.
- `www.` redirects to the apex.

## Running or waiting

- "Around the dock" (nearby restaurants, hotels, sights) for the Florida docks: `node scripts/enrich-nearby.mjs`, slow
  because the public Overpass servers are busy. Then `npm run catalogue:build` and, with the owner's "deploy", a deploy.
- Saint Vincent and the Grenadines did not download (Overpass errors): `node scripts/import-osm.mjs VC`, then
  `node scripts/enrich-osm.mjs VC`.
- Changes that are committed but not deployed live in `git log` after the last deploy.

## Data and content

- 885 OpenStreetMap places are withheld because they are one sentence with no photo and no details. They are kept in
  `scripts/data/docks.json`; publish them when they gain content (a photo, "Around the dock" counts, a member photo).
- Fix place names that Nominatim gets wrong: Florida Keys show the county "Monroe" as the place; "Saint Petersburg" is
  spelled out in full; some Greek villages are transliterations of the nearest hamlet rather than the town people know.
- More regions, in the owner's priority order: the rest of the Caribbean coast and Central America, then the
  Mediterranean (Croatia, Italy, Turkey, Spain), the US coasts. Florida and the Caribbean were meant to get more depth
  than Greece: more sources than OpenStreetMap are needed (Wikivoyage, Commons categories such as "Marinas in the
  Bahamas", official marina directories), always with a licence and a credit.
- Points of interest on each dock, connected on the map into a personal route or tour.
- A "Recently added" strip or per-country highlights so new regions are visible from the home page.

## Images and quota

- Cloudflare Images allows 5,000 unique transformations a month on the free plan, and the card size of every
  Cyprus, Florida and Caribbean photo uses one. Keep a count (about 190 now) and decide before a region pushes it near
  the limit: switch that region to pre-made files (`npm run catalogue:variants`, three files per photo) or pay
  ($0.50 per extra 1,000).
- Cloudflare Images can also serve AVIF and WebP for the pre-made sizes; not needed while the budget is tight.
- Wishlist: member photos get resized copies too (today they are stored and shown at original size).

## Domains and infrastructure

Principle: infrastructure goes on subdomains, content stays on the apex (`wildock.com/he/`, `/guides`) so search
authority is not split. The domain is fully managed in Cloudflare (registrar and DNS).

Done: `www.` redirect, `img.` for photos, Web Analytics, CSP nonce.

Postponed, in this order:

1. `tiles.`: PMTiles basemap on R2 to replace the OpenStreetMap public tile servers (their usage policy is for light
   use). Needs a feasibility check first: size of the extract (world to zoom 8-10, plus regions around the docks to
   zoom 15-16, must fit the 10 GB R2 free tier), a vector style that matches the current look, and a client
   (`protomaps-leaflet`, keeps Leaflet). The map will look different from today.
2. Workers Static Assets for hashed CSS and JS: free, no request limit, no subdomain or CSP change.
3. `staging.`: separate Worker with its own D1 and R2 for checks before production.
4. `admin.`: admin panel behind Cloudflare Access (free up to 50 seats), cookies isolated from the public site.
5. `api.` / `data.`: public read-only JSON and an open data dump. Needs licence and attribution fields (Wikipedia text is
   CC BY-SA, Commons photos carry their own licences, OpenStreetMap is ODbL) and a low rate limit, since every call is a
   Worker request.
6. Optional: `status.`, `usercontent.` (low value, the CSP sandbox already isolates uploads).

On hold: Email Routing for `contact@wildock.com` (also resolves the empty `CONTACT_EMAIL`), then SPF and DMARC. HSTS once
all subdomains serve HTTPS.

## Before opening registration to the public

Registration is **closed in code**, not only by policy. `src/lib/signup.ts` reads `SIGNUP_ALLOWLIST` (comma-separated emails,
`wrangler.toml` [vars]); empty, as shipped, means nobody can create an account:

- `GET /signup` shows "Registration is closed" (403) and `POST /signup` is refused before it reads the form or touches D1
  (no throttle row, no account). The "Create an account" link is hidden on the login page.
- A new Google sign-in is refused too; accounts that already exist can still log in with a password or Google.
- To make the first admin (nothing in D1 has an account yet): put the owner's email in `SIGNUP_ALLOWLIST`, deploy, sign up,
  mark the row `is_admin = 1` in D1, then empty the variable again. Only listed addresses can register while it is set.
- To open registration to everyone, finish the list below, then make `registrationOpen` and `mayRegister` in
  `src/lib/signup.ts` return true.

What an account can do today (so you know what opening it means): edit its profile; save favourites (capped); propose a dock
(3 pending at most) and add a photo to a dock (5 pending at most), both held as `pending` until an admin approves them in
`/admin/submissions`; rate published photos (100 a day); comment on published photos (20 a day, **shown at once, no
approval**); send private messages to other users (20 an hour, no content filter). A visitor is never an admin.

Before it opens:

- **Verify email addresses.** Today anyone can sign up with an address that is not theirs; there is no confirmation email.
- **Moderate comments** (hold them as pending, or filter), since they appear without review. Private messages need at least a
  report or block option.
- Photo kinds: a visitor's upload is kind 1, the owner's is kind 2 and a nearby view is kind 3 (see the README); decide how
  the tags read once real visitor photos exist.

- Google sign-in returns 501 in production: set the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` secrets
  (`npx wrangler secret put ...`, values from Google Cloud Console, never pasted into a chat) and add
  `https://wildock.com/login/google/callback` (or the exact callback path) to the authorised redirect URIs.
- Set `CONTACT_EMAIL` (`wrangler.toml`) to a real address for takedown and credit-correction requests on /credits; see
  Email Routing above.
- Portrait or landscape detection for uploads reads the stored pixel size and ignores the EXIF orientation tag, so a
  phone photo stored sideways with an orientation flag is classed as landscape. Swap width and height when the
  orientation is 5-8 (readable with `tiffOrientation` in `src/lib/imageMetadata.ts`).
- Decide the free-tier plan for user photos: they are stored once and served by the Worker, so many uploads and views
  would use Worker requests. A Cloudflare Images or custom-domain route may be needed first.

## Smaller ideas

- Header search on every page except the home page is the magnifier icon linking to `/search`; the owner may want it
  gone everywhere with a search field in another form.
- Hero search: a suggestion list (places and docks as you type) once there is an index small enough to ship.
- Self-host Leaflet and the fonts to remove the third-party hosts from the CSP.
- PBKDF2 iteration count for passwords is limited by the Worker CPU budget; revisit if the plan changes.
