import { defineSlotStyle } from "@simplix-react/ui/design";

/** The searched term inside a snippet: marked by its ground rather than by colour alone. */
export const searchHitStyle = defineSlotStyle({
  slot: "console-search-hit",
  base: "",
  variants: {
    hit: { true: "rounded-sm bg-warning/30 px-0.5 font-medium", false: "" },
  },
  defaultVariants: { hit: false },
});
