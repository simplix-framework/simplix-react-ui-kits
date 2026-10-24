import { defineSlotStyle } from "@simplix-react/ui/design";

/** A subtotal or total row, set apart from the item rows above it. */
export const scoreSummaryRowStyle = defineSlotStyle({
  slot: "console-score-summary-row",
  as: "part",
  base: "bg-muted/50 font-medium",
  variants: { total: { true: "border-t-2", false: "" } },
  defaultVariants: { total: false },
});

/** A figure that was not computed: held or unresolved, never a zero. */
export const scorePendingStyle = defineSlotStyle({
  slot: "console-score-pending",
  base: "text-warning",
  variants: {},
  defaultVariants: {},
});
