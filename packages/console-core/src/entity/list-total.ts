import type { UseCrudListResult } from "@simplix-react/ui";

/** What a list's total is read from: whether its read has answered, and what it answered. */
export type ListTotalSource = Pick<UseCrudListResult<unknown>, "isLoading" | "error" | "isPaused" | "failureCount" | "data" | "pagination">;

/** What a screen knows about a list's read that the list's own state does not say. */
export interface ListTotalOptions {
  /** Whether the list is read at all. Defaults to true; `false` while the screen holds the read back. */
  readonly enabled?: boolean;
}

/**
 * A list's total, or `undefined` while it is not known.
 *
 * <p><b>Zero is a figure, and a list has none to give until its read has answered.</b> The list
 * engine reports `0` while the first page is in flight, while its read is failing and while a
 * stalled or retrying read has not returned, and a badge or a pager drawing that `0` tells the reader
 * the list is empty beside the sentence saying it could not be read. Every place a list's total is
 * drawn (the total badge, the filter bar's count, the pager, a tab's count) reads it here, so all of
 * them draw the unknown mark in the same moments.
 *
 * <p><b>A list that is not read has no total either.</b> A query held back (a reader the rule
 * refuses, a record that has not answered) is idle with no data, which the list engine reports as an
 * empty answered list. The screen that holds the read back says so with `enabled: false`.
 *
 * @param list the list's state
 * @param options whether the list is read at all; `false` where the screen holds the read back
 * @returns the total the server stated, or `undefined` while there is none
 */
export function listTotal(list: ListTotalSource, options: ListTotalOptions = {}): number | undefined {
  if (options.enabled === false) return undefined;
  if (list.isLoading || list.error !== null) return undefined;
  if (list.data.length === 0 && (list.isPaused || list.failureCount > 0)) return undefined;
  return list.pagination.total;
}
