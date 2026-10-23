import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * One tab of the area switch.
 *
 * <p>Every tab keeps a transparent rule of the ink's height under it, so the current one is no
 * taller than the rest; the ink itself is {@link areaInkStyle}, drawn once for the strip.
 */
export const areaTabStyle = defineSlotStyle({
  slot: "console-area-tab",
  base: "border-b-2 border-transparent px-3 text-sm",
  variants: {
    current: {
      true: "font-medium",
      false: "text-muted-foreground hover:text-foreground",
    },
  },
  defaultVariants: { current: false },
});

/** The strip of area tabs: no gap between tabs, a small one between wrapped lines. */
export const areaSwitchStyle = defineSlotStyle({
  slot: "console-area-switch",
  as: "part",
  base: "gap-y-1",
  variants: {},
  defaultVariants: {},
});

/**
 * The rule under the current area. One element for the strip, placed on the current tab and moved
 * to the next one when the reader picks it, so the mark travels rather than jumping.
 */
export const areaInkStyle = defineSlotStyle({
  slot: "console-area-ink",
  base: "h-0.5 bg-primary [transition:left_var(--dur-slow)_var(--ease),top_var(--dur-slow)_var(--ease),width_var(--dur-slow)_var(--ease)]",
  variants: {},
  defaultVariants: {},
});
