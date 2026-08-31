export type User = {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  google_id: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  location: string | null;
  is_admin: number;
  created_at: string;
};

export function findUserByEmail(db: D1Database, email: string) {
  return db.prepare("SELECT * FROM users WHERE email = ?").bind(email.toLowerCase()).first<User>();
}

export function findUserById(db: D1Database, id: number) {
  return db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<User>();
}

export function findUserByUsername(db: D1Database, username: string) {
  return db.prepare("SELECT * FROM users WHERE username = ? COLLATE NOCASE").bind(username).first<User>();
}

export function findUserByGoogleId(db: D1Database, googleId: string) {
  return db.prepare("SELECT * FROM users WHERE google_id = ?").bind(googleId).first<User>();
}

export function linkGoogleId(db: D1Database, userId: number, googleId: string) {
  return db.prepare("UPDATE users SET google_id = ? WHERE id = ?").bind(googleId, userId).run();
}

// No password of their own. 'oauth:google' can never match verifyPassword's
// "pbkdf2$..." format, so this account is only ever reachable via Google.
export function createGoogleUser(db: D1Database, email: string, username: string, googleId: string) {
  return db
    .prepare(`INSERT INTO users (email, username, password_hash, google_id) VALUES (?, ?, 'oauth:google', ?)`)
    .bind(email.toLowerCase(), username, googleId)
    .run();
}

export function findUserBySession(db: D1Database, token: string) {
  return db
    .prepare(
      `SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id
       WHERE sessions.token = ? AND sessions.expires_at > datetime('now')`,
    )
    .bind(token)
    .first<User>();
}

const SESSION_LIFETIME_DAYS = 30;

export function createSession(db: D1Database, userId: number, token: string) {
  return db
    .prepare(`INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, datetime('now', ?))`)
    .bind(token, userId, `+${SESSION_LIFETIME_DAYS} days`)
    .run();
}

export function deleteSession(db: D1Database, token: string) {
  return db.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
}

const MAX_LOGIN_FAILURES = 5;
const LOGIN_LOCKOUT_WINDOW_MINUTES = 15;

export async function isLoginLocked(db: D1Database, email: string): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM login_failures
       WHERE email = ? AND attempted_at > datetime('now', ?)`,
    )
    .bind(email.toLowerCase(), `-${LOGIN_LOCKOUT_WINDOW_MINUTES} minutes`)
    .first<{ n: number }>();
  return (row?.n ?? 0) >= MAX_LOGIN_FAILURES;
}

export function recordLoginFailure(db: D1Database, email: string) {
  return db.prepare("INSERT INTO login_failures (email) VALUES (?)").bind(email.toLowerCase()).run();
}

export function clearLoginFailures(db: D1Database, email: string) {
  return db.prepare("DELETE FROM login_failures WHERE email = ?").bind(email.toLowerCase()).run();
}

export type NewSubmission = {
  submittedBy: number;
  name: string;
  dockType: string;
  country: string;
  stateProvince: string;
  settlement: string;
};

// Photo and story are added later, via the "Submit a photo" flow on the
// dock's own page once it's published, not required to submit the location
// itself. description/image_url/image_attribution stay empty until then.
export function insertSubmission(db: D1Database, submission: NewSubmission) {
  return db
    .prepare(
      `INSERT INTO docks (source, submitted_by, name, dock_type, country, state_province, settlement, published)
       VALUES ('user_submission', ?, ?, ?, ?, ?, ?, 0)`,
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
  published: number;
  review_status: string;
  block_reason: string | null;
  created_at: string;
};

export async function findSubmissionsByUser(db: D1Database, userId: number) {
  const result = await db
    .prepare(
      `SELECT id, name, dock_type, country, settlement, published, review_status, block_reason, created_at
       FROM docks WHERE source = 'user_submission' AND submitted_by = ?
       ORDER BY created_at DESC`,
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
       ORDER BY created_at DESC`,
    )
    .bind(userId)
    .all<PublicSubmission>();
  return result.results;
}

export type ReviewSubmission = Submission & {
  state_province: string;
  description: string;
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
              docks.description, docks.image_url, docks.image_attribution, docks.published,
              docks.review_status, docks.block_reason, docks.created_at,
              docks.submitted_by, users.username AS submitted_by_username
       FROM docks JOIN users ON users.id = docks.submitted_by
       WHERE docks.source = 'user_submission' AND docks.review_status IN (${placeholders})
       ORDER BY docks.created_at ASC`,
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
};

export function approveSubmission(db: D1Database, id: number, fields: ApprovedFields) {
  return db
    .prepare(
      `UPDATE docks SET
        review_status = 'published', published = 1, block_reason = NULL,
        slug = ?, continent = ?, continent_slug = ?, country = ?,
        state_province_slug = ?, settlement = ?, settlement_slug = ?, settlement_type = 'city',
        updated_at = datetime('now')
       WHERE id = ?`,
    )
    .bind(
      fields.slug,
      fields.continent,
      fields.continentSlug,
      fields.country,
      fields.stateProvinceSlug,
      fields.settlement,
      fields.settlementSlug,
      id,
    )
    .run();
}

export function blockSubmission(db: D1Database, id: number, reason: string) {
  return db
    .prepare(`UPDATE docks SET review_status = 'blocked', block_reason = ?, updated_at = datetime('now') WHERE id = ?`)
    .bind(reason, id)
    .run();
}

export function rejectSubmission(db: D1Database, id: number) {
  return db
    .prepare(`UPDATE docks SET review_status = 'rejected', published = 0, updated_at = datetime('now') WHERE id = ?`)
    .bind(id)
    .run();
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

export function updateUsername(db: D1Database, userId: number, username: string) {
  return db.prepare("UPDATE users SET username = ? WHERE id = ?").bind(username, userId).run();
}

export function updateAvatarUrl(db: D1Database, userId: number, avatarUrl: string) {
  return db.prepare("UPDATE users SET avatar_url = ? WHERE id = ?").bind(avatarUrl, userId).run();
}

export function updateEmail(db: D1Database, userId: number, email: string) {
  return db.prepare("UPDATE users SET email = ? WHERE id = ?").bind(email.toLowerCase(), userId).run();
}

export function updateProfileDetails(db: D1Database, userId: number, dateOfBirth: string | null, location: string | null) {
  return db
    .prepare("UPDATE users SET date_of_birth = ?, location = ? WHERE id = ?")
    .bind(dateOfBirth, location, userId)
    .run();
}

export function updateUserPassword(db: D1Database, userId: number, passwordHash: string) {
  return db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(passwordHash, userId).run();
}
