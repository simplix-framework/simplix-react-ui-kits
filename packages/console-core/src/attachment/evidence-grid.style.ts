import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The tile one piece of evidence is drawn on, at a tighter inset than a card's default. It is set on
 * a soft ground with no edge, because the grid always sits inside a framed form or detail panel.
 */
export const evidenceBodyStyle = defineSlotStyle({
  slot: "console-evidence-body",
  as: "part",
  base: "p-3 border-0 bg-[var(--surface-2)] shadow-none",
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
