import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  cn,
  Flex,
  Grid,
  MenuLink,
  STATUS_TONES,
  StatCard,
  Text,
  useMediaQuery,
  usePageHeaderState,
  type StatusTone,
} from "@simplix-react/ui";
import { ChevronDownIcon } from "lucide-react";

import { PACKAGE_NAMESPACE } from "./locales";
import {
  tileGutterStyle,
  tileHandleChevronStyle,
  tileHandleStyle,
  tileRowStyle,
  tileStripDividerStyle,
  tileStripDotStyle,
  tileStripInsetStyle,
  tileStripStyle,
  tileStyle,
} from "./settings-tiles.style";
import { NumericText } from "./numeric-text";
import { useTilesCollapse } from "./tiles-collapse";
import { PHONE_WINDOW, REDUCED_MOTION } from "./window-size";
import { slotAttributes } from "@simplix-react/ui/design";

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
export type SettingsTile = CountedSettingsTile | UnbuiltListSettingsTile | ComputedSettingsTile;

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
}

/** What an absent figure reads as. Centralized so no screen invents its own placeholder. */
const ABSENT = "—";

/**
 * A tile's figure with its unit on it, or the placeholder where nobody counted.
 *
 * <p>Exported because the same figure is drawn twice — on the card, and on the one-line strip the
 * row folds into — and a second copy of this arithmetic is how the strip ends up saying 「2」 where
 * the card says 「2건」.
 *
 * @param tile the figure
 * @returns what to render
 */
export function tileFigure(tile: SettingsTile): string | number {
  if (tile.value === undefined) return ABSENT;
  return tile.unit ? `${tile.value}${tile.unit}` : tile.value;
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
   * The most tiles to a row.
   *
   * <p>A screen with fewer figures than this does not need to say so — the grid draws as many
   * columns as there are tiles, so three figures make three columns rather than three quarters of
   * a row with a hole in it.
   */
  readonly columns?: 1 | 2 | 3 | 4;
}

export function SettingsTiles({ tiles, columns = 4 }: SettingsTilesProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/tiles");
  const { collapsed, toggle } = useTilesCollapse();
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
  const folding = underARule && leads !== "content";

  // How far up the row has to reach to sit against whatever is above it, and the same distance paid
  // back so the tiles stand exactly where they stood. Under the header it is two gaps — the
  // header's own `mb-4` AND the page column's `gap="md"`, which add in a flex column — and under a
  // back link it is the one gap between two siblings.
  const reach = leads === "rule" ? "-mt-8" : "-mt-4";
  const payBack = leads === "rule" ? "pt-8" : "pt-4";

  // Nothing turns while the row is open, while a pointer is on the strip, or where there is only
  // one figure to show — a lone tile flipping to itself is movement that says nothing.
  const turning = folding && collapsed && !held && !stillness && tiles.length > 1;

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

  // The wrapper is drawn either way, so there is always an element to ask about its siblings — and
  // so switching between the two shapes never adds or removes a node the measurement depends on.
  if (!folding) {
    return (
      <div ref={anchor}>
        <TileGrid tiles={tiles} columns={columns} />
      </div>
    );
  }

  return (
    <div ref={anchor} className={cn("relative", reach)}>
      {/* The strip. Its own fold rather than a `collapsed &&`, so it slides away under the rule as
          the tiles come down instead of vanishing on the frame the press landed on. */}
      <div className="tiles-fold" data-open={collapsed ? "true" : "false"} aria-hidden={!collapsed}>
        {/* Inset from both ends by a hair, so the rule still reads as the wider thing the strip
            came out from under. */}
        <div {...slotAttributes(tileStripInsetStyle, {})}>
          <TileStrip
            tiles={tiles}
            showing={showing}
            label={t("expand")}
            onPress={toggle}
            onHold={setHeld}
          />
        </div>
      </div>

      {/* The tiles. */}
      <div className="tiles-fold" data-open={collapsed ? "false" : "true"} aria-hidden={collapsed}>
        {/* The fold clips on both axes, so the row is given a gutter its cards' focus rings can
            live in — without it the leftmost and rightmost rings are shaved off while every other
            card on the screen draws a whole one (frontend invariant #58: the arithmetic is fixed
            here rather than the clipping hidden). */}
        <div {...slotAttributes(tileGutterStyle, {})}>
          {/* Paying back exactly what the wrapper reached up by, so the tiles stand where they
              stood before this wrapper existed and no screen moved by adopting it. */}
          <div className={payBack} {...slotAttributes(tileRowStyle, {})}>
            <TileGrid tiles={tiles} columns={columns} className="tiles-cascade" />
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
        className="under-rule group absolute end-6 top-0 z-10 flex h-4 w-11 items-center justify-center"
        {...slotAttributes(tileHandleStyle, {})}
      >
        <ChevronDownIcon
          className="size-3.5"
          aria-hidden
          {...slotAttributes(tileHandleChevronStyle, { folded: collapsed })}
        />
      </button>
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
      className="under-rule flex h-8 w-full items-center overflow-hidden"
      {...slotAttributes(tileStripStyle, {})}
    >
      {/* What a reader of the page's structure gets instead of a line that rewrites itself: every
          figure at once, in the order the cards are in. A strip that flips is a convenience for the
          eye and a nuisance to anything reading aloud. */}
      <span className="sr-only">
        {tiles.map((each) => `${each.label} ${tileFigure(each)}`).join(", ")}
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
          className={cn("shrink-0", tile.tone && STATUS_TONES[tile.tone].icon)}
        >
          {tileFigure(tile)}
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
              {[trendLine, tile.basis].filter(Boolean).join(" · ")}
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
  className,
}: {
  readonly tiles: readonly SettingsTile[];
  readonly columns: 1 | 2 | 3 | 4;
  /**
   * Put on the grid itself rather than on a wrapper, so the cascade animation selects the cards as
   * its own children — a selector written two levels up breaks the day anything is put in between.
   */
  readonly className?: string;
}) {
  return (
    <Grid columns={columns} gap="md" fit className={className}>
      {tiles.map((tile) => {
        // The board stacks value → 추이 → 근거, so the comparison takes the card's first line under
        // the value and the basis moves below it. With no comparison the basis keeps that line and
        // nothing moves, which is why nineteen screens that pass no trend look exactly as before.
        const trendLine = tile.trend
          ? `${TREND_ARROW[tile.trend.direction]} ${tile.trend.text}`
          : undefined;
        const card = (
          <StatCard
            title={tile.label}
            value={tileFigure(tile)}
            chart={tile.spark}
            description={trendLine ?? tile.basis}
            tone={tile.tone}
            highlighted={tile.tone !== undefined && tile.tone !== "success"}
          >
            {trendLine && tile.basis ? (
              <Text size="caption" tone="muted">
                {tile.basis}
              </Text>
            ) : null}
          </StatCard>
        );
        // The card fills whatever height it is handed, so a tile that is a link needs its anchor
        // to be handed the grid cell's full height rather than shrinking to the text. A tile that
        // is not a link is the card itself, with nothing between it and the tile element.
        return (
          <div key={tile.key} className="h-full" {...slotAttributes(tileStyle, { emphasis: tile.emphasis === true })}>
            {tile.href ? (
              <MenuLink href={tile.href} className="block h-full">
                {card}
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
