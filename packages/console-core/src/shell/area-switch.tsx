import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Flex } from "@simplix-react/ui";
import { areaInkStyle, areaSwitchStyle, areaTabStyle } from "./area-switch.style";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

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

/** Where the ink sits: the current tab's box inside the strip, measured after layout. */
interface InkBox {
  readonly left: number;
  readonly top: number;
  readonly width: number;
}

/**
 * The row that says which area of the console the reader is in, and moves them to another.
 *
 * <p><b>Not `PageTabStrip`, and not `Tabs`.</b> Those triggers read a Radix `Tabs` root, and an
 * area switch has none: it drives the whole console rather than a panel on one screen, and the
 * address is what says which area is current. So the row is buttons and the mark on the current
 * one is a rule under it, written here once rather than per shell.
 *
 * <p><b>The rule is one element that moves.</b> It is measured against the current tab after every
 * layout and slides to the next tab when the reader picks one, so the eye follows the change
 * instead of finding the mark again. Left and right arrows move along the strip as they do along
 * any tab list, and only the current tab is in the page's tab order.
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
  const strip = useRef<HTMLDivElement>(null);
  const [ink, setInk] = useState<InkBox | null>(null);

  useLayoutEffect(() => {
    const host = strip.current;
    if (!host) return;
    const measure = () => {
      const tab = host.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (!tab) return setInk(null);
      // Read as fractions: a tab's width is rarely whole, and a rounded one leaves the ink a pixel
      // short of the tab it marks.
      const box = tab.getBoundingClientRect();
      const origin = host.getBoundingClientRect();
      setInk({ left: box.left - origin.left - host.clientLeft, top: box.bottom - origin.top - host.clientTop, width: box.width });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    // A web font arriving late changes every tab's width after the first measure.
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [current, areas]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const tabs = Array.from(strip.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
    const at = tabs.indexOf(event.currentTarget);
    if (at < 0) return;
    const next = tabs[(at + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    event.preventDefault();
    next.click();
    next.focus();
  };

  return (
    <Flex
      ref={strip}
      gap="none"
      align="stretch"
      wrap
      className="relative min-h-9"
      role="tablist"
      {...partAttributes(areaSwitchStyle, {})}
    >
      {areas.map((area) => (
        <button
          key={area.key}
          type="button"
          role="tab"
          aria-selected={area.key === current}
          tabIndex={area.key === current ? 0 : -1}
          onClick={() => onSelect(area.key)}
          onKeyDown={onKeyDown}
          className="whitespace-nowrap min-h-11 md:min-h-0"
          {...slotAttributes(areaTabStyle, { current: area.key === current })}
        >
          {area.label}
        </button>
      ))}
      {ink && (
        <span
          aria-hidden
          className="pointer-events-none absolute -translate-y-full"
          style={{ left: ink.left, top: ink.top, width: ink.width }}
          {...slotAttributes(areaInkStyle, {})}
        />
      )}
    </Flex>
  );
}
