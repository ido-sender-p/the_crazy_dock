import { Layout } from "../layout";
import type { ReviewSubmission } from "../lib/db";
import type { PendingDockPhoto } from "../lib/gallery";

function ReviewCard({ s, blocked }: { s: ReviewSubmission; blocked?: boolean }) {
  return (
    <div class="review-card">
      {s.image_url ? <img src={s.image_url} alt="" width={140} height={100} loading="lazy" decoding="async" /> : <div class="no-photo">No photo yet</div>}
      <div>
        <p class="name">{s.name}</p>
        <p class="place">{s.settlement}, {s.country} · {s.dock_type.replaceAll("_", " ")}</p>
        <p class="meta">Submitted by {s.submitted_by_username}</p>
        {blocked && s.block_reason && <p class="block-reason">Waiting for path creation: {s.block_reason}</p>}
        <div class="actions">
          <form method="post" action={`/admin/submissions/${s.id}/approve`}>
            <button class="btn-approve" type="submit" aria-label={`Approve ${s.name}`}>Approve</button>
          </form>
          <form method="post" action={`/admin/submissions/${s.id}/reject`}>
            <button class="btn-reject" type="submit" aria-label={`Reject ${s.name}`}>Reject</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PhotoReviewCard({ p }: { p: PendingDockPhoto }) {
  return (
    <div class="review-card">
      <img src={p.image_url} alt={p.title} width={140} height={100} loading="lazy" decoding="async" />
      <div>
        <p class="name">{p.title}</p>
        <p class="place">{p.caption}</p>
        <p class="place">For dock: {p.dock_slug}</p>
        <p class="meta">Submitted by {p.submitted_by_username}</p>
        <div class="actions">
          <form method="post" action={`/admin/photos/${p.id}/approve`}>
            <button class="btn-approve" type="submit" aria-label={`Approve photo ${p.title}`}>Approve</button>
          </form>
          <form method="post" action={`/admin/photos/${p.id}/reject`}>
            <button class="btn-reject" type="submit" aria-label={`Reject photo ${p.title}`}>Reject</button>
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
    <Layout page="admin" title="Review submissions | Wildock" description="Review pending Wildock submissions." path={opts.path} noindex>
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
