import { defineSlotStyle } from "@simplix-react/ui/design";

// The dashboard's small charts. Every mark takes its colour from a CSS variable the part sets
// (`--mark`), so light and dark modes follow the tone seeds and the chart tokens without a class
// per colour; every transition runs on the motion tokens, which are zero under reduced motion.

/** The reading a mark shows under the pointer or the focus. */
export const chartTipStyle = defineSlotStyle({
  slot: "chart-tip",
  base: "pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full w-max max-w-72 break-keep rounded-md bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md ring-1 ring-border [transition:opacity_var(--dur-fast)_var(--ease)] starting:opacity-0",
  variants: {},
  defaultVariants: {},
});

/** The block's one figure: the number the reader acts on first. */
export const figureValueStyle = defineSlotStyle({
  slot: "figure-value",
  base: "text-[28px] font-semibold leading-none tracking-tight",
  variants: {
    tone: { neutral: "", danger: "text-[var(--destructive-text,var(--destructive))]", warning: "", muted: "text-muted-foreground" },
  },
  defaultVariants: { tone: "neutral" },
});

/** The words beside the figure: what it counts and against what. */
export const figureContextStyle = defineSlotStyle({
  slot: "figure-context",
  base: "text-[12.5px] text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The figure as a control: it opens the list it counts. */
export const figureButtonStyle = defineSlotStyle({
  slot: "figure-button",
  base: "gap-2 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** The track of a stage bar. */
export const stageTrackStyle = defineSlotStyle({
  slot: "stage-track",
  base: "h-3 rounded-full bg-muted",
  variants: {},
  defaultVariants: {},
});

/** One stage on the bar. */
export const stageSegmentStyle = defineSlotStyle({
  slot: "stage-segment",
  base: "absolute inset-y-0 rounded-[3px] bg-[var(--mark)] outline-none [transition:left_var(--dur-slow)_var(--ease),width_var(--dur-slow)_var(--ease),opacity_var(--dur-fast)_var(--ease),filter_var(--dur-fast)_var(--ease)] hover:brightness-110 focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    dimmed: { true: "opacity-40", false: "" },
  },
  defaultVariants: { dimmed: false },
});

/** A stage's key under the bar: swatch, name and count. */
export const stageKeyStyle = defineSlotStyle({
  slot: "stage-key",
  base: "gap-1.5 rounded-md px-1.5 py-1 text-[12.5px] transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    empty: { true: "text-muted-foreground", false: "" },
  },
  defaultVariants: { empty: false },
});

/** The swatch of a stage's key, in the stage's colour. */
export const stageSwatchStyle = defineSlotStyle({
  slot: "stage-swatch",
  base: "size-2 shrink-0 rounded-[2px] bg-[var(--mark)]",
  variants: {
    empty: { true: "bg-muted-foreground/30", false: "" },
  },
  defaultVariants: { empty: false },
});

/** A stage's count beside its name. */
export const stageCountStyle = defineSlotStyle({
  slot: "stage-count",
  base: "font-semibold tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** A progress ring with its figures, as one control. */
export const ringStyle = defineSlotStyle({
  slot: "ring",
  base: "gap-3 rounded-md p-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** The ring's unfilled track: a lighter step of the fill's own colour. */
export const ringTrackStyle = defineSlotStyle({
  slot: "ring-track",
  base: "fill-none stroke-[color-mix(in_srgb,var(--mark)_18%,var(--card))]",
  variants: {},
  defaultVariants: {},
});

/** The ring's fill, drawn in from twelve o'clock. */
export const ringFillStyle = defineSlotStyle({
  slot: "ring-fill",
  base: "fill-none stroke-[var(--mark)] [stroke-linecap:round] [transition:stroke-dasharray_var(--dur-slow)_var(--ease)]",
  variants: {},
  defaultVariants: {},
});

/** The percentage in the ring's middle. */
export const ringPercentStyle = defineSlotStyle({
  slot: "ring-percent",
  base: "fill-foreground text-[13px] font-semibold",
  variants: {},
  defaultVariants: {},
});

/** What the ring measures. */
export const ringLabelStyle = defineSlotStyle({
  slot: "ring-label",
  base: "text-[13px] font-medium",
  variants: {},
  defaultVariants: {},
});

/** Done against due, under the ring's label. */
export const ringFiguresStyle = defineSlotStyle({
  slot: "ring-figures",
  base: "text-[12.5px] tabular-nums text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The header row of a risk table: the column names. */
export const riskHeadStyle = defineSlotStyle({
  slot: "risk-head",
  base: "gap-1 px-2 pb-1 text-[11.5px] font-medium text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** One row of a risk table. */
export const riskRowStyle = defineSlotStyle({
  slot: "risk-row",
  base: "min-h-11 gap-1 rounded-md px-2 py-1 transition-colors hover:bg-muted/50",
  variants: {},
  defaultVariants: {},
});

/** The row's name, which opens the record. */
export const riskNameStyle = defineSlotStyle({
  slot: "risk-name",
  base: "min-w-0 gap-2 rounded-md py-1 text-left text-[13px] font-medium focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** The level dot before a row's name: how risky the row reads overall. */
export const riskLevelStyle = defineSlotStyle({
  slot: "risk-level",
  base: "size-2 shrink-0 rounded-full",
  variants: {
    level: { high: "bg-[var(--tone-danger)]", mid: "bg-[var(--tone-warning)]", low: "bg-[var(--tone-success)]", none: "bg-muted-foreground/30" },
  },
  defaultVariants: { level: "none" },
});

/** One count of a row, shaded by how hot it is in its column. */
export const riskCellStyle = defineSlotStyle({
  slot: "risk-cell",
  base: "h-8 rounded-[4px] text-center text-[13px] font-semibold tabular-nums transition-[filter] hover:brightness-95 focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)] disabled:cursor-default disabled:hover:brightness-100",
  variants: {
    heat: {
      "0": "bg-transparent font-normal text-muted-foreground",
      "1": "bg-[color-mix(in_srgb,var(--mark)_12%,var(--card))]",
      "2": "bg-[color-mix(in_srgb,var(--mark)_24%,var(--card))]",
      "3": "bg-[color-mix(in_srgb,var(--mark)_40%,var(--card))]",
      "4": "bg-[color-mix(in_srgb,var(--mark)_58%,var(--card))]",
    },
  },
  defaultVariants: { heat: "0" },
});

/** A text cell of a row, such as the latest grade. */
export const riskTextStyle = defineSlotStyle({
  slot: "risk-text",
  base: "truncate text-center text-[12.5px] text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** A row of the overdue list. */
export const overdueRowStyle = defineSlotStyle({
  slot: "overdue-row",
  base: "min-h-11 gap-3 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)] disabled:cursor-default disabled:hover:bg-transparent",
  variants: {},
  defaultVariants: {},
});

/** How long the oldest item has waited, as a bar against the longest wait in the list. */
export const overdueAgeStyle = defineSlotStyle({
  slot: "overdue-age",
  base: "h-1.5 rounded-full bg-[var(--mark)] [transition:width_var(--dur-slow)_var(--ease)]",
  variants: {},
  defaultVariants: {},
});

/** The sparkline's line. */
export const sparkLineStyle = defineSlotStyle({
  slot: "spark-line",
  base: "fill-none stroke-[var(--mark)] [stroke-width:1.75] [stroke-linecap:round] [stroke-linejoin:round] [transition:stroke-dashoffset_var(--dur-slow)_var(--ease)]",
  variants: {},
  defaultVariants: {},
});

/** The sparkline's dot: the last reading, or the one under the pointer. */
export const sparkDotStyle = defineSlotStyle({
  slot: "spark-dot",
  base: "fill-[var(--mark)] stroke-card [stroke-width:2]",
  variants: {},
  defaultVariants: {},
});

/** The sparkline as a focusable reading. */
export const sparkStyle = defineSlotStyle({
  slot: "spark",
  base: "relative inline-block rounded-sm outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** The line a block shows when it has nothing to show. */
export const chartEmptyStyle = defineSlotStyle({
  slot: "chart-empty",
  base: "px-2.5 py-3 text-[12.5px] text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** Stand-in shapes while the block's data is on the way. */
export const chartSkeletonStyle = defineSlotStyle({
  slot: "chart-skeleton",
  base: "rounded-md bg-muted bg-[linear-gradient(90deg,var(--muted),var(--shimmer,var(--muted)),var(--muted))] bg-[length:200%_100%] animate-skeleton-shine motion-reduce:animate-none",
  variants: {},
  defaultVariants: {},
});

/** A small heading over a part inside a block, such as the list of the next measurements. */
export const chartCaptionStyle = defineSlotStyle({
  slot: "chart-caption",
  base: "px-2 text-[11.5px] font-medium text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** A link at the right of a block's figure, to the screen behind it. */
export const figureActionStyle = defineSlotStyle({
  slot: "figure-action",
  base: "rounded-md px-2 py-1 text-[12.5px] font-medium transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** One cell of an obligation matrix: the state of one duty for one row, with its icon and words. */
export const matrixCellStyle = defineSlotStyle({
  slot: "matrix-cell",
  base: "flex h-8 w-full items-center justify-center gap-1 rounded-[4px] px-1 text-[12px] font-medium tabular-nums transition-[filter] hover:brightness-95 focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)] disabled:cursor-default disabled:hover:brightness-100",
  variants: {
    state: {
      done: "bg-[color-mix(in_srgb,var(--tone-success)_14%,var(--card))] text-foreground",
      due: "bg-[color-mix(in_srgb,var(--tone-warning)_16%,var(--card))] text-foreground",
      overdue: "bg-[color-mix(in_srgb,var(--tone-danger)_18%,var(--card))] text-foreground",
      none: "bg-transparent font-normal text-muted-foreground",
    },
  },
  defaultVariants: { state: "none" },
});

/** The icon inside a matrix cell, in the state's tone. */
export const matrixIconStyle = defineSlotStyle({
  slot: "matrix-icon",
  base: "size-3.5 shrink-0",
  variants: {
    state: {
      done: "text-[var(--tone-success)]",
      due: "text-[var(--tone-warning)]",
      overdue: "text-[var(--tone-danger)]",
      none: "text-muted-foreground",
    },
  },
  defaultVariants: { state: "none" },
});

/** One row of a meter list: the name, the bar and the figures. */
export const meterRowStyle = defineSlotStyle({
  slot: "meter-row",
  base: "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-md px-1 py-1.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** The track of a meter. */
export const meterTrackStyle = defineSlotStyle({
  slot: "meter-track",
  base: "relative col-span-2 h-2 overflow-hidden rounded-full bg-muted",
  variants: {},
  defaultVariants: {},
});

/** The filled part of a meter. */
export const meterFillStyle = defineSlotStyle({
  slot: "meter-fill",
  base: "absolute inset-y-0 left-0 rounded-full bg-[var(--mark)] [transition:width_var(--dur-slow)_var(--ease)]",
  variants: {},
  defaultVariants: {},
});
