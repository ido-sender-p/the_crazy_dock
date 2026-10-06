// Photo credits are stored as "Photo: Author, LICENCE, via Wikimedia Commons|<file page url>".
// CC BY / BY-SA require the author, a link to the licence and a note of changes, so the
// pieces are parsed back out to render real links (also used by the /credits page).

export type PhotoCredit = { author: string; license: string; licenseUrl: string | null; sourceUrl: string | null };

const CC_LICENSE = /^CC (BY|BY-SA) (\d\.\d)(?: ([a-z]{2,3}))?$/i;

export function licenseUrl(name: string): string | null {
  if (/^CC0/i.test(name)) return "https://creativecommons.org/publicdomain/zero/1.0/";
  const m = CC_LICENSE.exec(name.trim());
  if (!m) return null;
  return `https://creativecommons.org/licenses/${m[1].toLowerCase()}/${m[2]}/${m[3] ? m[3].toLowerCase() + "/" : ""}`;
}

export function parsePhotoCredit(value: string): PhotoCredit | null {
  const [text, url] = value.split("|");
  const m = /^Photo: (.+), (CC0|CC BY(?:-SA)? [\d.]+(?: [a-z]{2,3})?|Public domain), via Wikimedia Commons$/i.exec(text.trim());
  if (!m) return null;
  return {
    author: m[1],
    license: m[2],
    licenseUrl: licenseUrl(m[2]),
    sourceUrl: url && /^https?:\/\//i.test(url.trim()) ? url.trim() : null,
  };
}

export const WIKIPEDIA_LICENSE = { name: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" };
