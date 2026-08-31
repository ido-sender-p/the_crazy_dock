import { Hono } from "hono";
import type { Env } from "../env";
import { EditProfilePage } from "../pages/editProfile";
import { currentUser } from "../lib/session";
import { updateUsername, updateAvatarUrl, updateUserPassword, updateEmail, updateProfileDetails, findUserByEmail } from "../lib/db";
import { hashPassword, verifyPassword } from "../lib/auth";
import { detectImageType, MAX_PHOTO_BYTES } from "../lib/imageValidation";

export const account = new Hono<Env>();

function hasPassword(user: { password_hash: string }) {
  return user.password_hash !== "oauth:google";
}

account.get("/profile/edit", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.redirect("/login?next=/profile/edit");
  return c.html(<EditProfilePage user={user} hasPassword={hasPassword(user)} path="/profile/edit" />);
});

// Old standalone change-password page — folded into /profile/edit.
account.get("/profile/password", (c) => c.redirect("/profile/edit"));

account.post("/profile/edit", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.redirect("/login?next=/profile/edit");

  const form = await c.req.formData();
  const rejectWith = (error: string, patchedUser = user) =>
    c.html(<EditProfilePage user={patchedUser} hasPassword={hasPassword(user)} path="/profile/edit" error={error} />, 400);

  const username = String(form.get("username") ?? "").trim().slice(0, 60);
  if (!username) return rejectWith("Please enter a display name.");

  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 255);
  if (!email || !email.includes("@")) return rejectWith("Please enter a valid email address.");
  if (email !== user.email) {
    const existing = await findUserByEmail(c.env.DB, email);
    if (existing) return rejectWith("That email is already in use by another account.");
  }

  const dateOfBirth = String(form.get("dateOfBirth") ?? "").trim();
  const location = String(form.get("location") ?? "").trim().slice(0, 120);

  const avatarEntries = form.getAll("avatar");
  if (avatarEntries.length > 1) return rejectWith("Please attach only one photo.");
  const avatar = avatarEntries[0];

  let avatarUrl: string | null = null;
  if (avatar instanceof File && avatar.size > 0) {
    if (avatar.size > MAX_PHOTO_BYTES) return rejectWith("Photo is too large (8 MB max).");
    const bytes = new Uint8Array(await avatar.arrayBuffer());
    const detectedType = detectImageType(bytes);
    if (!detectedType) return rejectWith("That file doesn't look like a supported image (JPEG, PNG, GIF or WEBP).");

    const key = crypto.randomUUID();
    await c.env.PHOTOS.put(key, bytes, { httpMetadata: { contentType: detectedType } });
    avatarUrl = `/uploads/${key}`;
  }

  // Password change is optional — only touched when a new password was typed.
  const newPassword = String(form.get("newPassword") ?? "");
  const confirmPassword = String(form.get("confirmPassword") ?? "");
  if (newPassword || confirmPassword) {
    if (hasPassword(user)) {
      const currentPassword = String(form.get("currentPassword") ?? "");
      if (!(await verifyPassword(currentPassword, user.password_hash))) {
        return rejectWith("Current password is incorrect.");
      }
    }
    if (newPassword.length < 8) return rejectWith("New password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return rejectWith("New passwords don't match.");
    await updateUserPassword(c.env.DB, user.id, await hashPassword(newPassword));
  }

  await updateUsername(c.env.DB, user.id, username);
  await updateEmail(c.env.DB, user.id, email);
  await updateProfileDetails(c.env.DB, user.id, dateOfBirth || null, location || null);
  if (avatarUrl) await updateAvatarUrl(c.env.DB, user.id, avatarUrl);

  const updated = {
    ...user,
    username,
    email,
    date_of_birth: dateOfBirth || null,
    location: location || null,
    avatar_url: avatarUrl ?? user.avatar_url,
  };
  return c.html(<EditProfilePage user={updated} hasPassword={hasPassword(updated)} path="/profile/edit" success />);
});
