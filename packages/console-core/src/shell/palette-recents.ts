import { useCallback, useEffect, useState } from "react";

/** A record or a screen the reader opened, as the palette offers it again before anything is typed. */
export interface ConsoleRecent {
  /** What identifies it: the same record or screen opened twice is one recent. */
  readonly key: string;
  readonly kind: "record" | "page";
  /** Its name as it was drawn when it was opened, in the language of that moment. */
  readonly label: string;
  /** Where it lives: the screen a record belongs to. */
  readonly sub?: string;
  readonly href: string;
}

/** How many recents the palette keeps. */
export const RECENT_LIMIT = 8;

/**
 * The recents with one more opened: it moves to the front, an older copy of it goes, and the list
 * keeps the newest `limit`.
 */
export function withRecent(recents: readonly ConsoleRecent[], opened: ConsoleRecent, limit = RECENT_LIMIT): ConsoleRecent[] {
  return [opened, ...recents.filter((recent) => recent.key !== opened.key)].slice(0, limit);
}

const isRecent = (value: unknown): value is ConsoleRecent => {
  if (value === null || typeof value !== "object") return false;
  const recent = value as Record<string, unknown>;
  return (
    typeof recent.key === "string" &&
    (recent.kind === "record" || recent.kind === "page") &&
    typeof recent.label === "string" &&
    typeof recent.href === "string" &&
    (recent.sub === undefined || typeof recent.sub === "string")
  );
};

/** The recents a stored text holds; anything unreadable is no recent. */
export function parseRecents(raw: string | null, limit = RECENT_LIMIT): ConsoleRecent[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRecent).slice(0, limit) : [];
  } catch {
    // A value another version wrote, or one cut short: start over rather than fail the palette.
    return [];
  }
}

function read(key: string): ConsoleRecent[] {
  try {
    return parseRecents(localStorage.getItem(key));
  } catch {
    // Storage refused (a private window, blocked site data): no recents, the palette still works.
    return [];
  }
}

function write(key: string, recents: readonly ConsoleRecent[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(recents));
  } catch {
    /* storage refused: the recents last as long as the page, which is better than none */
  }
}

/** What {@link useConsoleRecents} hands the palette. */
export interface ConsoleRecents {
  readonly recents: readonly ConsoleRecent[];
  /** Records that the reader opened something. */
  readonly add: (opened: ConsoleRecent) => void;
}

/**
 * The records and screens this reader opened last, kept in this browser.
 *
 * <p>The product names the key, per signed-in account and outside its sign-in store's prefix:
 * signing out sweeps every key under that prefix, and the recents are a preference that outlives a
 * session. Until the account is known the key is `null` and nothing is read or kept.
 *
 * @param storageKey where the recents are kept, or null while the account is not known
 */
export function useConsoleRecents(storageKey: string | null): ConsoleRecents {
  const [held, setHeld] = useState<{ key: string | null; recents: readonly ConsoleRecent[] }>(() => ({
    key: storageKey,
    recents: storageKey ? read(storageKey) : [],
  }));
  useEffect(() => {
    if (held.key !== storageKey) setHeld({ key: storageKey, recents: storageKey ? read(storageKey) : [] });
  }, [held.key, storageKey]);
  const add = useCallback(
    (opened: ConsoleRecent) => {
      if (!storageKey) return;
      setHeld((was) => {
        const recents = withRecent(was.key === storageKey ? was.recents : read(storageKey), opened);
        write(storageKey, recents);
        return { key: storageKey, recents };
      });
    },
    [storageKey],
  );
  return { recents: held.key === storageKey ? held.recents : [], add };
}
