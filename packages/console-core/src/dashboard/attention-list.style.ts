import { defineSlotStyle } from "@simplix-react/ui/design";

/** One raised notice on the dashboard: what needs attention, on which screen. */
export const attentionRowStyle = defineSlotStyle({
  slot: "attention-row",
  base: "min-h-11 gap-3 rounded-md px-2.5 py-1.5 text-left text-(length:--fs-body-sm) leading-(--lh-body-sm) transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)] disabled:cursor-default disabled:hover:bg-transparent",
  variants: {},
  defaultVariants: {},
});

/** The glyph a raised notice leads with, coloured by its kind. */
export const attentionGlyphStyle = defineSlotStyle({
  slot: "attention-glyph",
  base: "size-4 shrink-0",
  variants: {
    kind: { danger: "text-destructive", warning: "text-warning", info: "text-muted-foreground", help: "text-muted-foreground" },
  },
  defaultVariants: { kind: "info" },
});
