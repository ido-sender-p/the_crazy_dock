import { Hono } from "hono";
import type { Env } from "../env";
import { UserProfilePage } from "../pages/userProfile";
import { findUserByUsername, findPublishedSubmissionsByUser } from "../lib/db";
import { findFavoriteSlugsForUser } from "../lib/favorites";
import { resolveDocks } from "../lib/liveDocks";
import { currentUser } from "../lib/session";
import { edgeCached } from "../lib/edgeCache";

export const users = new Hono<Env>();

users.get("/users/:username", (c) => {
  if (!c.env.DB) return c.notFound();
  const db = c.env.DB;

  const username = c.req.param("username");
  if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username)) return c.notFound();
  return edgeCached(c, 60, async () => {
    const profileUser = await findUserByUsername(db, username);
    if (!profileUser) return c.notFound();

    const [submissions, favoriteSlugs, viewer] = await Promise.all([
      findPublishedSubmissionsByUser(db, profileUser.id),
      findFavoriteSlugsForUser(db, profileUser.id),
      currentUser(c),
    ]);
    const favorites = await resolveDocks(db, favoriteSlugs);
    const canMessage = !!viewer && viewer.id !== profileUser.id;

    return c.html(
      <UserProfilePage
        username={profileUser.username}
        avatarUrl={profileUser.avatar_url}
        submissions={submissions}
        favorites={favorites}
        canMessage={canMessage}
        path={`/users/${profileUser.username}`}
      />,
    );
  });
});
