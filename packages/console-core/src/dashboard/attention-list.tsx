import { ChevronRightIcon, CircleAlertIcon, CircleHelpIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";
import { slotAttributes } from "@simplix-react/ui/design";

import type { DismissibleNoticeKind } from "../notice/notice-kind";

import { attentionGlyphStyle, attentionRowStyle } from "./attention-list.style";
import { chartEmptyStyle } from "./chart.style";
import { scheduleGoStyle, taskSubStyle, taskTitleStyle } from "./dashboard.style";

/** One page notice as the dashboard collects it: raised by a state on the screen it names. */
export interface AttentionEntry {
  readonly key: string;
  readonly kind: DismissibleNoticeKind;
  /** What needs attention, as the screen's own notice says it (「3 payment events failed」). */
  readonly title: string;
  /** The screen the notice stands on, under the title. */
  readonly sub?: string;
  /** Whether the state that raises the notice holds; an entry whose state does not is not drawn. */
  readonly when: boolean;
  /** Opens the screen the notice stands on, narrowed to what it counts. */
  readonly onClick?: () => void;
}

const KIND_ORDER: Readonly<Record<DismissibleNoticeKind, number>> = { danger: 0, warning: 1, info: 2, help: 3 };

const KIND_ICON = { danger: CircleAlertIcon, warning: TriangleAlertIcon, info: InfoIcon, help: CircleHelpIcon } as const;

/**
 * The entries whose state holds, loudest first and otherwise in their declared order.
 *
 * @param entries every notice the dashboard collects
 */
export function raisedAttention(entries: readonly AttentionEntry[]): AttentionEntry[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.when)
    .sort((a, b) => KIND_ORDER[a.entry.kind] - KIND_ORDER[b.entry.kind] || a.index - b.index)
    .map(({ entry }) => entry);
}

/** Props for {@link AttentionList}. */
export interface AttentionListProps {
  readonly entries: readonly AttentionEntry[];
  /** What the list says when nothing is raised. */
  readonly emptyLabel: string;
}

/**
 * Every page notice raised right now, one row each, act-now first, each opening the screen it
 * stands on. A notice whose state does not hold is not listed, so a quiet installation shows the
 * empty line rather than a list of all-clear rows.
 */
export function AttentionList({ entries, emptyLabel }: AttentionListProps) {
  const raised = raisedAttention(entries);
  if (raised.length === 0) return <p {...slotAttributes(chartEmptyStyle, {})}>{emptyLabel}</p>;
  return (
    <ul className="flex flex-col">
      {raised.map((entry) => {
        const Icon = KIND_ICON[entry.kind];
        return (
          <li key={entry.key}>
            <button
              type="button"
              onClick={entry.onClick}
              disabled={!entry.onClick}
              className="group grid w-full grid-cols-[auto_minmax(0,1fr)_16px] items-center"
              {...slotAttributes(attentionRowStyle, {})}
            >
              <Icon aria-hidden {...slotAttributes(attentionGlyphStyle, { kind: entry.kind })} />
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
              {entry.onClick ? <ChevronRightIcon aria-hidden className="size-3.5" {...slotAttributes(scheduleGoStyle, {})} /> : <span aria-hidden />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
