import { defineSlotStyle } from "@simplix-react/ui/design";

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
