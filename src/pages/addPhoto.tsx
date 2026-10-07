import { Layout } from "../components/layout";

export function AddPhotoPage(opts: {
  dockName: string;
  dockSlug: string;
  path: string;
  success?: boolean;
  error?: string;
}) {
  return (
    <Layout page="addPhoto" scripts={["addPhoto"]} title={`Add a photo of ${opts.dockName} | Wildock`} description={`Submit a photo of ${opts.dockName}.`} path={opts.path} noindex>
      <div class="wrap add-photo-page">
        <h1>Add a photo of {opts.dockName}</h1>
        <p class="intro">Name your photo, upload it, and tell its story. We'll review it before it joins the gallery.</p>

        {opts.success ? (
          <div class="success" role="status">Thanks! Your photo is in for review.</div>
        ) : (
          <form method="post" action={`/docks/${opts.dockSlug}/add-photo`} enctype="multipart/form-data">
            {opts.error && <div class="error" role="alert">{opts.error}</div>}
            <div>
              <label for="title">Picture name</label>
              <input id="title" name="title" type="text" maxlength={60} required />
              <p class="hint">A short name. This is what shows under the photo in the gallery.</p>
            </div>
            <div>
              <label for="photo">Photo</label>
              <input class="photo-input" id="photo" name="photo" type="file" accept="image/*" required />
              <label for="photo" class="photo-dropzone" id="photo-dropzone">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
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
    </Layout>
  );
}
