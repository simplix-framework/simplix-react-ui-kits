import type { ReactNode } from "react";
import { useMemo } from "react";
import { CalendarProvider, CalendarShell } from "@simplix-react/calendar";
import type { CalendarColor, CalendarItem, CalendarView, DayHighlight } from "@simplix-react/calendar";
import { decodeInstant } from "@simplix-react/ui";
import { Stack } from "@simplix-react/ui";

import { useAppTimeZone } from "../datetime";

/** One thing planned, as the screen that owns it knows it. */
export interface ScheduleEntry<T = unknown> {
  /** Stable key, and what a click hands back. */
  readonly id: string;
  /** What it is, in the words its own list uses. */
  readonly title: string;
  /** When it starts, as an absolute instant (RFC 3339). */
  readonly startsAt: string;
  /**
   * When it ends, as an absolute instant. Omitted for something with no duration.
   *
   * <p><b>An overnight entry still belongs to one cell.</b> The board splits nothing across
   * midnight — see the note on the component.
   */
  readonly endsAt?: string;
  /** How it should read against the others on the same day. */
  readonly tone?: CalendarColor;
  /** The record this was made from, handed back untouched on a click. */
  readonly payload?: T;
}

/** A day nobody is working, and why. */
export interface NonWorkingDay {
  /** `yyyy-MM-dd`, in the site's own calendar rather than the browser's. */
  readonly date: string;
  /** Why it is not a working day — a holiday's name, a shift that does not run. */
  readonly label: string;
}

/** The four ways the same set is read. The order is the order the switcher draws them in. */
const VIEWS: readonly CalendarView[] = ["month", "week", "day", "agenda"];

interface ScheduleBoardProps<T> {
  readonly entries: readonly ScheduleEntry<T>[];
  /** Holidays and closed shifts, so nothing gets planned onto a day nobody is there. */
  readonly nonWorkingDays?: readonly NonWorkingDay[];
  /** Which view the board opens on. @defaultValue "month" */
  readonly defaultView?: CalendarView;
  /** Which month the board opens on. Defaults to the site's today. */
  readonly defaultDate?: Date;
  /** Opens one entry. */
  readonly onOpenEntry?: (entry: ScheduleEntry<T>) => void;
  /** Starts a new entry on an empty day. */
  readonly onPickDay?: (date: Date) => void;
  /** What sits after the view switcher — 「일정 추가」, 「목록으로 보기」, 「내보내기」. */
  /**
   * What sits at the end of the calendar's own header line, beside the view switch — the chips
   * that narrow which entries are drawn, a colour legend.
   *
   * <p>On the header rather than above the board because the view switch IS this screen's strip:
   * a chip row drawn over it would read as a second strip, with nothing saying which of the two
   * the reader is inside.
   */
  readonly trailing?: ReactNode;
}

/**
 * 캘린더 · 일정 보드 (P-26) — a month as a surface work is put onto, rather than a picture of dates.
 *
 * <p><b>The framework's calendar draws it; this decides what a day is.</b> `@simplix-react/ui`'s
 * `Calendar` is a date picker — it selects a day and cannot carry anything in one — so the month
 * grid, the week and day grids and the agenda all come from `@simplix-react/calendar`. What is
 * added here is the one thing that package cannot know: which clock the days are counted on.
 *
 * <p><b>「오늘」 is the site's, never the browser's.</b> A `CalendarItem` holds the display wall
 * clock in a `Date`'s LOCAL fields, so an instant handed straight to the calendar lands in
 * whichever cell the reader's laptop happens to be in — an operator abroad, or a reader whose
 * machine is on UTC, sees the night shift on the wrong day. Every entry is decoded against the
 * site's zone here so no screen has to remember to.
 *
 * <p><b>An overnight entry sits in its start day's cell, once.</b> A patrol beginning 22:00 and
 * ending 06:00 is one job on the 11th, not a mark on the 11th and another on the 12th: the permit,
 * the handover and the shift all count it from when it started, and a board that split it would
 * disagree with all three. The end instant is therefore clamped to the start day.
 *
 * <p><b>A day nobody works says so.</b> Holidays and closed shifts are drawn on the cell, because
 * a board that draws only what is planned lets somebody plan onto a day the site is shut.
 *
 * <p><b>The calendar is the list's alternative, not its replacement.</b> The same records have to
 * remain readable as a list — finding what is overdue is a list's job — so a screen mounting this
 * keeps its list view reachable from the same header.
 */
export function ScheduleBoard<T>({
  entries,
  nonWorkingDays = [],
  defaultView = "month",
  defaultDate,
  onOpenEntry,
  onPickDay,
  trailing,
}: ScheduleBoardProps<T>) {
  const zone = useAppTimeZone();

  const items = useMemo<CalendarItem<ScheduleEntry<T>>[]>(
    () =>
      entries.flatMap((entry) => {
        // `decodeInstant(value, zone)` returns a carrier whose LOCAL fields hold the zone's wall
        // clock, which is exactly what a CalendarItem wants. Reading the instant's own fields
        // instead would put the entry in the browser's day.
        const start = decodeInstant(entry.startsAt, zone);
        if (!start) return [];
        const declaredEnd = entry.endsAt ? (decodeInstant(entry.endsAt, zone) ?? null) : null;
        return [
          {
            id: entry.id,
            title: entry.title,
            start,
            end: clampToStartDay(start, declaredEnd),
            color: entry.tone ?? "blue",
            payload: entry,
          },
        ];
      }),
    [entries, zone],
  );

  const highlights = useMemo<DayHighlight[]>(
    () => nonWorkingDays.map((day) => ({ date: day.date, color: "gray", label: day.label })),
    [nonWorkingDays],
  );

  return (
    <Stack fill minSize>
      <CalendarProvider
        items={items}
        dayHighlights={highlights}
        defaultView={defaultView}
        defaultDate={defaultDate}
        onItemClick={(item) => onOpenEntry?.(item.payload as ScheduleEntry<T>)}
        onCellClick={(date) => onPickDay?.(date)}
      >
        <CalendarShell views={[...VIEWS]} trailing={trailing} />
      </CalendarProvider>
    </Stack>
  );
}

/**
 * The end a calendar cell should read, given the start it belongs to.
 *
 * <p>An end that crosses midnight is pulled back to the last instant of the start day, so the
 * month grid draws one mark. An end before its start, or none at all, becomes the start.
 */
function clampToStartDay(start: Date, end: Date | null): Date {
  if (!end || end.getTime() <= start.getTime()) return start;
  const dayEnd = new Date(start);
  dayEnd.setHours(23, 59, 59, 999);
  return end.getTime() > dayEnd.getTime() ? dayEnd : end;
}
