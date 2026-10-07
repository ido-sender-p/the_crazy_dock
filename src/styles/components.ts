// Shared UI components: breadcrumb, buttons, notices, photo picker, profile header, card list.
export const componentsCss = `
  .breadcrumb { font-size: 0.85em; color: var(--ink-soft); margin-bottom: 16px; }
  .breadcrumb a { text-decoration: none; color: var(--accent-text); }

  .btn-cta {
    display: inline-block;
    background: var(--ink);
    color: var(--white);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 12px 22px;
    border-radius: var(--radius-pill);
    transition: transform var(--ease), box-shadow var(--ease);
  }
  .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(var(--navy-rgb), 0.3); }

  /* Shared across pages */
  .kicker {
    color: var(--accent-text); font-weight: 500; font-size: 0.72rem; text-transform: uppercase;
    letter-spacing: 0.2em;
  }
  .empty {
    padding: 24px; border: 1px dashed var(--border); border-radius: var(--radius-lg); color: var(--ink-soft); font-size: 0.9rem;
  }
  .error {
    background: var(--danger-bg); border: 1px solid var(--danger-border); color: var(--danger-text);
    padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.88rem; margin-bottom: 16px;
  }
  .success {
    background: var(--success-bg); border: 1px solid var(--success-border); color: var(--success-text);
    padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.88rem; margin-bottom: 16px;
  }
  .back-link { display: inline-block; margin-top: 18px; font-size: 0.85rem; color: var(--ink-soft); text-decoration: none; }
  .back-link:hover { color: var(--accent-text); }
  .photo-input {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }
  .photo-input:focus-visible + label { outline: 2px solid var(--accent-dark); outline-offset: 2px; }
  .profile-head { display: flex; align-items: center; gap: 18px; margin-bottom: 20px; }
  .profile-avatar {
    width: 64px; height: 64px; border-radius: 50%; flex: none; object-fit: cover;
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    color: var(--on-accent); display: flex; align-items: center; justify-content: center;
    font-family: var(--font-serif-bare); font-weight: 600; font-size: 1.5rem;
  }
  .list { display: grid; gap: 16px; margin-top: 28px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
  .list a {
    display: block; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
    overflow: hidden; text-decoration: none; color: var(--ink);
  }
  .list img, .list .thumb-ph { width: 100%; height: 140px; object-fit: cover; display: block; }
  .list .thumb-ph { background: var(--border); }
  .list .copy { padding: 14px; }
  .list h3 { font-size: 1rem; margin: 0 0 4px; }
  .list p { margin: 0; font-size: 0.85rem; color: var(--ink-soft); }

  /* notice box: neutral heads-up inside a page */
  .notice {
    background: var(--notice-bg); border: 1px solid var(--notice-border); color: var(--notice-text);
    padding: 14px 18px; border-radius: var(--radius-md); font-size: 0.88rem;
  }

  /* "Log out" is a POST form that looks like a link */
  .logout-form { display: inline; }
  .logout-btn { border: none; background: none; padding: 0; font: inherit; color: var(--accent-text); cursor: pointer; }

  /* a submit <button> styled as .btn-cta: drop the native border, keep the pointer */
  button.btn-cta { border: none; cursor: pointer; }
`;
