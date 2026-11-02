import { defineSlotStyle } from "@simplix-react/ui/design";

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
