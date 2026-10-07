// Removes personal metadata (GPS position, camera model and serial number, author, timestamps, thumbnails, free
// text, appended data) from an uploaded image before it is stored and served to everyone.
//
// The one thing that is kept is the EXIF orientation: phones store portrait shots as sideways pixels plus an
// orientation tag, and browsers use it to display them upright. Dropping it would turn those photos on their
// side, so a minimal EXIF block holding only that tag is written back.
//
// Works on the raw bytes (no image library fits the Worker CPU limit). Returns null for a file whose structure
// cannot be walked cleanly; the caller rejects it instead of storing something that may still carry metadata.

const u16 = (b: Uint8Array, o: number) => (b[o] << 8) | b[o + 1];

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

// EXIF orientation (1-8) from a TIFF block starting at `start`; 1 (upright) when absent or unreadable.
function tiffOrientation(b: Uint8Array, start: number): number {
  if (start + 8 > b.length) return 1;
  const little = b[start] === 0x49 && b[start + 1] === 0x49;
  if (!little && !(b[start] === 0x4d && b[start + 1] === 0x4d)) return 1;
  const r16 = (o: number) => (little ? b[o] | (b[o + 1] << 8) : (b[o] << 8) | b[o + 1]);
  const r32 = (o: number) => (little ? (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0 : ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0);
  if (r16(start + 2) !== 42) return 1;
  const ifd = start + r32(start + 4);
  if (ifd + 2 > b.length) return 1;
  const count = r16(ifd);
  for (let n = 0; n < count; n++) {
    const e = ifd + 2 + n * 12;
    if (e + 12 > b.length) return 1;
    if (r16(e) === 0x0112) {
      const v = r16(e + 8);
      return v >= 1 && v <= 8 ? v : 1;
    }
  }
  return 1;
}

// Big-endian TIFF block with a single IFD entry: Orientation = `o`.
function orientationTiff(o: number): Uint8Array {
  return Uint8Array.from([0x4d, 0x4d, 0, 0x2a, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, o, 0, 0, 0, 0, 0, 0]);
}

const EXIF_HEADER = [0x45, 0x78, 0x69, 0x66, 0, 0]; // "Exif\0\0"

function orientationApp1(o: number): Uint8Array {
  const tiff = orientationTiff(o);
  const len = 2 + EXIF_HEADER.length + tiff.length;
  return concat([Uint8Array.from([0xff, 0xe1, len >> 8, len & 0xff, ...EXIF_HEADER]), tiff]);
}

function stripJpeg(b: Uint8Array): Uint8Array | null {
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  const out: Uint8Array[] = [b.subarray(0, 2)];
  let insertAt = 1; // where the orientation block goes: after SOI, or after a leading JFIF segment
  let orientation = 1;
  let i = 2;
  while (i + 1 < b.length) {
    if (b[i] !== 0xff) return null;
    while (i + 1 < b.length && b[i + 1] === 0xff) i++; // fill bytes
    if (i + 1 >= b.length) return null;
    const m = b[i + 1];
    if (m === 0xd9) {
      out.push(b.subarray(i, i + 2)); // EOI: anything after it is dropped
      if (orientation > 1) out.splice(insertAt, 0, orientationApp1(orientation));
      return concat(out);
    }
    if (m === 0x01 || m === 0xd8 || (m >= 0xd0 && m <= 0xd7)) {
      out.push(b.subarray(i, i + 2));
      i += 2;
      continue;
    }
    if (i + 3 >= b.length) return null;
    const len = u16(b, i + 2);
    if (len < 2 || i + 2 + len > b.length) return null;
    const seg = b.subarray(i, i + 2 + len);
    if (m === 0xe1 && orientation === 1 && len >= 8 && EXIF_HEADER.every((x, k) => seg[4 + k] === x)) orientation = tiffOrientation(seg, 10);
    // Dropped: EXIF/XMP (E1), other application data (E3-ED, EF), comments (FE). Kept: JFIF (E0), ICC colour profile (E2), Adobe colour flag (EE).
    const drop = m === 0xe1 || (m >= 0xe3 && m <= 0xed) || m === 0xef || m === 0xfe;
    if (!drop) {
      out.push(seg);
      if (m === 0xe0 && out.length === 2) insertAt = 2;
    }
    i += 2 + len;
    if (m === 0xda) {
      const start = i; // entropy-coded data up to the next real marker
      while (i + 1 < b.length && !(b[i] === 0xff && b[i + 1] !== 0x00 && b[i + 1] !== 0xff && !(b[i + 1] >= 0xd0 && b[i + 1] <= 0xd7))) i++;
      if (i + 1 >= b.length) return null;
      out.push(b.subarray(start, i));
    }
  }
  return null;
}

const PNG_DROP = new Set(["tEXt", "zTXt", "iTXt", "eXIf", "tIME"]);

function stripPng(b: Uint8Array): Uint8Array | null {
  const out: Uint8Array[] = [b.subarray(0, 8)];
  let i = 8;
  while (i + 12 <= b.length) {
    const len = ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
    const end = i + 12 + len;
    if (end > b.length) return null;
    const type = String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7]);
    if (!PNG_DROP.has(type)) out.push(b.subarray(i, end));
    i = end;
    if (type === "IEND") return concat(out); // anything after IEND is dropped
  }
  return null;
}

function gifSubBlocks(b: Uint8Array, i: number): number {
  while (i < b.length && b[i] !== 0) i += b[i] + 1;
  return i + 1; // past the 0 terminator
}

function stripGif(b: Uint8Array): Uint8Array | null {
  if (b.length < 13) return null;
  let i = 13 + (b[10] & 0x80 ? 3 * 2 ** ((b[10] & 7) + 1) : 0);
  const out: Uint8Array[] = [b.subarray(0, i)];
  while (i < b.length) {
    const t = b[i];
    if (t === 0x3b) {
      out.push(b.subarray(i, i + 1)); // trailer: anything after it is dropped
      return concat(out);
    }
    if (t === 0x21) {
      const label = b[i + 1];
      const end = gifSubBlocks(b, i + 2);
      if (end > b.length) return null;
      let keep = label === 0xf9; // graphic control (frame timing)
      if (label === 0xff) {
        const id = String.fromCharCode(...b.subarray(i + 3, i + 3 + 11));
        keep = id === "NETSCAPE2.0" || id === "ANIMEXTS1.0"; // loop count; other application blocks (e.g. XMP) go
      }
      if (keep) out.push(b.subarray(i, end));
      i = end;
    } else if (t === 0x2c) {
      if (i + 10 > b.length) return null;
      const lct = b[i + 9] & 0x80 ? 3 * 2 ** ((b[i + 9] & 7) + 1) : 0;
      const end = gifSubBlocks(b, i + 10 + lct + 1);
      if (end > b.length) return null;
      out.push(b.subarray(i, end));
      i = end;
    } else return null;
  }
  return null;
}

function stripWebp(b: Uint8Array): Uint8Array | null {
  const limit = Math.min(b.length, 8 + ((b[4] | (b[5] << 8) | (b[6] << 16) | (b[7] << 24)) >>> 0)); // bytes past the RIFF size are dropped
  const out: Uint8Array[] = [];
  let i = 12;
  let vp8x = -1;
  let hasExif = false;
  let orientation = 1;
  while (i + 8 <= limit) {
    const size = (b[i + 4] | (b[i + 5] << 8) | (b[i + 6] << 16) | (b[i + 7] << 24)) >>> 0;
    const end = i + 8 + size + (size & 1);
    if (end > limit) return null;
    const chunk = b.subarray(i, end);
    const id = String.fromCharCode(b[i], b[i + 1], b[i + 2], b[i + 3]);
    if (id === "EXIF") {
      const data = i + 8;
      const hdr = EXIF_HEADER.every((x, k) => b[data + k] === x) ? 6 : 0;
      orientation = tiffOrientation(b, data + hdr);
      hasExif = orientation > 1;
      if (hasExif) {
        const tiff = orientationTiff(orientation);
        out.push(Uint8Array.from([0x45, 0x58, 0x49, 0x46, tiff.length, 0, 0, 0]), tiff);
      }
    } else if (id !== "XMP ") {
      if (id === "VP8X") vp8x = out.length;
      out.push(chunk);
    }
    i = end;
  }
  if (vp8x >= 0) {
    const fixed = out[vp8x].slice();
    fixed[8] = (fixed[8] & ~0x04 & ~0x08) | (hasExif ? 0x08 : 0); // flags: no XMP, EXIF only if re-added
    out[vp8x] = fixed;
  }
  const body = concat(out);
  const head = Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
  const riff = body.length + 4;
  head[4] = riff & 0xff;
  head[5] = (riff >> 8) & 0xff;
  head[6] = (riff >> 16) & 0xff;
  head[7] = (riff >>> 24) & 0xff;
  return concat([head, body]);
}

export function stripImageMetadata(bytes: Uint8Array, mimeType: string): Uint8Array | null {
  try {
    switch (mimeType) {
      case "image/jpeg": return stripJpeg(bytes);
      case "image/png": return stripPng(bytes);
      case "image/gif": return stripGif(bytes);
      case "image/webp": return stripWebp(bytes);
      default: return null;
    }
  } catch {
    return null;
  }
}
