import { Layout } from "../layout";
import { raw } from "hono/html";
import type { MessageListItem, MessageDetail } from "../lib/messages";

const PAGE_CSS = `
  .messages-page { padding: 56px 0 100px; max-width: 680px; }
  .messages-page h1 { font-size: 1.7rem; }
  .messages-tabs { display: flex; gap: 18px; margin: 18px 0 28px; border-bottom: 1px solid var(--border); }
  .messages-tabs a {
    text-decoration: none; color: var(--ink-soft); font-size: 0.9rem; font-weight: 600;
    padding-bottom: 10px; border-bottom: 2px solid transparent;
  }
  .messages-tabs a.active { color: var(--ink); border-bottom-color: var(--accent); }
  .message-list { display: flex; flex-direction: column; gap: 10px; }
  .message-row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
    padding: 14px 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface);
    text-decoration: none; color: inherit;
  }
  .message-row.unread { border-color: var(--accent); background: #f2fbfa; }
  .message-row .who { font-weight: 600; font-size: 0.9rem; }
  .message-row .subject { color: var(--ink-soft); font-size: 0.85rem; }
  .message-row .when { color: var(--ink-soft); font-size: 0.78rem; white-space: nowrap; }
  .messages-page .empty { padding: 24px; border: 1px dashed var(--border); border-radius: 12px; color: var(--ink-soft); font-size: 0.9rem; }

  .compose-form { display: flex; flex-direction: column; gap: 16px; max-width: 520px; }
  .compose-form label { font-size: 0.85rem; font-weight: 600; color: var(--ink); display: block; margin-bottom: 6px; }
  .compose-form input, .compose-form textarea {
    width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: 10px;
    font-size: 0.95rem; font-family: inherit; color: var(--ink);
  }
  .compose-form textarea { resize: vertical; min-height: 140px; }
  .compose-form button { border: none; cursor: pointer; align-self: flex-start; }
  .messages-page .error {
    background: #fdecea; border: 1px solid #f3b4ab; color: #9c2c1f;
    padding: 10px 14px; border-radius: 10px; font-size: 0.88rem; margin-bottom: 16px;
  }

  .message-detail { border: 1px solid var(--border); border-radius: 14px; padding: 24px; background: var(--surface); }
  .message-detail .meta { color: var(--ink-soft); font-size: 0.85rem; margin-bottom: 18px; }
  .message-detail .subject { font-size: 1.2rem; font-weight: 600; margin-bottom: 4px; }
  .message-detail .body { white-space: pre-wrap; font-size: 0.95rem; }
  .message-detail .reply { display: inline-block; margin-top: 20px; }
  .back-link { display: inline-block; margin-top: 18px; font-size: 0.85rem; color: var(--ink-soft); text-decoration: none; }
  .back-link:hover { color: var(--accent-dark); }
`;

function Tabs({ active }: { active: "inbox" | "sent" }) {
  return (
    <div class="messages-tabs">
      <a href="/messages" class={active === "inbox" ? "active" : ""}>Inbox</a>
      <a href="/messages/sent" class={active === "sent" ? "active" : ""}>Sent</a>
      <a href="/messages/compose">Compose</a>
    </div>
  );
}

function relativeDate(iso: string) {
  return iso.replace("T", " ").slice(0, 16);
}

export function InboxPage(opts: { messages: MessageListItem[]; path: string }) {
  return (
    <Layout title="Inbox | Wildock" description="Your Wildock messages." path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap messages-page">
        <h1>Messages</h1>
        <Tabs active="inbox" />
        {opts.messages.length === 0 ? (
          <div class="empty">No messages yet.</div>
        ) : (
          <div class="message-list">
            {opts.messages.map((m) => (
              <a class={`message-row${m.read_at ? "" : " unread"}`} href={`/messages/${m.id}`}>
                <div>
                  <div class="who">{m.other_username}</div>
                  <div class="subject">{m.subject}</div>
                </div>
                <div class="when">{relativeDate(m.created_at)}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export function SentPage(opts: { messages: MessageListItem[]; path: string }) {
  return (
    <Layout title="Sent | Wildock" description="Messages you've sent on Wildock." path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap messages-page">
        <h1>Messages</h1>
        <Tabs active="sent" />
        {opts.messages.length === 0 ? (
          <div class="empty">You haven't sent anything yet.</div>
        ) : (
          <div class="message-list">
            {opts.messages.map((m) => (
              <a class="message-row" href={`/messages/${m.id}`}>
                <div>
                  <div class="who">To {m.other_username}</div>
                  <div class="subject">{m.subject}</div>
                </div>
                <div class="when">{relativeDate(m.created_at)}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export function ComposePage(opts: { to: string; subject: string; body: string; error?: string; path: string }) {
  return (
    <Layout title="New message | Wildock" description="Send a message to another Wildock user." path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap messages-page">
        <h1>New message</h1>
        {opts.error && <div class="error">{opts.error}</div>}
        <form class="compose-form" method="post" action="/messages/compose">
          <div>
            <label for="to">To (username)</label>
            <input id="to" name="to" type="text" value={opts.to} required />
          </div>
          <div>
            <label for="subject">Subject</label>
            <input id="subject" name="subject" type="text" value={opts.subject} maxlength={140} required />
          </div>
          <div>
            <label for="body">Message</label>
            <textarea id="body" name="body" maxlength={4000} required>{opts.body}</textarea>
          </div>
          <button class="btn-cta" type="submit">Send</button>
        </form>
      </div>
    </Layout>
  );
}

export function MessageViewPage(opts: { message: MessageDetail; isSender: boolean; path: string }) {
  const other = opts.isSender ? opts.message.recipient_username : opts.message.sender_username;
  return (
    <Layout title={`${opts.message.subject} | Wildock`} description="A Wildock message." path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap messages-page">
        <h1>Message</h1>
        <Tabs active={opts.isSender ? "sent" : "inbox"} />
        <div class="message-detail">
          <div class="subject">{opts.message.subject}</div>
          <div class="meta">
            {opts.isSender ? "To" : "From"} {other} · {relativeDate(opts.message.created_at)}
          </div>
          <div class="body">{opts.message.body}</div>
          <a class="btn-cta reply" href={`/messages/compose?to=${encodeURIComponent(other)}&subject=${encodeURIComponent(`Re: ${opts.message.subject}`)}`}>
            Reply
          </a>
        </div>
        <a class="back-link" href="/messages">← Back to inbox</a>
      </div>
    </Layout>
  );
}
