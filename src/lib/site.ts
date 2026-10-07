// The public origin, for canonical links and structured data. Pages cannot read the Worker env, so this is the
// one constant they share; routes that can read SITE_URL (wrangler.toml) fall back to it.
export const SITE_ORIGIN = "https://wildock.com";

// Catalogue photos are served from this R2 custom domain (CDN-cached, outside the Worker request quota).
// User uploads stay on /uploads, where the Worker controls caching and takedowns.
export const IMG_ORIGIN = "https://img.wildock.com";
