import { EMPTY_VALUE_TEXT, type StatusTone } from "@simplix-react/ui";

import type { SettingsTile, TileFilters, TileTrendDirection } from "./settings-tiles-types";
import { type TileFilter, narrowedValues, pressedTileKeys, pressedValues } from "../entity/tile-filter";
import { groupedNumber } from "../entity/grouped-number";
import { toneTextClass } from "./tone-text";

/**
 * The tone a tile is drawn in: a zero counts nothing to act on, and a figure nobody has counted
 * (absent, or still unread) has nothing to warn of, so neither is drawn in a tone.
 */
export function shownTone(tile: SettingsTile): StatusTone | undefined {
  return tile.value === undefined || tile.value === 0 || tile.value === "0" ? undefined : tile.tone;
}

/**
 * The colour a tile's figure takes on a line with no card to tint, in a tone's text grade (a tone's
 * icon colour is too faint for words); none for a toneless tile.
 */
export function toneTextClassOf(tile: SettingsTile): string | undefined {
  const tone = shownTone(tile);
  return tone ? toneTextClass(tone) : undefined;
}

/**
 * What a movement means for a figure: a rising count that is already a warning is worse, the same
 * count falling is better, and a figure in the success tone reads the other way round. A figure with
 * no tone, or one that did not move, is neither.
 */
export function verdictOf(tone: StatusTone | undefined, direction: TileTrendDirection): "worse" | "better" | "neutral" {
  if (direction === "flat") return "neutral";
  if (tone === "warning" || tone === "danger") return direction === "up" ? "worse" : "better";
  if (tone === "success") return direction === "up" ? "better" : "worse";
  return "neutral";
}

/** The arrow each direction is drawn with. */
export const TREND_ARROW: Readonly<Record<TileTrendDirection, string>> = {
  up: "↑",
  flat: "→",
  down: "↓",
};

/** What an absent figure reads as: the framework's placeholder, so no screen invents its own. */
export const ABSENT = EMPTY_VALUE_TEXT;

/**
 * A tile's figure with its unit on it, or the placeholder where nobody counted.
 *
 * <p>Exported because the same figure is drawn twice - on the card, and on the one-line strip the
 * row folds into - and a second copy of this arithmetic is how the strip ends up saying 「2」 where
 * the card says 「2건」.
 *
 * <p>A counted number is grouped in the UI language, as the list's total badge groups its own, so
 * a tile and the badge beside it read 「1,188」 alike. A figure that arrives as text (a rate, a sum
 * the screen already worded) is drawn as it is.
 *
 * @param tile the figure
 * @param locale the UI language
 * @returns what to render
 */
export function tileFigure(tile: SettingsTile, locale: string): string {
  if (tile.value === undefined) return ABSENT;
  const figure = typeof tile.value === "number" ? groupedNumber(tile.value, locale) : tile.value;
  return tile.unit ? `${figure}${tile.unit}` : figure;
}

/**
 * How long one figure holds the folded strip before the next one flips up.
 *
 * <p>Long enough to read a label, a number and the line under it without hurrying, short enough
 * that a row of four comes round inside twenty seconds.
 */
export const FLIP_EVERY_MS = 4500;

/**
 * What pressing a tile does to the list's filter: narrows the list to the tile's rows, or lifts
 * that narrowing when the tile is already pressed. The card and the folded chip share this one
 * answer, so the same figure does the same thing whichever way it is drawn.
 *
 * @param tile the pressed figure, which must carry a filter
 * @param tiles every figure of the row, since a figure's rows may be narrowed by its siblings
 * @param filters the list's filter state
 */
export function pressTile(tile: SettingsTile, tiles: readonly SettingsTile[], filters: TileFilters): void {
  const committed = filters.committedValues ?? {};
  const filter = tile.filter as TileFilter;
  const pressed = pressedTileKeys(tiles, committed).has(tile.key);
  filters.commitValues(pressed ? pressedValues(filter, committed) : narrowedValues(filter, tiles, committed));
}
