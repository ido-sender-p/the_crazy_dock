import { Layout } from "../layout";
import { raw } from "hono/html";
import type { User, Submission } from "../lib/db";
import type { Dock } from "../data";
import type { RatingHistoryEntry } from "../lib/gallery";

const PAGE_CSS = `
  .profile-page { padding: 56px 0 100px; max-width: 640px; }
  .profile-head { display: flex; align-items: center; gap: 18px; margin-bottom: 36px; }
  .profile-avatar {
    width: 64px; height: 64px; border-radius: 50%; flex: none; object-fit: cover;
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    color: #fff; display: flex; align-items: center; justify-content: center;
    font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.5rem;
  }
  .profile-head h1 { font-size: 1.7rem; margin: 0 0 4px; }
  .profile-head p { margin: 0; color: var(--ink-soft); font-size: 0.9rem; }
  .profile-head p a { color: var(--accent-dark); text-decoration: none; }

  .profile-page .kicker {
    color: var(--accent-dark); font-weight: 600; font-size: 0.8rem; text-transform: uppercase;
    letter-spacing: 0.06em; margin-top: 8px;
  }
  .profile-page section { margin-top: 40px; }
  .profile-page h2 { font-size: 1.3rem; margin: 4px 0 18px; }

  .favorite-list { display: flex; flex-direction: column; gap: 12px; }
  .favorite-row {
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px;
    padding: 14px 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface);
    text-decoration: none; color: inherit;
  }
  .favorite-row .name { font-weight: 600; font-size: 0.95rem; }
  .favorite-row .place { color: var(--ink-soft); font-size: 0.85rem; }

  .rating-history-list { display: flex; flex-direction: column; gap: 10px; }
  .rating-history-row {
    display: flex; align-items: center; gap: 14px;
    padding: 10px 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface);
    text-decoration: none; color: inherit;
  }
  .rating-history-row img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; flex: none; }
  .rating-history-row .caption { font-size: 0.88rem; flex: 1; min-width: 0; }
  .rating-history-row .your-rating {
    font-size: 0.8rem; font-weight: 600; color: var(--accent-dark);
    background: var(--surface-alt, #f4f1ea); padding: 4px 10px; border-radius: 999px; white-space: nowrap;
  }

  .submission-list { display: flex; flex-direction: column; gap: 12px; }
  .submission-row {
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px;
    padding: 14px 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface);
  }
  .submission-row .name { font-weight: 600; font-size: 0.95rem; }
  .submission-row .place { color: var(--ink-soft); font-size: 0.85rem; }
  .status {
    font-size: 0.75rem; font-weight: 600; padding: 5px 12px; border-radius: 999px; white-space: nowrap;
  }
  .status.pending { background: #fdf3e2; color: #9c6b1f; }
  .status.published { background: #eafaf3; color: #146b43; }

  .profile-page .empty { padding: 24px; border: 1px dashed var(--border); border-radius: 12px; color: var(--ink-soft); font-size: 0.9rem; }
`;

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

export function ProfilePage(opts: {
  user: User;
  submissions: Submission[];
  favorites: Dock[];
  ratingHistory: RatingHistoryEntry[];
  path: string;
}) {
  return (
    <Layout title={`${opts.user.username} | Wildock`} description="Your Wildock profile." path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap profile-page">
        <div class="profile-head">
          {opts.user.avatar_url ? (
            <img class="profile-avatar" src={opts.user.avatar_url} alt="" />
          ) : (
            <div class="profile-avatar">{initials(opts.user.username)}</div>
          )}
          <div>
            <h1>{opts.user.username}</h1>
            <p>
              {opts.user.email} ·{" "}
              <a href="/profile/edit">Edit profile</a> ·{" "}
              <a href="/messages">Messages</a> ·{" "}
              {opts.user.is_admin ? (
                <>
                  <a href="/admin/submissions">Review submissions</a> ·{" "}
                </>
              ) : null}
              <a href="/logout">Log out</a>
            </p>
          </div>
        </div>

        <section>
          <div class="kicker">Your submissions</div>
          <h2>Docks you've added</h2>
          {opts.submissions.length === 0 ? (
            <div class="empty">
              You haven't submitted anything yet. <a href="/submit">Add a dock, pier or marina</a> to get started.
            </div>
          ) : (
            <div class="submission-list">
              {opts.submissions.map((s) => (
                <div class="submission-row">
                  <div>
                    <div class="name">{s.name}</div>
                    <div class="place">{s.settlement}, {s.country}</div>
                  </div>
                  <span class={`status ${s.published ? "published" : "pending"}`}>
                    {s.published ? "Published" : "Pending review"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div class="kicker">Favorites</div>
          <h2>Marinas you've saved</h2>
          {opts.favorites.length === 0 ? (
            <div class="empty">
              No favorites yet. Tap "Save" on any dock page to keep it here.
            </div>
          ) : (
            <div class="favorite-list">
              {opts.favorites.map((d) => (
                <a class="favorite-row" href={`/docks/${d.slug}`}>
                  <div>
                    <div class="name">{d.name}</div>
                    <div class="place">{d.settlement}, {d.country}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        <section>
          <div class="kicker">Rating history</div>
          <h2>Photos you've rated</h2>
          {opts.ratingHistory.length === 0 ? (
            <div class="empty">You haven't rated any photos yet.</div>
          ) : (
            <div class="rating-history-list">
              {opts.ratingHistory.map((r) => (
                <a class="rating-history-row" href={`/docks/${r.dock_slug}`}>
                  <img src={r.image_url} alt={r.caption} />
                  <div class="caption">{r.caption || r.dock_slug}</div>
                  <span class="your-rating">Your rating: {r.rating}/10</span>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
