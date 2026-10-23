import { buildModuleTranslations, registerModuleTranslations } from "@simplix-react/i18n";

/** Shared namespace for the app chrome every deployable wears (language and colour scheme). */
export const PACKAGE_NAMESPACE = "console-shell-ui";

const translations = buildModuleTranslations({
  namespace: PACKAGE_NAMESPACE,
  locales: ["en", "ko", "ja"],
  components: {
    chrome: {
      en: () => import("./chrome/en.json"),
      ko: () => import("./chrome/ko.json"),
      ja: () => import("./chrome/ja.json"),
    },
  },
});

registerModuleTranslations(translations);
