// The single place every stylesheet is assembled. Layout links /assets/site.<hash>.css on every
// page, /assets/hero.<hash>.css when `hero` is set, and /assets/page-<name>.<hash>.css for `page`.
import { tokensCss, tokensContrastCss } from "./tokens";
import { baseCss } from "./base";
import { componentsCss } from "./components";
import { chromeCss } from "./chrome";
import { heroCss } from "./hero";
import { homeCss } from "./pages/home";
import { dockCss } from "./pages/dock";
import { categoryCss } from "./pages/category";
import { continentCss } from "./pages/continent";
import { countryCss } from "./pages/country";
import { searchCss } from "./pages/search";
import { mapCss } from "./pages/map";
import { loginCss } from "./pages/login";
import { profileCss } from "./pages/profile";
import { userProfileCss } from "./pages/userProfile";
import { editProfileCss } from "./pages/editProfile";
import { addPhotoCss } from "./pages/addPhoto";
import { submitCss } from "./pages/submit";
import { messagesCss } from "./pages/messages";
import { adminCss } from "./pages/admin";
import { accessibilityCss } from "./pages/accessibility";
import { creditsCss } from "./pages/credits";

export const PAGE_STYLES = {
  home: homeCss,
  dock: dockCss,
  category: categoryCss,
  continent: continentCss,
  country: countryCss,
  search: searchCss,
  map: mapCss,
  login: loginCss,
  profile: profileCss,
  userProfile: userProfileCss,
  editProfile: editProfileCss,
  addPhoto: addPhotoCss,
  submit: submitCss,
  messages: messagesCss,
  admin: adminCss,
  accessibility: accessibilityCss,
  credits: creditsCss,
} as const;

export type PageName = keyof typeof PAGE_STYLES;

export const SITE_CSS = [tokensCss, tokensContrastCss, baseCss, chromeCss, componentsCss].join("\n");
export const HERO_CSS = heroCss;
