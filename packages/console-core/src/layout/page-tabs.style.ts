import { defineSlotStyle } from "@simplix-react/ui/design";

/** The tab set of a console list screen: the strip and the panel a step apart. */
export const pageTabsStyle = defineSlotStyle({
  slot: "console-page-tabs",
  as: "part",
  base: "gap-4",
  variants: {},
  defaultVariants: {},
});

/** One tab's body, inset from the strip above and nothing below. */
export const pageTabPanelStyle = defineSlotStyle({
  slot: "console-page-tab-panel",
  as: "part",
  base: "pt-4",
  variants: {},
  defaultVariants: {},
});

/**
 * A tab's count, raised and small the way a footnote mark is: `leading-none` stops the smaller
 * line box pulling it back down.
 */
export const countedTabCountStyle = defineSlotStyle({
  slot: "console-counted-tab-count",
  as: "part",
  base: "self-start leading-none group-data-[state=active]:text-inherit",
  variants: {},
  defaultVariants: {},
});
