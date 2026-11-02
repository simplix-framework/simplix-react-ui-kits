import { defineSlotStyle } from "@simplix-react/ui/design";

import { SITE_CARD } from "../page/site-page.style";

/** A document's head: the title row with its badge, the controls row, then a notice. */
export const siteDocHeadStyle = defineSlotStyle({
  slot: "site-doc-head",
  base: "flex min-w-0 flex-col gap-3",
  variants: {},
  defaultVariants: {},
});

/** The document's title and the badge beside it; they wrap. */
export const siteDocTitleRowStyle = defineSlotStyle({
  slot: "site-doc-title-row",
  base: "flex min-w-0 flex-wrap items-center gap-3",
  variants: {},
  defaultVariants: {},
});

/** The document's title, the page's one h1. */
export const siteDocTitleStyle = defineSlotStyle({
  slot: "site-doc-title",
  base:
    "m-0 font-(family-name:--site-font-display) text-(length:--site-fs-title) leading-(--site-lh-title) font-(--site-fw-title) tracking-(--site-tracking-display)",
  variants: {},
  defaultVariants: {},
});

/** The document's controls (the version, the comparison, saving as a PDF); they wrap. */
export const siteDocControlsStyle = defineSlotStyle({
  slot: "site-doc-controls",
  base: "flex min-w-0 flex-wrap items-center gap-2",
  variants: {},
  defaultVariants: {},
});

/** The contents beside the document and the document; one under the other below the medium tier. */
export const siteDocBodyStyle = defineSlotStyle({
  slot: "site-doc-body",
  base: "flex min-w-0 items-start gap-8 @max-page-medium/page:flex-col @max-page-medium/page:items-stretch @max-page-medium/page:gap-4",
  variants: {},
  defaultVariants: {},
});

/**
 * The contents rail: a quarter of the width, held in view while the document scrolls. Below the
 * medium tier it spans the column and its list gives way to the product's jump control.
 */
export const siteDocRailStyle = defineSlotStyle({
  slot: "site-doc-rail",
  base: "sticky top-4 flex w-1/4 shrink-0 flex-col gap-2 @max-page-medium/page:static @max-page-medium/page:w-full",
  variants: {},
  defaultVariants: {},
});

/** The rail's title, which the list's narrow form leaves out. */
export const siteDocRailTitleStyle = defineSlotStyle({
  slot: "site-doc-rail-title",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-strong) text-(--site-ink-muted) @max-page-medium/page:hidden",
  variants: {},
  defaultVariants: {},
});

/** The rail's list of sections. */
export const siteTocStyle = defineSlotStyle({
  slot: "site-toc",
  base: "m-0 flex min-w-0 list-none flex-col gap-0.5 p-0 @max-page-medium/page:hidden",
  variants: {},
  defaultVariants: {},
});

/** One section in the rail. */
export const siteTocItemStyle = defineSlotStyle({
  slot: "site-toc-item",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** A section's button in the rail; the section in view stands on the accent's soft ground. */
export const siteTocButtonStyle = defineSlotStyle({
  slot: "site-toc-button",
  base:
    "flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-(--site-radius-md) border-0 bg-transparent px-2.5 py-1.5 text-left font-(family-name:--site-font-sans) text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink) outline-none focus-visible:shadow-[var(--site-focus-ring)]",
  variants: {
    current: {
      true: "bg-(--site-accent-soft) font-(--site-fw-strong) text-(--site-accent-strong)",
      false: "hover:bg-(--site-surface-sunken)",
    },
  },
  defaultVariants: { current: false },
});

/** A section's number, in the mono family. */
export const siteTocNumberStyle = defineSlotStyle({
  slot: "site-toc-number",
  base: "shrink-0 font-(family-name:--site-font-mono) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A section's title in the rail. */
export const siteTocTitleStyle = defineSlotStyle({
  slot: "site-toc-title",
  base: "min-w-0 flex-1",
  variants: {},
  defaultVariants: {},
});

/** A dot on a section that changed against the previous version. */
export const siteTocChangedStyle = defineSlotStyle({
  slot: "site-toc-changed",
  base: "block size-1.5 shrink-0 rounded-(--site-radius-full) bg-(--site-good)",
  variants: {},
  defaultVariants: {},
});

/** A tick on a section the reader marked as tried. */
export const siteTocDoneStyle = defineSlotStyle({
  slot: "site-toc-done",
  base: "flex shrink-0 text-(--site-good) [&_svg]:size-3",
  variants: {},
  defaultVariants: {},
});

/** Where the product's jump control (a select) stands below the medium tier, in the list's place. */
export const siteTocJumpStyle = defineSlotStyle({
  slot: "site-toc-jump",
  base: "hidden @max-page-medium/page:block",
  variants: {},
  defaultVariants: {},
});

/** What the rail holds under the list: progress, a link to another document, a way to ask. */
export const siteDocSideStyle = defineSlotStyle({
  slot: "site-doc-side",
  base: "flex min-w-0 flex-col gap-2",
  variants: {},
  defaultVariants: {},
});

/** The document's sections, one gap apart. */
export const siteDocStyle = defineSlotStyle({
  slot: "site-doc",
  base: "flex min-w-0 flex-1 flex-col gap-6",
  variants: {},
  defaultVariants: {},
});

/** A table on a document page; below the narrow tier each row becomes a card of labelled values. */
export const siteLegalTableStyle = defineSlotStyle({
  slot: "site-legal-table",
  base:
    "flex min-w-0 flex-col overflow-hidden rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface) text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** The table's header row, which a narrow page leaves out. */
export const siteLegalTableHeadStyle = defineSlotStyle({
  slot: "site-legal-table-head",
  base: "flex bg-(--site-surface-sunken) font-(--site-fw-strong) text-(--site-ink-muted) @max-page-narrow/page:hidden",
  variants: {},
  defaultVariants: {},
});

/** One row, ruled off from the one above; below the narrow tier its cells stack. */
export const siteLegalTableRowStyle = defineSlotStyle({
  slot: "site-legal-table-row",
  base: "flex border-t border-(--site-line) @max-page-narrow/page:flex-col @max-page-narrow/page:gap-1 @max-page-narrow/page:py-2",
  variants: {},
  defaultVariants: {},
});

/** A column's name in the header row. */
export const siteLegalTableColumnStyle = defineSlotStyle({
  slot: "site-legal-table-column",
  base: "min-w-0 flex-1 px-3 py-2",
  variants: {},
  defaultVariants: {},
});

/** One value; the row's first value is its name, in the strong weight. */
export const siteLegalTableCellStyle = defineSlotStyle({
  slot: "site-legal-table-cell",
  base: "min-w-0 flex-1 break-words px-3 py-2 @max-page-narrow/page:py-0.5",
  variants: {
    lead: {
      true: "font-(--site-fw-strong)",
      false: "",
    },
  },
  defaultVariants: { lead: false },
});

/** A value's column name, shown above it only below the narrow tier. */
export const siteLegalTableLabelStyle = defineSlotStyle({
  slot: "site-legal-table-label",
  base: "hidden font-(--site-fw-base) text-(--site-ink-muted) @max-page-narrow/page:block",
  variants: {},
  defaultVariants: {},
});

/** A notice across the column on its tone's soft ground: a glyph, the title, the words and the actions. */
export const siteBannerStyle = defineSlotStyle({
  slot: "site-banner",
  base: "flex min-w-0 items-start gap-2 rounded-(--site-radius-lg) border border-transparent px-3 py-2.5 text-(--site-ink)",
  variants: {
    tone: {
      info: "bg-(--site-accent-soft)",
      good: "bg-(--site-good-soft)",
      warn: "bg-(--site-warn-soft)",
      bad: "bg-(--site-bad-soft)",
    },
  },
  defaultVariants: { tone: "info" },
});

/** The banner's glyph, in its tone's colour. */
export const siteBannerMarkStyle = defineSlotStyle({
  slot: "site-banner-mark",
  base: "mt-0.5 flex shrink-0 [&_svg]:size-4",
  variants: {
    tone: {
      info: "text-(--site-accent-strong)",
      good: "text-(--site-good)",
      warn: "text-(--site-warn)",
      bad: "text-(--site-bad)",
    },
  },
  defaultVariants: { tone: "info" },
});

/** The banner's title, words and actions. */
export const siteBannerBodyStyle = defineSlotStyle({
  slot: "site-banner-body",
  base: "flex min-w-0 flex-1 flex-col gap-1",
  variants: {},
  defaultVariants: {},
});

/** The banner's title, the line a screen reader speaks. */
export const siteBannerTitleStyle = defineSlotStyle({
  slot: "site-banner-title",
  base: "m-0 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** The banner's words, muted. */
export const siteBannerTextStyle = defineSlotStyle({
  slot: "site-banner-text",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The banner's actions under its words. */
export const siteBannerActionsStyle = defineSlotStyle({
  slot: "site-banner-actions",
  base: "mt-1 flex min-w-0 flex-wrap gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** A switch with its words beside it (show the changes); dimmed while it cannot be used. */
export const siteToggleFieldStyle = defineSlotStyle({
  slot: "site-toggle-field",
  base: "flex items-center gap-2 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {
    disabled: {
      true: "opacity-(--site-dim)",
      false: "",
    },
  },
  defaultVariants: { disabled: false },
});

/** What changed against the previous version: the count with the marks' legend, then each change. */
export const siteChangeListStyle = defineSlotStyle({
  slot: "site-change-list",
  base: SITE_CARD,
  variants: {},
  defaultVariants: {},
});

/** The change list's title and the legend of the marks. */
export const siteChangeListHeadStyle = defineSlotStyle({
  slot: "site-change-list-head",
  base: "flex min-w-0 flex-wrap items-center gap-3",
  variants: {},
  defaultVariants: {},
});

/** The change list's title. */
export const siteChangeListTitleStyle = defineSlotStyle({
  slot: "site-change-list-title",
  base: "font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** A legend entry: what an addition or a removal looks like. */
export const siteChangeLegendStyle = defineSlotStyle({
  slot: "site-change-legend",
  base: "rounded-(--site-radius-xs) px-1 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {
    kind: {
      added: "bg-(--site-good-soft) text-(--site-good) no-underline",
      removed: "bg-(--site-bad-soft) text-(--site-bad)",
    },
  },
  defaultVariants: { kind: "added" },
});

/** The changes, one per line. */
export const siteChangeItemsStyle = defineSlotStyle({
  slot: "site-change-items",
  base: "m-0 flex min-w-0 list-none flex-col gap-1 p-0 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** One change. */
export const siteChangeItemStyle = defineSlotStyle({
  slot: "site-change-item",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** A change as a button that jumps to its article. */
export const siteChangeLinkStyle = defineSlotStyle({
  slot: "site-change-link",
  base:
    "flex cursor-pointer gap-2 rounded-(--site-radius-xs) border-0 bg-transparent p-0 text-left font-(family-name:--site-font-sans) text-inherit outline-none hover:underline focus-visible:shadow-[var(--site-focus-ring)]",
  variants: {},
  defaultVariants: {},
});

/** The changed article's number, in the strong weight. */
export const siteChangeNoStyle = defineSlotStyle({
  slot: "site-change-no",
  base: "shrink-0 font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** What changed in it, muted. */
export const siteChangeWhatStyle = defineSlotStyle({
  slot: "site-change-what",
  base: "text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/**
 * An article of a legal text; an article new in this version stands on the good tone's soft ground.
 * The closing provisions (an addendum) carry no summary and sit closer together.
 */
export const siteLegalArticleStyle = defineSlotStyle({
  slot: "site-legal-article",
  base: "flex min-w-0 scroll-mt-4 flex-col",
  variants: {
    kind: {
      article: "gap-3",
      addendum: "gap-2",
    },
    added: {
      true: "rounded-(--site-radius-xl) bg-(--site-good-soft) p-3",
      false: "",
    },
  },
  defaultVariants: { kind: "article", added: false },
});

/** The article's heading: its number in the accent, its title, its old number and its change tag. */
export const siteLegalArticleHeadingStyle = defineSlotStyle({
  slot: "site-legal-article-heading",
  base: "m-0 flex min-w-0 flex-wrap items-center gap-2 text-(length:--site-fs-heading) leading-(--site-lh-heading) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** The article's number. */
export const siteLegalArticleNoStyle = defineSlotStyle({
  slot: "site-legal-article-no",
  base: "text-(--site-accent-strong)",
  variants: {},
  defaultVariants: {},
});

/** The article's number in the previous version, where it moved. */
export const siteLegalArticleWasStyle = defineSlotStyle({
  slot: "site-legal-article-was",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-base) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** An article's summary in plain words, on the accent's soft ground. */
export const sitePlainSummaryStyle = defineSlotStyle({
  slot: "site-plain-summary",
  base: "flex min-w-0 flex-col gap-1 rounded-(--site-radius-lg) bg-(--site-accent-soft) px-3.5 py-2.5",
  variants: {},
  defaultVariants: {},
});

/** The summary's label ("In short") with its glyph. */
export const sitePlainSummaryLabelStyle = defineSlotStyle({
  slot: "site-plain-summary-label",
  base:
    "flex items-center gap-1 text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-accent-strong) [&_svg]:size-3",
  variants: {},
  defaultVariants: {},
});

/** The summary's words. */
export const sitePlainSummaryTextStyle = defineSlotStyle({
  slot: "site-plain-summary-text",
  base: "m-0 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane)",
  variants: {},
  defaultVariants: {},
});

/** An article's clauses, each marked with its circled number. */
export const siteClauseListStyle = defineSlotStyle({
  slot: "site-clause-list",
  base: "m-0 flex min-w-0 list-none flex-col gap-2 p-0 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane)",
  variants: {},
  defaultVariants: {},
});

/** One clause. */
export const siteClauseStyle = defineSlotStyle({
  slot: "site-clause",
  base: "flex min-w-0 gap-2",
  variants: {},
  defaultVariants: {},
});

/** A clause's mark, muted. */
export const siteClauseMarkStyle = defineSlotStyle({
  slot: "site-clause-mark",
  base: "shrink-0 text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A clause's words. */
export const siteClauseTextStyle = defineSlotStyle({
  slot: "site-clause-text",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** Text this version adds, marked in the good tone. */
export const siteDiffAddedStyle = defineSlotStyle({
  slot: "site-diff-added",
  base: "rounded-(--site-radius-xs) bg-(--site-good-soft) text-(--site-good) no-underline",
  variants: {},
  defaultVariants: {},
});

/** Text this version removes, struck through in the bad tone. */
export const siteDiffRemovedStyle = defineSlotStyle({
  slot: "site-diff-removed",
  base: "rounded-(--site-radius-xs) bg-(--site-bad-soft) text-(--site-bad)",
  variants: {},
  defaultVariants: {},
});

/** A field of a draft still to fill, drawn dashed so a draft is not read as the final text. */
export const siteFieldGapStyle = defineSlotStyle({
  slot: "site-field-gap",
  base:
    "rounded-(--site-radius-xs) border border-dashed border-(--site-ink-faint) bg-(--site-warn-soft) px-1 font-(family-name:--site-font-mono) text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label)",
  variants: {},
  defaultVariants: {},
});

/** Labels and their values, three columns to a row (the label one, the value two); stacked below the narrow tier. */
export const siteKeyValuesStyle = defineSlotStyle({
  slot: "site-key-values",
  base: "m-0 grid min-w-0 grid-cols-3 gap-x-4 gap-y-2 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) @max-page-narrow/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});

/** A label and its value, laid in the grid's own rows. */
export const siteKeyValueStyle = defineSlotStyle({
  slot: "site-key-value",
  base: "contents",
  variants: {},
  defaultVariants: {},
});

/** A label, muted in the strong weight. */
export const siteKeyStyle = defineSlotStyle({
  slot: "site-key",
  base: "font-(--site-fw-strong) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A value, two columns wide. */
export const siteValueStyle = defineSlotStyle({
  slot: "site-value",
  base: "col-span-2 m-0 min-w-0 break-words @max-page-narrow/page:col-span-1",
  variants: {},
  defaultVariants: {},
});

/** A card of facts (business details, support): its heading, its labelled values and an action. */
export const siteInfoCardStyle = defineSlotStyle({
  slot: "site-info-card",
  base: SITE_CARD,
  variants: {},
  defaultVariants: {},
});

/** Cards of facts side by side, one below the narrow tier. */
export const siteInfoGridStyle = defineSlotStyle({
  slot: "site-info-grid",
  base: "grid min-w-0 scroll-mt-4 grid-cols-2 gap-3 @max-page-narrow/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});

/** A fact card's heading. */
export const siteInfoCardTitleStyle = defineSlotStyle({
  slot: "site-info-card-title",
  base: "m-0 text-(length:--site-fs-subheading) leading-(--site-lh-subheading) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});
