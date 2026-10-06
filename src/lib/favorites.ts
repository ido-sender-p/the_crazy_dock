// Saved/favorited docks. dock_slug is a plain string (not a foreign key) for
// the same reason as dock_photos.dock_slug: it may point at a hardcoded
// data.ts entry or a published D1 row, and those two don't share a table.

export const MAX_FAVORITES = 200;

export async function isFavorited(db: D1Database, userId: number, dockSlug: string): Promise<boolean> {
  const row = await db
    .prepare("SELECT 1 FROM favorites WHERE user_id = ? AND dock_slug = ?")
    .bind(userId, dockSlug)
    .first();
  return !!row;
}

// DELETE first, if nothing was there then INSERT (capped at MAX_FAVORITES).
export async function toggleFavorite(db: D1Database, userId: number, dockSlug: string): Promise<"added" | "removed" | "limit"> {
  const removed = await db.prepare("DELETE FROM favorites WHERE user_id = ? AND dock_slug = ?").bind(userId, dockSlug).run();
  if (removed.meta.changes > 0) return "removed";

  const added = await db
    .prepare(
      `INSERT OR IGNORE INTO favorites (user_id, dock_slug)
       SELECT ?1, ?2 WHERE (SELECT COUNT(*) FROM favorites WHERE user_id = ?1) < ?3`,
    )
    .bind(userId, dockSlug, MAX_FAVORITES)
    .run();
  return added.meta.changes > 0 ? "added" : "limit";
}

export async function findFavoriteSlugsForUser(db: D1Database, userId: number): Promise<string[]> {
  const result = await db
    .prepare("SELECT dock_slug FROM favorites WHERE user_id = ? ORDER BY created_at DESC LIMIT ?")
    .bind(userId, MAX_FAVORITES)
    .all<{ dock_slug: string }>();
  return result.results.map((r) => r.dock_slug);
}
