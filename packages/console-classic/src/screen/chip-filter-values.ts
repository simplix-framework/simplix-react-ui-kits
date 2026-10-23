import type { CrudListFilters } from "@simplix-react/ui";

/**
 * What a chip row has narrowed to, for whoever consumes the narrowing.
 *
 * <p>A chip row writes an array, and every consumer would otherwise widen it by hand — a consumer
 * that reads it as a scalar gets `undefined` silently, leaving the row lit and nothing narrowed.
 * Reads the committed side, which is the one a query may use.
 *
 * <p>It lives here rather than in a page because eight screens read a chip row the same way, and a
 * reader written twice is two readers whose second copy is drawn from memory of the first. The
 * framework carries the same helper on an unpublished branch; when a published `@simplix-react/ui`
 * exports it, delete this file and import it from there instead.
 *
 * @typeParam T the option value type
 * @param state the filter state the row writes to — `useCrudList().filters` or `useFilterBarState()`
 * @param field the same key the row was given
 * @returns the chosen values, empty when the row narrows nothing
 */
export function chipFilterValues<T extends string | number = string>(
  state: CrudListFilters,
  field: string,
): readonly T[] {
  const value = state.committedValues[field];
  if (Array.isArray(value)) return value as T[];
  // A caller may seed one value through `defaultFilters`, and that is a legitimate starting
  // state rather than a shape to reject.
  if (value === undefined || value === null || value === "") return [];
  return [value as T];
}
