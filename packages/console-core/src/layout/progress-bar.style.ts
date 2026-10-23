import { defineSlotStyle } from "@simplix-react/ui/design";

/** The track of a determinate progress bar. */
export const progressTrackStyle = defineSlotStyle({
  slot: "console-progress-track",
  base: "rounded-full border bg-muted",
  variants: {},
  defaultVariants: {},
});

/** The fill of a determinate progress bar. */
export const progressFillStyle = defineSlotStyle({
  slot: "console-progress-fill",
  base: "bg-primary transition-all",
  variants: {},
  defaultVariants: {},
});
