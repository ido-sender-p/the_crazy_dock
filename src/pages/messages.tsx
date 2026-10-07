import { Layout } from "../layout";
import type { MessageListItem, MessageDetail } from "../lib/messages";

const TAB_LINKS = [
  { key: "inbox", href: "/messages", label: "Inbox" },
  { key: "sent", href: "/messages/sent", label: "Sent" },
  { key: "compose", href: "/messages/compose", label: "Compose" },
] as const;

function Tabs({ active }: { active: (typeof TAB_LINKS)[number]["key"] }) {
  return (
    <nav class="messages-tabs" aria-label="Messages">
      {TAB_LINKS.map((t) => (
        <a href={t.href} class={active === t.key ? "active" : ""} aria-current={active === t.key ? "page" : undefined}>
          {t.label}
        </a>
      ))}
    </nav>
  );
}

// Timestamps are stored in UTC, so say so rather than imply local time.
function formatDate(iso: string) {
  return `${iso.replace("T", " ").slice(0, 16)} UTC`;
}

export function InboxPage(opts: { messages: MessageListItem[]; path: string }) {
  return (
    <Layout page="messages" title="Inbox | Wildock" description="Your Wildock messages." path={opts.path} noindex>
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
                  <div class="who">
                    {m.other_username}
                    {!m.read_at && <span class="unread-badge">Unread</span>}
                  </div>
                  <div class="subject">{m.subject}</div>
                </div>
                <div class="when">{formatDate(m.created_at)}</div>
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
    <Layout page="messages" title="Sent | Wildock" description="Messages you've sent on Wildock." path={opts.path} noindex>
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
                <div class="when">{formatDate(m.created_at)}</div>
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
    <Layout page="messages" title="New message | Wildock" description="Send a message to another Wildock user." path={opts.path} noindex>
      <div class="wrap messages-page">
        <h1>New message</h1>
        <Tabs active="compose" />
        {opts.error && <div class="error" role="alert">{opts.error}</div>}
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
    <Layout page="messages" title={`${opts.message.subject} | Wildock`} description="A Wildock message." path={opts.path} noindex>
      <div class="wrap messages-page">
        <h1>Message</h1>
        <Tabs active={opts.isSender ? "sent" : "inbox"} />
        <div class="message-detail">
          <div class="subject">{opts.message.subject}</div>
          <div class="meta">
            {opts.isSender ? "To" : "From"} {other} · {formatDate(opts.message.created_at)}
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
