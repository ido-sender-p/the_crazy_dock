import { Hono } from "hono";
import type { Env } from "../env";
import { UserProfilePage } from "../pages/userProfile";
import { findUserByUsername, findPublishedSubmissionsByUser } from "../lib/db";
import { findFavoriteSlugsForUser } from "../lib/favorites";
import { resolveDock } from "../lib/liveDocks";
import { currentUser } from "../lib/session";

export const users = new Hono<Env>();

users.get("/users/:username", async (c) => {
  if (!c.env.DB) return c.notFound();

  const username = c.req.param("username");
  const profileUser = await findUserByUsername(c.env.DB, username);
  if (!profileUser) return c.notFound();

  const submissions = await findPublishedSubmissionsByUser(c.env.DB, profileUser.id);
  const favoriteSlugs = await findFavoriteSlugsForUser(c.env.DB, profileUser.id);
  const favorites = (
    await Promise.all(favoriteSlugs.map((slug) => resolveDock(c.env.DB, slug)))
  ).filter((d): d is NonNullable<typeof d> => d !== null);

  const viewer = await currentUser(c);
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
