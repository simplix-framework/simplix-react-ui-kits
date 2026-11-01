import type { ComponentType, ReactNode } from "react";
import type { CrudSearch } from "@simplix-react/ui";

import type { SettingsTile } from "../layout";
import type { DismissibleNoticeKind, NoticeCardAction } from "../notice";

/**
 * Where a console page draws something, named so a page can replace exactly that part.
 *
 * <p>An override supplies the node the spec would otherwise have produced. `body` is the region a
 * tabless page fills; a tabbed page overrides a tab's own `body` instead.
 */
export type PageSlot = "actions" | "tiles" | "notice" | "cards" | "timeRange" | "tabStrip" | "body";

/**
 * The seams between the parts, named so a page can add something the pattern has no place for.
 *
 * <p>The order the pattern draws in is fixed (header · tiles · notice · cards · timeRange · tabs ·
 * body), and a seam is a gap between two of those, never a re-ordering of them.
 */
export type PageSeam =
  | "beforeTiles"
  | "afterTiles"
  | "afterNotice"
  | "beforeTabs"
  | "afterBody";

/**
 * What one page departs from the pattern in.
 *
 * <p><b>This type is the audit surface.</b> A page's departures live in one object in one file
 * (`page.blocks.tsx`), so a script reads the keys and knows precisely what that page does
 * differently — without parsing JSX. A key that turns up on many pages is the next thing the
 * pattern should carry, and one that turns up once is a genuine one-off. Neither is visible while
 * the departure is spelled out inline among the chrome.
 */
export interface PageBlocks {
  /** Replaces what the spec would have drawn at that slot. */
  readonly override?: Partial<Record<PageSlot, ReactNode>>;
  /** Drawn in addition, at a named seam. */
  readonly insert?: Partial<Record<PageSeam, ReactNode>>;
  /** Tabs this page has beyond the generated one, appended in order. */
  readonly tabs?: readonly PageTabSpec[];
}

/**
 * What the generated page hands its blocks file.
 *
 * <p>The address and nothing else. It is what every page has, so the generated side calls the
 * blocks hook the same way on all of them — and a block that needs more state reads it the way any
 * component does, with its own hooks, rather than by widening this.
 */
export interface PageBlocksContext<S extends ConsoleSearch = ConsoleSearch> {
  readonly search: S;
  readonly onNavigate: (search: S) => void;
}

/**
 * The blocks file's export.
 *
 * <p>A hook rather than a constant, because a departure usually needs state — the explanation this
 * screen opens at `?help=reference`, a dialog it holds open, a count it reads for a tab of its
 * own. Called unconditionally at the top of the generated page, so the rules of hooks hold without
 * the generator knowing what any particular page's blocks do.
 */
export type UsePageBlocks<S extends ConsoleSearch = ConsoleSearch> = (
  ctx: PageBlocksContext<S>,
) => PageBlocks;

/**
 * The address a console page is opened at.
 *
 * <p>The record, the mode, the tab and the explanation — everything a reader can be looking at and
 * expect to still be looking at after a reload or a shared link.
 */
export interface ConsoleSearch extends CrudSearch {
  /** Which explanation is open, as `?help=`. */
  readonly help?: string;
  /**
   * A second or third overlay this screen opens, each addressed by a field of its own.
   *
   * <p>A screen with two of them cannot address both through `?help=`: neither could be linked to
   * on its own, and opening one would close the other. So the register's 「이행 방법 없음」 is
   * `?gap=` and the grant screen's door dialog is `?grant=`, each named for what it opens.
   *
   * <p>Named here rather than left open, so a screen adding a third says what it is adding — and
   * so a plain {@link CrudSearch} still passes where this is wanted, which it would not with an
   * index signature over it.
   */
  readonly gap?: string;
  readonly grant?: string;
}

/**
 * The explanation this screen can open.
 *
 * <p><b>Addressed, not pressed.</b> Twenty-one screens of this console have exactly one, each
 * wired with the same three lines against `?help=`, and the board gives that state its own frame —
 * so it is a place a reader can write down and navigate back to rather than a press that leaves no
 * trace. Declared here because it is what the screen is, and drawn where every one of them drew
 * it: under the notice, above the tabs.
 */
export interface PageHelpSpec {
  /**
   * Which search field addresses this explanation, and what it says when it is open.
   *
   * <p>`?help=` for the screen's own explanation, which is what nearly every one has. A screen
   * with a second — the register's 「어디서 왔는가」 beside its 「이행 방법 없음」 — gives that one
   * its own field, because two explanations sharing `?help=` cannot both be open and cannot be
   * linked to separately.
   */
  readonly field?: string;
  /** What that field says when this explanation is open. */
  readonly key: string;
  /**
   * The explanation, handed the state the address decides.
   *
   * <p>A render function rather than a component type: four of the twenty-one explanations take
   * something else as well — the counts they are explaining, the axes they list — and a page that
   * has to hand its panel a figure should not have to leave the pattern to do it.
   */
  readonly render: (state: {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
  }) => ReactNode;
}

/**
 * What has narrowed this page to less than it usually shows, and the way back out of it.
 *
 * <p><b>Not a filter.</b> A filter is a control the reader worked, and the filter bar already says
 * what it is set to. This is a narrowing the reader arrived inside — an organization in the
 * address, a figure they pressed on another panel, a range the server forces — and without a line
 * saying so the list is shorter than the tab above it claims and nothing on the screen explains
 * why.
 *
 * <p>Three screens of this console said it three ways: a card with a 「해제」 button, an outline
 * badge beside a clear button, and a sentence in a banner. One shape here, so a reader meets the
 * same thing whichever screen narrowed them.
 */
export interface PageNarrowingSpec {
  /** What the page has been narrowed to, named as the reader would name it. */
  readonly label: string;
  /** The way back out, or absent where the narrowing is the server's and cannot be lifted. */
  readonly onClear?: () => void;
  /**
   * What the control that lifts it is called.
   *
   * <p>Named by the page rather than by this component: the word depends on what was narrowed —
   * 「전체 보기」 out of an organization, 「해제」 off a means — and a page that knows what it
   * narrowed by knows which of the two its reader is expecting.
   */
  readonly clearLabel?: string;
}

/** One tab of a console page. */
export interface PageTabSpec {
  /** The value the tab is addressed by, in the URL and in the panel that answers it. */
  readonly key: string;
  readonly label: string;
  /** Drawn beside the label. `undefined` while the count is still loading. */
  readonly count?: number;
  /**
   * Whether this tab exists at all for this reader.
   *
   * <p>Absent rather than disabled: a tab a reader may not open is a tab that opens on a refusal,
   * and the strip is shorter without it. Defaults to true.
   */
  readonly when?: boolean;
  /**
   * Whether this tab names something the product does not carry yet.
   *
   * <p>Drawn and inert, with the reason on it, rather than left out: a chapter that will hold
   * inspections and permits has to say so on the screen the reader is standing on, or the record
   * reads as everything this product keeps about a machine. Seven screens of this console draw
   * one.
   */
  readonly unbuilt?: boolean;
  /**
   * Where this tab goes, when what it names is a screen of its own.
   *
   * <p>A way in rather than a second place the same rows are drawn: the space tree has its own
   * address, so the tab that names it hands the reader over instead of redrawing the tree inside
   * a panel that has no room for it. Given this, the tab has no body of its own.
   */
  readonly link?: ReactNode;
  /**
   * What the tab shows.
   *
   * <p>Omitted where the page draws one body for every tab — forty-one screens of this console do,
   * because their tabs narrow one list rather than showing different things. Those declare the
   * body once, on the spec.
   */
  readonly body?: ReactNode;
}

/** The card a page puts under its figures to say what the screen settles. */
export interface PageNoticeSpec {
  readonly key: string;
  readonly kind: DismissibleNoticeKind;
  readonly title: string;
  readonly hint?: string;
  /** A control at the card's end — the way out of the state the card is about. */
  readonly trailing?: ReactNode;
  /** A verb the card offers, and what it does. */
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  /** Several verbs, drawn as a row under the card's text, the primary one first. */
  readonly actions?: readonly NoticeCardAction[];
  /** What the card holds beyond its hint — a table, a list, an example. */
  readonly children?: ReactNode;
}

/**
 * A console page, declared rather than assembled.
 *
 * <p>Everything but `title` is optional, and an absent part is not drawn — a page with no figures
 * says nothing about figures. That is what keeps sixty pages the same shape: the parts they share
 * are declared in the same order every time, and the parts they do not have are simply missing.
 */
export interface PageSpec {
  readonly title: string;
  /**
   * The line under the title. Several facts about the page (a workplace, a date, a shift) are
   * given as a list, so a design can set them apart rather than as one sentence.
   */
  readonly description?: string | readonly string[];
  /**
   * The segments of this screen's way back that its own address does not carry.
   *
   * <p><b>A page cannot state its way back, only fill a hole in one.</b> Where the breadcrumb goes
   * and what it says are derived from the menu row the address hangs off, and a screen that is a
   * menu row of its own gets none — the column already returns the reader there. Ten screens of
   * this console wrote their own and seven pointed sideways at a destination the menu carried, so
   * the destination is not something a screen is allowed to choose.
   *
   * <p>What is left is the one thing the tree cannot know: a safety zone's policy is
   * `/zones/:zoneId/policy` and the tree it came from is `/sites/:siteId/areas`, and nothing in the
   * address says which workplace. The screen that read the zone knows, and hands over `siteId` and
   * nothing else. Until every missing segment has a value the breadcrumb is not drawn.
   */
  readonly backParams?: Readonly<Record<string, string>>;
  /** The header's action buttons — the primary create, a save, an export. */
  readonly actions?: ReactNode;
  /**
   * Where this screen stands in a sequence of them, drawn above the figures.
   *
   * <p>An import is chosen, then mapped, then applied, and each of the three is its own screen —
   * a reader dropped on the middle one has no way to tell what came before it or what is left
   * without a line saying so. Six screens of this console draw one, and they draw it in the same
   * place: above everything, because it is about the journey rather than about this stop.
   */
  readonly steps?: ReactNode;
  readonly tiles?: readonly SettingsTile[];
  readonly tilesColumns?: 1 | 2 | 3 | 4;
  /**
   * Lets the reader put the figures in their own order, kept in this browser under this key.
   * Absent, the figures keep the order they are declared in.
   */
  readonly tilesReorderKey?: string;
  /** What the figures are about, drawn as a heading over them with the fold control on its line. */
  readonly tilesTitle?: string;
  /** Whether the figures are still being read. */
  readonly tilesLoading?: boolean;
  /**
   * The cards under the figures saying what this screen settles.
   *
   * <p>A list rather than one card, and a `false` entry is not drawn: a page usually has one
   * standing explanation and sometimes a second that depends on its state — the read failed, this
   * installation has no source for something. Both are what the page is, so both are declared
   * here; `blocks` is for what the pattern has no place for, not for a card that is conditional.
   */
  readonly notice?:
    | PageNoticeSpec
    | readonly (PageNoticeSpec | false | null | undefined | "")[];
  /**
   * The status cards the list below is cut by (a `StatusCardStrip`), drawn under the notices and
   * above the window, the tabs and the list's chip row: a figure between the chips and the rows
   * would read as counting the rows under it (frontend invariant #63).
   */
  readonly cards?: ReactNode;
  /** The window picker a history screen narrows by. */
  readonly timeRange?: ReactNode;
  /**
   * What has narrowed this page, drawn between the window and the tabs it narrows.
   *
   * <p>Several, because a page can be narrowed twice — by an organization in the address and by a
   * figure the reader pressed.
   */
  readonly narrowing?: readonly (PageNarrowingSpec | false | null | undefined | "")[];
  /** The explanation this screen opens at `?help=`. */
  readonly help?: PageHelpSpec | readonly (PageHelpSpec | false | null | undefined)[];
  /**
   * The tabs, in reading order. One tab draws its body with no strip above it — a strip with a
   * single tab is a row that says nothing and takes a line to say it.
   */
  readonly tabs?: readonly PageTabSpec[];
  /**
   * How this page takes its height, from its own column down to its tab bodies.
   *
   * <p>`fill` (the default) gives the body the remaining height and lets it scroll inside — what a
   * list wants, because the table carries its own scroll. `flow` lets the body be as tall as it is
   * and the page scrolls — what a settings screen wants, because a banner, a form and a matrix
   * stacked together are taller than any window, and what a list under four tiles and a table
   * wants too: given the leftover height at the 1440×900 fold it is twenty-one pixels of a list
   * nobody can read.
   *
   * <p>One answer for the page and its tabs both, because it is one question: whether what this
   * screen shows carries its own scroll.
   *
   * <p><b>Getting this wrong is invisible in a diff and obvious on screen.</b> A flowing body
   * given `fill` is squeezed to whatever height is left and draws straight through the paragraph
   * above it; three settings screens of this console were painting an audit notice across a
   * banner's title that way, with every string in both correct.
   */
  readonly layout?: "fill" | "flow" | "record";
  /**
   * The width this screen's content is capped at.
   *
   * <p>For a page with no list beside it: the window is 1200px wide and a 「채널 · 이메일」 row laid
   * across all of it puts the label at one edge and its value at the other. Frontend invariant #62
   * is the rule; this is where a page states it, so the cap holds over the fallback as well as the
   * body — a state panel drawn at full width beside a capped page is the same screen twice.
   */
  readonly width?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /**
   * What the body is called, where it needs a name of its own.
   *
   * <p>For a page whose body is not what the cards above it are about: a delegation list under a
   * banner counting approvals reads as the approvals the banner counted unless the list says what
   * it is. One heading level for all of them — three screens wrote it at two levels, and a reader
   * moving between them met the same kind of name drawn two sizes.
   */
  readonly bodyTitle?: string;
  /**
   * What this page shows.
   *
   * <p>With no tabs, the page's body. With tabs whose entries declare no body of their own, the
   * one body they all share — the usual case, because a tab strip over a list narrows that list
   * rather than replacing it. A tab that declares its own `body` uses that instead.
   */
  readonly body?: ReactNode;
  /**
   * Whether changing tab closes an open record.
   *
   * <p>Defaults to true, which is what twenty-eight screens of this console wrote by hand: another
   * tab is another set of rows, so the panel standing open belongs to the set the reader just
   * left. A page whose tabs show the same record from different sides sets it false.
   */
  readonly tabClosesRecord?: boolean;
  /**
   * Drawn instead of everything below the header.
   *
   * <p>For the page that has nothing to show: the record is not there, the reader may not read it,
   * the query failed. Sixteen screens of this console returned early for one of those, which put
   * the same decision in sixteen shapes — and a page that returns before its figures leaves the
   * header saying a record's name with nothing under it.
   */
  readonly fallback?: ReactNode;
  /**
   * What this screen is on a phone, where it is a different screen rather than a narrower one.
   *
   * <p>Drawn instead of everything below the header, inside the shell's own phone column. A
   * console page on a phone has no room for a list beside a panel, no room for four figures above
   * them, and its verbs belong under the reader's thumb rather than in a header row — so the two
   * screens of this console that answer for a phone answer with a different arrangement, not with
   * the same one at another width.
   *
   * <p>The header is still registered, because the shell's bar draws the title there. A page that
   * wants no description or actions on a phone says so in `description` and `actions`.
   */
  readonly phone?: ReactNode;
  /**
   * The overlays this page can open — confirmations, peek dialogs, sheets.
   *
   * <p>Named rather than left to a seam: a dialog is not part of the page's flow and putting it
   * at one would say it is. Drawn last, outside the column.
   */
  readonly dialogs?: ReactNode;
}
