import { Layout } from "../layout";
import { raw } from "hono/html";
import type { User } from "../lib/db";

const PAGE_CSS = `
  .submit-page { padding: 60px 0 100px; max-width: 620px; }
  .submit-page h1 { font-size: 1.9rem; }
  .submit-page p.intro { color: var(--ink-soft); margin-bottom: 8px; }
  .submit-page p.who { color: var(--ink-soft); font-size: 0.85rem; margin-bottom: 28px; }
  .submit-page p.who a { color: var(--accent-dark); text-decoration: none; }
  .submit-page form { display: flex; flex-direction: column; gap: 16px; }
  .submit-page .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 560px) { .submit-page .row { grid-template-columns: 1fr; } }
  .submit-page label { font-size: 0.85rem; font-weight: 600; color: var(--ink); display: block; margin-bottom: 6px; }
  .submit-page input, .submit-page select, .submit-page textarea {
    width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: 10px;
    font-size: 0.95rem; font-family: inherit; color: var(--ink);
  }
  .submit-page textarea { resize: vertical; min-height: 110px; }
  .submit-page input:focus, .submit-page select:focus, .submit-page textarea:focus {
    outline: 2px solid var(--accent); outline-offset: 1px;
  }
  .photo-input {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }
  .submit-page label.photo-dropzone {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
    border: 1.5px dashed var(--border); border-radius: 14px; padding: 32px 16px;
    cursor: pointer; text-align: center; color: var(--ink-soft); font-size: 0.9rem;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .photo-dropzone:hover, .photo-dropzone.drag { border-color: var(--accent); background: rgba(46,196,182,0.05); }
  .photo-dropzone svg { width: 30px; height: 30px; color: var(--accent-dark); }
  .photo-dropzone .filename { font-weight: 600; color: var(--ink); }
  .photo-dropzone .hint { font-size: 0.78rem; color: var(--ink-soft); }
  .submit-page button.btn-cta { border: none; cursor: pointer; margin-top: 6px; align-self: flex-start; }
  .submit-page .success {
    background: #eafaf3; border: 1px solid #9fe0c0; color: #146b43;
    padding: 18px 20px; border-radius: 12px; font-size: 0.95rem;
  }
  .submit-page .error {
    background: #fdecea; border: 1px solid #f3b4ab; color: #9c2c1f;
    padding: 10px 14px; border-radius: 10px; font-size: 0.88rem; margin-bottom: 16px;
  }
`;

export function SubmitPage(opts: { user: User; path: string; success?: boolean; error?: string }) {
  return (
    <Layout title="Submit a dock | Wildock" description="Submit a new dock, pier or marina to the Wildock catalogue." path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap submit-page">
        <h1>Submit a dock, pier or marina</h1>
        <p class="intro">Know a spot we're missing? Add it below and we'll review it before it goes live.</p>
        <p class="who">
          Logged in as <a href="/profile">{opts.user.username}</a> · <a href="/logout">Log out</a>
        </p>

        {opts.success ? (
          <div class="success">Thanks! Your submission was received and is waiting for review.</div>
        ) : (
          <form method="post" action="/submit" enctype="multipart/form-data">
            {opts.error && <div class="error">{opts.error}</div>}
            <div>
              <label for="name">Name of the picture</label>
              <input id="name" name="name" type="text" required />
            </div>
            <div class="row">
              <div>
                <label for="dockType">Type</label>
                <select id="dockType" name="dockType" required>
                  <option value="marina">Marina</option>
                  <option value="pier">Pier</option>
                  <option value="floating_dock">Floating dock</option>
                  <option value="industrial">Industrial dock</option>
                </select>
              </div>
              <div>
                <label for="country">Country</label>
                <input id="country" name="country" type="text" required />
              </div>
            </div>
            <div class="row">
              <div>
                <label for="stateProvince">State / region</label>
                <input id="stateProvince" name="stateProvince" type="text" />
              </div>
              <div>
                <label for="settlement">City / town</label>
                <input id="settlement" name="settlement" type="text" required />
              </div>
            </div>
            <div>
              <label for="description">Description or story</label>
              <textarea id="description" name="description" required />
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
                <span class="hint">or drag and drop — JPG, PNG, up to a few MB</span>
              </label>
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
            // Only ever keep the first file, even if several were dropped at once.
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
