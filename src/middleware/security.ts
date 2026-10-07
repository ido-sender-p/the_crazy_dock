import { secureHeaders } from "hono/secure-headers";

// Every external host the site actually loads a resource from. Kept as an
// explicit allowlist rather than left open, so a future accidental (or
// injected) reference to some other third-party host gets blocked by the
// browser instead of silently working.
//
// style-src/script-src still need 'unsafe-inline': the whole site is built
// on inline <style>/<script> tags per page (no per-request nonce plumbing
// exists), so this CSP's job is narrowing *which hosts* can load, not
// eliminating inline code, which would need a larger templating change.
const LEAFLET_CDN = "https://unpkg.com/leaflet@1.9.4/dist/";

export const securityHeaders = secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    objectSrc: ["'none'"],
    imgSrc: ["'self'", "data:", "blob:", "https://upload.wikimedia.org", "https://*.tile.openstreetmap.org"], // blob: for the avatar and photo previews
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", LEAFLET_CDN],
    scriptSrc: ["'self'", "'unsafe-inline'", LEAFLET_CDN],
    connectSrc: ["'self'"],
  },
  // Hono defaults to "no-referrer", but OSM's tile servers reject requests with
  // no Referer (403). Origin-only on cross-origin keeps paths private.
  referrerPolicy: "strict-origin-when-cross-origin",
  crossOriginEmbedderPolicy: false, // would block the Leaflet/OSM tile and font resources above
});
