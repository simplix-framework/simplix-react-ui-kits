import { buildModuleTranslations, registerModuleTranslations } from "@simplix-react/i18n";

/** Namespace for the parts that draw a piece of work moving through its procedure, and the ones that set a procedure up. */
export const PACKAGE_NAMESPACE = "console-process-ui";

const translations = buildModuleTranslations({
  namespace: PACKAGE_NAMESPACE,
  locales: ["en", "ko", "ja"],
  components: {
    work: {
      en: () => import("./work/en.json"),
      ko: () => import("./work/ko.json"),
      ja: () => import("./work/ja.json"),
    },
    settings: {
      en: () => import("./settings/en.json"),
      ko: () => import("./settings/ko.json"),
      ja: () => import("./settings/ja.json"),
    },
  },
});

registerModuleTranslations(translations);
