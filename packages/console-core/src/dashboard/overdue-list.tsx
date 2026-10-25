import { type CSSProperties, useRef } from "react";
import { ChevronRightIcon } from "lucide-react";
import { slotAttributes } from "@simplix-react/ui/design";

import { type MarkTone, markColor, useMarkTip } from "./chart-tip";
import { scheduleGoStyle, taskSubStyle, taskTitleStyle } from "./dashboard.style";
import {
  chartEmptyStyle,
  overdueAgeCellStyle,
  overdueAgeLabelStyle,
  overdueAgeStyle,
  overdueRowStyle,
  overdueUnitStyle,
  stageCountStyle,
} from "./chart.style";
import { useDrawn } from "./stage-flow-bar";

/** One stalled stage: how many items wait past their deadline, and how long the oldest has waited. */
export interface OverdueEntry {
  readonly key: string;
  /** The stage, such as 「검사 대기 허가」. */
  readonly label: string;
  /** Who or what holds it, under the label. */
  readonly sub?: string;
  readonly count: number;
  /** How long the oldest item is past its deadline, in days; the bar is drawn against the longest. */
  readonly ageDays: number;
  /** The age as the workplace words it, such as 「6일 지남」 or 「3시간 지남」. */
  readonly ageLabel: string;
  readonly tone?: MarkTone;
  /** Opens the stage's list narrowed to the items past their deadline; a reader who cannot open that list gets the row without it. */
  readonly onClick?: () => void;
}

/** Props for {@link OverdueList}. */
export interface OverdueListProps {
  readonly entries: readonly OverdueEntry[];
  readonly unit?: string;
  readonly emptyLabel: string;
}

/**
 * Stages whose items have passed their deadline, oldest first, each with its count and a bar of
 * how long its oldest item has waited against the longest wait in the list.
 *
 * <p>A row opens the stage's list narrowed to those items. The order is the caller's; the list
 * sorts by age so the item that has waited longest is read first.
 */
export function OverdueList({ entries, unit = "건", emptyLabel }: OverdueListProps) {
  const box = useRef<HTMLDivElement>(null);
  const drawn = useDrawn();
  const { bind, node } = useMarkTip(box);
  if (entries.length === 0) return <p {...slotAttributes(chartEmptyStyle, {})}>{emptyLabel}</p>;
  const sorted = [...entries].sort((a, b) => b.ageDays - a.ageDays);
  const longest = Math.max(...sorted.map((e) => e.ageDays), 1);
  return (
    <div ref={box} className="relative flex flex-col">
      {sorted.map((e) => (
        <button
          key={e.key}
          type="button"
          onClick={e.onClick}
          disabled={!e.onClick}
          aria-label={`${e.label} ${e.count}${unit}, 가장 오래된 항목 ${e.ageLabel}`}
          className="group grid grid-cols-[minmax(0,1fr)_minmax(64px,28%)_auto_16px] items-center"
          style={{ "--mark": markColor(e.tone ?? "danger") } as CSSProperties}
          {...bind(e.key, <span>{e.label} · <b className="tabular-nums">{e.count}</b>{unit} · 가장 오래된 항목 {e.ageLabel}</span>)}
          {...slotAttributes(overdueRowStyle, {})}
        >
          <span className="flex min-w-0 flex-col">
            <span className="truncate" {...slotAttributes(taskTitleStyle, {})}>
              {e.label}
            </span>
            {e.sub ? (
              <span className="truncate" {...slotAttributes(taskSubStyle, {})}>
                {e.sub}
              </span>
            ) : null}
          </span>
          <span className="flex flex-col" {...slotAttributes(overdueAgeCellStyle, {})}>
            <i aria-hidden style={{ width: drawn ? `${Math.max(6, (e.ageDays / longest) * 100)}%` : 0 }} {...slotAttributes(overdueAgeStyle, {})} />
            <span className="tabular-nums" {...slotAttributes(overdueAgeLabelStyle, {})}>{e.ageLabel}</span>
          </span>
          <span className="min-w-8" {...slotAttributes(stageCountStyle, { align: "end" })}>
            {e.count}
            <span {...slotAttributes(overdueUnitStyle, {})}>{unit}</span>
          </span>
          {e.onClick ? <ChevronRightIcon aria-hidden className="size-3.5" {...slotAttributes(scheduleGoStyle, {})} /> : <span aria-hidden />}
        </button>
      ))}
      {node}
    </div>
  );
}
