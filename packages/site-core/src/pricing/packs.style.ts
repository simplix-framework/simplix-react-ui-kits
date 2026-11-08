import { defineSlotStyle } from "@simplix-react/ui/design";

import { SITE_CARD, siteCaptionStyle } from "../page/site-page.style";

/** The muted caption line every small line of the packs view is drawn in. */
const CAPTION = siteCaptionStyle.base;

/** The packs view: its heading and lede, the packs side by side, then a closing line. */
export const sitePackSectionStyle = defineSlotStyle({
  slot: "site-pack-section",
  base: "flex min-w-0 flex-col gap-3",
  variants: {},
  defaultVariants: {},
});

/** The view's heading over its lede, closer to each other than to the packs. */
export const sitePackHeadStyle = defineSlotStyle({
  slot: "site-pack-head",
  base: "flex min-w-0 flex-col gap-1",
  variants: {},
  defaultVariants: {},
});

/** The lines the view says about itself, one under the other, between the heading and the packs. */
export const sitePackStatusStyle = defineSlotStyle({
  slot: "site-pack-status",
  base: "flex min-w-0 flex-col gap-1",
  variants: {},
  defaultVariants: {},
});

/** The packs side by side, one under the other below the medium tier. */
export const sitePackGridStyle = defineSlotStyle({
  slot: "site-pack-grid",
  base: "grid min-w-0 grid-cols-2 gap-3 @max-page-medium/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});

/** One pack: a card with its lines one under the other. */
export const sitePackCardStyle = defineSlotStyle({
  slot: "site-pack-card",
  base: SITE_CARD,
  variants: {},
  defaultVariants: {},
});

/** The pack's name and its price on one line, on a shared baseline, the price wrapping under a long name. */
export const sitePackCardHeadStyle = defineSlotStyle({
  slot: "site-pack-card-head",
  base: "flex min-w-0 flex-wrap items-baseline gap-x-3",
  variants: {},
  defaultVariants: {},
});

/** The pack's name. */
export const sitePackCardNameStyle = defineSlotStyle({
  slot: "site-pack-card-name",
  base: "m-0 text-(length:--site-fs-subheading) leading-(--site-lh-subheading) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** The price, in the display family with figures of one width. */
export const sitePackCardPriceStyle = defineSlotStyle({
  slot: "site-pack-card-price",
  base: "font-(family-name:--site-font-display) text-(length:--site-fs-stat) leading-(--site-lh-stat) font-(--site-fw-stat) tracking-(--site-tracking-display) tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** What the price is per ("once"), small and muted in the text family. */
export const sitePackCardUnitStyle = defineSlotStyle({
  slot: "site-pack-card-unit",
  base: "font-(family-name:--site-font-sans) text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Who the pack is for. */
export const sitePackCardAboutStyle = defineSlotStyle({
  slot: "site-pack-card-about",
  base: "m-0 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The characters the pack gives, at the meter's start, in the ink and bold. */
export const sitePackCardAmountStyle = defineSlotStyle({
  slot: "site-pack-card-amount",
  base: "font-(--site-fw-bold) text-(--site-ink)",
  variants: {},
  defaultVariants: {},
});

/** How long the pack lasts and that it never renews. */
export const sitePackCardTermsStyle = defineSlotStyle({
  slot: "site-pack-card-terms",
  base: CAPTION,
  variants: {},
  defaultVariants: {},
});

/** The pack's action, at its own width at the card's start. */
export const sitePackCardActionsStyle = defineSlotStyle({
  slot: "site-pack-card-actions",
  base: "flex min-w-0",
  variants: {},
  defaultVariants: {},
});

/** Why the pack's action cannot run now, under it; the disabled action is described by it. */
export const sitePackCardReasonStyle = defineSlotStyle({
  slot: "site-pack-card-reason",
  base: CAPTION,
  variants: {},
  defaultVariants: {},
});

/** The line under the packs, such as how a plan compares. */
export const sitePackNoteStyle = defineSlotStyle({
  slot: "site-pack-note",
  base: CAPTION,
  variants: {},
  defaultVariants: {},
});
