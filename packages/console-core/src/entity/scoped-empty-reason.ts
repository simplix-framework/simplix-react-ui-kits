import type { EmptyReason } from "@simplix-react/ui";

/**
 * Whether a list's filters hold anything the person looking at it actually chose.
 *
 * <p>A screen that opens on a worklist, or a panel that lists one record's children, sets its
 * own filters before the operator touches anything. Those are the screen's scope, not the
 * operator's search — but the list state cannot tell them apart, so an empty result reports
 * itself as "nothing matched your filters" and the screen blames the reader for a filter they
 * never applied. Worse, it offers "clear filters", which would widen the list past the scope
 * the screen is supposed to hold it inside.
 *
 * <p>Compared by value rather than by key: a queue that opens on "waiting" and a queue an
 * operator switched to "answered" narrow by the same key, and only the second is a choice.
 *
 * @param committed the filters currently applied, keyed by `field.operator`
 * @param defaults the filters the screen applied itself — the same record passed as
 *                 `defaultFilters` to the list state
 * @returns whether anything beyond the screen's own scope is narrowing the list
 */
export function hasUserFilters(
  committed: Record<string, unknown>,
  defaults: Record<string, unknown> | undefined,
): boolean {
  return userFilterKeys(committed, defaults).length > 0;
}

/**
 * How many conditions the reader chose, with the screen's own scope left out.
 *
 * <p>What the filtered-away state counts has to be what the reader can undo. Counting the scope
 * in tells somebody who set one condition that two of them matched nothing, and the one they
 * cannot see is the one they would go looking for.
 *
 * @param committed the filters currently applied, keyed by `field.operator`
 * @param defaults the filters the screen applied itself
 * @returns the number of conditions beyond the screen's own scope
 */
export function userFilterCount(
  committed: Record<string, unknown>,
  defaults: Record<string, unknown> | undefined,
): number {
  return userFilterKeys(committed, defaults).length;
}

/**
 * The committed filter keys carrying something other than the screen's own scope.
 *
 * @param committed the filters currently applied, keyed by `field.operator`
 * @param defaults the filters the screen applied itself
 * @returns the keys the reader is responsible for
 */
function userFilterKeys(
  committed: Record<string, unknown>,
  defaults: Record<string, unknown> | undefined,
): string[] {
  return Object.entries(committed)
    .filter(([key, value]) => {
      if (value === undefined || value === "") return false;
      return JSON.stringify(value) !== JSON.stringify(defaults?.[key]);
    })
    .map(([key]) => key);
}

/**
 * Reclassifies an empty list whose only active filters are the screen's own scope.
 *
 * <p>Only the "filters matched nothing" verdict is second-guessed. Errors and stalled queries are
 * answers about the request rather than about the result, and a scope has nothing to say about
 * them; a search term that found nothing is always the reader's own, so it stands as it is.
 *
 * @param reason what the list state concluded
 * @param committed the filters currently applied, keyed by `field.operator`
 * @param defaults the filters the screen applied itself
 * @returns the reason to render, with a screen-scoped emptiness reported as no data
 */
export function scopedEmptyReason(
  reason: EmptyReason | null | undefined,
  committed: Record<string, unknown>,
  defaults: Record<string, unknown> | undefined,
): EmptyReason | null | undefined {
  if (reason !== "no-filter" || hasUserFilters(committed, defaults)) return reason;
  return "no-data";
}
