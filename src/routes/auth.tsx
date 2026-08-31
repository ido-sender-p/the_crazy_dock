import { Hono, type Context } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import type { Env } from "../env";
import { LoginPage, ForgotPasswordPage } from "../pages/login";
import { ProfilePage } from "../pages/profile";
import { verifyPassword, newSessionToken, DUMMY_PASSWORD_HASH } from "../lib/auth";
import {
  findUserByEmail,
  findUserByGoogleId,
  linkGoogleId,
  createGoogleUser,
  createSession,
  deleteSession,
  findSubmissionsByUser,
  isLoginLocked,
  recordLoginFailure,
  clearLoginFailures,
} from "../lib/db";
import { currentUser, safeNextPath, SESSION_COOKIE, UI_LOGGED_IN_COOKIE } from "../lib/session";
import { buildGoogleAuthUrl, exchangeGoogleCode, fetchGoogleProfile } from "../lib/googleAuth";
import { findFavoriteSlugsForUser } from "../lib/favorites";
import { resolveDock } from "../lib/liveDocks";
import { findRatingHistoryForUser } from "../lib/gallery";

export const auth = new Hono<Env>();

async function startSession(c: Context<Env>, userId: number) {
  const token = newSessionToken();
  await createSession(c.env.DB, userId, token);
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  setCookie(c, UI_LOGGED_IN_COOKIE, "1", { secure: true, sameSite: "Lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

auth.get("/login", async (c) => {
  const next = safeNextPath(c.req.query("next"), "/profile");
  if (await currentUser(c)) return c.redirect(next);
  return c.html(<LoginPage next={next} path="/login" />);
});

auth.post("/login", async (c) => {
  const form = await c.req.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const next = safeNextPath(String(form.get("next") ?? ""), "/profile");

  const genericError = "Invalid email or password.";
  if (await isLoginLocked(c.env.DB, email)) {
    return c.html(<LoginPage next={next} path="/login" error="Too many attempts. Try again in a few minutes." />, 429);
  }

  const user = await findUserByEmail(c.env.DB, email);
  const passwordOk = await verifyPassword(password, user?.password_hash ?? DUMMY_PASSWORD_HASH);
  if (!user || !passwordOk) {
    await recordLoginFailure(c.env.DB, email);
    return c.html(<LoginPage next={next} path="/login" error={genericError} />, 401);
  }
  await clearLoginFailures(c.env.DB, email);
  await startSession(c, user.id);
  return c.redirect(next);
});

auth.get("/forgot-password", (c) => c.html(<ForgotPasswordPage path="/forgot-password" />));

const GOOGLE_STATE_COOKIE = "google_oauth_state";

function googleRedirectUri(c: Context<Env>) {
  return `${new URL(c.req.url).origin}/auth/google/callback`;
}

auth.get("/login/google", async (c) => {
  if (!c.env.GOOGLE_CLIENT_ID) return c.text("Google sign-in isn't configured yet.", 501);

  const next = safeNextPath(c.req.query("next"), "/profile");
  const state = crypto.randomUUID();
  // The next path rides along in the same short-lived cookie as the CSRF
  // state — one fewer thing to trust from the query string on the way back.
  setCookie(c, GOOGLE_STATE_COOKIE, `${state}:${next}`, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 600,
  });
  return c.redirect(buildGoogleAuthUrl(c.env.GOOGLE_CLIENT_ID, googleRedirectUri(c), state));
});

auth.get("/auth/google/callback", async (c) => {
  const saved = getCookie(c, GOOGLE_STATE_COOKIE);
  deleteCookie(c, GOOGLE_STATE_COOKIE, { path: "/" });
  const [savedState, savedNext] = (saved ?? "").split(":");
  const next = safeNextPath(savedNext, "/profile");

  const code = c.req.query("code");
  const returnedState = c.req.query("state");
  const fail = (message: string) => c.html(<LoginPage next={next} path="/login" error={message} />, 400);

  if (!c.env.GOOGLE_CLIENT_ID || !c.env.GOOGLE_CLIENT_SECRET) return c.text("Google sign-in isn't configured yet.", 501);
  if (!code || !returnedState || returnedState !== savedState) return fail("Google sign-in failed. Please try again.");

  let profile;
  try {
    const token = await exchangeGoogleCode(c.env.GOOGLE_CLIENT_ID, c.env.GOOGLE_CLIENT_SECRET, googleRedirectUri(c), code);
    profile = await fetchGoogleProfile(token.access_token);
  } catch {
    return fail("Google sign-in failed. Please try again.");
  }
  if (!profile.email_verified) return fail("That Google account's email isn't verified.");

  let user = await findUserByGoogleId(c.env.DB, profile.sub);
  if (!user) {
    // Same email, no Google link yet — link it instead of creating a
    // duplicate account, so a password user who later tries Google keeps
    // one identity.
    const existing = await findUserByEmail(c.env.DB, profile.email);
    if (existing) {
      await linkGoogleId(c.env.DB, existing.id, profile.sub);
      user = existing;
    } else {
      await createGoogleUser(c.env.DB, profile.email, profile.name || profile.email.split("@")[0], profile.sub);
      user = await findUserByEmail(c.env.DB, profile.email);
    }
  }
  if (!user) return fail("Could not create your account. Please try again.");

  await startSession(c, user.id);
  return c.redirect(next);
});

auth.get("/logout", async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token && c.env.DB) await deleteSession(c.env.DB, token);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  deleteCookie(c, UI_LOGGED_IN_COOKIE, { path: "/" });
  return c.redirect("/");
});

auth.get("/profile", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.redirect("/login?next=/profile");

  const submissions = c.env.DB ? await findSubmissionsByUser(c.env.DB, user.id) : [];
  const ratingHistory = c.env.DB ? await findRatingHistoryForUser(c.env.DB, user.id) : [];

  const favoriteSlugs = c.env.DB ? await findFavoriteSlugsForUser(c.env.DB, user.id) : [];
  const favorites = (
    await Promise.all(favoriteSlugs.map((slug) => resolveDock(c.env.DB, slug)))
  ).filter((d): d is NonNullable<typeof d> => d !== null);

  return c.html(
    <ProfilePage user={user} submissions={submissions} favorites={favorites} ratingHistory={ratingHistory} path="/profile" />,
  );
});
