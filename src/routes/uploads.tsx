import { Hono } from "hono";
import type { Env } from "../env";

export const uploads = new Hono<Env>();

// UUIDs plus seeded keys like "dock-<slug>" and "marina-piccola-capri-cover".
const KEY_RE = /^[A-Za-z0-9._-]{1,200}$/;

const CACHE_CONTROL = "public, max-age=31536000, immutable";

// Every image on the site is a request here, so this is the main quota risk:
// answer from the Cache API when possible (no R2 read), and let browsers
// revalidate cheaply with If-None-Match.
uploads.get("/uploads/:key", async (c) => {
  const key = c.req.param("key");
  if (!KEY_RE.test(key)) return c.notFound();

  const cache = typeof caches !== "undefined" ? (caches as unknown as { default?: Cache }).default : undefined;
  const cacheKey = new Request(c.req.url, { method: "GET" });
  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return notModifiedOr(new Response(hit.body, hit), c.req.header("if-none-match"));
  }

  const object = await c.env.PHOTOS.get(key);
  if (!object) return c.notFound();

  const res = new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": CACHE_CONTROL,
      etag: object.httpEtag,
      "x-content-type-options": "nosniff",
      "content-disposition": "inline",
      "content-security-policy": "default-src 'none'; sandbox",
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
    return new Response(null, { status: 304, headers: { etag, "cache-control": CACHE_CONTROL } });
  }
  return res;
}
