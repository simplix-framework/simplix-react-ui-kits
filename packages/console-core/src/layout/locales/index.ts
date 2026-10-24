import { buildModuleTranslations, registerModuleTranslations } from "@simplix-react/i18n";

/** Namespace for the layout patterns that carry copy of their own. */
export const PACKAGE_NAMESPACE = "console-layout-ui";

const translations = buildModuleTranslations({
  namespace: PACKAGE_NAMESPACE,
  locales: ["en", "ko", "ja"],
  components: {
    tiles: {
      en: () => import("./tiles/en.json"),
      ko: () => import("./tiles/ko.json"),
      ja: () => import("./tiles/ja.json"),
    },
    grids: {
      en: () => import("./grids/en.json"),
      ko: () => import("./grids/ko.json"),
      ja: () => import("./grids/ja.json"),
    },
    flow: {
      en: () => import("./flow/en.json"),
      ko: () => import("./flow/ko.json"),
      ja: () => import("./flow/ja.json"),
    },
    explanation: {
      en: () => import("./explanation/en.json"),
      ko: () => import("./explanation/ko.json"),
      ja: () => import("./explanation/ja.json"),
    },
  },
});

registerModuleTranslations(translations);
