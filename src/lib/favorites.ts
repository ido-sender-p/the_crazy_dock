// Saved/favorited docks. dock_slug is a plain string (not a foreign key) for
// the same reason as dock_photos.dock_slug: it may point at a hardcoded
// data.ts entry or a published D1 row, and those two don't share a table.

export async function isFavorited(db: D1Database, userId: number, dockSlug: string): Promise<boolean> {
  const row = await db
    .prepare("SELECT 1 FROM favorites WHERE user_id = ? AND dock_slug = ?")
    .bind(userId, dockSlug)
    .first();
  return !!row;
}

export async function toggleFavorite(db: D1Database, userId: number, dockSlug: string): Promise<boolean> {
  const already = await isFavorited(db, userId, dockSlug);
  if (already) {
    await db.prepare("DELETE FROM favorites WHERE user_id = ? AND dock_slug = ?").bind(userId, dockSlug).run();
    return false;
  }
  await db.prepare("INSERT INTO favorites (user_id, dock_slug) VALUES (?, ?)").bind(userId, dockSlug).run();
  return true;
}

export async function findFavoriteSlugsForUser(db: D1Database, userId: number): Promise<string[]> {
  const result = await db
    .prepare("SELECT dock_slug FROM favorites WHERE user_id = ? ORDER BY created_at DESC")
    .bind(userId)
    .all<{ dock_slug: string }>();
  return result.results.map((r) => r.dock_slug);
}
