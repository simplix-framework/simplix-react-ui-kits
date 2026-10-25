import { type CSSProperties, useRef } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { markColor, useMarkTip } from "./chart-tip";
import { ringDash, ringReading } from "./chart-model";
import { ringFiguresStyle, ringFillStyle, ringLabelStyle, ringNoteStyle, ringPercentStyle, ringStyle, ringTrackStyle } from "./chart.style";
import { useDrawn } from "./stage-flow-bar";

/** Props for {@link ProgressRing}. */
export interface ProgressRingProps {
  /** What is measured, such as 「합동점검」. */
  readonly label: string;
  readonly done: number;
  /** How many were due in the period; computed by the caller from the rule, never typed. */
  readonly due: number;
  readonly unit?: string;
  /** The period and the rule behind the figure, shown in the reading, such as 「2026년 3분기 · 분기 1회」. */
  readonly basis?: string;
  /** What the ring says when nothing was due. */
  readonly noneLabel?: string;
  /** Below this share the fill turns to the warning tone; below `dangerBelow`, to danger. */
  readonly warnBelow?: number;
  readonly dangerBelow?: number;
  /**
   * The fill's tone when the caller knows more than the share: an obligation whose period is still
   * open reads as on track at any share, one past its period end reads as danger.
   */
  readonly tone?: "accent" | "warning" | "danger" | "neutral";
  /** A line after the figures, such as 「기한 지남 1건」. */
  readonly note?: string;
  /** How the two figures are written, such as amounts in won. */
  readonly format?: (value: number) => string;
  /** Opens the list of what is still due. */
  readonly onClick?: () => void;
}

const SIZE = 56;
const STROKE = 6;
const R = (SIZE - STROKE) / 2;

/**
 * Done against due as a ring, with the label and the two figures beside it.
 *
 * <p>The fill carries severity: the accent when everything due is done, warning and danger below
 * the thresholds; the track is a lighter step of the same colour. Nothing due draws a muted ring
 * and the 「none due」 words instead of 0 %. The whole ring is one control that opens what is
 * still due, and its reading names the period and the rule behind the figure.
 */
export function ProgressRing({ label, done, due, unit = "건", basis, noneLabel = "해당 없음", warnBelow, dangerBelow, tone, note, format = (v) => v.toLocaleString(), onClick }: ProgressRingProps) {
  const box = useRef<HTMLDivElement>(null);
  const drawn = useDrawn();
  const { bind, node } = useMarkTip(box);
  const reading = ringReading(done, due, warnBelow, dangerBelow);
  const { dasharray } = ringDash(drawn ? reading.ratio : 0, R);
  const figures = reading.percent === null ? noneLabel : `${format(done)}/${format(due)}${unit}`;
  const shownTone = reading.percent === null ? "neutral" : tone ?? reading.tone;
  const spoken = reading.percent === null ? `${label}: ${noneLabel}` : `${label}: ${format(due)}${unit} 중 ${format(done)}${unit}, ${reading.percent}%${note ? `, ${note}` : ""}${basis ? `, ${basis}` : ""}`;
  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        aria-label={spoken}
        className="flex w-full items-center"
        style={{ "--mark": markColor(shownTone) } as CSSProperties}
        {...bind("ring", <span>{basis ? `${basis} · ` : ""}{figures}{reading.percent !== null && due - done > 0 ? ` · 남은 ${format(due - done)}${unit}` : ""}</span>)}
        {...slotAttributes(ringStyle, {})}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden className="shrink-0">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} strokeWidth={STROKE} {...slotAttributes(ringTrackStyle, {})} />
          {reading.percent !== null && reading.ratio > 0 ? (
            <circle cx={SIZE / 2} cy={SIZE / 2} r={R} strokeWidth={STROKE} strokeDasharray={dasharray} transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`} {...slotAttributes(ringFillStyle, {})} />
          ) : null}
          <text x={SIZE / 2} y={SIZE / 2 + 4.5} textAnchor="middle" {...slotAttributes(ringPercentStyle, {})}>
            {reading.percent === null ? "-" : `${reading.percent}%`}
          </text>
        </svg>
        <span className="flex min-w-0 flex-col">
          <span className="truncate" {...slotAttributes(ringLabelStyle, {})}>
            {label}
          </span>
          <span {...slotAttributes(ringFiguresStyle, {})}>{figures}</span>
          {note ? <span {...slotAttributes(ringNoteStyle, {})}>{note}</span> : null}
        </span>
      </button>
      {node}
    </div>
  );
}
