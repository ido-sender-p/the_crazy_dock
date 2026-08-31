// Private user-to-user messages, modeled as email (subject/body/read
// marker, inbox vs sent), not a live chat: no presence, no typing state,
// no realtime delivery.

export type MessageListItem = {
  id: number;
  subject: string;
  body: string;
  read_at: string | null;
  created_at: string;
  other_username: string;
};

export type MessageDetail = MessageListItem & {
  sender_id: number;
  recipient_id: number;
  sender_username: string;
  recipient_username: string;
};

export function sendMessage(db: D1Database, senderId: number, recipientId: number, subject: string, body: string) {
  return db
    .prepare("INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)")
    .bind(senderId, recipientId, subject, body)
    .run();
}

export async function findInbox(db: D1Database, userId: number): Promise<MessageListItem[]> {
  const result = await db
    .prepare(
      `SELECT messages.id, messages.subject, messages.body, messages.read_at, messages.created_at,
              users.username AS other_username
       FROM messages JOIN users ON users.id = messages.sender_id
       WHERE messages.recipient_id = ?
       ORDER BY messages.created_at DESC`,
    )
    .bind(userId)
    .all<MessageListItem>();
  return result.results;
}

export async function findSent(db: D1Database, userId: number): Promise<MessageListItem[]> {
  const result = await db
    .prepare(
      `SELECT messages.id, messages.subject, messages.body, messages.read_at, messages.created_at,
              users.username AS other_username
       FROM messages JOIN users ON users.id = messages.recipient_id
       WHERE messages.sender_id = ?
       ORDER BY messages.created_at DESC`,
    )
    .bind(userId)
    .all<MessageListItem>();
  return result.results;
}

export async function countUnread(db: D1Database, userId: number): Promise<number> {
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM messages WHERE recipient_id = ? AND read_at IS NULL")
    .bind(userId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

// Only the sender or recipient may ever see a message. This is checked by
// the caller (route) against currentUser before rendering the result.
export function findMessageById(db: D1Database, id: number) {
  return db
    .prepare(
      `SELECT messages.id, messages.subject, messages.body, messages.read_at, messages.created_at,
              messages.sender_id, messages.recipient_id,
              sender.username AS sender_username, recipient.username AS recipient_username
       FROM messages
       JOIN users AS sender ON sender.id = messages.sender_id
       JOIN users AS recipient ON recipient.id = messages.recipient_id
       WHERE messages.id = ?`,
    )
    .bind(id)
    .first<MessageDetail>();
}

export function markMessageRead(db: D1Database, id: number) {
  return db.prepare("UPDATE messages SET read_at = datetime('now') WHERE id = ? AND read_at IS NULL").bind(id).run();
}
