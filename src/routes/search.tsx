import { Hono } from "hono";
import type { Env } from "../env";
import { SearchPage, type SearchFilter } from "../pages/search";
import { searchUsers, searchDocks, searchLocations, MIN_SEARCH_LENGTH } from "../lib/search";
import { edgeCached } from "../lib/edgeCache";

export const search = new Hono<Env>();

const FILTERS: SearchFilter[] = ["all", "profile", "location", "dock"];

search.get("/search", (c) => {
  const q = (c.req.query("q") ?? "").trim().slice(0, 80);
  const rawFilter = c.req.query("type") ?? "all";
  const filter: SearchFilter = (FILTERS as string[]).includes(rawFilter) ? (rawFilter as SearchFilter) : "all";

  // Queries shorter than MIN_SEARCH_LENGTH return nothing without touching D1.
  // Locations are in-memory so they always run, the D1 queries (users, docks)
  // only run for the active filter. Anonymous results are cached for 60s.
  return edgeCached(c, 60, async () => {
    const searchable = q.length >= MIN_SEARCH_LENGTH;
    const [users, docksResult] = await Promise.all([
      searchable && c.env.DB && (filter === "all" || filter === "profile") ? searchUsers(c.env.DB, q) : [],
      searchable && (filter === "all" || filter === "dock") ? searchDocks(c.env.DB, q) : [],
    ]);
    const locations = searchable ? searchLocations(q) : [];

    return c.html(<SearchPage q={q} filter={filter} users={users} docks={docksResult} locations={locations} path="/search" />);
  });
});
