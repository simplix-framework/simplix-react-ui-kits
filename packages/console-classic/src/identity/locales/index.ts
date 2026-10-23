import { buildModuleTranslations, registerModuleTranslations } from "@simplix-react/i18n";

/** Shared namespace for identity UI building blocks (address fieldset labels). */
export const PACKAGE_NAMESPACE = "console-identity-ui";

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
