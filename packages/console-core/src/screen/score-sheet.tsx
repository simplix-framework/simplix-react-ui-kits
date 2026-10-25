import { useTranslation } from "@simplix-react/i18n/react";
import { Badge, Button, EmptyValue, Stack, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Text } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";
import { Fragment } from "react";

import { RecordFormSections, useRecordFormValues, type RecordFormField, type RecordFormSection } from "../entity/record-form";
import { NumericText } from "../layout/numeric-text";
import { TableCard } from "../layout/table-card";
import { PACKAGE_NAMESPACE } from "./locales";
import {
  evaluatorsOf,
  figureText,
  isScoreInRange,
  ratingOf,
  scoreVisibility,
  subtotalRows,
  type FigureText,
  type RawScore,
  type ResolvedScore,
  type ScoreCriterion,
  type ScoreHold,
  type ScoreRule,
  type ScoreSheetMode,
  type ScoreTotals,
} from "./score-sheet-model";
import { scorePendingStyle, scoreSummaryRowStyle } from "./score-sheet.style";

/** What the viewer changed in their own entry for one item. */
export interface ScoreEntryChange {
  readonly criterionKey: string;
  readonly score?: number | null;
  readonly rating?: string;
  readonly reason?: string;
}

/** Props for {@link ScoreSheet}. */
export interface ScoreSheetProps {
  /** The evaluation form's items, in source order. */
  readonly criteria: readonly ScoreCriterion[];
  /** Every evaluator's raw entries. */
  readonly raw: readonly RawScore[];
  /** The scores that count, one per settled item. */
  readonly resolved: readonly ResolvedScore[];
  /** Subtotals and the total as the server computed them. */
  readonly totals: ScoreTotals;
  readonly mode: ScoreSheetMode;
  /** Calculations held while an interpretation is open. */
  readonly holds: readonly ScoreHold[];
  /** The range each score rule allows, keyed by `scoreRuleKey`. */
  readonly rules: Readonly<Record<string, ScoreRule>>;
  /** The viewer's evaluator name, whose column is editable in `contractor` and `evaluator` mode. */
  readonly viewer?: string;
  /** Whether the round is confirmed, which lifts the evaluator-mode hiding. */
  readonly confirmed?: boolean;
  /** Headers for the printed `cells` columns, such as the item and its criterion. */
  readonly cellHeaders?: readonly string[];
  /** Receives an accepted change to the viewer's own entry. Out-of-range scores never arrive. */
  readonly onEntryChange?: (change: ScoreEntryChange) => void;
  /** Offered per item in `resolver` mode. */
  readonly onResolve?: (criterionKey: string) => void;
}

/** Draws a figure that may not have been computed, never as 0. */
function Figure({ figure }: { readonly figure: FigureText }) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  if (figure.kind === "value") return <NumericText weight="medium">{figure.value}</NumericText>;
  if (figure.kind === "held")
    return (
      <Stack gap="xs">
        <Text {...slotAttributes(scorePendingStyle, {})}>{t("scoreSheet.held")}</Text>
        {figure.labels.map((label) => (
          <Text key={label} size="caption" tone="muted">
            {label}
          </Text>
        ))}
      </Stack>
    );
  return <Text {...slotAttributes(scorePendingStyle, {})}>{t("scoreSheet.unresolved", { count: figure.count })}</Text>;
}

/** One evaluator's raw entry in a cell: score, rating, reason, and how much evidence is attached. */
function RawCell({ entry }: { readonly entry: RawScore | undefined }) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  if (!entry || entry.score === null) return <EmptyValue />;
  return (
    <Stack gap="xs">
      <NumericText weight="medium">{entry.score}</NumericText>
      {entry.rating && <Badge variant="outline">{entry.rating}</Badge>}
      {entry.reason && (
        <Text size="caption" tone="muted">
          {entry.reason}
        </Text>
      )}
      {entry.evidence.length > 0 && (
        <Text size="caption" tone="muted">
          {t("scoreSheet.evidence", { count: entry.evidence.length })}
        </Text>
      )}
    </Stack>
  );
}

/** The resolved score with what it rests on and who settled it. */
function ResolvedCell({ entry }: { readonly entry: ResolvedScore | undefined }) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  if (!entry) return <EmptyValue />;
  return (
    <Stack gap="xs">
      <NumericText weight="medium">{entry.score}</NumericText>
      <Badge variant={entry.basis === "RAW" ? "outline" : "secondary"}>{t(`scoreSheet.basis.${entry.basis}`)}</Badge>
      <Text size="caption" tone="muted">
        {entry.by}
      </Text>
    </Stack>
  );
}

const RESULT_TONE = { PASS: "success", FAIL: "danger", REVIEW_REQUIRED: "warning" } as const;

/** The viewer's own entries as form sections, one per item, bounded by each item's rule. */
function EntrySections({ criteria, raw, rules, viewer, onEntryChange }: {
  readonly criteria: readonly ScoreCriterion[];
  readonly raw: readonly RawScore[];
  readonly rules: Readonly<Record<string, ScoreRule>>;
  readonly viewer: string;
  readonly onEntryChange?: (change: ScoreEntryChange) => void;
}) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  const sections: RecordFormSection[] = criteria.map((criterion) => {
    const own = raw.find((r) => r.criterionKey === criterion.key && r.evaluator === viewer);
    const rule = rules[criterion.scoreRuleKey];
    const reason: RecordFormField = { kind: "textarea", key: `${criterion.key}::reason`, label: t("scoreSheet.reason"), value: own?.reason ?? "" };
    if (rule?.ratings && rule.ratings.length > 0) {
      // A graded item takes one choice; the score is the chosen grade's, so it is never typed.
      return {
        key: criterion.key,
        title: criterion.cells.join(" · "),
        columns: 1,
        fields: [
          {
            kind: "radio",
            key: `${criterion.key}::grade`,
            label: t("scoreSheet.rating"),
            value: own?.rating ?? "",
            options: rule.ratings.map((rating) => ({ value: rating.label, label: t("scoreSheet.ratingOption", { label: rating.label, score: rating.score }) })),
          },
          reason,
        ],
      };
    }
    return {
      key: criterion.key,
      title: criterion.cells.join(" · "),
      columns: 2,
      fields: [
        {
          kind: "number",
          key: `${criterion.key}::score`,
          label: t("scoreSheet.score"),
          value: own?.score ?? null,
          min: rule?.min,
          max: rule?.max,
          hint: rule ? t("scoreSheet.outOfRange", { min: rule.min, max: rule.max }) : undefined,
          disabled: rule === undefined,
        },
        { kind: "text", key: `${criterion.key}::rating`, label: t("scoreSheet.rating"), value: own?.rating ?? "" },
        reason,
      ],
    };
  });
  const base = useRecordFormValues(sections);
  const form = {
    ...base,
    set: (key: string, value: unknown) => {
      const [criterionKey = "", field] = key.split("::");
      const criterion = criteria.find((c) => c.key === criterionKey);
      if (field === "grade") {
        const label = typeof value === "string" ? value : "";
        const rating = criterion ? ratingOf(rules[criterion.scoreRuleKey], label) : undefined;
        if (!rating) return;
        base.set(key, label);
        onEntryChange?.({ criterionKey, rating: rating.label, score: rating.score });
        return;
      }
      if (field === "score") {
        const score = typeof value === "number" ? value : null;
        // Rejected rather than clamped: a clamped score is one the evaluator never entered.
        if (!criterion || !isScoreInRange(score, rules[criterion.scoreRuleKey])) return;
        base.set(key, score);
        onEntryChange?.({ criterionKey, score });
        return;
      }
      const text = typeof value === "string" ? value : "";
      base.set(key, text);
      onEntryChange?.(field === "rating" ? { criterionKey, rating: text } : { criterionKey, reason: text });
    },
  };
  return <RecordFormSections sections={sections} form={form} />;
}

/**
 * 평가 서식: an evaluation form's items in source order, each evaluator's raw entry, the score
 * that counts with what it rests on, and the category subtotals and total.
 *
 * <p><b>What a viewer sees depends on who they are.</b> The contractor sees and fills only its own
 * entry; an evaluator sees only their own raw column until the round is confirmed, so nobody scores
 * against another's number; the resolver sees every raw column side by side with a resolve action
 * per item. {@link scoreVisibility} decides it.
 *
 * <p><b>Figures come from the server.</b> Subtotals and the total are never summed here, and one
 * that is null is drawn as held or as the count of unresolved items, never as 0.
 */
export function ScoreSheet({ criteria, raw, resolved, totals, mode, holds, rules, viewer, confirmed = false, cellHeaders = [], onEntryChange, onResolve }: ScoreSheetProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  const visibility = scoreVisibility(mode, evaluatorsOf(raw), viewer, confirmed);
  const subtotals = visibility.totals ? subtotalRows(criteria, totals, holds, resolved) : [];
  const cellCount = Math.max(cellHeaders.length, ...criteria.map((c) => c.cells.length), 0);
  const leading = 1 + cellCount + 1;
  const trailing = visibility.evaluators.length + (visibility.resolved ? 1 : 0) + (visibility.resolveAction ? 1 : 0);

  return (
    <Stack gap="md">
      <TableCard>
        <Table className="min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead>{t("scoreSheet.category")}</TableHead>
              {Array.from({ length: cellCount }, (_, index) => (
                <TableHead key={`cell-${index}`}>{cellHeaders[index] ?? ""}</TableHead>
              ))}
              <TableHead>{t("scoreSheet.maxScore")}</TableHead>
              {visibility.evaluators.map((evaluator) => (
                <TableHead key={evaluator}>{evaluator}</TableHead>
              ))}
              {visibility.resolved && <TableHead>{t("scoreSheet.resolved")}</TableHead>}
              {visibility.resolveAction && <TableHead>{t("scoreSheet.action")}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {criteria.map((criterion) => {
              const rule = rules[criterion.scoreRuleKey];
              const subtotal = subtotals.find((s) => s.afterKey === criterion.key);
              return (
                <Fragment key={criterion.key}>
                  <TableRow>
                    <TableCell>
                      <Text size="caption" tone="muted">
                        {criterion.categoryPath.join(" › ")}
                      </Text>
                    </TableCell>
                    {Array.from({ length: cellCount }, (_, index) => (
                      <TableCell key={`cell-${index}`}>{criterion.cells[index] ?? ""}</TableCell>
                    ))}
                    <TableCell>{rule ? <NumericText>{rule.max}</NumericText> : <EmptyValue />}</TableCell>
                    {visibility.evaluators.map((evaluator) => (
                      <TableCell key={evaluator}>
                        <RawCell entry={raw.find((r) => r.criterionKey === criterion.key && r.evaluator === evaluator)} />
                      </TableCell>
                    ))}
                    {visibility.resolved && (
                      <TableCell>
                        <ResolvedCell entry={resolved.find((r) => r.criterionKey === criterion.key)} />
                      </TableCell>
                    )}
                    {visibility.resolveAction && (
                      <TableCell>
                        <Button size="sm" variant="outline" disabled={!onResolve} onClick={() => onResolve?.(criterion.key)}>
                          {t("scoreSheet.resolve")}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                  {subtotal && (
                    <TableRow {...partAttributes(scoreSummaryRowStyle, { total: false })}>
                      <TableCell colSpan={leading}>{t("scoreSheet.subtotal", { category: subtotal.category })}</TableCell>
                      <TableCell colSpan={Math.max(trailing, 1)}>
                        <Figure figure={subtotal.figure} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
            {visibility.totals && (
              <TableRow {...partAttributes(scoreSummaryRowStyle, { total: true })}>
                <TableCell colSpan={leading}>{t("scoreSheet.total")}</TableCell>
                <TableCell colSpan={Math.max(trailing, 1)}>
                  <Stack gap="xs">
                    <Figure figure={figureText(totals.total, holds, criteria, resolved)} />
                    {totals.result && <StatusBadge tone={RESULT_TONE[totals.result]} label={t(`scoreSheet.result.${totals.result}`)} />}
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableCard>
      {visibility.editable !== null && (
        <EntrySections criteria={criteria} raw={raw} rules={rules} viewer={visibility.editable} onEntryChange={onEntryChange} />
      )}
    </Stack>
  );
}
