import { ChevronRightIcon } from "lucide-react";
import { StatusBadge, type StatusTone } from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";

import { scheduleGoStyle, scheduleRowStyle, taskDueStyle, taskEmptyStyle, taskSideStyle, taskSubStyle, taskTitleStyle } from "./dashboard.style";

/** One thing to handle, as a dashboard card lists it. */
export interface TaskEntry {
  readonly key: string;
  readonly title: string;
  /** Who or what it concerns, under the title. */
  readonly sub?: string;
  /** When it is due, as the workplace prints it. */
  readonly due?: string;
  /** Where it stands, such as the time left. */
  readonly badge?: { readonly label: string; readonly tone?: StatusTone };
  /** Opens the item. */
  readonly onClick: () => void;
}

/** Props for {@link DashboardTaskList}. */
export interface DashboardTaskListProps {
  readonly entries: readonly TaskEntry[];
  /** The line shown when there is nothing to handle. */
  readonly emptyLabel: string;
}

/**
 * The rows of a dashboard card: title and context at the left, the badge and due time at the
 * right, each row opening its item. Rows share the schedule's height and hover so the cards of
 * one dashboard read as one surface.
 */
export function DashboardTaskList({ entries, emptyLabel }: DashboardTaskListProps) {
  if (entries.length === 0) return <p {...slotAttributes(taskEmptyStyle, {})}>{emptyLabel}</p>;
  return (
    <div className="flex flex-col">
      {entries.map((entry) => (
        <button
          key={entry.key}
          type="button"
          onClick={entry.onClick}
          className="group grid h-auto min-h-11 grid-cols-[minmax(0,1fr)_auto_16px] items-center"
          {...slotAttributes(scheduleRowStyle, { dense: true })}
        >
          <span className="flex min-w-0 flex-col">
            <span className="truncate" {...slotAttributes(taskTitleStyle, {})}>
              {entry.title}
            </span>
            {entry.sub ? (
              <span className="truncate" {...slotAttributes(taskSubStyle, {})}>
                {entry.sub}
              </span>
            ) : null}
          </span>
          <span className="flex flex-col items-end" {...slotAttributes(taskSideStyle, {})}>
            {entry.badge ? <StatusBadge tone={entry.badge.tone ?? "neutral"} label={entry.badge.label} appearance="filled" /> : null}
            {entry.due ? <span {...slotAttributes(taskDueStyle, {})}>{entry.due}</span> : null}
          </span>
          <ChevronRightIcon aria-hidden className="size-3.5" {...slotAttributes(scheduleGoStyle, {})} />
        </button>
      ))}
    </div>
  );
}
