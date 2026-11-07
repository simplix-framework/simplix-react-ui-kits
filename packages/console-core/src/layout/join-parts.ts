/** What a line of parts separates them with: a middle dot between spaces. */
export const PARTS_SEPARATOR = " · ";

/**
 * The parts that say something, joined into one line with {@link PARTS_SEPARATOR}: a blank, `null`,
 * `undefined` or `false` part is left out, so a missing value never leaves a stray dot behind.
 *
 * @param parts the line's parts in reading order
 */
export function joinParts(...parts: readonly (string | number | null | undefined | false)[]): string {
  return parts
    .filter((part): part is string | number => part !== null && part !== undefined && part !== false && String(part).trim() !== "")
    .map(String)
    .join(PARTS_SEPARATOR);
}
