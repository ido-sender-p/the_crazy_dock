// Finds the photos production R2 is missing and (only with --go) uploads them, three at a time.
// Usage: node scripts/r2-sync.mjs          plan only: how many writes, how many MB, share of the free-tier write budget
//        node scripts/r2-sync.mjs --go     upload (owner's say-so only, see README "Upload to production R2")
// The upload token is CLOUDFLARE_R2 from .env (git-ignored); it is passed to wrangler and never printed.
import { readFile, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { wantedKeys, notLive, LIVE, localFileExists } from "./lib/r2keys.mjs";

const GO = process.argv.includes("--go");
const missing = await notLive(await wantedKeys(), (k) => LIVE + k.key);
const noFile = missing.filter((m) => !localFileExists(m.file));
const todo = missing.filter((m) => localFileExists(m.file));
let bytes = 0;
for (const m of todo) bytes += (await stat(m.file)).size;
console.log(`${missing.length} keys missing live, ${todo.length} uploadable (${(bytes / 1048576).toFixed(1)} MB, ${(todo.length / 10000).toFixed(2)}% of the 1M monthly Class A writes), ${noFile.length} without a local file`);
for (const m of noFile) console.log("  no local file:", m.key);
if (!GO || !todo.length) { if (todo.length) console.log("plan only. Re-run with --go to upload."); process.exit(noFile.length ? 1 : 0); }

const env = await readFile(new URL("../.env", import.meta.url), "utf8").catch(() => "");
const token = env.match(/^CLOUDFLARE_R2=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
if (!token) { console.log("CLOUDFLARE_R2 missing in .env"); process.exit(1); }
const put = (m) => new Promise((done) => {
  const p = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["wrangler", "r2", "object", "put", `wildock-photos/${m.key}`, `--file=${m.file}`, `--content-type=${m.type}`, "--remote"], { env: { ...process.env, CLOUDFLARE_API_TOKEN: token }, shell: process.platform === "win32" });
  let out = "";
  p.stdout.on("data", (d) => (out += d));
  p.stderr.on("data", (d) => (out += d));
  p.on("close", (code) => done(code ? { key: m.key, out: out.slice(-160) } : null));
});
const failed = [];
let i = 0;
await Promise.all([0, 1, 2].map(async () => { while (i < todo.length) { const f = await put(todo[i++]); if (f) failed.push(f); } }));
console.log(`uploaded ${todo.length - failed.length} of ${todo.length}`);
for (const f of failed) console.log("  failed:", f.key, f.out.replace(/\s+/g, " "));
process.exit(failed.length ? 1 : 0);
