import { Layout } from "../layout";
import type { User } from "../lib/db";

export function SubmitPage(opts: { user: User; path: string; success?: boolean; error?: string }) {
  return (
    <Layout page="submit" title="Submit a dock | Wildock" description="Submit a new dock, pier or marina to the Wildock catalogue." path={opts.path} noindex>
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
