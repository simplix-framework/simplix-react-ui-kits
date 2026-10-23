import { Fragment } from "react";
import { ChevronRightIcon, MapPinIcon } from "lucide-react";
import { StatusBadge, type StatusTone } from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";

import {
  scheduleGoStyle,
  scheduleNowStyle,
  scheduleRowStyle,
  scheduleTaskStyle,
  scheduleTimeStyle,
  scheduleZoneStyle,
} from "./dashboard.style";

/** One entry of the day. */
export interface ScheduleEntry {
  readonly key: string;
  /** Start time as `HH:MM`, in the workplace's own clock. */
  readonly time: string;
  readonly task: string;
  readonly zone: string;
  /** Where the entry stands, as a pill. */
  readonly state: string;
  readonly tone: StatusTone;
  /** Opens the entry. */
  readonly onClick: () => void;
}

/** Props for {@link TodaySchedule}. */
export interface TodayScheduleProps {
  readonly entries: readonly ScheduleEntry[];
  /** The current time as `HH:MM`; the rule is drawn before the first entry still to come. */
  readonly now: string;
  /** How the rule is announced, such as 「지금 10:41」. */
  readonly nowLabel: string;
}

/**
 * The day's entries in time order, with a rule at the current time.
 *
 * <p>Entries before the rule have started and are drawn muted; the ones after it are still to
 * come. `HH:MM` strings compare in time order, so no clock parsing is involved.
 */
export function TodaySchedule({ entries, now, nowLabel }: TodayScheduleProps) {
  const sorted = [...entries].sort((a, b) => a.time.localeCompare(b.time));
  const at = sorted.findIndex((e) => e.time > now);
  const nowAt = at < 0 ? sorted.length : at;
  const rule = (
    <div role="separator" aria-label={nowLabel} className="flex h-[18px] items-center after:flex-1 after:content-['']" {...slotAttributes(scheduleNowStyle, {})}>
      {now}
    </div>
  );
  return (
    <div className="flex flex-col">
      {sorted.map((entry, i) => {
        const past = entry.time < now;
        return (
          <Fragment key={entry.key}>
            {i === nowAt && rule}
            <button
              type="button"
              onClick={entry.onClick}
              className="group grid grid-cols-[56px_minmax(0,1fr)_140px_104px_16px] items-center"
              {...slotAttributes(scheduleRowStyle, { past })}
            >
              <span {...slotAttributes(scheduleTimeStyle, {})}>{entry.time}</span>
              <span className="truncate" {...slotAttributes(scheduleTaskStyle, { past })}>
                {entry.task}
              </span>
              <span className="flex items-center" {...slotAttributes(scheduleZoneStyle, {})}>
                <MapPinIcon aria-hidden className="size-[13px]" />
                {entry.zone}
              </span>
              <span className="justify-self-start">
                <StatusBadge tone={entry.tone} label={entry.state} appearance="filled" />
              </span>
              <ChevronRightIcon aria-hidden className="size-3.5" {...slotAttributes(scheduleGoStyle, {})} />
            </button>
          </Fragment>
        );
      })}
      {nowAt === sorted.length && rule}
    </div>
  );
}
