import { type CSSProperties, useRef } from "react";
import { ChevronRightIcon } from "lucide-react";
import { slotAttributes } from "@simplix-react/ui/design";

import { type MarkTone, markColor, useMarkTip } from "./chart-tip";
import { heatStep } from "./chart-model";
import { scheduleGoStyle } from "./dashboard.style";
import { chartEmptyStyle, riskCellStyle, riskHeadStyle, riskLevelStyle, riskNameStyle, riskRowStyle, riskTextStyle } from "./chart.style";

/** A column of a risk table: a count shaded by heat, or a line of text such as a grade. */
export interface RiskColumn {
  readonly key: string;
  readonly label: string;
  /** `count` shades the cell by its value against the column's largest; `text` prints it plain. */
  readonly kind?: "count" | "text";
  /** The colour a count column heats toward; danger by default. */
  readonly tone?: MarkTone;
}

/** One cell of a row. */
export interface RiskCell {
  readonly value: number | string;
  /** Opens the list of what the count counts, for this row. */
  readonly onClick?: () => void;
}

/** One row of a risk table, such as a contractor. */
export interface RiskRowEntry {
  readonly key: string;
  readonly name: string;
  /** A line under the name, such as the contract. */
  readonly sub?: string;
  /** How risky the row reads overall; drawn as the dot before the name and spoken with it. */
  readonly level: "high" | "mid" | "low" | "none";
  /** The words for the level, such as 「위험 높음」. */
  readonly levelLabel: string;
  readonly cells: Readonly<Record<string, RiskCell>>;
  /** Opens the row's record. */
  readonly onClick: () => void;
}

/** Props for {@link RiskRows}. */
export interface RiskRowsProps {
  /** What the table lists, for a screen reader. */
  readonly label: string;
  readonly columns: readonly RiskColumn[];
  /** The rows in the order to draw them; the caller sorts them by risk. */
  readonly rows: readonly RiskRowEntry[];
  readonly emptyLabel: string;
  /** The header of the name column, read by a screen reader, such as 「업체」. */
  readonly nameLabel: string;
  /** The unit after each count. */
  readonly unit?: string;
  /** The width of the name column. */
  readonly nameWidth?: string;
}

/**
 * Rows compared across a few counts, as a compact heat table: the name with its level dot, then
 * one shaded cell per count, heated against the largest value in its column.
 *
 * <p>The name opens the row's record and each counted cell opens that count's list for the row.
 * A zero cell is drawn without shading and cannot be pressed. The shade is a second channel: the
 * number is always printed, and the reading names the column and the row.
 */
export function RiskRows({ label, columns, rows, emptyLabel, nameLabel, unit = "건", nameWidth = "minmax(0,1.6fr)" }: RiskRowsProps) {
  const box = useRef<HTMLDivElement>(null);
  const { bind, node } = useMarkTip(box);
  if (rows.length === 0) return <p {...slotAttributes(chartEmptyStyle, {})}>{emptyLabel}</p>;
  const max = Object.fromEntries(columns.map((c) => [c.key, Math.max(0, ...rows.map((r) => (typeof r.cells[c.key]?.value === "number" ? (r.cells[c.key].value as number) : 0)))]));
  const grid = { gridTemplateColumns: `${nameWidth} ${columns.map(() => "minmax(52px,1fr)").join(" ")}` };
  return (
    <div ref={box} role="table" aria-label={label} className="relative flex flex-col">
      <div role="row" className="grid items-end" style={grid} {...slotAttributes(riskHeadStyle, {})}>
        <span role="columnheader">
          <span className="sr-only">{nameLabel}</span>
        </span>
        {columns.map((c) => (
          <span key={c.key} role="columnheader" className="truncate text-center">
            {c.label}
          </span>
        ))}
      </div>
      {rows.map((row) => (
        <div key={row.key} role="row" className="grid items-center" style={grid} {...slotAttributes(riskRowStyle, {})}>
          <span role="rowheader" className="min-w-0">
            <button type="button" onClick={row.onClick} aria-label={`${row.name}, ${row.levelLabel}`} className="group flex w-full items-center" {...slotAttributes(riskNameStyle, {})}>
              <i aria-hidden {...slotAttributes(riskLevelStyle, { level: row.level })} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{row.name}</span>
                {row.sub ? <span className="truncate text-[12px] font-normal text-muted-foreground">{row.sub}</span> : null}
              </span>
              <ChevronRightIcon aria-hidden className="size-3.5 shrink-0" {...slotAttributes(scheduleGoStyle, {})} />
            </button>
          </span>
          {columns.map((c) => {
            const cell = row.cells[c.key];
            if (c.kind === "text" || typeof cell?.value === "string")
              return (
                <span key={c.key} role="cell" {...slotAttributes(riskTextStyle, {})}>
                  {cell?.value ?? "-"}
                </span>
              );
            const value = (cell?.value as number | undefined) ?? 0;
            const heat = String(heatStep(value, max[c.key])) as "0" | "1" | "2" | "3" | "4";
            return (
              <span key={c.key} role="cell" className="px-0.5">
                <button
                  type="button"
                  disabled={value === 0 || !cell?.onClick}
                  onClick={cell?.onClick}
                  aria-label={`${row.name} ${c.label} ${value}${unit}`}
                  className="w-full"
                  style={{ "--mark": markColor(c.tone ?? "danger") } as CSSProperties}
                  {...(value > 0 ? bind(`${row.key}:${c.key}`, <span>{row.name} · {c.label} <b className="tabular-nums">{value}</b>{unit}</span>) : {})}
                  {...slotAttributes(riskCellStyle, { heat })}
                >
                  {value}
                </button>
              </span>
            );
          })}
        </div>
      ))}
      {node}
    </div>
  );
}
