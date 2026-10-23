// The order a reader has put a row of figure tiles in, kept per browser under the row's key.
import { useCallback, useMemo, useState } from "react";

const PREFIX = "tile-order:";

function readOrder(key: string): string[] {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch (error) {
    // A value written by an older build, or storage the browser refuses: the board's own order.
    if (error instanceof SyntaxError || error instanceof DOMException) return [];
    throw error;
  }
}

/**
 * Tiles in the reader's order, and the moves that change it.
 *
 * <p>Keys the reader never placed (a tile added after they last arranged the row) keep their place
 * from the board's order after the placed ones, so a new figure appears rather than vanishing.
 *
 * @param rowKey - names the row in storage; absent turns reordering off
 * @param keys - every tile key, in the board's order
 */
export function useTileOrder(rowKey: string | undefined, keys: readonly string[]) {
  const [stored, setStored] = useState<string[]>(() => (rowKey ? readOrder(rowKey) : []));
  const order = useMemo(() => {
    const placed = stored.filter((k) => keys.includes(k));
    return [...placed, ...keys.filter((k) => !placed.includes(k))];
  }, [stored, keys]);

  const save = useCallback(
    (next: string[]) => {
      setStored(next);
      if (rowKey) localStorage.setItem(PREFIX + rowKey, JSON.stringify(next));
    },
    [rowKey],
  );

  /** Moves `key` to stand where `target` stands. */
  const moveTo = useCallback(
    (key: string, target: string) => {
      if (key === target) return;
      const next = order.filter((k) => k !== key);
      next.splice(next.indexOf(target), 0, key);
      save(next);
    },
    [order, save],
  );

  /** Moves `key` one place earlier (-1) or later (+1). */
  const step = useCallback(
    (key: string, by: -1 | 1) => {
      const from = order.indexOf(key);
      const to = from + by;
      if (from < 0 || to < 0 || to >= order.length) return;
      const next = [...order];
      [next[from], next[to]] = [next[to], next[from]];
      save(next);
    },
    [order, save],
  );

  return { order, moveTo, step, enabled: rowKey !== undefined };
}
