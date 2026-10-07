# Wildock: Roadmap

Future features under consideration, not yet built.

- Add points of interest to each port or marina and connect them on the map into a personalized route or tour.
- Map tiles: the OpenStreetMap public tile servers are meant for light use. Move to a proper tile provider before traffic grows.
- Takedown contact: set a real public address in `CONTACT_EMAIL` (`wrangler.toml`) so the /credits page can take takedown and credit-correction requests. Until then it says the contact details are being set up.
- And more features along these lines.

## Domains and infrastructure

Principle: infrastructure goes on subdomains, content stays on the apex (`wildock.com/he/`, `/guides`) so search authority is not split. The domain is fully managed in Cloudflare (registrar and DNS). Planned order:

1. `www.` redirect to the apex.
2. `img.`: R2 custom domain for catalogue photos (immutable keys only). Takes images out of the Worker request quota. Needs `img-src https://img.wildock.com` in the CSP, absolute URLs from `photoVariant`, and `/uploads` kept as fallback and for user uploads (takedowns need cache control).
3. Workers Static Assets for hashed CSS and JS: free, no request limit, no subdomain or CSP change.
4. `staging.`: separate Worker with its own D1 and R2 for checks before production.
5. `admin.`: admin panel behind Cloudflare Access (free up to 50 seats), cookies isolated from the public site.
6. `tiles.`: PMTiles basemap on R2 (zoom 0-10 only, about 1-3 GB), replaces the OpenStreetMap public tile servers.
7. `api.` / `data.`: public JSON and an open data dump, later.
8. Optional: `status.`, `usercontent.` (low value, CSP sandbox already isolates uploads).

On hold: Email Routing for `contact@wildock.com` (also resolves the empty `CONTACT_EMAIL`), then SPF and DMARC. HSTS once all subdomains serve HTTPS.
