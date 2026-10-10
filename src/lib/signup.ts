// Registration is closed to the public. SIGNUP_ALLOWLIST (comma-separated emails, set in wrangler.toml [vars]) names the
// only addresses that may still create an account, for example the owner's, to make the first admin. Empty means nobody can.
// Existing accounts are not affected: logging in (password or Google) works as before.
type SignupEnv = { SIGNUP_ALLOWLIST?: string };

export function signupAllowlist(env: SignupEnv): string[] {
  return (env.SIGNUP_ALLOWLIST ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export const registrationOpen = (env: SignupEnv): boolean => signupAllowlist(env).length > 0;

export const mayRegister = (env: SignupEnv, email: string): boolean => signupAllowlist(env).includes(email.trim().toLowerCase());
