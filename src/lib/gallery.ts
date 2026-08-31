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

// Randomized on every call, freshly shuffled each time the gallery is
// opened, so exposure doesn't favor whichever photo happened to be
// uploaded first. Ranking still exists (avg_rating), it's just not used to
// order the display; the page marks only the current #1, nothing else.
export async function findPublishedPhotosForDock(db: D1Database, dockSlug: string): Promise<DockPhoto[]> {
  const result = await db
    .prepare(
      `SELECT id, image_url, title, caption, votes, avg_rating FROM dock_photos
       WHERE dock_slug = ? AND review_status = 'published'
       ORDER BY RANDOM()`,
    )
    .bind(dockSlug)
    .all<DockPhoto>();
  return result.results;
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
       ORDER BY photo_votes.created_at DESC`,
    )
    .bind(userId)
    .all<RatingHistoryEntry>();
  return result.results;
}

export type RateResult = { ok: true; votes: number; avgRating: number } | { ok: false; reason: "invalid_rating" | "not_found" };

// Re-rating is allowed and just replaces the user's previous score for this
// photo (upsert), then the denormalized count/average are recomputed from
// photo_votes, the single source of truth, rather than incrementally
// adjusted, so they can never drift out of sync.
export async function ratePhoto(db: D1Database, photoId: number, userId: number, rating: number): Promise<RateResult> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) return { ok: false, reason: "invalid_rating" };

  await db
    .prepare(
      `INSERT INTO photo_votes (photo_id, user_id, rating) VALUES (?, ?, ?)
       ON CONFLICT (photo_id, user_id) DO UPDATE SET rating = excluded.rating`,
    )
    .bind(photoId, userId, rating)
    .run();

  const stats = await db
    .prepare(`SELECT COUNT(*) AS n, AVG(rating) AS avg FROM photo_votes WHERE photo_id = ?`)
    .bind(photoId)
    .first<{ n: number; avg: number }>();
  const votes = stats?.n ?? 0;
  const avgRating = stats?.avg ?? 0;

  const updated = await db
    .prepare(`UPDATE dock_photos SET votes = ?, avg_rating = ? WHERE id = ?`)
    .bind(votes, avgRating, photoId)
    .run();
  if (updated.meta.changes === 0) return { ok: false, reason: "not_found" };

  return { ok: true, votes, avgRating };
}

export async function findPendingPhotos(db: D1Database): Promise<PendingDockPhoto[]> {
  const result = await db
    .prepare(
      `SELECT dock_photos.id, dock_photos.dock_slug, dock_photos.image_url, dock_photos.title, dock_photos.caption,
              dock_photos.votes, dock_photos.avg_rating,
              dock_photos.submitted_by, dock_photos.created_at, users.username AS submitted_by_username
       FROM dock_photos JOIN users ON users.id = dock_photos.submitted_by
       WHERE dock_photos.review_status = 'pending'
       ORDER BY dock_photos.created_at ASC`,
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
// an already-set cover or the static data.ts entries.
export async function approveDockPhoto(db: D1Database, id: number) {
  const photo = await db
    .prepare(
      `SELECT dock_photos.dock_slug, dock_photos.image_url, dock_photos.caption, dock_photos.image_orientation,
              users.username AS submitted_by_username
       FROM dock_photos JOIN users ON users.id = dock_photos.submitted_by
       WHERE dock_photos.id = ?`,
    )
    .bind(id)
    .first<{ dock_slug: string; image_url: string; caption: string; image_orientation: string; submitted_by_username: string }>();

  const updated = await db.prepare(`UPDATE dock_photos SET review_status = 'published' WHERE id = ?`).bind(id).run();
  if (!photo) return updated;

  await db
    .prepare(
      `UPDATE docks SET image_url = ?, image_attribution = ?, description = ?, image_orientation = ?
       WHERE source = 'user_submission' AND slug = ? AND (image_url IS NULL OR image_url = '')`,
    )
    .bind(photo.image_url, `Photo by ${photo.submitted_by_username}`, photo.caption, photo.image_orientation, photo.dock_slug)
    .run();

  return updated;
}

export function rejectDockPhoto(db: D1Database, id: number) {
  return db.prepare(`UPDATE dock_photos SET review_status = 'rejected' WHERE id = ?`).bind(id).run();
}

export type PhotoComment = {
  id: number;
  user_id: number;
  username: string;
  body: string;
  created_at: string;
};

// Comments are shown openly (username + text), unlike ratings — there's no
// privacy constraint here, only on the vote counts/scores.
export async function findCommentsForPhoto(db: D1Database, photoId: number): Promise<PhotoComment[]> {
  const result = await db
    .prepare(
      `SELECT photo_comments.id, photo_comments.user_id, photo_comments.body, photo_comments.created_at,
              users.username FROM photo_comments JOIN users ON users.id = photo_comments.user_id
       WHERE photo_comments.photo_id = ?
       ORDER BY photo_comments.created_at ASC`,
    )
    .bind(photoId)
    .all<PhotoComment>();
  return result.results;
}

export async function addComment(db: D1Database, photoId: number, userId: number, body: string): Promise<PhotoComment | null> {
  const photoExists = await db.prepare("SELECT 1 FROM dock_photos WHERE id = ?").bind(photoId).first();
  if (!photoExists) return null;

  const inserted = await db
    .prepare("INSERT INTO photo_comments (photo_id, user_id, body) VALUES (?, ?, ?) RETURNING id, created_at")
    .bind(photoId, userId, body)
    .first<{ id: number; created_at: string }>();
  if (!inserted) return null;

  const user = await db.prepare("SELECT username FROM users WHERE id = ?").bind(userId).first<{ username: string }>();
  return { id: inserted.id, user_id: userId, username: user?.username ?? "", body, created_at: inserted.created_at };
}
