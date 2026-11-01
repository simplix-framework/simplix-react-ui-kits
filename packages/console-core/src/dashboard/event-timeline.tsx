import type { CSSProperties } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { type MarkTone, markColor } from "./chart-tip";
import { eventAxisStyle, eventLabelStyle, eventMarkStyle, eventTimelineStyle } from "./figure-parts.style";

/** One instant in a record's history: granted, withdrawn, renewed. */
export interface TimelineEvent {
  readonly key: string;
  /** The instant, as an ISO 8601 string. */
  readonly at: string;
  /** What happened, under the mark. */
  readonly label: string;
  /** The instant as the reader reads it, under the pointer and to a screen reader. */
  readonly when: string;
  readonly tone?: MarkTone;
}

/**
 * Where each instant stands along the axis, in percent from its start, between the earliest and the
 * latest (or `from` and `to` where given). One instant alone stands in the middle; an instant that
 * does not parse stands at the start.
 *
 * @param events the instants
 * @param from the axis's start, where it is not the earliest instant
 * @param to the axis's end, where it is not the latest instant
 */
export function timelinePositions(events: readonly Pick<TimelineEvent, "at">[], from?: string, to?: string): number[] {
  const times = events.map((one) => Date.parse(one.at));
  const known = times.filter((time) => Number.isFinite(time));
  if (known.length === 0) return events.map(() => 0);
  const start = from ? Date.parse(from) : Math.min(...known);
  const end = to ? Date.parse(to) : Math.max(...known);
  if (!(end > start)) return events.map(() => 50);
  return times.map((time) => (Number.isFinite(time) ? Math.min(100, Math.max(0, ((time - start) / (end - start)) * 100)) : 0));
}

/**
 * How a label sits against its mark: centred, or held inside the axis near either end.
 *
 * @param position the mark's place along the axis, in percent
 */
export function labelAlign(position: number): "start" | "middle" | "end" {
  if (position < 12) return "start";
  if (position > 88) return "end";
  return "middle";
}

/** Props for {@link EventTimeline}. */
export interface EventTimelineProps {
  /** What the history is of, for a screen reader. */
  readonly label: string;
  readonly events: readonly TimelineEvent[];
  readonly from?: string;
  readonly to?: string;
}

/**
 * A record's instants placed along one time axis, so the gaps between them read as time: a consent
 * granted, withdrawn months later and granted again. Each mark is coloured by what happened.
 */
export function EventTimeline({ label, events, from, to }: EventTimelineProps) {
  const positions = timelinePositions(events, from, to);
  return (
    <div role="list" aria-label={label} {...slotAttributes(eventTimelineStyle, {})}>
      <span aria-hidden {...slotAttributes(eventAxisStyle, {})} />
      {events.map((one, index) => (
        <span role="listitem" key={one.key} aria-label={`${one.label} · ${one.when}`}>
          <span
            title={one.when}
            style={{ left: `${positions[index] ?? 0}%`, "--mark": markColor(one.tone ?? "accent") } as CSSProperties}
            {...slotAttributes(eventMarkStyle, {})}
          />
          <span aria-hidden style={{ left: `${positions[index] ?? 0}%` }} {...slotAttributes(eventLabelStyle, { align: labelAlign(positions[index] ?? 0) })}>
            {one.label}
          </span>
        </span>
      ))}
    </div>
  );
}
