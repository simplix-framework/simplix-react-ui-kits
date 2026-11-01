/**
 * Whole days gone by, as a sentence in the reader's language: "1 day ago", "3 days ago" in English, and the language's own form elsewhere.
 *
 * <p>The plural form is the language's own (CLDR, through `Intl.RelativeTimeFormat`), so a catalogue
 * string with a bare `{{days}} days ago` never has to carry one: it reads "1 days ago" for a single
 * day and nothing anywhere reports the fault. A count of days is whole, and the reader's word for
 * zero is the caller's ("Today"), so a count below one is refused rather than worded.
 *
 * @param days how many whole days ago, one or more
 * @param locale the reader's locale
 * @returns the sentence
 * @throws RangeError when `days` is not a whole number of at least one
 */
export function daysAgoText(days: number, locale: string): string {
  if (!Number.isInteger(days) || days < 1) {
    throw new RangeError(`daysAgoText: expected a whole number of days of at least 1, got ${String(days)}`);
  }
  return new Intl.RelativeTimeFormat(locale, { numeric: "always" }).format(-days, "day");
}
