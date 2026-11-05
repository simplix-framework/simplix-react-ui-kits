import { defineSlotStyle } from "@simplix-react/ui/design";

import { SITE_CARD } from "../page/site-page.style";

/** My account: the section list beside the section; below the medium tier the list stands over it. */
export const siteAccountStyle = defineSlotStyle({
  slot: "site-account",
  base: "flex min-w-0 items-start gap-8 @max-page-medium/page:flex-col @max-page-medium/page:items-stretch @max-page-medium/page:gap-3",
  variants: {},
  defaultVariants: {},
});

/** The section list: a column a fifth of the page wide, a wrapping row below the medium tier. */
export const siteSectionNavStyle = defineSlotStyle({
  slot: "site-section-nav",
  base: "flex w-1/5 shrink-0 flex-col gap-0.5 @max-page-medium/page:w-full @max-page-medium/page:flex-row @max-page-medium/page:flex-wrap",
  variants: {},
  defaultVariants: {},
});

/**
 * One section of the list: the current one on the accent's soft ground; `danger` (deleting the
 * account) in the bad colour while it is not the current one. A section that is not open yet
 * (`pending`) is the same words as plain text: no ground under the pointer and no press.
 */
export const siteSectionNavItemStyle = defineSlotStyle({
  slot: "site-section-nav-item",
  base:
    "cursor-pointer rounded-(--site-radius-md) px-3 py-2 text-left text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) no-underline outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) focus-visible:shadow-[var(--site-focus-ring)]",
  variants: {
    state: {
      current: "bg-(--site-accent-soft) font-(--site-fw-strong) text-(--site-accent-text)",
      plain: "font-(--site-fw-base) text-(--site-ink) hover:bg-(--site-surface-sunken)",
      danger: "font-(--site-fw-base) text-(--site-bad) hover:bg-(--site-surface-sunken)",
    },
    pending: {
      true: "cursor-default hover:bg-transparent",
      false: "",
    },
  },
  defaultVariants: { state: "plain", pending: false },
});

/** The section beside the list: the standing notice, the heading and the section's parts, one gap apart. */
export const siteAccountSectionStyle = defineSlotStyle({
  slot: "site-account-section",
  base: "flex min-w-0 flex-1 flex-col gap-3.5",
  variants: {},
  defaultVariants: {},
});

/** A heading inside My account: the section's title, or a part's title one level down. */
export const siteSectionHeadStyle = defineSlotStyle({
  slot: "site-section-head",
  base: "m-0 outline-none font-(family-name:--site-font-display) tracking-(--site-tracking-display) text-(--site-ink)",
  variants: {
    level: {
      "2": "text-(length:--site-fs-headline) leading-(--site-lh-headline) font-(--site-fw-title)",
      "3": "mt-1.5 text-(length:--site-fs-heading) leading-(--site-lh-heading) font-(--site-fw-strong)",
    },
  },
  defaultVariants: { level: "2" },
});

/** Rows of settings on one card, ruled apart. */
export const siteSettingsRowsStyle = defineSlotStyle({
  slot: "site-settings-rows",
  base: "flex min-w-0 flex-col divide-y divide-(--site-line) overflow-hidden rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface)",
  variants: {},
  defaultVariants: {},
});

/** One setting: what it is and its state, then its actions; the actions wrap under on a narrow card. */
export const siteSettingsRowStyle = defineSlotStyle({
  slot: "site-settings-row",
  base: "flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3",
  variants: {},
  defaultVariants: {},
});

/** A row's title over its line. */
export const siteSettingsRowTextStyle = defineSlotStyle({
  slot: "site-settings-row-text",
  base: "flex min-w-0 flex-1 basis-60 flex-col gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** A row's title, with a chip beside it. */
export const siteSettingsRowTitleStyle = defineSlotStyle({
  slot: "site-settings-row-title",
  base: "flex min-w-0 flex-wrap items-center gap-2 font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** A row's line: its state, date or amount, muted. */
export const siteSettingsRowMetaStyle = defineSlotStyle({
  slot: "site-settings-row-meta",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A row's actions. */
export const siteSettingsRowActionsStyle = defineSlotStyle({
  slot: "site-settings-row-actions",
  base: "flex shrink-0 flex-wrap gap-2",
  variants: {},
  defaultVariants: {},
});

/** A question or a confirmation inside a section, on a card; `danger` on the bad colour's soft ground. */
export const siteSettingsBoxStyle = defineSlotStyle({
  slot: "site-settings-box",
  base: "flex min-w-0 flex-col gap-3 rounded-(--site-radius-xl) border p-4 outline-none",
  variants: {
    tone: {
      plain: "border-(--site-line) bg-(--site-surface)",
      danger: "border-(--site-bad) bg-(--site-bad-soft)",
    },
  },
  defaultVariants: { tone: "plain" },
});

/** A sentence inside a section in the reading size: a quote for a change, what cancelling means (muted), or a state in bold. */
export const siteSettingsTextStyle = defineSlotStyle({
  slot: "site-settings-text",
  base: "m-0 min-w-0 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane)",
  variants: {
    tone: {
      plain: "",
      muted: "text-(--site-ink-muted)",
      strong: "font-(--site-fw-strong)",
    },
  },
  defaultVariants: { tone: "plain" },
});

/** The actions of a question in a section. */
export const siteSettingsActionsStyle = defineSlotStyle({
  slot: "site-settings-actions",
  base: "flex min-w-0 flex-wrap gap-2",
  variants: {},
  defaultVariants: {},
});

/** Who or what a section is about: the round mark, the name and its line, and a chip. */
export const siteIdentityStyle = defineSlotStyle({
  slot: "site-identity",
  base: "flex min-w-0 items-center gap-3",
  variants: {},
  defaultVariants: {},
});

/** The round mark: the product's glyph or initial on the tone's soft ground. */
export const siteIdentityMarkStyle = defineSlotStyle({
  slot: "site-identity-mark",
  base: "grid size-9.5 shrink-0 place-items-center overflow-clip rounded-(--site-radius-full) text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) font-(--site-fw-strong) [&_svg]:size-4.5",
  variants: {
    tone: {
      accent: "bg-(--site-accent-soft) text-(--site-accent-text)",
      voice: "bg-(--site-voice-soft) text-(--site-voice-text)",
    },
  },
  defaultVariants: { tone: "accent" },
});

/** The name and its line. */
export const siteIdentityTextStyle = defineSlotStyle({
  slot: "site-identity-text",
  base: "flex min-w-0 flex-1 flex-col",
  variants: {},
  defaultVariants: {},
});

/** The name. */
export const siteIdentityNameStyle = defineSlotStyle({
  slot: "site-identity-name",
  base: "text-(length:--site-fs-body) leading-(--site-lh-body) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** The name's line, muted. */
export const siteIdentityMetaStyle = defineSlotStyle({
  slot: "site-identity-meta",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A bordered panel inside a section: a meter, a chart, what the free plan gives. */
export const sitePanelStyle = defineSlotStyle({
  slot: "site-panel",
  base: SITE_CARD,
  variants: {},
  defaultVariants: {},
});

/** A panel's title. */
export const sitePanelTitleStyle = defineSlotStyle({
  slot: "site-panel-title",
  base: "m-0 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** A line inside a panel: what it says at the start, an action at the end. */
export const sitePanelLineStyle = defineSlotStyle({
  slot: "site-panel-line",
  base: "flex min-w-0 flex-wrap items-center justify-between gap-2 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A share of an allowance: the bar, then what it says at its two ends. */
export const siteQuotaMeterStyle = defineSlotStyle({
  slot: "site-quota-meter",
  base: "flex min-w-0 flex-col gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** The meter's track. */
export const siteQuotaTrackStyle = defineSlotStyle({
  slot: "site-quota-track",
  base: "relative h-2.5 overflow-hidden rounded-(--site-radius-full) bg-(--site-surface-sunken)",
  variants: {},
  defaultVariants: {},
});

/** The share filled, in the accent; its width is the share. */
export const siteQuotaFillStyle = defineSlotStyle({
  slot: "site-quota-fill",
  base: "absolute inset-y-0 left-0 rounded-(--site-radius-full) bg-(--site-accent) transition-[width] duration-(--site-duration-base) ease-(--site-ease)",
  variants: {},
  defaultVariants: {},
});

/** What the meter says at its start and its end, muted; they wrap on a narrow panel. */
export const siteQuotaLabelsStyle = defineSlotStyle({
  slot: "site-quota-labels",
  base: "flex min-w-0 flex-wrap justify-between gap-x-3 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A run of days as bars standing on one line, the tallest reaching the top. */
export const siteDaySeriesStyle = defineSlotStyle({
  slot: "site-day-series",
  base: "m-0 flex h-30 list-none items-end gap-1.5 p-0",
  variants: {},
  defaultVariants: {},
});

/** One day's column. */
export const siteDayStyle = defineSlotStyle({
  slot: "site-day",
  base: "flex h-full min-w-0 flex-1 items-end",
  variants: {},
  defaultVariants: {},
});

/** One day's words, for a screen reader only. */
export const siteDayLabelStyle = defineSlotStyle({
  slot: "site-day-label",
  base: "sr-only",
  variants: {},
  defaultVariants: {},
});

/** One day's bar; its height is the day's share of the tallest. */
export const siteDayBarStyle = defineSlotStyle({
  slot: "site-day-bar",
  base: "block w-full rounded-t-(--site-radius-sm) bg-(--site-accent)",
  variants: {},
  defaultVariants: {},
});

/** The first and the last day under the bars. */
export const siteDayAxisStyle = defineSlotStyle({
  slot: "site-day-axis",
  base: "flex justify-between text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/**
 * A table on a card: equal columns, the first bold, the middle muted, the last at the end. Below the
 * narrow page tier the columns take their content's width, so the last column holds its widest
 * action (a receipt's refund request) instead of cutting it at the card's edge.
 */
export const siteTableCardStyle = defineSlotStyle({
  slot: "site-table-card",
  base: "w-full min-w-0 table-fixed overflow-hidden rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface) text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) @max-page-narrow/page:table-auto",
  variants: {},
  defaultVariants: {},
});

/** The table's head row, on the sunken ground. */
export const siteTableCardHeadStyle = defineSlotStyle({
  slot: "site-table-card-head",
  base: "bg-(--site-surface-sunken) text-left text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A column's name; the last column's at the end. */
export const siteTableCardThStyle = defineSlotStyle({
  slot: "site-table-card-th",
  base: "px-4 py-2 font-(--site-fw-strong)",
  variants: {
    end: {
      true: "text-right",
      false: "",
    },
  },
  defaultVariants: { end: false },
});

/** The table's rows, ruled apart. */
export const siteTableCardBodyStyle = defineSlotStyle({
  slot: "site-table-card-body",
  base: "divide-y divide-(--site-line)",
  variants: {},
  defaultVariants: {},
});

/** One row. */
export const siteTableCardRowStyle = defineSlotStyle({
  slot: "site-table-card-row",
  base: "align-middle outline-none focus-visible:shadow-[var(--site-focus-ring-inset)]",
  variants: {},
  defaultVariants: {},
});

/** One cell: the row's subject in bold, a value muted, or the end figure or actions at the end. */
export const siteTableCardCellStyle = defineSlotStyle({
  slot: "site-table-card-cell",
  base: "break-words px-4 py-2.5",
  variants: {
    kind: {
      lead: "font-(--site-fw-strong)",
      value: "text-(--site-ink-muted)",
      end: "text-right",
    },
  },
  defaultVariants: { kind: "value" },
});

/** A row's actions in its end cell. */
export const siteTableCardActionsStyle = defineSlotStyle({
  slot: "site-table-card-actions",
  base: "inline-flex flex-wrap justify-end gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** Under a table whose rows grow: the way to show the next rows. */
export const siteTableCardMoreStyle = defineSlotStyle({
  slot: "site-table-card-more",
  base: "flex min-w-0 justify-center",
  variants: {},
  defaultVariants: {},
});

/** One end of a meter's labels, an axis's labels or a panel line's words. */
export const siteFigureLabelStyle = defineSlotStyle({
  slot: "site-figure-label",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});
