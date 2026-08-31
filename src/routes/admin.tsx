import { Hono } from "hono";
import type { Env } from "../env";
import { docks, slugify } from "../data";
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
import { currentUser } from "../lib/session";
import { findPendingPhotos, approveDockPhoto, rejectDockPhoto } from "../lib/gallery";

export const admin = new Hono<Env>();

admin.get("/admin/submissions", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.redirect("/login?next=/admin/submissions");
  if (!user.is_admin) return c.notFound();

  const [pending, blocked, pendingPhotos] = await Promise.all([
    findSubmissionsByStatus(c.env.DB, ["pending"]),
    findSubmissionsByStatus(c.env.DB, ["blocked"]),
    findPendingPhotos(c.env.DB),
  ]);
  return c.html(<AdminPage pending={pending} blocked={blocked} pendingPhotos={pendingPhotos} path="/admin/submissions" />);
});

async function uniqueDockSlug(db: D1Database, base: string) {
  let slug = base;
  let attempt = 1;
  while (docks.some((d) => d.slug === slug) || (await slugExists(db, slug))) {
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
  return slug;
}

admin.post("/admin/submissions/:id/approve", async (c) => {
  const user = await currentUser(c);
  if (!user || !user.is_admin) return c.notFound();

  const id = Number(c.req.param("id"));
  const submission = await findSubmissionById(c.env.DB, id);
  if (!submission) return c.notFound();

  const routeCheck = checkSubmissionRoute(submission.country, submission.settlement);
  if (!routeCheck.ok) {
    await blockSubmission(c.env.DB, id, routeCheck.reason);
    return c.redirect("/admin/submissions");
  }

  const slug = await uniqueDockSlug(c.env.DB, slugify(`${submission.name}-${routeCheck.settlement}`));
  await approveSubmission(c.env.DB, id, {
    slug,
    continent: routeCheck.continent,
    continentSlug: routeCheck.continentSlug,
    country: routeCheck.country,
    stateProvinceSlug: slugify(submission.state_province || ""),
    settlement: routeCheck.settlement,
    settlementSlug: slugify(routeCheck.settlement),
  });
  return c.redirect("/admin/submissions");
});

admin.post("/admin/submissions/:id/reject", async (c) => {
  const user = await currentUser(c);
  if (!user || !user.is_admin) return c.notFound();

  await rejectSubmission(c.env.DB, Number(c.req.param("id")));
  return c.redirect("/admin/submissions");
});

admin.post("/admin/photos/:id/approve", async (c) => {
  const user = await currentUser(c);
  if (!user || !user.is_admin) return c.notFound();

  await approveDockPhoto(c.env.DB, Number(c.req.param("id")));
  return c.redirect("/admin/submissions");
});

admin.post("/admin/photos/:id/reject", async (c) => {
  const user = await currentUser(c);
  if (!user || !user.is_admin) return c.notFound();

  await rejectDockPhoto(c.env.DB, Number(c.req.param("id")));
  return c.redirect("/admin/submissions");
});
