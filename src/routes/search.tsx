import { Hono } from "hono";
import type { Env } from "../env";
import { SearchPage, type SearchFilter } from "../pages/search";
import { searchUsers, searchDocks, searchLocations } from "../lib/search";

export const search = new Hono<Env>();

const FILTERS: SearchFilter[] = ["all", "profile", "location", "dock"];

search.get("/search", async (c) => {
  const q = (c.req.query("q") ?? "").trim().slice(0, 80);
  const rawFilter = c.req.query("type") ?? "all";
  const filter: SearchFilter = (FILTERS as string[]).includes(rawFilter) ? (rawFilter as SearchFilter) : "all";

  // Always search all three types (cheap: locations is in-memory, docks/users
  // are small LIKE queries) so the filter pills' counts stay accurate no
  // matter which one is currently selected — the filter only controls which
  // section(s) render, not what gets searched.
  const users = q && c.env.DB ? await searchUsers(c.env.DB, q) : [];
  const docksResult = q ? await searchDocks(c.env.DB, q) : [];
  const locations = q ? searchLocations(q) : [];

  return c.html(<SearchPage q={q} filter={filter} users={users} docks={docksResult} locations={locations} path="/search" />);
});
