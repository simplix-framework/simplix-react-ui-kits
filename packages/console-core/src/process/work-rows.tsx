import { ChevronRightIcon } from "lucide-react";
import { StatusBadge, type StatusTone } from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";

import { workEmptyStyle, workListStyle, workRowGoStyle, workRowStyle, workRowSubStyle, workRowTitleStyle } from "./work-window.style";

/** One record a piece of work made, or one piece of work that follows from it. */
export interface WorkRow {
  readonly key: string;
  readonly title: string;
  /** What kind of record it is, or where it stands, under the title. */
  readonly sub?: string;
  readonly badge?: { readonly label: string; readonly tone?: StatusTone };
  /** Opens the record or the work. A row without it is read only. */
  readonly onOpen?: () => void;
}

/** One thing that was done on a piece of work. */
export interface WorkEvent {
  readonly key: string;
  /** When it was done, as the workplace prints it; left out where the record keeps no time for it. */
  readonly when?: string;
  /** What was done. */
  readonly what: string;
  /** Who did it. */
  readonly who?: string;
  /** The reason or remark it left. */
  readonly note?: string;
}

/** The rows of the records or of the related work: each opens what it names. */
export function WorkRows({ rows, emptyLabel }: { readonly rows: readonly WorkRow[]; readonly emptyLabel: string }) {
  if (rows.length === 0) return <p {...slotAttributes(workEmptyStyle, {})}>{emptyLabel}</p>;
  return (
    <ul className="flex flex-col" {...slotAttributes(workListStyle, {})}>
      {rows.map((row) => {
        const body = (
          <>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate" {...slotAttributes(workRowTitleStyle, {})}>
                {row.title}
              </span>
              {row.sub ? (
                <span className="truncate" {...slotAttributes(workRowSubStyle, {})}>
                  {row.sub}
                </span>
              ) : null}
            </span>
            {row.badge ? <StatusBadge tone={row.badge.tone ?? "neutral"} label={row.badge.label} appearance="filled" /> : null}
            {row.onOpen ? <ChevronRightIcon aria-hidden className="size-3.5 shrink-0" {...slotAttributes(workRowGoStyle, {})} /> : null}
          </>
        );
        return (
          <li key={row.key} data-work-row={row.key}>
            {row.onOpen ? (
              <button type="button" onClick={row.onOpen} className="flex w-full items-center" {...slotAttributes(workRowStyle, { opens: true })}>
                {body}
              </button>
            ) : (
              <div className="flex items-center" {...slotAttributes(workRowStyle, { opens: false })}>
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** What was done on a piece of work, newest first as given. */
export function WorkEvents({ events, emptyLabel }: { readonly events: readonly WorkEvent[]; readonly emptyLabel: string }) {
  if (events.length === 0) return <p {...slotAttributes(workEmptyStyle, {})}>{emptyLabel}</p>;
  return (
    <ol className="flex flex-col" {...slotAttributes(workListStyle, {})}>
      {events.map((event) => (
        <li key={event.key} data-work-event={event.key} className="flex flex-col" {...slotAttributes(workRowStyle, { opens: false })}>
          <span {...slotAttributes(workRowTitleStyle, {})}>{event.what}</span>
          <span {...slotAttributes(workRowSubStyle, {})}>{[event.who, event.when].filter(Boolean).join(" · ")}</span>
          {event.note ? <span {...slotAttributes(workRowSubStyle, {})}>{event.note}</span> : null}
        </li>
      ))}
    </ol>
  );
}
