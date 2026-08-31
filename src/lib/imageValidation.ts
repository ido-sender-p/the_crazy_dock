// Never trust a browser-supplied File.type — it's just whatever the client
// claims and is trivial to spoof (e.g. an .svg or .html file renamed with a
// .jpg extension and a forged Content-Type, then served back to every
// visitor). Sniff the real file signature instead and only accept known
// raster image formats; the detected type is what gets stored and served,
// never the client's claim.

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8 MB

const SIGNATURES: { type: string; bytes: (number | null)[] }[] = [
  { type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { type: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { type: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  // WEBP: "RIFF" .... "WEBP" — bytes 4-7 are a length field, so skip them.
  { type: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50] },
];

export function detectImageType(bytes: Uint8Array): string | null {
  for (const sig of SIGNATURES) {
    if (bytes.length < sig.bytes.length) continue;
    const matches = sig.bytes.every((b, i) => b === null || bytes[i] === b);
    if (matches) return sig.type;
  }
  return null;
}
