import { useRef } from "react";
import { CircleAlertIcon, CircleCheckIcon, ChevronRightIcon, ClockIcon, MinusIcon } from "lucide-react";
import { slotAttributes } from "@simplix-react/ui/design";

import { useMarkTip } from "./chart-tip";
import { scheduleGoStyle } from "./dashboard.style";
import { chartEmptyStyle, matrixCellStyle, matrixIconStyle, riskHeadStyle, riskNameStyle, riskRowStyle } from "./chart.style";

/** Where one duty stands for one row. */
export type ObligationState = "done" | "due" | "overdue" | "none";

/** One cell: the duty's state, the short words printed in it, and the record it opens. */
export interface ObligationCell {
  readonly state: ObligationState;
  /** Printed in the cell beside the icon, such as 「제출」 or 「2/3」. */
  readonly text: string;
  /** The longer reading under the pointer, such as the deadline. */
  readonly note?: string;
  /** Opens the record behind the cell. */
  readonly onClick?: () => void;
}

/** One row of the matrix, such as a contractor. */
export interface ObligationRow {
  readonly key: string;
  readonly name: string;
  readonly sub?: string;
  readonly cells: Readonly<Record<string, ObligationCell>>;
  /** Opens the row's record. */
  readonly onClick: () => void;
}

/** Props for {@link ObligationMatrix}. */
export interface ObligationMatrixProps {
  /** What the matrix shows, for a screen reader. */
  readonly label: string;
  /** The header of the name column, read by a screen reader. */
  readonly nameLabel: string;
  readonly columns: readonly { readonly key: string; readonly label: string }[];
  readonly rows: readonly ObligationRow[];
  readonly emptyLabel: string;
  /** The words of each state, for the legend and the readings. */
  readonly stateLabels: Readonly<Record<ObligationState, string>>;
  readonly nameWidth?: string;
}

const ICON = { done: CircleCheckIcon, due: ClockIcon, overdue: CircleAlertIcon, none: MinusIcon } as const;

/**
 * Rows against duties, each cell the state of one duty for one row: done, still due, past its
 * deadline, or not owed. The state is carried by an icon and the cell's words as well as by its
 * tint, so it never reads by colour alone; a legend names the states. Every owed cell opens the
 * record behind it, and the name opens the row's record.
 */
export function ObligationMatrix({ label, nameLabel, columns, rows, emptyLabel, stateLabels, nameWidth = "minmax(0,1.4fr)" }: ObligationMatrixProps) {
  const box = useRef<HTMLDivElement>(null);
  const { bind, node } = useMarkTip(box);
  if (rows.length === 0) return <p {...slotAttributes(chartEmptyStyle, {})}>{emptyLabel}</p>;
  const grid = { gridTemplateColumns: `${nameWidth} ${columns.map(() => "minmax(72px,1fr)").join(" ")}` };
  return (
    <div className="flex flex-col gap-2">
      <div ref={box} role="table" aria-label={label} className="relative flex flex-col">
        <div role="row" className="grid items-end gap-x-1" style={grid} {...slotAttributes(riskHeadStyle, {})}>
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
          <div key={row.key} role="row" className="grid items-center gap-x-1" style={grid} {...slotAttributes(riskRowStyle, {})}>
            <span role="rowheader" className="min-w-0">
              <button type="button" onClick={row.onClick} className="group flex w-full items-center" {...slotAttributes(riskNameStyle, {})}>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{row.name}</span>
                  {row.sub ? <span className="truncate text-[12px] font-normal text-muted-foreground">{row.sub}</span> : null}
                </span>
                <ChevronRightIcon aria-hidden className="size-3.5 shrink-0" {...slotAttributes(scheduleGoStyle, {})} />
              </button>
            </span>
            {columns.map((c) => {
              const cell = row.cells[c.key] ?? { state: "none" as const, text: "-" };
              const Icon = ICON[cell.state];
              const reading = `${row.name} · ${c.label}: ${stateLabels[cell.state]}${cell.note ? ` · ${cell.note}` : ""}`;
              return (
                <span key={c.key} role="cell">
                  <button
                    type="button"
                    disabled={cell.state === "none" || !cell.onClick}
                    onClick={cell.onClick}
                    aria-label={reading}
                    {...bind(`${row.key}:${c.key}`, <span>{reading}</span>)}
                    {...slotAttributes(matrixCellStyle, { state: cell.state })}
                  >
                    <Icon aria-hidden {...slotAttributes(matrixIconStyle, { state: cell.state })} />
                    <span className="truncate">{cell.text}</span>
                  </button>
                </span>
              );
            })}
          </div>
        ))}
        {node}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[12px] text-muted-foreground" aria-hidden>
        {(["done", "due", "overdue", "none"] as const).map((state) => {
          const Icon = ICON[state];
          return (
            <span key={state} className="inline-flex items-center gap-1">
              <Icon {...slotAttributes(matrixIconStyle, { state })} />
              {stateLabels[state]}
            </span>
          );
        })}
      </div>
    </div>
  );
}
