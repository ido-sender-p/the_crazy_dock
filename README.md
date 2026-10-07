# Wildock

A catalogue of docks, piers and marinas worldwide. Hono on Cloudflare Workers, D1 (accounts, submissions, messages, photos), R2 (photos).

## Where things live

```
src/
  index.tsx            app wiring: security headers, CSRF, no-store for logged-in pages, routes
  env.ts               Worker bindings
  data.ts, catalogue.json, continents.ts   the static catalogue (335 docks) and the browse hierarchy
  components/          layout.tsx (every page), icons.tsx, card.tsx
  pages/               one file per page: markup only, no CSS or JS inline
  routes/              URL handlers (catalog, auth, account, gallery, messages, admin, assets, uploads, ...)
  lib/                 server logic: db, sessions, validation, search, caching, assets registry, places, slug
  middleware/          security headers (CSP), body limits
  styles/              ALL design: tokens, base, chrome, components, hero, sea, and pages/<page>.ts
  client/              browser JavaScript, one module per concern (site, dock, map, editProfile, addPhoto)
  db/schema.sql        the D1 schema (re-runnable)
scripts/               catalogue pipeline (see below) and its data in scripts/data (git-ignored)
```

## Design lives in one place

Everything visual is in `src/styles/`. `tokens.ts` holds every shared colour, font, radius, timing, layout size and
z-index as a CSS custom property, so changing the look means editing that file. Brand values (`--navy`, `--gold`,
`--white`) never change; semantic ones (`--ink`, `--accent`) are what high-contrast mode swaps, so never write
`var(--ink)` where you mean the fixed brand navy.

`components.ts` is for rules used by more than one page; a rule used by one page goes in `styles/pages/<page>.ts`.

## How assets work

Stylesheets and scripts are strings in `src/styles` and `src/client`. `lib/assets.ts` registers each one under a
content-hashed URL (`/assets/site.<hash>.css`, `/assets/dock.<hash>.js`, `/assets/markers.<hash>.json`) and
`routes/assets.tsx` serves them with a one-year immutable cache. `Layout` links the site stylesheet and script on every
page, plus `page="<name>"` (its stylesheet) and `scripts={["<name>"]}` (client scripts).

The edge cache (`lib/edgeCache.ts`) is keyed by path plus `assetVersion` (a hash of all asset names), so HTML cached
before a deploy is never served against assets that no longer exist.

## Security model worth knowing

`middleware/security.ts` sets a strict Content-Security-Policy with **no `unsafe-inline`**: no inline `<script>`,
`<style>`, `style=""` or `on*=` anywhere. Pages hand data to scripts as `<script type="application/json">` blocks (which
the browser never runs) and sea colours come from generated classes (`styles/sea.ts`). If you add inline code the page
will silently break; add a client module instead. User uploads are served from `/uploads` with their own sandboxed CSP.

## Recipes

- **New page**: component in `pages/`, stylesheet `styles/pages/<name>.ts` registered in `styles/index.ts` (`PAGE_STYLES`),
  route in `routes/`, `<Layout page="<name>" ...>`.
- **New client script**: `client/<name>.ts` exporting `<name>Js`, registered in `client/index.ts`, then `scripts={["<name>"]}`.
- **Catalogue**: `npm run catalogue:import` (Wikidata, Wikipedia, Commons; resumable), `npm run catalogue:nearby`
  (OpenStreetMap places around each dock; resumable and slow, the public Overpass servers are busy), then
  `npm run catalogue:build` (writes `src/catalogue.json`) and `npm run catalogue:images` (copies photos into local R2;
  upload to the real bucket with `wrangler r2 object put`).
- **Local database**: `npm run db:migrate:local` applies `src/db/schema.sql` to the local D1.

## Notes

- `countries` in `data.ts` has one entry (Italy) and `legacyDocks` one hand-written dock (Marina Piccola). Both are
  deliberate: they set the map's opening view and the featured card. Do not remove `countryCode`.
- `public/images/marina-piccola-capri.jpg` is the source of the photo stored in R2 as `marina-piccola-capri-cover`.
- Production deploys happen only on the owner's explicit request (`wrangler deploy`).
