import { defineSlotStyle } from "@simplix-react/ui/design";

/** The mark before the dock's to-do count. */
export const agentDockGlyphStyle = defineSlotStyle({
  slot: "console-agent-dock-glyph",
  base: "mr-1",
  variants: {},
  defaultVariants: {},
});

/** The blocking count after the dock's to-do count. */
export const agentDockSuffixStyle = defineSlotStyle({
  slot: "console-agent-dock-suffix",
  base: "ml-1",
  variants: {},
  defaultVariants: {},
});
