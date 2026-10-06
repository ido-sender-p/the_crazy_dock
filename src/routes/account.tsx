import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import type { Env } from "../env";
import { EditProfilePage } from "../pages/editProfile";
import { requireUser, SESSION_COOKIE } from "../lib/session";
import { updateProfile, findPasswordHash, changePassword, deleteOtherSessions } from "../lib/db";
import { hashPassword, verifyPassword, hasRealPassword } from "../lib/auth";
import { detectImageType, MAX_PHOTO_BYTES } from "../lib/imageValidation";
import {
  checkUsername,
  checkEmail,
  checkNewPassword,
  checkDateOfBirth,
  isUniqueViolation,
  uniqueViolationField,
  USERNAME_TAKEN_ERROR,
} from "../lib/validation";
import { uploadBody } from "../middleware/limits";

export const account = new Hono<Env>();

const UPLOAD_KEY_RE = /^\/uploads\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;

account.get("/profile/edit", async (c) => {
  const user = await requireUser(c);
  if (user instanceof Response) return user;
  const hash = await findPasswordHash(c.env.DB, user.id);
  return c.html(<EditProfilePage user={user} hasPassword={!!hash && hasRealPassword(hash)} path="/profile/edit" />);
});

account.post("/profile/edit", uploadBody, async (c) => {
  const user = await requireUser(c);
  if (user instanceof Response) return user;

  const passwordHash = await findPasswordHash(c.env.DB, user.id);
  const userHasPassword = !!passwordHash && hasRealPassword(passwordHash);

  const form = await c.req.formData();
  const rejectWith = (error: string) =>
    c.html(<EditProfilePage user={user} hasPassword={userHasPassword} path="/profile/edit" error={error} />, 400);

  const username = checkUsername(String(form.get("username") ?? ""));
  if (!username.ok) return rejectWith(username.error);

  const email = checkEmail(String(form.get("email") ?? ""));
  if (!email.ok) return rejectWith(email.error);

  const dateOfBirth = String(form.get("dateOfBirth") ?? "").trim();
  if (dateOfBirth && !checkDateOfBirth(dateOfBirth)) return rejectWith("Please enter a valid date of birth.");
  const location = String(form.get("location") ?? "").trim().slice(0, 120);

  const currentPassword = String(form.get("currentPassword") ?? "");
  const newPassword = String(form.get("newPassword") ?? "");
  const confirmPassword = String(form.get("confirmPassword") ?? "");
  const changingEmail = email.value !== user.email;
  const changingPassword = !!(newPassword || confirmPassword);

  // Changing the email or password needs the current password, so a stolen
  // session alone can't take over the account.
  if (changingEmail && !userHasPassword) return rejectWith("Accounts that sign in with Google can't change their email here.");
  if ((changingEmail || changingPassword) && userHasPassword) {
    if (!currentPassword || !(await verifyPassword(currentPassword, passwordHash!))) {
      return rejectWith("Enter your current password to change your email or password.");
    }
  }
  let newPasswordHash: string | null = null;
  if (changingPassword) {
    const passwordError = checkNewPassword(newPassword, confirmPassword);
    if (passwordError) return rejectWith(passwordError);
    newPasswordHash = await hashPassword(newPassword);
  }

  const avatarEntries = form.getAll("avatar");
  if (avatarEntries.length > 1) return rejectWith("Please attach only one photo.");
  const avatar = avatarEntries[0];

  // Everything is validated before anything is written to R2.
  let avatarBytes: Uint8Array | null = null;
  let avatarType: string | null = null;
  if (avatar instanceof File && avatar.size > 0) {
    if (avatar.size > MAX_PHOTO_BYTES) return rejectWith("Photo is too large (8 MB max).");
    avatarBytes = new Uint8Array(await avatar.arrayBuffer());
    avatarType = detectImageType(avatarBytes);
    if (!avatarType) return rejectWith("That file doesn't look like a supported image (JPEG, PNG, GIF or WEBP).");
  }

  let avatarKey: string | null = null;
  if (avatarBytes && avatarType) {
    avatarKey = crypto.randomUUID();
    await c.env.PHOTOS.put(avatarKey, avatarBytes, { httpMetadata: { contentType: avatarType } });
  }
  const avatarUrl = avatarKey ? `/uploads/${avatarKey}` : undefined;

  try {
    await updateProfile(c.env.DB, user.id, {
      username: username.value,
      email: email.value,
      dateOfBirth: dateOfBirth || null,
      location: location || null,
      avatarUrl,
    });
  } catch (err) {
    if (avatarKey) await c.env.PHOTOS.delete(avatarKey);
    if (!isUniqueViolation(err)) throw err;
    return rejectWith(
      uniqueViolationField(err) === "username" ? USERNAME_TAKEN_ERROR : "That email is already in use by another account.",
    );
  }

  const token = getCookie(c, SESSION_COOKIE);
  if (newPasswordHash) await changePassword(c.env.DB, user.id, newPasswordHash, token);
  else if (changingEmail) await deleteOtherSessions(c.env.DB, user.id, token);

  // The old avatar is orphaned now, drop it from R2.
  const oldKey = avatarKey ? UPLOAD_KEY_RE.exec(user.avatar_url ?? "")?.[1] : undefined;
  if (oldKey) await c.env.PHOTOS.delete(oldKey);

  const updated = {
    ...user,
    username: username.value,
    email: email.value,
    date_of_birth: dateOfBirth || null,
    location: location || null,
    avatar_url: avatarUrl ?? user.avatar_url,
  };
  return c.html(<EditProfilePage user={updated} hasPassword={userHasPassword || !!newPasswordHash} path="/profile/edit" success />);
});
