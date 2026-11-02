// The dashboard's own parts: cards that hold a chart or a list, the two-across row they sit in,
// the day's schedule, and the small charts a block leads with: the stage bar, the progress ring,
// the risk table, the overdue list, the sparkline and the block's figure. The plots, the legend,
// the period control and the rolling figure are the framework's and are handed on from here, so a
// screen reaches everything a dashboard draws through this one segment.

export { DashboardCard, DashboardColumns, type DashboardCardProps } from "./dashboard-card";
export {
  DASHBOARD_SPANS,
  DashboardGrid,
  dashboardColumnsThatFit,
  dashboardRowProblems,
  dashboardRows,
  spanAt,
  useDashboardGridColumns,
  type DashboardColumnCount,
  type DashboardGridProps,
  type DashboardSpan,
} from "./dashboard-grid";
export {
  DashboardBlockGrid,
  DashboardBlockHead,
  DashboardSection,
  DashboardSplit,
  DashboardStack,
  DashboardTipLines,
  type DashboardBlockGridProps,
  type DashboardBlockHeadProps,
  type DashboardGap,
  type DashboardSectionProps,
  type DashboardSplitProps,
  type DashboardStackProps,
  type DashboardTipLine,
  type DashboardTipLinesProps,
} from "./dashboard-layout";
export { TodaySchedule, type ScheduleEntry, type TodayScheduleProps } from "./today-schedule";
export { DashboardTaskList, type DashboardTaskListProps, type TaskEntry } from "./task-list";
export { DashboardFactList, type DashboardFactListProps, type FactEntry } from "./fact-list";
export { DashboardCaption, DashboardEmpty, DashboardFigure, DashboardSkeleton, type DashboardFigureProps } from "./dashboard-figure";
export { DashboardReadState, dashboardReadStage, type DashboardReadStage, type DashboardReadStateProps } from "./dashboard-read-state";
export { axisDayLabel, sparseLabels, sumByCategory, sumsByKey } from "./chart-model";
export { StageFlowBar, type FlowStageCount, type StageFlowBarProps } from "./stage-flow-bar";
export { ProgressRing, type ProgressRingProps } from "./progress-ring";
export { RiskRows, type RiskCell, type RiskColumn, type RiskRowEntry, type RiskRowsProps } from "./risk-rows";
export { OverdueList, type OverdueEntry, type OverdueListProps } from "./overdue-list";
export { AttentionList, raisedAttention, type AttentionEntry, type AttentionListProps } from "./attention-list";
export { Sparkline, type SparklineProps } from "./sparkline";
export { ObligationMatrix, type ObligationCell, type ObligationMatrixProps, type ObligationRow, type ObligationState } from "./obligation-matrix";
export { MeterList, type MeterEntry, type MeterListProps } from "./meter-list";
export { markColor, type MarkTone } from "./chart-tip";
export {
  DigitRoll,
  LegendToggle,
  PlotTooltipRow,
  SegmentedControl,
  StackedColumnChart,
  TrendLineChart,
  useSeriesVisibility,
  type LegendSeries,
  type PlotFill,
  type SegmentedControlOption,
  type StackedColumnSeries,
  type TrendLineSeries,
} from "@simplix-react/ui/interaction";
export { SegmentBar, segmentShares, type Segment, type SegmentBarProps } from "./segment-bar";
export { OutcomeStrip, outcomeTally, type Outcome, type OutcomeStripProps, type OutcomeTone } from "./outcome-strip";
export { ThresholdGauge, gaugePoint, gaugeTone, type GaugeTone, type ThresholdGaugeProps } from "./threshold-gauge";
export { StateMatrix, matrixCells, type StateMatrixCell, type StateMatrixProps } from "./state-matrix";
export { EventTimeline, labelAlign, timelinePositions, type EventTimelineProps, type TimelineEvent } from "./event-timeline";
