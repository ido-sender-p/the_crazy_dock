import { Hono } from "hono";
import type { Env } from "../env";
import { UserProfilePage } from "../pages/userProfile";
import { findUserByUsername, findPublishedSubmissionsByUser } from "../lib/db";
import { findFavoriteSlugsForUser } from "../lib/favorites";
import { resolveDocks } from "../lib/liveDocks";
import { currentUser } from "../lib/session";

export const users = new Hono<Env>();

users.get("/users/:username", async (c) => {
  if (!c.env.DB) return c.notFound();

  const username = c.req.param("username");
  if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username)) return c.notFound();
  const profileUser = await findUserByUsername(c.env.DB, username);
  if (!profileUser) return c.notFound();

  const [submissions, favoriteSlugs, viewer] = await Promise.all([
    findPublishedSubmissionsByUser(c.env.DB, profileUser.id),
    findFavoriteSlugsForUser(c.env.DB, profileUser.id),
    currentUser(c),
  ]);
  const favorites = await resolveDocks(c.env.DB, favoriteSlugs);
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
