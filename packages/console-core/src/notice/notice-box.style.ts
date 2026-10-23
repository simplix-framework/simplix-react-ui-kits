import { defineSlotStyle } from "@simplix-react/ui/design";

/** The tinted surface a box of supporting content is drawn on; the tone says how loudly it asks to be read. */
export const noticeBoxStyle = defineSlotStyle({
  slot: "console-notice-box-card",
  as: "part",
  base: "rounded-md border p-3",
  variants: {
    tone: {
      quiet: "border-border bg-muted/40",
      accent: "border-primary/30 bg-primary/5",
      danger: "border-destructive/40 bg-muted/40",
    },
  },
  defaultVariants: { tone: "quiet" },
});
