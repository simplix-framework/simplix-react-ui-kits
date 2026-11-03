import { defineSlotStyle } from "@simplix-react/ui/design";

import { SITE_CARD } from "../page/site-page.style";

/** A product in the refund table: its name, then its price and terms in small muted words. */
export const siteRefundProductStyle = defineSlotStyle({
  slot: "site-refund-product",
  base: "flex min-w-0 flex-col",
  variants: {},
  defaultVariants: {},
});

/** A product's price and terms. */
export const siteRefundDetailStyle = defineSlotStyle({
  slot: "site-refund-detail",
  base: "font-(--site-fw-base) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** What comes back in one case: the verdict with its dot, then a note. */
export const siteRefundRuleStyle = defineSlotStyle({
  slot: "site-refund-rule",
  base: "flex min-w-0 flex-col gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** A verdict in its tone: all of it back, part of it, or none. */
export const siteRefundVerdictStyle = defineSlotStyle({
  slot: "site-refund-verdict",
  base: "inline-flex items-center gap-1.5 font-(--site-fw-strong)",
  variants: {
    kind: {
      full: "text-(--site-good)",
      part: "text-(--site-accent-text)",
      none: "text-(--site-ink-muted)",
    },
  },
  defaultVariants: { kind: "none" },
});

/** The verdict's dot. */
export const siteRefundDotStyle = defineSlotStyle({
  slot: "site-refund-dot",
  base: "block size-2 shrink-0 rounded-(--site-radius-full)",
  variants: {
    kind: {
      full: "bg-(--site-good)",
      part: "bg-(--site-accent)",
      none: "bg-(--site-ink-faint)",
    },
  },
  defaultVariants: { kind: "none" },
});

/** What else holds in that case, small and muted. */
export const siteRefundNoteStyle = defineSlotStyle({
  slot: "site-refund-note",
  base: "text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The refund calculator: a card that works out what cancelling a yearly plan now gives back. */
export const siteRefundCalcStyle = defineSlotStyle({
  slot: "site-refund-calc",
  base: SITE_CARD,
  variants: {},
  defaultVariants: {},
});

/** The calculator's question and the plan switch beside it; they wrap. */
export const siteRefundCalcHeadStyle = defineSlotStyle({
  slot: "site-refund-calc-head",
  base: "flex min-w-0 flex-wrap items-center justify-between gap-2",
  variants: {},
  defaultVariants: {},
});

/** The calculator's question. */
export const siteRefundCalcTitleStyle = defineSlotStyle({
  slot: "site-refund-calc-title",
  base: "font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** The time used: its words, the range and the months chosen. */
export const siteRefundCalcRowStyle = defineSlotStyle({
  slot: "site-refund-calc-row",
  base: "flex min-w-0 items-center gap-3 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** The time used's words. */
export const siteRefundCalcLabelStyle = defineSlotStyle({
  slot: "site-refund-calc-label",
  base: "shrink-0",
  variants: {},
  defaultVariants: {},
});

/** The months chosen, right-aligned in the strong weight. */
export const siteRefundCalcOutputStyle = defineSlotStyle({
  slot: "site-refund-calc-output",
  base: "w-16 shrink-0 text-right font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** The year split in two: the share used and the share that comes back. */
export const siteRefundBarStyle = defineSlotStyle({
  slot: "site-refund-bar",
  base: "flex h-7 min-w-0 overflow-hidden rounded-(--site-radius-lg) text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label)",
  variants: {},
  defaultVariants: {},
});

/** The share used, on the sunken ground. */
export const siteRefundBarUsedStyle = defineSlotStyle({
  slot: "site-refund-bar-used",
  base: "grid place-items-center bg-(--site-surface-sunken) not-italic text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The share that comes back, on the good tone's ground. */
export const siteRefundBarBackStyle = defineSlotStyle({
  slot: "site-refund-bar-back",
  base: "grid flex-1 place-items-center bg-(--site-good-soft) font-(--site-fw-strong) not-italic text-(--site-good)",
  variants: {},
  defaultVariants: {},
});

/** The working and the amount; they wrap. */
export const siteRefundCalcFootStyle = defineSlotStyle({
  slot: "site-refund-calc-foot",
  base: "flex min-w-0 flex-wrap items-end justify-between gap-2",
  variants: {},
  defaultVariants: {},
});

/** The working: the sum, then what it counts. */
export const siteRefundCalcSumStyle = defineSlotStyle({
  slot: "site-refund-calc-sum",
  base: "flex min-w-0 flex-col text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** The sum, in the mono family. */
export const siteRefundCalcFormulaStyle = defineSlotStyle({
  slot: "site-refund-calc-formula",
  base: "font-(family-name:--site-font-mono)",
  variants: {},
  defaultVariants: {},
});

/** What the sum counts, muted. */
export const siteRefundCalcBasisStyle = defineSlotStyle({
  slot: "site-refund-calc-basis",
  base: "text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The amount that comes back, a figure in the display family. */
export const siteRefundCalcAmountStyle = defineSlotStyle({
  slot: "site-refund-calc-amount",
  base: "font-(family-name:--site-font-display) text-(length:--site-fs-stat) leading-(--site-lh-stat) font-(--site-fw-stat) tracking-(--site-tracking-stat) tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** How to ask for a refund: the steps beside the screen that shows them; one under the other below the medium tier. */
export const siteRefundHowStyle = defineSlotStyle({
  slot: "site-refund-how",
  base: "grid min-w-0 grid-cols-3 gap-4 @max-page-medium/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});

/** The steps, each a button that shows its screen. */
export const siteStepPickerStyle = defineSlotStyle({
  slot: "site-step-picker",
  base: "m-0 flex min-w-0 list-none flex-col gap-1.5 p-0",
  variants: {},
  defaultVariants: {},
});

/** One step in the list. */
export const siteStepPickItemStyle = defineSlotStyle({
  slot: "site-step-pick-item",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** A step's button; the step shown stands in the accent's outline on its soft ground. */
export const siteStepPickStyle = defineSlotStyle({
  slot: "site-step-pick",
  base:
    "flex w-full min-w-0 cursor-pointer items-start gap-2.5 rounded-(--site-radius-lg) border px-3 py-2.5 text-left font-(family-name:--site-font-sans) text-(--site-ink) outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) focus-visible:shadow-[var(--site-focus-ring)] disabled:cursor-not-allowed disabled:opacity-(--site-dim)",
  variants: {
    current: {
      true: "border-(--site-accent) bg-(--site-accent-soft)",
      false: "border-(--site-line) bg-(--site-surface) hover:border-(--site-control-line)",
    },
  },
  defaultVariants: { current: false },
});

/** A step's number in a ring, or a tick on the accent once it is passed. */
export const siteStepPickDiscStyle = defineSlotStyle({
  slot: "site-step-pick-disc",
  base:
    "grid size-6 shrink-0 place-items-center rounded-(--site-radius-full) font-(family-name:--site-font-mono) text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) [&_svg]:size-3",
  variants: {
    done: {
      true: "bg-(--site-accent) text-(--site-on-accent)",
      false: "border border-(--site-line)",
    },
  },
  defaultVariants: { done: false },
});

/** A step's title and words. */
export const siteStepPickBodyStyle = defineSlotStyle({
  slot: "site-step-pick-body",
  base: "flex min-w-0 flex-col",
  variants: {},
  defaultVariants: {},
});

/** A step's title. */
export const siteStepPickTitleStyle = defineSlotStyle({
  slot: "site-step-pick-title",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** A step's words, small and muted. */
export const siteStepPickTextStyle = defineSlotStyle({
  slot: "site-step-pick-text",
  base: "text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A small floating picture of the site that walks through the steps; it spans two columns beside them. */
export const siteWalkthroughStyle = defineSlotStyle({
  slot: "site-walkthrough",
  base:
    "col-span-2 flex min-h-60 min-w-0 flex-col overflow-hidden rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface) text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) shadow-(--site-shadow-float) @max-page-medium/page:col-span-1",
  variants: {},
  defaultVariants: {},
});

/** The picture's head: where it is, on the sunken ground. */
export const siteWalkthroughHeadStyle = defineSlotStyle({
  slot: "site-walkthrough-head",
  base: "flex items-center gap-2 border-b border-(--site-line) bg-(--site-surface-sunken) px-3 py-2 font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** What the picture shows; the account menu opens at the end, the account's pages from the start. */
export const siteWalkthroughStageStyle = defineSlotStyle({
  slot: "site-walkthrough-stage",
  base: "flex flex-1 p-3",
  variants: {
    align: {
      end: "justify-end",
      start: "gap-3",
    },
  },
  defaultVariants: { align: "start" },
});

/** The account menu as it opens from the bar. */
export const siteWalkthroughMenuStyle = defineSlotStyle({
  slot: "site-walkthrough-menu",
  base: "flex w-40 flex-col gap-1 rounded-(--site-radius-lg) border border-(--site-line) bg-(--site-surface) p-2 shadow-(--site-shadow-float)",
  variants: {},
  defaultVariants: {},
});

/** The account's address at the top of the menu, small and muted. */
export const siteWalkthroughMenuEmailStyle = defineSlotStyle({
  slot: "site-walkthrough-menu-email",
  base: "text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** An entry of the menu; the one to press is marked. */
export const siteWalkthroughMenuItemStyle = defineSlotStyle({
  slot: "site-walkthrough-menu-item",
  base: "px-1.5",
  variants: {
    current: {
      true: "rounded-(--site-radius-xs) bg-(--site-accent-soft) py-0.5 font-(--site-fw-strong)",
      false: "",
    },
  },
  defaultVariants: { current: false },
});

/** The account's pages down the side; the one to open is marked. */
export const siteWalkthroughNavStyle = defineSlotStyle({
  slot: "site-walkthrough-nav",
  base: "flex flex-col gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** One of the account's pages. */
export const siteWalkthroughNavItemStyle = defineSlotStyle({
  slot: "site-walkthrough-nav-item",
  base: "rounded-(--site-radius-xs) px-1.5 py-0.5",
  variants: {
    current: {
      true: "bg-(--site-accent-soft) font-(--site-fw-strong) text-(--site-accent-text)",
      false: "",
    },
  },
  defaultVariants: { current: false },
});

/** Lines that stand for a page's content. */
export const siteWalkthroughLinesStyle = defineSlotStyle({
  slot: "site-walkthrough-lines",
  base: "flex flex-1 flex-col gap-1.5 pt-1",
  variants: {},
  defaultVariants: {},
});

/** One line standing for content: a title, a long line or a short one. */
export const siteWalkthroughLineStyle = defineSlotStyle({
  slot: "site-walkthrough-line",
  base: "block rounded-(--site-radius-xs) bg-(--site-line) not-italic",
  variants: {
    size: {
      title: "h-2 w-1/2",
      long: "h-1.5 w-11/12",
      short: "h-1.5 w-3/4",
    },
  },
  defaultVariants: { size: "long" },
});

/** The picture's foot: the next step and the button that shows it. */
export const siteWalkthroughFootStyle = defineSlotStyle({
  slot: "site-walkthrough-foot",
  base: "flex items-center justify-between border-t border-(--site-line) px-3 py-2",
  variants: {},
  defaultVariants: {},
});

/** The next step's words, muted. */
export const siteWalkthroughNextStyle = defineSlotStyle({
  slot: "site-walkthrough-next",
  base: "text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});
