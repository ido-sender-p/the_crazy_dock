import { siteJs } from "./site";
import { dockJs } from "./dock";
import { mapJs } from "./map";
import { editProfileJs } from "./editProfile";
import { addPhotoJs } from "./addPhoto";

// Pages never inline executable JS: they emit data as <script type="application/json"> blocks and
// ask Layout to load one of these by name (scripts={["dock"]}). "site" always loads.
export const CLIENT_SCRIPTS = {
  site: siteJs,
  dock: dockJs,
  map: mapJs,
  editProfile: editProfileJs,
  addPhoto: addPhotoJs,
} as const;

export type ClientScriptName = keyof typeof CLIENT_SCRIPTS;
