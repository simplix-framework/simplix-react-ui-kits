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
  // A tab's count as a pill beside its label, tinted on the chosen tab.
  base: "h-[18px] min-w-5 self-auto rounded-full bg-muted px-1.5 text-center text-[11px] leading-[18px] font-semibold text-muted-foreground transition-colors duration-[var(--dur-base)] group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary",
  variants: {},
  defaultVariants: {},
});

/** The mark beside a tab's label that says something on the tab is still missing. */
export const pageTabMissingStyle = defineSlotStyle({
  slot: "console-page-tab-missing",
  base: "text-amber-500",
  variants: {},
  defaultVariants: {},
});
