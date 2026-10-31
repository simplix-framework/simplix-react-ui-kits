import { useCallback, useEffect, useState } from "react";

import type { ResizablePresentation } from "./detail-width";
import { browserStorage, type PresentationStorage } from "./browser-storage";

/** The widths the reader chose, by presentation, in px. A presentation they have not resized has none. */
export type DetailWidths = Readonly<Partial<Record<ResizablePresentation, number>>>;

/** The storage key {@link useDetailWidthMemory} saves under when a product names none. */
export const DETAIL_WIDTH_STORAGE_KEY = "console.detailWidths";

const RESIZABLE: readonly ResizablePresentation[] = ["panel", "drawer", "dialog"];

function isStorageRefusal(error: unknown): boolean {
  return error instanceof DOMException || error instanceof TypeError;
}

/** The saved widths: only the presentations that hold a positive finite number; none when nothing is saved or storage cannot be read. */
export function readRememberedWidths(storage: PresentationStorage | undefined, key: string = DETAIL_WIDTH_STORAGE_KEY): DetailWidths {
  if (!storage) return {};
  let parsed: unknown;
  try {
    const saved = storage.getItem(key);
    if (saved === null) return {};
    parsed = JSON.parse(saved);
  } catch (error) {
    if (isStorageRefusal(error) || error instanceof SyntaxError) return {};
    throw error;
  }
  if (typeof parsed !== "object" || parsed === null) return {};
  const record = parsed as Record<string, unknown>;
  const widths: Partial<Record<ResizablePresentation, number>> = {};
  for (const presentation of RESIZABLE) {
    const value = record[presentation];
    if (typeof value === "number" && Number.isFinite(value) && value > 0) widths[presentation] = value;
  }
  return widths;
}

/** Saves the widths; returns false when storage refused them. */
export function writeRememberedWidths(storage: PresentationStorage | undefined, widths: DetailWidths, key: string = DETAIL_WIDTH_STORAGE_KEY): boolean {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(widths));
    return true;
  } catch (error) {
    if (isStorageRefusal(error)) return false;
    throw error;
  }
}

/** Removes the saved widths; returns false when storage refused it. */
export function forgetRememberedWidths(storage: PresentationStorage | undefined, key: string = DETAIL_WIDTH_STORAGE_KEY): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch (error) {
    if (isStorageRefusal(error)) return false;
    throw error;
  }
}

/** The widths with one presentation set to a width; the same object when it already holds it. */
export function withWidth(widths: DetailWidths, presentation: ResizablePresentation, width: number): DetailWidths {
  return widths[presentation] === width ? widths : { ...widths, [presentation]: width };
}

/** The widths without one presentation's. */
export function withoutWidth(widths: DetailWidths, presentation: ResizablePresentation): DetailWidths {
  const { [presentation]: _dropped, ...rest } = widths;
  return rest;
}

/**
 * Brings the saved widths in line with the reader's: saved while they ask the browser to remember
 * and hold any, removed otherwise, so turning the setting off or returning every presentation to
 * its default leaves nothing behind.
 */
export function persistWidths(storage: PresentationStorage | undefined, remember: boolean, widths: DetailWidths, key: string = DETAIL_WIDTH_STORAGE_KEY): void {
  if (remember && Object.keys(widths).length > 0) writeRememberedWidths(storage, widths, key);
  else forgetRememberedWidths(storage, key);
}

/** Options for {@link useDetailWidthMemory}. */
export interface DetailWidthMemoryOptions {
  /** Whether the reader asked the browser to remember their choices, as the presentation switch shows. */
  readonly remember: boolean;
  readonly storageKey?: string;
  /** Where the widths are saved; the browser's local storage when absent. */
  readonly storage?: PresentationStorage;
}

/** What a {@link CrudPage} takes to open its record at the widths the reader chose. */
export interface DetailWidthSetting {
  /** The width the reader chose for each presentation they resized. */
  readonly widths: DetailWidths;
  /** The reader dragged or keyed a presentation to a width. */
  readonly onWidthChange: (presentation: ResizablePresentation, width: number) => void;
  /** The reader returned a presentation to the width its theme names. */
  readonly onWidthReset: (presentation: ResizablePresentation) => void;
}

/**
 * Keeps the widths the reader chose for the record, one per presentation. They last as long as the
 * page while the browser remembers nothing; once the reader asks it to remember (the presentation
 * switch's setting), the first render restores the saved ones and every later change is saved, and
 * turning the setting off removes them.
 */
export function useDetailWidthMemory({ remember, storageKey = DETAIL_WIDTH_STORAGE_KEY, storage }: DetailWidthMemoryOptions): DetailWidthSetting {
  const store = storage ?? browserStorage();
  const [widths, setWidths] = useState<DetailWidths>(() => (remember ? readRememberedWidths(store, storageKey) : {}));
  useEffect(() => persistWidths(store, remember, widths, storageKey), [remember, widths, store, storageKey]);
  const onWidthChange = useCallback((presentation: ResizablePresentation, width: number) => setWidths((current) => withWidth(current, presentation, width)), []);
  const onWidthReset = useCallback((presentation: ResizablePresentation) => setWidths((current) => withoutWidth(current, presentation)), []);
  return { widths, onWidthChange, onWidthReset };
}
