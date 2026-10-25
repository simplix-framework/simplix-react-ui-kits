import { type CSSProperties, type KeyboardEvent, useRef, useState } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { type MarkTone, markColor } from "./chart-tip";
import { sparkPoints } from "./chart-model";
import { chartTipStyle, sparkDotStyle, sparkLineStyle, sparkStyle } from "./chart.style";
import { useDrawn } from "./stage-flow-bar";

/** Props for {@link Sparkline}. */
export interface SparklineProps {
  /** What the line reads, for a screen reader and the reading, such as 「작업중지」. */
  readonly label: string;
  readonly values: readonly number[];
  /** One name per value, such as the months, for the reading. */
  readonly categories: readonly string[];
  readonly unit?: string;
  readonly tone?: MarkTone;
  readonly width?: number;
  readonly height?: number;
}

/**
 * A small line of recent readings beside a figure, with the last reading marked.
 *
 * <p>Pointing along it, or focusing it and pressing the arrow keys, reads one category at a time;
 * without that the last reading is marked. It carries no axes: the figure beside it gives the
 * scale, and the full chart is one click away.
 */
export function Sparkline({ label, values, categories, unit = "건", tone = "accent", width = 96, height = 28 }: SparklineProps) {
  const box = useRef<HTMLSpanElement>(null);
  const drawn = useDrawn();
  const [hot, setHot] = useState<number | null>(null);
  const points = sparkPoints(values, width, height);
  if (points.length === 0) return null;
  const d = points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("");
  const at = hot ?? points.length - 1;
  const spoken = `${label}: ${categories.map((c, i) => `${c} ${values[i]}${unit}`).join(", ")}`;
  const key = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setHot((now) => Math.max(0, Math.min(points.length - 1, (now ?? points.length - 1) + (e.key === "ArrowRight" ? 1 : -1))));
    } else if (e.key === "Escape") setHot(null);
  };
  return (
    <span
      ref={box}
      tabIndex={0}
      role="img"
      aria-label={spoken}
      onKeyDown={key}
      onBlur={() => setHot(null)}
      onMouseLeave={() => setHot(null)}
      onMouseMove={(e) => {
        const r = box.current?.getBoundingClientRect();
        if (!r) return;
        setHot(Math.max(0, Math.min(points.length - 1, Math.round(((e.clientX - r.left) / r.width) * (points.length - 1)))));
      }}
      style={{ "--mark": markColor(tone), width, height } as CSSProperties}
      {...slotAttributes(sparkStyle, {})}
    >
      <svg width={width} height={height} viewBox={`-4 0 ${width + 8} ${height}`} aria-hidden className="block overflow-visible">
        <path d={d} pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: drawn ? 0 : 1 }} {...slotAttributes(sparkLineStyle, {})} />
        <circle cx={points[at].x} cy={points[at].y} r={3.5} {...slotAttributes(sparkDotStyle, {})} />
      </svg>
      {hot !== null ? (
        <span role="tooltip" style={{ left: `${(points[hot].x / width) * 100}%`, top: -6 }} {...slotAttributes(chartTipStyle, {})}>
          {categories[hot]} · <b className="tabular-nums">{values[hot]}</b>
          {unit}
        </span>
      ) : null}
    </span>
  );
}
