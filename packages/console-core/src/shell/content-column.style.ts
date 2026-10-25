import { defineSlotStyle } from "@simplix-react/ui/design";
/** The scrolling column the page content sits in. */
export const contentColumnStyle = defineSlotStyle({
  slot: "console-content-column",
  // The sides close from 32px to 20px under 900px; the padding transitions so the screen settles into a new width.
  // One frame per surface: a card-form row inside a list frame is a ruled row, and a section, table or
  // empty state inside a detail panel, a section or a list frame draws no second border.
  base: "px-8 pt-6 transition-[padding] duration-[var(--dur-slow)] ease-[var(--ease)] max-[900px]:px-5 max-[900px]:pt-5 [&_[data-slot=console-record-list]_[data-slot=crud-card]]:rounded-none [&_[data-slot=console-record-list]_[data-slot=crud-card]]:border-0 [&_[data-slot=console-record-list]_[data-slot=crud-card]]:border-b [&_[data-slot=console-record-list]_[data-slot=crud-card]]:shadow-none [&_[data-slot=console-record-list]_[data-slot=crud-card]:last-child]:border-b-0 [&_[data-slot=console-record-list]_[data-slot=crud-list-view]]:p-0 [&_[data-slot=console-record-list]_[data-slot=crud-list-view]>[data-slot=stack]]:gap-0 [&_[data-slot=crud-list-detail-detail]_[data-slot=section-shell]]:rounded-none [&_[data-slot=crud-list-detail-detail]_[data-slot=section-shell]]:border-0 [&_[data-slot=section-shell]_[data-slot=table-card-frame]]:rounded-none [&_[data-slot=section-shell]_[data-slot=table-card-frame]]:border-x-0 [&_[data-slot=crud-list-detail-detail]_[data-slot=empty-state]]:border-0 [&_[data-slot=crud-list-detail-detail]_[data-slot=empty-state]]:bg-transparent [&_[data-slot=console-record-list]_[data-slot=empty-state]]:border-0 [&_[data-slot=console-record-list]_[data-slot=empty-state]]:bg-transparent [&_[data-slot=crud-list-detail-detail]_[data-slot=table-card-frame]]:rounded-none [&_[data-slot=crud-list-detail-detail]_[data-slot=table-card-frame]]:border-x-0 [&_[data-slot=crud-list-detail-detail]_[data-slot=console-matrix-frame]]:rounded-none [&_[data-slot=crud-list-detail-detail]_[data-slot=console-matrix-frame]]:border-x-0 [&_[data-slot=crud-list-detail-detail]_[data-slot=console-record-list]]:rounded-none [&_[data-slot=crud-list-detail-detail]_[data-slot=console-record-list]]:border-x-0",
  variants: {},
  defaultVariants: {},
});

/** The measure-capped column, centred in the space beside the menu. */
export const contentColumnBodyStyle = defineSlotStyle({
  slot: "console-content-column-body",
  as: "part",
  base: "mx-auto max-w-[1440px] gap-5",
  variants: {},
  defaultVariants: {},
});
