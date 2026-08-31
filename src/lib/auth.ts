// Password hashing via Web Crypto (no deps, works identically in Workers and
// in a plain Node script used to seed the local DB). Never store plaintext.

const PBKDF2_ITERATIONS = 100_000;

function toHex(bytes: Uint8Array) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

async function deriveBits(password: string, salt: Uint8Array, iterations: number) {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, keyMaterial, 256);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveBits(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  const salt = fromHex(parts[2]);
  const expected = fromHex(parts[3]);
  const actual = await deriveBits(password, salt, iterations);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

export function newSessionToken(): string {
  return crypto.randomUUID();
}

// A syntactically valid but unreachable hash, same iteration count as a
// real one. Verifying against this when an email doesn't exist keeps login
// response time the same either way. Otherwise "wrong password" (runs a
// full PBKDF2 derivation) is measurably slower than "no such account"
// (returns immediately), letting an attacker enumerate registered emails.
export const DUMMY_PASSWORD_HASH = `pbkdf2$${PBKDF2_ITERATIONS}$${"00".repeat(16)}$${"00".repeat(32)}`;
