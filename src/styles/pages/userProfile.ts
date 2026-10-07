// Styles for the userProfile page only. Served as /assets/page-userProfile.<hash>.css and linked by Layout (page="userProfile").
export const userProfileCss = `
  .user-profile-page { padding: 56px 0 100px; max-width: 640px; }
  .profile-head h1 { margin: 0; }
  .user-profile-page .kicker { margin-top: 8px; }
  .user-profile-page section { margin-top: 36px; }
  .user-profile-page h2 { font-size: 1.2rem; margin: 4px 0 16px; }
  .list-row {
    display: flex; align-items: center; gap: 14px;
    padding: 10px 18px 10px 10px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface);
    text-decoration: none; color: inherit;
  }
  .list-row + .list-row { margin-top: 12px; }
  .list-row .name { font-weight: 600; font-size: 0.95rem; }
  .list-row .place { color: var(--ink-soft); font-size: 0.85rem; }
  .list-row .thumb {
    width: 52px; height: 52px; border-radius: 8px; object-fit: cover; flex: none;
    background: var(--border);
  }
  .user-profile-page .empty { padding: 20px; }
  .btn-cta.message-btn { margin-top: 10px; display: inline-block; }
`;
