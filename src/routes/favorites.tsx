import { Hono } from "hono";
import type { Env } from "../env";
import { currentUser, safeNextPath } from "../lib/session";
import { toggleFavorite } from "../lib/favorites";
import { resolveDock } from "../lib/liveDocks";

export const favorites = new Hono<Env>();

favorites.post("/docks/:slug/favorite", async (c) => {
  const slug = c.req.param("slug");
  const dock = await resolveDock(c.env.DB, slug);
  if (!dock) return c.notFound();

  const user = await currentUser(c);
  if (!user) return c.redirect(`/login?next=${encodeURIComponent(safeNextPath(`/docks/${slug}`))}`);

  await toggleFavorite(c.env.DB, user.id, slug);
  return c.redirect(`/docks/${slug}`);
});
