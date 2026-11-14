import { type CSSProperties, useMemo, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { ArrowRightIcon, GripVerticalIcon } from "lucide-react";
import { DigitRoll } from "@simplix-react/ui/interaction";
import { Flex, Grid, MenuLink, StatCard, Text, cn } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";
import { useLocale } from "@simplix-react/i18n/react";

import { ABSENT, TREND_ARROW, pressTile, shownTone, tileFigure, toneTextClassOf, verdictOf } from "./settings-tiles-figure";
import { FitFigure } from "./fit-figure";
import { NumericText } from "./numeric-text";
import type { SettingsTile, TileFilters } from "./settings-tiles-types";
import { type TileColumns, useTileColumns } from "./tile-columns";
import { groupedNumber } from "../entity/grouped-number";
import { joinParts } from "./join-parts";
import { pressedTileKeys } from "../entity/tile-filter";
import {
  tileBasisStyle,
  tileChipFigureStyle,
  tileChipStyle,
  tileChipsStyle,
  tileGoStyle,
  tileGripStyle,
  tileLinkStyle,
  tilePressStyle,
  tileStripDividerStyle,
  tileStripDotStyle,
  tileStripStyle,
  tileStyle,
  tileTrendStyle,
} from "./settings-tiles.style";
import { useReflowFlip } from "./use-reflow-flip";
import { useTileOrder } from "./tile-order";

/**
 * Every figure as a chip, for a folded row.
 *
 * <p>A chip does what its card does and never unfolds the row: the handle at the right is the one
 * control for that. A figure that narrows the list narrows it, with the pressed state shown; a
 * figure that leads to a list leads there; a figure that is only a figure stays only a figure.
 *
 * <p>Each chip carries its position as `--i`, so a design can stagger their arrival.
 *
 * @param props the figures, whether the chips are reachable, and the list's filter state
 * @returns the chips
 */
export function TileChips({
  tiles,
  active,
  filters,
}: {
  readonly tiles: readonly SettingsTile[];
  readonly active: boolean;
  readonly filters?: TileFilters;
}) {
  const locale = useLocale();
  const pressedKeys = pressedTileKeys(tiles, filters?.committedValues ?? {});
  return (
    <div className="flex items-center overflow-x-auto" {...slotAttributes(tileChipsStyle, {})}>
      {tiles.map((tile, index) => {
        const content = (
          <>
            <span>{tile.label}</span>
            <NumericText
              weight="semibold"
              className={toneTextClassOf(tile)}
              {...partAttributes(tileChipFigureStyle, { tone: shownTone(tile) ?? "none" })}
            >
              {tileFigure(tile, locale)}
            </NumericText>
          </>
        );
        const pressable = Boolean((tile.filter && filters) || tile.href);
        const common = {
          className: "inline-flex shrink-0 items-center",
          style: { "--i": index } as CSSProperties,
          ...slotAttributes(tileChipStyle, { pressable, pressed: Boolean(tile.filter && filters) && pressedKeys.has(tile.key) }),
        };
        if (tile.filter && filters) {
          return (
            <button
              key={tile.key}
              type="button"
              tabIndex={active ? 0 : -1}
              aria-pressed={pressedKeys.has(tile.key)}
              onClick={() => pressTile(tile, tiles, filters)}
              {...common}
            >
              {content}
            </button>
          );
        }
        if (tile.href) {
          return (
            // `contents` keeps the wrapper out of the layout; it carries the stagger position and
            // takes the link out of the keyboard's path while the row is unfolded.
            <span key={tile.key} className="contents" style={common.style} inert={!active}>
              <MenuLink href={tile.href} className={common.className} attributes={slotAttributes(tileChipStyle, { pressable }) as Record<string, string>}>
                {content}
              </MenuLink>
            </span>
          );
        }
        return (
          <span key={tile.key} {...common}>
            {content}
          </span>
        );
      })}
    </div>
  );
}

/**
 * The folded row: one figure at a time, turning over like a news ticker.
 *
 * @param props the figures, which one is showing, and what pressing the line does
 * @returns the strip
 */
export function TileStrip({
  tiles,
  showing,
  label,
  onPress,
  onHold,
}: {
  readonly tiles: readonly SettingsTile[];
  readonly showing: number;
  readonly label: string;
  readonly onPress: () => void;
  readonly onHold: (held: boolean) => void;
}) {
  const locale = useLocale();
  const tile = tiles[showing] as SettingsTile;
  const trendLine = tile.trend
    ? `${TREND_ARROW[tile.trend.direction]} ${tile.trend.text}`
    : undefined;

  return (
    // Out of the keyboard's path on purpose: the handle at the right is the control, and this is
    // the same action given a target the width of the page for whoever is holding a mouse. Two tab
    // stops for one action is what `tabIndex={-1}` avoids.
    //
    // Flush against the rule with no top edge of its own - the rule is its top edge, and the shadow
    // across it is what puts the strip behind it. `pe-16` is the room the handle lies in.
    <button
      type="button"
      tabIndex={-1}
      onClick={onPress}
      onMouseEnter={() => onHold(true)}
      onMouseLeave={() => onHold(false)}
      aria-label={label}
      className="flex h-8 w-full items-center overflow-hidden"
      {...slotAttributes(tileStripStyle, {})}
    >
      {/* What a reader of the page's structure gets instead of a line that rewrites itself: every
          figure at once, in the order the cards are in. A strip that flips is a convenience for the
          eye and a nuisance to anything reading aloud. */}
      <span className="sr-only">
        {tiles.map((each) => `${each.label} ${tileFigure(each, locale)}`).join(", ")}
      </span>

      {/* Which of them is showing, and how many there are - at the head of the line, where the eye
          starts, rather than stranded at the far end away from the words they are about. Marks
          rather than numbers: the strip is read at a glance and 「3/4」 is a thing to work out. */}
      {tiles.length > 1 && (
        <Flex gap="xs" align="center" aria-hidden className="me-3 shrink-0">
          {tiles.map((each, index) => (
            <span
              key={each.key}
              {...slotAttributes(tileStripDotStyle, { current: index === showing })}
            />
          ))}
        </Flex>
      )}

      {/* One tile, whole. `key` is what makes it a flip: the node is replaced on every turn, so the
          entering line runs its animation from under the strip's own clipped edge. */}
      <Flex
        key={showing}
        aria-hidden
        align="baseline"
        gap="sm"
        className="tile-flip min-w-0 flex-1 flex-nowrap"
      >
        {/* Three things in one line and each has to be told from the others at a glance: the label
            is small and quiet, the figure is the loud one, and the basis sits behind a rule so it
            reads as a footnote rather than as more of the figure. */}
        <Text size="caption" tone="muted" className="shrink-0">
          {tile.label}
        </Text>
        {/* The tint the card carries, put on the figure itself. On the card it is a border and a
            wash; on one line there is no surface to wash, and a coloured dot beside the position
            marks would be two dot vocabularies in nine millimetres. */}
        <NumericText
          size="sm"
          weight="semibold"
          className={cn("shrink-0", toneTextClassOf(tile))}
        >
          {tileFigure(tile, locale)}
        </NumericText>
        {/* The sentence under the figure on the card, kept: it is what says where the number came
            from, and a number without it is the half a reader cannot use. First to be clipped when
            the window is narrow, for the same reason. */}
        {(trendLine || tile.basis) && (
          <>
            <span
              className="h-3 w-px shrink-0 self-center"
              {...slotAttributes(tileStripDividerStyle, {})}
            />
            <Text size="caption" tone="muted" className="min-w-0 truncate">
              {joinParts(trendLine, tile.basis)}
            </Text>
          </>
        )}
      </Flex>
    </button>
  );
}

/**
 * The cards themselves, which is what {@link SettingsTiles} draws when it is not folded.
 *
 * @param props the figures, how many to a row, and a class the fold uses to cascade them in
 * @returns the grid
 */
export function TileGrid({
  tiles,
  columns,
  reorderKey,
  loading,
  filters,
  className,
}: {
  readonly tiles: readonly SettingsTile[];
  readonly columns: TileColumns;
  readonly reorderKey?: string;
  readonly loading: boolean;
  readonly filters?: TileFilters;
  /**
   * Put on the grid itself rather than on a wrapper, so the cascade animation selects the cards as
   * its own children - a selector written two levels up breaks the day anything is put in between.
   */
  readonly className?: string;
}) {
  const keys = useMemo(() => tiles.map((t) => t.key), [tiles]);
  const committed = filters?.committedValues ?? {};
  const locale = useLocale();
  const pressedKeys = pressedTileKeys(tiles, committed);
  const { order, moveTo, step, enabled } = useTileOrder(reorderKey, keys);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const ordered = enabled ? order.map((k) => tiles.find((t) => t.key === k)!).filter(Boolean) : tiles;
  const grid = useRef<HTMLDivElement>(null);
  // As many to a row as fit at the minimum tile width in the page column.
  const { columns: perRow, measured } = useTileColumns(grid, ordered.length, columns);
  // A tile moved to a new place, or a row that wraps when the window narrows, glides there.
  // Keyed by the order's content: a screen that rebuilds its tiles on every render hands a new
  // array each time, and a pass on an unchanged order would glide the cards for an unrelated shift.
  // Held until the column count is measured, so a narrow column does not glide the tiles from the
  // guess made before it was.
  useReflowFlip(grid, "[data-flip-key]", [order.join("\u0000"), measured], measured);
  return (
    <Grid ref={grid} template={`repeat(${perRow}, minmax(0, 1fr))`} gap="md" className={className}>
      {ordered.map((tile) => {
        // The board stacks the value, the movement and the basis in that order, so the comparison takes the card's first line under
        // the value and the basis moves below it. With no comparison the basis keeps that line and
        // nothing moves, which is why nineteen screens that pass no trend look exactly as before.
        const trendLine = tile.trend
          ? `${TREND_ARROW[tile.trend.direction]} ${tile.trend.text}`
          : undefined;
        // A counted number rolls its digits when it changes; a word, a date or an absent figure is
        // drawn as it is. The unit is its own element so a design can set it beside the figure at
        // a smaller size.
        const figure =
          typeof tile.value === "number" ? (
            <DigitRoll value={tile.value} format={(count) => groupedNumber(count, locale)} />
          ) : typeof tile.value === "string" && tile.value !== "" ? (
            // One piece of text (an amount, a percentage) is shrunk to its card rather than broken in its digits.
            <FitFigure>{tile.value}</FitFigure>
          ) : (
            tile.value ?? ABSENT
          );
        const tone = shownTone(tile);
        const card = (
          <StatCard
            title={tile.label}
            value={figure}
            unit={tile.value === undefined ? undefined : tile.unit}
            headerExtra={
              enabled ? (
                <span aria-hidden className="flex shrink-0 items-center justify-center" {...slotAttributes(tileGripStyle, {})}>
                  <GripVerticalIcon className="size-3.5" />
                </span>
              ) : undefined
            }
            chart={tile.spark}
            description={
              tile.trend ? (
                <>
                  <span {...partAttributes(tileTrendStyle, { verdict: verdictOf(tone, tile.trend.direction) })}>
                    {trendLine}
                  </span>
                  {tile.basis && <span {...partAttributes(tileBasisStyle, {})}>{tile.basis}</span>}
                </>
              ) : (
                tile.basis
              )
            }
            tone={tone}
            highlighted={tone === "warning" || tone === "danger"}
            loading={loading || Boolean(tile.loading)}
          />
        );
        // The card fills whatever height it is handed, so a tile that is a link needs its anchor
        // to be handed the grid cell's full height rather than shrinking to the text. A tile that
        // is not a link is the card itself, with nothing between it and the tile element.
        return (
          <div
            key={tile.key}
            data-flip-key={tile.key}
            className="group relative h-full"
            {...(enabled
              ? {
                  draggable: true,
                  tabIndex: 0,
                  "aria-roledescription": "sortable",
                  onDragStart: (e: DragEvent) => {
                    setDragging(tile.key);
                    e.dataTransfer.effectAllowed = "move";
                  },
                  onDragOver: (e: DragEvent) => {
                    e.preventDefault();
                    if (over !== tile.key) setOver(tile.key);
                  },
                  onDragLeave: () => setOver((was) => (was === tile.key ? null : was)),
                  onDrop: (e: DragEvent) => {
                    e.preventDefault();
                    if (dragging) moveTo(dragging, tile.key);
                    setDragging(null);
                    setOver(null);
                  },
                  onDragEnd: () => {
                    setDragging(null);
                    setOver(null);
                  },
                  onKeyDown: (e: KeyboardEvent) => {
                    if (!e.altKey) return;
                    if (e.key === "ArrowLeft" || e.key === "ArrowUp") step(tile.key, -1);
                    else if (e.key === "ArrowRight" || e.key === "ArrowDown") step(tile.key, 1);
                    else return;
                    e.preventDefault();
                  },
                }
              : {})}
            {...slotAttributes(tileStyle, {
              emphasis: tile.emphasis === true,
              dragging: enabled && dragging === tile.key,
              drop: enabled && dragging !== null && dragging !== tile.key && over === tile.key,
              pressable: Boolean((tile.filter && filters) || tile.href),
            })}
          >
            {tile.filter && filters ? (
              <button
                type="button"
                aria-pressed={pressedKeys.has(tile.key)}
                onClick={() => pressTile(tile, tiles, filters)}
                className="block h-full w-full"
                {...slotAttributes(tilePressStyle, { pressed: pressedKeys.has(tile.key) })}
              >
                {card}
              </button>
            ) : tile.href ? (
              <MenuLink href={tile.href} className="block h-full" attributes={slotAttributes(tileLinkStyle, {}) as Record<string, string>}>
                {card}
                {/* Where the press goes, shown under the pointer on a tile that leads to a list. */}
                <span aria-hidden className="pointer-events-none absolute bottom-3 end-3" {...slotAttributes(tileGoStyle, {})}>
                  <ArrowRightIcon className="size-4" />
                </span>
              </MenuLink>
            ) : (
              card
            )}
          </div>
        );
      })}
    </Grid>
  );
}
