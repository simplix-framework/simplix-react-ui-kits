import type { ReactNode } from "react";
import type { CalendarColor, EventPattern } from "@simplix-react/calendar";

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
