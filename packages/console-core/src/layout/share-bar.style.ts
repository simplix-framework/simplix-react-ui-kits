import { defineSlotStyle } from "@simplix-react/ui/design";

/** The stacked proportion bar. */
export const shareTrackStyle = defineSlotStyle({
  slot: "console-share-track",
  base: "rounded-full border bg-muted",
  variants: {},
  defaultVariants: {},
});

/** One segment of the proportion bar; the tone says which share it is. */
export const shareSegmentStyle = defineSlotStyle({
  slot: "console-share-segment",
  base: "",
  variants: {
    tone: {
      primary: "bg-primary",
      secondary: "bg-chart-2",
      muted: "bg-muted-foreground/40",
      warning: "bg-warning",
    },
  },
  defaultVariants: { tone: "primary" },
});

/** The legend swatch matching a segment of the bar. */
export const shareSwatchStyle = defineSlotStyle({
  slot: "console-share-swatch",
  base: "rounded-full",
  variants: {
    tone: {
      primary: "bg-primary",
      secondary: "bg-chart-2",
      muted: "bg-muted-foreground/40",
      warning: "bg-warning",
    },
  },
  defaultVariants: { tone: "primary" },
});
