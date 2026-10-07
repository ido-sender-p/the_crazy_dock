import { Layout } from "../layout";
import type { User, Submission } from "../lib/db";
import type { Dock } from "../data";
import type { RatingHistoryEntry } from "../lib/gallery";
import { initials, placeLabel } from "./shared";

export function ProfilePage(opts: {
  user: User;
  submissions: Submission[];
  favorites: Dock[];
  ratingHistory: RatingHistoryEntry[];
  path: string;
}) {
  return (
    <Layout page="profile" title={`${opts.user.username} | Wildock`} description="Your Wildock profile." path={opts.path} noindex>
      <div class="wrap profile-page">
        <div class="profile-head">
          {opts.user.avatar_url ? (
            <img class="profile-avatar" src={opts.user.avatar_url} alt="" />
          ) : (
            <div class="profile-avatar">{initials(opts.user.username)}</div>
          )}
          <div>
            <h1>{opts.user.username}</h1>
            <div class="links">
              {opts.user.email} ·{" "}
              <a href="/profile/edit">Edit profile</a> ·{" "}
              <a href="/messages">Messages</a> ·{" "}
              {opts.user.is_admin ? (
                <>
                  <a href="/admin/submissions">Review submissions</a> ·{" "}
                </>
              ) : null}
              <form class="logout-form" method="post" action="/logout">
                <button class="logout-btn" type="submit">Log out</button>
              </form>
            </div>
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
                    <div class="place">{placeLabel(s.settlement, s.country)}</div>
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
                    <div class="place">{placeLabel(d.settlement, d.country)}</div>
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
                  <img src={r.image_url} alt="" width={48} height={48} loading="lazy" decoding="async" />
                  <div class="caption">{r.title || r.dock_slug}</div>
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
