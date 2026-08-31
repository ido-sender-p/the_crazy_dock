import { Hono } from "hono";
import type { Env } from "../env";
import { docks, dockTypes, countries, continents, dedupeDocksBySlug, type Dock } from "../data";
import { HomePage } from "../pages/home";
import { DockPage } from "../pages/dock";
import { CategoryPage } from "../pages/category";
import { ContinentPage } from "../pages/continent";
import { CountryPage } from "../pages/country";
import { MapPage } from "../pages/map";
import { citiesByCountry, usStates, usStateSea, cityNameForSlug, countryInfoForSlug } from "../continents";
import {
  findPublishedDockBySlug,
  findPublishedDocksByContinent,
  findPublishedDocksByCountryName,
  findPublishedDocksBySettlementSlug,
  findPublishedDocksByType,
} from "../lib/liveDocks";
import { findPublishedPhotosForDock, findUserRatingsForDock } from "../lib/gallery";
import { currentUser } from "../lib/session";
import { isFavorited } from "../lib/favorites";

export const catalog = new Hono<Env>();

catalog.get("/", (c) => c.html(<HomePage />));

catalog.get("/map", (c) => c.html(<MapPage />));

catalog.get("/docks/:slug", async (c) => {
  const slug = c.req.param("slug");
  const dock = docks.find((d) => d.slug === slug) ?? (c.env.DB ? await findPublishedDockBySlug(c.env.DB, slug) : null);
  if (!dock) return c.notFound();

  const photos = c.env.DB ? await findPublishedPhotosForDock(c.env.DB, slug) : [];
  const user = await currentUser(c);
  const yourRatings = c.env.DB && user ? await findUserRatingsForDock(c.env.DB, user.id, slug) : {};
  const favorited = c.env.DB && user ? await isFavorited(c.env.DB, user.id, slug) : false;

  return c.html(
    <DockPage {...dock} photos={photos} isLoggedIn={!!user} yourRatings={yourRatings} isFavorited={favorited} />,
  );
});

catalog.get("/type/:slug", async (c) => {
  const slug = c.req.param("slug") as (typeof dockTypes)[number]["slug"];
  const type = dockTypes.find((t) => t.slug === slug);
  if (!type) return c.notFound();
  const live = c.env.DB ? await findPublishedDocksByType(c.env.DB, slug) : [];
  return c.html(
    <CategoryPage
      title={type.label}
      intro={`${type.blurb}. Documented worldwide, starting in the Mediterranean.`}
      path={`/type/${slug}`}
      matches={dedupeDocksBySlug([...docks.filter((d) => d.dockType === slug), ...live])}
    />,
  );
});

// Two distinct sources feed this one route: a handful of legacy demo
// countries keyed by 2-letter code (`countries`), and the full 196-country
// illustrative browse hierarchy keyed by slugified name (`countryInfoForSlug`).
catalog.get("/countries/:code", async (c) => {
  const code = c.req.param("code") as (typeof countries)[number]["code"];

  const legacyCountry = countries.find((cn) => cn.code === code);
  if (legacyCountry) {
    return c.html(
      <CategoryPage
        title={legacyCountry.name}
        intro={`Docks, piers and marinas documented in ${legacyCountry.name}.`}
        path={`/countries/${code}`}
        matches={docks.filter((d) => d.countryCode === code)}
      />,
    );
  }

  const info = countryInfoForSlug(code);
  if (!info) return c.notFound();

  const continent = continents.find((ct) => ct.slug === info.continentSlug);
  const live = c.env.DB ? await findPublishedDocksByCountryName(c.env.DB, info.name) : [];
  return c.html(
    <CountryPage
      name={info.name}
      continentName={continent?.name ?? info.continentSlug}
      continentSlug={info.continentSlug}
      cities={citiesByCountry[info.name] ?? []}
      states={
        info.name === "United States"
          ? usStates.flatMap((s) => (usStateSea[s] ?? []).map((e) => ({ name: s, sea: e.sea, family: e.family })))
          : undefined
      }
      matches={live}
      path={`/countries/${code}`}
    />,
  );
});

catalog.get("/continents/:slug", async (c) => {
  const slug = c.req.param("slug");
  const continent = continents.find((ct) => ct.slug === slug);
  if (!continent) return c.notFound();

  const live = c.env.DB ? await findPublishedDocksByContinent(c.env.DB, slug) : [];
  return c.html(
    <ContinentPage
      name={continent.name}
      slug={continent.slug}
      intro={`Docks, piers and marinas documented across ${continent.name}.`}
      path={`/continents/${slug}`}
      matches={dedupeDocksBySlug([...docks.filter((d) => d.continentSlug === slug), ...live])}
    />,
  );
});

catalog.get("/regions/:slug", (c) => {
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

const SETTLEMENT_ROUTE_PATHS: { path: string; type: Dock["settlementType"] }[] = [
  { path: "cities", type: "city" },
  { path: "towns", type: "town" },
  { path: "villages", type: "village" },
];

for (const { path } of SETTLEMENT_ROUTE_PATHS) {
  catalog.get(`/${path}/:slug`, async (c) => {
    const slug = c.req.param("slug");
    const live = c.env.DB ? await findPublishedDocksBySettlementSlug(c.env.DB, slug) : [];
    const matches = dedupeDocksBySlug([...docks.filter((d) => d.settlementSlug === slug), ...live]);
    const name = matches[0]?.settlement ?? cityNameForSlug(slug);
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

export { SETTLEMENT_ROUTE_PATHS };
