import { defineSlotStyle } from "@simplix-react/ui/design";

/** A machine message drawn in one line: its start, with the whole message on hover. */
export const recordExcerptStyle = defineSlotStyle({
  slot: "record-excerpt",
  base: "inline-flex min-w-0 max-w-full items-center gap-1",
  variants: {},
  defaultVariants: {},
});

/** The one line the message is cut to. */
export const recordExcerptTextStyle = defineSlotStyle({
  slot: "record-excerpt-text",
  base: "min-w-0 truncate font-mono text-xs",
  variants: {},
  defaultVariants: {},
});

/** A ledger amount, drawn in figures that line up down a column and tinted by its sign. */
export const recordFigureStyle = defineSlotStyle({
  slot: "record-figure",
  base: "whitespace-nowrap tabular-nums",
  variants: {
    sign: { positive: "text-success", negative: "text-destructive", none: "" },
  },
  defaultVariants: { sign: "none" },
});
