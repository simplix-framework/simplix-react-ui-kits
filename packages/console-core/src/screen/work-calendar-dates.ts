import type { WorkCalendarView } from "./work-calendar-types";

export const VIEWS: readonly WorkCalendarView[] = ["day", "week", "month", "two-month", "agenda"];
export const MONTH_CHIPS = 3;

export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export const addDays = (date: Date, days: number): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export const addMonths = (date: Date, months: number): Date => new Date(date.getFullYear(), date.getMonth() + months, 1);

export const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

/** Weeks start on Sunday, as the calendar's Korean locale draws them. */
const startOfWeek = (date: Date): Date => addDays(date, -date.getDay());

export const isSameDay = (a: Date, b: Date): boolean => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const ym = (date: Date): string => `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

export const md = (date: Date): string => `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;

export const parseAt = (at: string): Date => {
  const [d, t = "00:00"] = at.split(" ");
  const [y, m, day] = d.split("-").map(Number);
  const [h, mi] = t.split(":").map(Number);
  return new Date(y, m - 1, day, h, mi);
};

export const dayOf = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** The end a cell reads: an end past the start day's midnight is pulled back to that day. */
export function endOnStartDay(start: Date, end: Date): Date {
  if (end.getTime() <= start.getTime()) return start;
  const last = new Date(start);
  last.setHours(23, 59, 0, 0);
  return end.getTime() > last.getTime() ? last : end;
}

/** The range a view shows around a day, for the header and for what the range holds. */
export function rangeOf(view: WorkCalendarView, date: Date): { readonly from: Date; readonly to: Date } {
  if (view === "day") return { from: date, to: date };
  if (view === "week") return { from: startOfWeek(date), to: addDays(startOfWeek(date), 6) };
  const first = startOfMonth(date);
  const months = view === "two-month" ? 2 : 1;
  return { from: first, to: addDays(addMonths(first, months), -1) };
}

/** The day the view moves to, one unit back or forth. */
export function step(view: WorkCalendarView, date: Date, by: -1 | 1): Date {
  if (view === "day") return addDays(date, by);
  if (view === "week") return addDays(date, 7 * by);
  return addMonths(date, by * (view === "two-month" ? 2 : 1));
}

/** The header's title for a view's range. */
export function titleOf(view: WorkCalendarView, date: Date): string {
  const { from, to } = rangeOf(view, date);
  if (view === "day") return `${date.getFullYear()}년 ${md(date)}`;
  if (view === "week") return `${from.getFullYear()}년 ${from.getMonth() + 1}월 ${from.getDate()}일 ~ ${from.getMonth() === to.getMonth() ? "" : `${to.getMonth() + 1}월 `}${to.getDate()}일`;
  if (view === "two-month") return `${ym(from)} ~ ${from.getFullYear() === to.getFullYear() ? `${to.getMonth() + 1}월` : ym(to)}`;
  return ym(date);
}
