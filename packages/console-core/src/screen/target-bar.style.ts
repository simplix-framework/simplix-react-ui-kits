import { defineSlotStyle } from "@simplix-react/ui/design";

/** The track a target bar is drawn on. */
export const targetTrackStyle = defineSlotStyle({
  slot: "console-target-track",
  base: "rounded-full bg-muted",
  variants: {},
  defaultVariants: {},
});

/** The fill of a target bar; it is drawn in the primary colour once the target is reached. */
export const targetFillStyle = defineSlotStyle({
  slot: "console-target-fill",
  base: "rounded-full",
  variants: {
    reached: { true: "bg-primary", false: "bg-muted-foreground/60" },
  },
  defaultVariants: { reached: false },
});

/** The rule marking the target on the track. */
export const targetMarkStyle = defineSlotStyle({
  slot: "console-target-mark",
  base: "bg-foreground",
  variants: {},
  defaultVariants: {},
});
