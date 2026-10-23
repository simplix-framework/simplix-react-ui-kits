import { useRef } from "react";
import { getActionColumnWidth, useContainerWidth } from "@simplix-react/ui";

/**
 * The floor a free-text list column holds.
 *
 * <p>Said as a floor rather than a fixed width, which is the whole difference. A fixed width is
 * two constraints at once: the column never grows past it, and a table with room to spare spends
 * that room on nothing — so a contract or a product name ellipsizes at a number chosen for the
 * narrowest screen while the console shows an arm's length of empty table beside it. The reader
 * is then sent to a tooltip, or into the detail panel, to learn a value that would have fitted.
 *
 * <p>As a floor the column still refuses to let its data set the table's width — long values
 * ellipsize rather than pushing the row sideways — and whatever the table has left over comes
 * here. For the extra width to show, the cell must fill it: render the value as a block that
 * truncates and give it no width of its own.
 *
 * <p>Use this where the value has no bounded length — a name, a label, a customer, a reason. A
 * value of known size (a masked key, a code, an id, a date) keeps a fixed `width`, because extra
 * room there is only padding.
 */
export const FREE_TEXT_MIN_WIDTH = 180;

/**
 * How wide a list has to be before it draws its full column set, in px.
 *
 * <p><b>Three bounds decide the number, and only the first is about the pane.</b>
 *
 * <p><b>Above the widest pinned pane.</b> `ListDetail` lays no grid at all while the detail is
 * closed, so the list takes the whole page. Open a row and the list pane becomes the `listWidth`
 * its screen pinned, which is between 420 and 620 across the console — every one of those has to
 * land on the short set.
 *
 * <p><b>At or below the narrowest full page.</b> The shell spends 283px on the rail and the page's
 * own padding, so a 1280 viewport leaves the list 997 and a 1440 leaves it 1157. A threshold above
 * the smaller of those puts a full-width page on the short set, which is the failure a reader
 * cannot work around: a dropped column takes its value with it and there is no 「show anyway」.
 *
 * <p><b>At or above what each full set actually measures.</b> `minTableWidth` exists so a column
 * set is never drawn in a table that then scrolls sideways, and a threshold below the set's own
 * intrinsic width does exactly that — the set switches on inside a container that cannot hold it,
 * and the row actions sit past the right edge where nobody looks for them. The list/detail divider
 * is draggable, so the container is a range rather than two values and every width in that range
 * is reachable.
 *
 * <p><b>A list that uses this owes the third bound a measurement</b>: sum the wide set's declared
 * `width` and `minWidth` values, add 24px of cell padding per column plus the row-action column,
 * and keep the total under this number. A set that will not fit loses a column or narrows one; it
 * does not get a threshold of its own, because a per-list threshold is a per-list answer to a
 * question the reader asks once — 「is this list wide enough to read across」.
 *
 * <p>Goes on `CrudList.Column`'s `minTableWidth`, which is the framework's own answer for this:
 * below the number the column is not rendered at all, header and dropdown entry included. Only a
 * value the detail panel also shows may be given one — a column that disappears takes its value
 * with it, and the thing that took the width is the panel carrying it.
 */
export const WIDE_LIST_WIDTH = 990;

/** What {@link useWideList} answers with. */
export interface WideList {
  /** Goes on the `CrudList` root, which is the element whose width decides the column set. */
  readonly ref: React.RefObject<HTMLDivElement | null>;
  /** Whether the `minTableWidth={WIDE_LIST_WIDTH}` columns are being drawn right now. */
  readonly wide: boolean;
}

/**
 * Tells a cell whether the wide-only columns are on screen beside it.
 *
 * <p><b>This is not how a column is dropped — `minTableWidth` is.</b> What it is for is the second
 * line under a row's name: the frames draw 「이메일 · 소속」 there because the board's list is two
 * columns wide, and those same values become columns of their own once there is room. Drawn in both
 * places at once the row says everything twice and reads as a defect, so the caption asks whether
 * the columns took the value and renders what is left.
 *
 * <p><b>The window's width is the wrong number</b>, which is why this measures an element. A
 * list-detail screen keeps its list in a pane whose width the detail decides, so a 1600px monitor
 * and a 620px list pane are the same viewport.
 *
 * <p><b>Unmeasured counts as wide.</b> `useContainerWidth` reads the element in an effect, so the
 * first render has no number — and `CrudList.Table` resolves its own unmeasured state the same way,
 * drawing every column. Answering 「narrow」 here would disagree with the table for one frame and
 * print the caption beneath the columns that already carry it.
 *
 * @returns the ref to hang on `CrudList`, and whether the wide columns are drawn
 */
export function useWideList(): WideList {
  const ref = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(ref);
  return { ref, wide: width === 0 || width >= WIDE_LIST_WIDTH };
}

/**
 * How wide the column holding a row's verbs is, for a given number of them.
 *
 * <p><b>One kind of column takes one width, and this is where that is settled.</b> Six tables in
 * this console each chose their own — 96 · 112 · 192 · 224 — so the same two buttons lined up in
 * one table and not in the next, and a reader comparing two screens read the wider one as the more
 * important. The number is the framework's own, so a hand-built table's head and the framework's
 * list agree rather than agreeing by coincidence.
 *
 * <p><b>The count is what the table declares, not what one row shows.</b> A verb a row hides still
 * takes its place in the column, or the column changes width down the table.
 *
 * @param count how many actions the table's rows declare
 * @returns the width in px for the head that holds them
 */
export function actionColumnWidth(count: number): number {
  return getActionColumnWidth(new Array(count).fill(EMPTY_ACTION), "outline");
}

/** A stand-in for one declared action: the framework's width reads the count, never the action. */
const EMPTY_ACTION = { type: "view" as const, onClick: () => {} };
