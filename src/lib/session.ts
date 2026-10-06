import { getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import type { Env } from "../env";
import { findUserBySession, SESSION_LIFETIME_DAYS, type User } from "./db";

export const SESSION_COOKIE = "session";

// Mirrors SESSION_COOKIE's presence but isn't httpOnly. It carries no
// authority of its own (just "1" or absent), so the header's inline script
// can read it client-side to swap "Log in" for "Profile" without needing
// every page route to fetch currentUser() and thread it through Layout.
export const UI_LOGGED_IN_COOKIE = "ui_logged_in";

const SESSION_MAX_AGE = 60 * 60 * 24 * SESSION_LIFETIME_DAYS;

export const sessionCookieOpts = {
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
  path: "/",
  maxAge: SESSION_MAX_AGE,
} as const;

export function setSessionCookies(c: Context<Env>, token: string) {
  setCookie(c, SESSION_COOKIE, token, sessionCookieOpts);
  setCookie(c, UI_LOGGED_IN_COOKIE, "1", { ...sessionCookieOpts, httpOnly: false });
}

// Looked up once per request, later calls reuse the result.
export async function currentUser(c: Context<Env>): Promise<User | null> {
  const cached = c.get("user");
  if (cached !== undefined) return cached;
  let user: User | null = null;
  const token = c.env.DB ? getCookie(c, SESSION_COOKIE) : undefined;
  if (token) user = (await findUserBySession(c.env.DB, token)) ?? null;
  c.set("user", user);
  return user;
}

// Returns the logged-in user, or a redirect to /login that comes back to
// `next` (default: the current path and query) after login.
export async function requireUser(c: Context<Env>, next?: string): Promise<User | Response> {
  const user = await currentUser(c);
  if (user) return user;
  const url = new URL(c.req.url);
  const target = safeNextPath(next ?? url.pathname + url.search);
  return c.redirect(`/login?next=${encodeURIComponent(target)}`);
}

// `next` comes straight from a query string or form field, so it's fully
// attacker-controlled. Without this check, a link like
// /login?next=https://evil.example would send a just-logged-in user
// straight to an external site (a classic open-redirect phishing setup).
// Only a same-origin path survives: no control chars or backslashes (browsers
// strip tabs/newlines and treat "\" as "/", turning "/\t/evil" into "//evil"),
// and the parsed URL must still point at our own dummy origin.
export function safeNextPath(raw: string | undefined | null, fallback = "/"): string {
  if (!raw || !raw.startsWith("/") || /[\u0000-\u001f\\]/.test(raw)) return fallback;
  try {
    const base = "http://wildock.invalid";
    const url = new URL(raw, base);
    if (url.origin !== base) return fallback;
    return url.pathname + url.search;
  } catch {
    return fallback;
  }
}

// Cloudflare always sets this header at the edge. Under wrangler dev it's
// absent, so everyone shares the 'unknown' bucket locally.
export function clientIp(c: Context<Env>): string {
  return (c.req.header("CF-Connecting-IP") ?? "unknown").slice(0, 64);
}
