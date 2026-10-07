import { getCookie } from "hono/cookie";
import type { Context } from "hono";
import type { Env } from "../env";
import { SESSION_COOKIE } from "./session";
import { assetVersion } from "./assets";

// Workers don't cache dynamic responses on their own, so anonymous GET pages
// that hit D1 go through the Cache API (per data centre, keyed by URL).
// Logged-in requests (session cookie present) always bypass it. A cache hit
// costs no D1 reads, which is what matters for the free-tier quota.
export async function edgeCached(c: Context<Env>, ttlSeconds: number, render: () => Promise<Response>): Promise<Response> {
  const cache = typeof caches !== "undefined" ? (caches as unknown as { default?: Cache }).default : undefined;
  if (!cache || c.req.method !== "GET" || getCookie(c, SESSION_COOKIE)) return render();

  // Keyed by URL plus the asset version (see lib/assets.ts), so a deploy never serves stale HTML.
  const keyUrl = new URL(c.req.url);
  keyUrl.searchParams.set("__v", assetVersion);
  const key = new Request(keyUrl.toString(), { method: "GET" });
  try {
    const hit = await cache.match(key);
    if (hit) return new Response(hit.body, hit); // copy: cached responses have immutable headers
  } catch {
    return render();
  }

  const res = await render();
  if (res.status !== 200) return res;
  res.headers.set("Cache-Control", `public, s-maxage=${ttlSeconds}`);
  try {
    c.executionCtx.waitUntil(cache.put(key, res.clone()));
  } catch {
    // no execution context (tests), just skip caching
  }
  return res;
}
