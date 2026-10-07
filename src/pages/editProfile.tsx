import { Layout } from "../components/layout";
import type { User } from "../lib/db";
import { initials } from "../lib/places";

export function EditProfilePage(opts: {
  user: User;
  hasPassword: boolean;
  path: string;
  error?: string;
  success?: boolean;
}) {
  return (
    <Layout page="editProfile" scripts={["editProfile"]} title="Edit profile | Wildock" description="Update your Wildock profile." path={opts.path} noindex>
      <div class="wrap edit-profile-page">
        <h1>Edit profile</h1>
        <p class="intro">Update your details, or change your password.</p>
        {opts.error && <div class="error" role="alert">{opts.error}</div>}
        {opts.success && <div class="success" role="status">Saved.</div>}
        <form method="post" action="/profile/edit" enctype="multipart/form-data">
          <div class="avatar-row">
            {opts.user.avatar_url ? (
              <img class="avatar-preview" id="avatar-preview" src={opts.user.avatar_url} alt="" />
            ) : (
              <div class="avatar-preview placeholder" id="avatar-preview">{initials(opts.user.username)}</div>
            )}
            <div>
              <input class="photo-input" id="avatar" name="avatar" type="file" accept="image/*" />
              <label class="avatar-picker" for="avatar" id="avatar-picker-label">Change photo</label>
            </div>
          </div>
          <div>
            <label for="username">Display name</label>
            <input id="username" name="username" type="text" value={opts.user.username} minlength={3} maxlength={30} pattern="[A-Za-z0-9_.\-]+" title="3 to 30 letters, numbers, dots, dashes or underscores" required />
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
            {opts.hasPassword && " Your current password is also needed to change your email."}
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
    </Layout>
  );
}
