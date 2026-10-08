// Styles for the dock page only. Served as /assets/page-dock.<hash>.css and linked by Layout (page="dock").
export const dockCss = `
  .around { margin-top: 40px; }
  .around h2 { font-size: 1.3rem; margin: 0 0 6px; }
  .around-vibe { color: var(--ink-soft); margin: 0 0 16px; max-width: 44rem; }
  .around-vibe strong { color: var(--ink); }
  .around-tiles { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: 12px; }
  .around-tiles li { border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 16px; background: var(--surface); }
  .around-icon { width: 1.5rem; height: 1.5rem; display: block; margin-bottom: 8px; color: var(--accent-text); }
  .around-tiles .num { display: block; font-family: var(--font-serif-bare); font-weight: 600; font-size: 1.6rem; color: var(--accent-text); line-height: 1.1; }
  .around-tiles .lbl { display: block; margin-top: 4px; font-size: 0.82rem; color: var(--ink-soft); }
  .around-extras { margin: 16px 0 0; padding-inline-start: 1.1rem; font-size: 0.92rem; display: flex; flex-direction: column; gap: 4px; }
  .around-src { margin: 14px 0 0; font-size: 0.75rem; color: var(--ink-soft); }
  .around-src a { color: inherit; text-decoration: underline; }
  .dock-page { padding-block: clamp(2.5rem, 6vw, 4.5rem) clamp(4rem, 9vw, 7rem); max-width: calc(var(--page-max) + 2 * var(--gutter)); }
  /* Landscape photo: full-width hero, breadcrumb and title bottom-left on the photo, actions bottom-right */
  .dock-hero { position: relative; margin: 0; overflow: hidden; background: var(--navy); border-radius: 0 0 1.5rem 1.5rem; }
  .hero-open { display: block; width: 100%; padding: 0; border: 0; background: none; cursor: pointer; }
  /* the photo is the point of the page: shown whole, at its own proportions (very tall ones are fitted to the screen on a navy ground) */
  .hero-img-bleed { display: block; width: 100%; height: auto; max-height: min(88vh, 60rem); object-fit: contain; background: var(--navy); }
  .hero-overlay {
    position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; gap: 0.35rem;
    padding: 1.5rem max(var(--gutter), calc((100% - var(--page-max)) / 2)) clamp(1.1rem, 2.5vw, 1.9rem);
    color: var(--white); pointer-events: none;
  }
  .hero-overlay::before {
    content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: clamp(9rem, 32%, 14rem); pointer-events: none;
    background: linear-gradient(to top, rgba(6, 16, 31, 0.82) 0%, rgba(6, 16, 31, 0.45) 50%, rgba(6, 16, 31, 0) 100%);
  }
  .hero-overlay > * { position: relative; }
  .hero-overlay a, .hero-overlay button, .hero-overlay form { pointer-events: auto; }
  .hero-overlay .breadcrumb { text-align: left; margin: 0; color: rgba(255, 255, 255, 0.82); font-size: 0.85rem; text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5); }
  .hero-overlay .breadcrumb a { color: rgba(255, 255, 255, 0.95); }
  .hero-bottom { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem 1.5rem; flex-wrap: wrap; }
  .hero-titles { min-width: 0; }
  .hero-titles h1 { margin: 0.15rem 0 0.2rem; color: var(--white); font-size: clamp(2rem, 4.6vw, 3.4rem); line-height: 1.1; text-shadow: 0 2px 18px rgba(0, 0, 0, 0.5); }
  .hero-titles .meta { margin: 0; text-align: left; color: rgba(255, 255, 255, 0.85); text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5); }
  .hero-actions-row { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
  .hero-actions-row form { margin: 0; }
  .share-btn, .photos-btn {
    display: inline-flex; align-items: center; gap: 7px; border: 1px solid var(--border); background: var(--surface); color: var(--ink);
    border-radius: var(--radius-pill); padding: 8px 15px; cursor: pointer; font: inherit; font-size: 0.85rem; font-weight: 600; text-decoration: none;
  }
  .share-btn svg, .photos-btn svg { width: 16px; height: 16px; }
  /* one size for all three actions */
  .hero-actions-row .favorite-btn, .hero-actions-row .share-btn, .hero-actions-row .photos-btn { line-height: 1.2; padding: 9px 16px; font-size: 0.85rem; font-family: inherit; }
  .hero-overlay .favorite-btn { background: rgba(14, 30, 50, 0.62); color: var(--white); border-color: rgba(255, 255, 255, 0.28); }
  .hero-overlay .share-btn { background: var(--white); color: var(--navy); border-color: var(--white); }
  .hero-overlay .photos-btn { background: rgba(255, 255, 255, 0.22); color: var(--white); border-color: rgba(255, 255, 255, 0.3); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
  @media (max-width: 640px) {
    .hero-overlay { position: static; padding: 1rem var(--gutter) 1.25rem; }
    .hero-overlay::before { display: none; }
    .hero-overlay .breadcrumb { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: none; }
    .hero-titles h1, .hero-titles .meta, .hero-overlay .breadcrumb { text-shadow: none; }
  }
  .photo-credit-row .photo-credit { margin: 8px 0 0; font-size: 0.75rem; color: var(--ink-soft); text-align: left; }
  .photo-credit-row .photo-credit a { color: inherit; text-decoration: underline; }
  /* without the photo overlay the heading and actions stay centred, as before */
  .dock-head { text-align: center; padding-bottom: 0; }
  .dock-head .plain-title { margin: 4px 0 0; }
  .dock-head .hero-actions-row { justify-content: center; margin-bottom: 1.75rem; }
  .dock-head .meta { margin-bottom: 1rem; }
  .dock-body { padding-top: 0; }
  .photo-credit-row + .dock-body { padding-top: clamp(1rem, 2.5vw, 1.75rem); }
  .dock-page figure { margin: 0; text-align: center; }
  .dock-page .hero-frame {
    display: inline-flex; max-width: 100%; background: var(--surface);
    border: 1px solid var(--border); border-radius: var(--radius-xl); overflow: hidden;
    padding: 0; cursor: pointer; transition: opacity var(--ease);
  }
  .dock-page .hero-frame:hover { opacity: 0.9; }
  .dock-page img.hero-img {
    display: block; width: auto; height: auto; max-width: 100%; max-height: 620px;
  }

  .hero-lightbox {
    position: fixed; inset: 0; z-index: var(--z-lightbox); background: rgba(6,14,26,0.92);
    display: none; align-items: center; justify-content: center; padding: 40px 20px; cursor: zoom-out;
  }
  .hero-lightbox.open { display: flex; }
  .hero-lightbox img { max-width: 100%; max-height: 90vh; border-radius: var(--radius-md); display: block; }
  .hero-lightbox .lb-close {
    position: fixed; top: 20px; right: 20px; border: none; background: rgba(255,255,255,0.12); color: var(--white);
    border-radius: 50%; width: 44px; height: 44px; cursor: pointer; display: flex;
    align-items: center; justify-content: center; transition: background var(--ease);
  }
  .hero-lightbox .lb-close:hover { background: rgba(255,255,255,0.24); }
  .hero-lightbox .lb-close svg { width: 20px; height: 20px; }
  .dock-page .desc-source { font-size: 0.75rem; color: var(--ink-soft); margin-top: -8px; max-width: 44rem; }
  .dock-page .desc-source a, .dock-page figcaption a, .hero-credit a { color: inherit; text-decoration: underline; }
  .dock-page figcaption { font-size: 0.75rem; color: var(--ink-soft); margin-top: 6px; }

  .no-photo-yet {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
    border: 1.5px dashed var(--border); border-radius: var(--radius-xl); padding: 48px 16px;
    text-align: center; color: var(--ink-soft); margin: 24px 0 32px;
  }

  .hero-split {
    display: grid; grid-template-columns: 1fr 1fr; align-items: stretch;
    border: 1px solid var(--border); border-radius: var(--radius-xl); overflow: hidden; margin: 24px 0 32px;
  }
  .hero-frame-split { border: none; padding: 0; margin: 0; cursor: pointer; display: block; background: none; }
  .hero-img-split { width: 100%; height: auto; max-height: 80vh; object-fit: contain; display: block; transition: opacity var(--ease); }
  .hero-frame-split:hover .hero-img-split { opacity: 0.9; }
  .hero-split-text { padding: 32px; display: flex; flex-direction: column; justify-content: center; gap: 12px; }
  .hero-split-text .desc { margin: 0; }
  .hero-split-text .hero-credit { font-size: 0.75rem; color: var(--ink-soft); }
  @media (max-width: 700px) {
    .hero-split { grid-template-columns: 1fr; }
  }
  .dock-page h1 { margin-top: 4px; }
  .dock-page .meta { color: var(--ink-soft); margin-bottom: 2rem; text-align: center; }
  .dock-page .breadcrumb { text-align: center; }
  .favorite-btn {
    display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--border);
    background: var(--surface); border-radius: var(--radius-pill); padding: 7px 14px; cursor: pointer;
    font-size: 0.82rem; font-weight: 600; color: var(--ink); transition: border-color var(--ease);
  }
  .favorite-btn:hover { border-color: var(--accent); }
  .favorite-btn svg { width: 15px; height: 15px; }
  .favorite-btn.active { color: var(--amber); border-color: var(--amber); }
  .favorite-btn.active svg { fill: var(--amber); }
  /* a compact row of facts, then the map across the full width */
  .info-band { display: flex; flex-direction: column; gap: 16px; margin: 28px 0; }
  .facts {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    gap: 16px; margin: 0; padding: 16px 20px; background: var(--surface);
    border: 1px solid var(--border); border-radius: var(--radius-lg);
  }
  .mini-map { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
  .dock-map { height: clamp(14rem, 30vw, 19rem); width: 100%; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; background: var(--surface); }
  .map-caption { margin: 0; font-size: 0.75rem; color: var(--ink-soft); }
  .map-caption a { color: inherit; text-decoration: underline; }
  .dock-pin { background: none; border: none; }
  .dock-pin svg { display: block; filter: drop-shadow(0 2px 3px rgba(11, 37, 69, 0.35)); }
  .facts dt { font-weight: 600; color: var(--ink-soft); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }
  .facts dd { margin: 4px 0 0; font-size: 1.05rem; }
  /* the story and everything read after it share one left edge */
  .dock-page p.desc {
    font-family: var(--font-serif); font-weight: 400; font-size: clamp(1.05rem, 1.4vw, 1.15rem); line-height: 1.8;
    max-width: 44rem; color: var(--ink-prose-strong); text-align: left; margin: 0.5rem 0 1.5rem;
  }
  .dock-page .hero-split-text p.desc { text-align: left; margin: 0; }

  .gallery-section { margin: 36px 0; }
  .gallery-section h2 { font-size: 1.2rem; margin: 0 0 16px; }
  .gallery-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
  .gallery-tile {
    position: relative; display: block; border: none; padding: 0; margin: 0; cursor: pointer;
    border-radius: var(--radius-md); overflow: hidden; background: var(--surface); text-align: left;
    aspect-ratio: 4 / 3;
  }
  .gallery-tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .gallery-tile .caption {
    position: absolute; left: 0; right: 0; bottom: 0; padding: 6px 8px;
    background: linear-gradient(0deg, rgba(0,0,0,0.72), rgba(0,0,0,0));
    color: var(--white); font-size: 0.72rem; line-height: 1.3;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .gallery-tile .more-overlay {
    position: absolute; inset: 0; background: rgba(var(--navy-rgb), 0.72);
    color: var(--white); display: flex; align-items: center; justify-content: center;
    font-family: var(--font-serif-bare); font-weight: 600; font-size: 1.3rem;
  }
  .gallery-tile .leader-badge {
    position: absolute; top: 6px; right: 6px; background: var(--amber); color: var(--white);
    font-size: 0.68rem; font-weight: 600; padding: 3px 8px; border-radius: var(--radius-pill);
    display: flex; align-items: center; gap: 3px;
  }
  .gallery-tile .leader-badge svg { width: 11px; height: 11px; }

  .gallery-lightbox {
    position: fixed; inset: 0; z-index: var(--z-lightbox); background: rgba(6,14,26,0.92);
    display: none; align-items: center; justify-content: center; padding: 40px 20px;
    overflow-y: auto;
  }
  .gallery-lightbox.open { display: flex; }
  .gallery-lightbox figure { margin: 0; max-width: 900px; width: 100%; text-align: center; }
  .gallery-lightbox img { max-width: 100%; max-height: 72vh; border-radius: var(--radius-md); display: block; margin: 0 auto; }
  .gallery-lightbox h3#lb-title { color: var(--white); font-family: var(--font-serif-bare); font-size: 1.15rem; margin: 16px 0 0; }
  .gallery-lightbox figcaption { color: #cddbe7; margin-top: 6px; font-size: 0.92rem; line-height: 1.5; }
  .gallery-lightbox .lb-close, .gallery-lightbox .lb-prev, .gallery-lightbox .lb-next {
    position: fixed; border: none; background: rgba(255,255,255,0.12); color: var(--white);
    border-radius: 50%; width: 44px; height: 44px; cursor: pointer; display: flex;
    align-items: center; justify-content: center; transition: background var(--ease);
  }
  .gallery-lightbox .lb-close:hover, .gallery-lightbox .lb-prev:hover, .gallery-lightbox .lb-next:hover {
    background: rgba(255,255,255,0.24);
  }
  .gallery-lightbox .lb-close { top: 20px; right: 20px; }
  .gallery-lightbox .lb-prev { left: 20px; top: 50%; transform: translateY(-50%); }
  .gallery-lightbox .lb-next { right: 20px; top: 50%; transform: translateY(-50%); }
  .gallery-lightbox svg { width: 20px; height: 20px; }
  .lb-vote { margin-top: 16px; text-align: center; }
  .lb-vote .leader-tag {
    display: none; align-items: center; gap: 6px; justify-content: center;
    color: #f0c674; font-size: 0.85rem; font-weight: 600; margin-bottom: 10px;
  }
  .lb-vote .leader-tag.show { display: inline-flex; }
  .lb-vote .leader-tag svg { width: 15px; height: 15px; }
  .lb-vote .feedback { color: var(--accent); font-size: 0.82rem; margin: 0 0 10px; min-height: 1.2em; }
  .lb-vote .feedback.bad { color: #ffb4a8; }
  .rating-row { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
  .rating-row button {
    width: 30px; height: 30px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.08); color: var(--white); font-size: 0.8rem; font-weight: 600;
    cursor: pointer; transition: background var(--ease), border-color var(--ease), color var(--ease);
  }
  .rating-row button:hover { background: rgba(255,255,255,0.2); }
  .rating-row button.selected { background: var(--white); border-color: var(--white); color: var(--ink); }
  .lb-vote a { color: #eef4f8; font-size: 0.85rem; text-decoration: underline; }

  .lb-comments { margin-top: 22px; text-align: left; max-width: 480px; margin-left: auto; margin-right: auto; }
  .lb-comments h4 { color: #eef4f8; font-size: 0.85rem; margin: 0 0 10px; font-weight: 600; }
  .lb-comments-list { display: flex; flex-direction: column; gap: 10px; max-height: 180px; overflow-y: auto; margin-bottom: 12px; }
  .lb-comment { font-size: 0.85rem; color: #d7e2ec; }
  .lb-comment .who { font-weight: 600; color: #f0c674; margin-right: 6px; }
  .lb-comments-empty { font-size: 0.82rem; color: #8fa3b8; }
  .lb-comment-form { display: flex; gap: 8px; }
  .lb-comment-form textarea {
    flex: 1; resize: none; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.08); color: var(--white); padding: 8px 10px; font-family: inherit; font-size: 0.85rem;
  }
  .lb-comment-form button {
    border: none; border-radius: var(--radius-sm); padding: 0 16px; background: var(--white); color: var(--ink);
    font-weight: 600; cursor: pointer; font-size: 0.85rem;
  }

  .contribute {
    margin-top: 40px; padding: 24px; border: 1px dashed var(--border); border-radius: var(--radius-xl);
    display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
  }
  .contribute h3 { margin: 0 0 4px; font-size: 1.1rem; }
  .contribute p { margin: 0; color: var(--ink-soft); font-size: 0.9rem; max-width: 46ch; }
`;
