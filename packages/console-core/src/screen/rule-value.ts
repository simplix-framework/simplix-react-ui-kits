/** How a rule's value stands: drawn from the source, awaiting interpretation, or approved. */
export type RuleStatus = "SOURCE" | "REVIEW_REQUIRED" | "APPROVED";

/** One rule's data, as a rule key resolves to it. */
export interface RuleData {
  /** A number, a text, or a range as `{ min, max }` or `[min, max]`. */
  readonly value: unknown;
  readonly unit?: string;
  /** `GTE`, `LTE`, `GT`, `LT`, `EQ`, `NE`, `BETWEEN`, or the symbol itself. */
  readonly comparator: string;
  readonly status: RuleStatus;
  readonly sourceClauseIds: readonly string[];
}

/** What a rule's value reads as. */
export type RuleValueReading =
  /** The rule awaits interpretation, so no value may be shown. */
  | { readonly kind: "held" }
  /** The rule has no value yet; never drawn as 0. */
  | { readonly kind: "missing" }
  | { readonly kind: "value"; readonly text: string };

const SYMBOLS: Readonly<Record<string, string>> = {
  GTE: "≥",
  GE: "≥",
  ">=": "≥",
  LTE: "≤",
  LE: "≤",
  "<=": "≤",
  GT: ">",
  LT: "<",
  EQ: "=",
  "==": "=",
  NE: "≠",
  "!=": "≠",
};

const RANGE_COMPARATORS = new Set(["BETWEEN", "RANGE", "~"]);

function present(value: unknown): boolean {
  return value !== null && value !== undefined && !(typeof value === "string" && value.trim() === "") && !(typeof value === "number" && Number.isNaN(value));
}

function figure(value: unknown, locale: string | undefined): string {
  return typeof value === "number" ? new Intl.NumberFormat(locale).format(value) : String(value);
}

function rangeEnds(value: unknown): readonly [unknown, unknown] | null {
  if (Array.isArray(value) && value.length === 2) return [value[0], value[1]];
  if (value && typeof value === "object" && ("min" in value || "max" in value)) {
    const range = value as { min?: unknown; max?: unknown };
    return [range.min, range.max];
  }
  return null;
}

/**
 * Reads one rule's value, unit and comparison as a short text such as 「≥ 2 m」 or 「2 ~ 5 m」.
 *
 * <p>A rule awaiting interpretation reads as held whatever value it carries, and a missing value
 * reads as missing rather than as 0. A range with one end open reads with that end's comparison
 * (「≥ 2 m」, 「≤ 5 m」); a range with neither end reads as missing.
 *
 * @param rule - The rule's data.
 * @param locale - The BCP 47 locale numbers are grouped for.
 * @returns How the value reads.
 */
export function readRuleValue(rule: Pick<RuleData, "value" | "unit" | "comparator" | "status">, locale?: string): RuleValueReading {
  if (rule.status === "REVIEW_REQUIRED") return { kind: "held" };
  const unit = rule.unit ? ` ${rule.unit}` : "";
  const ends = rangeEnds(rule.value);
  if (ends || RANGE_COMPARATORS.has(rule.comparator.toUpperCase())) {
    const [min, max] = ends ?? [undefined, undefined];
    if (present(min) && present(max)) return { kind: "value", text: `${figure(min, locale)} ~ ${figure(max, locale)}${unit}` };
    if (present(min)) return { kind: "value", text: `≥ ${figure(min, locale)}${unit}` };
    if (present(max)) return { kind: "value", text: `≤ ${figure(max, locale)}${unit}` };
    return { kind: "missing" };
  }
  if (!present(rule.value)) return { kind: "missing" };
  const symbol = SYMBOLS[rule.comparator.toUpperCase()] ?? SYMBOLS[rule.comparator] ?? rule.comparator;
  const prefix = symbol ? `${symbol} ` : "";
  return { kind: "value", text: `${prefix}${figure(rule.value, locale)}${unit}` };
}
