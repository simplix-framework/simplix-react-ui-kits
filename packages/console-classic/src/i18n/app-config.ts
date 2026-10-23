/**
 * The languages this console is read in.
 *
 * <p>The interface axis, not the content axis. Design 8.1 separates them: an administrator
 * console is read in these three, while a worker reads a record in one of the ten release
 * languages, which travel in the record itself rather than in this catalogue.
 */
export const SUPPORTED_LOCALES = ["ko", "en", "ja"] as const;

/**
 * The languages a record can be written in and a person can be addressed in.
 *
 * <p>The content axis of design 8.1 — the release language pack of 8.4 (한국어 and nine others,
 * chosen from the resident-population counts in appendix E) together with the console's Japanese.
 * The build carries exactly these eleven (`.claude/board-to-app.json` `locales`), and an
 * invitation's language is chosen from here rather than from the three above: the person being
 * invited reads the invitation and the first-setup screen before they ever open this console.
 */
export const CONTENT_LOCALES = [
  "ko",
  "en",
  "ja",
  "vi",
  "zh-Hans",
  "th",
  "uz",
  "km",
  "ne",
  "mn",
  "ru",
] as const;

/**
 * The order a translated field's base column falls back through, as `useCrudFormSubmit` reads it.
 *
 * <p><b>A name with translations is two columns and only the map is typed.</b> Every read
 * projection resolves the reader's language out of `<name>I18n`, so a form that writes the base
 * column directly leaves the list and the detail drawing the previous value while the form itself
 * shows the new one — nothing fails and the request answers 200. Passed as `locales` beside
 * `i18nFields`, this is the order `applyI18nFallback` walks to derive the base column from the map
 * on submit, so the column a fallback reads holds Korean where Korean was filled.
 *
 * <p>Held here rather than built per form because the submit hook keeps it in a dependency list: a
 * fresh array each render rebuilds the submit handler on every keystroke.
 */
export const CONTENT_FALLBACK_ORDER = CONTENT_LOCALES.map((code) => ({ value: code }));

/** What the console opens in before anybody chooses. */
export const DEFAULT_LOCALE = "ko";

/** What this console calls itself, used where a title has no translation to reach. */
export const APP_NAME = "AccessCORE Smart Safety";
