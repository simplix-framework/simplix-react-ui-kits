import type { EvidenceItem } from "../attachment/evidence-grid";

/** One item of an evaluation form, in the order the form prints it. */
export interface ScoreCriterion {
  readonly key: string;
  /** The category path above the item, outermost first. The first entry keys the subtotal. */
  readonly categoryPath: readonly string[];
  /** The item and its criterion text, one entry per printed column. */
  readonly cells: readonly string[];
  /** The rule in {@link ScoreSheetProps.rules} bounding this item's score. */
  readonly scoreRuleKey: string;
  /** Whether the item may be marked not applicable. */
  readonly applicableToggle?: boolean;
}

/** One evaluator's raw entry for one item. */
export interface RawScore {
  readonly criterionKey: string;
  readonly evaluator: string;
  readonly score: number | null;
  readonly rating?: string;
  readonly reason?: string;
  readonly evidence: readonly EvidenceItem[];
}

/** What a resolved score rests on. */
export type ResolvedBasis = "RAW" | "APPROVED_POLICY" | "COMMITTEE_RESOLUTION";

/** The score that counts for one item, with who settled it and on what. */
export interface ResolvedScore {
  readonly criterionKey: string;
  readonly score: number;
  readonly basis: ResolvedBasis;
  readonly by: string;
}

/** The overall outcome the server computed. */
export type ScoreResult = "PASS" | "FAIL" | "REVIEW_REQUIRED";

/** Subtotals and the total, as the server computed them. A null was not computed. */
export interface ScoreTotals {
  readonly categories: Readonly<Record<string, number | null>>;
  readonly total: number | null;
  readonly result: ScoreResult | null;
}

/** A calculation held back while a rule's interpretation is open. */
export interface ScoreHold {
  readonly conflictKey: string;
  readonly label: string;
}

/** Who is looking: the company filling its own fields, one evaluator, the resolver, or a reader. */
export type ScoreSheetMode = "contractor" | "evaluator" | "resolver" | "read";

/** The range a score rule allows. `max` is also the item's printed maximum score. */
export interface ScoreRule {
  readonly min: number;
  readonly max: number;
  readonly step?: number;
}

/** Which parts of the sheet a viewer sees. */
export interface ScoreVisibility {
  /** The evaluators whose raw columns are drawn, in order. */
  readonly evaluators: readonly string[];
  /** The one raw column the viewer may edit, if any. */
  readonly editable: string | null;
  readonly resolved: boolean;
  readonly totals: boolean;
  readonly resolveAction: boolean;
}

/** The evaluators in the raw entries, in first-appearance order. */
export function evaluatorsOf(raw: readonly RawScore[]): string[] {
  const seen: string[] = [];
  for (const entry of raw) if (!seen.includes(entry.evaluator)) seen.push(entry.evaluator);
  return seen;
}

/**
 * Decides which columns and rows a viewer sees.
 *
 * <p>An evaluator sees only their own raw column until the round is confirmed, so no score is
 * anchored on another's; after confirmation the sheet reads as in `read` mode. The contractor sees
 * only its own entry column and never the evaluation.
 */
export function scoreVisibility(
  mode: ScoreSheetMode,
  evaluators: readonly string[],
  viewer: string | undefined,
  confirmed: boolean,
): ScoreVisibility {
  const own = viewer === undefined ? [] : [viewer];
  switch (mode) {
    case "contractor":
      return { evaluators: own, editable: viewer ?? null, resolved: false, totals: false, resolveAction: false };
    case "evaluator":
      if (!confirmed) return { evaluators: own, editable: viewer ?? null, resolved: false, totals: false, resolveAction: false };
      return { evaluators: [...evaluators], editable: null, resolved: true, totals: true, resolveAction: false };
    case "resolver":
      return { evaluators: [...evaluators], editable: null, resolved: true, totals: true, resolveAction: true };
    case "read":
      return { evaluators: [...evaluators], editable: null, resolved: true, totals: true, resolveAction: false };
  }
}

/** Whether a score may be entered under its rule. An empty score is always accepted. */
export function isScoreInRange(score: number | null, rule: ScoreRule | undefined): boolean {
  if (score === null) return true;
  if (!Number.isFinite(score)) return false;
  if (rule === undefined) return false;
  return score >= rule.min && score <= rule.max;
}

/** How a figure that may not have been computed is drawn. */
export type FigureText =
  | { readonly kind: "value"; readonly value: number }
  | { readonly kind: "held"; readonly labels: readonly string[] }
  | { readonly kind: "unresolved"; readonly count: number };

/** The items of a set of criteria that have no resolved score. */
export function unresolvedCount(criteria: readonly ScoreCriterion[], resolved: readonly ResolvedScore[]): number {
  const done = new Set(resolved.map((r) => r.criterionKey));
  return criteria.filter((c) => !done.has(c.key)).length;
}

/**
 * How the total, or a subtotal, is drawn. A null is never drawn as 0: it is held when a hold is
 * listed, and otherwise counts the items still without a resolved score.
 */
export function figureText(
  value: number | null,
  holds: readonly ScoreHold[],
  criteria: readonly ScoreCriterion[],
  resolved: readonly ResolvedScore[],
): FigureText {
  if (value !== null) return { kind: "value", value };
  if (holds.length > 0) return { kind: "held", labels: holds.map((h) => h.label) };
  return { kind: "unresolved", count: unresolvedCount(criteria, resolved) };
}

/** A run of criteria under one top-level category, kept in source order. */
export interface CategoryGroup {
  readonly category: string;
  readonly criteria: readonly ScoreCriterion[];
}

/**
 * Splits criteria into consecutive runs by top-level category, keeping source order. A category
 * that reappears later starts a new run, because the form's order wins over grouping.
 */
export function groupByCategory(criteria: readonly ScoreCriterion[]): CategoryGroup[] {
  const groups: { category: string; criteria: ScoreCriterion[] }[] = [];
  for (const criterion of criteria) {
    const category = criterion.categoryPath[0] ?? "";
    const last = groups[groups.length - 1];
    if (last && last.category === category) last.criteria.push(criterion);
    else groups.push({ category, criteria: [criterion] });
  }
  return groups;
}

/**
 * The subtotal rows to draw: one after the last run of each category, using the server's figure.
 * A category the server did not list is drawn as not computed rather than summed here.
 */
export function subtotalRows(
  criteria: readonly ScoreCriterion[],
  totals: ScoreTotals,
  holds: readonly ScoreHold[],
  resolved: readonly ResolvedScore[],
): { readonly afterKey: string; readonly category: string; readonly figure: FigureText }[] {
  const groups = groupByCategory(criteria);
  return groups.flatMap((group, index) => {
    if (groups.slice(index + 1).some((g) => g.category === group.category)) return [];
    const inCategory = criteria.filter((c) => (c.categoryPath[0] ?? "") === group.category);
    const value = totals.categories[group.category] ?? null;
    const last = group.criteria[group.criteria.length - 1];
    return last ? [{ afterKey: last.key, category: group.category, figure: figureText(value, holds, inCategory, resolved) }] : [];
  });
}
