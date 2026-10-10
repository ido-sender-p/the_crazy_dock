// Which docks the photo finders look at: published docks without a photo, or with `--withheld=<State>` the docks of that
// state that are in docks.json but held back from the catalogue (no photo and no facts yet). A photo lets them be published.
import { readFile } from "node:fs/promises";

export async function photoTargets() {
  const flag = process.argv.find((a) => a.startsWith("--withheld="));
  const catalogue = JSON.parse(await readFile(new URL("../../src/catalogue.json", import.meta.url), "utf8"));
  if (!flag) return catalogue.filter((d) => !d.imageAttribution);
  const state = flag.slice("--withheld=".length);
  const published = new Set(catalogue.map((d) => d.slug));
  const all = JSON.parse(await readFile(new URL("../data/docks.json", import.meta.url), "utf8"));
  return all.filter((d) => d.stateProvince === state && !published.has(d.slug) && !d.imageAttribution);
}
