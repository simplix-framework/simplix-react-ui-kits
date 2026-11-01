import type { ReactNode } from "react";

import type { PageTimeRangeSlot } from "../datetime/page-time-range";
import type { RecordAction } from "../entity/record-list";

import type { CrudPageNavigation, CrudPageNotice } from "./crud-page";
import type { DetailWidth } from "./detail-width";
import type { PageSpec } from "./types";

/**
 * What a generated CRUD page reads from its `page.blocks.tsx`: every key is optional, and a screen
 * states only the ones it departs in.
 *
 * <p><b>One list, for the blocks file and for the generated page.</b> The generated page types the
 * value its blocks hook returns as that hook's own type intersected with this one, so a key the
 * kit gains after a blocks file was written stays optional for that file instead of failing its
 * typecheck. A key is added here and nowhere else: the generated page reads it, the blocks stub
 * offers it, and every older blocks file keeps compiling.
 *
 * @typeParam TRow a row of the screen's list
 * @typeParam TListProps the props of the screen's generated list
 * @typeParam TDetailProps the props of the screen's generated detail
 * @typeParam TList the list the generated page builds, as its list hook returns it
 */
export interface CrudPageBlocks<TRow, TListProps, TDetailProps, TList = unknown> {
  /** What the header and the body draw beyond the generated title and create action. */
  readonly spec?: Partial<Omit<PageSpec, "body">>;
  /** The request the list reads with, beyond the reader's own filters. */
  readonly listParams?: Readonly<Record<string, unknown>>;
  /** Props handed to the generated list. */
  readonly listProps?: (nav: CrudPageNavigation) => Partial<TListProps>;
  /** Row actions of this screen's own, drawn between the generated edit and delete. */
  readonly rowActions?: (nav: CrudPageNavigation) => readonly RecordAction<TRow>[];
  /** Why a row cannot be deleted (a record the server refuses to remove), drawn on the generated delete. */
  readonly deleteDisabled?: (row: TRow) => string | false | undefined;
  /** Why a row cannot be edited (a record the server refuses to change), drawn on the generated edit. */
  readonly editDisabled?: (row: TRow) => string | false | undefined;
  /** Props handed to the generated detail. */
  readonly detailProps?: (id: string, nav: CrudPageNavigation) => Partial<TDetailProps>;
  /** The room the detail takes beside the list. */
  readonly detailWidth?: DetailWidth;
  /**
   * Header actions that read the list, drawn after the generated or stated ones: an
   * `ExportAction` sends the list's current search, which only the list holds.
   */
  readonly headerActions?: (list: TList) => ReactNode;
  /**
   * The time range region, switched on with data: the field the rows are read by in time, the
   * windows on offer and, where an endpoint buckets them, the counts per slice. The template draws
   * it over the list's filters; a screen never draws the strip itself.
   */
  readonly timeRange?: PageTimeRangeSlot;
  /**
   * Every notice the list's state can raise, each with the condition that raises it. A notice
   * whose condition is false is not drawn; drawn ones sit directly under the figures (`spec.tiles`).
   */
  readonly notices?: (list: TList) => readonly CrudPageNotice[];
  /** Dialogs this screen's own actions open, drawn beside the page. */
  readonly dialogs?: ReactNode;
}
