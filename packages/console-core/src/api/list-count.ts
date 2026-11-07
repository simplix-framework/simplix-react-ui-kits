import { bootPage } from "@simplix-react-ext/simplix-boot-utils";

import { RECORD_READ_META } from "../entity/record-read-meta";

/** How a count is read: whether at all, and how often it is read again while the screen is open. */
export interface ListCountOptions {
  /** Whether to read at all, such as whether the reader's rule admits the read. Defaults to true. */
  readonly enabled?: boolean;
  /** Reads the count again every so many milliseconds, for a figure that follows the minute. */
  readonly refetchInterval?: number | false;
}

/** A generated list read: called with its request and query options, answering a page of rows. */
export type ListCountHook<P> = (
  params: P,
  options: { readonly query: { readonly enabled: boolean; readonly refetchInterval?: number | false; readonly meta: typeof RECORD_READ_META } },
) => { readonly data?: unknown; readonly isError?: boolean };

/** What a count read answered: the total, and whether the read itself failed. */
export interface ListCountRead {
  /** The total, or `undefined` where nobody counted. */
  readonly count: number | undefined;
  /** Whether the read was asked for and failed, so a screen can say the figure is unread instead of drawing no notice. */
  readonly unread: boolean;
}

/** The request of a count: the list's own with its first page of one row, so the answer carries the total. */
const COUNT_PAGE = { page: 0, size: 1 } as const;

/**
 * How many rows a list read would answer, taken from the total of a one-row page, and whether the
 * read failed.
 *
 * <p>Absent rather than zero while the read has not answered, when it failed, and when the screen
 * does not ask (`enabled` false): a figure reading 0 claims somebody counted and found none.
 *
 * <p>The read carries {@link RECORD_READ_META}: a count has a place of its own to say it failed (an
 * absent figure, and the page's unread notice built from `unread`), so the console's error dialog
 * leaves it alone instead of landing over a page that already tells the reader.
 *
 * @param hook the generated list hook (`useList<Entities>`)
 * @param params the conditions to count under, without paging
 * @param options whether to read at all (`true` or `false` alone says only that), and how often to
 *   read again ({@link ListCountOptions})
 * @returns the total and whether the read failed
 */
export function useListCountRead<P extends object>(hook: ListCountHook<P>, params: P, options: boolean | ListCountOptions = true): ListCountRead {
  const { enabled = true, refetchInterval } = typeof options === "boolean" ? { enabled: options } : options;
  const query = hook({ ...params, ...COUNT_PAGE }, { query: refetchInterval === undefined ? { enabled, meta: RECORD_READ_META } : { enabled, refetchInterval, meta: RECORD_READ_META } });
  const unread = enabled && query.isError === true;
  if (!enabled || query.isError || query.data === undefined) return { count: undefined, unread };
  return { count: bootPage<unknown>(query.data).totalElements, unread };
}

/**
 * How many rows a list read would answer: the total of {@link useListCountRead}, for a figure that
 * has no use for the failure.
 *
 * @param hook the generated list hook (`useList<Entities>`)
 * @param params the conditions to count under, without paging
 * @param options whether to read at all, and how often to read again
 * @returns the total, or `undefined` where nobody counted
 */
export function useListCount<P extends object>(hook: ListCountHook<P>, params: P, options: boolean | ListCountOptions = true): number | undefined {
  return useListCountRead(hook, params, options).count;
}
