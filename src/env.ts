export type Bindings = {
  DB: D1Database;
  PHOTOS: R2Bucket;
  SITE_URL: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
};

export type Env = { Bindings: Bindings };
