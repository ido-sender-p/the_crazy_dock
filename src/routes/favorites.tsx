import { Hono } from "hono";
import type { Env } from "../env";
import { requireUser } from "../lib/session";
import { toggleFavorite, MAX_FAVORITES } from "../lib/favorites";
import { resolveDock } from "../lib/liveDocks";
import { smallBody } from "../middleware/limits";

export const favorites = new Hono<Env>();

favorites.post("/docks/:slug/favorite", smallBody, async (c) => {
  const slug = c.req.param("slug");
  const user = await requireUser(c, `/docks/${slug}`);
  if (user instanceof Response) return user;

  const dock = await resolveDock(c.env.DB, slug);
  if (!dock) return c.notFound();

  const result = await toggleFavorite(c.env.DB, user.id, slug);
  if (result === "limit") return c.text(`You can save up to ${MAX_FAVORITES} favorites.`, 409);
  return c.redirect(`/docks/${slug}`, 303);
});
