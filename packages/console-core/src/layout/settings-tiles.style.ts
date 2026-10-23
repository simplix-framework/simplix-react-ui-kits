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
  variants: {
    /**
     * What the folding row reaches up under: the distance {@link tileReachStyle} reached up by,
     * paid back so the tiles stand where they would stand unfolded. A titled row reaches nowhere.
     */
    leads: { rule: "pt-8", lead: "pt-4", none: "" },
  },
  defaultVariants: { leads: "none" },
});

/**
 * How far a folding row reaches up to sit against what is above it: the header's bottom margin and
 * the page column's gap under the rule, the one gap under a back link.
 */
export const tileReachStyle = defineSlotStyle({
  slot: "console-tile-reach",
  base: "",
  variants: {
    leads: { rule: "-mt-8", lead: "-mt-4" },
  },
  defaultVariants: { leads: "rule" },
});

/** The handle hanging off the page rule that folds and unfolds the row. */
export const tileHandleStyle = defineSlotStyle({
  slot: "console-tile-handle",
  base: "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
  variants: {
    /** Hanging off the header's rule, or standing at the right of a titled row's head. */
    placement: {
      rule: "top-0 under-rule end-6 h-4 w-11 rounded-b-md border border-t-0 bg-card hover:bg-accent/40",
      head: "ms-auto h-7 gap-1 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground",
    },
  },
  defaultVariants: { placement: "rule" },
});

/** The head over a titled row: its heading, the folded strip and the fold control on one line. */
export const tileHeadStyle = defineSlotStyle({
  slot: "console-tile-head",
  base: "min-h-7 gap-3",
  variants: {
    folded: { true: "", false: "mb-2" },
  },
  defaultVariants: { folded: false },
});

/** The folded figures in a titled row's head, one chip each. */
export const tileChipsStyle = defineSlotStyle({
  slot: "console-tile-chips",
  base: "gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** One folded figure: its label and the figure. */
export const tileChipStyle = defineSlotStyle({
  slot: "console-tile-chip",
  base: "h-7 gap-2 rounded-full border bg-card px-3 text-xs transition-colors hover:bg-accent/40",
  variants: {},
  defaultVariants: {},
});

/**
 * The figure on a folded chip, in the tint its tile carries; the tint is a class the figure is
 * handed at runtime, as on the strip.
 */
export const tileChipFigureStyle = defineSlotStyle({
  slot: "console-tile-chip-figure",
  as: "part",
  base: "",
  variants: {
    tone: {
      none: "",
      success: "",
      warning: "",
      danger: "",
      info: "",
      neutral: "",
      pending: "",
      processing: "",
    },
  },
  defaultVariants: { tone: "none" },
});

/** The heading of a titled row. */
export const tileTitleStyle = defineSlotStyle({
  slot: "console-tile-title",
  base: "text-base font-semibold",
  variants: {},
  defaultVariants: {},
});

/** The handle's name in words; classic names it only to assistive technology. */
export const tileHandleLabelStyle = defineSlotStyle({
  slot: "console-tile-handle-label",
  base: "",
  variants: {
    /** Named in words beside a titled row's head; under the rule, only to assistive technology. */
    placement: { rule: "sr-only", head: "whitespace-nowrap" },
  },
  defaultVariants: { placement: "rule" },
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
  base: "under-rule rounded-b-lg border border-t-0 bg-card ps-3 pe-16 text-start transition-colors hover:bg-accent/40",
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
    /** The tile being dragged to a new place. */
    dragging: { true: "opacity-40", false: "" },
    /** The tile a dragged one would land on. */
    drop: { true: "rounded-lg ring-2 ring-ring", false: "" },
  },
  defaultVariants: { emphasis: false, dragging: false, drop: false },
});

/**
 * The grip on a tile the reader can put in their own order, shown while the pointer or the focus is
 * on the tile.
 */
export const tileGripStyle = defineSlotStyle({
  slot: "console-tile-grip",
  base: "ms-auto size-5 cursor-grab rounded-sm text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
  variants: {},
  defaultVariants: {},
});

/** The arrow on a tile that leads to a list, shown while the pointer is on it. */
export const tileGoStyle = defineSlotStyle({
  slot: "console-tile-go",
  base: "text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
  variants: {},
  defaultVariants: {},
});
