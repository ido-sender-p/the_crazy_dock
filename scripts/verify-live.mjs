// README "before deploying": every R2 key the catalogue needs answers 200 on img.wildock.com, and a sample of the
// Cloudflare Images URLs (rows with `tx`) transforms. Reads only the CDN, never the Worker. Exit 1 on any failure.
// Usage: node scripts/verify-live.mjs [--sample N]
import { wantedKeys, notLive, LIVE } from "./lib/r2keys.mjs";

const at = process.argv.indexOf("--sample");
const SAMPLE = at > 0 ? Number(process.argv[at + 1]) : 12;
const keys = await wantedKeys();
const badKeys = await notLive(keys, (k) => LIVE + k.key);
const tx = keys.filter((k) => k.tx);
const picked = Array.from({ length: Math.min(SAMPLE, tx.length) }, (_, n) => tx[Math.floor((n * tx.length) / Math.min(SAMPLE, tx.length))]);
const badTx = await notLive(picked, (k) => `${LIVE}cdn-cgi/image/width=640,quality=80,format=auto/${k.key}`);
console.log(`keys ${keys.length}, not 200: ${badKeys.length} | transforms sampled ${picked.length}, not 200: ${badTx.length}`);
for (const b of [...badKeys, ...badTx]) console.log("  ", b.status, b.key);
process.exit(badKeys.length + badTx.length ? 1 : 0);
