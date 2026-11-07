import { SearchOperator } from "@simplix-react/ui";

/**
 * The operators a number filter offers, the first being the one it opens on. One list for the
 * filter bar's control and for the keys a link may carry for it, so the two cannot disagree.
 */
export const NUMBER_FILTER_OPERATORS: readonly SearchOperator[] = [
  SearchOperator.EQUALS,
  SearchOperator.GREATER_THAN_OR_EQUAL,
  SearchOperator.LESS_THAN_OR_EQUAL,
];

/** The operators a text filter offers when its declaration names none the filter bar knows. */
export const DEFAULT_TEXT_FILTER_OPERATORS: readonly SearchOperator[] = [SearchOperator.CONTAINS, SearchOperator.EQUALS];

/**
 * The declared operators the filter bar knows, in the order they were declared. A name that is not
 * a {@link SearchOperator} is dropped rather than offered, since the server would answer it with an
 * empty page and no error.
 *
 * @param declared the operators a filter declaration names
 * @returns the known ones, empty when the declaration names none
 */
export function knownFilterOperators(declared: readonly string[] | undefined): SearchOperator[] {
  const known = new Set<string>(Object.values(SearchOperator));
  return (declared ?? []).filter((operator): operator is SearchOperator => known.has(operator));
}

/**
 * The operators a text filter offers: the declared ones the filter bar knows, else contains and
 * equals. The first is the one the control opens on.
 *
 * @param declared the operators the filter declaration names
 */
export function textFilterOperators(declared: readonly string[] | undefined): SearchOperator[] {
  const known = knownFilterOperators(declared);
  return known.length > 0 ? known : [...DEFAULT_TEXT_FILTER_OPERATORS];
}
