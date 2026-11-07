import { useCallback, useMemo, useState, type ReactNode } from "react";

import { browserStorage, type PresentationStorage } from "../page/browser-storage";
import { NoticeDismissalsProvider, type NoticeDismissals } from "./dismissal-source";

/** Props for {@link LocalNoticeDismissalsProvider}. */
export interface LocalNoticeDismissalsProviderProps {
  /**
   * Where this browser keeps the cards the reader put away, so the set outlives a reload:
   *
   * - absent: kept for as long as the page is open, with no storage behind it (a mockup, a story);
   * - `null`: the key is not known yet (the reader's account is still being read), so nothing is
   *   drawn as put away and `ready` is false until it is;
   * - a key: read from and written to this browser's local storage under it.
   */
  readonly storageKey?: string | null;
  /** The store the set is kept in; absent, this browser's local storage. */
  readonly storage?: PresentationStorage;
  readonly children: ReactNode;
}

/** The keys a store holds under `key`, or none where it holds nothing readable. */
function readKeys(storage: PresentationStorage | undefined, key: string): readonly string[] {
  try {
    const raw = storage?.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((one): one is string => typeof one === "string") : [];
  } catch (error) {
    // A stale or foreign value under the key reads as nothing put away; a blocked store likewise.
    if (error instanceof SyntaxError || error instanceof DOMException) return [];
    throw error;
  }
}

function writeKeys(storage: PresentationStorage | undefined, key: string, keys: readonly string[]): void {
  try {
    storage?.setItem(key, JSON.stringify(keys));
  } catch (error) {
    // A store that refuses the write keeps the choice for this page, which beats refusing it.
    if (!(error instanceof DOMException)) throw error;
  }
}

/**
 * Notice dismissals kept in the browser rather than on a server.
 *
 * <p>Without a `storageKey`, for a page drawn outside an installation (a mockup, a story): a card the
 * reader puts away goes into the header's list and comes back from there, exactly as it does against
 * an installation's settings API, and the set is gone when the page reloads. With one, the set is
 * kept in this browser under that key, so a product that keeps dismissals per browser names only
 * the key (per account, in its own namespace).
 */
export function LocalNoticeDismissalsProvider({ storageKey, storage, children }: LocalNoticeDismissalsProviderProps) {
  const store = storageKey ? (storage ?? browserStorage()) : undefined;
  // The set as last written under a key, so a change is drawn at once even where the store refuses it.
  const [held, setHeld] = useState<{ readonly key: string | null | undefined; readonly keys: readonly string[] }>({ key: undefined, keys: [] });
  const hiddenKeys = useMemo<readonly string[]>(() => {
    if (storageKey === null) return [];
    if (held.key === storageKey) return held.keys;
    return storageKey === undefined ? [] : readKeys(store, storageKey);
  }, [held, storageKey, store]);

  const change = useCallback(
    (next: (keys: readonly string[]) => readonly string[]) => {
      if (storageKey === null) return;
      const keys = next(hiddenKeys);
      if (storageKey !== undefined) writeKeys(store, storageKey, keys);
      setHeld({ key: storageKey, keys });
    },
    [hiddenKeys, storageKey, store],
  );

  const value = useMemo<NoticeDismissals>(
    () => ({
      ready: storageKey !== null,
      hiddenKeys,
      isHidden: (noticeKey) => hiddenKeys.includes(noticeKey),
      hide: (noticeKey) => change((keys) => (keys.includes(noticeKey) ? keys : [...keys, noticeKey])),
      show: (noticeKey) => change((keys) => keys.filter((key) => key !== noticeKey)),
    }),
    [change, hiddenKeys, storageKey],
  );
  return <NoticeDismissalsProvider value={value}>{children}</NoticeDismissalsProvider>;
}
