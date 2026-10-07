import { Hono } from "hono";
import type { Env } from "../env";
import { countries, continents, dedupeDocksBySlug, type Dock } from "../data";
import { HomePage } from "../pages/home";
import { DockPage } from "../pages/dock";
import { CategoryPage } from "../pages/category";
import { ContinentPage } from "../pages/continent";
import { CountryPage } from "../pages/country";
import { MapPage } from "../pages/map";
import { citiesByCountry, usStates, usStateSea, cityNameForSlug, countryInfoForSlug } from "../continents";
import {
  findPublishedDocksByContinent,
  findPublishedDocksByCountryName,
  findPublishedDocksBySettlementSlug,
  findPublishedDocksByRegionSlug,
  resolveDock,
} from "../lib/liveDocks";
import { staticInContinent, staticInCountryCode, staticInCountryName, staticInRegion, staticInSettlement } from "../lib/staticDocks";
import { findPublishedPhotosForDock, findUserRatingsForDock, pickCoverPhoto } from "../lib/gallery";
import { currentUser } from "../lib/session";
import { isFavorited } from "../lib/favorites";
import { memoPage } from "../lib/pageMemo";
import { edgeCached } from "../lib/edgeCache";

export const catalog = new Hono<Env>();

const LISTING_TTL = 300;
const DOCK_PAGE_TTL = 60;

catalog.get("/", (c) => c.html(memoPage("/", () => <HomePage />)));

catalog.get("/map", (c) => c.html(memoPage("/map", () => <MapPage />)));

catalog.get("/docks/:slug", (c) => {
  const slug = c.req.param("slug");

  // Anonymous views are cached briefly (a hit costs no D1 reads). Logged-in
  // requests bypass the cache, they need their own ratings and favorite state.
  return edgeCached(c, DOCK_PAGE_TTL, async () => {
    // Static catalogue first, D1 only for slugs that could be user-submitted.
    const dock = await resolveDock(c.env.DB, slug);
    if (!dock) return c.notFound();

    const user = await currentUser(c);
    const [photos, yourRatings, favorited] = c.env.DB
      ? await Promise.all([
          findPublishedPhotosForDock(c.env.DB, slug),
          user ? findUserRatingsForDock(c.env.DB, user.id, slug) : {},
          user ? isFavorited(c.env.DB, user.id, slug) : false,
        ])
      : [[], {}, false];

    // The community's top-rated photo takes over the page's main photo once it has enough votes.
    const cover = pickCoverPhoto(photos);
    const shown = cover
      ? {
          ...dock,
          imageUrl: cover.image_url,
          imageAttribution: `Photo by ${cover.username}, voted the best shot by the community`,
          imageOrientation: cover.image_orientation === "portrait" ? ("portrait" as const) : ("landscape" as const),
        }
      : dock;

    return c.html(
      <DockPage {...shown} photos={photos} isLoggedIn={!!user} yourRatings={yourRatings} isFavorited={favorited} />,
    );
  });
});

// Two distinct sources feed this one route: a handful of legacy demo
// countries keyed by 2-letter code (`countries`), and the full 196-country
// illustrative browse hierarchy keyed by slugified name (`countryInfoForSlug`).
catalog.get("/countries/:code", (c) => {
  const code = c.req.param("code") as (typeof countries)[number]["code"];

  const legacyCountry = countries.find((cn) => cn.code === code);
  if (legacyCountry) {
    return c.html(
      <CategoryPage
        title={legacyCountry.name}
        intro={`Docks, piers and marinas documented in ${legacyCountry.name}.`}
        path={`/countries/${code}`}
        matches={staticInCountryCode(code)}
      />,
    );
  }

  const info = countryInfoForSlug(code);
  if (!info) return c.notFound();

  return edgeCached(c, LISTING_TTL, async () => {
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
        matches={dedupeDocksBySlug([...staticInCountryName(info.name), ...live])}
        path={`/countries/${code}`}
      />,
    );
  });
});

catalog.get("/continents/:slug", (c) => {
  const slug = c.req.param("slug");
  const continent = continents.find((ct) => ct.slug === slug);
  if (!continent) return c.notFound();

  return edgeCached(c, LISTING_TTL, async () => {
    const live = c.env.DB ? await findPublishedDocksByContinent(c.env.DB, slug) : [];
    return c.html(
      <ContinentPage
        name={continent.name}
        slug={continent.slug}
        intro={`Docks, piers and marinas documented across ${continent.name}.`}
        path={`/continents/${slug}`}
        matches={dedupeDocksBySlug([...staticInContinent(slug), ...live])}
      />,
    );
  });
});

catalog.get("/regions/:slug", (c) => {
  const slug = c.req.param("slug");
  // Nothing static and not a plausible live slug means nothing to look up.
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 200) return c.notFound();

  return edgeCached(c, LISTING_TTL, async () => {
    const live = c.env.DB ? await findPublishedDocksByRegionSlug(c.env.DB, slug) : [];
    const matches = dedupeDocksBySlug([...staticInRegion(slug), ...live]);
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
});

const SETTLEMENT_ROUTE_PATHS: { path: string; type: Dock["settlementType"] }[] = [
  { path: "cities", type: "city" },
  { path: "towns", type: "town" },
  { path: "villages", type: "village" },
];

const settlementPathByType = Object.fromEntries(SETTLEMENT_ROUTE_PATHS.map(({ path, type }) => [type, path])) as Record<
  Dock["settlementType"],
  string
>;

for (const { path, type } of SETTLEMENT_ROUTE_PATHS) {
  catalog.get(`/${path}/:slug`, (c) => {
    const slug = c.req.param("slug");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 200) return c.notFound();

    return edgeCached(c, LISTING_TTL, async () => {
      const live = c.env.DB ? await findPublishedDocksBySettlementSlug(c.env.DB, slug) : [];
      const matches = dedupeDocksBySlug([...staticInSettlement(slug), ...live]);
      const first = matches[0];

      // A place lives under exactly one prefix (its settlementType). The other
      // two redirect there instead of serving the same page three times.
      if (first && first.settlementType !== type) {
        return c.redirect(`/${settlementPathByType[first.settlementType]}/${slug}`, 301);
      }
      // No docks yet: only the illustrative city hierarchy has an empty page.
      const name = first?.settlement ?? (type === "city" ? cityNameForSlug(slug) : undefined);
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
  });
}

export { SETTLEMENT_ROUTE_PATHS };
