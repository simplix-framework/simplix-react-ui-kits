import { buildModuleTranslations, registerModuleTranslations } from "@simplix-react/i18n";

/** Shared namespace for the failure screens and the failure dialog. */
export const PACKAGE_NAMESPACE = "console-error-ui";

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
