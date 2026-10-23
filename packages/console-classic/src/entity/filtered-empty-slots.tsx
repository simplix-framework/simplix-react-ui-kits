import type { ReactNode } from "react";

import type { EmptyReason } from "@simplix-react/ui";

import { FilteredEmptyState } from "./filtered-empty-state";

interface FilteredEmptySlotsOptions {
  /**
   * Why the list came back empty — the same value handed to the table. A screen that reclassifies
   * its own scope with `scopedEmptyReason` passes the reclassified one, or the slot and the table
   * disagree about what the reader is looking at.
   */
  emptyReason: EmptyReason | null | undefined;
  /** Illustration for the surface this list belongs to. */
  icon?: ReactNode;
  /** How many filters the reader applied — the screen's own scope does not count. */
  filterCount: number;
  /** Drops every filter the reader applied, leaving any scope the screen forces. */
  onClear: () => void;
}

/**
 * The table slots a list needs to explain a filtered-away result — and nothing else.
 *
 * @remarks
 * `ListTable` treats an `empty` slot as a total replacement: supply one and its own empty state,
 * its error card, and its paused card are all skipped. So a slot that answers only the
 * filtered-away case and returns nothing otherwise blanks the table for every other reason — a
 * list with no rows yet draws no empty state, and a failed read draws no error. Returning
 * `undefined` outside that one case is what hands those back to the framework.
 *
 * @returns the slots for a filtered-away list, or `undefined` so the framework answers
 */
export function filteredEmptySlots({
  emptyReason,
  icon,
  filterCount,
  onClear,
}: FilteredEmptySlotsOptions) {
  if (emptyReason !== "no-filter") return undefined;
  return {
    empty: () => (
      <FilteredEmptyState icon={icon} filterCount={filterCount} onClear={onClear} />
    ),
  };
}
