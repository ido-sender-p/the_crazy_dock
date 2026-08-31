import { Hono } from "hono";
import type { Env } from "../env";
import { slugify, type Dock } from "../data";
import { SubmitPage } from "../pages/submit";
import { insertSubmission } from "../lib/db";
import { currentUser } from "../lib/session";
import { detectImageType, MAX_PHOTO_BYTES } from "../lib/imageValidation";

export const submissions = new Hono<Env>();

const VALID_DOCK_TYPES: Dock["dockType"][] = ["pier", "marina", "floating_dock", "industrial"];

const FIELD_LIMITS = {
  name: 200,
  country: 200,
  stateProvince: 200,
  settlement: 200,
  description: 5000,
} as const;

submissions.get("/submit", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.redirect("/login?next=/submit");
  return c.html(<SubmitPage user={user} path="/submit" />);
});

function trimmedField(form: FormData, field: string, maxLength: number) {
  return String(form.get(field) ?? "").trim().slice(0, maxLength);
}

submissions.post("/submit", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.redirect("/login?next=/submit");

  const form = await c.req.formData();
  const rejectWith = (error: string) => c.html(<SubmitPage user={user} path="/submit" error={error} />, 400);

  // Reject outright if more than one file was attached, even though only
  // the first would ever be read below — an explicit check here means a
  // crafted multi-file request fails loudly instead of silently dropping data.
  const photoEntries = form.getAll("photo");
  if (photoEntries.length !== 1) return rejectWith("Please attach exactly one photo.");

  const photo = photoEntries[0];
  if (!(photo instanceof File) || photo.size === 0) return rejectWith("Please attach a photo.");
  if (photo.size > MAX_PHOTO_BYTES) return rejectWith("Photo is too large (8 MB max).");

  const photoBytes = new Uint8Array(await photo.arrayBuffer());
  const detectedType = detectImageType(photoBytes);
  if (!detectedType) return rejectWith("That file doesn't look like a supported image (JPEG, PNG, GIF or WEBP).");

  const dockType = String(form.get("dockType") ?? "");
  if (!VALID_DOCK_TYPES.includes(dockType as Dock["dockType"])) return rejectWith("Invalid dock type.");

  const name = trimmedField(form, "name", FIELD_LIMITS.name);
  const country = trimmedField(form, "country", FIELD_LIMITS.country);
  const settlement = trimmedField(form, "settlement", FIELD_LIMITS.settlement);
  const description = trimmedField(form, "description", FIELD_LIMITS.description);
  if (!name || !country || !settlement || !description) return rejectWith("Please fill in all required fields.");

  // Store the sniffed type, never the client-supplied one — that value is
  // fully attacker-controlled and would otherwise let a malicious upload get
  // served back to every visitor with a spoofed Content-Type.
  const photoKey = crypto.randomUUID();
  await c.env.PHOTOS.put(photoKey, photoBytes, { httpMetadata: { contentType: detectedType } });

  await insertSubmission(c.env.DB, {
    submittedBy: user.id,
    name,
    dockType,
    country,
    stateProvince: trimmedField(form, "stateProvince", FIELD_LIMITS.stateProvince),
    settlement,
    description,
    imageUrl: `/uploads/${photoKey}`,
    imageAttribution: name,
  });

  return c.html(<SubmitPage user={user} path="/submit" success />);
});

submissions.get("/uploads/:key", async (c) => {
  const object = await c.env.PHOTOS.get(c.req.param("key"));
  if (!object) return c.notFound();
  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
      "content-disposition": "inline",
    },
  });
});
