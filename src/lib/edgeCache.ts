import { getCookie } from "hono/cookie";
import type { Context } from "hono";
import type { Env } from "../env";
import { SESSION_COOKIE } from "./session";
import { assetVersion } from "./assets";

// Workers don't cache dynamic responses on their own, so anonymous GET pages
// that hit D1 go through the Cache API (per data centre, keyed by URL).
// Logged-in requests (session cookie present) always bypass it. A cache hit
// costs no D1 reads, which is what matters for the free-tier quota.
// What newSessionToken() issues (a UUID). Only a cookie shaped like one skips the cache, so a junk
// cookie cannot be used to force a fresh render (and its D1 reads) on demand.
const SESSION_TOKEN_RE = /^[0-9a-f-]{36}$/;
const NOT_FOUND_TTL = 60;

// `keyQuery` is the only part of the query string that may vary the response (already normalised by
// the caller, e.g. "q=port&type=all"). Everything else is dropped from the key, so ?x=1, ?x=2 ...
// all share one entry instead of each missing the cache and hitting D1.
export async function edgeCached(
  c: Context<Env>,
  ttlSeconds: number,
  render: () => Promise<Response>,
  keyQuery = "",
): Promise<Response> {
  const cache = typeof caches !== "undefined" ? (caches as unknown as { default?: Cache }).default : undefined;
  const session = getCookie(c, SESSION_COOKIE);
  if (!cache || c.req.method !== "GET" || (session && SESSION_TOKEN_RE.test(session))) return render();

  // Keyed by path plus the asset version (see lib/assets.ts), so a deploy never serves stale HTML.
  const keyUrl = new URL(c.req.url);
  keyUrl.search = keyQuery;
  keyUrl.searchParams.set("__v", assetVersion);
  const key = new Request(keyUrl.toString(), { method: "GET" });
  try {
    const hit = await cache.match(key);
    if (hit) return new Response(hit.body, hit); // copy: cached responses have immutable headers
  } catch {
    return render();
  }

  const res = await render();
  // Unknown slugs are cached briefly too, so bots probing random URLs don't each cost a D1 read.
  if (res.status !== 200 && res.status !== 404) return res;
  res.headers.set("Cache-Control", `public, s-maxage=${res.status === 200 ? ttlSeconds : Math.min(ttlSeconds, NOT_FOUND_TTL)}`);
  try {
    c.executionCtx.waitUntil(cache.put(key, res.clone()));
  } catch {
    // no execution context (tests), just skip caching
  }
  return res;
}
