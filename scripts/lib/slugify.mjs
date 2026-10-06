// Keep in sync with slugify() in src/data.ts (routes slugify country names with it).
export const slugify = (s) =>
  s.toLowerCase().replace(/ı/g, "i").replace(/ł/g, "l").replace(/ø/g, "o").replace(/đ/g, "d").replace(/ß/g, "ss").replace(/æ/g, "ae").replace(/œ/g, "oe")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
