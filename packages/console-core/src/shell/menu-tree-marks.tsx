import type { ReactNode } from "react";
import { ChevronRightIcon } from "lucide-react";
import { slotAttributes } from "@simplix-react/ui/design";

import { menuCaretStyle, menuGlyphStyle, menuRowStyle } from "./menu-tree.style";

/**
 * The measure the rail's flyout is drawn at: the classic column's own width, so a reader who
 * collapses the column and opens a cluster sees the same rows at the same width. The column's
 * measure is its declaration's, where a design may set its own.
 */
export const MENU_MEASURE = "w-56";

/**
 * The slot the row's label grows into.
 *
 * <p>The floor is released as well as the truncation set: a flex child's minimum size is its
 * content, so a long destination name widens the row and pushes the caret out of the column
 * instead of shortening.
 */
export const MENU_LABEL = "min-w-0 flex-1 truncate";

/** What every row lays out as; its measurements are {@link menuRowStyle}. */
export const MENU_ROW_LAYOUT = "flex items-center";

/** Props for {@link ConsoleMenuGlyph}. */
export interface ConsoleMenuGlyphProps {
  /** The mark, drawn at 16px. Absent, the slot is empty and still holds its width. */
  readonly children?: ReactNode;
}

/**
 * The mark that stands for a destination, or for the branch holding a set of them.
 *
 * <p><b>The slot holds its width whether or not there is a mark in it</b>, so the labels line up
 * down the column rather than starting wherever each row's own icon happens to leave off.
 *
 * <p>Which mark belongs to which destination is the product's to know; this draws the slot.
 */
export function ConsoleMenuGlyph({ children }: ConsoleMenuGlyphProps) {
  return (
    <span
      aria-hidden
      className="flex w-4 shrink-0 items-center justify-center [&>svg]:size-4"
      {...slotAttributes(menuGlyphStyle, {})}
    >
      {children}
    </span>
  );
}

/**
 * Whether a branch is open, said at the end of its row.
 *
 * <p><b>The chevrons are imported rather than named.</b> The framework's `Icon` resolves a name
 * through two async hops, and a caret that arrives late or not at all is how a branch comes to look
 * like a leaf: one menu drew a caret on the branch that was open and none on the five beside it,
 * so five sets of destinations read as five screens nobody could reach.
 */
export function MenuCaret({ open }: { readonly open: boolean }) {
  return (
    <span
      aria-hidden
      className="flex w-3.5 shrink-0 items-center justify-center"
      {...slotAttributes(menuCaretStyle, { open })}
    >
      <ChevronRightIcon size={14} />
    </span>
  );
}
