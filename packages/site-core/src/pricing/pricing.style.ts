import { defineSlotStyle } from "@simplix-react/ui/design";

/** The row of switches above the offers (billing cycle, currency); it wraps on a narrow page. */
export const siteSwitchRowStyle = defineSlotStyle({
  slot: "site-switch-row",
  base: "flex min-w-0 flex-wrap items-center gap-3",
  variants: {},
  defaultVariants: {},
});

/** One choice of a few on a sunken track; exactly one option is always chosen. */
export const siteSwitchStyle = defineSlotStyle({
  slot: "site-switch",
  base: "inline-flex gap-0.5 rounded-(--site-radius-md) border border-(--site-line) bg-(--site-surface-sunken) p-0.5",
  variants: {},
  defaultVariants: {},
});

/** One option of a switch; the chosen one stands on the surface with a hairline ring. */
export const siteSwitchOptionStyle = defineSlotStyle({
  slot: "site-switch-option",
  base:
    "inline-flex h-(--site-control-sm) cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-(--site-radius-sm) border-0 bg-transparent px-2.5 font-(family-name:--site-font-sans) text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted) outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) hover:text-(--site-ink) focus-visible:shadow-[var(--site-focus-ring)] disabled:cursor-not-allowed disabled:opacity-(--site-faint)",
  variants: {
    checked: {
      true: "bg-(--site-surface) font-(--site-fw-strong) text-(--site-ink) ring-1 ring-(--site-line)",
      false: "",
    },
    // `sm` for a switch that sits in a line of small text, such as the footer's language picker.
    size: {
      md: "",
      sm: "h-6",
    },
    // A switch that cannot be changed now as a whole (a cycle locked once payment has begun) dims
    // every option like any control that cannot be used; one option left out is fainter.
    locked: {
      true: "disabled:opacity-(--site-dim)",
      false: "",
    },
  },
  defaultVariants: { checked: false, size: "md", locked: false },
});

/** The offers side by side: four to a row, two below the medium tier, one below the narrow tier. */
export const sitePlanGridStyle = defineSlotStyle({
  slot: "site-plan-grid",
  base: "grid min-w-0 gap-3 @max-page-medium/page:grid-cols-2 @max-page-narrow/page:grid-cols-1",
  variants: {
    columns: {
      "3": "grid-cols-3",
      "4": "grid-cols-4",
    },
  },
  defaultVariants: { columns: "4" },
});

/** One offer: its name, its price, what it is for and what it includes, then its actions at the foot. */
export const sitePlanCardStyle = defineSlotStyle({
  slot: "site-plan-card",
  base: "relative flex min-w-0 flex-col gap-2 rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface) p-4",
  variants: {
    highlight: {
      true: "border-(--site-accent) shadow-[var(--site-shadow-accent)]",
      false: "",
    },
  },
  defaultVariants: { highlight: false },
});

/** The mark on the offer most people choose, standing on the card's top edge. */
export const sitePlanCardBadgeStyle = defineSlotStyle({
  slot: "site-plan-card-badge",
  base:
    "absolute -top-2.5 left-3 rounded-(--site-radius-full) bg-(--site-accent) px-2 text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-on-accent)",
  variants: {},
  defaultVariants: {},
});

/** The offer's name. */
export const sitePlanCardNameStyle = defineSlotStyle({
  slot: "site-plan-card-name",
  base: "m-0 text-(length:--site-fs-subheading) leading-(--site-lh-subheading) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** The price, in the display family, with figures that line up. */
export const sitePlanCardPriceStyle = defineSlotStyle({
  slot: "site-plan-card-price",
  base:
    "m-0 font-(family-name:--site-font-display) text-(length:--site-fs-stat) leading-(--site-lh-stat) font-(--site-fw-stat) tracking-(--site-tracking-display) tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** What the price is per ("/mo", "once"), small and in the text family beside the figure. */
export const sitePlanCardUnitStyle = defineSlotStyle({
  slot: "site-plan-card-unit",
  base: "font-(family-name:--site-font-sans) text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A small muted line on an offer: the price's terms, or what the offer comes to. */
export const sitePlanCardNoteStyle = defineSlotStyle({
  slot: "site-plan-card-note",
  base: "m-0 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Who the offer is for, in body text. */
export const sitePlanCardPitchStyle = defineSlotStyle({
  slot: "site-plan-card-pitch",
  base: "m-0 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane)",
  variants: {},
  defaultVariants: {},
});

/** The offer's actions at the card's foot, the strongest first. */
export const sitePlanCardActionsStyle = defineSlotStyle({
  slot: "site-plan-card-actions",
  base: "flex min-w-0 flex-col gap-2",
  variants: {},
  defaultVariants: {},
});

/** Why a plan card's actions cannot run now, under them in the card's muted caption. */
export const sitePlanCardReasonStyle = defineSlotStyle({
  slot: "site-plan-card-reason",
  base: "m-0 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** What an offer includes, a mark before each line; a line it leaves out is drawn faint. */
export const siteFeatureListStyle = defineSlotStyle({
  slot: "site-feature-list",
  base: "m-0 grid min-w-0 list-none gap-x-3.5 gap-y-1.5 p-0 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {
    columns: {
      "1": "grid-cols-1",
      "2": "grid-cols-2 @max-page-narrow/page:grid-cols-1",
    },
  },
  defaultVariants: { columns: "1" },
});

/** One line of what an offer includes. */
export const siteFeatureStyle = defineSlotStyle({
  slot: "site-feature",
  base: "flex min-w-0 items-start gap-1.5",
  variants: {
    included: {
      true: "",
      false: "opacity-(--site-faint)",
    },
  },
  defaultVariants: { included: true },
});

/** A line's words beside its mark; they wrap under themselves, not under the mark. */
export const siteFeatureLabelStyle = defineSlotStyle({
  slot: "site-feature-label",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** The mark before a line: a check in the accent, or a dash for a line the offer leaves out. */
export const siteFeatureMarkStyle = defineSlotStyle({
  slot: "site-feature-mark",
  base: "mt-0.5 size-3.5 shrink-0",
  variants: {
    included: {
      true: "text-(--site-accent)",
      false: "text-(--site-ink-muted)",
    },
  },
  defaultVariants: { included: true },
});

/** An offer in one row: its title, what it is, its action, and a note under them when it has one. */
export const siteOfferRowStyle = defineSlotStyle({
  slot: "site-offer-row",
  base: "flex min-w-0 flex-row flex-wrap items-center gap-3 rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface) px-4 py-3.5",
  variants: {},
  defaultVariants: {},
});

/** The row's title. */
export const siteOfferRowTitleStyle = defineSlotStyle({
  slot: "site-offer-row-title",
  base: "m-0 text-(length:--site-fs-base) leading-(--site-lh-base) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** What the row's offer is, taking the room between the title and the action. */
export const siteOfferRowAboutStyle = defineSlotStyle({
  slot: "site-offer-row-about",
  base: "min-w-0 flex-1 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A note under the row, across its whole width (why the action is not open yet). */
export const siteOfferRowNoteStyle = defineSlotStyle({
  slot: "site-offer-row-note",
  base: "m-0 w-full text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A table of prices or terms on a card. */
export const sitePriceTableStyle = defineSlotStyle({
  slot: "site-price-table",
  base: "min-w-0",
  variants: {
    // On its own the table is a card; set inside another part (a help article's quick checks) it is
    // the bare table on that part's ground.
    framed: {
      true: "rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface) p-4",
      false: "",
    },
  },
  defaultVariants: { framed: true },
});

/** The table itself, across the card. */
export const sitePriceTableGridStyle = defineSlotStyle({
  slot: "site-price-table-grid",
  base: "w-full border-collapse text-left text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** The table's name, over it. */
export const sitePriceTableCaptionStyle = defineSlotStyle({
  slot: "site-price-table-caption",
  base: "pb-2 text-left text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** The row of column names, ruled under. */
export const sitePriceTableHeadStyle = defineSlotStyle({
  slot: "site-price-table-head",
  base: "border-b border-(--site-line) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A column's name. */
export const sitePriceTableColumnStyle = defineSlotStyle({
  slot: "site-price-table-column",
  base: "py-1.5 pr-3 text-left font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** A row of the table, ruled under except the last. */
export const sitePriceTableRowStyle = defineSlotStyle({
  slot: "site-price-table-row",
  base: "border-b border-(--site-line) last:border-b-0",
  variants: {},
  defaultVariants: {},
});

/** The row's name, at its start. */
export const sitePriceTableRowHeadStyle = defineSlotStyle({
  slot: "site-price-table-row-head",
  base: "py-1.5 pr-3 text-left font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** One value of a row. */
export const sitePriceTableCellStyle = defineSlotStyle({
  slot: "site-price-table-cell",
  base: "py-1.5 pr-3 text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Questions asked before paying, with their answers: three to a row, one below the medium tier. */
export const siteQuestionListStyle = defineSlotStyle({
  slot: "site-question-list",
  base: "m-0 grid min-w-0 grid-cols-3 gap-3 @max-page-medium/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});

/** One question with its answer. */
export const siteQuestionStyle = defineSlotStyle({
  slot: "site-question",
  base: "flex min-w-0 flex-col gap-1 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** The question. */
export const siteQuestionAskStyle = defineSlotStyle({
  slot: "site-question-ask",
  base: "m-0 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** The answer. */
export const siteQuestionAnswerStyle = defineSlotStyle({
  slot: "site-question-answer",
  base: "m-0 text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});
