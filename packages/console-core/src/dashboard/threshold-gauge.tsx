import type { CSSProperties } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { markColor } from "./chart-tip";
import { gaugeArcStyle, gaugeFigureStyle, gaugeLabelStyle, gaugeTickStyle, gaugeTrackStyle, thresholdGaugeStyle } from "./figure-parts.style";

/** Where a gauge stands: below its threshold, past it, or at its limit. */
export type GaugeTone = "neutral" | "warning" | "danger";

const RADIUS = 40;
const STROKE = 8;
const CENTRE = { x: 50, y: 50 };

/**
 * The point on the half ring at a share of the way round, from the left end (0) to the right (1).
 *
 * @param share how far round, from 0 to 1
 */
export function gaugePoint(share: number): { readonly x: number; readonly y: number } {
  const angle = Math.PI * (1 - Math.min(1, Math.max(0, share)));
  return { x: CENTRE.x + RADIUS * Math.cos(angle), y: CENTRE.y - RADIUS * Math.sin(angle) };
}

/**
 * The tone a reading stands in: red at or past its limit, amber at or past its threshold.
 *
 * @param value the reading
 * @param max the limit
 * @param threshold the share of the limit from which it warns
 */
export function gaugeTone(value: number, max: number, threshold: number): GaugeTone {
  if (!(max > 0)) return "neutral";
  if (value >= max) return "danger";
  if (value / max >= threshold) return "warning";
  return "neutral";
}

/** Props for {@link ThresholdGauge}. */
export interface ThresholdGaugeProps {
  readonly value: number;
  readonly max: number;
  /** The share of `max` from which the reading warns, marked on the ring; 0.8 when absent. */
  readonly threshold?: number;
  /** The figure in the middle as the reader reads it (`₩42,000`, `3 / 5`). */
  readonly text: string;
  /** What the gauge reads, under the figure and to a screen reader. */
  readonly label: string;
}

/**
 * A half ring reading a value against its limit, with a tick at the threshold: a cost breaker's
 * spend against its trip point, a budget against its cap. Amber past the threshold, red at the
 * limit, the figure in the middle.
 */
export function ThresholdGauge({ value, max, threshold = 0.8, text, label }: ThresholdGaugeProps) {
  const share = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const tone = gaugeTone(value, max, threshold);
  const start = gaugePoint(0);
  const end = gaugePoint(share);
  const tickIn = gaugePoint(threshold);
  const tickOut = { x: CENTRE.x + (tickIn.x - CENTRE.x) * 1.25, y: CENTRE.y + (tickIn.y - CENTRE.y) * 1.25 };
  const whole = gaugePoint(1);
  return (
    <div role="img" aria-label={`${label}: ${text}`} data-tone={tone} {...slotAttributes(thresholdGaugeStyle, {})}>
      <svg viewBox="0 0 100 56" className="w-32" aria-hidden>
        <path d={`M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 0 1 ${whole.x} ${whole.y}`} fill="none" strokeWidth={STROKE} strokeLinecap="round" {...slotAttributes(gaugeTrackStyle, {})} />
        {share > 0 ? (
          <path
            d={`M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 0 1 ${end.x} ${end.y}`}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            style={{ "--mark": markColor(tone === "neutral" ? "accent" : tone) } as CSSProperties}
            {...slotAttributes(gaugeArcStyle, {})}
          />
        ) : null}
        <line x1={tickIn.x} y1={tickIn.y} x2={tickOut.x} y2={tickOut.y} strokeWidth={1.5} {...slotAttributes(gaugeTickStyle, {})} />
      </svg>
      <span {...slotAttributes(gaugeFigureStyle, {})}>{text}</span>
      <span {...slotAttributes(gaugeLabelStyle, {})}>{label}</span>
    </div>
  );
}
