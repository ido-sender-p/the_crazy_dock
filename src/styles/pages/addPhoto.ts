// Styles for the addPhoto page only. Served as /assets/page-addPhoto.<hash>.css and linked by Layout (page="addPhoto").
export const addPhotoCss = `
  .add-photo-page { padding-block: 56px 100px; max-width: calc(560px + 2 * var(--gutter)); }

  .add-photo-page p.intro { color: var(--ink-soft); margin-bottom: 28px; }
  .add-photo-page form { display: flex; flex-direction: column; gap: 16px; }
  .add-photo-page label { font-size: 0.85rem; font-weight: 600; color: var(--ink); display: block; margin-bottom: 6px; }
  .add-photo-page input, .add-photo-page textarea {
    width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: var(--radius-md);
    font-size: 0.95rem; font-family: inherit; color: var(--ink);
  }
  .add-photo-page textarea { resize: vertical; min-height: 70px; }
  .add-photo-page .hint { font-size: 0.78rem; color: var(--ink-soft); margin-top: 6px; }

  .add-photo-page label.photo-dropzone {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
    border: 1.5px dashed var(--border); border-radius: var(--radius-xl); padding: 32px 16px;
    cursor: pointer; text-align: center; color: var(--ink-soft); font-size: 0.9rem;
    transition: border-color var(--ease), background var(--ease);
  }
  .photo-dropzone:hover, .photo-dropzone.drag { border-color: var(--accent); background: rgba(var(--gold-rgb), 0.08); }
  .photo-dropzone svg { width: 30px; height: 30px; color: var(--accent-text); }
  .photo-dropzone .filename { font-weight: 600; color: var(--ink); }

  .add-photo-page button.btn-cta { margin-top: 6px; align-self: flex-start; }
  .add-photo-page .success { padding: 18px 20px; border-radius: var(--radius-lg); font-size: 0.95rem; }
  .add-photo-page form .error { margin-bottom: 0; }
`;
