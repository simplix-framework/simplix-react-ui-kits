import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The cluster of per-kind controls in the page header.
 *
 * <p>Tighter than the header's own gap: these are one control repeated per kind, not four separate
 * verbs, and at the header's spacing they read as four unrelated buttons somebody happened to put
 * in a row. Grouped, they are one cluster the eye takes in at once.
 */
export const noticeMenuStyle = defineSlotStyle({
  slot: "console-notice-menu",
  as: "part",
  base: "gap-0.5",
  variants: {},
  defaultVariants: {},
});

/**
 * The ring behind a control whose hidden card still asks to be acted on.
 *
 * <p>Slower and smaller than the framework's default ping. A one-second pulse at the glyph's own
 * width reads as an alarm and pulls the eye off whatever the reader came to do; at this size and
 * cadence it is a heartbeat behind the icon, visible when looked at, ignorable while working.
 */
export const noticePingStyle = defineSlotStyle({
  slot: "console-notice-ping",
  base: "animate-ping rounded-full opacity-50 [animation-duration:2.6s]",
  variants: {},
  defaultVariants: {},
});

/**
 * The dropdown that lists a kind's notices: the card's surface rather than the popover's, and the
 * card's padding step. `p-1` is what a menu uses to sit its rows edge to edge; a card puts a gutter
 * between its border and the first character.
 */
export const noticeMenuCardStyle = defineSlotStyle({
  slot: "console-notice-menu-card",
  as: "part",
  base: "rounded-lg border-border bg-card px-4 py-3 shadow-sm",
  variants: {},
  defaultVariants: {},
});

/** The dropdown's heading, flush with the card's own inset. */
export const noticeMenuLabelStyle = defineSlotStyle({
  slot: "console-notice-menu-label",
  as: "part",
  base: "px-0 pt-0",
  variants: {},
  defaultVariants: {},
});

/** The rule between two notices, run out to the card's edges. */
export const noticeMenuRuleStyle = defineSlotStyle({
  slot: "console-notice-menu-rule",
  as: "part",
  base: "-mx-4",
  variants: {},
  defaultVariants: {},
});

/** A notice's action inside the dropdown, drawn as a small outline button. */
export const noticeMenuActionStyle = defineSlotStyle({
  slot: "console-notice-menu-action",
  as: "part",
  base: "rounded-md border border-input bg-background px-2 py-1 text-xs font-medium",
  variants: {},
  defaultVariants: {},
});
