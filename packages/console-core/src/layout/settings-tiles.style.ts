import { defineSlotStyle } from "@simplix-react/ui/design";

/** The inset that keeps the folded strip a hair narrower than the rule it came out from under. */
export const tileStripInsetStyle = defineSlotStyle({
  slot: "console-tile-strip-inset",
  base: "px-0",
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
    leads: { rule: "pt-12", lead: "pt-4", none: "" },
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
    leads: { rule: "-mt-5", lead: "-mt-4" },
  },
  defaultVariants: { leads: "rule" },
});

/** The handle hanging off the page rule that folds and unfolds the row. */
export const tileHandleStyle = defineSlotStyle({
  slot: "console-tile-handle",
  base: "transition-colors focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    /** Hanging off the header's rule, or standing at the right of a titled row's head. */
    placement: {
      // A quiet labelled button at the right above the figures.
      rule: "end-0 top-3 h-6 w-auto gap-1 rounded-md border-0 bg-transparent px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground",
      head: "ms-auto h-6 gap-1 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground",
    },
  },
  defaultVariants: { placement: "rule" },
});

/** The head over a titled row: its heading, the folded strip and the fold control on one line. */
export const tileHeadStyle = defineSlotStyle({
  slot: "console-tile-head",
  base: "mt-1 min-h-7 gap-3 transition-[margin] duration-[var(--dur-base)] ease-[var(--ease)]",
  variants: {
    folded: { true: "", false: "mb-2.5" },
  },
  defaultVariants: { folded: false },
});

/**
 * The folded figures in a titled row's head, one chip each. The row scrolls sideways, and
 * `overflow-x` makes the other axis clip too, so the 3px halo of a focused chip would be cut: the
 * row takes the focus gutter as padding and the same negative margin, which gives the halo its room
 * and leaves the row where it was.
 */
export const tileChipsStyle = defineSlotStyle({
  slot: "console-tile-chips",
  base: "-m-[var(--focus-gutter)] gap-1.5 p-[var(--focus-gutter)] [scrollbar-width:none]",
  variants: {},
  defaultVariants: {},
});

/** One folded figure: its label and the figure. */
export const tileChipStyle = defineSlotStyle({
  slot: "console-tile-chip",
  // Chips arrive one after another (35ms apart through `--i`) and leave together.
  base: "h-7 gap-2 rounded-full border bg-card px-[11px] text-xs transition-[opacity,translate,border-color,background-color,scale] delay-[calc(var(--i)*35ms+80ms)] duration-[var(--dur-base)] ease-[var(--ease-spring)] hover:bg-accent/40 active:scale-[0.98] [[data-open=false]_&]:translate-y-1 [[data-open=false]_&]:opacity-0 [[data-open=false]_&]:delay-0",
  variants: {
    /** Whether pressing the chip does anything; a chip for a plain figure says so with its cursor and does not react. */
    pressable: { true: "", false: "cursor-not-allowed hover:bg-card active:scale-100" },
    /** Whether the list stands on this chip's figure: ringed the way the card's press is, so a chosen chip reads as chosen. */
    pressed: { true: "border-ring ring-2 ring-ring", false: "" },
  },
  defaultVariants: { pressable: true, pressed: false },
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
    placement: { rule: "whitespace-nowrap", head: "whitespace-nowrap" },
  },
  defaultVariants: { placement: "rule" },
});

/** The chevron on the handle; it points down when the row is folded and up when it is open. */
export const tileHandleChevronStyle = defineSlotStyle({
  slot: "console-tile-handle-chevron",
  base: "text-current transition-transform duration-[var(--dur-base)] ease-[var(--ease)]",
  variants: {
    folded: {
      true: "",
      false: "rotate-180",
    },
  },
  defaultVariants: { folded: false },
});

/**
 * Which shape an untitled row takes folded, as a pair of wrappers a design shows one of: the turning
 * strip under the rule, or every figure as a chip on the control's line.
 */
export const tileTickerStyle = defineSlotStyle({
  slot: "console-tile-ticker",
  // Folded, every figure is a chip on the control's line; the turning strip is not drawn.
  base: "hidden",
  variants: {},
  defaultVariants: {},
});

/** The chips an untitled row folds into, drawn in a design that shows them instead of the strip. */
export const tileStripChipsStyle = defineSlotStyle({
  slot: "console-tile-strip-chips",
  base: "block pt-2.5 pe-32",
  variants: {},
  defaultVariants: {},
});

/**
 * A tile's comparison, toned by what the movement means for the figure: worse, better or neither.
 * Classic leaves it in the line's muted ink.
 */
export const tileTrendStyle = defineSlotStyle({
  slot: "console-tile-trend",
  as: "part",
  base: "",
  variants: {
    // Toned by what the movement means for the figure, never by its direction alone.
    verdict: {
      worse: "text-destructive",
      better: "text-[var(--success)]",
      neutral: "text-muted-foreground",
    },
  },
  defaultVariants: { verdict: "neutral" },
});

/** What a tile's figure was read from, after its comparison; classic sets it on a line of its own. */
export const tileBasisStyle = defineSlotStyle({
  slot: "console-tile-basis",
  as: "part",
  // On the comparison's line.
  base: "ms-2.5 inline",
  variants: {},
  defaultVariants: {},
});

/** The folded strip: flush against the rule with no top edge of its own. */
export const tileStripStyle = defineSlotStyle({
  slot: "console-tile-strip",
  base: "mt-2 ps-0 pe-32 text-start transition-colors",
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
  base: "size-1 rounded-full transition-all duration-[var(--dur-base)] ease-[var(--ease)]",
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
  // A tile holds one figure: it is as tall as its lines, never a fixed card height.
  base: "[&_[data-slot=stat-card]]:min-h-0",
  variants: {
    emphasis: { true: "", false: "" },
    /** The tile being dragged to a new place. */
    dragging: { true: "opacity-40", false: "" },
    /** The tile a dragged one would land on. */
    drop: { true: "rounded-lg shadow-[var(--focus-halo)]", false: "" },
    /** Whether pressing the tile does anything: a figure that narrows a list or leads to one does. */
    pressable: { true: "", false: "cursor-not-allowed" },
  },
  defaultVariants: { emphasis: false, dragging: false, drop: false, pressable: true },
});

/**
 * The grip on a tile the reader can put in their own order, shown while the pointer or the focus is
 * on the tile.
 */
export const tileGripStyle = defineSlotStyle({
  slot: "console-tile-grip",
  base: "ms-auto size-[22px] cursor-grab rounded-sm text-muted-foreground opacity-0 transition-[opacity,background-color,color] duration-[var(--dur-fast)] hover:bg-accent hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100",
  variants: {},
  defaultVariants: {},
});

/** The arrow on a tile that leads to a list, shown while the pointer is on it. */
export const tileGoStyle = defineSlotStyle({
  slot: "console-tile-go",
  // Always shown, so a tile that leads somewhere reads as pressable before the pointer finds it;
  // it steps 2px on toward the press.
  base: "text-muted-foreground transition-[color,translate] duration-[var(--dur-base)] ease-[var(--ease)] group-hover:translate-x-0.5 group-hover:text-foreground group-focus-visible:translate-x-0.5 group-focus-visible:text-foreground",
  variants: {},
  defaultVariants: {},
});

/** A tile that leads to its list: the link over the card carries the card's radius and the shared halo. */
export const tileLinkStyle = defineSlotStyle({
  slot: "console-tile-link",
  base: "rounded-lg focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/**
 * A tile that narrows the list under it: the press over the card. It carries the card's own ground
 * and radius, so the control the reader presses paints what it is; pressed, it is ringed the way
 * a chosen chip is.
 */
export const tilePressStyle = defineSlotStyle({
  slot: "console-tile-press",
  base: "rounded-lg bg-card text-left transition-shadow duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    pressed: { true: "ring-2 ring-ring", false: "" },
  },
  defaultVariants: { pressed: false },
});
