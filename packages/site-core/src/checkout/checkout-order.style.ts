import { defineSlotStyle } from "@simplix-react/ui/design";

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
