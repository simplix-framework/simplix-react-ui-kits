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
export { chipFilterValues } from "./chip-filter-values";
export { FeatureLock } from "./feature-lock";
export { HistoryRail, type HistoryLane, type HistoryNode, type HistoryNodeState } from "./history-rail";
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
export { ReadOnlyBanner, type ReadOnlyMode } from "./read-only-banner";
export { Roster, type RosterCell, type RosterCellTone, type RosterColumn, type RosterRow } from "./roster";
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
export { useOnline } from "./use-online";
export type { TargetBarProps, TargetBarRow } from "./target-bar";
