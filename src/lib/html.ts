// Embedding JSON.stringify(...) output inside a <script> tag is normally
// fine, except a string value containing "</script" would close the tag
// early and let whatever follows run as raw HTML/script. Escaping "<" to
// its unicode escape keeps the JSON semantically identical (this only ever
// touches characters inside string values — JSON's own syntax never uses
// "<") while making that breakout impossible.
export function safeJsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
