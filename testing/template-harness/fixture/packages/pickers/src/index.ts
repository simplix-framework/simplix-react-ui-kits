import { useMemo, useState } from "react";
import type { CrudListFilters, EntityFacet, EntityOption, EntitySearch } from "@simplix-react/ui";

/**
 * The account directory the fixture's reference fields pick from: a fixed set of accounts searched
 * in memory, so generated forms and filters that name an account have a picker to call.
 */
const DIRECTORY: readonly EntityOption[] = [
  { value: "user-1", label: "Ada Lovelace" },
  { value: "user-2", label: "Alan Turing" },
  { value: "user-3", label: "Grace Hopper" },
];

function matching(query: string): EntityOption[] {
  const needle = query.trim().toLowerCase();
  return DIRECTORY.filter((option) => needle === "" || String(option.label).toLowerCase().includes(needle));
}

/** The account picker a generated form calls for a field naming an account. */
export function useUserAccountSearch(value: string): EntitySearch {
  const [query, setQuery] = useState("");
  const options = useMemo(() => {
    const found = matching(query);
    const picked = DIRECTORY.find((option) => option.value === value);
    return picked && !found.includes(picked) ? [picked, ...found] : found;
  }, [query, value]);
  return { options, loading: false, hasMore: false, onSearch: setQuery };
}

/** The account facet a generated list filter draws for a column holding an account id. */
export function createUserFacet(idField: string): (state: CrudListFilters) => EntityFacet {
  const key = `${idField}.in`;
  return function useUserFacet(state) {
    const [query, setQuery] = useState("");
    const raw = state.values[key];
    const picked = Array.isArray(raw) ? raw.map(String) : typeof raw === "string" && raw !== "" ? raw.split(",") : [];
    const options = useMemo(() => matching(query), [query]);
    const selectedOptions = DIRECTORY.filter((option) => picked.includes(String(option.value)));
    return { options, loading: false, selectedOptions, onSearch: setQuery };
  };
}
