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
// A screen-owned narrowing: the chip row and its state live on the page so the rows and the counts
// above them read one selection, and a board frame draws the same parts without reaching past the kit.
export { ChipFilter, chipFilterValues, SearchOperator, Text, useFilterBarState } from "@simplix-react/ui";
// The primitives a page frame composes around the kit's parts (a sign-in card's banner, an account
// page's rows), re-exported so a board frame reaches them through the kit; an icon is named, so a
// frame never imports an icon library.
export { AlertBanner, Button, Flex, FormFields, Icon, Stack, type IconName } from "@simplix-react/ui";
// A dialog whose body is its own (a file to choose, a progress bar) rather than the kit's decision
// fields; a frame draws it from the same parts the screen does.
export { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label } from "@simplix-react/ui";
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
  layoutProblems,
  layoutSections,
  type FormSheetLayout,
  type FormSheetLayoutBlock,
  type FormSheetLayoutSection,
  type LayoutProblems,
  type ResolvedLayoutBlock,
  type ResolvedLayoutSection,
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
export { WorkCalendar, type WorkCalendarCategory, type WorkCalendarItem, type WorkCalendarLabels, type WorkCalendarProps, type WorkCalendarStatus, type WorkCalendarView } from "./work-calendar";
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
  type PhoneStepDanger,
  type PhoneStepDefinition,
  type PhoneStepMeasurement,
  type PhoneStepNext,
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
