import { bootPage } from "@simplix-react-ext/simplix-boot-utils";

/** How a count is read: whether at all, and how often it is read again while the screen is open. */
export interface ListCountOptions {
  /** Whether to read at all, such as whether the reader's rule admits the read. Defaults to true. */
  readonly enabled?: boolean;
  /** Reads the count again every so many milliseconds, for a figure that follows the minute. */
  readonly refetchInterval?: number | false;
}

/** A generated list read: called with its request and query options, answering a page of rows. */
export type ListCountHook<P> = (params: P, options: { readonly query: { readonly enabled: boolean; readonly refetchInterval?: number | false } }) => { readonly data?: unknown; readonly isError?: boolean };

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
 * @param options whether to read at all (`true` or `false` alone says only that), and how often to
 *   read again ({@link ListCountOptions})
 * @returns the total, or `undefined` where nobody counted
 */
export function useListCount<P extends object>(hook: ListCountHook<P>, params: P, options: boolean | ListCountOptions = true): number | undefined {
  const { enabled = true, refetchInterval } = typeof options === "boolean" ? { enabled: options } : options;
  const query = hook({ ...params, ...COUNT_PAGE }, { query: refetchInterval === undefined ? { enabled } : { enabled, refetchInterval } });
  if (!enabled || query.isError || query.data === undefined) return undefined;
  return bootPage<unknown>(query.data).totalElements;
}
