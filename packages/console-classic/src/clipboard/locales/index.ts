import { buildModuleTranslations, registerModuleTranslations } from "@simplix-react/i18n";

/** Shared namespace for what a copy control says about itself. */
export const PACKAGE_NAMESPACE = "console-clipboard-ui";

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
