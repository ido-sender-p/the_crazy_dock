import { Hono } from "hono";
import type { Env } from "../env";
import { type Dock } from "../data";
import { SubmitPage } from "../pages/submit";
import { insertSubmission, countPendingSubmissions, MAX_PENDING_SUBMISSIONS } from "../lib/db";
import { requireUser } from "../lib/session";
import { smallBody } from "../middleware/limits";

export const submissions = new Hono<Env>();

const VALID_DOCK_TYPES: Dock["dockType"][] = ["pier", "marina", "floating_dock", "industrial"];

const FIELD_LIMITS = {
  name: 200,
  country: 200,
  stateProvince: 200,
  settlement: 200,
} as const;

submissions.get("/submit", async (c) => {
  const user = await requireUser(c, "/submit");
  if (user instanceof Response) return user;
  return c.html(<SubmitPage user={user} path="/submit" />);
});

function trimmedField(form: FormData, field: string, maxLength: number) {
  return String(form.get(field) ?? "").trim().slice(0, maxLength);
}

submissions.post("/submit", smallBody, async (c) => {
  const user = await requireUser(c, "/submit");
  if (user instanceof Response) return user;

  const form = await c.req.formData();
  const rejectWith = (error: string) => c.html(<SubmitPage user={user} path="/submit" error={error} />, 400);

  const dockType = String(form.get("dockType") ?? "");
  if (!VALID_DOCK_TYPES.includes(dockType as Dock["dockType"])) return rejectWith("Invalid dock type.");

  const name = trimmedField(form, "name", FIELD_LIMITS.name);
  const country = trimmedField(form, "country", FIELD_LIMITS.country);
  const settlement = trimmedField(form, "settlement", FIELD_LIMITS.settlement);
  if (!name || !country || !settlement) return rejectWith("Please fill in all required fields.");

  if ((await countPendingSubmissions(c.env.DB, user.id)) >= MAX_PENDING_SUBMISSIONS) {
    return rejectWith(`You already have ${MAX_PENDING_SUBMISSIONS} submissions waiting for review. Please wait for those first.`);
  }

  await insertSubmission(c.env.DB, {
    submittedBy: user.id,
    name,
    dockType,
    country,
    stateProvince: trimmedField(form, "stateProvince", FIELD_LIMITS.stateProvince),
    settlement,
  });

  return c.html(<SubmitPage user={user} path="/submit" success />);
});
