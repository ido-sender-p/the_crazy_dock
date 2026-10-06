import { Layout } from "../layout";
import { raw } from "hono/html";
import type { PublicSubmission } from "../lib/db";
import type { Dock } from "../data";
import { initials, placeLabel } from "./shared";

const PAGE_CSS = `
  .user-profile-page { padding: 56px 0 100px; max-width: 640px; }
  .profile-head h1 { font-size: 1.7rem; margin: 0; }
  .user-profile-page .kicker { margin-top: 8px; }
  .user-profile-page section { margin-top: 36px; }
  .user-profile-page h2 { font-size: 1.2rem; margin: 4px 0 16px; }
  .list-row {
    display: flex; align-items: center; gap: 14px;
    padding: 10px 18px 10px 10px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface);
    text-decoration: none; color: inherit;
  }
  .list-row + .list-row { margin-top: 12px; }
  .list-row .name { font-weight: 600; font-size: 0.95rem; }
  .list-row .place { color: var(--ink-soft); font-size: 0.85rem; }
  .list-row .thumb {
    width: 52px; height: 52px; border-radius: 8px; object-fit: cover; flex: none;
    background: var(--border);
  }
  .user-profile-page .empty { padding: 20px; }
`;

export function UserProfilePage(opts: {
  username: string;
  avatarUrl: string | null;
  submissions: PublicSubmission[];
  favorites: Dock[];
  canMessage: boolean;
  path: string;
}) {
  return (
    <Layout title={`${opts.username} | Wildock`} description={`${opts.username}'s Wildock profile.`} path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap user-profile-page">
        <div class="profile-head">
          {opts.avatarUrl ? (
            <img class="profile-avatar" src={opts.avatarUrl} alt="" />
          ) : (
            <div class="profile-avatar">{initials(opts.username)}</div>
          )}
          <div>
            <h1>{opts.username}</h1>
            {opts.canMessage && (
              <a class="btn-cta" href={`/messages/compose?to=${encodeURIComponent(opts.username)}`} style="margin-top:10px;display:inline-block;">
                Send message
              </a>
            )}
          </div>
        </div>

        <section>
          <div class="kicker">Published</div>
          <h2>Docks they've added</h2>
          {opts.submissions.length === 0 ? (
            <div class="empty">Nothing published yet.</div>
          ) : (
            <div>
              {opts.submissions.map((s) => (
                <a class="list-row" href={`/docks/${s.slug}`}>
                  {s.image_url && <img class="thumb" src={s.image_url} alt="" width={52} height={52} loading="lazy" decoding="async" />}
                  <div>
                    <div class="name">{s.name}</div>
                    <div class="place">{placeLabel(s.settlement, s.country)}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        <section>
          <div class="kicker">Favorites</div>
          <h2>Marinas they've saved</h2>
          {opts.favorites.length === 0 ? (
            <div class="empty">No favorites yet.</div>
          ) : (
            <div>
              {opts.favorites.map((d) => (
                <a class="list-row" href={`/docks/${d.slug}`}>
                  {d.imageUrl && <img class="thumb" src={d.imageUrl} alt="" width={52} height={52} loading="lazy" decoding="async" />}
                  <div>
                    <div class="name">{d.name}</div>
                    <div class="place">{placeLabel(d.settlement, d.country)}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
