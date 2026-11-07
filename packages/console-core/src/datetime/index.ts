export { useAppTimeZone, getAppTimeZone, configureAppTimeZone, APP_TIME_ZONE } from "@simplix-react/headless";
export { browserZoneLabel, withBrowserZone, zoneLabel } from "@simplix-react/headless";
// **Everything the zone helpers hold, not the four that happened to be re-exported.** Nineteen are
// written here and six reached the barrel, and the six were exactly the six with importers anywhere
// in the tree — the correlation is perfect because it is causal. `zoneCalendarDate` is written here
// character for character as six screens hand-rolled it; they did not skip the helper, they could
// not reach it. A rule telling a screen to use this module while the module refuses the import
// blames the screen for the barrel.
export {
  zoneClockOf,
  zoneDateTimeText,
  zoneDayOf,
  zoneInstantAt,
  zoneInstantOnDayOf,
  zoneTimeOf,
  isSameZoneDay,
  timeAtOrAfter,
  timePlusHours,
} from "@simplix-react/headless";
export { daysUntilDay } from "@simplix-react/headless";
export {
  calendarDayLabel,
  pickedCalendarDay,
  zoneCalendarDate,
  zoneDayRange,
  zoneDayShifted,
  zoneDayStartInstant,
  zoneLastDaysRange,
  zoneMonthRange,
  zonePickedDayRange,
  zonePickedMonthRange,
  zonePickedWeekRange,
  zoneWeekRange,
} from "@simplix-react/headless";
export type { CalendarDayStyle } from "@simplix-react/headless";
export { committedWindow, conditionsWithoutWindow, ListTimeRange, readCounts, useTimeWindowPresets, windowCommit, windowKeysOf } from "./list-time-range";
export { PageTimeRange } from "./page-time-range";
export type { PageTimeRangeSlot } from "./page-time-range";
export type { ListTimeRangeProps, TimeRangeCountQuery } from "./list-time-range";
export { daysAgoText } from "./days-ago-text";
export { usePageOpenedAt, useZoneRange } from "./page-time";
// Today and a rolling window, each held by the framework and moved on as the clock turns.
export { useRollingWindow, useZoneToday } from "@simplix-react/headless";
export type { ZoneRangeKind } from "./page-time";
export { RemainingText } from "./remaining-text";
export type { RemainingTextProps } from "./remaining-text";
export { periodStanding } from "@simplix-react/headless";
export type { PeriodStanding } from "@simplix-react/headless";
export { elapsedSpan, elapsedSpanBetween, elapsedSpanOf } from "@simplix-react/headless";
export type { ElapsedSpan, ElapsedUnit } from "@simplix-react/headless";
