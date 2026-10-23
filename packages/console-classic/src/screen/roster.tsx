import { TriangleAlertIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import { TableCard } from "../layout";
import {
  AlertBanner,
  Badge,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@simplix-react/ui";

import { NumericText, StrongText } from "../layout";

/** How a cell reads. */
export type RosterCellTone = "assigned" | "rest" | "breach";

/** One cell — what this row is down for on that column. */
export interface RosterCell {
  /** What is assigned, or empty when nobody has decided yet. */
  readonly value?: string;
  readonly tone?: RosterCellTone;
  /** Why the cell breaks a rule, drawn on the cell rather than saved for the save. */
  readonly breach?: string;
}

/** One row — a person, or whatever else is being rostered. */
export interface RosterRow {
  readonly key: string;
  readonly label: string;
  /** One per column, in column order. */
  readonly cells: readonly RosterCell[];
}

/** One column — a day. */
export interface RosterColumn {
  readonly key: string;
  readonly label: string;
  /** A public holiday or a weekend, which changes what an assignment on it means. */
  readonly nonWorking?: boolean;
}

interface RosterProps {
  /** What the top-left cell says the two axes are. */
  readonly corner: string;
  readonly columns: readonly RosterColumn[];
  readonly rows: readonly RosterRow[];
}

/**
 * How each cell tone reads.
 *
 * <p>`Text` carries the tone and `StrongText` the weight, so a cell says both through props rather
 * than through a class table — the tint a breach needs is `destructive`, which is a tone the design
 * system already names.
 */
const TONE: Readonly<Record<RosterCellTone, "default" | "muted" | "destructive">> = {
  assigned: "default",
  rest: "muted",
  breach: "destructive",
};

// A cell's own `text-center` stays: a table cell takes its alignment from a text-align class,
// which is what invariant #20 prescribes — there is no alignment prop on a head or a cell.

/**
 * 로스터 · 근무표 (P-36) — rows down the side, days across the top, an assignment in every cell.
 *
 * <p><b>Not a matrix.</b> A matrix puts a judgement where two classifications meet; a roster puts an
 * assignment where somebody and a date meet. Dates are what make the difference — and once there are
 * dates, weekends and public holidays have to show in the cells.
 *
 * <p><b>An empty cell is unassigned, and that is the problem the screen exists to surface.</b> A rest
 * day carries the word for it; a cell left blank is one nobody has decided, and the count of them is
 * drawn rather than left to the reader to find by scanning.
 *
 * <p><b>A rule broken shows in its cell.</b> Told only at save time, the reader has to hunt for which
 * of forty cells caused it.
 *
 * <p><b>Reading across and reading down answer different questions</b> — a row is one person's load
 * for the week, a column is that day's headcount. Both totals are drawn.
 */
export function Roster({ corner, columns, rows }: RosterProps) {
  const { t } = useTranslation("common");

  const unassigned = rows.reduce(
    (count, row) => count + row.cells.filter((cell) => !cell.value).length,
    0,
  );
  const breaches = rows.flatMap((row) =>
    row.cells.filter((cell) => cell.breach).map((cell) => `${row.label} · ${cell.breach ?? ""}`),
  );

  /** How many of a row's cells carry an assignment. */
  const rowTotal = (row: RosterRow) =>
    row.cells.filter((cell) => cell.value && cell.tone !== "rest").length;

  /** How many rows are assigned on one column. */
  const columnTotal = (index: number) =>
    rows.filter((row) => {
      const cell = row.cells[index];
      return cell?.value && cell.tone !== "rest";
    }).length;

  return (
    <Stack gap="md">
      {/* Bounded: whatever the caller hands it — a roster is a grid read across its columns, and a caller with a collection that grows narrows it before it reaches here. */}
      <TableCard>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{corner}</TableHead>
              {columns.map((column) => (
                <TableHead key={column.key} className="text-center">
                  <Stack gap="none" align="center">
                    <span>{column.label}</span>
                    {column.nonWorking && (
                      <Text size="caption" tone="muted">
                        {t("roster.nonWorking")}
                      </Text>
                    )}
                  </Stack>
                </TableHead>
              ))}
              <TableHead className="text-center">{t("roster.rowTotal")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell>
                  <StrongText>{row.label}</StrongText>
                </TableCell>
                {columns.map((column, index) => {
                  const cell = row.cells[index];
                  return (
                    <TableCell key={column.key} className="text-center">
                      {cell?.value ? (
                        cell.tone === "breach" ? (
                          <StrongText tone="destructive">{cell.value}</StrongText>
                        ) : (
                          <Text as="span" tone={TONE[cell.tone ?? "assigned"]}>
                            {cell.value}
                          </Text>
                        )
                      ) : (
                        // Never a dash: a blank that reads as a value hides the thing this screen
                        // is for. It is named, and the banner below counts how many there are.
                        // `outline` plus the muted class: the badge has no quiet variant — every
                        // filled one reads as a value, which is the one thing 「미배정」 must not do.
                        <Badge variant="outline" className="text-muted-foreground">
                          {t("roster.unassigned")}
                        </Badge>
                      )}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center">
                  <NumericText>{rowTotal(row)}</NumericText>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <StrongText>{t("roster.columnTotal")}</StrongText>
              </TableCell>
              {columns.map((column, index) => (
                <TableCell key={column.key} className="text-center">
                  <NumericText>{columnTotal(index)}</NumericText>
                </TableCell>
              ))}
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableCard>

      {breaches.length > 0 && (
        <AlertBanner
          tone="warning"
          icon={TriangleAlertIcon}
          title={t("roster.breachTitle", { count: breaches.length })}
          subtitle={breaches.join(" · ")}
        />
      )}

      {unassigned > 0 && (
        <AlertBanner
          tone="danger"
          icon={TriangleAlertIcon}
          title={t("roster.unassignedTitle", { count: unassigned })}
          subtitle={t("roster.unassignedBody")}
        />
      )}

      <Text size="caption" tone="muted">
        {t("roster.axesNote")}
      </Text>
    </Stack>
  );
}
