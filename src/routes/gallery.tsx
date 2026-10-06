import { Hono } from "hono";
import type { Env } from "../env";
import { AddPhotoPage } from "../pages/addPhoto";
import { currentUser, requireUser } from "../lib/session";
import {
  insertDockPhoto,
  ratePhoto,
  findCommentsForPhoto,
  addComment,
  countPendingPhotos,
  MAX_PENDING_PHOTOS,
} from "../lib/gallery";
import { detectImageType, detectImageOrientation, MAX_PHOTO_BYTES } from "../lib/imageValidation";
import { resolveDock } from "../lib/liveDocks";
import { smallBody, uploadBody } from "../middleware/limits";

export const gallery = new Hono<Env>();

// Positive integer from a path param, or null.
function parseId(raw: string): number | null {
  return /^\d{1,12}$/.test(raw) && Number(raw) > 0 ? Number(raw) : null;
}

gallery.get("/docks/:slug/add-photo", async (c) => {
  const slug = c.req.param("slug");
  const dock = await resolveDock(c.env.DB, slug);
  if (!dock) return c.notFound();

  const user = await requireUser(c, `/docks/${slug}/add-photo`);
  if (user instanceof Response) return user;

  return c.html(<AddPhotoPage dockName={dock.name} dockSlug={slug} path={`/docks/${slug}/add-photo`} />);
});

gallery.post("/docks/:slug/add-photo", uploadBody, async (c) => {
  const slug = c.req.param("slug");
  const dock = await resolveDock(c.env.DB, slug);
  if (!dock) return c.notFound();

  const user = await requireUser(c, `/docks/${slug}/add-photo`);
  if (user instanceof Response) return user;

  const form = await c.req.formData();
  const rejectWith = (error: string) =>
    c.html(<AddPhotoPage dockName={dock.name} dockSlug={slug} path={`/docks/${slug}/add-photo`} error={error} />, 400);

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

  if ((await countPendingPhotos(c.env.DB, user.id)) >= MAX_PENDING_PHOTOS) {
    return rejectWith(`You already have ${MAX_PENDING_PHOTOS} photos waiting for review. Please wait for those first.`);
  }

  const photoKey = crypto.randomUUID();
  await c.env.PHOTOS.put(photoKey, photoBytes, { httpMetadata: { contentType: detectedType } });

  try {
    await insertDockPhoto(c.env.DB, {
      dockSlug: slug,
      submittedBy: user.id,
      imageUrl: `/uploads/${photoKey}`,
      title,
      caption,
      imageOrientation: detectImageOrientation(photoBytes, detectedType) ?? "landscape",
    });
  } catch (err) {
    await c.env.PHOTOS.delete(photoKey);
    throw err;
  }

  return c.html(<AddPhotoPage dockName={dock.name} dockSlug={slug} path={`/docks/${slug}/add-photo`} success />);
});

gallery.post("/docks/:slug/photos/:photoId/vote", smallBody, async (c) => {
  const user = await currentUser(c);
  if (!user) return c.json({ error: "login required" }, 401);

  const photoId = parseId(c.req.param("photoId"));
  if (!photoId) return c.json({ error: "invalid photo" }, 400);

  const body = await c.req.json().catch(() => null);
  const rating = Number(body?.rating);

  const result = await ratePhoto(c.env.DB, photoId, c.req.param("slug"), user.id, rating);
  if (!result.ok) {
    const status = result.reason === "invalid_rating" ? 400 : result.reason === "rate_limited" ? 429 : 404;
    return c.json({ error: result.reason }, status);
  }
  return c.json({ votes: result.votes, avgRating: result.avgRating, yourRating: rating });
});

gallery.get("/docks/:slug/photos/:photoId/comments", async (c) => {
  if (!c.env.DB) return c.json({ comments: [] });

  const photoId = parseId(c.req.param("photoId"));
  if (!photoId) return c.json({ error: "invalid photo" }, 400);

  const comments = await findCommentsForPhoto(c.env.DB, photoId, c.req.param("slug"));
  return c.json({ comments });
});

gallery.post("/docks/:slug/photos/:photoId/comments", smallBody, async (c) => {
  const user = await currentUser(c);
  if (!user) return c.json({ error: "login required" }, 401);

  const photoId = parseId(c.req.param("photoId"));
  if (!photoId) return c.json({ error: "invalid photo" }, 400);

  const body = await c.req.json().catch(() => null);
  const text = String(body?.body ?? "").trim().slice(0, 500);
  if (!text) return c.json({ error: "empty comment" }, 400);

  const result = await addComment(c.env.DB, photoId, c.req.param("slug"), user, text);
  if (!result.ok) return c.json({ error: result.reason }, result.reason === "rate_limited" ? 429 : 404);
  return c.json({ comment: result.comment });
});
