import { defineSlotStyle } from "@simplix-react/ui/design";

/** One tab of the area switch; the current one is underlined in the primary colour. */
export const areaTabStyle = defineSlotStyle({
  slot: "console-area-tab",
  base: "px-3 text-sm",
  variants: {
    current: {
      true: "border-b-2 border-primary font-medium",
      false: "border-b-2 border-transparent text-muted-foreground hover:text-foreground",
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
