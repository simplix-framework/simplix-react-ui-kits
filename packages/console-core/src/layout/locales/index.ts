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
    explanation: {
      en: () => import("./explanation/en.json"),
      ko: () => import("./explanation/ko.json"),
      ja: () => import("./explanation/ja.json"),
    },
  },
});

registerModuleTranslations(translations);
