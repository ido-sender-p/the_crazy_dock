import { Hono } from "hono";
import type { Env } from "../env";
import { docks } from "../data";
import { AddPhotoPage } from "../pages/addPhoto";
import { currentUser, safeNextPath } from "../lib/session";
import { insertDockPhoto, ratePhoto, findCommentsForPhoto, addComment } from "../lib/gallery";
import { detectImageType, detectImageOrientation, MAX_PHOTO_BYTES } from "../lib/imageValidation";
import { findPublishedDockBySlug } from "../lib/liveDocks";

export const gallery = new Hono<Env>();

async function resolveDockName(env: Env["Bindings"], slug: string): Promise<string | null> {
  const staticDock = docks.find((d) => d.slug === slug);
  if (staticDock) return staticDock.name;
  const liveDock = env.DB ? await findPublishedDockBySlug(env.DB, slug) : null;
  return liveDock?.name ?? null;
}

gallery.get("/docks/:slug/add-photo", async (c) => {
  const slug = c.req.param("slug");
  const dockName = await resolveDockName(c.env, slug);
  if (!dockName) return c.notFound();

  const user = await currentUser(c);
  if (!user) return c.redirect(`/login?next=${encodeURIComponent(safeNextPath(`/docks/${slug}/add-photo`))}`);

  return c.html(<AddPhotoPage user={user} dockName={dockName} dockSlug={slug} path={`/docks/${slug}/add-photo`} />);
});

gallery.post("/docks/:slug/add-photo", async (c) => {
  const slug = c.req.param("slug");
  const dockName = await resolveDockName(c.env, slug);
  if (!dockName) return c.notFound();

  const user = await currentUser(c);
  if (!user) return c.redirect(`/login?next=${encodeURIComponent(safeNextPath(`/docks/${slug}/add-photo`))}`);

  const form = await c.req.formData();
  const rejectWith = (error: string) =>
    c.html(<AddPhotoPage user={user} dockName={dockName} dockSlug={slug} path={`/docks/${slug}/add-photo`} error={error} />, 400);

  const photoEntries = form.getAll("photo");
  if (photoEntries.length !== 1) return rejectWith("Please attach exactly one photo.");

  const photo = photoEntries[0];
  if (!(photo instanceof File) || photo.size === 0) return rejectWith("Please attach a photo.");
  if (photo.size > MAX_PHOTO_BYTES) return rejectWith("Photo is too large (8 MB max).");

  const photoBytes = new Uint8Array(await photo.arrayBuffer());
  const detectedType = detectImageType(photoBytes);
  if (!detectedType) return rejectWith("That file doesn't look like a supported image (JPEG, PNG, GIF or WEBP).");

  const title = String(form.get("title") ?? "").trim().slice(0, 60);
  if (!title) return rejectWith("Please name the photo.");

  const caption = String(form.get("caption") ?? "").trim().slice(0, 1000);
  if (!caption) return rejectWith("Please tell us the story behind it.");

  const photoKey = crypto.randomUUID();
  await c.env.PHOTOS.put(photoKey, photoBytes, { httpMetadata: { contentType: detectedType } });

  await insertDockPhoto(c.env.DB, {
    dockSlug: slug,
    submittedBy: user.id,
    imageUrl: `/uploads/${photoKey}`,
    title,
    caption,
    imageOrientation: detectImageOrientation(photoBytes, detectedType) ?? "landscape",
  });

  return c.html(<AddPhotoPage user={user} dockName={dockName} dockSlug={slug} path={`/docks/${slug}/add-photo`} success />);
});

gallery.post("/docks/:slug/photos/:photoId/vote", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.json({ error: "login required" }, 401);

  const photoId = Number(c.req.param("photoId"));
  if (!Number.isInteger(photoId)) return c.json({ error: "invalid photo" }, 400);

  const body = await c.req.json().catch(() => null);
  const rating = Number(body?.rating);

  const result = await ratePhoto(c.env.DB, photoId, user.id, rating);
  if (!result.ok) {
    return c.json({ error: result.reason }, result.reason === "invalid_rating" ? 400 : 404);
  }
  return c.json({ votes: result.votes, avgRating: result.avgRating, yourRating: rating });
});

gallery.get("/docks/:slug/photos/:photoId/comments", async (c) => {
  if (!c.env.DB) return c.json({ comments: [] });

  const photoId = Number(c.req.param("photoId"));
  if (!Number.isInteger(photoId)) return c.json({ error: "invalid photo" }, 400);

  const comments = await findCommentsForPhoto(c.env.DB, photoId);
  return c.json({ comments });
});

gallery.post("/docks/:slug/photos/:photoId/comments", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.json({ error: "login required" }, 401);

  const photoId = Number(c.req.param("photoId"));
  if (!Number.isInteger(photoId)) return c.json({ error: "invalid photo" }, 400);

  const body = await c.req.json().catch(() => null);
  const text = String(body?.body ?? "").trim().slice(0, 500);
  if (!text) return c.json({ error: "empty comment" }, 400);

  const comment = await addComment(c.env.DB, photoId, user.id, text);
  if (!comment) return c.json({ error: "not found" }, 404);
  return c.json({ comment });
});
