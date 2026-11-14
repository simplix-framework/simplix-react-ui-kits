import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The steps of a purchase in a row of equal columns, one per step whatever their number (a purchase
 * with a payment has four, a trial that takes no card two), each a numbered disc over its name.
 */
export const siteStepperStyle = defineSlotStyle({
  slot: "site-stepper",
  base: "m-0 grid list-none auto-cols-fr grid-flow-col p-0",
  variants: {},
  defaultVariants: {},
});

/** One step: the line from the step before, the disc, the name; the current one in the ink and bold. */
export const siteStepStyle = defineSlotStyle({
  slot: "site-stepper-step",
  base: "relative flex flex-col items-center gap-1.5 text-center text-(length:--site-fs-caption) leading-(--site-lh-caption)",
  variants: {
    state: {
      done: "font-(--site-fw-caption) text-(--site-ink-muted)",
      current: "font-(--site-fw-strong) text-(--site-ink)",
      next: "font-(--site-fw-caption) text-(--site-ink-muted)",
    },
  },
  defaultVariants: { state: "next" },
});

/** The line from the step before to this one, in the accent once this step is reached. */
export const siteStepLineStyle = defineSlotStyle({
  slot: "site-stepper-line",
  base: "absolute top-3.5 right-1/2 -left-1/2 block h-0.5 transition-colors duration-(--site-duration-base) ease-(--site-ease)",
  variants: {
    reached: {
      true: "bg-(--site-accent)",
      false: "bg-(--site-line)",
    },
  },
  defaultVariants: { reached: false },
});

/** A step's disc: its number, or a check once done; the current one grows a little. */
export const siteStepDiscStyle = defineSlotStyle({
  slot: "site-stepper-disc",
  base:
    "relative z-10 grid size-7 place-items-center rounded-(--site-radius-full) border-2 font-(family-name:--site-font-mono) text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) transition duration-(--site-duration-base) ease-(--site-ease) [&_svg]:size-3",
  variants: {
    state: {
      done: "border-(--site-accent) bg-(--site-accent) text-(--site-on-accent)",
      current: "scale-110 border-(--site-accent) bg-(--site-surface) text-(--site-accent-text)",
      next: "border-(--site-line) bg-(--site-surface)",
    },
  },
  defaultVariants: { state: "next" },
});

/** The page's title where the steps are its only visible heading: read by a screen reader and by the tab, not drawn. */
export const siteStepHeadingStyle = defineSlotStyle({
  slot: "site-stepper-heading",
  base: "sr-only",
  variants: {},
  defaultVariants: {},
});

/** The line under the steps saying what the step asks for, centred and muted; it keeps its height when empty. */
export const siteStepCaptionStyle = defineSlotStyle({
  slot: "site-stepper-caption",
  base: "m-0 min-h-5 text-center text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Our side and the payment side, two columns above the medium tier and one below. */
export const siteCheckoutStyle = defineSlotStyle({
  slot: "site-checkout",
  base: "grid min-w-0 grid-cols-2 items-start gap-6 @max-page-medium/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});

/** Our side: the order, what it gives, the receipt and the consents, one gap apart. */
export const siteCheckoutMainStyle = defineSlotStyle({
  slot: "site-checkout-main",
  base: "flex min-w-0 flex-col gap-3.5",
  variants: {},
  defaultVariants: {},
});

/** A side's head: its title in the display family and the sentence under it. */
export const siteCheckoutHeadStyle = defineSlotStyle({
  slot: "site-checkout-head",
  base: "flex min-w-0 flex-col gap-1",
  variants: {},
  defaultVariants: {},
});

/** The head's title. */
export const siteCheckoutTitleStyle = defineSlotStyle({
  slot: "site-checkout-title",
  base: "m-0 font-(family-name:--site-font-display) text-(length:--site-fs-headline) leading-(--site-lh-headline) font-(--site-fw-title) tracking-(--site-tracking-display)",
  variants: {},
  defaultVariants: {},
});

/** The sentence under the head's title. */
export const siteCheckoutLedeStyle = defineSlotStyle({
  slot: "site-checkout-lede",
  base: "m-0 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A row of the order's switches and what they say (the cycle and the saving). */
export const siteCheckoutRowStyle = defineSlotStyle({
  slot: "site-checkout-row",
  base: "flex min-w-0 flex-wrap items-center gap-2.5",
  variants: {},
  defaultVariants: {},
});

/** A muted note in the row, such as how long a one-off purchase lasts. */
export const siteCheckoutRowNoteStyle = defineSlotStyle({
  slot: "site-checkout-row-note",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** What choosing the yearly cycle saves, on the good colour's soft ground. */
export const siteSavingStyle = defineSlotStyle({
  slot: "site-saving",
  base: "rounded-(--site-radius-full) bg-(--site-good-soft) px-2.5 py-0.5 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-strong) text-(--site-good)",
  variants: {},
  defaultVariants: {},
});

/** The chain's actions and the page after payment's. */
export const siteCheckoutActionsStyle = defineSlotStyle({
  slot: "site-checkout-actions",
  base: "flex min-w-0 flex-wrap gap-2",
  variants: {
    align: {
      start: "",
      center: "justify-center",
    },
  },
  defaultVariants: { align: "start" },
});
