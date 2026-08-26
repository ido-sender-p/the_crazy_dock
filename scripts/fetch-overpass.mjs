// Pulls piers/marinas from Overpass API for a fixed pilot region (Greece, Croatia, Italy)
// and writes the raw elements to scripts/data/raw-<country>.json for review before loading.
import { mkdir, writeFile } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const OUT_DIR = new URL("./data/", import.meta.url);

const COUNTRIES = [
  { code: "GR", name: "Greece" },
  { code: "HR", name: "Croatia" },
  { code: "IT", name: "Italy" },
];

function buildQuery(isoCode) {
  return `
    [out:json][timeout:180];
    area["ISO3166-1"="${isoCode}"][admin_level=2]->.a;
    (
      node["man_made"="pier"](area.a);
      way["man_made"="pier"](area.a);
      node["leisure"="marina"](area.a);
      way["leisure"="marina"](area.a);
    );
    out center tags;
  `;
}

async function fetchCountry({ code, name }) {
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: buildQuery(code),
  });
  if (!res.ok) {
    throw new Error(`Overpass request failed for ${name}: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  const elements = json.elements.map((el) => ({
    ...el,
    country: name,
    country_code: code,
  }));
  console.log(`${name}: ${elements.length} elements`);
  return elements;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const country of COUNTRIES) {
    const elements = await fetchCountry(country);
    await writeFile(
      new URL(`raw-${country.code.toLowerCase()}.json`, OUT_DIR),
      JSON.stringify(elements, null, 2),
    );
    // Overpass public instance: be polite, one request at a time with a gap.
    await sleep(5000);
  }
  console.log("Done. Raw data written to scripts/data/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
