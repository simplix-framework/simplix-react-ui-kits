// Side-effecting: registers this folder's own copy. A component drawing it renders the key rather
// than the words when nothing has registered the catalogue.
import "./locales";

export { ContentLanguageStrip } from "./content-language-strip";
export type { ContentLanguageStripProps, ContentLanguageStripPlacement } from "./content-language-strip";
export { FREE_TEXT_MIN_WIDTH, WIDE_LIST_WIDTH, actionColumnWidth, useWideList } from "./list-column-widths";
export type { WideList } from "./list-column-widths";
export { BoundedDialogContent, type DialogWidth } from "./bounded-dialog-content";
export { DetailPeekDialog, PeekTriggerButton } from "./detail-peek-dialog";
export { RecordPeekLabel } from "./peek-label";
export { UnreadableRecord } from "./unreadable-record";
export type { UnreadableRecordProps } from "./unreadable-record";
export type { RecordPeekLabelProps } from "./peek-label";
export type {
  DetailPeekDialogProps,
  PeekAppearance,
  PeekTriggerButtonProps,
} from "./detail-peek-dialog";
export { ProgressBar } from "./progress-bar";
export { ApprovalFlow } from "./approval-flow";
export { Matrix } from "./matrix";
export { MeasurementGrid } from "./measurement-grid";
export type {
  MeasurementAnalyte,
  MeasurementEvent,
  MeasurementGridProps,
  MeasurementPosition,
} from "./measurement-grid";
export { CheckMatrix } from "./check-matrix";
export type { CheckColumn, CheckMatrixProps, CheckRow } from "./check-matrix";
export {
  CHECK_VERDICTS,
  checkCellState,
  checkKey,
  checkSummary,
  isCheckColumnEditable,
  measurementCellState,
  measurementSummary,
  nextDueState,
  parseReading,
  sampleKey,
} from "./grid-cells";
export type {
  CheckCellState,
  CheckSummary,
  CheckVerdict,
  MeasurementCellState,
  MeasurementSummary,
  MeasurementVerdict,
  NextDueState,
} from "./grid-cells";
export { ChatPreview, MailPreview, WordingBody } from "./message-preview";
export type {
  ChatPreviewProps,
  MailPreviewProps,
  WordingButton,
  WordingButtonGrade,
} from "./message-preview";
export type { MatrixCell, MatrixCellTone, MatrixProps, MatrixRow } from "./matrix";
export type { ApprovalFlowProps, ApprovalStep, ApprovalStepAction, ApprovalStepState } from "./approval-flow";
export { usePeekTarget } from "./use-peek-target";
export { useScrollEndRoom } from "./use-scroll-end-room";
export type { PeekTargetController } from "./use-peek-target";
export { PageNote } from "./page-note";
export type { PageNoteProps } from "./page-note";
export { PageTabStrip } from "./page-tab-strip";
export { PageTabs, PageTabPanel, CountedTab } from "./page-tabs";
export { NumericText } from "./numeric-text";
export { LabelledValue, type LabelledValueProps } from "./labelled-value";
export { StrongText } from "./strong-text";
export { PhraseText } from "./phrase-text";
export { HorizontalScroll } from "./horizontal-scroll";
export { SizedHead } from "./sized-head";
export { StatePanel } from "./state-panel";
export { LoadingBlock } from "./loading-block";
export { TableCard } from "./table-card";
export { PanelList } from "./panel-list";
export type { PanelListProps } from "./panel-list";
export { panelPager, usePanelPage } from "./panel-pager";
export type { PagedAnswer, PanelPage, PanelPagerProps } from "./panel-pager";
export { BlockButton } from "./block-button";
export { SettingsTabs } from "./settings-tabs";
export { TooltipTarget } from "./tooltip-target";
export { WideField } from "./wide-field";
export { EllipsisText } from "./ellipsis-text";
export { SettingsSection, SettingsTab, UncountedPanel } from "./settings-layout";
export {
  SettingsTiles,
  tileFigure,
  type ComputedSettingsTile,
  type CountedSettingsTile,
  type SettingsTile,
  type TileTrend,
  type TileTrendDirection,
  type UnbuiltListSettingsTile,
} from "./settings-tiles";
export { TileSpark, type TileSparkShape } from "./tile-spark";
export { TilesCollapseProvider, useTilesCollapse, type TilesCollapse } from "./tiles-collapse";
export { PHONE_WINDOW, REDUCED_MOTION } from "./window-size";
export { ShareBar, type Share } from "./share-bar";

export { ExternalReferenceValue } from "./external-reference-value";
export type { ExternalReferenceValueProps } from "./external-reference-value";
export { InertLabel } from "./inert-label";
