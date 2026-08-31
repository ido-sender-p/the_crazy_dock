import { Hono } from "hono";
import type { Env } from "../env";
import { InboxPage, SentPage, ComposePage, MessageViewPage } from "../pages/messages";
import { currentUser, safeNextPath } from "../lib/session";
import { findUserByUsername } from "../lib/db";
import { sendMessage, findInbox, findSent, findMessageById, markMessageRead } from "../lib/messages";

export const messages = new Hono<Env>();

messages.get("/messages", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.redirect("/login?next=/messages");
  const inbox = await findInbox(c.env.DB, user.id);
  return c.html(<InboxPage messages={inbox} path="/messages" />);
});

messages.get("/messages/sent", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.redirect("/login?next=/messages/sent");
  const sent = await findSent(c.env.DB, user.id);
  return c.html(<SentPage messages={sent} path="/messages/sent" />);
});

messages.get("/messages/compose", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.redirect(`/login?next=${encodeURIComponent(safeNextPath(c.req.path))}`);
  const to = c.req.query("to") ?? "";
  const subject = c.req.query("subject") ?? "";
  return c.html(<ComposePage to={to} subject={subject} body="" path="/messages/compose" />);
});

messages.post("/messages/compose", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.redirect("/login?next=/messages/compose");

  const form = await c.req.formData();
  const to = String(form.get("to") ?? "").trim();
  const subject = String(form.get("subject") ?? "").trim().slice(0, 140);
  const body = String(form.get("body") ?? "").trim().slice(0, 4000);
  const rejectWith = (error: string) => c.html(<ComposePage to={to} subject={subject} body={body} error={error} path="/messages/compose" />, 400);

  if (!subject || !body) return rejectWith("Please fill in a subject and message.");

  const recipient = await findUserByUsername(c.env.DB, to);
  if (!recipient) return rejectWith(`No user found with the username "${to}".`);
  if (recipient.id === user.id) return rejectWith("You can't send a message to yourself.");

  await sendMessage(c.env.DB, user.id, recipient.id, subject, body);
  return c.redirect("/messages/sent");
});

messages.get("/messages/:id", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.redirect(`/login?next=${encodeURIComponent(safeNextPath(c.req.path))}`);

  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.notFound();

  const message = await findMessageById(c.env.DB, id);
  if (!message) return c.notFound();

  const isSender = message.sender_id === user.id;
  const isRecipient = message.recipient_id === user.id;
  if (!isSender && !isRecipient) return c.notFound();

  if (isRecipient && !message.read_at) {
    await markMessageRead(c.env.DB, id);
    message.read_at = new Date().toISOString();
  }

  return c.html(<MessageViewPage message={message} isSender={isSender} path={`/messages/${id}`} />);
});
