import { secureHeaders, NONCE } from "hono/secure-headers";
import { IMG_ORIGIN } from "../lib/site";

// Every external host the site actually loads a resource from. Kept as an
// explicit allowlist rather than left open, so a future accidental (or
// injected) reference to some other third-party host gets blocked by the
// browser instead of silently working.
//
// Strict: no 'unsafe-inline' for scripts or styles. Every stylesheet and script is an external,
// content-hashed file served by this Worker (/assets, see lib/assets.ts), and pages pass data to
// their scripts as <script type="application/json"> blocks, which the browser never executes.
// So an injected <script>, inline handler or style attribute is blocked instead of running.
//
// NONCE: a fresh random nonce per response. No page script uses it. It exists so Cloudflare's own injected inline
// script (JavaScript Detections for bot management) can run: Cloudflare reads the nonce from this header and adds it
// to that script. An attacker cannot guess it, so injected scripts stay blocked.
const LEAFLET_CDN = "https://unpkg.com/leaflet@1.9.4/dist/";

export const securityHeaders = secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    objectSrc: ["'none'"],
    imgSrc: ["'self'", "data:", "blob:", "https://upload.wikimedia.org", IMG_ORIGIN, "https://*.tile.openstreetmap.org"], // blob: for the avatar and photo previews
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    styleSrc: ["'self'", "https://fonts.googleapis.com", LEAFLET_CDN],
    scriptSrc: ["'self'", LEAFLET_CDN, "https://static.cloudflareinsights.com", NONCE], // static.cloudflareinsights.com: Cloudflare Web Analytics beacon
    connectSrc: ["'self'", "https://cloudflareinsights.com"],
  },
  // Hono defaults to "no-referrer", but OSM's tile servers reject requests with
  // no Referer (403). Origin-only on cross-origin keeps paths private.
  referrerPolicy: "strict-origin-when-cross-origin",
  // The site never needs these browser features, so switch them off.
  permissionsPolicy: { camera: [], microphone: [], geolocation: [], payment: [], usb: [] },
  crossOriginEmbedderPolicy: false, // would block the Leaflet/OSM tile and font resources above
});
