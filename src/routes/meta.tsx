import { Hono } from "hono";
import type { Env } from "../env";
import { docks, countries, continents, type Dock } from "../data";
import { SETTLEMENT_ROUTE_PATHS } from "./catalog";
import { AccessibilityPage } from "../pages/accessibility";
import { CreditsPage } from "../pages/credits";
import { findLiveSitemapRows } from "../lib/liveDocks";
import { edgeCached } from "../lib/edgeCache";

export const meta = new Hono<Env>();

const SITEMAP_TTL = 3600;

const settlementPathPrefix = Object.fromEntries(SETTLEMENT_ROUTE_PATHS.map(({ path, type }) => [type, path])) as Record<
  Dock["settlementType"],
  string
>;

// The static part of the sitemap never changes between deploys, so it's built
// once. Docks with an empty settlement or region slug (the catalogue can have
// empty tiers) don't get a listing page entry.
const staticUrls: string[] = (() => {
  const urls = new Set<string>(["/", "/map", "/credits"]);
  for (const d of docks) urls.add(`/docks/${d.slug}`);
  for (const cn of countries) urls.add(`/countries/${cn.code}`);
  const continentSlugs = new Set(docks.map((d) => d.continentSlug));
  for (const ct of continents) if (continentSlugs.has(ct.slug)) urls.add(`/continents/${ct.slug}`);
  for (const d of docks) {
    if (d.stateProvinceSlug) urls.add(`/regions/${d.stateProvinceSlug}`);
    if (d.settlementSlug) urls.add(`/${settlementPathPrefix[d.settlementType]}/${d.settlementSlug}`);
  }
  return [...urls];
})();

function siteOrigin(c: { env: Env["Bindings"] }) {
  return (c.env.SITE_URL || "https://wildock.com").replace(/\/+$/, "");
}

function xmlEscape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

meta.get("/accessibility", (c) => c.html(<AccessibilityPage path="/accessibility" />));

meta.get("/credits", (c) => edgeCached(c, SITEMAP_TTL, async () => c.html(<CreditsPage path="/credits" contactEmail={c.env.CONTACT_EMAIL} />)));

meta.get("/robots.txt", (c) =>
  c.text(["User-agent: *", "Allow: /", "Disallow: /search", `Sitemap: ${siteOrigin(c)}/sitemap.xml`].join("\n"), 200, {
    "Cache-Control": "public, max-age=3600",
  }),
);

meta.get("/sitemap.xml", (c) =>
  edgeCached(c, SITEMAP_TTL, async () => {
    const urls = new Set(staticUrls);
    if (c.env.DB) {
      for (const row of await findLiveSitemapRows(c.env.DB)) {
        urls.add(`/docks/${row.slug}`);
        if (row.state_province_slug) urls.add(`/regions/${row.state_province_slug}`);
        if (row.settlement_slug) {
          const type = (row.settlement_type ?? "city") as Dock["settlementType"];
          urls.add(`/${settlementPathPrefix[type] ?? "cities"}/${row.settlement_slug}`);
        }
      }
    }

    const origin = siteOrigin(c);
    const body =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      [...urls].map((u) => `  <url><loc>${xmlEscape(origin + u)}</loc></url>`).join("\n") +
      `\n</urlset>`;
    return c.body(body, 200, { "Content-Type": "application/xml" });
  }),
);
