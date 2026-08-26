import { Hono } from "hono";
import { docks, dockTypes, countries, continents, type Dock } from "./data";
import { HomePage } from "./pages/home";
import { DockPage } from "./pages/dock";
import { CategoryPage } from "./pages/category";
import { MapPage } from "./pages/map";

const app = new Hono();

app.get("/", (c) => c.html(<HomePage />));

app.get("/map", (c) => c.html(<MapPage />));

app.get("/docks/:slug", (c) => {
  const dock = docks.find((d) => d.slug === c.req.param("slug"));
  if (!dock) return c.notFound();
  return c.html(<DockPage {...dock} />);
});

app.get("/type/:slug", (c) => {
  const slug = c.req.param("slug") as (typeof dockTypes)[number]["slug"];
  const type = dockTypes.find((t) => t.slug === slug);
  if (!type) return c.notFound();
  return c.html(
    <CategoryPage
      title={type.label}
      intro={`${type.blurb} — documented worldwide, starting in the Mediterranean.`}
      path={`/type/${slug}`}
      matches={docks.filter((d) => d.dockType === slug)}
    />,
  );
});

app.get("/countries/:code", (c) => {
  const code = c.req.param("code") as (typeof countries)[number]["code"];
  const country = countries.find((cn) => cn.code === code);
  if (!country) return c.notFound();
  return c.html(
    <CategoryPage
      title={country.name}
      intro={`Docks, piers and marinas documented in ${country.name}.`}
      path={`/countries/${code}`}
      matches={docks.filter((d) => d.countryCode === code)}
    />,
  );
});

app.get("/continents/:slug", (c) => {
  const slug = c.req.param("slug");
  const continent = continents.find((ct) => ct.slug === slug);
  if (!continent) return c.notFound();
  return c.html(
    <CategoryPage
      title={continent.name}
      intro={`Docks, piers and marinas documented across ${continent.name}.`}
      path={`/continents/${slug}`}
      matches={docks.filter((d) => d.continentSlug === slug)}
    />,
  );
});

app.get("/regions/:slug", (c) => {
  const slug = c.req.param("slug");
  const matches = docks.filter((d) => d.stateProvinceSlug === slug);
  const name = matches[0]?.stateProvince;
  if (!name) return c.notFound();
  return c.html(
    <CategoryPage
      title={name}
      intro={`Docks, piers and marinas documented in ${name}.`}
      path={`/regions/${slug}`}
      matches={matches}
    />,
  );
});

const settlementRoutes: { path: string; type: Dock["settlementType"] }[] = [
  { path: "cities", type: "city" },
  { path: "towns", type: "town" },
  { path: "villages", type: "village" },
];

for (const { path, type } of settlementRoutes) {
  app.get(`/${path}/:slug`, (c) => {
    const slug = c.req.param("slug");
    const matches = docks.filter((d) => d.settlementSlug === slug && d.settlementType === type);
    const name = matches[0]?.settlement;
    if (!name) return c.notFound();
    return c.html(
      <CategoryPage
        title={name}
        intro={`Docks, piers and marinas documented in ${name}.`}
        path={`/${path}/${slug}`}
        matches={matches}
      />,
    );
  });
}

app.get("/robots.txt", (c) =>
  c.text(["User-agent: *", "Allow: /", "Sitemap: https://wildock.com/sitemap.xml"].join("\n")),
);

app.get("/sitemap.xml", (c) => {
  const settlementPathPrefix: Record<Dock["settlementType"], string> = {
    city: "cities",
    town: "towns",
    village: "villages",
  };
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

export default app;
