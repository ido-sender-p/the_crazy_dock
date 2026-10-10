import type { User } from "./lib/db";

export type Bindings = {
  DB: D1Database;
  PHOTOS: R2Bucket;
  SITE_URL: string;
  CONTACT_EMAIL?: string; // public address for takedown/credit requests, shown on /credits
  SIGNUP_ALLOWLIST?: string; // emails that may still register; empty = registration is closed (see lib/signup.ts)
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  CF_VERSION_METADATA?: { id: string }; // id of the deployed Worker version (wrangler.toml [version_metadata])
};

// `user` memoizes currentUser() for the request (null = checked, logged out).
export type Variables = { user?: User | null };

export type Env = { Bindings: Bindings; Variables: Variables };
