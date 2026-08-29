import type { Water } from "./waveCard";

// Shared continent map data — the same loose, illustrative shapes power both
// the homepage "By continent" world map and each continent's own zoomed page.
// Coordinates live on one shared 1000x460 canvas (see WORLD_MAP_VIEWBOX) so a
// continent page can crop to just that continent's bounding box and reuse the
// exact same path, just shown larger.

export const WORLD_MAP_VIEWBOX = "0 0 1000 460";

export type ContinentShape = {
  d: string;
  cx: number;
  cy: number;
  bbox: { minX: number; minY: number; maxX: number; maxY: number };
};

export const CONTINENT_SHAPES: Record<string, ContinentShape> = {
  europe: {
    d: "M530.5,151.7 L507.8,140.4 L457,156.1 L506.4,106.2 L567.7,97.3 L543.2,95.4 L546.6,80.6 L523,109.9 L498.8,100.8 L534.3,70.6 L597.7,75.6 L572.2,77.1 L587.6,86.5 L667.9,75.5 L642.9,105.8 L654.6,122.7 L614.2,125.3 L617,149.4 L571.9,132.6 L546.1,162.8 L517.7,137.5 L530.5,151.7 Z",
    cx: 562.5,
    cy: 116.7,
    bbox: { minX: 457, minY: 70.6, maxX: 667.9, maxY: 162.8 },
  },
  asia: {
    d: "M642.8,191.8 L617.1,180.6 L650.2,202.1 L604.6,228.9 L584.3,161.7 L556.3,152.9 L654.6,122.7 L676.6,61 L684.1,79.7 L773.4,47.6 L985,72 L920,122.5 L945,90.2 L860.2,111.2 L877.5,119.6 L843.6,166.2 L811.7,155.1 L816.8,193.6 L780.6,205.7 L776.4,240.2 L762,227.2 L773.8,260.5 L736.2,198.6 L699.5,241.7 L686.6,202.2 L642.8,191.8 Z",
    cx: 770.7,
    cy: 154.1,
    bbox: { minX: 556.3, minY: 47.6, maxX: 985, maxY: 260.5 },
  },
  africa: {
    d: "M485.4,248.1 L460.5,251.5 L434.6,223.1 L439.1,198 L468.3,164.2 L510.9,160.2 L512.1,170.2 L536.3,179.9 L544,172.4 L578.8,177 L578.9,187 L573.6,181.8 L602,232.2 L626.3,231.3 L617.2,251.6 L592.7,277.2 L597.3,305.3 L579.9,318.9 L582.3,331.6 L561.2,356.3 L539.2,361.3 L516.3,314.4 L522.1,294.8 L520.2,280.5 L507.7,266 L510.6,253.5 L494.1,245.8 L485.4,248.1 Z",
    cx: 530.5,
    cy: 260.8,
    bbox: { minX: 434.6, minY: 160.2, maxX: 626.3, maxY: 361.3 },
  },
  "north-america": {
    d: "M311.6,106.7 L328.3,119.1 L285.5,129.3 L313.6,138.1 L268.7,155.8 L259.5,194.1 L243.1,179.3 L211.1,187.7 L216.5,212 L241.5,204.5 L258.2,244.1 L191,210.4 L163,175.2 L171.2,195.3 L110.7,101.2 L66.5,92.9 L28.3,111.5 L46.6,99.4 L15,81.3 L47.1,65.4 L216.7,78.6 L220.1,63.6 L256.8,71.5 L219.3,98.1 L257.8,122 L267.5,89.9 L311.6,106.7 Z",
    cx: 171.7,
    cy: 153.9,
    bbox: { minX: 15, minY: 63.6, maxX: 328.3, maxY: 244.1 },
  },
  "south-america": {
    d: "M372.9,315.3 L366.3,328.1 L347.7,335.1 L332.6,360.8 L321.3,354.6 L325.5,367.1 L302,378 L306.3,383 L295.2,392.4 L300.2,397.9 L292.9,410 L279.2,412.4 L272.5,394.4 L281.1,388.1 L288.1,319.9 L257.3,281.2 L267.9,240.1 L283.8,229.5 L283.9,239 L288.4,230.2 L311.1,234.3 L324,248.9 L340.6,252.7 L344.4,261 L336.6,268.7 L351.7,265.9 L384.6,278.6 L372.9,315.3 Z",
    cx: 321,
    cy: 321,
    bbox: { minX: 257.3, minY: 229.5, maxX: 384.6, maxY: 412.4 },
  },
  oceania: {
    d: "M905.7,331.2 L910.3,336.5 L909.6,351.6 L901.3,368.8 L891.4,373.3 L887.3,369.7 L883.4,372.5 L875,370.1 L868.2,359.3 L864.8,362.6 L867.3,354.9 L862.3,361.8 L857.3,354.7 L848.9,351.9 L806.6,361.2 L798.9,337.3 L801.7,337.5 L801.2,325.1 L820.7,318.8 L834.6,303 L844.9,306.5 L847.3,298.8 L853.3,298 L851.2,295.2 L864,297.5 L860.9,305.8 L873.9,313.6 L880.8,294.2 L891,316.9 L905.7,331.2 Z",
    cx: 854.6,
    cy: 333.8,
    bbox: { minX: 798.9, minY: 294.2, maxX: 910.3, maxY: 373.3 },
  },
};

// Not geographically precise — a systematic, illustrative country list per
// continent so every continent page can show names without needing exact
// per-country coordinates.
export const countriesByContinent: Record<string, string[]> = {
  europe: [
    "Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina",
    "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland",
    "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy",
    "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta",
    "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway",
    "Poland", "Portugal", "Romania", "San Marino", "Serbia", "Slovakia",
    "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom",
    "Vatican City",
  ],
  asia: [
    "Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan",
    "Brunei", "Cambodia", "China", "Georgia", "India", "Indonesia", "Iran",
    "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan",
    "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal",
    "North Korea", "Oman", "Pakistan", "Palestine", "Philippines", "Qatar",
    "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka", "Syria", "Taiwan",
    "Tajikistan", "Thailand", "Timor-Leste", "Turkey", "Turkmenistan",
    "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen",
  ],
  africa: [
    "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi",
    "Cabo Verde", "Cameroon", "Central African Republic", "Chad", "Comoros",
    "Congo", "DR Congo", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea",
    "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea",
    "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya",
    "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco",
    "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda",
    "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone",
    "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo",
    "Tunisia", "Uganda", "Zambia", "Zimbabwe",
  ],
  "north-america": [
    "Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Canada",
    "Costa Rica", "Cuba", "Dominica", "Dominican Republic", "El Salvador",
    "Grenada", "Guatemala", "Haiti", "Honduras", "Jamaica", "Mexico",
    "Nicaragua", "Panama", "Saint Kitts and Nevis", "Saint Lucia",
    "Saint Vincent and the Grenadines", "Trinidad and Tobago",
    "United States",
  ],
  "south-america": [
    "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador",
    "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela",
  ],
  oceania: [
    "Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia",
    "Nauru", "New Zealand", "Palau", "Papua New Guinea", "Samoa",
    "Solomon Islands", "Tonga", "Tuvalu", "Vanuatu",
  ],
};

// Each country carries the real, proper name(s) of the sea(s)/ocean(s) it
// actually touches — most touch one, some genuinely touch two or three (e.g.
// Germany: North Sea + Baltic Sea; Mexico: Pacific Ocean + Gulf of Mexico +
// Caribbean Sea). "family" just drives the color/grouping, the "sea" string
// is what's shown. Oceania uses sub-regions instead (nothing there is a
// meaningfully different sea — everything is the Pacific).
export type SeaEntry = { sea: string; family: Water };
export const oceanByCountry: Record<string, SeaEntry[]> = {
  // North America
  "Antigua and Barbuda": [{ sea: "Caribbean Sea", family: "atlantic" }],
  Bahamas: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Barbados: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Belize: [{ sea: "Caribbean Sea", family: "atlantic" }],
  Canada: [
    { sea: "Pacific Ocean", family: "pacific" },
    { sea: "Atlantic Ocean", family: "atlantic" },
  ],
  "Costa Rica": [
    { sea: "Pacific Ocean", family: "pacific" },
    { sea: "Caribbean Sea", family: "atlantic" },
  ],
  Cuba: [{ sea: "Caribbean Sea", family: "atlantic" }],
  Dominica: [{ sea: "Caribbean Sea", family: "atlantic" }],
  "Dominican Republic": [
    { sea: "Caribbean Sea", family: "atlantic" },
    { sea: "Atlantic Ocean", family: "atlantic" },
  ],
  "El Salvador": [{ sea: "Pacific Ocean", family: "pacific" }],
  Grenada: [{ sea: "Caribbean Sea", family: "atlantic" }],
  Guatemala: [
    { sea: "Pacific Ocean", family: "pacific" },
    { sea: "Caribbean Sea", family: "atlantic" },
  ],
  Haiti: [
    { sea: "Caribbean Sea", family: "atlantic" },
    { sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Honduras: [
    { sea: "Caribbean Sea", family: "atlantic" },
    { sea: "Pacific Ocean", family: "pacific" },
  ],
  Jamaica: [{ sea: "Caribbean Sea", family: "atlantic" }],
  Mexico: [
    { sea: "Pacific Ocean", family: "pacific" },
    { sea: "Gulf of Mexico", family: "atlantic" },
    { sea: "Caribbean Sea", family: "atlantic" },
  ],
  Nicaragua: [
    { sea: "Caribbean Sea", family: "atlantic" },
    { sea: "Pacific Ocean", family: "pacific" },
  ],
  Panama: [
    { sea: "Pacific Ocean", family: "pacific" },
    { sea: "Caribbean Sea", family: "atlantic" },
  ],
  "Saint Kitts and Nevis": [{ sea: "Caribbean Sea", family: "atlantic" }],
  "Saint Lucia": [{ sea: "Caribbean Sea", family: "atlantic" }],
  "Saint Vincent and the Grenadines": [{ sea: "Caribbean Sea", family: "atlantic" }],
  "Trinidad and Tobago": [
    { sea: "Caribbean Sea", family: "atlantic" },
    { sea: "Atlantic Ocean", family: "atlantic" },
  ],
  "United States": [
    { sea: "Pacific Ocean", family: "pacific" },
    { sea: "Atlantic Ocean", family: "atlantic" },
    { sea: "Gulf of Mexico", family: "atlantic" },
  ],

  // South America
  Argentina: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Bolivia: [{ sea: "Landlocked", family: "lake" }],
  Brazil: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Chile: [{ sea: "Pacific Ocean", family: "pacific" }],
  Colombia: [
    { sea: "Pacific Ocean", family: "pacific" },
    { sea: "Caribbean Sea", family: "atlantic" },
  ],
  Ecuador: [{ sea: "Pacific Ocean", family: "pacific" }],
  Guyana: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Paraguay: [{ sea: "Landlocked", family: "lake" }],
  Peru: [{ sea: "Pacific Ocean", family: "pacific" }],
  Suriname: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Uruguay: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Venezuela: [
    { sea: "Caribbean Sea", family: "atlantic" },
    { sea: "Atlantic Ocean", family: "atlantic" },
  ],

  // Africa
  Algeria: [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Angola: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Benin: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Botswana: [{ sea: "Landlocked", family: "lake" }],
  "Burkina Faso": [{ sea: "Landlocked", family: "lake" }],
  Burundi: [{ sea: "Landlocked", family: "lake" }],
  "Cabo Verde": [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Cameroon: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  "Central African Republic": [{ sea: "Landlocked", family: "lake" }],
  Chad: [{ sea: "Landlocked", family: "lake" }],
  Comoros: [{ sea: "Indian Ocean", family: "indian" }],
  Congo: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  "DR Congo": [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Djibouti: [{ sea: "Gulf of Aden", family: "indian" }],
  Egypt: [
    { sea: "Mediterranean Sea", family: "mediterranean" },
    { sea: "Red Sea", family: "indian" },
  ],
  "Equatorial Guinea": [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Eritrea: [{ sea: "Red Sea", family: "indian" }],
  Eswatini: [{ sea: "Landlocked", family: "lake" }],
  Ethiopia: [{ sea: "Landlocked", family: "lake" }],
  Gabon: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Gambia: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Ghana: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Guinea: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  "Guinea-Bissau": [{ sea: "Atlantic Ocean", family: "atlantic" }],
  "Ivory Coast": [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Kenya: [{ sea: "Indian Ocean", family: "indian" }],
  Lesotho: [{ sea: "Landlocked", family: "lake" }],
  Liberia: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Libya: [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Madagascar: [{ sea: "Indian Ocean", family: "indian" }],
  Malawi: [{ sea: "Landlocked", family: "lake" }],
  Mali: [{ sea: "Landlocked", family: "lake" }],
  Mauritania: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Mauritius: [{ sea: "Indian Ocean", family: "indian" }],
  Morocco: [
    { sea: "Atlantic Ocean", family: "atlantic" },
    { sea: "Mediterranean Sea", family: "mediterranean" },
  ],
  Mozambique: [{ sea: "Indian Ocean", family: "indian" }],
  Namibia: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Niger: [{ sea: "Landlocked", family: "lake" }],
  Nigeria: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Rwanda: [{ sea: "Landlocked", family: "lake" }],
  "Sao Tome and Principe": [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Senegal: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Seychelles: [{ sea: "Indian Ocean", family: "indian" }],
  "Sierra Leone": [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Somalia: [
    { sea: "Indian Ocean", family: "indian" },
    { sea: "Gulf of Aden", family: "indian" },
  ],
  "South Africa": [
    { sea: "Atlantic Ocean", family: "atlantic" },
    { sea: "Indian Ocean", family: "indian" },
  ],
  "South Sudan": [{ sea: "Landlocked", family: "lake" }],
  Sudan: [{ sea: "Red Sea", family: "indian" }],
  Tanzania: [{ sea: "Indian Ocean", family: "indian" }],
  Togo: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Tunisia: [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Uganda: [{ sea: "Landlocked", family: "lake" }],
  Zambia: [{ sea: "Landlocked", family: "lake" }],
  Zimbabwe: [{ sea: "Landlocked", family: "lake" }],

  // Asia
  Afghanistan: [{ sea: "Landlocked", family: "lake" }],
  Armenia: [{ sea: "Landlocked", family: "lake" }],
  Azerbaijan: [{ sea: "Caspian Sea", family: "caspian" }],
  Bahrain: [{ sea: "Persian Gulf", family: "indian" }],
  Bangladesh: [{ sea: "Bay of Bengal", family: "indian" }],
  Bhutan: [{ sea: "Landlocked", family: "lake" }],
  Brunei: [{ sea: "South China Sea", family: "pacific" }],
  Cambodia: [{ sea: "Gulf of Thailand", family: "pacific" }],
  China: [
    { sea: "Yellow Sea", family: "pacific" },
    { sea: "South China Sea", family: "pacific" },
  ],
  Georgia: [{ sea: "Black Sea", family: "mediterranean" }],
  India: [
    { sea: "Arabian Sea", family: "indian" },
    { sea: "Bay of Bengal", family: "indian" },
  ],
  Indonesia: [
    { sea: "Pacific Ocean", family: "pacific" },
    { sea: "Indian Ocean", family: "indian" },
  ],
  Iran: [
    { sea: "Caspian Sea", family: "caspian" },
    { sea: "Persian Gulf", family: "indian" },
  ],
  Iraq: [{ sea: "Persian Gulf", family: "indian" }],
  Israel: [
    { sea: "Mediterranean Sea", family: "mediterranean" },
    { sea: "Red Sea", family: "indian" },
  ],
  Japan: [
    { sea: "Pacific Ocean", family: "pacific" },
    { sea: "Sea of Japan", family: "pacific" },
  ],
  Jordan: [{ sea: "Red Sea", family: "indian" }],
  Kazakhstan: [{ sea: "Caspian Sea", family: "caspian" }],
  Kuwait: [{ sea: "Persian Gulf", family: "indian" }],
  Kyrgyzstan: [{ sea: "Landlocked", family: "lake" }],
  Laos: [{ sea: "Landlocked", family: "lake" }],
  Lebanon: [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Malaysia: [{ sea: "South China Sea", family: "pacific" }],
  Maldives: [{ sea: "Indian Ocean", family: "indian" }],
  Mongolia: [{ sea: "Landlocked", family: "lake" }],
  Myanmar: [
    { sea: "Bay of Bengal", family: "indian" },
    { sea: "Andaman Sea", family: "indian" },
  ],
  Nepal: [{ sea: "Landlocked", family: "lake" }],
  "North Korea": [
    { sea: "Sea of Japan", family: "pacific" },
    { sea: "Yellow Sea", family: "pacific" },
  ],
  Oman: [{ sea: "Arabian Sea", family: "indian" }],
  Pakistan: [{ sea: "Arabian Sea", family: "indian" }],
  Palestine: [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Philippines: [
    { sea: "Pacific Ocean", family: "pacific" },
    { sea: "South China Sea", family: "pacific" },
  ],
  Qatar: [{ sea: "Persian Gulf", family: "indian" }],
  "Saudi Arabia": [
    { sea: "Red Sea", family: "indian" },
    { sea: "Persian Gulf", family: "indian" },
  ],
  Singapore: [{ sea: "South China Sea", family: "pacific" }],
  "South Korea": [
    { sea: "Sea of Japan", family: "pacific" },
    { sea: "Yellow Sea", family: "pacific" },
  ],
  "Sri Lanka": [{ sea: "Indian Ocean", family: "indian" }],
  Syria: [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Taiwan: [{ sea: "Pacific Ocean", family: "pacific" }],
  Tajikistan: [{ sea: "Landlocked", family: "lake" }],
  Thailand: [
    { sea: "Gulf of Thailand", family: "pacific" },
    { sea: "Andaman Sea", family: "indian" },
  ],
  "Timor-Leste": [{ sea: "Indian Ocean", family: "indian" }],
  Turkey: [
    { sea: "Mediterranean Sea", family: "mediterranean" },
    { sea: "Black Sea", family: "mediterranean" },
  ],
  Turkmenistan: [{ sea: "Caspian Sea", family: "caspian" }],
  "United Arab Emirates": [{ sea: "Persian Gulf", family: "indian" }],
  Uzbekistan: [{ sea: "Landlocked", family: "lake" }],
  Vietnam: [{ sea: "South China Sea", family: "pacific" }],
  Yemen: [
    { sea: "Red Sea", family: "indian" },
    { sea: "Arabian Sea", family: "indian" },
  ],

  // Europe
  Albania: [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Andorra: [{ sea: "Landlocked", family: "lake" }],
  Austria: [{ sea: "Landlocked", family: "lake" }],
  Belarus: [{ sea: "Landlocked", family: "lake" }],
  Belgium: [{ sea: "North Sea", family: "atlantic" }],
  "Bosnia and Herzegovina": [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Bulgaria: [{ sea: "Black Sea", family: "mediterranean" }],
  Croatia: [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Cyprus: [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Czechia: [{ sea: "Landlocked", family: "lake" }],
  Denmark: [
    { sea: "North Sea", family: "atlantic" },
    { sea: "Baltic Sea", family: "atlantic" },
  ],
  Estonia: [{ sea: "Baltic Sea", family: "atlantic" }],
  Finland: [{ sea: "Baltic Sea", family: "atlantic" }],
  France: [
    { sea: "Atlantic Ocean", family: "atlantic" },
    { sea: "Mediterranean Sea", family: "mediterranean" },
  ],
  Germany: [
    { sea: "North Sea", family: "atlantic" },
    { sea: "Baltic Sea", family: "atlantic" },
  ],
  Greece: [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Hungary: [{ sea: "Landlocked", family: "lake" }],
  Iceland: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Ireland: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Italy: [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Kosovo: [{ sea: "Landlocked", family: "lake" }],
  Latvia: [{ sea: "Baltic Sea", family: "atlantic" }],
  Liechtenstein: [{ sea: "Landlocked", family: "lake" }],
  Lithuania: [{ sea: "Baltic Sea", family: "atlantic" }],
  Luxembourg: [{ sea: "Landlocked", family: "lake" }],
  Malta: [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Moldova: [{ sea: "Landlocked", family: "lake" }],
  Monaco: [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Montenegro: [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Netherlands: [{ sea: "North Sea", family: "atlantic" }],
  "North Macedonia": [{ sea: "Landlocked", family: "lake" }],
  Norway: [
    { sea: "North Sea", family: "atlantic" },
    { sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Poland: [{ sea: "Baltic Sea", family: "atlantic" }],
  Portugal: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Romania: [{ sea: "Black Sea", family: "mediterranean" }],
  "San Marino": [{ sea: "Landlocked", family: "lake" }],
  Serbia: [{ sea: "Landlocked", family: "lake" }],
  Slovakia: [{ sea: "Landlocked", family: "lake" }],
  Slovenia: [{ sea: "Mediterranean Sea", family: "mediterranean" }],
  Spain: [
    { sea: "Atlantic Ocean", family: "atlantic" },
    { sea: "Mediterranean Sea", family: "mediterranean" },
  ],
  Sweden: [{ sea: "Baltic Sea", family: "atlantic" }],
  Switzerland: [{ sea: "Landlocked", family: "lake" }],
  Ukraine: [{ sea: "Black Sea", family: "mediterranean" }],
  "United Kingdom": [
    { sea: "Atlantic Ocean", family: "atlantic" },
    { sea: "North Sea", family: "atlantic" },
  ],
  "Vatican City": [{ sea: "Landlocked", family: "lake" }],

  // Oceania — sub-region instead of sea (everything here is Pacific)
  Australia: [{ sea: "Australasia", family: "australasia" }],
  Fiji: [{ sea: "Melanesia", family: "melanesia" }],
  Kiribati: [{ sea: "Micronesia", family: "micronesia" }],
  "Marshall Islands": [{ sea: "Micronesia", family: "micronesia" }],
  Micronesia: [{ sea: "Micronesia", family: "micronesia" }],
  Nauru: [{ sea: "Micronesia", family: "micronesia" }],
  "New Zealand": [{ sea: "Australasia", family: "australasia" }],
  Palau: [{ sea: "Micronesia", family: "micronesia" }],
  "Papua New Guinea": [{ sea: "Melanesia", family: "melanesia" }],
  Samoa: [{ sea: "Polynesia", family: "polynesia" }],
  "Solomon Islands": [{ sea: "Melanesia", family: "melanesia" }],
  Tonga: [{ sea: "Polynesia", family: "polynesia" }],
  Tuvalu: [{ sea: "Polynesia", family: "polynesia" }],
  Vanuatu: [{ sea: "Melanesia", family: "melanesia" }],
};

export type CityEntry = { name: string; sea: string; family: Water };

// A handful of well-known cities per country, each classified by the real
// sea it actually sits on (or "Landlocked" for inland/interior cities) —
// not tied to real dock data yet, just enough to make the country pages
// browsable. Only North America is filled in for now.
export const citiesByCountry: Record<string, CityEntry[]> = {
  "Antigua and Barbuda": [
    { name: "St. John's", sea: "Caribbean Sea", family: "atlantic" },
    { name: "All Saints", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Bolans", sea: "Caribbean Sea", family: "atlantic" },
  ],
  Bahamas: [
    { name: "Nassau", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Freeport", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "West End", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Barbados: [
    { name: "Bridgetown", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Speightstown", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Oistins", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Belize: [
    { name: "Belize City", sea: "Caribbean Sea", family: "atlantic" },
    { name: "San Pedro", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Placencia", sea: "Caribbean Sea", family: "atlantic" },
  ],
  Canada: [
    { name: "Vancouver", sea: "Pacific Ocean", family: "pacific" },
    { name: "Toronto", sea: "Landlocked", family: "lake" },
    { name: "Halifax", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Victoria", sea: "Pacific Ocean", family: "pacific" },
  ],
  "Costa Rica": [
    { name: "San José", sea: "Landlocked", family: "lake" },
    { name: "Puntarenas", sea: "Pacific Ocean", family: "pacific" },
    { name: "Limón", sea: "Caribbean Sea", family: "atlantic" },
  ],
  Cuba: [
    { name: "Havana", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Santiago de Cuba", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Varadero", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Dominica: [
    { name: "Roseau", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Portsmouth", sea: "Caribbean Sea", family: "atlantic" },
  ],
  "Dominican Republic": [
    { name: "Santo Domingo", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Punta Cana", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Puerto Plata", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  "El Salvador": [
    { name: "San Salvador", sea: "Pacific Ocean", family: "pacific" },
    { name: "La Libertad", sea: "Pacific Ocean", family: "pacific" },
    { name: "Acajutla", sea: "Pacific Ocean", family: "pacific" },
  ],
  Grenada: [
    { name: "St. George's", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Gouyave", sea: "Caribbean Sea", family: "atlantic" },
  ],
  Guatemala: [
    { name: "Guatemala City", sea: "Landlocked", family: "lake" },
    { name: "Puerto Barrios", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Puerto Quetzal", sea: "Pacific Ocean", family: "pacific" },
  ],
  Haiti: [
    { name: "Port-au-Prince", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Cap-Haïtien", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Jacmel", sea: "Caribbean Sea", family: "atlantic" },
  ],
  Honduras: [
    { name: "Tegucigalpa", sea: "Landlocked", family: "lake" },
    { name: "La Ceiba", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Roatán", sea: "Caribbean Sea", family: "atlantic" },
  ],
  Jamaica: [
    { name: "Kingston", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Montego Bay", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Ocho Rios", sea: "Caribbean Sea", family: "atlantic" },
  ],
  Mexico: [
    { name: "Cancún", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Puerto Vallarta", sea: "Pacific Ocean", family: "pacific" },
    { name: "Veracruz", sea: "Gulf of Mexico", family: "atlantic" },
    { name: "Ensenada", sea: "Pacific Ocean", family: "pacific" },
  ],
  Nicaragua: [
    { name: "Managua", sea: "Landlocked", family: "lake" },
    { name: "Bluefields", sea: "Caribbean Sea", family: "atlantic" },
    { name: "San Juan del Sur", sea: "Pacific Ocean", family: "pacific" },
  ],
  Panama: [
    { name: "Panama City", sea: "Pacific Ocean", family: "pacific" },
    { name: "Colón", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Bocas del Toro", sea: "Caribbean Sea", family: "atlantic" },
  ],
  "Saint Kitts and Nevis": [
    { name: "Basseterre", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Charlestown", sea: "Caribbean Sea", family: "atlantic" },
  ],
  "Saint Lucia": [
    { name: "Castries", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Soufrière", sea: "Caribbean Sea", family: "atlantic" },
  ],
  "Saint Vincent and the Grenadines": [
    { name: "Kingstown", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Bequia", sea: "Caribbean Sea", family: "atlantic" },
  ],
  "Trinidad and Tobago": [
    { name: "Port of Spain", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Scarborough", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Chaguaramas", sea: "Caribbean Sea", family: "atlantic" },
  ],
  "United States": [
    { name: "Miami", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "San Diego", sea: "Pacific Ocean", family: "pacific" },
    { name: "Seattle", sea: "Pacific Ocean", family: "pacific" },
    { name: "Boston", sea: "Atlantic Ocean", family: "atlantic" },
  ],

  // South America
  Argentina: [
    { name: "Buenos Aires", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Mar del Plata", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Bolivia: [
    { name: "La Paz", sea: "Landlocked", family: "lake" },
    { name: "Santa Cruz", sea: "Landlocked", family: "lake" },
  ],
  Brazil: [
    { name: "Brasília", sea: "Landlocked", family: "lake" },
    { name: "Rio de Janeiro", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Salvador", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Chile: [
    { name: "Valparaíso", sea: "Pacific Ocean", family: "pacific" },
    { name: "Antofagasta", sea: "Pacific Ocean", family: "pacific" },
  ],
  Colombia: [
    { name: "Cartagena", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Buenaventura", sea: "Pacific Ocean", family: "pacific" },
  ],
  Ecuador: [
    { name: "Guayaquil", sea: "Pacific Ocean", family: "pacific" },
    { name: "Quito", sea: "Landlocked", family: "lake" },
  ],
  Guyana: [
    { name: "Georgetown", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "New Amsterdam", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Paraguay: [
    { name: "Asunción", sea: "Landlocked", family: "lake" },
    { name: "Ciudad del Este", sea: "Landlocked", family: "lake" },
  ],
  Peru: [
    { name: "Lima", sea: "Pacific Ocean", family: "pacific" },
    { name: "Callao", sea: "Pacific Ocean", family: "pacific" },
  ],
  Suriname: [{ name: "Paramaribo", sea: "Atlantic Ocean", family: "atlantic" }],
  Uruguay: [
    { name: "Montevideo", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Punta del Este", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Venezuela: [
    { name: "Caracas", sea: "Caribbean Sea", family: "atlantic" },
    { name: "Maracaibo", sea: "Caribbean Sea", family: "atlantic" },
  ],

  // Africa
  Algeria: [
    { name: "Algiers", sea: "Mediterranean Sea", family: "mediterranean" },
    { name: "Oran", sea: "Mediterranean Sea", family: "mediterranean" },
  ],
  Angola: [
    { name: "Luanda", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Lobito", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Benin: [
    { name: "Cotonou", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Porto-Novo", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Botswana: [
    { name: "Gaborone", sea: "Landlocked", family: "lake" },
    { name: "Francistown", sea: "Landlocked", family: "lake" },
  ],
  "Burkina Faso": [
    { name: "Ouagadougou", sea: "Landlocked", family: "lake" },
    { name: "Bobo-Dioulasso", sea: "Landlocked", family: "lake" },
  ],
  Burundi: [{ name: "Bujumbura", sea: "Landlocked", family: "lake" }],
  "Cabo Verde": [
    { name: "Praia", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Mindelo", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Cameroon: [
    { name: "Douala", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Yaoundé", sea: "Landlocked", family: "lake" },
  ],
  "Central African Republic": [{ name: "Bangui", sea: "Landlocked", family: "lake" }],
  Chad: [{ name: "N'Djamena", sea: "Landlocked", family: "lake" }],
  Comoros: [{ name: "Moroni", sea: "Indian Ocean", family: "indian" }],
  Congo: [
    { name: "Brazzaville", sea: "Landlocked", family: "lake" },
    { name: "Pointe-Noire", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  "DR Congo": [
    { name: "Kinshasa", sea: "Landlocked", family: "lake" },
    { name: "Matadi", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Djibouti: [{ name: "Djibouti City", sea: "Gulf of Aden", family: "indian" }],
  Egypt: [
    { name: "Cairo", sea: "Landlocked", family: "lake" },
    { name: "Alexandria", sea: "Mediterranean Sea", family: "mediterranean" },
  ],
  "Equatorial Guinea": [{ name: "Malabo", sea: "Atlantic Ocean", family: "atlantic" }],
  Eritrea: [{ name: "Massawa", sea: "Red Sea", family: "indian" }],
  Eswatini: [{ name: "Mbabane", sea: "Landlocked", family: "lake" }],
  Ethiopia: [
    { name: "Addis Ababa", sea: "Landlocked", family: "lake" },
    { name: "Dire Dawa", sea: "Landlocked", family: "lake" },
  ],
  Gabon: [{ name: "Libreville", sea: "Atlantic Ocean", family: "atlantic" }],
  Gambia: [{ name: "Banjul", sea: "Atlantic Ocean", family: "atlantic" }],
  Ghana: [
    { name: "Accra", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Tema", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Guinea: [{ name: "Conakry", sea: "Atlantic Ocean", family: "atlantic" }],
  "Guinea-Bissau": [{ name: "Bissau", sea: "Atlantic Ocean", family: "atlantic" }],
  "Ivory Coast": [
    { name: "Abidjan", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Yamoussoukro", sea: "Landlocked", family: "lake" },
  ],
  Kenya: [
    { name: "Nairobi", sea: "Landlocked", family: "lake" },
    { name: "Mombasa", sea: "Indian Ocean", family: "indian" },
  ],
  Lesotho: [{ name: "Maseru", sea: "Landlocked", family: "lake" }],
  Liberia: [{ name: "Monrovia", sea: "Atlantic Ocean", family: "atlantic" }],
  Libya: [
    { name: "Tripoli", sea: "Mediterranean Sea", family: "mediterranean" },
    { name: "Benghazi", sea: "Mediterranean Sea", family: "mediterranean" },
  ],
  Madagascar: [
    { name: "Antananarivo", sea: "Landlocked", family: "lake" },
    { name: "Toamasina", sea: "Indian Ocean", family: "indian" },
  ],
  Malawi: [{ name: "Lilongwe", sea: "Landlocked", family: "lake" }],
  Mali: [{ name: "Bamako", sea: "Landlocked", family: "lake" }],
  Mauritania: [{ name: "Nouakchott", sea: "Atlantic Ocean", family: "atlantic" }],
  Mauritius: [{ name: "Port Louis", sea: "Indian Ocean", family: "indian" }],
  Morocco: [
    { name: "Casablanca", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Marrakech", sea: "Landlocked", family: "lake" },
  ],
  Mozambique: [
    { name: "Maputo", sea: "Indian Ocean", family: "indian" },
    { name: "Beira", sea: "Indian Ocean", family: "indian" },
  ],
  Namibia: [{ name: "Walvis Bay", sea: "Atlantic Ocean", family: "atlantic" }],
  Niger: [{ name: "Niamey", sea: "Landlocked", family: "lake" }],
  Nigeria: [
    { name: "Lagos", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Abuja", sea: "Landlocked", family: "lake" },
  ],
  Rwanda: [{ name: "Kigali", sea: "Landlocked", family: "lake" }],
  "Sao Tome and Principe": [{ name: "São Tomé", sea: "Atlantic Ocean", family: "atlantic" }],
  Senegal: [{ name: "Dakar", sea: "Atlantic Ocean", family: "atlantic" }],
  Seychelles: [{ name: "Victoria", sea: "Indian Ocean", family: "indian" }],
  "Sierra Leone": [{ name: "Freetown", sea: "Atlantic Ocean", family: "atlantic" }],
  Somalia: [
    { name: "Mogadishu", sea: "Indian Ocean", family: "indian" },
    { name: "Berbera", sea: "Gulf of Aden", family: "indian" },
  ],
  "South Africa": [
    { name: "Cape Town", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Durban", sea: "Indian Ocean", family: "indian" },
  ],
  "South Sudan": [{ name: "Juba", sea: "Landlocked", family: "lake" }],
  Sudan: [
    { name: "Khartoum", sea: "Landlocked", family: "lake" },
    { name: "Port Sudan", sea: "Red Sea", family: "indian" },
  ],
  Tanzania: [
    { name: "Dodoma", sea: "Landlocked", family: "lake" },
    { name: "Dar es Salaam", sea: "Indian Ocean", family: "indian" },
  ],
  Togo: [{ name: "Lomé", sea: "Atlantic Ocean", family: "atlantic" }],
  Tunisia: [
    { name: "Tunis", sea: "Mediterranean Sea", family: "mediterranean" },
    { name: "Sfax", sea: "Mediterranean Sea", family: "mediterranean" },
  ],
  Uganda: [{ name: "Kampala", sea: "Landlocked", family: "lake" }],
  Zambia: [{ name: "Lusaka", sea: "Landlocked", family: "lake" }],
  Zimbabwe: [{ name: "Harare", sea: "Landlocked", family: "lake" }],

  // Asia
  Afghanistan: [{ name: "Kabul", sea: "Landlocked", family: "lake" }],
  Armenia: [{ name: "Yerevan", sea: "Landlocked", family: "lake" }],
  Azerbaijan: [{ name: "Baku", sea: "Caspian Sea", family: "caspian" }],
  Bahrain: [{ name: "Manama", sea: "Persian Gulf", family: "indian" }],
  Bangladesh: [
    { name: "Dhaka", sea: "Bay of Bengal", family: "indian" },
    { name: "Chittagong", sea: "Bay of Bengal", family: "indian" },
  ],
  Bhutan: [{ name: "Thimphu", sea: "Landlocked", family: "lake" }],
  Brunei: [{ name: "Bandar Seri Begawan", sea: "South China Sea", family: "pacific" }],
  Cambodia: [
    { name: "Phnom Penh", sea: "Landlocked", family: "lake" },
    { name: "Sihanoukville", sea: "Gulf of Thailand", family: "pacific" },
  ],
  China: [
    { name: "Shanghai", sea: "South China Sea", family: "pacific" },
    { name: "Beijing", sea: "Yellow Sea", family: "pacific" },
    { name: "Hong Kong", sea: "South China Sea", family: "pacific" },
  ],
  Georgia: [{ name: "Batumi", sea: "Black Sea", family: "mediterranean" }],
  India: [
    { name: "Mumbai", sea: "Arabian Sea", family: "indian" },
    { name: "New Delhi", sea: "Landlocked", family: "lake" },
    { name: "Chennai", sea: "Bay of Bengal", family: "indian" },
  ],
  Indonesia: [
    { name: "Jakarta", sea: "Pacific Ocean", family: "pacific" },
    { name: "Surabaya", sea: "Pacific Ocean", family: "pacific" },
  ],
  Iran: [
    { name: "Tehran", sea: "Landlocked", family: "lake" },
    { name: "Bandar Abbas", sea: "Persian Gulf", family: "indian" },
  ],
  Iraq: [{ name: "Basra", sea: "Persian Gulf", family: "indian" }],
  Israel: [
    { name: "Tel Aviv", sea: "Mediterranean Sea", family: "mediterranean" },
    { name: "Haifa", sea: "Mediterranean Sea", family: "mediterranean" },
  ],
  Japan: [
    { name: "Tokyo", sea: "Pacific Ocean", family: "pacific" },
    { name: "Osaka", sea: "Pacific Ocean", family: "pacific" },
  ],
  Jordan: [{ name: "Aqaba", sea: "Red Sea", family: "indian" }],
  Kazakhstan: [
    { name: "Almaty", sea: "Landlocked", family: "lake" },
    { name: "Aktau", sea: "Caspian Sea", family: "caspian" },
  ],
  Kuwait: [{ name: "Kuwait City", sea: "Persian Gulf", family: "indian" }],
  Kyrgyzstan: [{ name: "Bishkek", sea: "Landlocked", family: "lake" }],
  Laos: [{ name: "Vientiane", sea: "Landlocked", family: "lake" }],
  Lebanon: [{ name: "Beirut", sea: "Mediterranean Sea", family: "mediterranean" }],
  Malaysia: [
    { name: "Kuala Lumpur", sea: "South China Sea", family: "pacific" },
    { name: "Penang", sea: "South China Sea", family: "pacific" },
  ],
  Maldives: [{ name: "Malé", sea: "Indian Ocean", family: "indian" }],
  Mongolia: [{ name: "Ulaanbaatar", sea: "Landlocked", family: "lake" }],
  Myanmar: [
    { name: "Yangon", sea: "Andaman Sea", family: "indian" },
  ],
  Nepal: [{ name: "Kathmandu", sea: "Landlocked", family: "lake" }],
  "North Korea": [{ name: "Pyongyang", sea: "Yellow Sea", family: "pacific" }],
  Oman: [{ name: "Muscat", sea: "Arabian Sea", family: "indian" }],
  Pakistan: [{ name: "Karachi", sea: "Arabian Sea", family: "indian" }],
  Palestine: [{ name: "Gaza", sea: "Mediterranean Sea", family: "mediterranean" }],
  Philippines: [
    { name: "Manila", sea: "South China Sea", family: "pacific" },
    { name: "Cebu City", sea: "Pacific Ocean", family: "pacific" },
  ],
  Qatar: [{ name: "Doha", sea: "Persian Gulf", family: "indian" }],
  "Saudi Arabia": [
    { name: "Jeddah", sea: "Red Sea", family: "indian" },
    { name: "Riyadh", sea: "Landlocked", family: "lake" },
  ],
  Singapore: [{ name: "Singapore", sea: "South China Sea", family: "pacific" }],
  "South Korea": [
    { name: "Busan", sea: "Sea of Japan", family: "pacific" },
    { name: "Incheon", sea: "Yellow Sea", family: "pacific" },
  ],
  "Sri Lanka": [{ name: "Colombo", sea: "Indian Ocean", family: "indian" }],
  Syria: [{ name: "Latakia", sea: "Mediterranean Sea", family: "mediterranean" }],
  Taiwan: [
    { name: "Taipei", sea: "Pacific Ocean", family: "pacific" },
    { name: "Kaohsiung", sea: "Pacific Ocean", family: "pacific" },
  ],
  Tajikistan: [{ name: "Dushanbe", sea: "Landlocked", family: "lake" }],
  Thailand: [
    { name: "Bangkok", sea: "Gulf of Thailand", family: "pacific" },
    { name: "Phuket", sea: "Andaman Sea", family: "indian" },
  ],
  "Timor-Leste": [{ name: "Dili", sea: "Indian Ocean", family: "indian" }],
  Turkey: [
    { name: "Istanbul", sea: "Mediterranean Sea", family: "mediterranean" },
    { name: "Ankara", sea: "Landlocked", family: "lake" },
  ],
  Turkmenistan: [{ name: "Ashgabat", sea: "Landlocked", family: "lake" }],
  "United Arab Emirates": [
    { name: "Dubai", sea: "Persian Gulf", family: "indian" },
    { name: "Abu Dhabi", sea: "Persian Gulf", family: "indian" },
  ],
  Uzbekistan: [{ name: "Tashkent", sea: "Landlocked", family: "lake" }],
  Vietnam: [
    { name: "Ho Chi Minh City", sea: "South China Sea", family: "pacific" },
    { name: "Da Nang", sea: "South China Sea", family: "pacific" },
  ],
  Yemen: [{ name: "Aden", sea: "Arabian Sea", family: "indian" }],

  // Europe
  Albania: [{ name: "Tirana", sea: "Mediterranean Sea", family: "mediterranean" }],
  Andorra: [{ name: "Andorra la Vella", sea: "Landlocked", family: "lake" }],
  Austria: [
    { name: "Vienna", sea: "Landlocked", family: "lake" },
    { name: "Salzburg", sea: "Landlocked", family: "lake" },
  ],
  Belarus: [{ name: "Minsk", sea: "Landlocked", family: "lake" }],
  Belgium: [
    { name: "Brussels", sea: "Landlocked", family: "lake" },
    { name: "Antwerp", sea: "North Sea", family: "atlantic" },
  ],
  "Bosnia and Herzegovina": [{ name: "Sarajevo", sea: "Landlocked", family: "lake" }],
  Bulgaria: [
    { name: "Sofia", sea: "Landlocked", family: "lake" },
    { name: "Varna", sea: "Black Sea", family: "mediterranean" },
  ],
  Croatia: [
    { name: "Zagreb", sea: "Landlocked", family: "lake" },
    { name: "Split", sea: "Mediterranean Sea", family: "mediterranean" },
  ],
  Cyprus: [{ name: "Nicosia", sea: "Mediterranean Sea", family: "mediterranean" }],
  Czechia: [{ name: "Prague", sea: "Landlocked", family: "lake" }],
  Denmark: [
    { name: "Copenhagen", sea: "Baltic Sea", family: "atlantic" },
    { name: "Aarhus", sea: "North Sea", family: "atlantic" },
  ],
  Estonia: [{ name: "Tallinn", sea: "Baltic Sea", family: "atlantic" }],
  Finland: [
    { name: "Helsinki", sea: "Baltic Sea", family: "atlantic" },
    { name: "Turku", sea: "Baltic Sea", family: "atlantic" },
  ],
  France: [
    { name: "Marseille", sea: "Mediterranean Sea", family: "mediterranean" },
    { name: "Nantes", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Paris", sea: "Landlocked", family: "lake" },
  ],
  Germany: [
    { name: "Hamburg", sea: "North Sea", family: "atlantic" },
    { name: "Rostock", sea: "Baltic Sea", family: "atlantic" },
    { name: "Berlin", sea: "Landlocked", family: "lake" },
  ],
  Greece: [
    { name: "Athens", sea: "Mediterranean Sea", family: "mediterranean" },
    { name: "Thessaloniki", sea: "Mediterranean Sea", family: "mediterranean" },
  ],
  Hungary: [{ name: "Budapest", sea: "Landlocked", family: "lake" }],
  Iceland: [{ name: "Reykjavik", sea: "Atlantic Ocean", family: "atlantic" }],
  Ireland: [
    { name: "Dublin", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Cork", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Italy: [
    { name: "Naples", sea: "Mediterranean Sea", family: "mediterranean" },
    { name: "Venice", sea: "Mediterranean Sea", family: "mediterranean" },
    { name: "Rome", sea: "Landlocked", family: "lake" },
  ],
  Kosovo: [{ name: "Pristina", sea: "Landlocked", family: "lake" }],
  Latvia: [{ name: "Riga", sea: "Baltic Sea", family: "atlantic" }],
  Liechtenstein: [{ name: "Vaduz", sea: "Landlocked", family: "lake" }],
  Lithuania: [{ name: "Vilnius", sea: "Landlocked", family: "lake" }],
  Luxembourg: [{ name: "Luxembourg City", sea: "Landlocked", family: "lake" }],
  Malta: [{ name: "Valletta", sea: "Mediterranean Sea", family: "mediterranean" }],
  Moldova: [{ name: "Chișinău", sea: "Landlocked", family: "lake" }],
  Monaco: [{ name: "Monaco", sea: "Mediterranean Sea", family: "mediterranean" }],
  Montenegro: [{ name: "Kotor", sea: "Mediterranean Sea", family: "mediterranean" }],
  Netherlands: [
    { name: "Amsterdam", sea: "North Sea", family: "atlantic" },
    { name: "Rotterdam", sea: "North Sea", family: "atlantic" },
  ],
  "North Macedonia": [{ name: "Skopje", sea: "Landlocked", family: "lake" }],
  Norway: [
    { name: "Oslo", sea: "North Sea", family: "atlantic" },
    { name: "Bergen", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Poland: [
    { name: "Gdańsk", sea: "Baltic Sea", family: "atlantic" },
    { name: "Warsaw", sea: "Landlocked", family: "lake" },
  ],
  Portugal: [
    { name: "Lisbon", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Porto", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  Romania: [
    { name: "Bucharest", sea: "Landlocked", family: "lake" },
    { name: "Constanța", sea: "Black Sea", family: "mediterranean" },
  ],
  "San Marino": [{ name: "San Marino", sea: "Landlocked", family: "lake" }],
  Serbia: [{ name: "Belgrade", sea: "Landlocked", family: "lake" }],
  Slovakia: [{ name: "Bratislava", sea: "Landlocked", family: "lake" }],
  Slovenia: [{ name: "Koper", sea: "Mediterranean Sea", family: "mediterranean" }],
  Spain: [
    { name: "Barcelona", sea: "Mediterranean Sea", family: "mediterranean" },
    { name: "Bilbao", sea: "Atlantic Ocean", family: "atlantic" },
    { name: "Madrid", sea: "Landlocked", family: "lake" },
  ],
  Sweden: [
    { name: "Stockholm", sea: "Baltic Sea", family: "atlantic" },
    { name: "Gothenburg", sea: "Baltic Sea", family: "atlantic" },
  ],
  Switzerland: [
    { name: "Zurich", sea: "Landlocked", family: "lake" },
    { name: "Geneva", sea: "Landlocked", family: "lake" },
  ],
  Ukraine: [
    { name: "Odesa", sea: "Black Sea", family: "mediterranean" },
    { name: "Kyiv", sea: "Landlocked", family: "lake" },
  ],
  "United Kingdom": [
    { name: "London", sea: "North Sea", family: "atlantic" },
    { name: "Liverpool", sea: "Atlantic Ocean", family: "atlantic" },
  ],
  "Vatican City": [{ name: "Vatican City", sea: "Landlocked", family: "lake" }],

  // Oceania — cities carry the same sub-region as their country
  Australia: [
    { name: "Sydney", sea: "Australasia", family: "australasia" },
    { name: "Melbourne", sea: "Australasia", family: "australasia" },
    { name: "Perth", sea: "Australasia", family: "australasia" },
  ],
  Fiji: [{ name: "Suva", sea: "Melanesia", family: "melanesia" }],
  Kiribati: [{ name: "Tarawa", sea: "Micronesia", family: "micronesia" }],
  "Marshall Islands": [{ name: "Majuro", sea: "Micronesia", family: "micronesia" }],
  Micronesia: [{ name: "Palikir", sea: "Micronesia", family: "micronesia" }],
  Nauru: [{ name: "Yaren", sea: "Micronesia", family: "micronesia" }],
  "New Zealand": [
    { name: "Auckland", sea: "Australasia", family: "australasia" },
    { name: "Wellington", sea: "Australasia", family: "australasia" },
  ],
  Palau: [{ name: "Ngerulmud", sea: "Micronesia", family: "micronesia" }],
  "Papua New Guinea": [{ name: "Port Moresby", sea: "Melanesia", family: "melanesia" }],
  Samoa: [{ name: "Apia", sea: "Polynesia", family: "polynesia" }],
  "Solomon Islands": [{ name: "Honiara", sea: "Melanesia", family: "melanesia" }],
  Tonga: [{ name: "Nuku'alofa", sea: "Polynesia", family: "polynesia" }],
  Tuvalu: [{ name: "Funafuti", sea: "Polynesia", family: "polynesia" }],
  Vanuatu: [{ name: "Port Vila", sea: "Melanesia", family: "melanesia" }],
};

// The United States is the one North America country we break down further,
// by state.
export const usStates: string[] = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
  "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
  "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

// Which real sea(s) each state actually touches — states with no coastline
// get grouped into "Landlocked" instead. Florida and a few others touch two.
export const usStateSea: Record<string, SeaEntry[]> = {
  Alaska: [{ sea: "Pacific Ocean", family: "pacific" }],
  California: [{ sea: "Pacific Ocean", family: "pacific" }],
  Hawaii: [{ sea: "Pacific Ocean", family: "pacific" }],
  Oregon: [{ sea: "Pacific Ocean", family: "pacific" }],
  Washington: [{ sea: "Pacific Ocean", family: "pacific" }],

  Texas: [{ sea: "Gulf of Mexico", family: "atlantic" }],
  Louisiana: [{ sea: "Gulf of Mexico", family: "atlantic" }],
  Mississippi: [{ sea: "Gulf of Mexico", family: "atlantic" }],
  Alabama: [{ sea: "Gulf of Mexico", family: "atlantic" }],
  Florida: [
    { sea: "Atlantic Ocean", family: "atlantic" },
    { sea: "Gulf of Mexico", family: "atlantic" },
  ],

  Connecticut: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Delaware: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Georgia: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Maine: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Maryland: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Massachusetts: [{ sea: "Atlantic Ocean", family: "atlantic" }],
  "New Hampshire": [{ sea: "Atlantic Ocean", family: "atlantic" }],
  "New Jersey": [{ sea: "Atlantic Ocean", family: "atlantic" }],
  "New York": [{ sea: "Atlantic Ocean", family: "atlantic" }],
  "North Carolina": [{ sea: "Atlantic Ocean", family: "atlantic" }],
  "Rhode Island": [{ sea: "Atlantic Ocean", family: "atlantic" }],
  "South Carolina": [{ sea: "Atlantic Ocean", family: "atlantic" }],
  Virginia: [{ sea: "Atlantic Ocean", family: "atlantic" }],

  Arizona: [{ sea: "Landlocked", family: "lake" }],
  Arkansas: [{ sea: "Landlocked", family: "lake" }],
  Colorado: [{ sea: "Landlocked", family: "lake" }],
  Idaho: [{ sea: "Landlocked", family: "lake" }],
  Illinois: [{ sea: "Landlocked", family: "lake" }],
  Indiana: [{ sea: "Landlocked", family: "lake" }],
  Iowa: [{ sea: "Landlocked", family: "lake" }],
  Kansas: [{ sea: "Landlocked", family: "lake" }],
  Kentucky: [{ sea: "Landlocked", family: "lake" }],
  Michigan: [{ sea: "Landlocked", family: "lake" }],
  Minnesota: [{ sea: "Landlocked", family: "lake" }],
  Missouri: [{ sea: "Landlocked", family: "lake" }],
  Montana: [{ sea: "Landlocked", family: "lake" }],
  Nebraska: [{ sea: "Landlocked", family: "lake" }],
  Nevada: [{ sea: "Landlocked", family: "lake" }],
  "New Mexico": [{ sea: "Landlocked", family: "lake" }],
  "North Dakota": [{ sea: "Landlocked", family: "lake" }],
  Ohio: [{ sea: "Landlocked", family: "lake" }],
  Oklahoma: [{ sea: "Landlocked", family: "lake" }],
  Pennsylvania: [{ sea: "Landlocked", family: "lake" }],
  "South Dakota": [{ sea: "Landlocked", family: "lake" }],
  Tennessee: [{ sea: "Landlocked", family: "lake" }],
  Utah: [{ sea: "Landlocked", family: "lake" }],
  Vermont: [{ sea: "Landlocked", family: "lake" }],
  "West Virginia": [{ sea: "Landlocked", family: "lake" }],
  Wisconsin: [{ sea: "Landlocked", family: "lake" }],
  Wyoming: [{ sea: "Landlocked", family: "lake" }],
};
