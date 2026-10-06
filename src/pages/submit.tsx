import { Layout } from "../layout";
import { raw } from "hono/html";
import type { User } from "../lib/db";

const PAGE_CSS = `
  .submit-page { padding: 60px 0 100px; max-width: 620px; }

  .submit-page p.intro { color: var(--ink-soft); margin-bottom: 8px; }
  .submit-page div.who { color: var(--ink-soft); font-size: 0.85rem; margin-bottom: 28px; }
  .submit-page div.who a { color: var(--accent-text); text-decoration: none; }
  .submit-page form { display: flex; flex-direction: column; gap: 16px; }
  .submit-page .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 560px) { .submit-page .row { grid-template-columns: 1fr; } }
  .submit-page label { font-size: 0.85rem; font-weight: 600; color: var(--ink); display: block; margin-bottom: 6px; }
  .submit-page input, .submit-page select {
    width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: 10px;
    font-size: 0.95rem; font-family: inherit; color: var(--ink);
  }
  .submit-page input:focus, .submit-page select:focus {
    outline: 2px solid var(--accent); outline-offset: 1px;
  }
  .submit-page .photo-note { font-size: 0.8rem; color: var(--ink-soft); margin: 0; }
  .submit-page button.btn-cta { border: none; cursor: pointer; margin-top: 6px; align-self: flex-start; }
  .submit-page .success { padding: 18px 20px; border-radius: 12px; font-size: 0.95rem; }
  .submit-page form .error { margin-bottom: 0; }
  .submit-page .logout-form { display: inline; }
  .submit-page .logout-btn { border: none; background: none; padding: 0; font: inherit; color: var(--accent-text); cursor: pointer; }
`;

export function SubmitPage(opts: { user: User; path: string; success?: boolean; error?: string }) {
  return (
    <Layout title="Submit a dock | Wildock" description="Submit a new dock, pier or marina to the Wildock catalogue." path={opts.path} noindex>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap submit-page">
        <h1>Submit a dock, pier or marina</h1>
        <p class="intro">Know a spot we're missing? Add it below and we'll review it before it goes live.</p>
        <div class="who">
          Logged in as <a href="/profile">{opts.user.username}</a> · <form class="logout-form" method="post" action="/logout">
            <button class="logout-btn" type="submit">Log out</button>
          </form>
        </div>

        {opts.success ? (
          <div class="success" role="status">Thanks! Your submission was received and is waiting for review.</div>
        ) : (
          <form method="post" action="/submit">
            {opts.error && <div class="error" role="alert">{opts.error}</div>}
            <div>
              <label for="name">Dock, pier or marina name</label>
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
            <p class="photo-note">
              Once it's published, you'll be able to add its photo and story from its own page, using the
              "Submit a photo" button there.
            </p>
            <button class="btn-cta" type="submit">
              Submit for review
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
