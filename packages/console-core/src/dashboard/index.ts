// The dashboard's own parts: cards that hold a chart or a list, the two-across row they sit in,
// and the day's schedule. The plots, the legend, the period control and the rolling figure are the
// framework's and are handed on from here, so a screen reaches everything a dashboard draws
// through this one segment.

export { DashboardCard, DashboardColumns, type DashboardCardProps } from "./dashboard-card";
export { TodaySchedule, type ScheduleEntry, type TodayScheduleProps } from "./today-schedule";
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
