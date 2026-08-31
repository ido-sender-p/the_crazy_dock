import { Layout } from "../layout";
import { raw } from "hono/html";
import type { User } from "../lib/db";

const PAGE_CSS = `
  .add-photo-page { padding: 56px 0 100px; max-width: 560px; }
  .add-photo-page h1 { font-size: 1.7rem; }
  .add-photo-page p.intro { color: var(--ink-soft); margin-bottom: 28px; }
  .add-photo-page form { display: flex; flex-direction: column; gap: 16px; }
  .add-photo-page label { font-size: 0.85rem; font-weight: 600; color: var(--ink); display: block; margin-bottom: 6px; }
  .add-photo-page input, .add-photo-page textarea {
    width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: 10px;
    font-size: 0.95rem; font-family: inherit; color: var(--ink);
  }
  .add-photo-page textarea { resize: vertical; min-height: 70px; }
  .add-photo-page .hint { font-size: 0.78rem; color: var(--ink-soft); margin-top: 6px; }

  .photo-input {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }
  .add-photo-page label.photo-dropzone {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
    border: 1.5px dashed var(--border); border-radius: 14px; padding: 32px 16px;
    cursor: pointer; text-align: center; color: var(--ink-soft); font-size: 0.9rem;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .photo-dropzone:hover, .photo-dropzone.drag { border-color: var(--accent); background: rgba(46,196,182,0.05); }
  .photo-dropzone svg { width: 30px; height: 30px; color: var(--accent-dark); }
  .photo-dropzone .filename { font-weight: 600; color: var(--ink); }

  .add-photo-page button.btn-cta { border: none; cursor: pointer; margin-top: 6px; align-self: flex-start; }
  .add-photo-page .success {
    background: #eafaf3; border: 1px solid #9fe0c0; color: #146b43;
    padding: 18px 20px; border-radius: 12px; font-size: 0.95rem;
  }
  .add-photo-page .error {
    background: #fdecea; border: 1px solid #f3b4ab; color: #9c2c1f;
    padding: 10px 14px; border-radius: 10px; font-size: 0.88rem; margin-bottom: 4px;
  }
`;

export function AddPhotoPage(opts: {
  user: User;
  dockName: string;
  dockSlug: string;
  path: string;
  success?: boolean;
  error?: string;
}) {
  return (
    <Layout title={`Add a photo of ${opts.dockName} | Wildock`} description={`Submit a photo of ${opts.dockName}.`} path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap add-photo-page">
        <h1>Add a photo of {opts.dockName}</h1>
        <p class="intro">Name your photo, upload it, and tell its story. We'll review it before it joins the gallery.</p>

        {opts.success ? (
          <div class="success">Thanks! Your photo is in for review.</div>
        ) : (
          <form method="post" action={`/docks/${opts.dockSlug}/add-photo`} enctype="multipart/form-data">
            {opts.error && <div class="error">{opts.error}</div>}
            <div>
              <label for="title">Picture name</label>
              <input id="title" name="title" type="text" maxlength={60} required />
              <p class="hint">A short name. This is what shows under the photo in the gallery.</p>
            </div>
            <div>
              <label for="photo">Photo</label>
              <input class="photo-input" id="photo" name="photo" type="file" accept="image/*" required />
              <label for="photo" class="photo-dropzone" id="photo-dropzone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 16V4" />
                  <path d="M6.5 9.5 12 4l5.5 5.5" />
                  <path d="M4 16.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5" />
                </svg>
                <span class="filename" id="photo-filename">Click to upload a photo</span>
              </label>
            </div>
            <div>
              <label for="caption">Story</label>
              <textarea id="caption" name="caption" maxlength={1000} required />
              <p class="hint">What's the story behind this shot? This shows when someone opens the photo.</p>
            </div>
            <button class="btn-cta" type="submit">
              Submit for review
            </button>
          </form>
        )}
      </div>
      <script>{raw(`
        (function () {
          var input = document.getElementById('photo');
          var zone = document.getElementById('photo-dropzone');
          var label = document.getElementById('photo-filename');
          if (!input || !zone || !label) return;
          input.addEventListener('change', function () {
            label.textContent = input.files && input.files[0] ? input.files[0].name : 'Click to upload a photo';
          });
          ['dragover', 'dragenter'].forEach(function (evt) {
            zone.addEventListener(evt, function (e) { e.preventDefault(); zone.classList.add('drag'); });
          });
          ['dragleave', 'drop'].forEach(function (evt) {
            zone.addEventListener(evt, function (e) { e.preventDefault(); zone.classList.remove('drag'); });
          });
          zone.addEventListener('drop', function (e) {
            var dropped = e.dataTransfer && e.dataTransfer.files;
            if (!dropped || !dropped.length) return;
            var dt = new DataTransfer();
            dt.items.add(dropped[0]);
            input.files = dt.files;
            label.textContent = dropped[0].name;
          });
        })();
      `)}</script>
    </Layout>
  );
}
