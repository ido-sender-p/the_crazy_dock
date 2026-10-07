import { Hono } from "hono";
import type { Env } from "../env";

export const uploads = new Hono<Env>();

// UUIDs plus seeded keys like "dock-<slug>" and "marina-piccola-capri-cover".
const KEY_RE = /^[A-Za-z0-9._-]{1,200}$/;

// Seeded catalogue photos never change under their key. User uploads (UUID keys) can be removed or
// replaced (takedowns), so they are cached for a day only.
const IMMUTABLE = "public, max-age=31536000, immutable";
const USER_UPLOAD = "public, max-age=86400";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Every image on the site is a request here, so this is the main quota risk:
// answer from the Cache API when possible (no R2 read), and let browsers
// revalidate cheaply with If-None-Match.
uploads.get("/uploads/:key", async (c) => {
  const key = c.req.param("key");
  if (!KEY_RE.test(key)) return c.notFound();

  const cache = typeof caches !== "undefined" ? (caches as unknown as { default?: Cache }).default : undefined;
  const cacheUrl = new URL(c.req.url);
  cacheUrl.search = "";
  cacheUrl.hash = "";
  const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });
  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return notModifiedOr(new Response(hit.body, hit), c.req.header("if-none-match"));
  }

  const object = await c.env.PHOTOS.get(key);
  if (!object) return c.notFound();

  const res = new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": UUID_RE.test(key) ? USER_UPLOAD : IMMUTABLE,
      etag: object.httpEtag,
      "x-content-type-options": "nosniff",
      "content-disposition": "inline",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'; sandbox",
      "cross-origin-resource-policy": "same-origin",
    },
  });
  if (cache) {
    try {
      c.executionCtx.waitUntil(cache.put(cacheKey, res.clone()));
    } catch {
      // no execution context, skip caching
    }
  }
  return notModifiedOr(res, c.req.header("if-none-match"));
});

function notModifiedOr(res: Response, ifNoneMatch: string | undefined): Response {
  const etag = res.headers.get("etag");
  if (etag && ifNoneMatch && ifNoneMatch.split(",").some((t) => t.trim() === etag || t.trim() === `W/${etag}` || t.trim() === "*")) {
    return new Response(null, { status: 304, headers: { etag, "cache-control": res.headers.get("cache-control") ?? IMMUTABLE } });
  }
  return res;
}
