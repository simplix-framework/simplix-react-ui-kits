/** The operators of one field that bound a window, besides the strip's own `between`. */
export const WINDOW_BOUNDS = { from: ["greaterThanOrEqualTo", "greaterThan"], to: ["lessThanOrEqualTo", "lessThan"] } as const;

/**
 * Every filter key that bounds `field` in time: the strip's `between` and the filter bar's pair.
 *
 * @param field the field a list is read by in time
 */
export function windowKeysOf(field: string): string[] {
  return [`${field}.between`, ...WINDOW_BOUNDS.from.map((op) => `${field}.${op}`), ...WINDOW_BOUNDS.to.map((op) => `${field}.${op}`)];
}
