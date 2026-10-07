import type { Dock } from "../data";

// URL segment of each kind of settlement page: /cities/:slug, /towns/:slug, /villages/:slug.
export const SETTLEMENT_PATH: Record<Dock["settlementType"], string> = {
  city: "cities",
  town: "towns",
  village: "villages",
};

export const SETTLEMENT_ROUTE_PATHS = (Object.entries(SETTLEMENT_PATH) as [Dock["settlementType"], string][]).map(
  ([type, path]) => ({ path, type }),
);
