import type { UseCrudListResult } from "@simplix-react/ui";

/** What a list's total is read from: whether its read has answered, and what it answered. */
export type ListTotalSource = Pick<UseCrudListResult<unknown>, "isLoading" | "error" | "isPaused" | "failureCount" | "data" | "pagination">;

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
 * @param list the list's state
 * @returns the total the server stated, or `undefined` while there is none
 */
export function listTotal(list: ListTotalSource): number | undefined {
  if (list.isLoading || list.error !== null) return undefined;
  if (list.data.length === 0 && (list.isPaused || list.failureCount > 0)) return undefined;
  return list.pagination.total;
}
