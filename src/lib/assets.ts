// Content-addressed static assets: every stylesheet and script is served from /assets/<name>.<hash>.<ext>
// with a one-year immutable cache, so the HTML stays small and repeat views fetch nothing.
import { SITE_CSS, HERO_CSS, PAGE_STYLES, type PageName } from "../styles";
import { CLIENT_SCRIPTS, type ClientScriptName } from "../client";
import { markersJson } from "./markers";

// FNV-1a: a fast, dependency-free cache-busting hash (not for security).
function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

type Asset = { body: string; type: string; etag: string };
const files = new Map<string, Asset>();

const TYPES = { css: "text/css; charset=utf-8", js: "text/javascript; charset=utf-8", json: "application/json; charset=utf-8" } as const;

function register(name: string, ext: keyof typeof TYPES, body: string): string {
  const etag = hash(body);
  const file = `${name}.${etag}.${ext}`;
  files.set(file, { body, type: TYPES[ext], etag });
  return `/assets/${file}`;
}

export const siteCssUrl = register("site", "css", SITE_CSS);
export const heroCssUrl = register("hero", "css", HERO_CSS);
export const markersUrl = register("markers", "json", markersJson);
const pageCssUrls = Object.fromEntries(
  Object.entries(PAGE_STYLES).map(([n, css]) => [n, register(`page-${n}`, "css", css)]),
) as Record<PageName, string>;
const scriptUrls = Object.fromEntries(
  Object.entries(CLIENT_SCRIPTS).map(([n, js]) => [n, register(n, "js", js)]),
) as Record<ClientScriptName, string>;

export const pageCssUrl = (name: PageName) => pageCssUrls[name];
export const scriptUrl = (name: ClientScriptName) => scriptUrls[name];
export const findAsset = (file: string) => files.get(file);

// Changes whenever any stylesheet or script changes. Cached HTML links to hashed asset URLs, so the
// edge cache keys on this: after a deploy, HTML cached against the old files is never served.
export const assetVersion = hash([...files.keys()].sort().join());
