import { useEffect, useRef, useState } from "react";

import { useUIDefaults } from "@simplix-react/ui";

import type { CrudPagePresentation } from "./crud-page";
import type { DetailPresentationSwitchProps } from "./detail-presentation-switch";
import { browserStorage, type PresentationStorage } from "./browser-storage";
import { useDetailWidthMemory, type DetailWidthSetting } from "./detail-width-memory";

/** Every way a record can be presented, in the order a switch offers them. */
export const DETAIL_PRESENTATIONS: readonly CrudPagePresentation[] = ["panel", "drawer", "dialog", "page"];

/** The storage key {@link useDetailPresentationMemory} saves under when a product names none. */
export const DETAIL_PRESENTATION_STORAGE_KEY = "console.detailPresentation";

export type { PresentationStorage };

const isPresentation = (value: unknown): value is CrudPagePresentation => DETAIL_PRESENTATIONS.includes(value as CrudPagePresentation);

/** The saved presentation, or undefined when none is saved, the value is not one, or storage cannot be read. */
export function readRememberedPresentation(storage: PresentationStorage | undefined, key: string = DETAIL_PRESENTATION_STORAGE_KEY): CrudPagePresentation | undefined {
  if (!storage) return undefined;
  try {
    const saved = storage.getItem(key);
    return isPresentation(saved) ? saved : undefined;
  } catch (error) {
    if (error instanceof DOMException || error instanceof TypeError) return undefined;
    throw error;
  }
}

/** Saves the presentation; returns false when storage refused it. */
export function writeRememberedPresentation(storage: PresentationStorage | undefined, value: CrudPagePresentation, key: string = DETAIL_PRESENTATION_STORAGE_KEY): boolean {
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof DOMException || error instanceof TypeError) return false;
    throw error;
  }
}

/** Removes the saved presentation; returns false when storage refused it. */
export function forgetRememberedPresentation(storage: PresentationStorage | undefined, key: string = DETAIL_PRESENTATION_STORAGE_KEY): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch (error) {
    if (error instanceof DOMException || error instanceof TypeError) return false;
    throw error;
  }
}

/** Options for {@link useDetailPresentationMemory}. */
export interface DetailPresentationMemoryOptions {
  /** The presentation in use, whoever chose it. */
  readonly value: CrudPagePresentation;
  /** Sets the presentation; called once on mount with the saved one when it differs. */
  readonly onChange: (value: CrudPagePresentation) => void;
  readonly storageKey?: string;
  /** Where the choice is saved; the browser's local storage when absent. */
  readonly storage?: PresentationStorage;
}

/** What {@link useDetailPresentationMemory} hands a {@link DetailPresentationSwitch}. */
export interface DetailPresentationMemory {
  /** Whether the choice is saved for the next visit. */
  readonly remember: boolean;
  /** On saves the current choice and every later one; off removes the saved one. */
  readonly onRememberChange: (remember: boolean) => void;
}

/**
 * Keeps the reader's detail presentation across visits when they ask for it. With nothing saved
 * the choice lasts as long as whatever holds `value`; with a saved one, the first render restores
 * it and every later change, from any control, is saved. A product with its own preference store
 * replaces this hook and hands the switch its own `remember`.
 */
export function useDetailPresentationMemory({ value, onChange, storageKey = DETAIL_PRESENTATION_STORAGE_KEY, storage }: DetailPresentationMemoryOptions): DetailPresentationMemory {
  const store = storage ?? browserStorage();
  const [saved] = useState(() => readRememberedPresentation(store, storageKey));
  const [remember, setRemember] = useState(saved !== undefined);
  // Nothing is saved until the saved choice has been restored, so the first render's value never overwrites it.
  const restored = useRef(saved === undefined || saved === value);
  useEffect(() => {
    if (saved !== undefined && saved !== value) onChange(saved);
    // Restoring runs once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!restored.current) {
      restored.current = value === saved;
      return;
    }
    if (remember) writeRememberedPresentation(store, value, storageKey);
  }, [remember, value, store, storageKey, saved]);
  const onRememberChange = (next: boolean) => {
    setRemember(next);
    restored.current = true;
    if (next) writeRememberedPresentation(store, value, storageKey);
    else forgetRememberedPresentation(store, storageKey);
  };
  return { remember, onRememberChange };
}

/** A storage held in memory, for a story or a test that must start from a saved choice without touching the browser's. */
export function memoryPresentationStorage(initial: Readonly<Record<string, string>> = {}): PresentationStorage {
  const items = new Map(Object.entries(initial));
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  };
}

/** What {@link useDetailPresentationSetting} hands a {@link CrudPage}, to spread onto it. */
export interface DetailPresentationSetting {
  /** Where the record opens; undefined leaves it to the installation's default and the phone rule. */
  readonly presentation: CrudPagePresentation;
  /** The record head's switch, with the browser's memory of the reader's choice. */
  readonly presentationSwitch: DetailPresentationSwitchProps;
  /** The widths the reader dragged the record to, remembered with the presentation when they ask. */
  readonly detailWidths: DetailWidthSetting;
}

/** Options for {@link useDetailPresentationSetting}. */
export interface DetailPresentationSettingOptions extends Omit<DetailPresentationMemoryOptions, "value" | "onChange"> {
  /** The storage key the chosen widths are saved under; the kit's own when absent. */
  readonly widthStorageKey?: string;
}

/**
 * The reader's detail presentation for one page: it starts from the installation's default
 * (`UIProvider`'s `detailPresentation`), the record head's switch changes it, and the browser
 * remembers the choice when the reader asks. The widths the reader drags the record to follow the
 * same setting. Spread the result onto a {@link CrudPage}.
 */
export function useDetailPresentationSetting(options: DetailPresentationSettingOptions = {}): DetailPresentationSetting {
  const defaults = useUIDefaults();
  const { widthStorageKey, ...memoryOptions } = options;
  const [presentation, setPresentation] = useState<CrudPagePresentation>(() => readRememberedPresentation(memoryOptions.storage ?? browserStorage(), memoryOptions.storageKey) ?? defaults.detailPresentation);
  const memory = useDetailPresentationMemory({ ...memoryOptions, value: presentation, onChange: setPresentation });
  const detailWidths = useDetailWidthMemory({ remember: memory.remember, storage: memoryOptions.storage, storageKey: widthStorageKey });
  return { presentation, presentationSwitch: { value: presentation, onChange: setPresentation, ...memory }, detailWidths };
}
