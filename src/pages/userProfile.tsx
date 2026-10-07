import { Layout } from "../layout";
import type { PublicSubmission } from "../lib/db";
import type { Dock } from "../data";
import { initials, placeLabel } from "./shared";

export function UserProfilePage(opts: {
  username: string;
  avatarUrl: string | null;
  submissions: PublicSubmission[];
  favorites: Dock[];
  canMessage: boolean;
  path: string;
}) {
  return (
    <Layout page="userProfile" title={`${opts.username} | Wildock`} description={`${opts.username}'s Wildock profile.`} path={opts.path}>
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
              <a class="btn-cta message-btn" href={`/messages/compose?to=${encodeURIComponent(opts.username)}`}>
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
