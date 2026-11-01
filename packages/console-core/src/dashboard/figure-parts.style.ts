import { defineSlotStyle } from "@simplix-react/ui/design";

/** A whole split into its parts as one bar: what is granted, held and spent of a balance. */
export const segmentBarStyle = defineSlotStyle({
  slot: "segment-bar",
  base: "flex flex-col gap-2",
  variants: {},
  defaultVariants: {},
});

/** The bar's track; its parts sit in it side by side. */
export const segmentTrackStyle = defineSlotStyle({
  slot: "segment-track",
  base: "flex h-2.5 w-full overflow-hidden rounded-full bg-muted",
  variants: {},
  defaultVariants: {},
});

/** One part of the bar, as wide as its share. */
export const segmentPartStyle = defineSlotStyle({
  slot: "segment-part",
  base: "h-full bg-[var(--mark)]",
  variants: {},
  defaultVariants: {},
});

/** The legend under the bar: each part's name and figure. */
export const segmentLegendStyle = defineSlotStyle({
  slot: "segment-legend",
  base: "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** One legend entry: its swatch, its name and its figure. */
export const segmentEntryStyle = defineSlotStyle({
  slot: "segment-entry",
  base: "inline-flex items-center gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** The swatch beside a legend entry, in its part's colour. */
export const segmentSwatchStyle = defineSlotStyle({
  slot: "segment-swatch",
  base: "inline-block size-2 shrink-0 rounded-sm bg-[var(--mark)]",
  variants: {},
  defaultVariants: {},
});

/** A legend entry's figure, lined up. */
export const segmentFigureStyle = defineSlotStyle({
  slot: "segment-figure",
  base: "font-medium tabular-nums text-foreground",
  variants: {},
  defaultVariants: {},
});

/** A row of recent outcomes, oldest to newest, one cell each. */
export const outcomeStripStyle = defineSlotStyle({
  slot: "outcome-strip",
  base: "flex items-end gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** One outcome's cell, coloured by how it ended. */
export const outcomeCellStyle = defineSlotStyle({
  slot: "outcome-cell",
  base: "h-4 w-1.5 shrink-0 rounded-sm bg-[var(--mark)]",
  variants: {},
  defaultVariants: {},
});

/** A half ring reading a value against its limit, with the figure in the middle. */
export const thresholdGaugeStyle = defineSlotStyle({
  slot: "threshold-gauge",
  base: "relative inline-flex flex-col items-center",
  variants: {},
  defaultVariants: {},
});

/** The ring's track, the whole of the limit. */
export const gaugeTrackStyle = defineSlotStyle({
  slot: "gauge-track",
  base: "stroke-muted",
  variants: {},
  defaultVariants: {},
});

/** The ring's arc, as far round as the value stands. */
export const gaugeArcStyle = defineSlotStyle({
  slot: "gauge-arc",
  base: "stroke-[var(--mark)]",
  variants: {},
  defaultVariants: {},
});

/** The tick at the threshold on the ring. */
export const gaugeTickStyle = defineSlotStyle({
  slot: "gauge-tick",
  base: "stroke-foreground",
  variants: {},
  defaultVariants: {},
});

/** The figure in the ring's middle. */
export const gaugeFigureStyle = defineSlotStyle({
  slot: "gauge-figure",
  base: "-mt-3 text-lg font-semibold tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** What the gauge reads, under its figure. */
export const gaugeLabelStyle = defineSlotStyle({
  slot: "gauge-label",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** A grid of states, rows by columns: a release on each channel for each platform. */
export const stateMatrixStyle = defineSlotStyle({
  slot: "state-matrix",
  base: "w-full border-collapse text-xs",
  variants: {},
  defaultVariants: {},
});

/** A row or column heading of the grid. */
export const stateMatrixHeadStyle = defineSlotStyle({
  slot: "state-matrix-head",
  base: "px-2 py-1.5 text-left font-medium text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** One cell of the grid: the state at that row and column. */
export const stateMatrixCellStyle = defineSlotStyle({
  slot: "state-matrix-cell",
  base: "border-t border-border px-2 py-1.5",
  variants: {},
  defaultVariants: {},
});

/** A cell's state over its second line. */
export const stateMatrixStateStyle = defineSlotStyle({
  slot: "state-matrix-state",
  base: "inline-flex flex-col gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** A cell's second line (a version), or the words of an empty cell. */
export const stateMatrixSubStyle = defineSlotStyle({
  slot: "state-matrix-sub",
  base: "tabular-nums text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** Instants along one time axis: a record's history read left to right. */
export const eventTimelineStyle = defineSlotStyle({
  slot: "event-timeline",
  base: "relative h-14 w-full",
  variants: {},
  defaultVariants: {},
});

/** The time axis. */
export const eventAxisStyle = defineSlotStyle({
  slot: "event-axis",
  base: "absolute inset-x-0 top-3 h-px bg-border",
  variants: {},
  defaultVariants: {},
});

/** One instant on the axis, coloured by what happened. */
export const eventMarkStyle = defineSlotStyle({
  slot: "event-mark",
  base: "absolute top-1.5 size-3 -translate-x-1/2 rounded-full border-2 border-background bg-[var(--mark)] focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** What happened at an instant, under its mark. */
export const eventLabelStyle = defineSlotStyle({
  slot: "event-label",
  base: "absolute top-6 whitespace-nowrap text-xs text-muted-foreground",
  variants: {
    /** Centred under its mark, or held inside the axis at either end so it never runs past it. */
    align: { start: "", middle: "-translate-x-1/2", end: "-translate-x-full" },
  },
  defaultVariants: { align: "middle" },
});
