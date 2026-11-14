import { useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon, TriangleAlertIcon } from "lucide-react";
import { CalendarBody, CalendarProvider, dotBgClass, patternClass, type CalendarItem, type DayHighlight } from "@simplix-react/calendar";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";
import { SegmentedControl } from "@simplix-react/ui/interaction";

import {
  workCalendarAgendaDayStyle,
  workCalendarEmptyStyle,
  workCalendarGroupStyle,
  workCalendarLegendBarStyle,
  workCalendarLegendCaptionStyle,
  workCalendarLegendEntryStyle,
  workCalendarLegendStyle,
  workCalendarLegendSwatchStyle,
  workCalendarOverlayMarksStyle,
  workCalendarReadingStyle,
  workCalendarRuledStyle,
  workCalendarTitleStyle,
  workCalendarTodayStyle,
  workCalendarWarningStyle,
} from "./work-calendar.style";
import { ItemChip, ItemMarks, MonthGrid, WeekBoard, readingOf } from "./work-calendar-boards";
import type { WorkCalendarItem, WorkCalendarProps, WorkCalendarView } from "./work-calendar-types";
import { addMonths, dayOf, endOnStartDay, md, parseAt, rangeOf, startOfMonth, step, titleOf, VIEWS } from "./work-calendar-dates";

/**
 * A schedule read five ways: one day, one week, one month, two months side by side, and an agenda.
 *
 * <p>The day is `@simplix-react/calendar`'s time grid, with each item's marks pinned to its corner;
 * the month is the package's month grid with each cell drawn as chips; two months are two of those
 * grids sharing one header and one legend. The week is seven day columns of the same chips, because
 * work planned by shift fills the whole shift and a time grid would draw a day's plans as slivers;
 * the agenda lists the range day by day. Every item
 * says what it is three ways (its colour bar, its icons and its title) and how it stands two ways
 * (its fill and its state icon), so nothing reads by colour alone, and the legend names every mark.
 * The site's day is tinted and named, and 「오늘」 returns to it rather than to the browser's day.
 */
export function WorkCalendar<T>({ items, categories, statuses, labels, today, view, date, onNavigate, onOpen, switcher }: WorkCalendarProps<T>) {
  const byCategory = useMemo(() => new Map(categories.map((c) => [c.key, c])), [categories]);
  const byStatus = useMemo(() => new Map(statuses.map((s) => [s.key, s])), [statuses]);
  const at = parseAt(date);
  const calendarItems = useMemo<CalendarItem<WorkCalendarItem<T>>[]>(
    () =>
      items.map((item) => {
        const start = parseAt(item.start);
        const pattern = byStatus.get(item.status)?.pattern;
        return {
          id: item.id,
          title: item.title,
          start,
          end: endOnStartDay(start, parseAt(item.end)),
          color: byCategory.get(item.category)?.color ?? "gray",
          pattern: pattern === "dashed" ? "translucent" : pattern,
          payload: item,
        };
      }),
    [items, byCategory, byStatus],
  );
  const highlights = useMemo<DayHighlight[]>(() => [{ date: today, color: "blue", label: labels.today }], [today, labels.today]);
  const { from, to } = rangeOf(view, at);
  const inRange = items.filter((i) => i.start.slice(0, 10) >= dayOf(from) && i.start.slice(0, 10) <= dayOf(to)).sort((a, b) => a.start.localeCompare(b.start));
  const go = (next: Partial<{ view: WorkCalendarView; date: string }>) => onNavigate({ view: next.view ?? view, date: next.date ?? date });
  const pickDay = (day: Date) => go({ view: "day", date: dayOf(day) });
  const open = (item: WorkCalendarItem<T>) => onOpen(item);

  const body = (() => {
    if (view === "month" || view === "two-month") {
      const first = startOfMonth(at);
      const months = view === "two-month" ? [first, addMonths(first, 1)] : [first];
      return (
        <div className={view === "two-month" ? "grid xl:grid-cols-2" : "grid"} {...slotAttributes(workCalendarGroupStyle, { gap: "md" })}>
          {months.map((m) => (
            <MonthGrid key={dayOf(m)} month={m} items={calendarItems} highlights={highlights} categories={byCategory} statuses={byStatus} labels={labels} onOpen={open} onPickDay={pickDay} titled={view === "two-month"} compact={view === "two-month"} />
          ))}
        </div>
      );
    }
    if (view === "week") {
      return (
        <div className="flex flex-col" {...slotAttributes(workCalendarGroupStyle, { gap: "sm" })}>
          {inRange.length === 0 ? <p {...slotAttributes(workCalendarEmptyStyle, { tall: false })}>{labels.empty}</p> : null}
          <WeekBoard from={from} items={inRange} today={today} categories={byCategory} statuses={byStatus} labels={labels} onOpen={open} onPickDay={pickDay} />
        </div>
      );
    }
    if (view === "agenda") {
      if (inRange.length === 0) return <p {...slotAttributes(workCalendarEmptyStyle, { tall: true })}>{labels.empty}</p>;
      const days = [...new Set(inRange.map((i) => i.start.slice(0, 10)))];
      return (
        <div className="flex flex-col" {...slotAttributes(workCalendarGroupStyle, { gap: "md" })}>
          {days.map((day) => (
            <section key={day} className="flex flex-col" {...slotAttributes(workCalendarGroupStyle, { gap: "xs" })}>
              <h3 className="flex items-center" {...slotAttributes(workCalendarAgendaDayStyle, { today: day === today })}>
                {md(parseAt(day))}
                {day === today ? <span {...slotAttributes(workCalendarTodayStyle, { place: "agenda" })}>{labels.today}</span> : null}
              </h3>
              {inRange
                .filter((i) => i.start.startsWith(day))
                .map((i) => (
                  <ItemChip key={i.id} item={i} categories={byCategory} statuses={byStatus} onOpen={open} wide />
                ))}
            </section>
          ))}
        </div>
      );
    }
    return (
      <div className="flex flex-col" {...slotAttributes(workCalendarGroupStyle, { gap: "sm" })}>
        {inRange.length === 0 ? <p {...slotAttributes(workCalendarEmptyStyle, { tall: false })}>{labels.empty}</p> : null}
        <div className="overflow-hidden" {...slotAttributes(workCalendarRuledStyle, {})}>
          <CalendarProvider
            key={`${view}-${date}`}
            items={calendarItems}
            defaultView={view}
            defaultDate={at}
            dayHighlights={highlights}
            showItemCountBadge={false}
            visibleHours={{ from: 6, to: 24 }}
            hourHeight={44}
            onItemClick={(c) => open(c.payload as WorkCalendarItem<T>)}
            renderItemOverlay={(c) => {
              const item = c.payload as WorkCalendarItem<T>;
              return (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={-1} className="inline-flex" {...slotAttributes(workCalendarOverlayMarksStyle, {})}>
                      <ItemMarks item={item} categories={byCategory} statuses={byStatus} />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-72 whitespace-pre-line break-keep" {...partAttributes(workCalendarReadingStyle, {})}>{readingOf(item, byCategory, byStatus)}</TooltipContent>
                </Tooltip>
              );
            }}
          >
            <CalendarBody />
          </CalendarProvider>
        </div>
      </div>
    );
  })();

  return (
    <div className="flex flex-col" {...slotAttributes(workCalendarGroupStyle, { gap: "md" })}>
      <div className="flex flex-wrap items-center justify-between" {...slotAttributes(workCalendarGroupStyle, { gap: "sm" })}>
        <div className="flex flex-wrap items-center" {...slotAttributes(workCalendarGroupStyle, { gap: "sm" })}>
          <Button variant="outline" size="sm" onClick={() => go({ date: today })}>
            {labels.today}
          </Button>
          <span className="inline-flex">
            <Button variant="ghost" size="icon" aria-label={labels.previous} title={labels.previous} onClick={() => go({ date: dayOf(step(view, at, -1)) })}>
              <ChevronLeftIcon />
            </Button>
            <Button variant="ghost" size="icon" aria-label={labels.next} title={labels.next} onClick={() => go({ date: dayOf(step(view, at, 1)) })}>
              <ChevronRightIcon />
            </Button>
          </span>
          <h2 aria-live="polite" {...slotAttributes(workCalendarTitleStyle, {})}>
            {titleOf(view, at)}
          </h2>
        </div>
        {switcher ?? <SegmentedControl label={labels.viewSwitch} options={VIEWS.map((v) => ({ key: v, label: labels.views[v] }))} value={view} onChange={(v) => go({ view: v })} />}
      </div>
      <div className="flex flex-wrap items-center" {...slotAttributes(workCalendarLegendStyle, {})}>
        <span {...slotAttributes(workCalendarLegendCaptionStyle, {})}>{labels.categoriesCaption}</span>
        {categories.map((c) => (
          <span key={c.key} className="inline-flex items-center [&_svg]:size-3.5" {...slotAttributes(workCalendarLegendEntryStyle, {})}>
            <i aria-hidden className={`h-3 w-1 ${dotBgClass(c.color)}`} {...slotAttributes(workCalendarLegendBarStyle, {})} />
            {c.icon}
            {c.label}
          </span>
        ))}
        <span {...slotAttributes(workCalendarLegendCaptionStyle, {})}>{labels.statusesCaption}</span>
        {statuses.map((s) => (
          <span key={s.key} className="inline-flex items-center [&_svg]:size-3.5" {...slotAttributes(workCalendarLegendEntryStyle, {})}>
            <i aria-hidden className={`inline-block h-3 w-5 ${s.pattern && s.pattern !== "dashed" ? patternClass(s.pattern) : ""}`} {...slotAttributes(workCalendarLegendSwatchStyle, { dashed: s.pattern === "dashed" })} />
            {s.icon}
            {s.label}
          </span>
        ))}
        <span className="inline-flex items-center" {...slotAttributes(workCalendarLegendEntryStyle, {})}>
          <TriangleAlertIcon aria-hidden className="size-3.5" {...slotAttributes(workCalendarWarningStyle, {})} />
          {labels.warning}
        </span>
      </div>
      {body}
    </div>
  );
}

export * from "./work-calendar-types";
