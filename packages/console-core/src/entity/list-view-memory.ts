import { useCallback, useState } from "react";

import type { CrudListViewMode } from "@simplix-react/ui";

import { browserStorage, type PresentationStorage } from "../page/browser-storage";

/** The prefix of the storage key a list's view is saved under: the prefix plus the list's `viewKey`. */
export const LIST_VIEW_STORAGE_PREFIX = "console.listView.";

const isView = (value: unknown): value is CrudListViewMode => value === "list" || value === "grid";

/** The view saved for a list, or undefined when none is saved, the value is not a view, or storage cannot be read. */
export function readRememberedView(storage: PresentationStorage | undefined, viewKey: string): CrudListViewMode | undefined {
  if (!storage) return undefined;
  try {
    const saved = storage.getItem(LIST_VIEW_STORAGE_PREFIX + viewKey);
    return isView(saved) ? saved : undefined;
  } catch (error) {
    if (error instanceof DOMException || error instanceof TypeError) return undefined;
    throw error;
  }
}

/** Saves the view of a list; returns false when storage refused it. */
export function writeRememberedView(storage: PresentationStorage | undefined, viewKey: string, view: CrudListViewMode): boolean {
  if (!storage) return false;
  try {
    storage.setItem(LIST_VIEW_STORAGE_PREFIX + viewKey, view);
    return true;
  } catch (error) {
    if (error instanceof DOMException || error instanceof TypeError) return false;
    throw error;
  }
}

/** What {@link useRememberedView} hands a list. */
export interface RememberedView {
  /** The view the reader last chose for this list, read once on the first render. */
  readonly saved: CrudListViewMode | undefined;
  /** Saves the reader's choice; a no-op for a list with no key. */
  readonly remember: (view: CrudListViewMode) => void;
}

/**
 * The view a reader chose for one list, kept in the browser across visits. The saved value is read
 * synchronously on the first render, so a list opens in it instead of painting its default and then
 * snapping to the reader's. A list with no `viewKey` has nothing to be saved under and remembers
 * nothing: its choice lasts as long as the page.
 *
 * @param viewKey what names the list among the lists of the product
 * @param storage where the choice is saved; the browser's local storage when absent
 */
export function useRememberedView(viewKey: string | undefined, storage?: PresentationStorage): RememberedView {
  const store = storage ?? browserStorage();
  const [saved] = useState(() => (viewKey === undefined ? undefined : readRememberedView(store, viewKey)));
  const remember = useCallback(
    (view: CrudListViewMode) => {
      if (viewKey !== undefined) writeRememberedView(store, viewKey, view);
    },
    [store, viewKey],
  );
  return { saved, remember };
}
