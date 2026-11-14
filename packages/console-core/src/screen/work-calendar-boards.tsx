import { useMemo } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { CalendarMonthView, CalendarProvider, dotBgClass, patternClass, type CalendarItem, type DayHighlight } from "@simplix-react/calendar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import {
  workCalendarCellStyle,
  workCalendarChipDetailsStyle,
  workCalendarChipStyle,
  workCalendarChipTimeStyle,
  workCalendarChipTitleStyle,
  workCalendarDayHeadStyle,
  workCalendarDayNumberStyle,
  workCalendarDayStyle,
  workCalendarMarksStyle,
  workCalendarMonthTitleStyle,
  workCalendarMoreStyle,
  workCalendarReadingStyle,
  workCalendarRuledStyle,
  workCalendarTodayStyle,
  workCalendarWarningStyle,
} from "./work-calendar.style";
import type { WorkCalendarCategory, WorkCalendarItem, WorkCalendarLabels, WorkCalendarStatus } from "./work-calendar-types";
import { addDays, dayOf, isSameDay, md, MONTH_CHIPS, WEEKDAYS, ym } from "./work-calendar-dates";

/** The icons that say what an item is and how it stands: its categories, its state and its warning. */
export function ItemMarks<T>({ item, categories, statuses, primary = false }: { readonly item: WorkCalendarItem<T>; readonly categories: ReadonlyMap<string, WorkCalendarCategory>; readonly statuses: ReadonlyMap<string, WorkCalendarStatus>; readonly primary?: boolean }) {
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
export function readingOf<T>(item: WorkCalendarItem<T>, categories: ReadonlyMap<string, WorkCalendarCategory>, statuses: ReadonlyMap<string, WorkCalendarStatus>): string {
  const kinds = (item.categories ?? [item.category]).map((k) => categories.get(k)?.label).filter(Boolean).join(" · ");
  return [item.title, `${item.start.slice(11)}~${item.end.slice(11)} · ${statuses.get(item.status)?.label ?? item.status} · ${kinds}`, ...item.details, ...(item.warning ? [item.warning] : [])].join("\n");
}

/** One item as a line in a month cell or the agenda: a colour bar, the marks and the title. */
export function ItemChip<T>({
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
export function MonthGrid<T>({
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
export function WeekBoard<T>({
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
