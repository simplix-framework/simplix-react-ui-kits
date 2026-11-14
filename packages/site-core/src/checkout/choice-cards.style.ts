import { defineSlotStyle } from "@simplix-react/ui/design";

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
