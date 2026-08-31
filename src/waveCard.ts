// Shared "wave button" motif , a card with a small colored wave resting
// under it. Every real sea/ocean/region name gets its own distinct color
// (SEA_COLOR); "family" is only used to decide section order and to detect
// landlocked places (family === "lake").
export type Water =
  | "pacific"
  | "atlantic"
  | "indian"
  | "mediterranean"
  | "caspian"
  | "lake"
  | "melanesia"
  | "micronesia"
  | "polynesia"
  | "australasia";

export const SEA_COLOR: Record<string, string> = {
  "Atlantic Ocean": "#1a7a8c",
  "North Sea": "#2f9e8f",
  "Baltic Sea": "#3f6fae",
  "Caribbean Sea": "#17b5a6",
  "Gulf of Mexico": "#4aa3c9",

  "Pacific Ocean": "#2f6fb0",
  "South China Sea": "#3a8fd1",
  "Sea of Japan": "#5b6fc4",
  "Yellow Sea": "#c9a227",
  "Gulf of Thailand": "#37b0a4",

  "Indian Ocean": "#7c5fb0",
  "Arabian Sea": "#9b6bc9",
  "Bay of Bengal": "#6a4fa0",
  "Andaman Sea": "#5aa39a",
  "Persian Gulf": "#b08a3e",
  "Red Sea": "#c0453f",
  "Gulf of Aden": "#d97b52",

  "Mediterranean Sea": "#c98a2b",
  "Black Sea": "#4a4a5a",

  "Caspian Sea": "#8a4fa3",

  Landlocked: "#8c7a5b",

  Melanesia: "#17a094",
  Micronesia: "#2f6fb0",
  Polynesia: "#7c5fb0",
  Australasia: "#c98a2b",
};

// Fallback family color, only used if a sea name isn't in SEA_COLOR yet.
export const WATER_COLOR: Record<Water, string> = {
  pacific: "#2f6fb0",
  atlantic: "#17a094",
  indian: "#7c5fb0",
  mediterranean: "#c98a2b",
  caspian: "#8a4fa3",
  lake: "#8c7a5b",
  melanesia: "#17a094",
  micronesia: "#2f6fb0",
  polynesia: "#7c5fb0",
  australasia: "#c98a2b",
};

export function seaColor(sea: string): string {
  return SEA_COLOR[sea] ?? WATER_COLOR.atlantic;
}

export function waveUrl(hex: string) {
  const fill = hex.replace("#", "%23");
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 14'%3E%3Cpath d='M0,7 C5,1 15,13 20,7 C25,1 35,13 40,7 L40,14 L0,14 Z' fill='${fill}'/%3E%3C/svg%3E")`;
}
