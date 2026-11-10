import { defineSlotStyle } from "@simplix-react/ui/design";

/** The column a stepped form draws its strip, its lede and its step in, one under the other. */
export const stepFlowStyle = defineSlotStyle({
  slot: "console-step-flow",
  as: "part",
  base: "flex min-w-0 flex-col gap-5",
  variants: {},
  defaultVariants: {},
});

/** The final review: one block per step, each a heading over its rows. */
export const stepReviewStyle = defineSlotStyle({
  slot: "console-step-review",
  as: "part",
  base: "flex min-w-0 flex-col gap-5",
  variants: {},
  defaultVariants: {},
});

/** The rows of one step under its heading, ruled off from each other. */
export const stepReviewRowsStyle = defineSlotStyle({
  slot: "console-step-review-rows",
  as: "part",
  base: "m-0 flex min-w-0 flex-col",
  variants: {},
  defaultVariants: {},
});

/**
 * One answered question: its label and its value side by side while the panel is wide, and the value
 * under the label while it is narrow (the row wraps, so no breakpoint is asked of a panel that is
 * narrow on a wide screen).
 */
export const stepReviewRowStyle = defineSlotStyle({
  slot: "console-step-review-row",
  as: "part",
  base: "flex min-w-0 flex-wrap gap-x-5 gap-y-1 border-b border-border py-3 last:border-b-0",
  variants: {},
  defaultVariants: {},
});

/** The label of a review row. */
export const stepReviewTermStyle = defineSlotStyle({
  slot: "console-step-review-term",
  base: "m-0 basis-36 shrink-0 text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The value of a review row; long text wraps and keeps its line breaks. */
export const stepReviewValueStyle = defineSlotStyle({
  slot: "console-step-review-value",
  base: "m-0 min-w-0 flex-1 basis-48 whitespace-pre-wrap break-words text-sm",
  variants: {},
  defaultVariants: {},
});
