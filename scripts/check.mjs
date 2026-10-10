// Pre-deploy check, no network and no production: typecheck, then sanity-check src/catalogue.json.
// Usage: node scripts/check.mjs   (npm run check)
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const tsc = spawnSync("npx", ["tsc", "--noEmit"], { stdio: "inherit", shell: process.platform === "win32" });
const rows = JSON.parse(await readFile(new URL("../src/catalogue.json", import.meta.url), "utf8"));
const problems = [];
const seen = new Set();
for (const d of rows) {
  if (seen.has(d.slug)) problems.push(`duplicate slug ${d.slug}`);
  seen.add(d.slug);
  if (d.imageAttribution && !/\|File:/.test(d.imageAttribution)) problems.push(`${d.slug}: photo credit has no Commons file link`);
  if (d.pk === 3 && !d.imageAttribution) problems.push(`${d.slug}: pk 3 without a photo`);
  for (const f of ["description", "ab", "pb"]) if (d[f]?.includes("—")) problems.push(`${d.slug}: em dash in ${f}`);
}
console.log(`catalogue ${rows.length} rows, ${rows.filter((d) => d.imageAttribution).length} with a photo, ${rows.filter((d) => d.pk === 3).length} nearby views, ${problems.length} problems`);
for (const p of problems.slice(0, 30)) console.log("  ", p);
process.exit(tsc.status || problems.length ? 1 : 0);
