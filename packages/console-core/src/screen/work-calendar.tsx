import { type ReactNode, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon, TriangleAlertIcon } from "lucide-react";
import {
  CalendarBody,
  CalendarMonthView,
  CalendarProvider,
  dotBgClass,
  patternClass,
  type CalendarColor,
  type CalendarItem,
  type DayHighlight,
  type EventPattern,
} from "@simplix-react/calendar";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";
import { SegmentedControl } from "@simplix-react/ui/interaction";

import {
  workCalendarAgendaDayStyle,
  workCalendarCellStyle,
  workCalendarChipDetailsStyle,
  workCalendarChipStyle,
  workCalendarChipTimeStyle,
  workCalendarChipTitleStyle,
  workCalendarDayHeadStyle,
  workCalendarDayNumberStyle,
  workCalendarDayStyle,
  workCalendarEmptyStyle,
  workCalendarGroupStyle,
  workCalendarLegendBarStyle,
  workCalendarLegendCaptionStyle,
  workCalendarLegendEntryStyle,
  workCalendarLegendStyle,
  workCalendarLegendSwatchStyle,
  workCalendarMarksStyle,
  workCalendarMonthTitleStyle,
  workCalendarMoreStyle,
  workCalendarOverlayMarksStyle,
  workCalendarReadingStyle,
  workCalendarRuledStyle,
  workCalendarTitleStyle,
  workCalendarTodayStyle,
  workCalendarWarningStyle,
} from "./work-calendar.style";

/** The views a work calendar offers, in the order its switch draws them. */
export type WorkCalendarView = "day" | "week" | "month" | "two-month" | "agenda";

/** A kind of item, told apart by colour and icon, such as a permit type. */
export interface WorkCalendarCategory {
  readonly key: string;
  readonly label: string;
  readonly color: CalendarColor;
  readonly icon: ReactNode;
}

/** A state an item stands in, told apart by its fill pattern and icon, such as 「작업중지」. */
export interface WorkCalendarStatus {
  readonly key: string;
  readonly label: string;
  /** `dashed` draws an outline only, for something not yet settled. */
  readonly pattern?: EventPattern | "dashed";
  readonly icon: ReactNode;
}

/** One planned item, on the site's wall clock. */
export interface WorkCalendarItem<T = unknown> {
  readonly id: string;
  readonly title: string;
  /** `YYYY-MM-DD HH:MM` on the site's clock. */
  readonly start: string;
  /** `YYYY-MM-DD HH:MM`; an end past midnight is drawn on the start day. */
  readonly end: string;
  /** The category that colours the item; the first of `categories` when several apply. */
  readonly category: string;
  /** Every category that applies, each drawn as its icon. */
  readonly categories?: readonly string[];
  readonly status: string;
  /** Why the item needs a look before work, drawn as a warning mark; nothing when it does not. */
  readonly warning?: string;
  /** Lines of the item's reading under the pointer, such as the zone and the company. */
  readonly details: readonly string[];
  readonly payload?: T;
}

/** The words the calendar prints; the screen supplies them in its own language. */
export interface WorkCalendarLabels {
  readonly views: Readonly<Record<WorkCalendarView, string>>;
  /** The name of the view switch, for a screen reader. */
  readonly viewSwitch: string;
  readonly today: string;
  readonly previous: string;
  readonly next: string;
  /** The empty line of a range with nothing planned. */
  readonly empty: string;
  /** 「외 N건」 for the items a month cell has no room for. */
  readonly more: (count: number) => string;
  /** The heading of the warning mark in the legend. */
  readonly warning: string;
  readonly categoriesCaption: string;
  readonly statusesCaption: string;
}

/** Props for {@link WorkCalendar}. */
export interface WorkCalendarProps<T> {
  readonly items: readonly WorkCalendarItem<T>[];
  readonly categories: readonly WorkCalendarCategory[];
  readonly statuses: readonly WorkCalendarStatus[];
  readonly labels: WorkCalendarLabels;
  /** The site's day, `YYYY-MM-DD`; highlighted, and where 「오늘」 returns to. */
  readonly today: string;
  readonly view: WorkCalendarView;
  /** The day the view is drawn around, `YYYY-MM-DD`. */
  readonly date: string;
  readonly onNavigate: (next: { readonly view: WorkCalendarView; readonly date: string }) => void;
  readonly onOpen: (item: WorkCalendarItem<T>) => void;
  /**
   * The view switch drawn at the header's end in place of the calendar's own, for a screen whose
   * switch also offers views that are not the calendar's (its table).
   */
  readonly switcher?: ReactNode;
}

const VIEWS: readonly WorkCalendarView[] = ["day", "week", "month", "two-month", "agenda"];
const MONTH_CHIPS = 3;

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const addDays = (date: Date, days: number): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const addMonths = (date: Date, months: number): Date => new Date(date.getFullYear(), date.getMonth() + months, 1);
const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);
/** Weeks start on Sunday, as the calendar's Korean locale draws them. */
const startOfWeek = (date: Date): Date => addDays(date, -date.getDay());
const isSameDay = (a: Date, b: Date): boolean => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const ym = (date: Date): string => `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
const md = (date: Date): string => `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;

const parseAt = (at: string): Date => {
  const [d, t = "00:00"] = at.split(" ");
  const [y, m, day] = d.split("-").map(Number);
  const [h, mi] = t.split(":").map(Number);
  return new Date(y, m - 1, day, h, mi);
};
const dayOf = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** The end a cell reads: an end past the start day's midnight is pulled back to that day. */
function endOnStartDay(start: Date, end: Date): Date {
  if (end.getTime() <= start.getTime()) return start;
  const last = new Date(start);
  last.setHours(23, 59, 0, 0);
  return end.getTime() > last.getTime() ? last : end;
}

/** The range a view shows around a day, for the header and for what the range holds. */
function rangeOf(view: WorkCalendarView, date: Date): { readonly from: Date; readonly to: Date } {
  if (view === "day") return { from: date, to: date };
  if (view === "week") return { from: startOfWeek(date), to: addDays(startOfWeek(date), 6) };
  const first = startOfMonth(date);
  const months = view === "two-month" ? 2 : 1;
  return { from: first, to: addDays(addMonths(first, months), -1) };
}

/** The day the view moves to, one unit back or forth. */
function step(view: WorkCalendarView, date: Date, by: -1 | 1): Date {
  if (view === "day") return addDays(date, by);
  if (view === "week") return addDays(date, 7 * by);
  return addMonths(date, by * (view === "two-month" ? 2 : 1));
}

/** The header's title for a view's range. */
function titleOf(view: WorkCalendarView, date: Date): string {
  const { from, to } = rangeOf(view, date);
  if (view === "day") return `${date.getFullYear()}년 ${md(date)}`;
  if (view === "week") return `${from.getFullYear()}년 ${from.getMonth() + 1}월 ${from.getDate()}일 ~ ${from.getMonth() === to.getMonth() ? "" : `${to.getMonth() + 1}월 `}${to.getDate()}일`;
  if (view === "two-month") return `${ym(from)} ~ ${from.getFullYear() === to.getFullYear() ? `${to.getMonth() + 1}월` : ym(to)}`;
  return ym(date);
}

/** The icons that say what an item is and how it stands: its categories, its state and its warning. */
function ItemMarks<T>({ item, categories, statuses, primary = false }: { readonly item: WorkCalendarItem<T>; readonly categories: ReadonlyMap<string, WorkCalendarCategory>; readonly statuses: ReadonlyMap<string, WorkCalendarStatus>; readonly primary?: boolean }) {
  const kinds = (primary ? [item.category] : item.categories ?? [item.category]).map((k) => categories.get(k)).filter((c): c is WorkCalendarCategory => Boolean(c));
  return (
    <span aria-hidden className="inline-flex shrink-0 items-center [&_svg]:size-3.5" {...slotAttributes(workCalendarMarksStyle, {})}>
      {kinds.map((c) => (
        <span key={c.key} className="inline-flex">
          {c.icon}
        </span>
      ))}
      <span className="inline-flex">{statuses.get(item.status)?.icon}</span>
      {item.warning ? <TriangleAlertIcon {...slotAttributes(workCalendarWarningStyle, {})} /> : null}
    </span>
  );
}

/** The reading of an item under the pointer and for a screen reader. */
function readingOf<T>(item: WorkCalendarItem<T>, categories: ReadonlyMap<string, WorkCalendarCategory>, statuses: ReadonlyMap<string, WorkCalendarStatus>): string {
  const kinds = (item.categories ?? [item.category]).map((k) => categories.get(k)?.label).filter(Boolean).join(" · ");
  return [item.title, `${item.start.slice(11)}~${item.end.slice(11)} · ${statuses.get(item.status)?.label ?? item.status} · ${kinds}`, ...item.details, ...(item.warning ? [item.warning] : [])].join("\n");
}

/** One item as a line in a month cell or the agenda: a colour bar, the marks and the title. */
function ItemChip<T>({
  item,
  categories,
  statuses,
  onOpen,
  wide = false,
  compact = false,
}: {
  readonly item: WorkCalendarItem<T>;
  readonly categories: ReadonlyMap<string, WorkCalendarCategory>;
  readonly statuses: ReadonlyMap<string, WorkCalendarStatus>;
  readonly onOpen: (item: WorkCalendarItem<T>) => void;
  readonly wide?: boolean;
  /** Marks only, for a cell too narrow for a title: the title is in the reading. */
  readonly compact?: boolean;
}) {
  const color = categories.get(item.category)?.color ?? "gray";
  const pattern = statuses.get(item.status)?.pattern;
  const reading = readingOf(item, categories, statuses);
  const [first, ...rest] = reading.split("\n");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={reading.replace(/\n/g, ", ")}
          onClick={(e) => {
            e.stopPropagation();
            onOpen(item);
          }}
          className={["relative flex min-w-0 items-center overflow-hidden", compact ? "w-auto" : "w-full", pattern && pattern !== "dashed" ? patternClass(pattern) : ""].join(" ")}
          {...slotAttributes(workCalendarChipStyle, { wide, dashed: pattern === "dashed" })}
        >
          <i aria-hidden className={`absolute inset-y-0 left-0 w-1 ${dotBgClass(color)}`} />
          {wide ? <span className="w-24 shrink-0 tabular-nums" {...slotAttributes(workCalendarChipTimeStyle, {})}>{`${item.start.slice(11)}~${item.end.slice(11)}`}</span> : null}
          <ItemMarks item={item} categories={categories} statuses={statuses} primary={compact} />
          {compact ? null : <span className="min-w-0 flex-1 truncate" {...slotAttributes(workCalendarChipTitleStyle, { quiet: statuses.get(item.status)?.pattern === "translucent" })}>{item.title}</span>}
          {wide ? <span className="hidden shrink-0 truncate md:inline" {...slotAttributes(workCalendarChipDetailsStyle, {})}>{item.details.slice(0, 2).join(" · ")}</span> : null}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-72 whitespace-normal break-keep" {...partAttributes(workCalendarReadingStyle, {})}>
        <b className="block">{first}</b>
        {rest.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}

/** One month grid of the package's month view, its cells drawn with the item chips. */
function MonthGrid<T>({
  month,
  items,
  highlights,
  categories,
  statuses,
  labels,
  onOpen,
  onPickDay,
  titled,
  compact,
}: {
  readonly month: Date;
  readonly items: CalendarItem<WorkCalendarItem<T>>[];
  readonly highlights: DayHighlight[];
  readonly categories: ReadonlyMap<string, WorkCalendarCategory>;
  readonly statuses: ReadonlyMap<string, WorkCalendarStatus>;
  readonly labels: WorkCalendarLabels;
  readonly onOpen: (item: WorkCalendarItem<T>) => void;
  readonly onPickDay: (date: Date) => void;
  readonly titled: boolean;
  readonly compact: boolean;
}) {
  const single = useMemo(() => items.filter((i) => isSameDay(i.start, i.end)), [items]);
  const multi = useMemo(() => items.filter((i) => !isSameDay(i.start, i.end)), [items]);
  return (
    <section className="flex min-w-0 flex-col" {...slotAttributes(workCalendarRuledStyle, {})}>
      {titled ? <h3 {...slotAttributes(workCalendarMonthTitleStyle, {})}>{ym(month)}</h3> : null}
      <CalendarProvider
        key={dayOf(month)}
        items={items}
        defaultView="month"
        defaultDate={month}
        dayHighlights={highlights}
        showItemCountBadge={false}
        onCellClick={onPickDay}
        renderDayContent={(_date, inCell) => {
          const shown = compact ? inCell : inCell.slice(0, MONTH_CHIPS);
          return (
            <div className={compact ? "flex flex-wrap" : "flex flex-col"} {...slotAttributes(workCalendarCellStyle, {})}>
              {shown.map((c) => (
                <ItemChip key={c.id} item={c.payload as WorkCalendarItem<T>} categories={categories} statuses={statuses} onOpen={onOpen} compact={compact} />
              ))}
              {inCell.length > shown.length ? <span {...slotAttributes(workCalendarMoreStyle, {})}>{labels.more(inCell.length - shown.length)}</span> : null}
            </div>
          );
        }}
      >
        <CalendarMonthView singleDayItems={single} multiDayItems={multi} />
      </CalendarProvider>
    </section>
  );
}

/** One week as seven day columns, each listing its items in start order with the same chips the month draws. */
function WeekBoard<T>({
  from,
  items,
  today,
  categories,
  statuses,
  labels,
  onOpen,
  onPickDay,
}: {
  readonly from: Date;
  readonly items: readonly WorkCalendarItem<T>[];
  readonly today: string;
  readonly categories: ReadonlyMap<string, WorkCalendarCategory>;
  readonly statuses: ReadonlyMap<string, WorkCalendarStatus>;
  readonly labels: WorkCalendarLabels;
  readonly onOpen: (item: WorkCalendarItem<T>) => void;
  readonly onPickDay: (date: Date) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(from, i));
  return (
    <div className="grid grid-cols-7" {...slotAttributes(workCalendarRuledStyle, {})}>
      {days.map((day) => {
        const key = dayOf(day);
        const own = items.filter((i) => i.start.startsWith(key));
        const isToday = key === today;
        return (
          <section key={key} aria-label={md(day)} className="flex min-w-0 flex-col" {...slotAttributes(workCalendarDayStyle, { today: isToday })}>
            <button type="button" onClick={() => onPickDay(day)} className="flex items-center" {...slotAttributes(workCalendarDayHeadStyle, {})}>
              <span>{WEEKDAYS[day.getDay()]}</span>
              <span {...slotAttributes(workCalendarDayNumberStyle, { today: isToday })}>{day.getDate()}</span>
              {isToday ? <span {...slotAttributes(workCalendarTodayStyle, { place: "week" })}>{labels.today}</span> : null}
            </button>
            {own.map((item) => (
              <ItemChip key={item.id} item={item} categories={categories} statuses={statuses} onOpen={onOpen} />
            ))}
          </section>
        );
      })}
    </div>
  );
}

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
