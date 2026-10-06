import { Hono, type Context } from "hono";
import type { Env } from "../env";
import { slugify } from "../data";
import { AdminPage } from "../pages/admin";
import { checkSubmissionRoute } from "../lib/geo";
import {
  findSubmissionsByStatus,
  findSubmissionById,
  approveSubmission,
  blockSubmission,
  rejectSubmission,
  slugExists,
} from "../lib/db";
import { currentUser, requireUser } from "../lib/session";
import { isUniqueViolation } from "../lib/validation";
import { staticBySlug, staticInSettlement } from "../lib/staticDocks";
import { findPendingPhotos, approveDockPhoto, rejectDockPhoto } from "../lib/gallery";
import { smallBody } from "../middleware/limits";

export const admin = new Hono<Env>();

admin.get("/admin/submissions", async (c) => {
  const user = await requireUser(c);
  if (user instanceof Response) return user;
  if (!user.is_admin) return c.notFound();

  const [pending, blocked, pendingPhotos] = await Promise.all([
    findSubmissionsByStatus(c.env.DB, ["pending"]),
    findSubmissionsByStatus(c.env.DB, ["blocked"]),
    findPendingPhotos(c.env.DB),
  ]);
  return c.html(<AdminPage pending={pending} blocked={blocked} pendingPhotos={pendingPhotos} path="/admin/submissions" />);
});

// Not-an-admin looks like a missing page. Otherwise a numeric id or a 400.
async function adminAction(c: Context<Env>): Promise<{ id: number } | Response> {
  const user = await currentUser(c);
  if (!user || !user.is_admin) return c.notFound();
  const raw = c.req.param("id") ?? "";
  const id = /^\d{1,12}$/.test(raw) ? Number(raw) : NaN;
  if (!Number.isInteger(id) || id < 1) return c.text("Invalid id.", 400);
  return { id };
}

async function uniqueDockSlug(db: D1Database, base: string) {
  let slug = base;
  let attempt = 1;
  while (staticBySlug.has(slug) || (await slugExists(db, slug))) {
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
  return slug;
}

admin.post("/admin/submissions/:id/approve", smallBody, async (c) => {
  const action = await adminAction(c);
  if (action instanceof Response) return action;
  const { id } = action;

  const submission = await findSubmissionById(c.env.DB, id);
  if (!submission) return c.notFound();

  const routeCheck = checkSubmissionRoute(submission.country, submission.settlement);
  if (!routeCheck.ok) {
    if (!(await blockSubmission(c.env.DB, id, routeCheck.reason))) return c.notFound();
    return c.redirect("/admin/submissions", 303);
  }

  const settlementSlug = slugify(routeCheck.settlement);
  // Match the type already used by the static catalogue for this place, else
  // it's a city (the browse hierarchy submissions must belong to is cities).
  const settlementType = staticInSettlement(settlementSlug)[0]?.settlementType ?? "city";
  const base = slugify(`${submission.name}-${routeCheck.settlement}`) || `dock-${id}`;

  let approved = false;
  for (let tries = 0; tries < 3 && !approved; tries++) {
    const slug = await uniqueDockSlug(c.env.DB, tries === 0 ? base : `${base}-${crypto.randomUUID().slice(0, 4)}`);
    try {
      approved = await approveSubmission(c.env.DB, id, {
        slug,
        continent: routeCheck.continent,
        continentSlug: routeCheck.continentSlug,
        country: routeCheck.country,
        stateProvinceSlug: slugify(submission.state_province || ""),
        settlement: routeCheck.settlement,
        settlementSlug,
        settlementType,
      });
      if (!approved) return c.notFound(); // already decided or gone
    } catch (err) {
      if (!isUniqueViolation(err)) throw err; // slug raced with another approval, retry
    }
  }
  if (!approved) return c.text("Could not allocate a unique slug, try again.", 409);
  return c.redirect("/admin/submissions", 303);
});

admin.post("/admin/submissions/:id/reject", smallBody, async (c) => {
  const action = await adminAction(c);
  if (action instanceof Response) return action;

  if (!(await rejectSubmission(c.env.DB, action.id))) return c.notFound();
  return c.redirect("/admin/submissions", 303);
});

admin.post("/admin/photos/:id/approve", smallBody, async (c) => {
  const action = await adminAction(c);
  if (action instanceof Response) return action;

  if (!(await approveDockPhoto(c.env.DB, action.id))) return c.notFound();
  return c.redirect("/admin/submissions", 303);
});

admin.post("/admin/photos/:id/reject", smallBody, async (c) => {
  const action = await adminAction(c);
  if (action instanceof Response) return action;

  if (!(await rejectDockPhoto(c.env.DB, action.id))) return c.notFound();
  return c.redirect("/admin/submissions", 303);
});
