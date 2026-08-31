import { Layout } from "../layout";
import { raw } from "hono/html";
import type { ReviewSubmission } from "../lib/db";
import type { PendingDockPhoto } from "../lib/gallery";

const PAGE_CSS = `
  .admin-page { padding: 56px 0 100px; max-width: 760px; }
  .admin-page h1 { font-size: 1.9rem; }
  .admin-page p.intro { color: var(--ink-soft); margin-bottom: 32px; }

  .admin-page .kicker {
    color: var(--accent-dark); font-weight: 600; font-size: 0.8rem; text-transform: uppercase;
    letter-spacing: 0.06em; margin-top: 40px;
  }
  .admin-page .kicker:first-of-type { margin-top: 0; }
  .admin-page h2 { font-size: 1.2rem; margin: 4px 0 16px; }

  .review-card {
    display: grid; grid-template-columns: 140px 1fr; gap: 18px;
    border: 1px solid var(--border); border-radius: 14px; padding: 18px; background: var(--surface);
    margin-bottom: 14px;
  }
  .review-card img { width: 140px; height: 100px; object-fit: cover; border-radius: 10px; display: block; }
  .review-card .no-photo {
    width: 140px; height: 100px; border-radius: 10px; background: var(--bg);
    border: 1px dashed var(--border); display: flex; align-items: center; justify-content: center;
    color: var(--ink-soft); font-size: 0.78rem; text-align: center; padding: 8px;
  }
  @media (max-width: 480px) {
    .review-card { grid-template-columns: 1fr; }
    .review-card img, .review-card .no-photo { width: 100%; height: 180px; }
  }
  .review-card .name { font-weight: 600; font-size: 1.05rem; margin: 0 0 2px; }
  .review-card .place { color: var(--ink-soft); font-size: 0.85rem; margin: 0 0 8px; }
  .review-card .desc { font-size: 0.85rem; color: var(--ink); margin: 0 0 10px; line-height: 1.5; }
  .review-card .meta { font-size: 0.78rem; color: var(--ink-soft); margin: 0 0 12px; }
  .review-card .block-reason {
    font-size: 0.82rem; color: #9c6b1f; background: #fdf3e2; border: 1px solid #f0d9a8;
    border-radius: 8px; padding: 8px 12px; margin: 0 0 12px;
  }
  .review-card .actions { display: flex; gap: 10px; }
  .review-card form { display: inline; }
  .review-card button {
    border: none; cursor: pointer; border-radius: 999px; padding: 8px 18px; font-size: 0.82rem; font-weight: 600;
  }
  .btn-approve { background: linear-gradient(135deg, var(--accent), var(--accent-dark)); color: #fff; }
  .btn-reject { background: #fdecea; color: #9c2c1f; }

  .admin-page .empty { padding: 20px; border: 1px dashed var(--border); border-radius: 12px; color: var(--ink-soft); font-size: 0.9rem; }
`;

function ReviewCard({ s, blocked }: { s: ReviewSubmission; blocked?: boolean }) {
  return (
    <div class="review-card">
      {s.image_url ? <img src={s.image_url} alt={s.name} /> : <div class="no-photo">No photo yet</div>}
      <div>
        <p class="name">{s.name}</p>
        <p class="place">{s.settlement}, {s.country} · {s.dock_type}</p>
        <p class="desc">
          {s.description ? `${s.description.slice(0, 160)}${s.description.length > 160 ? "…" : ""}` : "No description yet."}
        </p>
        <p class="meta">Submitted by {s.submitted_by_username}</p>
        {blocked && s.block_reason && <p class="block-reason">Waiting for path creation: {s.block_reason}</p>}
        <div class="actions">
          <form method="post" action={`/admin/submissions/${s.id}/approve`}>
            <button class="btn-approve" type="submit">Approve</button>
          </form>
          <form method="post" action={`/admin/submissions/${s.id}/reject`}>
            <button class="btn-reject" type="submit">Reject</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PhotoReviewCard({ p }: { p: PendingDockPhoto }) {
  return (
    <div class="review-card">
      <img src={p.image_url} alt={p.title} />
      <div>
        <p class="name">{p.title}</p>
        <p class="place">{p.caption}</p>
        <p class="place">For dock: {p.dock_slug}</p>
        <p class="meta">Submitted by {p.submitted_by_username}</p>
        <div class="actions">
          <form method="post" action={`/admin/photos/${p.id}/approve`}>
            <button class="btn-approve" type="submit">Approve</button>
          </form>
          <form method="post" action={`/admin/photos/${p.id}/reject`}>
            <button class="btn-reject" type="submit">Reject</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AdminPage(opts: {
  pending: ReviewSubmission[];
  blocked: ReviewSubmission[];
  pendingPhotos: PendingDockPhoto[];
  path: string;
}) {
  return (
    <Layout title="Review submissions | Wildock" description="Review pending Wildock submissions." path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap admin-page">
        <h1>Review submissions</h1>
        <p class="intro">Approve publishes a submission immediately at its route. Blocked ones are waiting on a missing country/city in the browse hierarchy.</p>

        <div class="kicker">Pending review</div>
        <h2>{opts.pending.length} waiting</h2>
        {opts.pending.length === 0 ? (
          <div class="empty">Nothing pending.</div>
        ) : (
          opts.pending.map((s) => <ReviewCard s={s} />)
        )}

        <div class="kicker">Blocked, waiting for path creation</div>
        <h2>{opts.blocked.length} blocked</h2>
        {opts.blocked.length === 0 ? (
          <div class="empty">Nothing blocked.</div>
        ) : (
          opts.blocked.map((s) => <ReviewCard s={s} blocked />)
        )}

        <div class="kicker">Photo submissions</div>
        <h2>{opts.pendingPhotos.length} waiting</h2>
        {opts.pendingPhotos.length === 0 ? (
          <div class="empty">Nothing pending.</div>
        ) : (
          opts.pendingPhotos.map((p) => <PhotoReviewCard p={p} />)
        )}
      </div>
    </Layout>
  );
}
