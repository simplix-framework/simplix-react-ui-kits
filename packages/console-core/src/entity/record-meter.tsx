import type { CSSProperties } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { markColor } from "../dashboard/chart-tip";

import { recordMeterFiguresStyle, recordMeterFillStyle, recordMeterStyle, recordMeterTrackStyle } from "./record-meter.style";

/** How near its limit a meter stands, which is the tone it is drawn in. */
export type MeterTone = "neutral" | "warning" | "danger";

/** A spent-of-limit reading: how much of a budget, a balance or a quota is used. */
export interface RecordMeterValue {
  readonly value: number;
  /** The limit; 0 or less reads as no limit, which is drawn with no bar. */
  readonly total: number;
  /** The two figures as the reader reads them (`₩12,000 / ₩50,000`); the plain numbers otherwise. */
  readonly text?: string;
  /** The share from which the bar turns amber; 0.8 when absent. Red is at the limit. */
  readonly warnAt?: number;
}

/**
 * The share of the limit spent, from 0 to 100 and capped at 100, or `undefined` with no limit.
 *
 * @param meter the reading
 */
export function meterShare(meter: Pick<RecordMeterValue, "value" | "total">): number | undefined {
  if (!(meter.total > 0)) return undefined;
  return Math.min(100, Math.max(0, Math.round((meter.value / meter.total) * 100)));
}

/**
 * The tone a reading is drawn in: red at or past its limit (nothing more can be spent), amber from
 * `warnAt` of it, neutral below.
 *
 * @param meter the reading
 */
export function meterTone(meter: RecordMeterValue): MeterTone {
  if (!(meter.total > 0)) return "neutral";
  const share = meter.value / meter.total;
  if (share >= 1) return "danger";
  if (share >= (meter.warnAt ?? 0.8)) return "warning";
  return "neutral";
}

/** A spent-of-limit bar with its figures, for a list cell, a detail field or a card. */
export function RecordMeter({ meter }: { readonly meter: RecordMeterValue }) {
  const share = meterShare(meter);
  const tone = meterTone(meter);
  const text = meter.text ?? `${meter.value.toLocaleString()} / ${meter.total.toLocaleString()}`;
  return (
    <span {...slotAttributes(recordMeterStyle, {})} data-tone={tone}>
      {share !== undefined ? (
        <span aria-hidden {...slotAttributes(recordMeterTrackStyle, {})}>
          <span style={{ width: `${share}%`, "--mark": markColor(tone === "neutral" ? "accent" : tone) } as CSSProperties} {...slotAttributes(recordMeterFillStyle, {})} />
        </span>
      ) : null}
      <span {...slotAttributes(recordMeterFiguresStyle, {})}>
        <span>{text}</span>
        {share !== undefined ? <span>{share}%</span> : null}
      </span>
    </span>
  );
}
