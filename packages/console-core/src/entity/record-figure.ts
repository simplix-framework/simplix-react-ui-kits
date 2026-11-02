/**
 * How the figure kinds of the contract are written: a size in bytes, a span of milliseconds, and the
 * sign a ledger amount is drawn by. Pure, so a list cell, a detail field and a card write them alike.
 */

/** The sign a ledger amount is drawn by; zero has none. */
export type FigureSign = "positive" | "negative";

/** The number a raw value stands for, or `null` when it is not one. */
function numberOf(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) ? value : null;
}

const BYTE_UNITS = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"] as const;

/**
 * A size in bytes in the largest unit that keeps it at 1 or more, with one decimal place past the
 * first unit (`1.5 MB`), each step a factor of 1024.
 *
 * @param raw the stored byte count
 * @param locale the reader's locale
 */
export function bytesText(raw: unknown, locale: string): string {
  const bytes = numberOf(raw);
  if (bytes === null) return raw == null ? "" : String(raw);
  let unit = 0;
  let amount = Math.abs(bytes);
  while (amount >= 1024 && unit < BYTE_UNITS.length - 1) {
    amount /= 1024;
    unit += 1;
  }
  const format = new Intl.NumberFormat(locale, { style: "unit", unit: BYTE_UNITS[unit], unitDisplay: "short", maximumFractionDigits: unit === 0 ? 0 : 1 });
  return format.format(Math.sign(bytes) * amount);
}

/**
 * A span of milliseconds as a reader compares it: milliseconds under a second, seconds with one
 * decimal under a minute, then minutes and seconds (`2 min 5 sec`).
 *
 * @param raw the stored span in milliseconds
 * @param locale the reader's locale
 */
export function durationText(raw: unknown, locale: string): string {
  const ms = numberOf(raw);
  if (ms === null) return raw == null ? "" : String(raw);
  const unit = (value: number, name: "millisecond" | "second" | "minute" | "hour", digits = 0) =>
    new Intl.NumberFormat(locale, { style: "unit", unit: name, unitDisplay: "short", maximumFractionDigits: digits }).format(value);
  const span = Math.abs(ms);
  const sign = ms < 0 ? "-" : "";
  if (span < 1000) return sign + unit(span, "millisecond");
  if (span < 60_000) return sign + unit(span / 1000, "second", 1);
  const totalSeconds = Math.round(span / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = hours > 0 ? [unit(hours, "hour"), unit(minutes, "minute")] : [unit(minutes, "minute"), ...(seconds > 0 ? [unit(seconds, "second")] : [])];
  return sign + parts.join(" ");
}

/**
 * The sign a ledger amount is drawn by, or nothing for zero and for a value that is not a number.
 *
 * @param raw the stored amount
 */
export function figureSign(raw: unknown): FigureSign | undefined {
  const value = numberOf(raw);
  if (value === null || value === 0) return undefined;
  return value > 0 ? "positive" : "negative";
}

/**
 * A signed amount with its sign written out, so a credit reads `+500` and a debit `-500` whether
 * or not the reader sees the colour.
 *
 * @param text the amount as already written, without its sign
 * @param sign the amount's sign
 */
export function signedText(text: string, sign: FigureSign | undefined): string {
  if (sign === "positive" && !text.startsWith("+")) return `+${text}`;
  return text;
}

/**
 * One count as a share of another (`12.5%`), for a record that carries a total and the part of it
 * that failed or was served from a cache. Nothing when the total is zero or either value is not a
 * number, so a row with no calls draws the kit's empty mark instead of a false `0%`.
 *
 * @param part the stored count that is a share of the total
 * @param total the stored total
 * @param locale the reader's locale
 */
export function ratioText(part: unknown, total: unknown, locale: string): string {
  const numerator = numberOf(part);
  const denominator = numberOf(total);
  if (numerator === null || denominator === null || denominator === 0) return "";
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(numerator / denominator);
}
