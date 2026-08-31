import { secureHeaders } from "hono/secure-headers";

// Every external host the site actually loads a resource from. Kept as an
// explicit allowlist rather than left open, so a future accidental (or
// injected) reference to some other third-party host gets blocked by the
// browser instead of silently working.
//
// style-src/script-src still need 'unsafe-inline': the whole site is built
// on inline <style>/<script> tags per page (no per-request nonce plumbing
// exists), so this CSP's job is narrowing *which hosts* can load, not
// eliminating inline code — that would need a larger templating change.
export const securityHeaders = secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    objectSrc: ["'none'"],
    imgSrc: ["'self'", "data:", "https://upload.wikimedia.org", "https://*.tile.openstreetmap.org"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
    connectSrc: ["'self'", "https://*.tile.openstreetmap.org"],
  },
  crossOriginEmbedderPolicy: false, // would block the Leaflet/OSM tile and font resources above
});
