import { defineSlotStyle } from "@simplix-react/ui/design";
/** The scrolling column the page content sits in. */
export const contentColumnStyle = defineSlotStyle({
  slot: "console-content-column",
  // The sides close from 32px to 20px under 900px; the padding transitions so the screen settles into a new width.
  base: "px-8 pt-6 transition-[padding] duration-[var(--dur-slow)] ease-[var(--ease)] max-[900px]:px-5 max-[900px]:pt-5",
  variants: {},
  defaultVariants: {},
});

/** The measure-capped column, centred in the space beside the menu. */
export const contentColumnBodyStyle = defineSlotStyle({
  slot: "console-content-column-body",
  as: "part",
  base: "mx-auto max-w-[1440px] gap-5",
  variants: {},
  defaultVariants: {},
});
