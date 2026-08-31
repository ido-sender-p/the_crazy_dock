import { Layout } from "../layout";
import { raw } from "hono/html";
import type { User } from "../lib/db";

const PAGE_CSS = `
  .edit-profile-page { padding: 56px 0 100px; max-width: 480px; }
  .edit-profile-page h1 { font-size: 1.7rem; }
  .edit-profile-page p.intro { color: var(--ink-soft); margin-bottom: 28px; }
  .edit-profile-page form { display: flex; flex-direction: column; gap: 20px; }
  .edit-profile-page label { font-size: 0.85rem; font-weight: 600; color: var(--ink); display: block; margin-bottom: 6px; }
  .edit-profile-page input[type="text"],
  .edit-profile-page input[type="email"],
  .edit-profile-page input[type="date"],
  .edit-profile-page input[type="password"] {
    width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: 10px;
    font-size: 0.95rem; font-family: inherit; color: var(--ink);
  }
  .edit-profile-page button.btn-cta { border: none; cursor: pointer; align-self: flex-start; }
  .edit-profile-page .error {
    background: #fdecea; border: 1px solid #f3b4ab; color: #9c2c1f;
    padding: 10px 14px; border-radius: 10px; font-size: 0.88rem;
  }
  .edit-profile-page .success {
    background: #eafaf3; border: 1px solid #9fe0c0; color: #146b43;
    padding: 10px 14px; border-radius: 10px; font-size: 0.88rem;
  }
  .back-link { display: inline-block; margin-top: 18px; font-size: 0.85rem; color: var(--ink-soft); text-decoration: none; }
  .back-link:hover { color: var(--accent-dark); }

  .avatar-row { display: flex; align-items: center; gap: 16px; }
  .avatar-preview {
    width: 64px; height: 64px; border-radius: 50%; object-fit: cover; flex: none;
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  }
  .avatar-preview.placeholder {
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.3rem;
  }
  .photo-input {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }
  .avatar-picker {
    display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px;
    border: 1px solid var(--border); border-radius: 999px; cursor: pointer;
    font-size: 0.85rem; font-weight: 600; color: var(--ink); background: var(--surface);
    transition: border-color 0.15s ease;
  }
  .avatar-picker:hover { border-color: var(--accent); }

  .section-divider { border: none; border-top: 1px solid var(--border); margin: 4px 0; }
  .section-title { font-size: 1.05rem; margin: 0; }
  .section-hint { color: var(--ink-soft); font-size: 0.85rem; margin: -12px 0 0; }
`;

function initials(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0]?.toUpperCase()).slice(0, 2).join("");
}

export function EditProfilePage(opts: {
  user: User;
  hasPassword: boolean;
  path: string;
  error?: string;
  success?: boolean;
}) {
  return (
    <Layout title="Edit profile | Wildock" description="Update your Wildock profile." path={opts.path}>
      <style>{raw(PAGE_CSS)}</style>
      <div class="wrap edit-profile-page">
        <h1>Edit profile</h1>
        <p class="intro">Update your details, or change your password.</p>
        {opts.error && <div class="error">{opts.error}</div>}
        {opts.success && <div class="success">Saved.</div>}
        <form method="post" action="/profile/edit" enctype="multipart/form-data">
          <div class="avatar-row">
            {opts.user.avatar_url ? (
              <img class="avatar-preview" id="avatar-preview" src={opts.user.avatar_url} alt="" />
            ) : (
              <div class="avatar-preview placeholder" id="avatar-preview-placeholder">{initials(opts.user.username)}</div>
            )}
            <div>
              <input class="photo-input" id="avatar" name="avatar" type="file" accept="image/*" />
              <label class="avatar-picker" for="avatar" id="avatar-picker-label">Change photo</label>
            </div>
          </div>
          <div>
            <label for="username">Display name</label>
            <input id="username" name="username" type="text" value={opts.user.username} maxlength={60} required />
          </div>
          <div>
            <label for="email">Email</label>
            <input id="email" name="email" type="email" value={opts.user.email} maxlength={255} required />
          </div>
          <div>
            <label for="dateOfBirth">Date of birth</label>
            <input id="dateOfBirth" name="dateOfBirth" type="date" value={opts.user.date_of_birth ?? ""} />
          </div>
          <div>
            <label for="location">Location</label>
            <input
              id="location"
              name="location"
              type="text"
              value={opts.user.location ?? ""}
              maxlength={120}
              placeholder="City, country"
            />
          </div>

          <hr class="section-divider" />
          <h2 class="section-title">{opts.hasPassword ? "Change password" : "Set a password"}</h2>
          <p class="section-hint">
            {opts.hasPassword
              ? "Leave these blank to keep your current password."
              : "You signed up with Google. Set a password here if you'd also like to log in with email."}
          </p>
          {opts.hasPassword && (
            <div>
              <label for="currentPassword">Current password</label>
              <input id="currentPassword" name="currentPassword" type="password" autocomplete="current-password" />
            </div>
          )}
          <div>
            <label for="newPassword">New password</label>
            <input id="newPassword" name="newPassword" type="password" minlength={8} autocomplete="new-password" />
          </div>
          <div>
            <label for="confirmPassword">Confirm new password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" minlength={8} autocomplete="new-password" />
          </div>

          <button class="btn-cta" type="submit">Save changes</button>
        </form>
        <a class="back-link" href="/profile">← Back to profile</a>
      </div>
      <script>{raw(`
        (function () {
          var input = document.getElementById('avatar');
          if (!input) return;
          input.addEventListener('change', function () {
            var file = input.files && input.files[0];
            if (!file) return;
            var label = document.getElementById('avatar-picker-label');
            if (label) label.textContent = file.name;
          });
        })();
      `)}</script>
    </Layout>
  );
}
