// Extra community photos attached to a dock that already exists (the
// gallery on the dock page), separate from the initial dock submission
// flow in lib/db.ts.

export type DockPhoto = {
  id: number;
  image_url: string;
  title: string; // short name, shown on the gallery tile
  caption: string; // the longer story, shown in the lightbox
  votes: number; // number of people who've rated it
  avg_rating: number; // 0 when unrated, otherwise the 1-10 average
};

export type PendingDockPhoto = DockPhoto & {
  dock_slug: string;
  submitted_by: number;
  submitted_by_username: string;
  created_at: string;
};

const MAX_VOTES_PER_DAY = 100;
const MAX_COMMENTS_PER_DAY = 20;
export const MAX_PENDING_PHOTOS = 5;

// Capped at the 60 newest, then shuffled in JS on every call so exposure
// doesn't favor whichever photo happened to be uploaded first. Ranking still
// exists (avg_rating), it's just not used to order the display; the page
// marks only the current #1, nothing else.
export async function findPublishedPhotosForDock(db: D1Database, dockSlug: string): Promise<DockPhoto[]> {
  const result = await db
    .prepare(
      `SELECT id, image_url, title, caption, votes, avg_rating FROM dock_photos
       WHERE dock_slug = ? AND review_status = 'published'
       ORDER BY id DESC LIMIT 60`,
    )
    .bind(dockSlug)
    .all<DockPhoto>();
  const photos = result.results;
  for (let i = photos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [photos[i], photos[j]] = [photos[j], photos[i]];
  }
  return photos;
}

// This user's own rating (1-10) for each photo of this dock they've already rated.
export async function findUserRatingsForDock(db: D1Database, userId: number, dockSlug: string): Promise<Record<number, number>> {
  const result = await db
    .prepare(
      `SELECT photo_votes.photo_id AS id, photo_votes.rating AS rating FROM photo_votes
       JOIN dock_photos ON dock_photos.id = photo_votes.photo_id
       WHERE photo_votes.user_id = ? AND dock_photos.dock_slug = ?`,
    )
    .bind(userId, dockSlug)
    .all<{ id: number; rating: number }>();
  return Object.fromEntries(result.results.map((r) => [r.id, r.rating]));
}

export type RatingHistoryEntry = {
  photo_id: number;
  dock_slug: string;
  image_url: string;
  title: string;
  caption: string;
  rating: number;
  rated_at: string;
};

// This is the user's own private history of what they rated. Showing it
// back to them isn't the same as exposing scores publicly (see the gallery,
// where votes/averages stay hidden from everyone).
export async function findRatingHistoryForUser(db: D1Database, userId: number): Promise<RatingHistoryEntry[]> {
  const result = await db
    .prepare(
      `SELECT photo_votes.photo_id, photo_votes.rating, photo_votes.created_at AS rated_at,
              dock_photos.dock_slug, dock_photos.image_url, dock_photos.title, dock_photos.caption
       FROM photo_votes JOIN dock_photos ON dock_photos.id = photo_votes.photo_id
       WHERE photo_votes.user_id = ?
       ORDER BY photo_votes.created_at DESC LIMIT 50`,
    )
    .bind(userId)
    .all<RatingHistoryEntry>();
  return result.results;
}

export type RateResult =
  | { ok: true; votes: number; avgRating: number }
  | { ok: false; reason: "invalid_rating" | "not_found" | "rate_limited" };

async function countSinceYesterday(db: D1Database, table: "photo_votes" | "photo_comments", userId: number): Promise<number> {
  const row = await db
    .prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE user_id = ? AND created_at > datetime('now', '-1 day')`)
    .bind(userId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function countPendingPhotos(db: D1Database, userId: number): Promise<number> {
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM dock_photos WHERE submitted_by = ? AND review_status = 'pending'")
    .bind(userId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

// Re-rating is allowed and just replaces the user's previous score for this
// photo (upsert), then the denormalized count/average are recomputed from
// photo_votes, the single source of truth, rather than incrementally
// adjusted, so they can never drift out of sync. Only a published photo that
// belongs to dockSlug can be rated. Upsert and recompute run as one batch.
export async function ratePhoto(
  db: D1Database,
  photoId: number,
  dockSlug: string,
  userId: number,
  rating: number,
): Promise<RateResult> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) return { ok: false, reason: "invalid_rating" };
  if ((await countSinceYesterday(db, "photo_votes", userId)) >= MAX_VOTES_PER_DAY) return { ok: false, reason: "rate_limited" };

  const [, stats] = await db.batch<{ votes: number; avg_rating: number }>([
    db
      .prepare(
        `INSERT INTO photo_votes (photo_id, user_id, rating)
         SELECT id, ?, ? FROM dock_photos WHERE id = ? AND dock_slug = ? AND review_status = 'published'
         ON CONFLICT (photo_id, user_id) DO UPDATE SET rating = excluded.rating, created_at = datetime('now')`,
      )
      .bind(userId, rating, photoId, dockSlug),
    db
      .prepare(
        `UPDATE dock_photos SET
           votes = (SELECT COUNT(*) FROM photo_votes WHERE photo_id = ?),
           avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM photo_votes WHERE photo_id = ?)
         WHERE id = ? AND dock_slug = ? AND review_status = 'published'
         RETURNING votes, avg_rating`,
      )
      .bind(photoId, photoId, photoId, dockSlug),
  ]);
  const row = stats.results[0];
  if (!row) return { ok: false, reason: "not_found" };
  return { ok: true, votes: row.votes, avgRating: row.avg_rating };
}

export async function findPendingPhotos(db: D1Database): Promise<PendingDockPhoto[]> {
  const result = await db
    .prepare(
      `SELECT dock_photos.id, dock_photos.dock_slug, dock_photos.image_url, dock_photos.title, dock_photos.caption,
              dock_photos.votes, dock_photos.avg_rating,
              dock_photos.submitted_by, dock_photos.created_at, users.username AS submitted_by_username
       FROM dock_photos JOIN users ON users.id = dock_photos.submitted_by
       WHERE dock_photos.review_status = 'pending'
       ORDER BY dock_photos.created_at ASC LIMIT 100`,
    )
    .all<PendingDockPhoto>();
  return result.results;
}

export type NewDockPhoto = {
  dockSlug: string;
  submittedBy: number;
  imageUrl: string;
  title: string;
  caption: string;
  imageOrientation: "portrait" | "landscape";
};

export function insertDockPhoto(db: D1Database, photo: NewDockPhoto) {
  return db
    .prepare(
      `INSERT INTO dock_photos (dock_slug, submitted_by, image_url, title, caption, image_orientation, review_status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    )
    .bind(photo.dockSlug, photo.submittedBy, photo.imageUrl, photo.title, photo.caption, photo.imageOrientation)
    .run();
}

// A dock submitted through /submit has no photo or story of its own (that
// form only collects the location). The first gallery photo approved for
// it becomes its cover, so the dock's own page isn't stuck blank forever.
// Only promotes a D1 user_submission row with no cover yet; never touches
// an already-set cover or the static data.ts entries. Both updates run in
// one batch and only a pending photo can be approved. Returns false when the
// photo doesn't exist or was already decided.
export async function approveDockPhoto(db: D1Database, id: number): Promise<boolean> {
  const [updated] = await db.batch([
    db.prepare(`UPDATE dock_photos SET review_status = 'published' WHERE id = ? AND review_status = 'pending'`).bind(id),
    db
      .prepare(
        `UPDATE docks SET
           image_url = (SELECT image_url FROM dock_photos WHERE id = ?1),
           image_attribution = 'Photo by ' || (SELECT username FROM users WHERE id = (SELECT submitted_by FROM dock_photos WHERE id = ?1)),
           description = (SELECT caption FROM dock_photos WHERE id = ?1),
           image_orientation = (SELECT image_orientation FROM dock_photos WHERE id = ?1)
         WHERE source = 'user_submission' AND (image_url IS NULL OR image_url = '')
           AND slug = (SELECT dock_slug FROM dock_photos WHERE id = ?1 AND review_status = 'published')`,
      )
      .bind(id),
  ]);
  return updated.meta.changes > 0;
}

export async function rejectDockPhoto(db: D1Database, id: number): Promise<boolean> {
  const res = await db
    .prepare(`UPDATE dock_photos SET review_status = 'rejected' WHERE id = ? AND review_status = 'pending'`)
    .bind(id)
    .run();
  return res.meta.changes > 0;
}

export type PhotoComment = {
  id: number;
  user_id: number;
  username: string;
  body: string;
  created_at: string;
};

// Comments are shown openly (username + text), unlike ratings, there's no
// privacy constraint here, only on the vote counts/scores. Empty unless the
// photo is published and belongs to dockSlug.
export async function findCommentsForPhoto(db: D1Database, photoId: number, dockSlug: string): Promise<PhotoComment[]> {
  const result = await db
    .prepare(
      `SELECT photo_comments.id, photo_comments.user_id, photo_comments.body, photo_comments.created_at,
              users.username FROM photo_comments JOIN users ON users.id = photo_comments.user_id
       WHERE photo_comments.photo_id = ?
         AND EXISTS (SELECT 1 FROM dock_photos WHERE id = ? AND dock_slug = ? AND review_status = 'published')
       ORDER BY photo_comments.created_at ASC LIMIT 100`,
    )
    .bind(photoId, photoId, dockSlug)
    .all<PhotoComment>();
  return result.results;
}

export type AddCommentResult = { ok: true; comment: PhotoComment } | { ok: false; reason: "not_found" | "rate_limited" };

export async function addComment(
  db: D1Database,
  photoId: number,
  dockSlug: string,
  user: { id: number; username: string },
  body: string,
): Promise<AddCommentResult> {
  if ((await countSinceYesterday(db, "photo_comments", user.id)) >= MAX_COMMENTS_PER_DAY) {
    return { ok: false, reason: "rate_limited" };
  }

  const inserted = await db
    .prepare(
      `INSERT INTO photo_comments (photo_id, user_id, body)
       SELECT id, ?, ? FROM dock_photos WHERE id = ? AND dock_slug = ? AND review_status = 'published'
       RETURNING id, created_at`,
    )
    .bind(user.id, body, photoId, dockSlug)
    .first<{ id: number; created_at: string }>();
  if (!inserted) return { ok: false, reason: "not_found" };
  return { ok: true, comment: { id: inserted.id, user_id: user.id, username: user.username, body, created_at: inserted.created_at } };
}
