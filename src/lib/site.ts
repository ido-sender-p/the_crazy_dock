// The public origin, for canonical links and structured data. Pages cannot read the Worker env, so this is the
// one constant they share; routes that can read SITE_URL (wrangler.toml) fall back to it.
export const SITE_ORIGIN = "https://wildock.com";
