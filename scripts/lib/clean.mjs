// Text cleaning shared by import-wikidata.mjs and build-catalogue.mjs.

const ABBREV = /(?:\b(?:St|Mt|Dr|Mr|Mrs|Ms|Ft|No|Jr|Sr|vs|Co|Inc|Ltd|Capt|Gen|Col|Lt|Ste|approx)|\b[A-Z])\.$/;

// Offsets just after each sentence end ([.!?] plus optional closing quote/bracket).
function sentenceEnds(t) {
  const ends = [];
  const re = /[.!?]["”’)]?(?=\s|$)/g;
  let m;
  while ((m = re.exec(t))) {
    const end = m.index + m[0].length;
    if (m[0][0] === "." && ABBREV.test(t.slice(Math.max(0, m.index - 6), m.index + 1))) continue;
    ends.push(end);
  }
  return ends;
}

// Cleans a Wikipedia extract into whole sentences. Returns null if nothing usable is left.
export function cleanDescription(raw, { max = 700, min = 200 } = {}) {
  let t = String(raw ?? "");
  t = t.replace(/\{\{[^{}]*\}\}/g, "").replace(/<[^>]+>/g, "").replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/\[(?:\d+|[a-z]|citation needed|note \d+)\]/gi, "").replace(/^=+\s*.*?\s*=+$/gm, "").replace(/'{2,}/g, "");
  t = t.replace(/(\d)\s*[–—]\s*(\d)/g, "$1-$2").replace(/\s*[—–―]\s*/g, ", ");
  t = t.replace(/\s+/g, " ").replace(/\s+([,.;:!?])/g, "$1").replace(/,(\s*,)+/g, ",").replace(/,\s*([.!?])/g, "$1").trim();
  if (t.length > max) {
    const cut = sentenceEnds(t).filter((e) => e <= max).pop();
    if (!cut) return null;
    t = t.slice(0, cut).trim();
  }
  if (!/[.!?]["”’)]?$/.test(t) || ABBREV.test(t)) {
    const cut = sentenceEnds(t).pop();
    if (!cut) return null;
    t = t.slice(0, cut).trim();
  }
  return t.length >= min ? t : null;
}

export const cleanAuthor = (s) => {
  const t = String(s ?? "").replace(/\s*[—–―]\s*/g, " - ").replace(/\s+/g, " ").trim();
  return !t || /^(unknown( author)?)+$/i.test(t) ? "Unknown author" : t;
};

// CC BY / CC BY-SA need an author credit; CC0 and public domain do not.
export const isPublicDomain = (license) => /^(cc0|public domain|pd\b|pd-)/i.test(String(license ?? "").trim());
export const authorUsable = (author, license) => author !== "Unknown author" || isPublicDomain(license);

// Image file for an entry: QID-keyed in new runs, slug-keyed in the first (legacy) run.
export const imageFileOf = (d) => d.imageFile ?? `${d.slug}.jpg`;

const GENERIC = /^((central|northern|southern|eastern|western|north|south|east|west|greater|inner|outer)\s+)?(district|region|division|subdistrict|municipality|province|county)$|^city proper$/i;
const PREFIXES = [
  /^\d+(st|nd|rd|th) arrondissement of /i,
  /^(arrondissement|delegation|emirate|province|metropolitan city|city|london borough|royal borough|borough|regional municipality|municipality|free municipal consortium|commune|county) of (the district of )?/i,
  /^(county|municipio|município) /i,
];
const SUFFIXES = /\s+(regional district|regional municipality|local municipality|district municipality|rural municipality|metropolitan district|city municipality|urban hromada|county borough|autonomous sector|municipality|subdistrict|governorate|prefecture|department|voivodeship|province|district|county|raion|region|arrondissement|borough|city|division)$/i;
// Larger-than-city units: fine to strip for a state tier, wrong as a settlement.
const NOT_A_CITY = /(county|province|governorate|prefecture|department|voivodeship|region)$|^(province|county|metropolitan city|free municipal consortium)/i;
const RESIDUAL = /\b(division|region|subdistrict|sanctuary|proper|administrativa)\b/i;

// Turns a Wikidata admin label into a plain place name; "" when it is the country or an obvious admin unit.
export function cleanPlace(value, country, { strict = false } = {}) {
  let v = String(value ?? "").replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  if (!v || v === country || GENERIC.test(v) || (strict && NOT_A_CITY.test(v))) return "";
  for (let i = 0; i < 4; i++) {
    const before = v;
    for (const p of PREFIXES) v = v.replace(p, "");
    v = v.replace(SUFFIXES, "").trim();
    if (v === before) break;
  }
  if (!v || v === country || GENERIC.test(v)) return "";
  if (strict && RESIDUAL.test(v)) return "";
  return v;
}
