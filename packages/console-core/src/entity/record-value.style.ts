import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The name a reference value is drawn as inside its link button. A link sits on the primary soft
 * ground, where the primary colour itself falls under 4.5:1, so the name takes the text shade of
 * the primary that a design defines for soft grounds, and the primary where it defines none.
 */
export const recordValueLinkStyle = defineSlotStyle({
  slot: "console-record-value-link",
  base: "text-[var(--primary-text,var(--primary))]",
  variants: {},
  defaultVariants: {},
});
