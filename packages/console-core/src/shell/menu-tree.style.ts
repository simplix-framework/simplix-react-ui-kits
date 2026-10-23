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
  base: "border-r bg-muted/30",
  variants: {},
  defaultVariants: {},
});

/** The collapsed navigation rail, on the same band as the column. */
export const menuRailStyle = defineSlotStyle({
  slot: "console-menu-rail",
  as: "part",
  base: "border-r bg-muted/30 py-2",
  variants: {},
  defaultVariants: {},
});

/** The heading row of the navigation column, with the rule under it and its inset. */
export const menuColumnHeadStyle = defineSlotStyle({
  slot: "console-menu-column-head",
  as: "part",
  base: "border-b px-3 py-2",
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
  base: "opacity-60",
  variants: {},
  defaultVariants: {},
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
  base: "",
  variants: {
    ruled: { true: "ml-4 border-l pl-1.5", false: "" },
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
  base: "gap-1.5 rounded-md px-2 py-1.5 text-sm",
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
  base: "my-1",
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
  base: "pl-1",
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
