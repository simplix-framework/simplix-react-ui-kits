import { defineSlotStyle } from "@simplix-react/ui/design";

/** The head of a record panel: the person or thing it is, and what it is to the reader. */
export const recordHeadStyle = defineSlotStyle({
  slot: "console-record-head",
  // A part: the head is a `Flex`, which owns `data-slot`.
  as: "part",
  base: "gap-3 [&_[data-slot=heading]]:truncate [&>[data-slot=console-initials-avatar]]:shrink-0",
  variants: {},
  defaultVariants: {},
});

/** The line under the record's name: its role and where it belongs, in one truncated line. */
export const recordHeadSubtitleStyle = defineSlotStyle({
  slot: "console-record-head-subtitle",
  base: "block truncate pt-0.5 text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The record's key figures under its name: a balance, what is held, the limit. */
export const recordHeadFiguresStyle = defineSlotStyle({
  slot: "console-record-head-figures",
  base: "flex flex-wrap gap-x-6 gap-y-2 pt-2",
  variants: {},
  defaultVariants: {},
});

/** One key figure: its name over its value. */
export const recordHeadFigureStyle = defineSlotStyle({
  slot: "console-record-head-figure",
  base: "flex min-w-0 flex-col",
  variants: {},
  defaultVariants: {},
});

/** A key figure's name. */
export const recordHeadFigureLabelStyle = defineSlotStyle({
  slot: "console-record-head-figure-label",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** A key figure's value, in figures that line up. */
export const recordHeadFigureValueStyle = defineSlotStyle({
  slot: "console-record-head-figure-value",
  base: "flex items-center gap-2 text-sm font-semibold tabular-nums",
  variants: {},
  defaultVariants: {},
});

/**
 * The frame around a sub-list in a detail tab. `compact` is a short list the record carries whole;
 * `full` is the main list table with its search, sort and pager.
 */
export const recordSublistStyle = defineSlotStyle({
  slot: "console-record-sublist",
  base: "",
  variants: {
    kind: {
      // The record's own short list: frameless, a 32px head, 10px rows on rules, hover one surface
      // step and press one more, actions always shown, group rows as small headings, a compact
      // empty state. Text stays on the body's edge; the hover ground reaches 8px past it.
      compact:
        "[&_[data-testid=crud-list]]:gap-0 [&_[data-slot=table-card-frame]]:-mx-2 [&_[data-slot=table-card-frame]]:rounded-none [&_[data-slot=table-card-frame]]:border-0 [&_[data-slot=table-card-frame]]:bg-transparent [&_[data-slot=table-header]]:!bg-transparent [&_[data-slot=table-head]]:!h-8 [&_[data-slot=table-head]]:!bg-transparent [&_th:first-child]:pl-2 [&_td:first-child]:pl-2 [&_th:last-child]:pr-2 [&_td:last-child]:pr-2 [&_[data-slot=table-row]]:cursor-pointer [&_[data-slot=table-row]]:transition-colors [&_[data-slot=table-row]]:duration-[var(--dur-fast)] [&_[data-slot=table-row]:hover]:bg-[var(--surface-2)] [&_[data-slot=table-row]:active]:bg-[var(--surface-3)] [&_[data-slot=table-cell]]:!h-auto [&_[data-slot=table-cell]]:py-2.5 [&_[data-slot=row-actions-strip]]:opacity-100 [&_[data-part=crud-list-group-row]]:cursor-default [&_[data-part=crud-list-group-row]:hover]:bg-transparent [&_[data-part=crud-list-group-row]:active]:bg-transparent [&_[data-part=crud-list-group-cell]]:!h-7 [&_[data-part=crud-list-group-cell]]:bg-transparent [&_[data-part=crud-list-group-cell]]:pt-3 [&_[data-part=crud-list-group-cell]]:pb-1 [&_[data-part=crud-list-empty]]:py-8 [&_[data-part=crud-list-empty]]:gap-1.5 [&_[data-slot=crud-list-view]]:p-0 [&_[data-slot=crud-list-view]>[data-slot=stack]]:gap-0 [&_[data-slot=crud-card]]:rounded-none [&_[data-slot=crud-card]]:border-0 [&_[data-slot=crud-card]]:border-b [&_[data-slot=crud-card]]:shadow-none [&_[data-slot=crud-card]:last-child]:border-b-0",
      // The main list table as on a list page: one card holding the toolbar, the table and the pager.
      full:
        "[&>[data-slot=console-record-list]]:overflow-clip [&>[data-slot=console-record-list]]:rounded-lg [&>[data-slot=console-record-list]]:border [&>[data-slot=console-record-list]]:bg-card [&_[data-testid=crud-list]]:gap-0 [&_[data-slot=table-card-frame]]:rounded-none [&_[data-slot=table-card-frame]]:border-0 [&_[data-slot=table-card-frame]]:border-t [&_[data-part=crud-list-toolbar]]:px-3 [&_[data-part=crud-list-toolbar]]:py-2",
    },
  },
  defaultVariants: { kind: "compact" },
});
