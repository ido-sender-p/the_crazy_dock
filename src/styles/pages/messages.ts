// Styles for the messages page only. Served as /assets/page-messages.<hash>.css and linked by Layout (page="messages").
export const messagesCss = `
  .messages-page { padding-block: 56px 100px; max-width: calc(680px + 2 * var(--gutter)); }

  .messages-tabs { display: flex; gap: 18px; margin: 18px 0 28px; border-bottom: 1px solid var(--border); }
  .messages-tabs a {
    text-decoration: none; color: var(--ink-soft); font-size: 0.9rem; font-weight: 600;
    padding-bottom: 10px; border-bottom: 2px solid transparent;
  }
  .messages-tabs a.active { color: var(--ink); border-bottom-color: var(--accent); }
  .message-list { display: flex; flex-direction: column; gap: 10px; }
  .message-row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
    padding: 14px 18px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface);
    text-decoration: none; color: inherit;
  }
  .message-row.unread { border-color: var(--accent); background: #f2fbfa; }
  .message-row .who { font-weight: 600; font-size: 0.9rem; }
  .message-row .subject { color: var(--ink-soft); font-size: 0.85rem; }
  .message-row .when { color: var(--ink-soft); font-size: 0.78rem; white-space: nowrap; }
  .unread-badge {
    display: inline-block; margin-left: 8px; padding: 1px 8px; border-radius: var(--radius-pill); vertical-align: middle;
    background: var(--ink); color: var(--white); font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
  }

  .compose-form { display: flex; flex-direction: column; gap: 16px; max-width: 520px; }
  .compose-form label { font-size: 0.85rem; font-weight: 600; color: var(--ink); display: block; margin-bottom: 6px; }
  .compose-form input, .compose-form textarea {
    width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: var(--radius-md);
    font-size: 0.95rem; font-family: inherit; color: var(--ink);
  }
  .compose-form textarea { resize: vertical; min-height: 140px; }
  .compose-form button { border: none; cursor: pointer; align-self: flex-start; }

  .message-detail { border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 24px; background: var(--surface); }
  .message-detail .meta { color: var(--ink-soft); font-size: 0.85rem; margin-bottom: 18px; }
  .message-detail .subject { font-size: 1.2rem; font-weight: 600; margin-bottom: 4px; }
  .message-detail .body { white-space: pre-wrap; font-size: 0.95rem; }
  .message-detail .reply { display: inline-block; margin-top: 20px; }
`;
