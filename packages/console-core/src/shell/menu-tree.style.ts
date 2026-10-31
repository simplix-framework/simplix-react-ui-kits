import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The band a navigation column is drawn on - a rule on the edge facing the content, and a ground
 * that sets the chrome apart from the screen beside it.
 *
 * <p><b>That ground is the console's chrome tint and the status strip draws the same one.</b> The
 * column is the larger surface, so it is what a reader calibrates the chrome against; a second
 * tint on the strip would read as a second kind of chrome, and there is only one. The top bar is
 * the exception: it carries the product mark and the reader's own controls rather than the frame
 * around a screen, so it takes the app's own ground.
 */
export const menuColumnStyle = defineSlotStyle({
  slot: "console-menu-column",
  as: "part",
  base: "border-r bg-muted/30 w-60",
  variants: {},
  defaultVariants: {},
});

/** The collapsed navigation rail, on the same band as the column. */
export const menuRailStyle = defineSlotStyle({
  slot: "console-menu-rail",
  as: "part",
  base: "border-r bg-muted/30 w-15 pb-0 pt-2",
  variants: {},
  defaultVariants: {},
});

/** The heading row of the navigation column, with the rule under it and its inset. */
export const menuColumnHeadStyle = defineSlotStyle({
  slot: "console-menu-column-head",
  as: "part",
  base: "border-b h-12 py-0 pl-[18px] pr-2.5",
  variants: {},
  defaultVariants: {},
});

/** The mark that stands for a destination, or for the branch holding a set of them. */
export const menuGlyphStyle = defineSlotStyle({
  slot: "console-menu-glyph",
  base: "opacity-70",
  variants: {},
  defaultVariants: {},
});

/** Whether a branch is open, said at the end of its row. */
export const menuCaretStyle = defineSlotStyle({
  slot: "console-menu-caret",
  base: "opacity-60 [&>svg]:transition-transform [&>svg]:duration-[var(--dur-base)] [&>svg]:ease-[var(--ease)] [&_svg]:size-[13px]",
  variants: {
    // One chevron pointing across, turned to point down as the branch opens.
    open: {
      true: "[&>svg]:rotate-90",
      false: "",
    },
  },
  defaultVariants: { open: false },
});

/** The label a row's remaining width goes to. */
export const menuLabelStyle = defineSlotStyle({
  slot: "console-menu-label",
  base: "text-left",
  variants: {},
  defaultVariants: {},
});

/**
 * How far the rows of a branch stand in from the branch above, and where the rule down them sits.
 */
export const menuBranchStyle = defineSlotStyle({
  slot: "console-menu-branch",
  as: "part",
  base: "gap-px",
  variants: {
    ruled: { true: "border-l ml-[17px] pl-[9px]", false: "" },
  },
  defaultVariants: { ruled: false },
});

/**
 * The shape a row of the menu tree has, in the three kinds the tree draws it in.
 *
 * <p>A branch is a button that folds, a link leaves the page, an inactive row is a span that
 * explains why it cannot. The row's own measurements live here once; written out three times they
 * drifted: one had `justify-between` and one did not, and only a reader holding all three could
 * see it.
 */
export const menuRowStyle = defineSlotStyle({
  slot: "console-menu-row",
  base: "rounded-md text-sm min-h-8 gap-2.5 px-2.5 py-0 transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    kind: {
      branch: "hover:bg-accent",
      link: "hover:bg-accent",
      inactive: "text-muted-foreground/70",
    },
    /** A cluster branch, or the current link, is set a step heavier. */
    strong: { true: "font-medium", false: "" },
    /** The link of the page the reader is on. */
    current: { true: "bg-accent", false: "" },
  },
  defaultVariants: { kind: "branch", strong: false, current: false },
});

/**
 * The division under the rail's lead mark. Shorter than the rail is wide, so it reads as a division
 * inside the band rather than as a second edge across it. `Separator` publishes neither a length
 * nor a margin.
 */
export const menuRailRuleStyle = defineSlotStyle({
  slot: "console-menu-rail-rule",
  as: "part",
  base: "my-[1.5px]",
  variants: {},
  defaultVariants: {},
});

/**
 * The column's rows. The first level stands a little in from the column's edge, so the rows read
 * as a list inside a panel rather than as text run up against its border.
 */
export const menuColumnBodyStyle = defineSlotStyle({
  slot: "console-menu-column-body",
  as: "part",
  base: "gap-0 px-2.5 pb-6 pt-0.5 [&>*]:mt-1.5",
  variants: {},
  defaultVariants: {},
});

/**
 * What one mark on the rail stands for, opened beside it: inset tighter than a popover's default
 * because it holds menu rows rather than prose. `PopoverContent` publishes no inset.
 */
export const menuFlyoutStyle = defineSlotStyle({
  slot: "console-menu-flyout",
  as: "part",
  base: "p-2",
  variants: {},
  defaultVariants: {},
});

/** The flyout's title, inset to the rows' own inset so it lines up with them. */
export const menuFlyoutTitleStyle = defineSlotStyle({
  slot: "console-menu-flyout-title",
  as: "part",
  base: "px-2",
  variants: {},
  defaultVariants: {},
});

/** One mark on the rail, and whether its cluster holds the current screen. */
export const menuRailButtonStyle = defineSlotStyle({
  slot: "console-menu-rail-button",
  as: "part",
  base: "size-[38px] [&_svg]:size-[18px]",
  variants: {
    active: { true: "", false: "" },
  },
  defaultVariants: { active: false },
});

/**
 * The box the column or the rail stands in. It carries no look of its own; it is what animates the
 * width when one replaces the other, so the screen beside it widens and narrows instead of jumping.
 */
export const menuSlotStyle = defineSlotStyle({
  slot: "console-menu-slot",
  base: "flex shrink-0 overflow-clip transition-[width] duration-[var(--dur-slow)] ease-[var(--ease)] [&>*]:shrink-0",
  variants: {},
  defaultVariants: {},
});

/**
 * The mark beside the row the reader is on, sliding to the new row as the current one changes or as
 * branches above it open and close. Classic marks the row by its ground alone and draws none.
 */
export const menuInkStyle = defineSlotStyle({
  slot: "console-menu-ink",
  // The shared selected indicator: a 2px accent bar at the column's inner edge that slides to the current row.
  base: "start-1 m-0! block w-0.5 rounded-full bg-primary transition-[top,height,opacity] duration-[var(--dur-base)] ease-[var(--ease)]",
  variants: {},
  defaultVariants: {},
});
