import { defineSlotStyle } from "@simplix-react/ui/design";

/** The inset that keeps the folded strip a hair narrower than the rule it came out from under. */
export const tileStripInsetStyle = defineSlotStyle({
  slot: "console-tile-strip-inset",
  base: "px-3",
  variants: {},
  defaultVariants: {},
});

/**
 * The gutter the tile row's focus rings live in.
 *
 * <p>The fold clips on both axes, so the row is given a gutter its cards' focus rings can live in;
 * without it the leftmost and rightmost rings are shaved off.
 */
export const tileGutterStyle = defineSlotStyle({
  slot: "console-tile-gutter",
  base: "-mx-1 px-1",
  variants: {},
  defaultVariants: {},
});

/** The row of tiles inside the gutter. */
export const tileRowStyle = defineSlotStyle({
  slot: "console-tile-row",
  base: "pb-1",
  variants: {},
  defaultVariants: {},
});

/** The handle hanging off the page rule that folds and unfolds the row. */
export const tileHandleStyle = defineSlotStyle({
  slot: "console-tile-handle",
  base: "rounded-b-md border border-t-0 bg-card transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
  variants: {},
  defaultVariants: {},
});

/** The chevron on the handle; it points down when the row is folded and up when it is open. */
export const tileHandleChevronStyle = defineSlotStyle({
  slot: "console-tile-handle-chevron",
  base: "text-muted-foreground transition-transform duration-200",
  variants: {
    folded: {
      true: "group-hover:translate-y-0.5",
      false: "rotate-180 group-hover:-translate-y-0.5",
    },
  },
  defaultVariants: { folded: false },
});

/** The folded strip: flush against the rule with no top edge of its own. */
export const tileStripStyle = defineSlotStyle({
  slot: "console-tile-strip",
  base: "rounded-b-lg border border-t-0 bg-card ps-3 pe-16 text-start transition-colors hover:bg-accent/40",
  variants: {},
  defaultVariants: {},
});

/**
 * One mark of the position indicator on the strip.
 *
 * <p>Marks rather than numbers: the strip is read at a glance and 3/4 is a thing to work out.
 */
export const tileStripDotStyle = defineSlotStyle({
  slot: "console-tile-strip-dot",
  base: "size-1 rounded-full transition-all duration-300",
  variants: {
    current: { true: "w-3 bg-foreground/50", false: "bg-border" },
  },
  defaultVariants: { current: false },
});

/** The rule between a figure and its basis on the strip. */
export const tileStripDividerStyle = defineSlotStyle({
  slot: "console-tile-strip-divider",
  base: "bg-border",
  variants: {},
  defaultVariants: {},
});

/**
 * One summary tile.
 *
 * <p>The card itself is the framework's stat card; this is the element the kit puts around it, so
 * a design can address the tile as a whole. A tile marked important by its data carries
 * `data-emphasis="true"`; the classic design draws it no differently.
 */
export const tileStyle = defineSlotStyle({
  slot: "console-tile",
  base: "",
  variants: {
    emphasis: { true: "", false: "" },
  },
  defaultVariants: { emphasis: false },
});
