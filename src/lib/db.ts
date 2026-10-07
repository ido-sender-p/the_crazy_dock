import { GOOGLE_PASSWORD_SENTINEL, sha256Hex } from "./auth";

// Never includes password_hash, so it can't leak into a page by accident.
export type User = {
  id: number;
  email: string;
  username: string;
  google_id: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  location: string | null;
  is_admin: number;
  created_at: string;
};

const USER_COLS = "id, email, username, google_id, avatar_url, date_of_birth, location, is_admin, created_at";

export function findUserByEmail(db: D1Database, email: string) {
  return db.prepare(`SELECT ${USER_COLS} FROM users WHERE email = ?`).bind(email.toLowerCase()).first<User>();
}

// Only the login path needs the hash.
export function findUserWithHashByEmail(db: D1Database, email: string) {
  return db
    .prepare(`SELECT ${USER_COLS}, password_hash FROM users WHERE email = ?`)
    .bind(email.toLowerCase())
    .first<User & { password_hash: string }>();
}

export async function findPasswordHash(db: D1Database, userId: number): Promise<string | null> {
  const row = await db.prepare("SELECT password_hash FROM users WHERE id = ?").bind(userId).first<{ password_hash: string }>();
  return row?.password_hash ?? null;
}

export function findUserByUsername(db: D1Database, username: string) {
  return db.prepare(`SELECT ${USER_COLS} FROM users WHERE username = ? COLLATE NOCASE`).bind(username).first<User>();
}

export function findUserByGoogleId(db: D1Database, googleId: string) {
  return db.prepare(`SELECT ${USER_COLS} FROM users WHERE google_id = ?`).bind(googleId).first<User>();
}

// Links Google to an existing account. Only when no Google id is set yet. A
// real password is replaced with the sentinel and every session is dropped, so
// someone who pre-registered a victim's email can't keep access afterwards.
export async function linkGoogleToUser(db: D1Database, userId: number, googleId: string): Promise<boolean> {
  const [updated] = await db.batch([
    db
      .prepare("UPDATE users SET google_id = ?, password_hash = ? WHERE id = ? AND google_id IS NULL")
      .bind(googleId, GOOGLE_PASSWORD_SENTINEL, userId),
    db.prepare("DELETE FROM sessions WHERE user_id = ? AND (SELECT google_id FROM users WHERE id = ?) = ?").bind(userId, userId, googleId),
  ]);
  return updated.meta.changes > 0;
}

export function createGoogleUser(db: D1Database, email: string, username: string, googleId: string) {
  return db
    .prepare(`INSERT INTO users (email, username, password_hash, google_id) VALUES (?, ?, ?, ?) RETURNING id`)
    .bind(email.toLowerCase(), username, GOOGLE_PASSWORD_SENTINEL, googleId)
    .first<{ id: number }>();
}

export function createUser(db: D1Database, email: string, username: string, passwordHash: string) {
  return db
    .prepare(`INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?) RETURNING id`)
    .bind(email.toLowerCase(), username, passwordHash)
    .first<{ id: number }>();
}

// ---- Sessions ----

export const SESSION_LIFETIME_DAYS = 30;

export async function findUserBySession(db: D1Database, token: string) {
  return db
    .prepare(
      `SELECT users.id, users.email, users.username, users.google_id, users.avatar_url,
              users.date_of_birth, users.location, users.is_admin, users.created_at
       FROM sessions JOIN users ON users.id = sessions.user_id
       WHERE sessions.token = ? AND sessions.expires_at > datetime('now')`,
    )
    .bind(await sha256Hex(token))
    .first<User>();
}

// Expired sessions are purged here, so no cron is needed to keep the table small.
export async function createSession(db: D1Database, userId: number, token: string) {
  await db.batch([
    db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')"),
    db
      .prepare(`INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, datetime('now', ?))`)
      .bind(await sha256Hex(token), userId, `+${SESSION_LIFETIME_DAYS} days`),
  ]);
}

export async function deleteSession(db: D1Database, token: string) {
  return db.prepare("DELETE FROM sessions WHERE token = ?").bind(await sha256Hex(token)).run();
}

// Drops every session of a user except the one in `keepToken` (if given).
export async function deleteOtherSessions(db: D1Database, userId: number, keepToken?: string) {
  if (!keepToken) return db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId).run();
  return db
    .prepare("DELETE FROM sessions WHERE user_id = ? AND token <> ?")
    .bind(userId, await sha256Hex(keepToken))
    .run();
}

// ---- Login / signup throttling ----

// Five misses lock one email for one client; the much higher global per-email cap stops a botnet guessing
// one account, while still not letting a stranger lock the real owner out with five requests.
const MAX_LOGIN_FAILURES_PER_EMAIL_AND_IP = 5;
const MAX_LOGIN_FAILURES_PER_EMAIL = 40;
const MAX_LOGIN_FAILURES_PER_IP = 20;
const LOGIN_LOCKOUT_WINDOW_MINUTES = 15;
const MAX_SIGNUPS_PER_IP = 5;
const SIGNUP_WINDOW_MINUTES = 60;

function throttleEmail(email: string) {
  return email.trim().toLowerCase().slice(0, 255);
}

export async function checkLoginThrottle(db: D1Database, email: string, ip: string) {
  const e = throttleEmail(email);
  const row = await db
    .prepare(
      `SELECT COALESCE(SUM(email = ?), 0) AS by_email, COALESCE(SUM(email = ? AND ip = ?), 0) AS by_email_ip,
              COALESCE(SUM(ip = ?), 0) AS by_ip FROM login_failures
       WHERE attempted_at > datetime('now', ?) AND (email = ? OR ip = ?)`,
    )
    .bind(e, e, ip, ip, `-${LOGIN_LOCKOUT_WINDOW_MINUTES} minutes`, e, ip)
    .first<{ by_email: number; by_email_ip: number; by_ip: number }>();
  const byEmail = row?.by_email ?? 0;
  const byEmailIp = row?.by_email_ip ?? 0;
  const byIp = row?.by_ip ?? 0;
  return {
    locked:
      byEmailIp >= MAX_LOGIN_FAILURES_PER_EMAIL_AND_IP ||
      byEmail >= MAX_LOGIN_FAILURES_PER_EMAIL ||
      byIp >= MAX_LOGIN_FAILURES_PER_IP,
    emailFailures: byEmail,
  };
}

// Records the failure and purges rows older than the window in one round trip.
export function recordLoginFailure(db: D1Database, email: string, ip: string) {
  return db.batch([
    db.prepare("INSERT INTO login_failures (email, ip) VALUES (?, ?)").bind(throttleEmail(email), ip),
    db.prepare("DELETE FROM login_failures WHERE attempted_at <= datetime('now', ?)").bind(`-${LOGIN_LOCKOUT_WINDOW_MINUTES} minutes`),
  ]);
}

export function clearLoginFailures(db: D1Database, email: string) {
  return db.prepare("DELETE FROM login_failures WHERE email = ?").bind(throttleEmail(email)).run();
}

// Counts the attempt and reports whether this IP is over the signup limit.
export async function signupThrottled(db: D1Database, ip: string): Promise<boolean> {
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM signup_attempts WHERE ip = ? AND attempted_at > datetime('now', ?)")
    .bind(ip, `-${SIGNUP_WINDOW_MINUTES} minutes`)
    .first<{ n: number }>();
  if ((row?.n ?? 0) >= MAX_SIGNUPS_PER_IP) return true;
  await db.batch([
    db.prepare("INSERT INTO signup_attempts (ip) VALUES (?)").bind(ip),
    db.prepare("DELETE FROM signup_attempts WHERE attempted_at <= datetime('now', ?)").bind(`-${SIGNUP_WINDOW_MINUTES} minutes`),
  ]);
  return false;
}

// ---- Dock submissions ----

export type NewSubmission = {
  submittedBy: number;
  name: string;
  dockType: string;
  country: string;
  stateProvince: string;
  settlement: string;
};

export const MAX_PENDING_SUBMISSIONS = 3;

export async function countPendingSubmissions(db: D1Database, userId: number) {
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM docks WHERE submitted_by = ? AND review_status = 'pending'")
    .bind(userId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

// Photo and story are added later, via the "Submit a photo" flow on the
// dock's own page once it's published, not required to submit the location
// itself. description/image_url/image_attribution stay empty until then.
export function insertSubmission(db: D1Database, submission: NewSubmission) {
  return db
    .prepare(
      `INSERT INTO docks (source, submitted_by, name, dock_type, country, state_province, settlement)
       VALUES ('user_submission', ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      submission.submittedBy,
      submission.name,
      submission.dockType,
      submission.country,
      submission.stateProvince,
      submission.settlement,
    )
    .run();
}

export type Submission = {
  id: number;
  name: string;
  dock_type: string;
  country: string;
  settlement: string;
  published: number; // 1 when review_status = 'published'
  review_status: string;
  block_reason: string | null;
  created_at: string;
};

export async function findSubmissionsByUser(db: D1Database, userId: number) {
  const result = await db
    .prepare(
      `SELECT id, name, dock_type, country, settlement, (review_status = 'published') AS published,
              review_status, block_reason, created_at
       FROM docks WHERE source = 'user_submission' AND submitted_by = ?
       ORDER BY created_at DESC LIMIT 50`,
    )
    .bind(userId)
    .all<Submission>();
  return result.results;
}

export type PublicSubmission = { slug: string; name: string; country: string; settlement: string; image_url: string | null };

// Public view of what a user has added: published only, since a stranger
// shouldn't see someone else's pending/rejected submissions.
export async function findPublishedSubmissionsByUser(db: D1Database, userId: number) {
  const result = await db
    .prepare(
      `SELECT slug, name, country, settlement, image_url FROM docks
       WHERE source = 'user_submission' AND submitted_by = ? AND review_status = 'published'
       ORDER BY created_at DESC LIMIT 50`,
    )
    .bind(userId)
    .all<PublicSubmission>();
  return result.results;
}

// description is no longer selected for the admin list (it is empty for
// pending submissions anyway), the field stays optional so pages compile.
export type ReviewSubmission = Submission & {
  state_province: string;
  description?: string;
  image_url: string;
  image_attribution: string;
  submitted_by: number;
  submitted_by_username: string;
};

export async function findSubmissionsByStatus(db: D1Database, statuses: string[]) {
  const placeholders = statuses.map(() => "?").join(",");
  const result = await db
    .prepare(
      `SELECT docks.id, docks.name, docks.dock_type, docks.country, docks.state_province, docks.settlement,
              docks.image_url, docks.image_attribution, (docks.review_status = 'published') AS published,
              docks.review_status, docks.block_reason, docks.created_at,
              docks.submitted_by, users.username AS submitted_by_username
       FROM docks JOIN users ON users.id = docks.submitted_by
       WHERE docks.source = 'user_submission' AND docks.review_status IN (${placeholders})
       ORDER BY docks.created_at ASC LIMIT 100`,
    )
    .bind(...statuses)
    .all<ReviewSubmission>();
  return result.results;
}

export type ApprovedFields = {
  slug: string;
  continent: string;
  continentSlug: string;
  country: string;
  stateProvinceSlug: string;
  settlement: string;
  settlementSlug: string;
  settlementType: "city" | "town" | "village";
};

// lat/lon stay NULL (unknown) and are never touched here. Returns false when
// the row doesn't exist or was already decided.
export async function approveSubmission(db: D1Database, id: number, fields: ApprovedFields): Promise<boolean> {
  const res = await db
    .prepare(
      `UPDATE docks SET
        review_status = 'published', block_reason = NULL,
        slug = ?, continent = ?, continent_slug = ?, country = ?,
        state_province_slug = ?, settlement = ?, settlement_slug = ?, settlement_type = ?,
        updated_at = datetime('now')
       WHERE id = ? AND source = 'user_submission' AND review_status IN ('pending', 'blocked')`,
    )
    .bind(
      fields.slug,
      fields.continent,
      fields.continentSlug,
      fields.country,
      fields.stateProvinceSlug,
      fields.settlement,
      fields.settlementSlug,
      fields.settlementType,
      id,
    )
    .run();
  return res.meta.changes > 0;
}

export async function blockSubmission(db: D1Database, id: number, reason: string): Promise<boolean> {
  const res = await db
    .prepare(
      `UPDATE docks SET review_status = 'blocked', block_reason = ?, updated_at = datetime('now')
       WHERE id = ? AND source = 'user_submission' AND review_status IN ('pending', 'blocked')`,
    )
    .bind(reason, id)
    .run();
  return res.meta.changes > 0;
}

export async function rejectSubmission(db: D1Database, id: number): Promise<boolean> {
  const res = await db
    .prepare(
      `UPDATE docks SET review_status = 'rejected', updated_at = datetime('now')
       WHERE id = ? AND source = 'user_submission' AND review_status IN ('pending', 'blocked')`,
    )
    .bind(id)
    .run();
  return res.meta.changes > 0;
}

export type SubmissionDetail = {
  id: number;
  name: string;
  dock_type: string;
  country: string;
  state_province: string;
  settlement: string;
};

export function findSubmissionById(db: D1Database, id: number) {
  return db
    .prepare(
      `SELECT id, name, dock_type, country, state_province, settlement
       FROM docks WHERE id = ? AND source = 'user_submission'`,
    )
    .bind(id)
    .first<SubmissionDetail>();
}

export async function slugExists(db: D1Database, slug: string) {
  const row = await db.prepare("SELECT 1 FROM docks WHERE slug = ?").bind(slug).first();
  return !!row;
}

// ---- Profile ----

export type ProfileUpdate = {
  username: string;
  email: string;
  dateOfBirth: string | null;
  location: string | null;
  avatarUrl?: string | null; // undefined keeps the current avatar
};

// One UPDATE for everything. Throws on a UNIQUE violation (email/username
// race), callers catch it with isUniqueViolation.
export function updateProfile(db: D1Database, userId: number, p: ProfileUpdate) {
  return db
    .prepare(
      `UPDATE users SET username = ?, email = ?, date_of_birth = ?, location = ?,
              avatar_url = CASE WHEN ? = 1 THEN ? ELSE avatar_url END
       WHERE id = ?`,
    )
    .bind(p.username, p.email.toLowerCase(), p.dateOfBirth, p.location, p.avatarUrl === undefined ? 0 : 1, p.avatarUrl ?? null, userId)
    .run();
}

// Changes the password and drops every other session in one batch.
export async function changePassword(db: D1Database, userId: number, passwordHash: string, keepToken?: string) {
  const del = keepToken
    ? db.prepare("DELETE FROM sessions WHERE user_id = ? AND token <> ?").bind(userId, await sha256Hex(keepToken))
    : db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId);
  await db.batch([db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(passwordHash, userId), del]);
}
