import { type CSSProperties, type DragEvent, type KeyboardEvent, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslation } from "@simplix-react/i18n/react";
import {
  cn,
  EMPTY_VALUE_TEXT,
  Flex,
  Grid,
  MenuLink,
  StatCard,
  Text,
  useMediaQuery,
  usePageHeaderState,
  type CrudListFilters,
  type StatusTone,
} from "@simplix-react/ui";
import { DigitRoll } from "@simplix-react/ui/interaction";
import { useReflowFlip } from "./use-reflow-flip";
import { toneTextClass } from "./tone-text";
import { ArrowRightIcon, ChevronDownIcon, GripVerticalIcon } from "lucide-react";

import { PACKAGE_NAMESPACE } from "./locales";
import {
  tileGoStyle,
  tileLinkStyle,
  tileGripStyle,
  tileGutterStyle,
  tileHandleChevronStyle,
  tileHandleLabelStyle,
  tileChipFigureStyle,
  tileChipStyle,
  tileChipsStyle,
  tileHandleStyle,
  tileHeadStyle,
  tileReachStyle,
  tileRowStyle,
  tileStripDividerStyle,
  tileStripDotStyle,
  tileStripInsetStyle,
  tileBasisStyle,
  tileStripChipsStyle,
  tileStripStyle,
  tileStyle,
  tileTickerStyle,
  tileTrendStyle,
  tileTitleStyle,
  tilePressStyle,
} from "./settings-tiles.style";
import { joinParts } from "./join-parts";
import { NumericText } from "./numeric-text";
import { MAX_TILE_COLUMNS, useTileColumns, type TileColumns } from "./tile-columns";
import { useTileOrder } from "./tile-order";
import { useTilesCollapse } from "./tiles-collapse";
import { groupedNumber } from "../entity/grouped-number";
import { narrowedValues, pressedTileKeys, pressedValues, type TileFilter } from "../entity/tile-filter";
import { PHONE_WINDOW, REDUCED_MOTION } from "./window-size";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

/** Which way a figure has moved since the moment the comparison names. */
export type TileTrendDirection = "up" | "flat" | "down";

/**
 * How a figure has moved, and against what.
 *
 * <p><b>The direction is not the verdict.</b> 기한 임박 의무 rising is bad and 교육 이수율 rising
 * is good, so the arrow says which way the number went and {@link SettingsTile.tone} says whether
 * that is something to act on. The framework's own `trend` prop cannot carry this — it renders the
 * number as a percentage and paints anything non-negative green, which would tell an operator that
 * two more overdue duties is good news.
 *
 * <p><b>Only a figure with a series behind it has one.</b> A count of what is true right now
 * (「작업중지 1건」) has nothing to compare against, and an invented comparison is worse than none.
 */
export interface TileTrend {
  /** Which way the figure moved. Drawn as an arrow, which is what separates the three without colour. */
  readonly direction: TileTrendDirection;
  /** The comparison in the figure's own unit — 「어제보다 2건」 · 「지난달 87%」. */
  readonly text: string;
}

/**
 * The tone a tile is drawn in: a zero counts nothing to act on, and a figure nobody has counted
 * (absent, or still unread) has nothing to warn of, so neither is drawn in a tone.
 */
function shownTone(tile: SettingsTile): StatusTone | undefined {
  return tile.value === undefined || tile.value === 0 || tile.value === "0" ? undefined : tile.tone;
}

/**
 * The colour a tile's figure takes on a line with no card to tint, in a tone's text grade (a tone's
 * icon colour is too faint for words); none for a toneless tile.
 */
function toneTextClassOf(tile: SettingsTile): string | undefined {
  const tone = shownTone(tile);
  return tone ? toneTextClass(tone) : undefined;
}

/**
 * What a movement means for a figure: a rising count that is already a warning is worse, the same
 * count falling is better, and a figure in the success tone reads the other way round. A figure with
 * no tone, or one that did not move, is neither.
 */
function verdictOf(tone: StatusTone | undefined, direction: TileTrendDirection): "worse" | "better" | "neutral" {
  if (direction === "flat") return "neutral";
  if (tone === "warning" || tone === "danger") return direction === "up" ? "worse" : "better";
  if (tone === "success") return direction === "up" ? "better" : "worse";
  return "neutral";
}

/** Keeps a tile figure's unit (「크레딧」, "credits") in one piece where the figure itself breaks anywhere. */
const TILE_UNIT_UNBREAKABLE = "[&_[data-slot=stat-card-unit]]:whitespace-nowrap";

/** The arrow each direction is drawn with. */
const TREND_ARROW: Readonly<Record<TileTrendDirection, string>> = {
  up: "↑",
  flat: "→",
  down: "↓",
};

/** What every tile carries, whichever of the two kinds it is. */
interface SettingsTileShape {
  /** Stable key, unique within the row. */
  readonly key: string;
  /** What the figure is called. */
  readonly label: string;
  /**
   * The figure itself, or `undefined` when nothing in this installation counts it.
   *
   * <p><b>Absent is not zero.</b> A safety figure of 0 is a claim that somebody counted and found
   * none; a tile whose source does not exist has had nobody count at all. The two read the same on
   * screen unless the absent one is drawn as absent, so this renders an em-dash and leaves the
   * explanation to {@link SettingsTile.basis}.
   */
  readonly value: string | number | undefined;
  /**
   * Whether this figure is being read again right now, drawn as the card's loading state in place
   * of its number. A figure that follows the list's filters is read again whenever they change, and
   * the figures beside it that do not follow them keep what they show.
   */
  readonly loading?: boolean;
  /** Appended to the value — 개 · 명 · 일 · %. */
  readonly unit?: string;
  /**
   * The one line under the figure saying what it was read from.
   *
   * <p><b>Whether it survives an absent figure is decided by which of two things it is</b>, and the
   * screen decides it because the string is opaque here. A basis that DECOMPOSES the figure —
   * 「성공 1,322」, 「증분 48회」, 「969 / 1,150명」 — is untrue the moment nothing counted, so it is
   * held back with the figure: `census.x === undefined ? undefined : t(…)`. A basis that STATES
   * WHAT THE FIGURE IS COUNTED OVER — 「타임아웃 제외」, 「최근 30일」, 「법정 시간에 세지 않습니다」
   * — is true of an installation that has counted nothing, and over an em-dash it is the one line
   * saying what the missing figure would have been a figure of. Those are passed ungated.
   *
   * <p>The test is one question: <b>read it with the figure replaced by an em-dash — is the
   * sentence still true?</b>
   */
  readonly basis?: string;
  /** Set only where the figure has crossed a threshold the reader must act on. */
  readonly tone?: StatusTone;
  /**
   * Whether the data marks this figure as important.
   *
   * <p>Drawn as `data-emphasis="true"` on the tile element; what a design does with it is the
   * design's own. Unlike {@link SettingsTile.tone} it says nothing about a threshold being crossed.
   */
  readonly emphasis?: boolean;
  /**
   * How the figure has moved since the comparison it names.
   *
   * <p>Drawn directly under the value, which is where the board puts it — the comparison belongs to
   * the number, and {@link SettingsTile.basis} is the footnote under both.
   */
  readonly trend?: TileTrend;
  /**
   * The shape behind the figure, in the region the card reserves beside the value.
   *
   * <p><b>The shape, not a chart</b> — no axis, no gridlines, no labels; the number above it is
   * what is read and this says whether that number is where it has been heading. Drawn with
   * {@link TileSpark}, which holds the board's two shapes so this row never becomes a second place
   * where plotting is invented; it is a slot rather than a shape name because what a screen has to
   * supply is the series, and only the screen knows where its own series comes from.
   *
   * <p><b>Set it only where a series exists.</b> P-24: 「시계열이 없는 값(지금 참인 것의 개수)에는
   * 넣지 않는다 — 없는 추세를 지어내는 셈이 된다」. A shape derived from the figure alone is a
   * trend nobody measured, drawn at the one place on the screen that is read as measurement.
   */
  readonly spark?: ReactNode;
}

/**
 * One figure a settings screen puts above its form, split on the one question the figure cannot
 * answer for itself: **was it counted from a list this reader can open?**
 *
 * <p>「타일은 누르면 그 값을 만든 목록으로 간다」 is the board's rule, and the reason it gives is
 * 「셀 수 있는 값이 어디서 나왔는지 보지 못하면 사람은 그 수를 믿지 않는다」 — a figure with no
 * list behind it is not a link, and a tile that looks pressable and goes nowhere teaches the
 * reader to stop trying the others. Written as an optional `href` beside a sentence saying when to
 * pass it, that rule was kept by one tile in the console and broken by every other one.
 *
 * <p><b>So the question is the type's, and every tile answers it.</b> A count of rows says
 * {@link CountedSettingsTile.counted} and then has to say where the rows are; a rate, a duration, a
 * date or a word says the opposite and is asked nothing further, because there is nothing to ask.
 *
 * <p><b>Nothing about the figure decides this, which is why the author does.</b> Two tiles can
 * carry the same counter word and be different kinds: 「휴일 12일」 counts rows in the holiday list
 * and 「남은 열람권 12일」 counts nothing at all. A scan that read the counter word would have got
 * both wrong, in opposite directions.
 */
export type SettingsTile = CountedSettingsTile | UnbuiltListSettingsTile | ComputedSettingsTile | FilterSettingsTile;

/**
 * A tile whose figure is a count of rows, with the list those rows are in.
 *
 * <p>This is the shape the board's rule describes, and the one a counted tile reaches for whenever
 * the screen it would open exists. Where it does not, {@link UnbuiltListSettingsTile} is the other
 * half of the same claim — and there is no third shape, so a count is never drawn with the
 * question left unanswered.
 */
export interface CountedSettingsTile extends SettingsTileShape {
  /** The figure is a count of rows. */
  readonly counted: true;
  /** Where pressing the tile goes — the list the rows are in. */
  readonly href: string;
  /** Never — the list is right there in `href`. */
  readonly listUnbuilt?: never;
  /** Never: only a tile over the list under it narrows that list. */
  readonly filter?: never;
}

/**
 * A tile whose figure is a count of rows that has no address to send a reader to yet.
 *
 * <p><b>What is missing is usually the address, not the screen.</b> Most of these figures count a
 * subset of the very list underneath them, and that list is on the screen — what does not exist is
 * a URL that opens it narrowed to those rows. A screen whose tab and filters live in component
 * state has nowhere for a tile to point, so the destination arrives when the narrowing becomes
 * addressable, and the tile becomes a {@link CountedSettingsTile} in that change.
 *
 * <p><b>It draws nothing, deliberately.</b> The clock that marks an unbuilt tab or an unbuilt
 * action marks a control the reader can see and cannot use; a tile with no destination has no
 * affordance to mark, so the clock would be announcing an absence nobody perceived — a message to
 * developers, printed on an operator's screen. Worse, a visible penalty on the honest answer is a
 * reason to write the dishonest one: an author who does not want a clock on their row writes
 * `counted: false` over a real count, and the mark meant to protect the contract has broken it.
 *
 * <p><b>Where the count belongs instead is a document</b> — how many figures a reader cannot get
 * behind is the sort of number a person acts on, and it is one `grep` away rather than on
 * sixty screens.
 */
export interface UnbuiltListSettingsTile extends SettingsTileShape {
  /** The figure is a count of rows. */
  readonly counted: true;
  /** Never — that is what makes this the other shape. */
  readonly href?: never;
  /** No address opens the list these rows are in — yet. */
  readonly listUnbuilt: true;
  /** Never: only a tile over the list under it narrows that list. */
  readonly filter?: never;
}

/**
 * A tile whose figure counts rows of the list right under it, and which narrows that list to them.
 *
 * <p>The list is on the screen, so the tile needs no address: pressing it writes the list filter
 * its rows are found by (the chip row's `<field>.in`, or the keys the filter bar writes), and
 * pressing it again lifts it. Drawn pressed while the list stands on it. The page hands the row the
 * list's filter state (`PageSpec.tilesFilters`); without it the tile is drawn as a figure only.
 */
export interface FilterSettingsTile extends SettingsTileShape {
  /** The figure is a count of rows. */
  readonly counted: true;
  /** The rows the figure counts, as the list's filter finds them. */
  readonly filter: TileFilter;
  /** Never: the list is the one under the tile. */
  readonly href?: never;
  readonly listUnbuilt?: never;
}

/**
 * A tile whose figure was computed rather than counted — a rate, a duration, a date, a version, a
 * word for a state.
 *
 * <p>It carries no destination because there is no list of rows it was read from. A duration is
 * arithmetic on two instants and a rate is a division; neither has rows to open.
 */
export interface ComputedSettingsTile extends SettingsTileShape {
  /** The figure was computed rather than counted, so nothing is owed. */
  readonly counted: false;
  /** Never — a computed figure has no list, and a tile that leads nowhere must not look pressable. */
  readonly href?: never;
  /** Never — there is no list to be unbuilt. */
  readonly listUnbuilt?: never;
  /** Never: only a tile over the list under it narrows that list. */
  readonly filter?: never;
}

/** What an absent figure reads as: the framework's placeholder, so no screen invents its own. */
const ABSENT = EMPTY_VALUE_TEXT;

/**
 * A tile's figure with its unit on it, or the placeholder where nobody counted.
 *
 * <p>Exported because the same figure is drawn twice — on the card, and on the one-line strip the
 * row folds into — and a second copy of this arithmetic is how the strip ends up saying 「2」 where
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
const FLIP_EVERY_MS = 4500;

/**
 * The row of figures a screen opens with, and the strip it folds into (P-24).
 *
 * <p><b>Only what has crossed a threshold is tinted.</b> A row where every tile is coloured has no
 * warning in it, so a tile stays plain unless its own reading calls for the tone.
 *
 * <p>Four to a row, matching the board and the dashboard's own tile grid, so the console has one
 * figure row rather than one per screen.
 *
 * <p><b>The row folds, and folding is the default rather than something a screen opts into.</b>
 * Every screen in this console opens with these, and on every one of them they take the top of the
 * page whether or not the reader wants them today. Making it a separate component to reach for
 * meant thirty-odd screens that would go on not reaching for it, and every screen written after
 * this would have to remember to. So the behaviour is here, and a screen gets it by drawing the
 * row it was always drawing.
 *
 * <p><b>The rule under the page title is what it folds behind, and it only folds where something
 * is actually above it to fold behind.</b> Folded, the tiles slide up under the rule and one strip
 * is left hanging off it with the rule's shadow across it — which is what says the row went
 * somewhere rather than that it was deleted. Two things have to hold for that geometry to mean
 * anything: the header has to have drawn a rule, and nothing but the way back may stand between
 * that rule and this row. A back link is allowed above it and the row folds up under the link
 * instead — the same fold one step lower — because a back link cannot go in the header, where
 * `headerHoldsNoWayToAnotherScreen` refuses a trip out of the screen. A second row further down the
 * page, the dashboard's tile rows under their section headings, a row inside a panel or a demo —
 * each is asked the same question and each answers no, so each draws the plain grid it drew before.
 * Nothing opts out by hand and nothing has to remember to opt in.
 *
 * <p><b>The strip shows ONE figure whole, not four in pieces.</b> Four labels and four numbers
 * squeezed onto one line is a line nobody reads: every figure loses the sentence under it that says
 * what it was counted from, which is the half that makes a number mean anything. So the strip
 * carries one tile complete — label, figure, basis — and flips to the next every few seconds the
 * way a news ticker does. Pointing at it holds it still, and a reader who has asked for less
 * movement gets the first figure and no flipping at all.
 *
 * <p><b>The choice is the console's, not this screen's.</b> Folding here folds every screen the
 * operator opens afterwards, and it outlives the visit — the row is not a per-screen opinion but a
 * way of working. See {@link useTilesCollapse}.
 */
interface SettingsTilesProps {
  /** The figures, in the order the board draws them. */
  readonly tiles: readonly SettingsTile[];
  /**
   * The most tiles to a row, five unless a screen caps it lower.
   *
   * <p>A row holds as many tiles as fit at the minimum tile width (`--tile-min-width`) in the page
   * column, up to this cap; a screen with fewer figures needs no cap, as
   * its tiles take the row between them.
   */
  readonly columns?: TileColumns;
  /**
   * Lets the reader put the tiles in their own order, kept in this browser under this key.
   *
   * <p>Drag a tile onto another, or focus it and press Alt with an arrow key. Absent, the row keeps
   * the board's order and draws exactly as before.
   */
  readonly reorderKey?: string;
  /**
   * What the row is about, drawn as a heading over it.
   *
   * <p>Titled, the row carries its own head: the heading, the folded strip and the fold control
   * stand on one line above the tiles, wherever the row is on the page. Untitled, the row folds up
   * under the header's rule as before.
   */
  readonly title?: string;
  /** Whether the figures are still being read; every tile draws a placeholder for its figure. */
  readonly loading?: boolean;
  /**
   * Starts the row folded whatever the console's choice is, as while a record stands open beside
   * the list and the panel needs the height. Unfolding it then lasts until the record closes and
   * does not change the console's choice.
   */
  readonly folded?: boolean;
  /** The list's filter state a {@link FilterSettingsTile} narrows: the one its chip row reads. */
  readonly filters?: TileFilters;
  /**
   * Whether the row folds. False draws the tiles always open, with no fold control and no strip, and
   * leaves the console's fold choice alone: a page whose figures are the point of the page (a
   * dashboard) keeps them in view. Defaults to true.
   */
  readonly collapsible?: boolean;
}

/** The part of a list's filter state the tiles read and write. */
export type TileFilters = Pick<CrudListFilters, "committedValues" | "commitValues">;

export function SettingsTiles({ tiles, columns = MAX_TILE_COLUMNS, reorderKey, title, loading = false, folded = false, filters, collapsible = true }: SettingsTilesProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/tiles");
  const shared = useTilesCollapse();
  const [unfolded, setUnfolded] = useState(false);
  useEffect(() => setUnfolded(false), [folded]);
  const collapsed = folded ? !unfolded : shared.collapsed;
  const toggle = folded ? () => setUnfolded((was) => !was) : shared.toggle;
  const header = usePageHeaderState();
  const onAPhone = useMediaQuery(PHONE_WINDOW);
  const stillness = useMediaQuery(REDUCED_MOTION);
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const [leads, setLeads] = useState<"rule" | "lead" | "content">("rule");

  // What this row folds up behind. Measured from the DOM because it cannot be known any other way:
  // a screen puts a load-failure panel above its figures on the one render where the read failed
  // and nowhere else, and a component cannot be told by its props what its own siblings are.
  // Before paint, so the row never lands in the wrong place and jumps.
  //
  // Three answers, and a `data-page-lead` sibling is the middle one. A back link is the one thing
  // that legitimately stands above the figures — it cannot go in the header, where
  // `headerHoldsNoWayToAnotherScreen` refuses a trip out of the screen — so the row folds up under
  // it instead of under the header's rule, which is the same fold one step lower down.
  useLayoutEffect(() => {
    const previous = anchor.current?.previousElementSibling ?? null;
    if (anchor.current) {
      setLeads(previous === null ? "rule" : previous.hasAttribute("data-page-lead") ? "lead" : "content");
    }
  });

  // Whether a rule is actually drawn above this row. `ConsolePageHeader` draws the title band on a
  // wide window and, on a phone, only the action row — and it draws nothing at all when the screen
  // registered no actions there. Folding against a rule that is not on the screen would lift the
  // row 32px into whatever is above it.
  const underARule = Boolean(onAPhone ? header.actions : header.title);
  const folding = collapsible && underARule && leads !== "content";
  // A titled row folds into chips in its own head and has no strip to turn.
  const turningFolded = !title && folding && collapsed;

  // How far up the row has to reach to sit against whatever is above it, and the same distance paid
  // back so the tiles stand exactly where they stood. Under the header it is two gaps: the
  // header's own bottom margin AND the page column's `gap="md"`, which add in a flex column. Under
  // a back link it is the one gap between two siblings. Both are the design's, since the header's
  // margin is (`tileReachStyle`, `tileRowStyle`).
  const reachFrom: "rule" | "lead" = leads === "rule" ? "rule" : "lead";

  // Nothing turns while the row is open, while a pointer is on the strip, or where there is only
  // one figure to show — a lone tile flipping to itself is movement that says nothing.
  const turning = turningFolded && !held && !stillness && tiles.length > 1;

  useEffect(() => {
    if (!turning) return;
    const timer = setInterval(() => setAt((was) => was + 1), FLIP_EVERY_MS);
    return () => clearInterval(timer);
  }, [turning]);

  if (tiles.length === 0) return null;

  // Modulo at the point of use rather than in the setter: the count changes when a screen's figures
  // arrive, and an index wrapped against the old count would land on a different tile than the one
  // that was about to be shown.
  const showing = at % tiles.length;

  // A row that does not fold draws its heading, when it has one, over the tiles with no control.
  if (title && !collapsible) {
    return (
      <section ref={anchor} aria-label={title}>
        <div className="flex items-center" {...slotAttributes(tileHeadStyle, { folded: false })}>
          <h2 className="shrink-0" {...slotAttributes(tileTitleStyle, {})}>
            {title}
          </h2>
        </div>
        <div {...slotAttributes(tileRowStyle, {})}>
          <TileGrid tiles={tiles} columns={columns} reorderKey={reorderKey} loading={loading} filters={filters} />
        </div>
      </section>
    );
  }

  if (title) {
    return (
      <section ref={anchor} aria-label={title}>
        {/* The head: the heading, the folded strip in the room between it and the control, and the
            control at the right. */}
        <div className="flex items-center" {...slotAttributes(tileHeadStyle, { folded: collapsed })}>
          <h2 className="shrink-0" {...slotAttributes(tileTitleStyle, {})}>
            {title}
          </h2>
          <div className="min-w-0 flex-1">
            <div className="tiles-fold" data-open={collapsed ? "true" : "false"} aria-hidden={!collapsed} inert={!collapsed}>
              {/* Folded, every figure as a chip that does what its card does. The fold clips its
                  child, so the chips sit in a wrapper of their own. */}
              <div>
                <TileChips tiles={tiles} active={collapsed} filters={filters} />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? t("expand") : t("collapse")}
            className="group flex shrink-0 items-center"
            {...slotAttributes(tileHandleStyle, { placement: "head" })}
          >
            <ChevronDownIcon
              className="size-3.5"
              aria-hidden
              {...slotAttributes(tileHandleChevronStyle, { folded: collapsed })}
            />
            <span aria-hidden {...slotAttributes(tileHandleLabelStyle, { placement: "head" })}>
              {collapsed ? t("expand") : t("collapse")}
            </span>
          </button>
        </div>
        <div className="tiles-fold" data-open={collapsed ? "false" : "true"} aria-hidden={collapsed} inert={collapsed}>
          <div {...slotAttributes(tileGutterStyle, {})}>
            <div {...slotAttributes(tileRowStyle, {})}>
              <TileGrid tiles={tiles} columns={columns} reorderKey={reorderKey} loading={loading} filters={filters} className="tiles-cascade" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // The wrapper is drawn either way, so there is always an element to ask about its siblings — and
  // so switching between the two shapes never adds or removes a node the measurement depends on.
  if (!folding) {
    return (
      <div ref={anchor}>
        <TileGrid tiles={tiles} columns={columns} reorderKey={reorderKey} loading={loading} filters={filters} />
      </div>
    );
  }

  return (
    <div ref={anchor} className="relative" {...slotAttributes(tileReachStyle, { leads: reachFrom })}>
      {/* The strip. Its own fold rather than a `collapsed &&`, so it slides away under the rule as
          the tiles come down instead of vanishing on the frame the press landed on. */}
      <div className="tiles-fold" data-open={collapsed ? "true" : "false"} aria-hidden={!collapsed} inert={!collapsed}>
        {/* Inset from both ends by a hair, so the rule still reads as the wider thing the strip
            came out from under. */}
        <div {...slotAttributes(tileStripInsetStyle, {})}>
          <div {...slotAttributes(tileTickerStyle, {})}>
            <TileStrip
              tiles={tiles}
              showing={showing}
              label={t("expand")}
              onPress={toggle}
              onHold={setHeld}
            />
          </div>
          <div {...slotAttributes(tileStripChipsStyle, {})}>
            <TileChips tiles={tiles} active={collapsed} filters={filters} />
          </div>
        </div>
      </div>

      {/* The tiles. */}
      <div className="tiles-fold" data-open={collapsed ? "false" : "true"} aria-hidden={collapsed} inert={collapsed}>
        {/* The fold clips on both axes, so the row is given a gutter its cards' focus rings can
            live in — without it the leftmost and rightmost rings are shaved off while every other
            card on the screen draws a whole one (frontend invariant #58: the arithmetic is fixed
            here rather than the clipping hidden). */}
        <div {...slotAttributes(tileGutterStyle, {})}>
          {/* Paying back exactly what the wrapper reached up by, so the tiles stand where they
              stood before this wrapper existed and no screen moved by adopting it. */}
          <div {...slotAttributes(tileRowStyle, { leads: reachFrom })}>
            <TileGrid tiles={tiles} columns={columns} reorderKey={reorderKey} loading={loading} filters={filters} className="tiles-cascade" />
          </div>
        </div>
      </div>

      {/* The handle — one shape in one place through both states, hanging off the rule at its
          right-hand end. Positioned against this wrapper rather than against either fold, so it
          lies over the strip when the row is folded and over the 32px the tiles reserve above
          themselves when it is open. It never reaches the cards. */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? t("expand") : t("collapse")}
        className="group absolute z-10 flex items-center justify-center"
        {...slotAttributes(tileHandleStyle, { placement: "rule" })}
      >
        <ChevronDownIcon
          className="size-3.5"
          aria-hidden
          {...slotAttributes(tileHandleChevronStyle, { folded: collapsed })}
        />
        {/* The control's name in words, for a design that draws the handle as a labelled button
            rather than as a tab hanging off the rule. The button's own label already names it. */}
        <span aria-hidden {...slotAttributes(tileHandleLabelStyle, { placement: "rule" })}>
          {collapsed ? t("expand") : t("collapse")}
        </span>
      </button>
    </div>
  );
}

/**
 * What pressing a tile does to the list's filter: narrows the list to the tile's rows, or lifts
 * that narrowing when the tile is already pressed. The card and the folded chip share this one
 * answer, so the same figure does the same thing whichever way it is drawn.
 *
 * @param tile the pressed figure, which must carry a filter
 * @param tiles every figure of the row, since a figure's rows may be narrowed by its siblings
 * @param filters the list's filter state
 */
function pressTile(tile: SettingsTile, tiles: readonly SettingsTile[], filters: TileFilters): void {
  const committed = filters.committedValues ?? {};
  const filter = tile.filter as TileFilter;
  const pressed = pressedTileKeys(tiles, committed).has(tile.key);
  filters.commitValues(pressed ? pressedValues(filter, committed) : narrowedValues(filter, tiles, committed));
}

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
function TileChips({
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
    // The row scrolls sideways, and `overflow-x` makes the other axis clip too, so the keyboard halo
    // of a chip (3px past its edge) would be cut. The gutter gives the halo its room and the equal
    // negative margin keeps the row where it was.
    <div className="flex items-center overflow-x-auto -m-[var(--focus-gutter)] p-[var(--focus-gutter)]" {...slotAttributes(tileChipsStyle, {})}>
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
          ...slotAttributes(tileChipStyle, { pressable }),
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
function TileStrip({
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
    // Flush against the rule with no top edge of its own — the rule is its top edge, and the shadow
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

      {/* Which of them is showing, and how many there are — at the head of the line, where the eye
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
function TileGrid({
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
   * its own children — a selector written two levels up breaks the day anything is put in between.
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
        // The board stacks value → 추이 → 근거, so the comparison takes the card's first line under
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
            // The card lets its figure break anywhere, so a figure wider than the card never
            // overflows it; the unit is a word and is never cut inside, so it wraps whole.
            className={TILE_UNIT_UNBREAKABLE}
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
