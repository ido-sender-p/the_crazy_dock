import { getCookie, setCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import type { Env } from "../env";
import { findUserBySession } from "./db";

export const SESSION_COOKIE = "session";

// Mirrors SESSION_COOKIE's presence but isn't httpOnly. It carries no
// authority of its own (just "1" or absent), so the header's inline script
// can read it client-side to swap "Log in" for "Profile" without needing
// every page route to fetch currentUser() and thread it through Layout.
export const UI_LOGGED_IN_COOKIE = "ui_logged_in";

export async function currentUser(c: Context<Env>) {
  if (!c.env.DB) return null;
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  return (await findUserBySession(c.env.DB, token)) ?? null;
}

// `next` comes straight from a query string or form field, so it's fully
// attacker-controlled. Without this check, a link like
// /login?next=https://evil.example would send a just-logged-in user
// straight to an external site (a classic open-redirect phishing setup).
// Only ever allow a same-site path: single leading slash, no "//" or "/\"
// (both get normalized to a protocol-relative URL by some browsers).
export function safeNextPath(raw: string | undefined | null, fallback = "/"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}

// Backfills UI_LOGGED_IN_COOKIE for sessions created before that cookie
// existed, so "Log in" flips to "Profile" without forcing a re-login. Just
// checks the session cookie is present, doesn't hit the DB, so an expired
// session still shows "Profile" until the next real currentUser() check
// redirects it to /login.
export async function syncUiLoggedInCookie(c: Context<Env>, next: Next) {
  const hasSession = !!getCookie(c, SESSION_COOKIE);
  const hasUiCookie = !!getCookie(c, UI_LOGGED_IN_COOKIE);
  if (hasSession && !hasUiCookie) {
    setCookie(c, UI_LOGGED_IN_COOKIE, "1", { secure: true, sameSite: "Lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  }
  await next();
}
