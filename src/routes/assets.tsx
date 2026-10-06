import { Hono } from "hono";
import type { Env } from "../env";
import { findAsset } from "../lib/assets";

export const assets = new Hono<Env>();

// Names carry a content hash, so a changed file is a new URL and the old one can be cached forever.
assets.get("/assets/:file", (c) => {
  const asset = findAsset(c.req.param("file"));
  if (!asset) return c.notFound();
  return new Response(asset.body, {
    headers: {
      "content-type": asset.type,
      "cache-control": "public, max-age=31536000, immutable",
      etag: `"${asset.etag}"`,
      "x-content-type-options": "nosniff",
    },
  });
});
