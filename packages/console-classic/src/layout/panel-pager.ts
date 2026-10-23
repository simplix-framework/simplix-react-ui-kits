import { useState } from "react";

/** What a paged read answers with, however the hook that made it is shaped. */
export interface PagedAnswer {
  /** How many rows there are across every page. */
  readonly totalElements?: number;
  /** How many pages that comes to, as the server divided them. */
  readonly totalPages?: number;
}

/** The props `CrudDetail.Table` and `CrudDetail.List` take, ready to spread. */
export interface PanelPagerProps {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
}

/**
 * The pager props for a table inside a panel or a tab, with the two page bases reconciled.
 *
 * <p><b>The framework's pager counts from one and the request counts from zero.</b>
 * `ListPagination` — what `CrudDetail.Table`, `CrudDetail.List` and `CrudList.Pagination` all
 * render — disables 이전 at `page <= 1`, disables 다음 at `page >= totalPages`, and draws
 * `1 … totalPages`; the generated request's `page` parameter is an index, where the first page is
 * `0`. `useCrudList` holds the one-based number and subtracts before it asks, which is why list
 * screens are right and hand-wired panel tables are not.
 *
 * <p><b>Handing the index straight to the pager loses a page, silently.</b> The first render is
 * index 0, which the pager cannot draw and clamps to 「1」 — so the first page is right and looks
 * right. Pressing 「2」 hands back 2, which as an index is the THIRD page: the second page of rows
 * is unreachable and nothing on screen says so. Measured on N-06's 세션 tab, where 「2」 drew the
 * last eight of forty-nine rows.
 *
 * <p>So the conversion lives here rather than at each call site — fifteen screens making the same
 * ±1 by hand is fifteen chances to make it in one direction only.
 *
 * @param index which page is on screen, counting from zero — what the request is given
 * @param setIndex how the caller stores the page the reader asked for
 * @param pageSize how many rows a page holds
 * @param answer what the read came back with
 * @returns the pager's props, one-based
 */
export function panelPager(
  index: number,
  setIndex: (index: number) => void,
  pageSize: number,
  answer: PagedAnswer | undefined,
): PanelPagerProps {
  return {
    page: index + 1,
    pageSize,
    total: answer?.totalElements ?? 0,
    totalPages: answer?.totalPages ?? 0,
    onPageChange: (page) => setIndex(Math.max(0, page - 1)),
  };
}

/** A page index and the two things a caller does with it. */
export interface PanelPage {
  /** The index the request is given, counting from zero. */
  readonly index: number;
  /** Stores the page the reader asked for. */
  readonly setIndex: (index: number) => void;
  /** The pager's props for this page, one-based — spread onto `CrudDetail.Table` or `.List`. */
  readonly pagerFor: (pageSize: number, answer: PagedAnswer | undefined) => PanelPagerProps;
}

/**
 * A panel table's page, held for the caller.
 *
 * <p>The same two lines every paged tab writes — a piece of state for the request and the
 * conversion for the pager — so a screen with three tabs holds three of these rather than three
 * pairs of variables whose names have to stay apart.
 *
 * @returns the index to ask with, how to move it, and the pager props for a given answer
 */
export function usePanelPage(): PanelPage {
  const [index, setIndex] = useState(0);
  return {
    index,
    setIndex,
    pagerFor: (pageSize, answer) => panelPager(index, setIndex, pageSize, answer),
  };
}
