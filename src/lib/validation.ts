// Shared form validators for signup, profile edit and Google signup.

const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 200;

const USERNAME_RE = /^[A-Za-z0-9_.-]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Checked<T> = { ok: true; value: T } | { ok: false; error: string };

export function checkUsername(raw: string): Checked<string> {
  const value = raw.trim();
  if (!USERNAME_RE.test(value)) {
    return { ok: false, error: "Display names are 3 to 30 characters: letters, numbers, dot, dash or underscore." };
  }
  return { ok: true, value };
}

export function checkEmail(raw: string): Checked<string> {
  const value = raw.trim().toLowerCase();
  if (value.length > 255 || !EMAIL_RE.test(value)) return { ok: false, error: "Please enter a valid email address." };
  return { ok: true, value };
}

export function checkNewPassword(password: string, confirm: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (password.length > MAX_PASSWORD_LENGTH) return `Password can be at most ${MAX_PASSWORD_LENGTH} characters.`;
  if (password !== confirm) return "Passwords don't match.";
  return null;
}

export const USERNAME_TAKEN_ERROR = "That display name is already taken.";
export const EMAIL_TAKEN_ERROR = "That email is already registered. Try logging in instead.";

export function isUniqueViolation(err: unknown): boolean {
  return /UNIQUE constraint failed/i.test(String((err as { message?: string })?.message ?? err));
}

// Which unique column a violation was about (D1 message names the column).
export function uniqueViolationField(err: unknown): "email" | "username" | "other" {
  const msg = String((err as { message?: string })?.message ?? err);
  if (/users\.email/.test(msg)) return "email";
  if (/users\.username|idx_users_username/.test(msg)) return "username";
  return "other";
}

// Google display names are free text, so squeeze them into the username rules.
export function usernameFromName(name: string, email: string): string {
  let base = (name || email.split("@")[0]).replace(/\s+/g, "_").replace(/[^A-Za-z0-9_.-]/g, "").slice(0, 26);
  if (base.length < 3) base = (base + "user").slice(0, 26);
  return base;
}

// Dates only: YYYY-MM-DD, a real calendar date, not in the future, after 1900.
export function checkDateOfBirth(raw: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const t = Date.parse(`${raw}T00:00:00Z`);
  if (Number.isNaN(t) || new Date(t).toISOString().slice(0, 10) !== raw) return false;
  return t >= Date.parse("1900-01-01T00:00:00Z") && t <= Date.now();
}
