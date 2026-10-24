import { createContext, useContext, type ReactNode } from "react";
import { ListDetail, useCrudNavigation, useCrudPageState, useUIDefaults } from "@simplix-react/ui";

import { ConsolePage } from "./console-page";
import { detailWidthPx, type DetailWidth } from "./detail-width";
import type { ConsoleSearch, PageSpec } from "./types";

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
  /** A fixed list width in px while a record stands open beside it. */
  readonly listWidth?: number;
  /**
   * How wide the record opens, in every presentation but the page: `regular` is the framework's
   * detail width, `wide` the width a record with many tabs or wide parts needs. Use
   * {@link detailWidthFor} to choose it from the record's tab labels.
   */
  readonly detailWidth?: DetailWidth;
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
  listWidth,
  detailWidth = "regular",
  renderList,
  renderDetail,
  renderNew,
  renderEdit,
}: CrudPageProps) {
  const defaults = useUIDefaults();
  const shown = presentation ?? defaults.detailPresentation;
  const nav = useCrudNavigation(search, onNavigate);
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
    <CrudPresentationContext.Provider value={{ presentation: shown, close: handed.closePanel }}>
    <ListDetail.ViewSwitch
      state={state}
      fade={fade}
      renderDetail={(id) => renderDetail(id, handed)}
      renderNew={renderNew ? () => renderNew(handed) : undefined}
      renderEdit={renderEdit ? (id) => renderEdit(id, handed) : undefined}
    />
    </CrudPresentationContext.Provider>
  );

  const body =
    shown === "page" ? (
      nav.view === "list" ? renderList(handed) : record
    ) : (
      <ListDetail
        variant={shown}
        activePanel={nav.view === "list" ? "list" : "detail"}
        onClose={nav.showList}
        {...(listWidth ? { listWidth } : detailWidthPx(shown, detailWidth) ? { detailWidth: detailWidthPx(shown, detailWidth) } : {})}
      >
        <ListDetail.List>{renderList(handed)}</ListDetail.List>
        <ListDetail.Detail>{record}</ListDetail.Detail>
      </ListDetail>
    );

  return <ConsolePage spec={{ ...spec, body }} search={search} onNavigate={onNavigate} />;
}
