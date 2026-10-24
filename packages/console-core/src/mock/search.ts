import { useMemo, useState } from "react";
import type { EntityOption, EntitySearch } from "@simplix-react/ui";

/** How many matches one page of a mock search returns, as a directory's first page would. */
export const MOCK_SEARCH_PAGE = 20;

/**
 * The page of options a search for `query` returns: matches by label, case-insensitively, with the
 * picked value kept at the head so its label survives a search that has moved on.
 */
export function searchOptions(
  options: readonly EntityOption[],
  query: string,
  picked: readonly string[] = [],
): { readonly options: EntityOption[]; readonly hasMore: boolean } {
  const needle = query.trim().toLowerCase();
  const matches = needle ? options.filter((option) => option.label.toLowerCase().includes(needle)) : [...options];
  const head = options.filter((option) => picked.includes(option.value) && !matches.slice(0, MOCK_SEARCH_PAGE).includes(option));
  return { options: [...head, ...matches.slice(0, MOCK_SEARCH_PAGE)], hasMore: matches.length > MOCK_SEARCH_PAGE };
}

/**
 * A record picker's search over sample records, for a mockup screen: the same shape a product's
 * `createEntitySearch` hook returns, answered from the fixture rows instead of a server.
 *
 * @param options every record the picker may choose, as label and value
 * @param picked the values currently chosen, kept at the head of every page
 */
export function useMockSearch(options: readonly EntityOption[], picked: readonly string[] = []): EntitySearch {
  const [query, setQuery] = useState("");
  return useMemo(() => {
    const page = searchOptions(options, query, picked);
    return { options: page.options, loading: false, hasMore: page.hasMore, onSearch: setQuery };
  }, [options, picked, query]);
}
