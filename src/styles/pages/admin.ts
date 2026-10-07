// Styles for the admin page only. Served as /assets/page-admin.<hash>.css and linked by Layout (page="admin").
export const adminCss = `
  .admin-page { padding: 56px 0 100px; max-width: 760px; }

  .admin-page p.intro { color: var(--ink-soft); margin-bottom: 32px; }

  .admin-page .kicker { margin-top: 40px; }
  .admin-page .kicker:first-of-type { margin-top: 0; }
  .admin-page h2 { font-size: 1.2rem; margin: 4px 0 16px; }

  .review-card {
    display: grid; grid-template-columns: 140px 1fr; gap: 18px;
    border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 18px; background: var(--surface);
    margin-bottom: 14px;
  }
  .review-card img { width: 140px; height: 100px; object-fit: cover; border-radius: var(--radius-md); display: block; }
  .review-card .no-photo {
    width: 140px; height: 100px; border-radius: var(--radius-md); background: var(--bg);
    border: 1px dashed var(--border); display: flex; align-items: center; justify-content: center;
    color: var(--ink-soft); font-size: 0.78rem; text-align: center; padding: 8px;
  }
  @media (max-width: 480px) {
    .review-card { grid-template-columns: 1fr; }
    .review-card img, .review-card .no-photo { width: 100%; height: 180px; }
  }
  .review-card .name { font-weight: 600; font-size: 1.05rem; margin: 0 0 2px; }
  .review-card .place { color: var(--ink-soft); font-size: 0.85rem; margin: 0 0 8px; }
  .review-card .desc { font-size: 0.85rem; color: var(--ink); margin: 0 0 10px; line-height: 1.5; }
  .review-card .meta { font-size: 0.78rem; color: var(--ink-soft); margin: 0 0 12px; }
  .review-card .block-reason {
    font-size: 0.82rem; color: #9c6b1f; background: #fdf3e2; border: 1px solid #f0d9a8;
    border-radius: var(--radius-sm); padding: 8px 12px; margin: 0 0 12px;
  }
  .review-card .actions { display: flex; gap: 10px; }
  .review-card form { display: inline; }
  .review-card button {
    border: none; cursor: pointer; border-radius: var(--radius-pill); padding: 8px 18px; font-size: 0.82rem; font-weight: 600;
  }
  .btn-approve { background: var(--ink); color: var(--white); }
  .btn-reject { background: #fdecea; color: #9c2c1f; }

  .admin-page .empty { padding: 20px; }
`;
