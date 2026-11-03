import { defineSlotStyle } from "@simplix-react/ui/design";

/** The steps of a purchase in a row of equal columns, each a numbered disc over its name. */
export const siteStepperStyle = defineSlotStyle({
  slot: "site-stepper",
  base: "m-0 grid list-none grid-cols-4 p-0",
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
    "relative grid size-7 place-items-center rounded-(--site-radius-full) border-2 font-(family-name:--site-font-mono) text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) transition duration-(--site-duration-base) ease-(--site-ease) [&_svg]:size-3",
  variants: {
    state: {
      done: "border-(--site-accent) bg-(--site-accent) text-(--site-on-accent)",
      current: "scale-110 border-(--site-accent) bg-(--site-surface) text-(--site-accent-text)",
      next: "border-(--site-line) bg-(--site-surface)",
    },
  },
  defaultVariants: { state: "next" },
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

/** A few choices as cards in a row. */
export const siteChoiceCardsStyle = defineSlotStyle({
  slot: "site-choice-cards",
  base: "grid min-w-0",
  variants: {
    size: {
      md: "gap-2.5",
      sm: "gap-2",
    },
    single: {
      true: "grid-cols-1",
      false: "grid-cols-3 @max-page-narrow/page:grid-cols-1",
    },
  },
  defaultVariants: { size: "md", single: false },
});

/** One choice: outlined twice as heavy as a hairline, the accent's soft ground when chosen. */
export const siteChoiceCardStyle = defineSlotStyle({
  slot: "site-choice-card",
  base:
    "relative flex min-w-0 cursor-pointer flex-col border-2 text-left font-(family-name:--site-font-sans) text-(--site-ink) outline-none transition duration-(--site-duration-fast) ease-(--site-ease) focus-visible:shadow-[var(--site-focus-ring)] disabled:cursor-not-allowed",
  variants: {
    size: {
      md: "gap-1 rounded-(--site-radius-xl) px-3.5 py-3 disabled:opacity-(--site-dim)",
      sm: "gap-0.5 rounded-(--site-radius-lg) px-3 py-2.5 disabled:opacity-(--site-fade)",
    },
    checked: {
      true: "border-(--site-accent) bg-(--site-accent-soft)",
      false: "border-(--site-line) bg-(--site-surface)",
    },
    hover: {
      lift: "hover:-translate-y-0.5",
      line: "hover:border-(--site-control-line)",
      none: "",
    },
  },
  defaultVariants: { size: "md", checked: false, hover: "none" },
});

/** A badge over a card's top edge, in the voice colour. */
export const siteChoiceBadgeStyle = defineSlotStyle({
  slot: "site-choice-badge",
  base: "absolute -top-2.5 right-3 rounded-(--site-radius-full) bg-(--site-voice) px-2 text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-on-voice)",
  variants: {},
  defaultVariants: {},
});

/** A card's title, with the chosen card's mark beside it. */
export const siteChoiceTitleStyle = defineSlotStyle({
  slot: "site-choice-title",
  base: "font-(--site-fw-strong) [&_svg]:size-3.5 [&_svg]:text-(--site-accent)",
  variants: {
    size: {
      md: "flex items-center gap-1.5",
      sm: "block",
    },
  },
  defaultVariants: { size: "md" },
});

/** A card's short line under the title. */
export const siteChoiceMetaStyle = defineSlotStyle({
  slot: "site-choice-meta",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A card's price in the display family. */
export const siteChoicePriceStyle = defineSlotStyle({
  slot: "site-choice-price",
  base: "font-(family-name:--site-font-display) text-(length:--site-fs-heading) leading-(--site-lh-heading) font-(--site-fw-strong) tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** The price's unit in small text type. */
export const siteChoiceUnitStyle = defineSlotStyle({
  slot: "site-choice-unit",
  base: "font-(family-name:--site-font-sans) text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** What a card's choice is for, muted. */
export const siteChoiceBodyStyle = defineSlotStyle({
  slot: "site-choice-body",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
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

/** The receipt as it will read: its head, the lines, the total and the note. */
export const siteOrderSummaryStyle = defineSlotStyle({
  slot: "site-order-summary",
  base: "min-w-0 overflow-hidden rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface)",
  variants: {},
  defaultVariants: {},
});

/** The receipt's head on the sunken ground: its title, and on the right a live mark. */
export const siteOrderHeadStyle = defineSlotStyle({
  slot: "site-order-head",
  base: "flex items-center gap-2 bg-(--site-surface-sunken) px-4 py-2.5 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The receipt's title. */
export const siteOrderTitleStyle = defineSlotStyle({
  slot: "site-order-title",
  base: "font-(--site-fw-bold) text-(--site-ink)",
  variants: {},
  defaultVariants: {},
});

/** Says the receipt follows the payment side, with a good dot. */
export const siteOrderLiveStyle = defineSlotStyle({
  slot: "site-order-live",
  base: "ml-auto flex items-center gap-1.5 font-(family-name:--site-font-mono) text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label)",
  variants: {},
  defaultVariants: {},
});

/** The live mark's dot. */
export const siteOrderLiveDotStyle = defineSlotStyle({
  slot: "site-order-live-dot",
  base: "block size-1.5 rounded-(--site-radius-full) bg-(--site-good)",
  variants: {},
  defaultVariants: {},
});

/** The receipt's lines. */
export const siteOrderLinesStyle = defineSlotStyle({
  slot: "site-order-lines",
  base: "m-0 flex flex-col text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane)",
  variants: {},
  defaultVariants: {},
});

/** One line: what it is, then its amount at the end; the tax line is ruled dashed, the total ruled. */
export const siteOrderLineStyle = defineSlotStyle({
  slot: "site-order-line",
  base: "flex justify-between gap-3 border-(--site-line) px-4",
  variants: {
    kind: {
      line: "py-2",
      tax: "border-t border-dashed py-2",
      total: "items-baseline border-t py-3",
    },
  },
  defaultVariants: { kind: "line" },
});

/** A line's name, muted; the total's in the ink and bold. */
export const siteOrderLabelStyle = defineSlotStyle({
  slot: "site-order-label",
  base: "m-0",
  variants: {
    total: {
      true: "font-(--site-fw-strong)",
      false: "text-(--site-ink-muted)",
    },
  },
  defaultVariants: { total: false },
});

/** A line's amount; the total's in the display family. */
export const siteOrderAmountStyle = defineSlotStyle({
  slot: "site-order-amount",
  base: "m-0 tabular-nums",
  variants: {
    total: {
      true: "font-(family-name:--site-font-display) text-(length:--site-fs-stat) leading-(--site-lh-stat) font-(--site-fw-stat) tracking-(--site-tracking-display)",
      false: "font-(--site-fw-strong)",
    },
  },
  defaultVariants: { total: false },
});

/** The receipt's note: when it renews, who sells it. */
export const siteOrderNoteStyle = defineSlotStyle({
  slot: "site-order-note",
  base: "m-0 px-4 pb-3 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The consents the payment needs: agreeing to all on the sunken ground, then each consent ruled apart. */
export const siteConsentListStyle = defineSlotStyle({
  slot: "site-consent-list",
  base: "min-w-0 overflow-hidden rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface)",
  variants: {},
  defaultVariants: {},
});

/** Agreeing to every consent at once. */
export const siteConsentAllStyle = defineSlotStyle({
  slot: "site-consent-all",
  base: "bg-(--site-surface-sunken) px-3.5 py-3 font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** One consent, with the way to read the document it names at the end. */
export const siteConsentItemStyle = defineSlotStyle({
  slot: "site-consent-item",
  base: "flex items-start gap-2 border-t border-(--site-line) px-3.5 py-2.5 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** The link to a consent's document, at the end of its row. */
export const siteConsentViewStyle = defineSlotStyle({
  slot: "site-consent-view",
  base: "ml-auto flex shrink-0",
  variants: {},
  defaultVariants: {},
});

/** A consent asked again where the amount changed: what changed in the warn colour, then the consent. */
export const siteConsentAgainStyle = defineSlotStyle({
  slot: "site-consent-again",
  base: "flex min-w-0 flex-col gap-1.5 rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface) px-3.5 py-2.5 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** What changed, in the warn colour. */
export const siteConsentAgainNoteStyle = defineSlotStyle({
  slot: "site-consent-again-note",
  base: "m-0 font-(--site-fw-strong) text-(--site-warn)",
  variants: {},
  defaultVariants: {},
});

/**
 * The payment side: the provider's frame stood on a dashed sunken ground with its name, so a reader
 * sees where our page ends and the provider's begins.
 */
export const siteProviderFrameStyle = defineSlotStyle({
  slot: "site-provider-frame",
  base: "flex min-w-0 flex-col gap-2 rounded-(--site-radius-xl) border-2 border-dashed border-(--site-ink-faint) bg-(--site-surface-sunken) p-2.5",
  variants: {},
  defaultVariants: {},
});

/** The frame's label line: whose frame it is, and the owner at the end. */
export const siteProviderLabelStyle = defineSlotStyle({
  slot: "site-provider-label",
  base: "flex min-w-0 items-center gap-2 px-1 font-(family-name:--site-font-mono) text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The label line's square mark. */
export const siteProviderMarkStyle = defineSlotStyle({
  slot: "site-provider-mark",
  base: "block size-1.5 shrink-0 rounded-(--site-radius-xs) bg-(--site-ink-faint)",
  variants: {},
  defaultVariants: {},
});

/** The label line's name, cut where it is too long. */
export const siteProviderNameStyle = defineSlotStyle({
  slot: "site-provider-name",
  base: "min-w-0 flex-1 truncate",
  variants: {},
  defaultVariants: {},
});

/** The label line's owner. */
export const siteProviderOwnerStyle = defineSlotStyle({
  slot: "site-provider-owner",
  base: "shrink-0",
  variants: {},
  defaultVariants: {},
});

/** The provider's frame itself, raised on the surface. */
export const siteProviderBodyStyle = defineSlotStyle({
  slot: "site-provider-body",
  base: "flex min-h-100 min-w-0 flex-col rounded-(--site-radius-lg) bg-(--site-surface) p-4.5 shadow-[var(--site-shadow-float)]",
  variants: {},
  defaultVariants: {},
});

/** What our page says in the provider's place before the provider draws there: centred, with room above and below. */
export const siteProviderWaitingStyle = defineSlotStyle({
  slot: "site-provider-waiting",
  base: "flex flex-col items-center gap-3 py-10 text-center",
  variants: {},
  defaultVariants: {},
});

/** The element a provider's script draws its frame into: the body's whole width, no look of its own. */
export const siteProviderTargetStyle = defineSlotStyle({
  slot: "site-provider-target",
  base: "min-w-0 w-full",
  variants: {},
  defaultVariants: {},
});

/** The waiting place's sentence, muted and kept to a narrow measure. */
export const siteProviderWaitingTextStyle = defineSlotStyle({
  slot: "site-provider-waiting-text",
  base: "m-0 max-w-xs text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Ways to pay in two columns; the first or a lone one may span both. */
export const siteMethodGridStyle = defineSlotStyle({
  slot: "site-method-grid",
  base: "grid min-w-0 grid-cols-2 gap-2",
  variants: {},
  defaultVariants: {},
});

/** One way to pay: its mark, its name and its line; the chosen one in the accent. */
export const siteMethodStyle = defineSlotStyle({
  slot: "site-method",
  base:
    "flex min-w-0 cursor-pointer items-center gap-2.5 rounded-(--site-radius-lg) border-2 bg-(--site-surface) px-3 py-2.5 text-left font-(family-name:--site-font-sans) text-(--site-ink) outline-none transition duration-(--site-duration-fast) ease-(--site-ease) focus-visible:shadow-[var(--site-focus-ring)] disabled:cursor-not-allowed disabled:opacity-(--site-faint)",
  variants: {
    pressed: {
      true: "border-(--site-accent) bg-(--site-accent-soft)",
      false: "border-(--site-line) hover:border-(--site-control-line)",
    },
    wide: {
      true: "col-span-2",
      false: "",
    },
  },
  defaultVariants: { pressed: false, wide: false },
});

/** A way to pay's mark: its first letters on an ink tile. */
export const siteMethodMarkStyle = defineSlotStyle({
  slot: "site-method-mark",
  base: "grid h-5.5 w-7.5 shrink-0 place-items-center rounded-(--site-radius-xs) bg-(--site-ink) font-(family-name:--site-font-mono) text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-bold) tracking-(--site-tracking-label) text-(--site-surface)",
  variants: {},
  defaultVariants: {},
});

/** A way to pay's name over its line. */
export const siteMethodTextStyle = defineSlotStyle({
  slot: "site-method-text",
  base: "flex min-w-0 flex-col",
  variants: {},
  defaultVariants: {},
});

/** A way to pay's name. */
export const siteMethodNameStyle = defineSlotStyle({
  slot: "site-method-name",
  base: "truncate text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** A way to pay's line, muted. */
export const siteMethodAboutStyle = defineSlotStyle({
  slot: "site-method-about",
  base: "truncate text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** After payment: the steps from paid to the apps switched over, outlined in the accent. */
export const siteProgressChainStyle = defineSlotStyle({
  slot: "site-progress-chain",
  base: "flex min-w-0 flex-col gap-3 rounded-(--site-radius-xl) border-2 border-(--site-accent) bg-(--site-surface) p-4",
  variants: {},
  defaultVariants: {},
});

/** The chain's steps. */
export const siteChainStepsStyle = defineSlotStyle({
  slot: "site-chain-steps",
  base: "m-0 flex list-none flex-col gap-2 p-0",
  variants: {},
  defaultVariants: {},
});

/** One step of the chain: done or running in the ink, waiting muted. */
export const siteChainStepStyle = defineSlotStyle({
  slot: "site-chain-step",
  base: "flex min-w-0 items-center gap-2.5 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane)",
  variants: {
    state: {
      done: "text-(--site-ink)",
      running: "text-(--site-ink)",
      waiting: "text-(--site-ink-muted)",
    },
  },
  defaultVariants: { state: "waiting" },
});

/** A chain step's disc: filled with a check when done, a spinner while running, a ring while waiting. */
export const siteChainDiscStyle = defineSlotStyle({
  slot: "site-chain-disc",
  base: "grid size-6 shrink-0 place-items-center rounded-(--site-radius-full) border-2 [&_svg]:size-3",
  variants: {
    state: {
      done: "border-(--site-accent) bg-(--site-accent) text-(--site-on-accent)",
      running: "border-(--site-line)",
      waiting: "border-(--site-line)",
    },
  },
  defaultVariants: { state: "waiting" },
});

/** A chain step's words. */
export const siteChainLabelStyle = defineSlotStyle({
  slot: "site-chain-label",
  base: "min-w-0 flex-1",
  variants: {},
  defaultVariants: {},
});

/** What is ready now, on the sunken ground. */
export const siteChainReadyStyle = defineSlotStyle({
  slot: "site-chain-ready",
  base: "m-0 self-start rounded-(--site-radius-lg) bg-(--site-surface-sunken) px-3 py-2 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** The chain's last line: what to do with the window now. */
export const siteChainNoteStyle = defineSlotStyle({
  slot: "site-chain-note",
  base: "m-0 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
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

/** The done page's round mark on the good colour's soft ground. */
export const siteDoneMarkStyle = defineSlotStyle({
  slot: "site-done-mark",
  base: "grid size-14 place-items-center rounded-(--site-radius-full) bg-(--site-good-soft) text-(--site-good) [&_svg]:size-7",
  variants: {},
  defaultVariants: {},
});

/** The done page's title, the page's one h1. */
export const siteDoneTitleStyle = defineSlotStyle({
  slot: "site-done-title",
  base: "m-0 font-(family-name:--site-font-display) text-(length:--site-fs-title) leading-(--site-lh-title) font-(--site-fw-title) tracking-(--site-tracking-display)",
  variants: {},
  defaultVariants: {},
});

/** The done page's sentences, a readable measure wide: the body in the reading size, the notice in small print. */
export const siteDoneTextStyle = defineSlotStyle({
  slot: "site-done-text",
  base: "m-0 max-w-xl text-(--site-ink-muted)",
  variants: {
    size: {
      body: "text-(length:--site-fs-body) leading-(--site-lh-body)",
      caption: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
    },
  },
  defaultVariants: { size: "body" },
});
