import { useTranslation } from "@simplix-react/i18n/react";
import { Badge, Button, Flex, Stack, Text } from "@simplix-react/ui";
import { partAttributes } from "@simplix-react/ui/design";

import { gridEmptyMarkStyle } from "./grids.style";
import {
  CHECK_VERDICTS,
  checkCellState,
  checkKey,
  checkSummary,
  isCheckColumnEditable,
  type CheckVerdict,
} from "./grid-cells";
import { PACKAGE_NAMESPACE } from "./locales";
import { Matrix, type MatrixCell, type MatrixRow } from "./matrix";

/** One round column. */
export interface CheckColumn {
  readonly key: string;
  readonly label: string;
  /** The round's date, already formatted by the caller, shown under the label. */
  readonly date?: string;
}

/** One item row, in the order the form lists it. */
export interface CheckRow {
  readonly key: string;
  readonly label: string;
  /** The groups the item sits under; the depth indents the row. */
  readonly categoryPath?: readonly string[];
}

/** Props for {@link CheckMatrix}. */
export interface CheckMatrixProps {
  readonly columns: readonly CheckColumn[];
  readonly rows: readonly CheckRow[];
  /** Verdicts by `rowKey:columnKey`; `null` or absent is not checked. */
  readonly values: Readonly<Record<string, CheckVerdict | null>>;
  /** The marks the form uses for good, deficient and not applicable, in that order. */
  readonly labels: readonly [string, string, string];
  /** The rounds that accept input; every other round is read only. */
  readonly editableColumns: readonly string[];
  /** Called with a cell's row, round and new verdict (`null` when cleared) in an editable round. */
  readonly onValueChange?: (rowKey: string, columnKey: string, value: CheckVerdict | null) => void;
  /** Called when a deficient cell is chosen, so the caller opens that round's finding entry. */
  readonly onDeficient?: (rowKey: string, columnKey: string) => void;
}

/**
 * Items by rounds, each cell a verdict from the form's own marks.
 *
 * <p><b>Not checked is its own state.</b> An empty cell is drawn as a dashed 「not checked」 mark,
 * never as a blank and never as any of the three verdicts, so a missed round is visible down the
 * column.
 *
 * <p><b>Only listed rounds take input.</b> A past round stays as it was recorded.
 */
export function CheckMatrix({
  columns,
  rows,
  values,
  labels,
  editableColumns,
  onValueChange,
  onDeficient,
}: CheckMatrixProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/grids`);
  const labelOf = (verdict: CheckVerdict) => labels[CHECK_VERDICTS.indexOf(verdict)];
  const summary = checkSummary(
    rows.map((r) => r.key),
    columns.map((c) => c.key),
    values,
  );

  const matrixRows: MatrixRow[] = rows.map((row) => ({
    key: row.key,
    label: row.label,
    depth: row.categoryPath?.length,
    cells: columns.map((column): MatrixCell => {
      const state = checkCellState(values[checkKey(row.key, column.key)]);
      const current = state.kind === "verdict" ? state.verdict : null;
      const tone = current === "BAD" ? "danger" : current === null ? "muted" : undefined;

      if (isCheckColumnEditable(column.key, editableColumns)) {
        return {
          tone,
          value: (
            <Flex gap="xs" wrap justify="center">
              {CHECK_VERDICTS.map((verdict) => {
                const selected = current === verdict;
                return (
                  <Button
                    key={verdict}
                    size="xs"
                    variant={selected ? (verdict === "BAD" ? "destructive" : "default") : "outline"}
                    aria-pressed={selected}
                    onClick={() => {
                      const next = selected ? null : verdict;
                      onValueChange?.(row.key, column.key, next);
                      if (next === "BAD") onDeficient?.(row.key, column.key);
                    }}
                  >
                    {labelOf(verdict)}
                  </Button>
                );
              })}
            </Flex>
          ),
          note: current === null ? t("check.empty") : undefined,
        };
      }

      return {
        tone,
        value:
          current === null ? (
            <Badge variant="outline" {...partAttributes(gridEmptyMarkStyle, {})}>
              {t("check.empty")}
            </Badge>
          ) : (
            <Badge variant={current === "BAD" ? "destructive" : "secondary"}>{labelOf(current)}</Badge>
          ),
      };
    }),
  }));

  return (
    <Stack gap="sm">
      <Flex gap="sm" wrap>
        {summary.bad > 0 ? <Badge variant="destructive">{t("check.badCount", { count: summary.bad })}</Badge> : null}
        {summary.unchecked > 0 ? (
          <Text size="caption" tone="muted">
            {t("check.uncheckedCount", { count: summary.unchecked })}
          </Text>
        ) : null}
      </Flex>
      <Matrix
        corner={t("check.corner")}
        columns={columns.map((column) =>
          column.date ? (
            <Stack gap="none" key={column.key}>
              <Text as="span" size="caption">{column.label}</Text>
              <Text as="span" size="caption" tone="muted">
                {column.date}
              </Text>
            </Stack>
          ) : (
            column.label
          ),
        )}
        rows={matrixRows}
        align="center"
      />
    </Stack>
  );
}
