import { defineSlotStyle } from "@simplix-react/ui/design";

/** The head of a work page: the way back, the kind of work, its name and the step it stands at. */
export const workPageHeadStyle = defineSlotStyle({
  slot: "console-work-page-head",
  as: "part",
  base: "gap-3 border-b border-border px-4 py-2.5",
  variants: {},
  defaultVariants: {},
});

/** The bar over the screen in view: which step it is, where its screen is in the menu, and the way there. */
export const workLocationStyle = defineSlotStyle({
  slot: "console-work-location",
  as: "part",
  base: "gap-3 border-b border-border bg-muted/40 px-4 py-2",
  variants: {},
  defaultVariants: {},
});

/** The step in view, named in the location bar. */
export const workLocationStepStyle = defineSlotStyle({
  slot: "console-work-location-step",
  base: "text-sm font-semibold text-foreground",
  variants: {},
  defaultVariants: {},
});

/** The menu path of the screen in view. */
export const workLocationPathStyle = defineSlotStyle({
  slot: "console-work-location-path",
  as: "part",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The progress rail beside the screen in view. */
export const workRailStyle = defineSlotStyle({
  slot: "console-work-rail",
  as: "part",
  base: "border-s border-border bg-background",
  variants: {},
  defaultVariants: {},
});

/** The row at the top of the rail, with the way to the whole view. */
export const workRailBarStyle = defineSlotStyle({
  slot: "console-work-rail-bar",
  as: "part",
  base: "gap-2 border-b border-border px-3 py-2",
  variants: {},
  defaultVariants: {},
});

/** The scrolling body of the rail. */
export const workRailBodyStyle = defineSlotStyle({
  slot: "console-work-rail-body",
  as: "part",
  base: "px-3 py-3",
  variants: {},
  defaultVariants: {},
});
