/**
 * Text with digit grouping in the reader's locale; a non-number is drawn as it came.
 *
 * <p>The one count formatter of the kit: the list's total badge reads its figure the same way
 * (`Intl.NumberFormat` of the UI language), so a tile and the badge beside it never disagree
 * about 「1,188」.
 *
 * @param raw the value, a number or its text
 * @param locale the UI language
 * @returns the grouped text, empty for no value
 */
export function groupedNumber(raw: unknown, locale: string): string {
  if (raw === null || raw === undefined || raw === "") return "";
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) ? new Intl.NumberFormat(locale).format(value) : String(raw);
}
