import { defineSlotStyle } from "@simplix-react/ui/design";

/** The mark inside the AI badge. */
export const aiMarkingGlyphStyle = defineSlotStyle({
  slot: "console-ai-marking-glyph",
  base: "mr-1",
  variants: {},
  defaultVariants: {},
});

/** The explanation pushed to the far end of a marked item's header. */
export const aiMarkingExplanationStyle = defineSlotStyle({
  slot: "console-ai-marking-explanation",
  base: "ml-auto",
  variants: {},
  defaultVariants: {},
});
