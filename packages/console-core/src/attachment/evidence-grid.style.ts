import { defineSlotStyle } from "@simplix-react/ui/design";

/** The card one piece of evidence is drawn on, at a tighter inset than a card's default. */
export const evidenceBodyStyle = defineSlotStyle({
  slot: "console-evidence-body",
  as: "part",
  base: "p-3",
  variants: {},
  defaultVariants: {},
});

/** The kind icon of a piece of evidence; dimmed when the evidence is failed or missing. */
export const evidenceIconStyle = defineSlotStyle({
  slot: "console-evidence-icon",
  base: "",
  variants: {
    wrong: { true: "opacity-50", false: "" },
  },
  defaultVariants: { wrong: false },
});
