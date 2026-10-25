import { type CSSProperties } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { type MarkTone, markColor } from "./chart-tip";
import { useDrawn } from "./stage-flow-bar";
import {
  chartEmptyStyle,
  meterFiguresStyle,
  meterFillStyle,
  meterLabelStyle,
  meterRowStyle,
  meterShareStyle,
  meterSubStyle,
  meterTrackStyle,
} from "./chart.style";

/** One measured row: how much of a whole is used, such as a contract's budget executed. */
export interface MeterEntry {
  readonly key: string;
  readonly label: string;
  readonly sub?: string;
  readonly value: number;
  readonly total: number;
  readonly tone?: MarkTone;
  /** Opens the record behind the row. */
  readonly onClick?: () => void;
}

/** Props for {@link MeterList}. */
export interface MeterListProps {
  /** What the rows measure, for a screen reader, such as 「계약별 안전예산 집행률」. */
  readonly label: string;
  readonly entries: readonly MeterEntry[];
  readonly emptyLabel: string;
  /** The unit after each figure. */
  readonly unit?: string;
  /** How a figure is printed; plain digits by default. */
  readonly format?: (value: number) => string;
}

/**
 * Several wholes compared by how much of each is used, as one thin bar per row on a shared 0 to 100%
 * scale, with the share and the two figures printed beside the name. Rows sort by the caller.
 */
export function MeterList({ label, entries, emptyLabel, unit = "", format = (n) => n.toLocaleString("en-US") }: MeterListProps) {
  const drawn = useDrawn();
  if (entries.length === 0) return <p {...slotAttributes(chartEmptyStyle, {})}>{emptyLabel}</p>;
  return (
    <ul aria-label={label} className="flex flex-col">
      {entries.map((e) => {
        const share = e.total > 0 ? Math.min(100, Math.round((e.value / e.total) * 100)) : 0;
        const reading = `${e.label} ${share}% · ${format(e.value)}${unit} / ${format(e.total)}${unit}`;
        const body = (
          <>
            <span className="flex min-w-0 flex-col">
              <span className="truncate" {...slotAttributes(meterLabelStyle, {})}>{e.label}</span>
              {e.sub ? <span className="truncate" {...slotAttributes(meterSubStyle, {})}>{e.sub}</span> : null}
            </span>
            <span className="flex flex-col items-end tabular-nums" {...slotAttributes(meterFiguresStyle, {})}>
              <b {...slotAttributes(meterShareStyle, {})}>{share}%</b>
              <span {...slotAttributes(meterSubStyle, {})}>
                {format(e.value)}
                {unit} / {format(e.total)}
                {unit}
              </span>
            </span>
            <span aria-hidden {...slotAttributes(meterTrackStyle, {})}>
              <span style={{ width: drawn ? `${share}%` : "0%", "--mark": markColor(e.tone ?? "accent") } as CSSProperties} {...slotAttributes(meterFillStyle, {})} />
            </span>
          </>
        );
        return (
          <li key={e.key}>
            {e.onClick ? (
              <button type="button" onClick={e.onClick} aria-label={reading} title={reading} {...slotAttributes(meterRowStyle, {})}>
                {body}
              </button>
            ) : (
              <div aria-label={reading} {...slotAttributes(meterRowStyle, {})}>
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
