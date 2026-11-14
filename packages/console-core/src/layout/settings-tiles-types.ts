import type { ReactNode } from "react";
import type { CrudListFilters, StatusTone } from "@simplix-react/ui";

import type { TileColumns } from "./tile-columns";
import type { TileFilter } from "../entity/tile-filter";
import { useTilesCollapse } from "./tiles-collapse";

/** Which way a figure has moved since the moment the comparison names. */
export type TileTrendDirection = "up" | "flat" | "down";

/**
 * How a figure has moved, and against what.
 *
 * <p><b>The direction is not the verdict.</b> A count of overdue duties rising is bad and a training completion rate
 * rising is good, so the arrow says which way the number went and {@link SettingsTile.tone} says whether
 * that is something to act on. The framework's own `trend` prop cannot carry this - it renders the
 * number as a percentage and paints anything non-negative green, which would tell an operator that
 * two more overdue duties is good news.
 *
 * <p><b>Only a figure with a series behind it has one.</b> A count of what is true right now
 * (「작업중지 1건」) has nothing to compare against, and an invented comparison is worse than none.
 */
export interface TileTrend {
  /** Which way the figure moved. Drawn as an arrow, which is what separates the three without colour. */
  readonly direction: TileTrendDirection;
  /** The comparison in the figure's own unit - 「어제보다 2건」 · 「지난달 87%」. */
  readonly text: string;
}

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
  /** Appended to the value: a counter word or a symbol (a unit of count, a percent sign). */
  readonly unit?: string;
  /**
   * The one line under the figure saying what it was read from.
   *
   * <p><b>Whether it survives an absent figure is decided by which of two things it is</b>, and the
   * screen decides it because the string is opaque here. A basis that DECOMPOSES the figure -
   * 「성공 1,322」, 「증분 48회」, 「969 / 1,150명」 - is untrue the moment nothing counted, so it is
   * held back with the figure: `census.x === undefined ? undefined : t(…)`. A basis that STATES
   * WHAT THE FIGURE IS COUNTED OVER - 「타임아웃 제외」, 「최근 30일」, 「법정 시간에 세지 않습니다」
   * - is true of an installation that has counted nothing, and over an em-dash it is the one line
   * saying what the missing figure would have been a figure of. Those are passed ungated.
   *
   * <p>The test is one question: <b>read it with the figure replaced by an em-dash - is the
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
   * <p>Drawn directly under the value, which is where the board puts it - the comparison belongs to
   * the number, and {@link SettingsTile.basis} is the footnote under both.
   */
  readonly trend?: TileTrend;
  /**
   * The shape behind the figure, in the region the card reserves beside the value.
   *
   * <p><b>The shape, not a chart</b> - no axis, no gridlines, no labels; the number above it is
   * what is read and this says whether that number is where it has been heading. Drawn with
   * {@link TileSpark}, which holds the board's two shapes so this row never becomes a second place
   * where plotting is invented; it is a slot rather than a shape name because what a screen has to
   * supply is the series, and only the screen knows where its own series comes from.
   *
   * <p><b>Set it only where a series exists.</b> P-24: 「시계열이 없는 값(지금 참인 것의 개수)에는
   * 넣지 않는다 - 없는 추세를 지어내는 셈이 된다」. A shape derived from the figure alone is a
   * trend nobody measured, drawn at the one place on the screen that is read as measurement.
   */
  readonly spark?: ReactNode;
}

/**
 * One figure a settings screen puts above its form, split on the one question the figure cannot
 * answer for itself: **was it counted from a list this reader can open?**
 *
 * <p>「타일은 누르면 그 값을 만든 목록으로 간다」 is the board's rule, and the reason it gives is
 * 「셀 수 있는 값이 어디서 나왔는지 보지 못하면 사람은 그 수를 믿지 않는다」 - a figure with no
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
 * half of the same claim - and there is no third shape, so a count is never drawn with the
 * question left unanswered.
 */
export interface CountedSettingsTile extends SettingsTileShape {
  /** The figure is a count of rows. */
  readonly counted: true;
  /** Where pressing the tile goes - the list the rows are in. */
  readonly href: string;
  /** Never - the list is right there in `href`. */
  readonly listUnbuilt?: never;
  /** Never: only a tile over the list under it narrows that list. */
  readonly filter?: never;
}

/**
 * A tile whose figure is a count of rows that has no address to send a reader to yet.
 *
 * <p><b>What is missing is usually the address, not the screen.</b> Most of these figures count a
 * subset of the very list underneath them, and that list is on the screen - what does not exist is
 * a URL that opens it narrowed to those rows. A screen whose tab and filters live in component
 * state has nowhere for a tile to point, so the destination arrives when the narrowing becomes
 * addressable, and the tile becomes a {@link CountedSettingsTile} in that change.
 *
 * <p><b>It draws nothing, deliberately.</b> The clock that marks an unbuilt tab or an unbuilt
 * action marks a control the reader can see and cannot use; a tile with no destination has no
 * affordance to mark, so the clock would be announcing an absence nobody perceived - a message to
 * developers, printed on an operator's screen. Worse, a visible penalty on the honest answer is a
 * reason to write the dishonest one: an author who does not want a clock on their row writes
 * `counted: false` over a real count, and the mark meant to protect the contract has broken it.
 *
 * <p><b>Where the count belongs instead is a document</b> - how many figures a reader cannot get
 * behind is the sort of number a person acts on, and it is one `grep` away rather than on
 * sixty screens.
 */
export interface UnbuiltListSettingsTile extends SettingsTileShape {
  /** The figure is a count of rows. */
  readonly counted: true;
  /** Never - that is what makes this the other shape. */
  readonly href?: never;
  /** No address opens the list these rows are in - yet. */
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
 * A tile whose figure was computed rather than counted - a rate, a duration, a date, a version, a
 * word for a state.
 *
 * <p>It carries no destination because there is no list of rows it was read from. A duration is
 * arithmetic on two instants and a rate is a division; neither has rows to open.
 */
export interface ComputedSettingsTile extends SettingsTileShape {
  /** The figure was computed rather than counted, so nothing is owed. */
  readonly counted: false;
  /** Never - a computed figure has no list, and a tile that leads nowhere must not look pressable. */
  readonly href?: never;
  /** Never - there is no list to be unbuilt. */
  readonly listUnbuilt?: never;
  /** Never: only a tile over the list under it narrows that list. */
  readonly filter?: never;
}

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
 * is left hanging off it with the rule's shadow across it - which is what says the row went
 * somewhere rather than that it was deleted. Two things have to hold for that geometry to mean
 * anything: the header has to have drawn a rule, and nothing but the way back may stand between
 * that rule and this row. A back link is allowed above it and the row folds up under the link
 * instead - the same fold one step lower - because a back link cannot go in the header, where
 * `headerHoldsNoWayToAnotherScreen` refuses a trip out of the screen. A second row further down the
 * page, the dashboard's tile rows under their section headings, a row inside a panel or a demo -
 * each is asked the same question and each answers no, so each draws the plain grid it drew before.
 * Nothing opts out by hand and nothing has to remember to opt in.
 *
 * <p><b>The strip shows ONE figure whole, not four in pieces.</b> Four labels and four numbers
 * squeezed onto one line is a line nobody reads: every figure loses the sentence under it that says
 * what it was counted from, which is the half that makes a number mean anything. So the strip
 * carries one tile complete - label, figure, basis - and flips to the next every few seconds the
 * way a news ticker does. Pointing at it holds it still, and a reader who has asked for less
 * movement gets the first figure and no flipping at all.
 *
 * <p><b>The choice is the console's, not this screen's.</b> Folding here folds every screen the
 * operator opens afterwards, and it outlives the visit - the row is not a per-screen opinion but a
 * way of working. See {@link useTilesCollapse}.
 */
export interface SettingsTilesProps {
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
