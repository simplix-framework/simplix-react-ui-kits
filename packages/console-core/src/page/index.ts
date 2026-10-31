export { ConsolePage } from "./console-page";
export { CrudPage, useCrudPresentation } from "./crud-page";
export { DIALOG_DETAIL_WIDTH, DRAWER_DETAIL_WIDTH, PANEL_DETAIL_WIDTH, REGULAR_DETAIL_WIDTH, WIDE_DETAIL_WIDTH, detailWidthFor, detailWidthPx, type DetailWidth } from "./detail-width";
export { RecordPage } from "./record-page";
export type { RecordPageHeader, RecordPageProps } from "./record-page";
export { PageAction } from "./page-action";
export { ExplanationCard } from "./explanation-card";
export type { ExplanationCardProps } from "./explanation-card";
export { ActionDialog } from "./action-dialog";
export type { ActionDialogProps, ActionStep } from "./action-dialog";
export type { PageActionKind, PageActionProps } from "./page-action";
export type { CrudPresentation, CrudPageNavigation, CrudPagePresentation, CrudPageProps } from "./crud-page";
export { PageBackProvider, usePageBackLink } from "./page-back";
export type { PageBackTarget } from "./page-back";
export type {
  ConsoleSearch,
  PageBlocks,
  PageBlocksContext,
  PageHelpSpec,
  PageNarrowingSpec,
  PageNoticeSpec,
  PageSeam,
  PageSlot,
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
