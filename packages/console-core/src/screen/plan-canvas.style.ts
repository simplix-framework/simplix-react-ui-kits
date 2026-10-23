import { defineSlotStyle } from "@simplix-react/ui/design";

/** A row of the palette; the armed item is the one the next click places. */
export const planPaletteItemStyle = defineSlotStyle({
  slot: "console-plan-palette-item",
  base: "rounded-md px-2 py-1.5 text-left text-sm",
  variants: {
    armed: { true: "bg-accent font-medium", false: "" },
    placeable: { true: "hover:bg-accent", false: "" },
  },
  defaultVariants: { armed: false, placeable: true },
});

/** The ground the plan's picture is shown on. */
export const planStageStyle = defineSlotStyle({
  slot: "console-plan-stage",
  base: "bg-muted/30",
  variants: {},
  defaultVariants: {},
});

/** The surface marks are placed on. */
export const planSurfaceStyle = defineSlotStyle({
  slot: "console-plan-surface",
  base: "bg-background",
  variants: {},
  defaultVariants: {},
});

/**
 * A mark placed on the plan.
 *
 * <p>The tone is the mark's standing: the selected one is filled, a warned one is outlined in the
 * warning colour, the rest are plain. A mark that covers a region has a dashed outline on top of
 * whichever tone it has.
 */
export const planMarkStyle = defineSlotStyle({
  slot: "console-plan-mark",
  base: "rounded-md border px-1.5 py-0.5 text-xs shadow-sm",
  variants: {
    tone: {
      selected: "border-primary bg-primary text-primary-foreground",
      warn: "border-warning bg-background",
      plain: "border-border bg-background",
    },
    region: { true: "border-dashed", false: "" },
  },
  defaultVariants: { tone: "plain", region: false },
});

/** The minimap shown when the picture is bigger than the window. */
export const planMinimapStyle = defineSlotStyle({
  slot: "console-plan-minimap",
  base: "rounded border bg-background/90",
  variants: {},
  defaultVariants: {},
});

/** One mark on the minimap. */
export const planMinimapDotStyle = defineSlotStyle({
  slot: "console-plan-minimap-dot",
  base: "rounded-full",
  variants: {
    selected: { true: "bg-primary", false: "bg-muted-foreground" },
  },
  defaultVariants: { selected: false },
});
