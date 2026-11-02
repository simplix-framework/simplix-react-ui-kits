import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { ListDetail, type CrudListFilters, useCrudNavigation, useCrudPageState, useMediaQuery, useUIDefaults } from "@simplix-react/ui";

import { PHONE_WINDOW } from "../layout/window-size";

import type { TileFilters } from "../layout";

import { TileFacetsProvider, tileFacets } from "../entity/tile-facets";
import { ConsolePage } from "./console-page";
import type { DetailPresentationSwitchProps } from "./detail-presentation-switch";
import { useDetailWidthLimits, type DetailWidth } from "./detail-width";
import type { DetailWidthSetting } from "./detail-width-memory";
import { searchToType } from "./crud-page-search";
import type { ConsoleSearch, PageNoticeSpec, PageSpec } from "./types";

/**
 * A page notice raised by a state: drawn while `when` holds and not at all otherwise, so a screen
 * declares every notice it can raise in one list instead of building the list conditionally.
 */
export interface CrudPageNotice extends PageNoticeSpec {
  /** Whether the state the notice is about holds now. A count still being read is `false`. */
  readonly when: boolean;
}

/**
 * The notices whose state holds, in their declared order.
 *
 * @param notices every notice the page can raise
 */
export function raisedNotices(notices: readonly CrudPageNotice[] | undefined): PageNoticeSpec[] {
  return (notices ?? []).filter((one) => one.when).map(({ when: _when, ...notice }) => notice);
}

/** The list state a {@link CrudPage} reads: what its figures narrow, and the search box an address fills. */
export type CrudPageListFilters = TileFilters & Partial<Pick<CrudListFilters, "setSearch">>;

/** Where a {@link CrudPage} opens the record a reader picked. */
export type CrudPagePresentation = "panel" | "drawer" | "dialog" | "page";

/** What a {@link CrudPage}'s render functions are handed to move between its views. */
export interface CrudPageNavigation {
  /** The record standing open, if any. */
  readonly selectedId: string | undefined;
  readonly showList: () => void;
  readonly showDetail: (id: string) => void;
  readonly showNew: () => void;
  readonly showEdit: (id: string) => void;
  /** Closes the open record back to the list, wherever it is presented. */
  readonly closePanel: () => void;
}

/** How the record a {@link CrudPage} opened is presented, and how it closes back to the list. */
export interface CrudPresentation {
  readonly presentation: CrudPagePresentation;
  /** Returns to the list, whatever the presentation. */
  readonly close: () => void;
  /** The reader's switch between presentations, drawn at the top right of the record's head. */
  readonly presentationSwitch?: DetailPresentationSwitchProps;
}

const CrudPresentationContext = createContext<CrudPresentation | undefined>(undefined);

/**
 * The presentation of the record being drawn, so one record component can serve every
 * presentation of the same page. Undefined outside a {@link CrudPage}.
 */
export function useCrudPresentation(): CrudPresentation | undefined {
  return useContext(CrudPresentationContext);
}

/** Props for {@link CrudPage}. */
export interface CrudPageProps {
  /** The page around the list: header, figures, notices, help, tabs. Its `body` is the list and its record. */
  readonly spec: Omit<PageSpec, "body">;
  readonly search: ConsoleSearch;
  readonly onNavigate: (search: ConsoleSearch) => void;
  /** Where a picked record opens; the installation's `UIProvider` default when absent. */
  readonly presentation?: CrudPagePresentation;
  /**
   * Lets the reader switch the presentation from the record's head. The page draws the switch and
   * keeps no choice: `value` and `onChange` come from whatever holds the setting, `remember` from
   * {@link useDetailPresentationMemory} or the product's own preference store.
   */
  readonly presentationSwitch?: DetailPresentationSwitchProps;
  /** A fixed list width in px while a record stands open beside it. */
  readonly listWidth?: number;
  /**
   * Accepted so a screen that names it compiles; it no longer changes the width. The record opens
   * at the width the theme names for its presentation (`--detail-<presentation>-width`), a tab
   * strip wider than that scrolls, and the reader can drag the record to another width.
   */
  readonly detailWidth?: DetailWidth;
  /**
   * The widths the reader chose for the record, by presentation, and how a change to one is kept.
   * Without it the reader can still drag the record, and the width lasts as long as the page.
   * {@link useDetailPresentationSetting} hands one that the browser remembers when the reader asks.
   */
  readonly detailWidths?: DetailWidthSetting;
  /**
   * The list's filter state: the figures narrow it, the state its chip row reads, and an address
   * carrying `?q=` types its text into the list's search box (`setSearch`) when the page opens.
   */
  readonly tileFilters?: CrudPageListFilters;
  /** Notices raised by the list's state, drawn directly under the figures after the spec's own notices. */
  readonly notices?: readonly CrudPageNotice[];
  readonly renderList: (nav: CrudPageNavigation) => ReactNode;
  readonly renderDetail: (id: string, nav: CrudPageNavigation) => ReactNode;
  readonly renderNew?: (nav: CrudPageNavigation) => ReactNode;
  readonly renderEdit?: (id: string, nav: CrudPageNavigation) => ReactNode;
}

/**
 * A list page whose rows open a record: the console page with a list for its body and the record
 * beside it, over it from the right edge, or in its place.
 *
 * <p>The record's address is the page's (`?id=` and `?mode=`), so a reader can go back to an open
 * record, bookmark it and hand it on. How the record is presented is the installation's choice
 * (`UIProvider`'s `detailPresentation`) unless the page says otherwise.
 */
export function CrudPage({
  spec,
  search,
  onNavigate,
  presentation,
  presentationSwitch,
  listWidth,
  detailWidths,
  tileFilters,
  notices,
  renderList,
  renderDetail,
  renderNew,
  renderEdit,
}: CrudPageProps) {
  const defaults = useUIDefaults();
  // On a phone the record is the page, whatever the installation or the page chose: there is no
  // width for the list beside it, and a drawer or a dialog would cover the list while hiding the
  // way back behind a backdrop.
  const onAPhone = useMediaQuery(PHONE_WINDOW);
  const shown = onAPhone ? "page" : (presentation ?? defaults.detailPresentation);
  const widthLimits = useDetailWidthLimits(shown);
  const nav = useCrudNavigation(search, onNavigate);
  // `?q=`, from a link that opens the list searched (the console's search): typed into the list's
  // search box once, so the rows are the search the link named.
  const typed = useRef<string | undefined>(undefined);
  const setSearch = tileFilters?.setSearch;
  useEffect(() => {
    const text = searchToType(search.q, typed.current);
    if (text === undefined || !setSearch) return;
    typed.current = text;
    setSearch(text);
  }, [search.q, setSearch]);
  const { state, fade, closePanel } = useCrudPageState(shown, nav);
  const handed: CrudPageNavigation = {
    selectedId: nav.selectedId,
    showList: nav.showList,
    showDetail: nav.showDetail,
    showNew: nav.showNew,
    showEdit: nav.showEdit,
    // A record presented as a page has no panel to close, and without this it has no way back to
    // the list either: its close control returns to the list instead.
    closePanel: closePanel ?? nav.showList,
  };
  const record = (
    // No switch on a phone: the record is always the page there, so a switch would offer choices
    // that change nothing and show one of them as chosen while the page is what is drawn.
    <CrudPresentationContext.Provider value={{ presentation: shown, close: handed.closePanel, presentationSwitch: onAPhone ? undefined : presentationSwitch }}>
    <ListDetail.ViewSwitch
      state={state}
      fade={fade}
      renderDetail={(id) => renderDetail(id, handed)}
      renderNew={renderNew ? () => renderNew(handed) : undefined}
      renderEdit={renderEdit ? (id) => renderEdit(id, handed) : undefined}
    />
    </CrudPresentationContext.Provider>
  );

  // The list learns which fields the figure row narrows, so its filter bar can show a pressed tile.
  const listed = <TileFacetsProvider facets={tileFacets(spec.tiles)}>{renderList(handed)}</TileFacetsProvider>;
  const body =
    shown === "page" ? (
      nav.view === "list" ? listed : record
    ) : (
      <ListDetail
        variant={shown}
        activePanel={nav.view === "list" ? "list" : "detail"}
        onClose={nav.showList}
        minDetailWidth={widthLimits.min}
        maxDetailWidth={widthLimits.max}
        onDetailWidthChange={detailWidths ? (width) => detailWidths.onWidthChange(shown, width) : undefined}
        onDetailWidthReset={detailWidths ? () => detailWidths.onWidthReset(shown) : undefined}
        {...(listWidth ? { listWidth } : { detailWidth: detailWidths?.widths[shown] ?? widthLimits.width })}
      >
        <ListDetail.List>{listed}</ListDetail.List>
        <ListDetail.Detail>{record}</ListDetail.Detail>
      </ListDetail>
    );

  // A record opened in the list's place is the page: its own identifier is the heading and the way
  // back names the list, so the list's title, figures, tabs and create action are not drawn over it.
  const recordAsPage = shown === "page" && nav.view === "detail";
  const raised = raisedNotices(notices);
  const declared = spec.notice === undefined ? [] : Array.isArray(spec.notice) ? spec.notice : [spec.notice];
  const listSpec: Omit<PageSpec, "body"> = {
    ...spec,
    notice: raised.length > 0 ? [...declared, ...raised] : spec.notice,
    tilesFilters: spec.tilesFilters ?? tileFilters,
  };
  const pageSpec = recordAsPage ? { title: "", layout: spec.layout, width: spec.width } : listSpec;
  return <ConsolePage spec={{ ...pageSpec, body }} search={search} onNavigate={onNavigate} />;
}
