import { buildModuleTranslations, registerModuleTranslations } from "@simplix-react/i18n";

/** Shared namespace for the evidence grid, which every screen that carries attachments draws. */
export const PACKAGE_NAMESPACE = "console-attachment-ui";

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
