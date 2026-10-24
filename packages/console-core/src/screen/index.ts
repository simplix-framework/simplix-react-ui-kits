// The common screen patterns the board draws — the ones that belong to no entity.
//
// Each is a pattern frame the board carries by number, and none of them holds a domain rule: they
// take what a caller hands them and draw it the one way. That is why they sit in the shared package
// rather than in an app's widgets — a pattern implemented twice is two patterns, and the second one
// is drawn from memory of the first.
//
// The strings come from the app's `common` catalogue, the same way `UnbuiltAction` beside them does.

export { AgentDock, DOCK_GROUPS, type DockGroup, type DockTask } from "./agent-dock";
export {
  AiBadge,
  type AiBadgeProps,
  AiDecisionBoundaryNotice,
  AiEstimate,
  AiFeatureCard,
  type AiTier,
  type AiWord,
} from "./ai-marking";
export {
  BulkOutcome,
  BulkPreviewDialog,
  BulkRowBadge,
  BulkStages,
  type BulkBlockReason,
  type BulkPreviewCounts,
  type BulkRowState,
  type BulkStageKey,
  type BulkWords,
} from "./bulk-action";
export { CardGrid, type GridCard } from "./card-grid";
export {
  EditConflictDialog,
  SessionHoldBanner,
  type ConflictChoice,
  type ConflictField,
} from "./edit-conflict";
export { chipFilterValues } from "@simplix-react/ui";
export { FeatureLock } from "./feature-lock";
export { HistoryRail, type HistoryLane, type HistoryNode, type HistoryNodeState, type HistoryRailProps } from "./history-rail";
export { ImpactAnalysis, type ImpactGroup, type ImpactKind, type ImpactRow } from "./impact-analysis";
export { JobTray, JobTrayRow, type JobState, type TrayJob } from "./job-tray";
export {
  LiveBoardStatus,
  LiveRowMark,
  LiveTicker,
  type FeedState,
  type LiveNotice,
  type LiveNoticeWeight,
  type LiveRowChange,
} from "./live-board";
export {
  PlanCanvas,
  type CanvasMark,
  type CanvasPaletteGroup,
  type CanvasPaletteItem,
  type CanvasToolDef,
} from "./plan-canvas";
export {
  DocumentViewer,
  PrintSheet,
  type PaperSize,
  type PrintOverflow,
  type ViewerFit,
} from "./print-preview";
export { FormSheet, type FormSheetProps, type FormSheetSourcePage, type FormSheetSubmission } from "./form-sheet";
export {
  cellAccess,
  derivedText,
  editableCells,
  hasStagePassed,
  missingForTransition,
  sheetBlocks,
  type DerivedText,
  type FormSheetBlock,
  type FormSheetCellAccess,
  type FormSheetCellMode,
  type FormSheetCellPlace,
  type FormSheetContext,
  type FormSheetDefinition,
  type FormSheetField,
  type FormSheetTableRow,
} from "./form-sheet-model";
export { ReadOnlyBanner, type ReadOnlyMode } from "./read-only-banner";
export { Roster, type RosterCell, type RosterCellTone, type RosterColumn, type RosterRow } from "./roster";
export { ScoreSheet, type ScoreEntryChange, type ScoreSheetProps } from "./score-sheet";
export {
  evaluatorsOf,
  figureText,
  groupByCategory,
  isScoreInRange,
  scoreVisibility,
  subtotalRows,
  unresolvedCount,
  type CategoryGroup,
  type FigureText,
  type RawScore,
  type ResolvedBasis,
  type ResolvedScore,
  type ScoreCriterion,
  type ScoreHold,
  type ScoreResult,
  type ScoreRule,
  type ScoreSheetMode,
  type ScoreTotals,
  type ScoreVisibility,
} from "./score-sheet-model";
export { ScheduleBoard, type NonWorkingDay, type ScheduleEntry } from "./schedule-board";
export {
  StatuteBasisButton,
  StatuteBasisDialog,
  type StatuteBasis,
  type StatuteBasisButtonProps,
  type StatuteBasisDialogProps,
} from "./statute-basis";
export { SourceBadge, type SourceBadgeProps, type ValueSource } from "./source-badge";
export {
  SearchHit,
  SearchPrecisionNotice,
  SearchResults,
  type EmptySearchReason,
  type SearchHitEntry,
  type SearchSnippetPart,
} from "./search-results";
export { TimeBasisCards, TimeBasisStrip, zoneToday, type TimeBasis } from "./time-basis";
export { TargetBar } from "./target-bar";
export { useOnline } from "@simplix-react/headless";
export type { TargetBarProps, TargetBarRow } from "./target-bar";
export { readRuleValue, type RuleData, type RuleStatus, type RuleValueReading } from "./rule-value";
export { RuleValueText, type RuleValueTextProps } from "./rule-value-text";
export { PhoneTaskList, type PhoneTask, type PhoneTaskListProps } from "./phone-task-list";
export {
  PhoneStep,
  type PhoneStepDefinition,
  type PhoneStepMeasurement,
  type PhoneStepProps,
  type PhoneStepSubmission,
} from "./phone-step";
export {
  firstIncompleteStep,
  orderTasksByDue,
  stepErrors,
  submitOutcome,
  type OrderableTask,
  type PhoneStepPhase,
  type PhoneSubmitOutcome,
  type StepErrorCode,
  type StepMeasurementCells,
  type StepSamples,
  type ValidatableStep,
} from "./phone-step-model";
