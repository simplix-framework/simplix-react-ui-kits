// Pure decisions behind MeasurementGrid and CheckMatrix: what a cell shows, whether it takes input,
// and the counts a caller may put above the grid. Kept apart from the markup so each decision is
// tested on its own.

/** A verdict a rule gave one measured cell. */
export type MeasurementVerdict = "SAFE" | "UNSAFE" | "REVIEW_REQUIRED";

/** What one measured cell shows. */
export type MeasurementCellState =
  /** Nothing was entered. Never read as zero. */
  | { readonly kind: "empty" }
  /** A reading with a verdict the rule settled. */
  | { readonly kind: "verdict"; readonly value: number; readonly verdict: "SAFE" | "UNSAFE" }
  /** A reading the rule could not settle, or one no verdict has reached yet. Never drawn as safe. */
  | { readonly kind: "held"; readonly value: number };

/**
 * The key a sample and its verdict are stored under.
 *
 * @param analyte the substance key
 * @param position the position key
 * @returns `analyte:position`
 */
export function sampleKey(analyte: string, position: string): string {
  return `${analyte}:${position}`;
}

/**
 * Decides what one measured cell shows.
 *
 * <p>A reading with no verdict is held rather than safe: the absence of a rule's answer is not an
 * answer, and a screen that drew it as safe would let work resume on a value nobody judged.
 *
 * @param value the reading, `null` or `undefined` when nothing was entered
 * @param verdict the rule's verdict for the cell, where one was given
 * @returns the cell's display state
 */
export function measurementCellState(
  value: number | null | undefined,
  verdict: MeasurementVerdict | undefined,
): MeasurementCellState {
  if (value === null || value === undefined || Number.isNaN(value)) return { kind: "empty" };
  if (verdict === "SAFE" || verdict === "UNSAFE") return { kind: "verdict", value, verdict };
  return { kind: "held", value };
}

/** Counts over one measurement event. */
export interface MeasurementSummary {
  readonly safe: number;
  readonly unsafe: number;
  readonly held: number;
  readonly empty: number;
}

/**
 * Counts the cells of one measurement event by display state.
 *
 * @param analytes the substance keys, in row order
 * @param positions the position keys, in column order
 * @param samples readings by {@link sampleKey}
 * @param verdicts verdicts by {@link sampleKey}
 * @returns the counts
 */
export function measurementSummary(
  analytes: readonly string[],
  positions: readonly string[],
  samples: Readonly<Record<string, number | null>>,
  verdicts: Readonly<Record<string, MeasurementVerdict>>,
): MeasurementSummary {
  let safe = 0;
  let unsafe = 0;
  let held = 0;
  let empty = 0;
  for (const analyte of analytes) {
    for (const position of positions) {
      const key = sampleKey(analyte, position);
      const state = measurementCellState(samples[key], verdicts[key]);
      if (state.kind === "empty") empty += 1;
      else if (state.kind === "held") held += 1;
      else if (state.verdict === "UNSAFE") unsafe += 1;
      else safe += 1;
    }
  }
  return { safe, unsafe, held, empty };
}

/** What the next-measurement line shows. */
export type NextDueState =
  | { readonly kind: "held" }
  | { readonly kind: "none" }
  | { readonly kind: "due"; readonly at: string };

/**
 * Decides the next-measurement line. A held interval shows the hold and no time, because a time
 * computed from an interval nobody settled is a deadline nobody set.
 *
 * @param nextDueAt the next due instant, where one is known
 * @param intervalHeld whether the measurement interval is held for interpretation
 * @returns the line's state
 */
export function nextDueState(nextDueAt: string | undefined, intervalHeld: boolean): NextDueState {
  if (intervalHeld) return { kind: "held" };
  if (!nextDueAt) return { kind: "none" };
  return { kind: "due", at: nextDueAt };
}

/**
 * Parses what a reader typed into a reading. Blank is `null`, never zero; anything that is not a
 * finite number is `undefined`, which the caller ignores.
 *
 * @param text the typed text
 * @returns the reading, `null` for blank, `undefined` for unreadable input
 */
export function parseReading(text: string): number | null | undefined {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : undefined;
}

/** A verdict one checked cell carries. */
export type CheckVerdict = "GOOD" | "BAD" | "NOT_APPLICABLE";

/** The verdicts in the order the caller's labels name them. */
export const CHECK_VERDICTS: readonly CheckVerdict[] = ["GOOD", "BAD", "NOT_APPLICABLE"];

/** What one checked cell shows. */
export type CheckCellState =
  /** Not checked, drawn apart from every verdict. */
  | { readonly kind: "empty" }
  | { readonly kind: "verdict"; readonly verdict: CheckVerdict };

/**
 * The key a check value is stored under.
 *
 * @param rowKey the item key
 * @param columnKey the round key
 * @returns `rowKey:columnKey`
 */
export function checkKey(rowKey: string, columnKey: string): string {
  return `${rowKey}:${columnKey}`;
}

/**
 * Decides what one checked cell shows.
 *
 * @param value the stored verdict, `null` or `undefined` when not checked
 * @returns the cell's display state
 */
export function checkCellState(value: CheckVerdict | null | undefined): CheckCellState {
  return value ? { kind: "verdict", verdict: value } : { kind: "empty" };
}

/**
 * Whether a round accepts input.
 *
 * @param columnKey the round key
 * @param editableColumns the rounds the caller opened for input
 * @returns `true` only for a listed round
 */
export function isCheckColumnEditable(columnKey: string, editableColumns: readonly string[]): boolean {
  return editableColumns.includes(columnKey);
}

/** Counts over a check matrix. */
export interface CheckSummary {
  readonly good: number;
  readonly bad: number;
  readonly notApplicable: number;
  readonly unchecked: number;
}

/**
 * Counts the cells of a check matrix by display state.
 *
 * @param rowKeys the item keys
 * @param columnKeys the round keys
 * @param values verdicts by {@link checkKey}
 * @returns the counts
 */
export function checkSummary(
  rowKeys: readonly string[],
  columnKeys: readonly string[],
  values: Readonly<Record<string, CheckVerdict | null>>,
): CheckSummary {
  let good = 0;
  let bad = 0;
  let notApplicable = 0;
  let unchecked = 0;
  for (const row of rowKeys) {
    for (const column of columnKeys) {
      const state = checkCellState(values[checkKey(row, column)]);
      if (state.kind === "empty") unchecked += 1;
      else if (state.verdict === "BAD") bad += 1;
      else if (state.verdict === "GOOD") good += 1;
      else notApplicable += 1;
    }
  }
  return { good, bad, notApplicable, unchecked };
}
