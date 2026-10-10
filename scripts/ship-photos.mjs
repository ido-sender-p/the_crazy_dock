// One command for the photo chain in README steps 3c to 7, stopping before anything touches production:
//   apply reviewed photos, rebuild the catalogue, rebuild About, make variants, typecheck, then print the R2 plan.
// Usage: node scripts/ship-photos.mjs [--area] slug=File.jpg ...   (omit slugs to skip apply and just rebuild)
// Upload and deploy stay manual: `node scripts/r2-sync.mjs --go`, `node scripts/verify-live.mjs`, then "deploy".
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const node = (script, rest = []) => ["node", [`scripts/${script}`, ...rest]];
const steps = [
  ...(args.some((a) => a !== "--area") ? [["apply-photos", node("apply-photos.mjs", args)]] : []),
  ["catalogue:build", node("build-catalogue.mjs")],
  ["about", node("build-about.mjs")], // the build drops ab/pb/pt, so this must follow it
  ["variants", node("make-variants.mjs")],
  ["typecheck", ["npx", ["tsc", "--noEmit"]]],
  ["r2 plan", node("r2-sync.mjs")],
];
for (const [name, [cmd, a]] of steps) {
  console.log(`\n== ${name}`);
  const r = spawnSync(cmd, a, { stdio: "inherit", shell: process.platform === "win32" && cmd === "npx" });
  if (r.status !== 0 && name !== "r2 plan") { console.log(`stopped: ${name} failed`); process.exit(1); }
}
console.log("\nready. Next, on the owner's go-ahead: node scripts/r2-sync.mjs --go, node scripts/verify-live.mjs, then deploy.");
