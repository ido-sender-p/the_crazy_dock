# Wildock: Roadmap

Future features under consideration, not yet built.

- Add points of interest to each port or marina and connect them on the map into a personalized route or tour.
- Map tiles: the OpenStreetMap public tile servers are meant for light use. Move to a proper tile provider before traffic grows.
- Takedown contact: set a real public address in `CONTACT_EMAIL` (`wrangler.toml`) so the /credits page can take takedown and credit-correction requests. Until then it says the contact details are being set up.
- And more features along these lines.

## Domains and infrastructure

Principle: infrastructure goes on subdomains, content stays on the apex (`wildock.com/he/`, `/guides`) so search authority is not split. The domain is fully managed in Cloudflare (registrar and DNS).

Done: `www.` redirects to the apex; `img.` serves catalogue photos from R2 (CDN cached); Cloudflare Web Analytics via the manual snippet; CSP nonce so Cloudflare JavaScript Detections works under the strict CSP.

Postponed, in this order:

1. `tiles.`: PMTiles basemap on R2 to replace the OpenStreetMap public tile servers. Needs a feasibility check first: size of the extract (world to zoom 8-10, plus regions around the docks to zoom 15-16, must fit the 10 GB R2 free tier), a vector style that matches the current look, and a client (`protomaps-leaflet`, keeps Leaflet).
2. Workers Static Assets for hashed CSS and JS: free, no request limit, no subdomain or CSP change.
3. `staging.`: separate Worker with its own D1 and R2 for checks before production.
4. `admin.`: admin panel behind Cloudflare Access (free up to 50 seats), cookies isolated from the public site.
5. `api.` / `data.`: public read-only JSON and an open data dump. Needs licence and attribution fields (Wikipedia text is CC BY-SA, Commons photos carry their own licences) and a low rate limit, since every call is a Worker request.
6. Optional: `status.`, `usercontent.` (low value, the CSP sandbox already isolates uploads).

On hold: Email Routing for `contact@wildock.com` (also resolves the empty `CONTACT_EMAIL`), then SPF and DMARC. HSTS once all subdomains serve HTTPS.

## Before opening registration to the public

Registration stays closed to the public for now. Before it opens:

- Google sign-in returns 501 in production: set the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` secrets (`npx wrangler secret put ...`, values from Google Cloud Console) and add `https://wildock.com/login/google/callback` (or the exact callback path) to the authorised redirect URIs.
- Set `CONTACT_EMAIL` (`wrangler.toml`) to a real address for takedown and credit-correction requests on /credits; see Email Routing above.
- Portrait or landscape detection for uploads reads the stored pixel size and ignores the EXIF orientation tag, so a phone photo stored sideways with an orientation flag is classed as landscape. Swap width and height when the orientation is 5-8 (the kept orientation tag is readable with `tiffOrientation` in `src/lib/imageMetadata.ts`).

