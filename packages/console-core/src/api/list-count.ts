import { bootPage } from "@simplix-react-ext/simplix-boot-utils";

/** A generated list read: called with its request and query options, answering a page of rows. */
export type ListCountHook<P> = (params: P, options: { readonly query: { readonly enabled: boolean } }) => { readonly data?: unknown; readonly isError?: boolean };

/** The request of a count: the list's own with its first page of one row, so the answer carries the total. */
const COUNT_PAGE = { page: 0, size: 1 } as const;

/**
 * How many rows a list read would answer, taken from the total of a one-row page.
 *
 * <p>Absent rather than zero while the read has not answered, when it failed, and when the screen
 * does not ask (`enabled` false): a figure reading 0 claims somebody counted and found none.
 *
 * @param hook the generated list hook (`useList<Entities>`)
 * @param params the conditions to count under, without paging
 * @param enabled whether to read at all, such as whether the reader's rule admits the read
 * @returns the total, or `undefined` where nobody counted
 */
export function useListCount<P extends object>(hook: ListCountHook<P>, params: P, enabled = true): number | undefined {
  const query = hook({ ...params, ...COUNT_PAGE }, { query: { enabled } });
  if (!enabled || query.isError || query.data === undefined) return undefined;
  return bootPage<unknown>(query.data).totalElements;
}
