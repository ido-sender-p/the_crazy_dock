import { Hono } from "hono";
import type { Env } from "../env";
import { InboxPage, SentPage, ComposePage, MessageViewPage } from "../pages/messages";
import { requireUser } from "../lib/session";
import { findUserByUsername } from "../lib/db";
import { parseId } from "../lib/validation";
import { sendMessage,
  findInbox,
  findSent,
  findMessageById,
  markMessageRead,
  countRecentMessages,
  MAX_MESSAGES_PER_HOUR, } from "../lib/messages";
import { smallBody } from "../middleware/limits";

export const messages = new Hono<Env>();

messages.get("/messages", async (c) => {
  const user = await requireUser(c);
  if (user instanceof Response) return user;
  const inbox = await findInbox(c.env.DB, user.id);
  return c.html(<InboxPage messages={inbox} path="/messages" />);
});

messages.get("/messages/sent", async (c) => {
  const user = await requireUser(c);
  if (user instanceof Response) return user;
  const sent = await findSent(c.env.DB, user.id);
  return c.html(<SentPage messages={sent} path="/messages/sent" />);
});

messages.get("/messages/compose", async (c) => {
  const user = await requireUser(c);
  if (user instanceof Response) return user;
  const to = (c.req.query("to") ?? "").slice(0, 30);
  const subject = (c.req.query("subject") ?? "").slice(0, 140);
  return c.html(<ComposePage to={to} subject={subject} body="" path="/messages/compose" />);
});

messages.post("/messages/compose", smallBody, async (c) => {
  const user = await requireUser(c, "/messages/compose");
  if (user instanceof Response) return user;

  const form = await c.req.formData();
  const to = String(form.get("to") ?? "").trim().slice(0, 30);
  const subject = String(form.get("subject") ?? "").trim().slice(0, 140);
  const body = String(form.get("body") ?? "").trim().slice(0, 4000);
  const rejectWith = (error: string) => c.html(<ComposePage to={to} subject={subject} body={body} error={error} path="/messages/compose" />, 400);

  if (!subject || !body) return rejectWith("Please fill in a subject and message.");

  const recipient = await findUserByUsername(c.env.DB, to);
  if (!recipient) return rejectWith("No user found with that username.");
  if (recipient.id === user.id) return rejectWith("You can't send a message to yourself.");

  if ((await countRecentMessages(c.env.DB, user.id)) >= MAX_MESSAGES_PER_HOUR) {
    return rejectWith("You're sending messages too quickly. Please try again later.");
  }

  await sendMessage(c.env.DB, user.id, recipient.id, subject, body);
  return c.redirect("/messages/sent", 303);
});

messages.get("/messages/:id", async (c) => {
  const user = await requireUser(c);
  if (user instanceof Response) return user;

  const id = parseId(c.req.param("id"));
  if (id === null) return c.notFound();

  const message = await findMessageById(c.env.DB, id);
  if (!message) return c.notFound();

  const isSender = message.sender_id === user.id;
  const isRecipient = message.recipient_id === user.id;
  if (!isSender && !isRecipient) return c.notFound();

  if (isRecipient && !message.read_at) {
    await markMessageRead(c.env.DB, id, user.id);
    message.read_at = new Date().toISOString();
  }

  return c.html(<MessageViewPage message={message} isSender={isSender} path={`/messages/${id}`} />);
});
