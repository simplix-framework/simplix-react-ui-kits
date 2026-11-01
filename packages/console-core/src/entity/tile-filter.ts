import { SearchOperator } from "@simplix-react/ui";

/**
 * How a figure tile narrows the list it stands over: the list filter a press writes, and whether
 * the list stands on it now. Pure, so the tile row and a screen read one rule.
 */

/** The list narrowing a figure tile stands for: one value of one field, written as the chip row's `<field>.in`. */
export interface TileValueFilter {
  readonly field: string;
  readonly value: string;
}

/**
 * A narrowing no chip writes: a set of filter keys and their values, each written as the filter
 * bar writes it (`occurredAt.greaterThanOrEqualTo`, `httpStatus.greaterThanOrEqualTo`), so the
 * filter bar's own badges show what the tile chose and can lift it.
 */
export interface TileValuesFilter {
  readonly values: Readonly<Record<string, string | number>>;
}

/** The list narrowing a figure tile stands for. */
export type TileFilter = TileValueFilter | TileValuesFilter;

/**
 * The filter key a tile's narrowing is written under: the chip row's, so both read one state.
 *
 * @param filter a one-value narrowing
 */
export function tileFilterKey(filter: TileValueFilter): string {
  return `${filter.field}.${SearchOperator.IN}`;
}

/**
 * The filter values a tile's narrowing writes, by filter key.
 *
 * @param filter the tile's narrowing
 */
export function tileFilterValues(filter: TileFilter): Readonly<Record<string, unknown>> {
  return "values" in filter ? filter.values : { [tileFilterKey(filter)]: [filter.value] };
}

/**
 * Whether the list stands narrowed to exactly the tile's rows.
 *
 * @param filter the tile's narrowing
 * @param committed the list's committed filter values
 */
export function isTilePressed(filter: TileFilter, committed: Readonly<Record<string, unknown>>): boolean {
  if ("values" in filter) {
    const keys = Object.keys(filter.values);
    return keys.length > 0 && keys.every((key) => committed[key] !== undefined && String(committed[key]) === String(filter.values[key]));
  }
  const chosen = committed[tileFilterKey(filter)];
  if (Array.isArray(chosen)) return chosen.length === 1 && String(chosen[0]) === filter.value;
  return chosen === filter.value;
}

/**
 * Which tiles stand pressed. A tile whose narrowing another pressed tile's narrowing contains is
 * not pressed itself: pressing 「server errors in the last day」 also satisfies 「errors in the last
 * day」, and only the tile the reader chose is drawn as chosen.
 *
 * @param tiles the row.s tiles
 * @param committed the list's committed filter values
 * @returns the keys of the pressed tiles
 */
export function pressedTileKeys(tiles: readonly { readonly key: string; readonly filter?: TileFilter }[], committed: Readonly<Record<string, unknown>>): Set<string> {
  const matching = tiles.filter((tile) => tile.filter && isTilePressed(tile.filter, committed));
  const keysOf = (tile: (typeof matching)[number]) => Object.keys(tileFilterValues(tile.filter as TileFilter));
  return new Set(
    matching
      .filter((tile) => {
        const own = keysOf(tile);
        return !matching.some((other) => other !== tile && keysOf(other).length > own.length && own.every((key) => keysOf(other).includes(key)));
      })
      .map((tile) => tile.key),
  );
}

/**
 * The value a one-value press writes: the tile's rows, or nothing when the list already stands on them.
 *
 * @param filter the tile's narrowing
 * @param committed the list's committed filter values
 */
export function pressedValue(filter: TileValueFilter, committed: Readonly<Record<string, unknown>>): string[] | undefined {
  return isTilePressed(filter, committed) ? undefined : [filter.value];
}

/**
 * Every filter value a press writes, by key: the tile's narrowing, or each of its keys lifted
 * when the list already stands on it.
 *
 * @param filter the tile's narrowing
 * @param committed the list's committed filter values
 */
export function pressedValues(filter: TileFilter, committed: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const values = tileFilterValues(filter);
  const lift = isTilePressed(filter, committed);
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, lift ? undefined : value]));
}

/**
 * Every filter value a press on an unpressed tile writes: its own narrowing, with the keys only
 * the other tiles write lifted, so moving from 「server errors in the last day」 to 「errors in the
 * last day」 drops the status the first one wrote.
 *
 * @param filter the pressed tile's narrowing
 * @param tiles the row.s tiles
 * @param committed the list's committed filter values
 */
export function narrowedValues(filter: TileFilter, tiles: readonly { readonly filter?: TileFilter }[], committed: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const own = tileFilterValues(filter);
  const lifted: Record<string, unknown> = {};
  for (const tile of tiles) {
    if (!tile.filter) continue;
    for (const key of Object.keys(tileFilterValues(tile.filter))) if (!(key in own) && committed[key] !== undefined) lifted[key] = undefined;
  }
  return { ...lifted, ...own };
}

