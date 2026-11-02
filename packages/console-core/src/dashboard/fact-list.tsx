import { slotAttributes } from "@simplix-react/ui/design";

import { factRowStyle, factValueStyle, taskEmptyStyle, taskSubStyle, taskTitleStyle } from "./dashboard.style";

/** One fact a dashboard card states: what it is, and its value. */
export interface FactEntry {
  readonly key: string;
  /** What the value is, such as 「Premium voice」. */
  readonly label: string;
  /** What the value is counted per, under the label, such as 「per character」. */
  readonly sub?: string;
  /** The value as the reader reads it, already worded, such as 「2 credits」. */
  readonly value: string;
}

/** Props for {@link DashboardFactList}. */
export interface DashboardFactListProps {
  /** Words a screen reader hears for the whole list. */
  readonly label: string;
  readonly entries: readonly FactEntry[];
  /** The line shown when there is nothing to state. */
  readonly emptyLabel: string;
}

/**
 * Facts a card states, one to a row: the label and what it is counted per at the start, the value
 * at the end, lined up down the list. A row is read and never pressed, so unlike
 * {@link DashboardTaskList} it has no hover, no chevron and no button; it keeps the task rows'
 * height and words so the cards of one dashboard read as one surface.
 */
export function DashboardFactList({ label, entries, emptyLabel }: DashboardFactListProps) {
  if (entries.length === 0) return <p {...slotAttributes(taskEmptyStyle, {})}>{emptyLabel}</p>;
  return (
    <dl aria-label={label} className="flex flex-col">
      {entries.map((entry) => (
        <div key={entry.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center" {...slotAttributes(factRowStyle, {})}>
          <dt className="flex min-w-0 flex-col">
            <span className="truncate" {...slotAttributes(taskTitleStyle, {})}>
              {entry.label}
            </span>
            {entry.sub ? (
              <span className="truncate" {...slotAttributes(taskSubStyle, {})}>
                {entry.sub}
              </span>
            ) : null}
          </dt>
          <dd {...slotAttributes(factValueStyle, {})}>
            {entry.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
