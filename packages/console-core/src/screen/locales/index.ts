import { buildModuleTranslations, registerModuleTranslations } from "@simplix-react/i18n";

/** Namespace for the screen parts that carry their own generic strings. */
export const PACKAGE_NAMESPACE = "console-screen-ui";

const translations = buildModuleTranslations({
  namespace: PACKAGE_NAMESPACE,
  locales: ["en", "ko", "ja"],
  components: {
    features: {
      en: () => import("./features/en.json"),
      ko: () => import("./features/ko.json"),
      ja: () => import("./features/ja.json"),
    },
  },
});

registerModuleTranslations(translations);
