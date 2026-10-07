import { secureHeaders } from "hono/secure-headers";

// Every external host the site actually loads a resource from. Kept as an
// explicit allowlist rather than left open, so a future accidental (or
// injected) reference to some other third-party host gets blocked by the
// browser instead of silently working.
//
// Strict: no 'unsafe-inline' for scripts or styles. Every stylesheet and script is an external,
// content-hashed file served by this Worker (/assets, see lib/assets.ts), and pages pass data to
// their scripts as <script type="application/json"> blocks, which the browser never executes.
// So an injected <script>, inline handler or style attribute is blocked instead of running.
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
    styleSrc: ["'self'", "https://fonts.googleapis.com", LEAFLET_CDN],
    scriptSrc: ["'self'", LEAFLET_CDN],
    connectSrc: ["'self'"],
  },
  // Hono defaults to "no-referrer", but OSM's tile servers reject requests with
  // no Referer (403). Origin-only on cross-origin keeps paths private.
  referrerPolicy: "strict-origin-when-cross-origin",
  crossOriginEmbedderPolicy: false, // would block the Leaflet/OSM tile and font resources above
});
