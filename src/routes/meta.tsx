import { Hono } from "hono";
import type { Env } from "../env";
import { docks, dockTypes, countries, continents, type Dock } from "../data";
import { SETTLEMENT_ROUTE_PATHS } from "./catalog";
import { AccessibilityPage } from "../pages/accessibility";

export const meta = new Hono<Env>();

meta.get("/accessibility", (c) => c.html(<AccessibilityPage path="/accessibility" />));

meta.get("/robots.txt", (c) =>
  c.text(["User-agent: *", "Allow: /", "Sitemap: https://wildock.com/sitemap.xml"].join("\n")),
);

meta.get("/sitemap.xml", (c) => {
  const settlementPathPrefix: Record<Dock["settlementType"], string> = Object.fromEntries(
    SETTLEMENT_ROUTE_PATHS.map(({ path, type }) => [type, path]),
  ) as Record<Dock["settlementType"], string>;

  const urls = [
    "/",
    "/map",
    ...docks.map((d) => `/docks/${d.slug}`),
    ...dockTypes.map((t) => `/type/${t.slug}`),
    ...countries.map((cn) => `/countries/${cn.code}`),
    ...continents
      .filter((ct) => docks.some((d) => d.continentSlug === ct.slug))
      .map((ct) => `/continents/${ct.slug}`),
    ...new Set(docks.map((d) => `/regions/${d.stateProvinceSlug}`)),
    ...new Set(docks.map((d) => `/${settlementPathPrefix[d.settlementType]}/${d.settlementSlug}`)),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>https://wildock.com${u}</loc></url>`).join("\n") +
    `\n</urlset>`;
  return c.body(body, 200, { "Content-Type": "application/xml" });
});
