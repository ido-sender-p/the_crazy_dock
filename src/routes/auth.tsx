import { Hono, type Context } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import type { Env } from "../env";
import { LoginPage, SignupPage, ForgotPasswordPage } from "../pages/login";
import { ProfilePage } from "../pages/profile";
import { verifyPassword, hashPassword, newSessionToken, DUMMY_PASSWORD_HASH } from "../lib/auth";
import { findUserByEmail,
  findUserWithHashByEmail,
  findUserByGoogleId,
  linkGoogleToUser,
  createGoogleUser,
  createUser,
  createSession,
  deleteSession,
  findSubmissionsByUser,
  checkLoginThrottle,
  recordLoginFailure,
  clearLoginFailures,
  signupThrottled,
  type User, } from "../lib/db";
import { currentUser,
  requireUser,
  clientIp,
  safeNextPath,
  setSessionCookies,
  sessionCookieOpts,
  SESSION_COOKIE,
  UI_LOGGED_IN_COOKIE, } from "../lib/session";
import { buildGoogleAuthUrl, exchangeGoogleCode, fetchGoogleProfile, isEmailVerified } from "../lib/googleAuth";
import { findFavoriteSlugsForUser } from "../lib/favorites";
import { resolveDocks } from "../lib/liveDocks";
import { findRatingHistoryForUser } from "../lib/gallery";
import { MAX_PASSWORD_LENGTH,
  checkUsername,
  checkEmail,
  checkNewPassword,
  isUniqueViolation,
  uniqueViolationField,
  usernameFromName,
  USERNAME_TAKEN_ERROR,
  EMAIL_TAKEN_ERROR, } from "../lib/validation";
import { smallBody } from "../middleware/limits";

export const auth = new Hono<Env>();

async function startSession(c: Context<Env>, userId: number) {
  const token = newSessionToken();
  await createSession(c.env.DB, userId, token);
  setSessionCookies(c, token);
}

auth.get("/login", async (c) => {
  const next = safeNextPath(c.req.query("next"), "/profile");
  if (await currentUser(c)) return c.redirect(next);
  return c.html(<LoginPage next={next} path="/login" />);
});

auth.post("/login", smallBody, async (c) => {
  const form = await c.req.formData();
  const email = String(form.get("email") ?? "").trim().slice(0, 255);
  const password = String(form.get("password") ?? "");
  const next = safeNextPath(String(form.get("next") ?? ""), "/profile");
  const ip = clientIp(c);

  const genericError = "Invalid email or password.";
  const throttle = await checkLoginThrottle(c.env.DB, email, ip);
  if (throttle.locked) {
    return c.html(<LoginPage next={next} path="/login" error="Too many attempts. Try again in a few minutes." />, 429);
  }

  const user = await findUserWithHashByEmail(c.env.DB, email);
  const passwordOk =
    password.length <= MAX_PASSWORD_LENGTH && (await verifyPassword(password, user?.password_hash ?? DUMMY_PASSWORD_HASH));
  if (!user || !passwordOk) {
    await recordLoginFailure(c.env.DB, email, ip);
    return c.html(<LoginPage next={next} path="/login" error={genericError} />, 401);
  }
  if (throttle.emailFailures > 0) await clearLoginFailures(c.env.DB, email);
  await startSession(c, user.id);
  return c.redirect(next);
});

auth.get("/signup", async (c) => {
  const next = safeNextPath(c.req.query("next"), "/profile");
  if (await currentUser(c)) return c.redirect(next);
  return c.html(<SignupPage next={next} path="/signup" />);
});

auth.post("/signup", smallBody, async (c) => {
  const form = await c.req.formData();
  const next = safeNextPath(String(form.get("next") ?? ""), "/profile");
  const rejectWith = (error: string, status: 400 | 429 = 400) =>
    c.html(<SignupPage next={next} path="/signup" error={error} />, status);

  const username = checkUsername(String(form.get("username") ?? ""));
  if (!username.ok) return rejectWith(username.error);
  const email = checkEmail(String(form.get("email") ?? ""));
  if (!email.ok) return rejectWith(email.error);

  const password = String(form.get("password") ?? "");
  const passwordError = checkNewPassword(password, String(form.get("confirmPassword") ?? ""));
  if (passwordError) return rejectWith(passwordError);

  if (await signupThrottled(c.env.DB, clientIp(c))) {
    return rejectWith("Too many sign-ups from this network. Please try again later.", 429);
  }

  let created: { id: number } | null;
  try {
    created = await createUser(c.env.DB, email.value, username.value, await hashPassword(password));
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    return rejectWith(uniqueViolationField(err) === "username" ? USERNAME_TAKEN_ERROR : EMAIL_TAKEN_ERROR);
  }
  if (!created) return rejectWith("Could not create your account. Please try again.");

  await startSession(c, created.id);
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
  // state, one fewer thing to trust from the query string on the way back.
  setCookie(c, GOOGLE_STATE_COOKIE, `${state}:${next}`, { ...sessionCookieOpts, maxAge: 600 });
  return c.redirect(buildGoogleAuthUrl(c.env.GOOGLE_CLIENT_ID, googleRedirectUri(c), state));
});

// A fresh Google user gets Google's display name squeezed into the username
// rules, with a numeric suffix if it's taken.
async function createGoogleUserWithFreeName(c: Context<Env>, email: string, name: string | undefined, sub: string) {
  const base = usernameFromName(name ?? "", email);
  for (let attempt = 0; attempt < 5; attempt++) {
    const username = attempt === 0 ? base : `${base}${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      return await createGoogleUser(c.env.DB, email, username, sub);
    } catch (err) {
      if (!isUniqueViolation(err) || uniqueViolationField(err) !== "username") throw err;
    }
  }
  return null;
}

auth.get("/auth/google/callback", async (c) => {
  const saved = getCookie(c, GOOGLE_STATE_COOKIE) ?? "";
  deleteCookie(c, GOOGLE_STATE_COOKIE, { path: "/" });
  // Split on the first colon only: the next path may itself contain ":".
  const sep = saved.indexOf(":");
  const savedState = sep === -1 ? saved : saved.slice(0, sep);
  const next = safeNextPath(sep === -1 ? "" : saved.slice(sep + 1), "/profile");

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
  if (!isEmailVerified(profile) || !profile.sub || !profile.email) return fail("That Google account's email isn't verified.");
  const email = profile.email.toLowerCase();

  let user: Pick<User, "id"> | null = await findUserByGoogleId(c.env.DB, profile.sub);
  if (!user) {
    const existing = await findUserByEmail(c.env.DB, email);
    if (existing) {
      // Same email, no Google link yet: link it instead of creating a
      // duplicate. Any password the account had is dropped and its sessions
      // revoked (see linkGoogleToUser), so whoever registered that email first
      // can't stay logged in. Refuses if it's linked to another Google account.
      if (!(await linkGoogleToUser(c.env.DB, existing.id, profile.sub))) {
        return fail("That email is already linked to a different Google account.");
      }
      user = existing;
    } else {
      try {
        user = await createGoogleUserWithFreeName(c, email, profile.name, profile.sub);
      } catch (err) {
        if (!isUniqueViolation(err)) throw err;
        return fail("Could not create your account. Please try again.");
      }
    }
  }
  if (!user) return fail("Could not create your account. Please try again.");

  await startSession(c, user.id);
  return c.redirect(next);
});

auth.post("/logout", smallBody, async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token && c.env.DB) await deleteSession(c.env.DB, token);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  deleteCookie(c, UI_LOGGED_IN_COOKIE, { path: "/" });
  return c.redirect("/", 303);
});

auth.get("/profile", async (c) => {
  const user = await requireUser(c);
  if (user instanceof Response) return user;

  const [submissions, ratingHistory, favoriteSlugs] = await Promise.all([
    findSubmissionsByUser(c.env.DB, user.id),
    findRatingHistoryForUser(c.env.DB, user.id),
    findFavoriteSlugsForUser(c.env.DB, user.id),
  ]);
  const favorites = await resolveDocks(c.env.DB, favoriteSlugs);

  return c.html(
    <ProfilePage user={user} submissions={submissions} favorites={favorites} ratingHistory={ratingHistory} path="/profile" />,
  );
});
