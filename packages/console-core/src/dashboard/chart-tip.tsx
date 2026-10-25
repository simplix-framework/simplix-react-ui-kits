import { type FocusEvent, type MouseEvent, type ReactNode, type RefObject, useCallback, useState } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { chartTipStyle } from "./chart.style";

/** A colour a mark is drawn in: a status tone, the chart's accent, or one step of the accent's ramp. */
export type MarkTone = "accent" | "success" | "warning" | "danger" | "info" | "neutral" | `step-${1 | 2 | 3 | 4 | 5}` | `series-${1 | 2 | 3}`;

const STEP_SHARE = { 1: 34, 2: 50, 3: 66, 4: 82, 5: 100 } as const;

/**
 * The CSS colour of a mark tone. The accent is the first categorical series; steps are mixes of it with the card surface, so a
 * stage flow reads light to dark in one hue in either mode; status tones are the kit's tone seeds.
 */
export function markColor(tone: MarkTone): string {
  if (tone === "accent") return "var(--series-1)";
  if (tone.startsWith("series-")) return `var(--${tone})`;
  if (tone.startsWith("step-")) {
    const share = STEP_SHARE[Number(tone.slice(5)) as 1 | 2 | 3 | 4 | 5];
    return share === 100 ? "var(--series-1)" : `color-mix(in srgb, var(--series-1) ${share}%, var(--card))`;
  }
  return `var(--tone-${tone})`;
}

/**
 * One reading at a time for the marks of a part: the mark under the pointer or holding the focus
 * shows its reading above itself, placed against the part's own box.
 *
 * @param box the part's positioned box the reading is placed in
 */
export function useMarkTip(box: RefObject<HTMLElement | null>) {
  const [tip, setTip] = useState<{ readonly key: string; readonly x: number; readonly y: number; readonly content: ReactNode } | null>(null);
  const show = useCallback(
    (key: string, content: ReactNode) => (event: MouseEvent<Element> | FocusEvent<Element>) => {
      const host = box.current?.getBoundingClientRect();
      const mark = (event.currentTarget as Element).getBoundingClientRect();
      if (!host) return;
      setTip({ key, x: mark.left + mark.width / 2 - host.left, y: mark.top - host.top - 6, content });
    },
    [box],
  );
  const hide = useCallback(() => setTip(null), []);
  /** The props a mark spreads to show its reading on hover and on focus. */
  const bind = (key: string, content: ReactNode) => ({ onMouseEnter: show(key, content), onFocus: show(key, content), onMouseLeave: hide, onBlur: hide });
  const node = tip ? (
    <span role="tooltip" style={{ left: tip.x, top: tip.y }} {...slotAttributes(chartTipStyle, {})}>
      {tip.content}
    </span>
  ) : null;
  return { bind, node, hot: tip?.key ?? null };
}
