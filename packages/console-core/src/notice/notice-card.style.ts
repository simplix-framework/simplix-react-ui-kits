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

/** The title and the line under it; classic stacks them. */
export const noticeTextStyle = defineSlotStyle({
  slot: "console-notice-text",
  base: "flex-col",
  variants: {
    kind: { help: "", warning: "", info: "", danger: "" },
  },
  defaultVariants: { kind: "info" },
});

/** The card's title. */
export const noticeTitleStyle = defineSlotStyle({
  slot: "console-notice-title",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The card's own button. */
export const noticeActionStyle = defineSlotStyle({
  slot: "console-notice-action",
  as: "part",
  base: "",
  variants: {
    kind: { help: "", warning: "", info: "", danger: "" },
  },
  defaultVariants: { kind: "info" },
});

/** The chevron on a button that opens the card's body; it turns over as the body opens. */
export const noticeChevronStyle = defineSlotStyle({
  slot: "console-notice-chevron",
  base: "hidden size-3.5 transition-transform",
  variants: {
    open: { true: "rotate-180", false: "" },
  },
  defaultVariants: { open: false },
});

/** What the card's button opens inside the card: rows that grow from nothing. */
export const noticeBodyStyle = defineSlotStyle({
  slot: "console-notice-body",
  base: "transition-[grid-template-rows] duration-300",
  variants: {
    open: { true: "grid-rows-[1fr]", false: "grid-rows-[0fr]" },
  },
  defaultVariants: { open: false },
});

/** The row of verbs under a card's text. */
export const noticeActionsStyle = defineSlotStyle({
  slot: "console-notice-actions",
  base: "mt-2 gap-1.5",
  variants: {},
  defaultVariants: {},
});
