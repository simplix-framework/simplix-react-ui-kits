import { defineSlotStyle } from "@simplix-react/ui/design";

/** The panel the manual opens in beside the screen. */
export const manualPanelStyle = defineSlotStyle({
  slot: "console-manual-panel",
  base: "border-s border-border bg-background",
  variants: {},
  defaultVariants: {},
});

/** The edge the reader drags to resize the manual. */
export const manualResizerStyle = defineSlotStyle({
  slot: "console-manual-resizer",
  base: "hover:bg-border focus-visible:bg-border focus-visible:outline-none",
  variants: {},
  defaultVariants: {},
});

/** The title row of the manual. */
export const manualHeaderStyle = defineSlotStyle({
  slot: "console-manual-header",
  as: "part",
  base: "border-b border-border px-4 py-2.5",
  variants: {},
  defaultVariants: {},
});

/** The help mark before the manual's title. */
export const manualMarkStyle = defineSlotStyle({
  slot: "console-manual-mark",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The row of section buttons under the title. */
export const manualSectionsStyle = defineSlotStyle({
  slot: "console-manual-sections",
  as: "part",
  base: "border-b border-border px-4 py-2",
  variants: {},
  defaultVariants: {},
});

/** The scrolling body of the manual. */
export const manualBodyStyle = defineSlotStyle({
  slot: "console-manual-body",
  as: "part",
  base: "px-4 py-3",
  variants: {},
  defaultVariants: {},
});

/** The step number before a page title in the contents. */
export const manualStepStyle = defineSlotStyle({
  slot: "console-manual-step",
  base: "me-2 text-muted-foreground tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** The note that says the page is shown in English. */
export const manualFallbackCardStyle = defineSlotStyle({
  slot: "console-manual-fallback-card",
  as: "part",
  base: "rounded-md border border-s-2 border-border border-s-primary bg-muted/40 px-3 py-2",
  variants: {},
  defaultVariants: {},
});

/** A picture of the manual opened at its own size. */
export const manualZoomImageStyle = defineSlotStyle({
  slot: "console-manual-zoom-image",
  base: "rounded-md border border-border",
  variants: {},
  defaultVariants: {},
});

/** A line of the contents shown when a screen has no page: a compact, left-aligned outline row. */
export const manualContentsLinkStyle = defineSlotStyle({
  slot: "console-manual-contents-link",
  as: "part",
  base: "px-2 py-1.5 text-start",
  variants: {},
  defaultVariants: {},
});

/** The zoomed picture's caption, set as body text rather than as a dialog heading. */
export const manualZoomTitleStyle = defineSlotStyle({
  slot: "console-manual-zoom-title",
  as: "part",
  base: "text-sm font-normal",
  variants: {},
  defaultVariants: {},
});
