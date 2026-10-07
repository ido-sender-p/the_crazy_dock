// Styles for the editProfile page only. Served as /assets/page-editProfile.<hash>.css and linked by Layout (page="editProfile").
export const editProfileCss = `
  .edit-profile-page { padding: 56px 0 100px; max-width: 480px; }

  .edit-profile-page p.intro { color: var(--ink-soft); margin-bottom: 28px; }
  .edit-profile-page form { display: flex; flex-direction: column; gap: 20px; }
  .edit-profile-page label { font-size: 0.85rem; font-weight: 600; color: var(--ink); display: block; margin-bottom: 6px; }
  .edit-profile-page input[type="text"],
  .edit-profile-page input[type="email"],
  .edit-profile-page input[type="date"],
  .edit-profile-page input[type="password"] {
    width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: var(--radius-md);
    font-size: 0.95rem; font-family: inherit; color: var(--ink);
  }
  .edit-profile-page button.btn-cta { align-self: flex-start; }

  .avatar-row { display: flex; align-items: center; gap: 16px; }
  .avatar-preview {
    width: 64px; height: 64px; border-radius: 50%; object-fit: cover; flex: none;
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  }
  .avatar-preview.placeholder {
    display: flex; align-items: center; justify-content: center;
    color: var(--on-accent); font-family: var(--font-serif-bare); font-weight: 600; font-size: 1.3rem;
  }
  .avatar-picker {
    display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px;
    border: 1px solid var(--border); border-radius: var(--radius-pill); cursor: pointer;
    font-size: 0.85rem; font-weight: 600; color: var(--ink); background: var(--surface);
    transition: border-color var(--ease);
  }
  .avatar-picker:hover { border-color: var(--accent); }

  .section-divider { border: none; border-top: 1px solid var(--border); margin: 4px 0; }
  .section-title { font-size: 1.05rem; margin: 0; }
  .section-hint { color: var(--ink-soft); font-size: 0.85rem; margin: -12px 0 0; }
`;
