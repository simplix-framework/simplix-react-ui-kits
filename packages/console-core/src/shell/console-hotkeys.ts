import { useEffect, useRef } from "react";

/** What the console's keys reach. Each is optional; an absent one leaves its key unbound. */
export interface ConsoleHotkeyActions {
  /** ⌘K or Ctrl+K, anywhere, even while typing: opens the palette, or closes it. */
  readonly togglePalette: () => void;
  /** 「/」: the screen's own search field when it has one, the palette otherwise. */
  readonly openPalette: () => void;
  /** 「[」: collapses the menu column to a rail, or expands it. */
  readonly toggleRail?: () => void;
  /** 「?」: the list of these keys. */
  readonly showShortcuts?: () => void;
  /** 「G」 then a letter, within {@link CHORD_WINDOW_MS}: the destination that letter names. */
  readonly go?: Readonly<Record<string, () => void>>;
}

/** How long after 「G」 the second key of a go-to chord is still read as one. */
export const CHORD_WINDOW_MS = 900;

/** Whether the key landed in something the reader types into. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.closest("input, textarea, select, [contenteditable='true']") !== null;
}

/** The screen's own search field: the first search input in the content column. */
function screenSearch(): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>('main input[type="search"], main [role="search"] input');
}

/**
 * Binds the console's keyboard shortcuts on the document for as long as the caller is mounted.
 *
 * <p>Nothing but ⌘K fires while the reader is typing, holding a modifier, or inside an open dialog,
 * so a letter typed into a field or a dialog is never taken for a command.
 */
export function useConsoleHotkeys(actions: ConsoleHotkeyActions): void {
  const latest = useRef(actions);
  latest.current = actions;

  useEffect(() => {
    let pendingG = 0;
    const onKeyDown = (event: KeyboardEvent) => {
      const a = latest.current;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        a.togglePalette();
        return;
      }
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target) || document.querySelector('[role="dialog"][data-state="open"]')) return;

      if (pendingG && Date.now() - pendingG < CHORD_WINDOW_MS) {
        pendingG = 0;
        const go = a.go?.[event.key.toLowerCase()];
        if (go) {
          event.preventDefault();
          go();
          return;
        }
      }
      if (event.key === "g") {
        pendingG = Date.now();
        return;
      }
      if (event.key === "?" && a.showShortcuts) {
        event.preventDefault();
        a.showShortcuts();
        return;
      }
      if (event.key === "[" && a.toggleRail) {
        event.preventDefault();
        a.toggleRail();
        return;
      }
      if (event.key === "/") {
        event.preventDefault();
        const search = screenSearch();
        if (search) search.focus();
        else a.openPalette();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
}
