import type { ReactNode } from "react";
import { Flex } from "@simplix-react/ui";

/** One area in the switch. */
export interface ConsoleArea {
  /** What identifies it, handed back when the reader picks it. */
  readonly key: string;
  /** What the row prints. */
  readonly label: ReactNode;
}

/** Props for {@link ConsoleAreaSwitch}. */
export interface ConsoleAreaSwitchProps {
  /** The areas, in the order they are drawn. */
  readonly areas: readonly ConsoleArea[];
  /** Which one the console is inside. */
  readonly current: string;
  /** Moves the console to another area. */
  readonly onSelect: (key: string) => void;
}

/**
 * The row that says which area of the console the reader is in, and moves them to another.
 *
 * <p><b>Not `PageTabStrip`, and not `Tabs`.</b> Those triggers read a Radix `Tabs` root, and an
 * area switch has none: it drives the whole console rather than a panel on one screen, and the
 * address is what says which area is current. So the row is buttons and the mark on the current
 * one is a rule under it, written here once rather than per shell.
 *
 * <p><b>It wraps rather than scrolling sideways.</b> An area carried out of view behind a scrollbar
 * is a destination the reader cannot see they have, and the console's whole top level lives in this
 * row. The gap is down and not across, because the mark under the current area lands on the row
 * below when the lines are flush and reads as belonging to it.
 *
 * <p><b>The touch height is dropped from a tablet up.</b> Below that a finger has to hit these, and
 * a row of desktop-height targets is a console that works with a mouse and misses with a hand.
 */
export function ConsoleAreaSwitch({ areas, current, onSelect }: ConsoleAreaSwitchProps) {
  return (
    <Flex gap="none" align="stretch" wrap className="min-h-9 gap-y-1" role="tablist">
      {areas.map((area) => (
        <button
          key={area.key}
          type="button"
          role="tab"
          aria-selected={area.key === current}
          onClick={() => onSelect(area.key)}
          className={`whitespace-nowrap px-3 text-sm min-h-11 md:min-h-0 ${
            area.key === current
              ? "border-b-2 border-primary font-medium"
              : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {area.label}
        </button>
      ))}
    </Flex>
  );
}
