export { ConsolePage } from "./console-page";
export { validateConsoleSearch } from "./console-search";
export { CrudPage, CrudPresentationProvider, raisedNotices, useCrudPresentation } from "./crud-page";
export { searchToType } from "./crud-page-search";
export { REGULAR_DETAIL_WIDTH, detailWidthFor, detailWidthLimits, detailWidthPx, useDetailWidthLimits, type DetailWidth, type DetailWidthLimits, type ResizablePresentation } from "./detail-width";
export { DETAIL_WIDTH_STORAGE_KEY, forgetRememberedWidths, persistWidths, readRememberedWidths, useDetailWidthMemory, withWidth, withoutWidth, writeRememberedWidths, type DetailWidthMemoryOptions, type DetailWidths, type DetailWidthSetting } from "./detail-width-memory";
export { RecordPage } from "./record-page";
export type { RecordPageHeader, RecordPageProps } from "./record-page";
export { PageAction } from "./page-action";
export { PageBanner } from "./page-banner";
export type { PageBannerProps } from "./page-banner";
export { PageMenuAction } from "./page-menu-action";
export type { PageMenuActionProps, PageMenuOption } from "./page-menu-action";
export { EXPORT_FILE_FORMATS, ExportAction, runExport } from "./export-action";
export type { ExportActionProps, ExportFileFormat } from "./export-action";
export { ExplanationCard } from "./explanation-card";
export type { ExplanationCardProps } from "./explanation-card";
export { ActionDialog } from "./action-dialog";
export type { ActionDialogProps, ActionStep } from "./action-dialog";
export type { PageActionKind, PageActionProps } from "./page-action";
export type { CrudPresentation, CrudPageListFilters, CrudPageNavigation, CrudPageNotice, CrudPagePresentation, CrudPageProps } from "./crud-page";
export type { CrudPageBlocks } from "./crud-page-blocks";
export type { CrudNavigateOptions } from "@simplix-react/ui";
export { countNotice } from "./count-notice";
export type { CountNoticeNarrowing, CountNoticeSpec } from "./count-notice";
export { PageBackProvider, usePageBackLink } from "./page-back";
export type { PageBackTarget } from "./page-back";
export type {
  ConsoleSearch,
  PageBlocks,
  PageBlocksContext,
  PageHelpSpec,
  PageNarrowingSpec,
  PageNoticeSpec,
  PageSpec,
  PageTabSpec,
  UsePageBlocks,
} from "./types";
export { DetailPresentationSwitch } from "./detail-presentation-switch";
export type { DetailPresentationSwitchProps } from "./detail-presentation-switch";
export {
  DETAIL_PRESENTATIONS,
  DETAIL_PRESENTATION_STORAGE_KEY,
  forgetRememberedPresentation,
  memoryPresentationStorage,
  readRememberedPresentation,
  useDetailPresentationMemory,
  useDetailPresentationSetting,
  writeRememberedPresentation,
} from "./presentation-memory";
export type { DetailPresentationMemory, DetailPresentationMemoryOptions, DetailPresentationSetting, PresentationStorage } from "./presentation-memory";
