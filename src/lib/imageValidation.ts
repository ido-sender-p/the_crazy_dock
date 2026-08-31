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

export type ImageOrientation = "portrait" | "landscape";

function readUInt16BE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}
function readUInt32BE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
}

// Walks JPEG markers to find the SOF (start-of-frame) segment, which carries
// the real pixel dimensions — width/height aren't in a fixed offset like
// PNG/GIF, so this can't be a simple byte read.
function jpegDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = bytes[i + 1];
    const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      return { height: readUInt16BE(bytes, i + 5), width: readUInt16BE(bytes, i + 7) };
    }
    const segmentLength = readUInt16BE(bytes, i + 2);
    if (segmentLength < 2) break;
    i += 2 + segmentLength;
  }
  return null;
}

function pngDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 24) return null;
  return { width: readUInt32BE(bytes, 16), height: readUInt32BE(bytes, 20) };
}

function gifDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 10) return null;
  return { width: bytes[6] | (bytes[7] << 8), height: bytes[8] | (bytes[9] << 8) };
}

// WEBP dimensions live in one of several sub-chunk formats (VP8/VP8L/VP8X)
// with bit-packed fields — not worth parsing for a "portrait vs landscape"
// layout hint, so WEBP uploads just fall back to the landscape layout.
export function detectImageOrientation(bytes: Uint8Array, mimeType: string): ImageOrientation | null {
  const dims =
    mimeType === "image/jpeg"
      ? jpegDimensions(bytes)
      : mimeType === "image/png"
        ? pngDimensions(bytes)
        : mimeType === "image/gif"
          ? gifDimensions(bytes)
          : null;
  if (!dims || !dims.width || !dims.height) return null;
  return dims.height > dims.width ? "portrait" : "landscape";
}
