import { type CSSProperties, useEffect, useRef, useState } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { type MarkTone, markColor, useMarkTip } from "./chart-tip";
import { stageSpans } from "./chart-model";
import {
  chartEmptyStyle,
  stageCountStyle,
  stageKeyStyle,
  stageSegmentStyle,
  stageSwatchStyle,
  stageTrackStyle,
} from "./chart.style";

/** One stage of a flow, with how many items stand in it. */
export interface FlowStageCount {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  /** The stage's colour; stages default to the accent's ramp, light to dark in flow order. */
  readonly tone?: MarkTone;
  /** A line under the count in the reading, such as the oldest item's age. */
  readonly note?: string;
  /** Opens the list of the stage's items. */
  readonly onClick?: () => void;
}

/** Props for {@link StageFlowBar}. */
export interface StageFlowBarProps {
  /** What the bar counts, for a screen reader and the reading, such as 「내 허가」. */
  readonly label: string;
  readonly stages: readonly FlowStageCount[];
  /** The unit after each count. */
  readonly unit?: string;
  /** The line shown instead of the bar when no stage holds anything. */
  readonly emptyLabel: string;
  /** Hides the keys under the bar, for a bar drawn inside a row that names its stages elsewhere. */
  readonly compact?: boolean;
}

/** Whether the part has been on the screen for a frame, so its marks ease in from zero. */
export function useDrawn(): boolean {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return drawn;
}

/** The default tone of the stage at `index` of `count`: the accent ramp, light to dark. */
function rampTone(index: number, count: number): MarkTone {
  const step = count <= 1 ? 5 : Math.round(1 + (index * 4) / (count - 1));
  return `step-${step as 1 | 2 | 3 | 4 | 5}`;
}

/**
 * Items of one kind across the stages of their flow, as one bar split by stage, with each stage's
 * name and count under it.
 *
 * <p>Each segment and each key opens that stage's list. A stage with nothing in it takes no width
 * on the bar and its key is drawn muted, so the flow's order still reads in full. Pointing at or
 * focusing a segment or a key shows the stage's reading and dims the other segments.
 */
export function StageFlowBar({ label, stages, unit = "건", emptyLabel, compact = false }: StageFlowBarProps) {
  const box = useRef<HTMLDivElement>(null);
  const drawn = useDrawn();
  const { bind, node, hot } = useMarkTip(box);
  const total = stages.reduce((sum, s) => sum + s.value, 0);
  const spans = new Map(stageSpans(stages).map((s) => [s.key, s]));
  const toneOf = (i: number) => stages[i].tone ?? rampTone(i, stages.length);
  const reading = (s: FlowStageCount) => (
    <span className="flex flex-col">
      <span>
        {label} · {s.label} <b className="tabular-nums">{s.value}</b>
        {unit} / {total}
        {unit}
      </span>
      {s.note ? <span className="text-muted-foreground">{s.note}</span> : null}
    </span>
  );
  const summary = `${label} ${total}${unit}: ${stages.map((s) => `${s.label} ${s.value}${unit}`).join(", ")}`;

  if (total === 0) return <p {...slotAttributes(chartEmptyStyle, {})}>{emptyLabel}</p>;
  return (
    <div ref={box} className="relative flex flex-col gap-2">
      <div role="group" aria-label={summary} className="relative w-full" {...slotAttributes(stageTrackStyle, {})}>
        {stages.map((s, i) => {
          const span = spans.get(s.key);
          if (!span) return null;
          // A 2px surface gap between touching segments, taken from the right of all but the last.
          const last = span.start + span.width >= 0.9999;
          return (
            <button
              key={s.key}
              type="button"
              aria-label={`${s.label} ${s.value}${unit}`}
              onClick={s.onClick}
              disabled={!s.onClick}
              style={
                {
                  "--mark": markColor(toneOf(i)),
                  left: drawn ? `${span.start * 100}%` : 0,
                  width: drawn ? `calc(${span.width * 100}% - ${last ? 0 : 2}px)` : 0,
                } as CSSProperties
              }
              {...bind(s.key, reading(s))}
              {...slotAttributes(stageSegmentStyle, { dimmed: hot !== null && hot !== s.key })}
            />
          );
        })}
      </div>
      {compact ? null : (
        <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
          {stages.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={s.onClick}
              disabled={!s.onClick}
              className="inline-flex items-center"
              style={{ "--mark": markColor(toneOf(i)) } as CSSProperties}
              {...bind(s.key, reading(s))}
              {...slotAttributes(stageKeyStyle, { empty: s.value === 0 })}
            >
              <i aria-hidden {...slotAttributes(stageSwatchStyle, { empty: s.value === 0 })} />
              <span>{s.label}</span>
              <span {...slotAttributes(stageCountStyle, {})}>{s.value}</span>
            </button>
          ))}
        </div>
      )}
      {node}
    </div>
  );
}
