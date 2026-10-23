import { defineSlotStyle } from "@simplix-react/ui/design";

/** The slot a notice card is drawn on; the kind says what the card is saying. */
export const noticeCardStyle = defineSlotStyle({
  slot: "console-notice-card",
  base: "",
  variants: {
    kind: { help: "", warning: "", info: "", danger: "" },
  },
  defaultVariants: { kind: "info" },
});

/** The slot a help notice card is drawn on: the card a page keeps beside its figures to open an explanation. */
export const explanationCardStyle = defineSlotStyle({
  slot: "console-explanation-card",
  base: "",
  variants: {
    kind: { help: "" },
  },
  defaultVariants: { kind: "help" },
});
