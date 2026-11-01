import type { CSSProperties } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { type MarkTone, markColor } from "./chart-tip";
import { segmentBarStyle, segmentEntryStyle, segmentFigureStyle, segmentLegendStyle, segmentPartStyle, segmentSwatchStyle, segmentTrackStyle } from "./figure-parts.style";

/** One part of a whole: what is granted, held or spent of a balance. */
export interface Segment {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly tone?: MarkTone;
  /** The figure as the reader reads it (`1,200 credits`); the plain number otherwise. */
  readonly text?: string;
}

/**
 * Each part's share of the bar, in percent, so the bar's width is the whole: the parts' sum, or
 * `total` where the whole is larger than its drawn parts. A part of 0 or less takes no width.
 *
 * @param segments the parts
 * @param total the whole, where it is not the parts' sum
 */
export function segmentShares(segments: readonly Pick<Segment, "value">[], total?: number): number[] {
  const sum = segments.reduce((acc, one) => acc + Math.max(0, one.value), 0);
  const whole = Math.max(sum, total ?? 0);
  if (whole <= 0) return segments.map(() => 0);
  return segments.map((one) => (Math.max(0, one.value) / whole) * 100);
}

/** Props for {@link SegmentBar}. */
export interface SegmentBarProps {
  /** What the bar splits, for a screen reader (「Credits this month」). */
  readonly label: string;
  readonly segments: readonly Segment[];
  /** The whole, where it is larger than the parts drawn (a limit not yet reached). */
  readonly total?: number;
}

/**
 * A whole split into its parts as one bar, each part as wide as its share, with a legend naming
 * each part and its figure. The order is the caller's, the order the parts happen in.
 */
export function SegmentBar({ label, segments, total }: SegmentBarProps) {
  const shares = segmentShares(segments, total);
  const reading = segments.map((one) => `${one.label} ${one.text ?? one.value}`).join(", ");
  return (
    <div {...slotAttributes(segmentBarStyle, {})}>
      <div role="img" aria-label={`${label}: ${reading}`} {...slotAttributes(segmentTrackStyle, {})}>
        {segments.map((one, index) => (
          <span
            key={one.key}
            style={{ width: `${shares[index] ?? 0}%`, "--mark": markColor(one.tone ?? (`series-${(index % 3) + 1}` as MarkTone)) } as CSSProperties}
            {...slotAttributes(segmentPartStyle, {})}
          />
        ))}
      </div>
      <ul aria-hidden {...slotAttributes(segmentLegendStyle, {})}>
        {segments.map((one, index) => (
          <li key={one.key} {...slotAttributes(segmentEntryStyle, {})}>
            <span style={{ "--mark": markColor(one.tone ?? (`series-${(index % 3) + 1}` as MarkTone)) } as CSSProperties} {...slotAttributes(segmentSwatchStyle, {})} />
            {one.label}
            <span {...slotAttributes(segmentFigureStyle, {})}>{one.text ?? one.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
