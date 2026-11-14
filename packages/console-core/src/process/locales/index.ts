import { buildModuleTranslations, registerModuleTranslations } from "@simplix-react/i18n";

/** Namespace for the parts that draw a piece of work moving through its procedure. */
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
  },
});

registerModuleTranslations(translations);
