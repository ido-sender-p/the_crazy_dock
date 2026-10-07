// Styles for the profile page only. Served as /assets/page-profile.<hash>.css and linked by Layout (page="profile").
export const profileCss = `
  .profile-page { padding: 56px 0 100px; max-width: 640px; }
  .profile-page .profile-head { margin-bottom: 36px; }
  .profile-head .logout-form { display: inline; }
  .profile-head .logout-btn {
    border: none; background: none; padding: 0; font: inherit; color: var(--accent-text); cursor: pointer;
  }
  .profile-head h1 { margin: 0 0 4px; }
  .profile-head .links { margin: 0; color: var(--ink-soft); font-size: 0.9rem; }
  .profile-head .links a { color: var(--accent-text); text-decoration: none; }

  .profile-page .kicker { margin-top: 8px; }
  .profile-page section { margin-top: 40px; }
  .profile-page h2 { font-size: 1.3rem; margin: 4px 0 18px; }

  .favorite-list { display: flex; flex-direction: column; gap: 12px; }
  .favorite-row {
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px;
    padding: 14px 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface);
    text-decoration: none; color: inherit;
  }
  .favorite-row .name { font-weight: 600; font-size: 0.95rem; }
  .favorite-row .place { color: var(--ink-soft); font-size: 0.85rem; }

  .rating-history-list { display: flex; flex-direction: column; gap: 10px; }
  .rating-history-row {
    display: flex; align-items: center; gap: 14px;
    padding: 10px 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface);
    text-decoration: none; color: inherit;
  }
  .rating-history-row img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; flex: none; }
  .rating-history-row .caption { font-size: 0.88rem; flex: 1; min-width: 0; }
  .rating-history-row .your-rating {
    font-size: 0.8rem; font-weight: 600; color: var(--accent-text);
    background: var(--surface-alt, #f4f1ea); padding: 4px 10px; border-radius: 999px; white-space: nowrap;
  }

  .submission-list { display: flex; flex-direction: column; gap: 12px; }
  .submission-row {
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px;
    padding: 14px 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface);
  }
  .submission-row .name { font-weight: 600; font-size: 0.95rem; }
  .submission-row .place { color: var(--ink-soft); font-size: 0.85rem; }
  .status {
    font-size: 0.75rem; font-weight: 600; padding: 5px 12px; border-radius: 999px; white-space: nowrap;
  }
  .status.pending { background: #fdf3e2; color: #7a5108; }
  .status.published { background: #eafaf3; color: #146b43; }

`;
