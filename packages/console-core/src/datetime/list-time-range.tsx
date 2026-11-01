import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { TimeRangeSelector } from "@simplix-react/ui";
import type { CrudListFilters, HeatmapColorTheme, TimeRange, TimeRangeValue, WindowPreset } from "@simplix-react/ui";

import { useAppTimeZone } from "@simplix-react/headless";

/** What a strip asks its screen for: a window, a slice count, and the list's other conditions. */
export interface TimeRangeCountQuery {
  /** The first instant in the window, inclusive, as RFC 3339. */
  from: string;
  /** The instant the window ends at, exclusive, as RFC 3339. */
  to: string;
  /** How many slices the strip wants counted. */
  buckets: number;
  /**
   * The list's committed filters, minus the window this strip owns.
   *
   * <p>The strip's own selection is left out deliberately: counting under it would flatten the
   * strip to the shape of the thing already selected, which is the one shape it cannot show.
   */
  conditions: Record<string, unknown>;
}

/**
 * The windows a strip can offer beyond the framework's own eleven, and how finely each is sliced.
 *
 * <p>Minutes throughout, and the keys are words rather than a number and a unit on purpose: the
 * framework composes the label of a `^\d+\w+$` key itself out of its own unit catalogue — 「1d」
 * becomes 「1일」 — and falls back to the preset's own `label` only for a key it cannot take apart.
 * Its catalogue has no unit for a quarter, a half-year or a year, so a key named `1q` renders as
 * 「1q」 whatever label travels with it. Named keys are what let these three carry their own words.
 */
const EXTRA_WINDOWS: readonly { readonly key: string; readonly windowMinutes: number; readonly bucketMinutes: number }[] = [
  { key: "quarter", windowMinutes: 129600, bucketMinutes: 4320 },
  { key: "half", windowMinutes: 259200, bucketMinutes: 8640 },
  { key: "year", windowMinutes: 525600, bucketMinutes: 43200 },
];

/** The framework's own eleven, by key, with the slicing it gives each. */
const BUILT_IN_WINDOWS: readonly { readonly key: string; readonly windowMinutes: number; readonly bucketMinutes: number }[] = [
  { key: "5m", windowMinutes: 5, bucketMinutes: 10 / 60 },
  { key: "10m", windowMinutes: 10, bucketMinutes: 20 / 60 },
  { key: "30m", windowMinutes: 30, bucketMinutes: 1 },
  { key: "1h", windowMinutes: 60, bucketMinutes: 5 },
  { key: "3h", windowMinutes: 180, bucketMinutes: 10 },
  { key: "6h", windowMinutes: 360, bucketMinutes: 15 },
  { key: "12h", windowMinutes: 720, bucketMinutes: 30 },
  { key: "1d", windowMinutes: 1440, bucketMinutes: 60 },
  { key: "3d", windowMinutes: 4320, bucketMinutes: 180 },
  { key: "7d", windowMinutes: 10080, bucketMinutes: 360 },
  { key: "1mo", windowMinutes: 43200, bucketMinutes: 1440 },
];

/**
 * A strip's windows, in the order asked for, named in the reader's own language.
 *
 * <p><b>Only for a screen that reads over spans the framework does not offer.</b> A strip left
 * alone gets the framework's eleven, already localized; this exists because a year of statistics
 * cannot be read through a one-month ceiling, and the three longer spans need names of their own.
 *
 * @param only which windows to offer, in the order to offer them
 * @returns the presets, ready for a strip
 */
export function useTimeWindowPresets(only: readonly string[]): WindowPreset[] {
  const { t } = useTranslation("common");
  const all = [...BUILT_IN_WINDOWS, ...EXTRA_WINDOWS];
  return only.flatMap((key) => {
    const window = all.find((one) => one.key === key);
    if (!window) return [];
    return [{
      key: window.key,
      label: t(`timeRange.window.${window.key}`),
      windowMinutes: window.windowMinutes,
      bucketMinutes: window.bucketMinutes,
    }];
  });
}

export interface ListTimeRangeProps {
  /** The list state the strip reads its conditions from and writes its selection to. */
  filters: CrudListFilters;
  /** The searchable field the window narrows — the field the list is read by time on. */
  field: string;
  /** Counts per slice, under the window and conditions given. */
  fetchCounts: (query: TimeRangeCountQuery) => Promise<number[]>;
  /** Which window the strip opens on. @defaultValue "1d" */
  defaultWindow?: string;
  /**
   * The windows on offer.
   *
   * <p>Left out, the framework's own eleven stand — five minutes to a month, already localized.
   * Pass {@link useTimeWindowPresets} where the screen reads over longer spans than that, or over
   * one kind of span: eleven presets a reader will never press is a control that takes longer to
   * read than to use.
   */
  presets?: WindowPreset[];
  /**
   * Told whenever the reader selects a slice, so a screen that also forces conditions onto the
   * same field can force the window the strip is showing.
   *
   * <p><b>Why a screen ever needs this.</b> The strip writes its selection into `filters`, and a
   * list that merges forced parameters over the reader's own (a tab strip imposing a day, a
   * parent record imposing an id) overwrites the very key the strip just wrote. Nothing errors:
   * the strip paints the slice, the request keeps the forced window, and the count beside the
   * strip disagrees with the total under it. A screen in that shape holds the effective window
   * itself and forces it, so there is one value rather than two.
   */
  onRangeChange?: (range: TimeRange) => void;
  /** The heatmap's colours: the theme's own ramp by default, so no screen picks a palette. @defaultValue "tokens" */
  colorTheme?: HeatmapColorTheme;
}

/**
 * The time-range strip above a list: how busy each slice of a window was, and which slice of it
 * the list is showing.
 *
 * <p>Reads the same conditions the list is filtered by, so narrowing to one customer thins the
 * strip too — a strip that kept its full shape would be describing rows the operator cannot see.
 *
 * <p>Selecting a range writes the window back to the list as the field's own `between` filter, so
 * the rows and the strip never disagree about which slice is being read.
 */
export function ListTimeRange({
  filters,
  field,
  fetchCounts,
  defaultWindow = "1d",
  presets,
  onRangeChange,
  colorTheme = "tokens",
}: ListTimeRangeProps) {
  const zone = useAppTimeZone();
  // Nothing is selected until somebody selects something. The strip opens on its default window
  // and the list under it stays unnarrowed — a page that loaded already filtered would be
  // hiding rows nobody asked it to hide.
  const [range, setRange] = useState<TimeRange | null>(null);

  const committed = filters.committedValues;
  const windowKey = `${field}.between`;

  // Keyed by content, not by the filter object's identity: the list hands back a fresh object
  // on every render, and a strip that re-fetched on each of them would ask the same question
  // three times per load.
  const conditionsKey = useMemo(() => {
    const rest: Record<string, unknown> = { ...committed };
    delete rest[windowKey];
    // A cleared filter is still a key, and the entries round-trip below turns its `undefined`
    // into `null` — which reaches the server as an operator with no value and is refused. Dropped
    // here rather than at each caller, because every list that clears a filter would hit it.
    for (const [key, value] of Object.entries(rest)) {
      if (value == null || value === "") delete rest[key];
    }
    return JSON.stringify(Object.entries(rest).sort(([a], [b]) => a.localeCompare(b)));
  }, [committed, windowKey]);

  const conditions = useMemo(
    () => Object.fromEntries(JSON.parse(conditionsKey) as [string, unknown][]),
    [conditionsKey],
  );

  const counts = useCallback(
    (from: Date, to: Date, buckets: number) =>
      fetchCounts({ from: from.toISOString(), to: to.toISOString(), buckets, conditions }),
    [fetchCounts, conditions],
  );

  const select = useCallback(
    (next: TimeRangeValue) => {
      setRange({ from: next.from, to: next.to });
      // The pair the `between` operator reads, in the order it reads them.
      filters.commitValue(windowKey, `${next.from.toISOString()},${next.to.toISOString()}`);
      onRangeChange?.({ from: next.from, to: next.to });
    },
    [filters, onRangeChange, windowKey],
  );

  return (
    <TimeRangeSelector
      value={range}
      onChange={select}
      fetchCounts={counts}
      presets={presets}
      defaultWindow={defaultWindow}
      displayZone={zone}
      colorTheme={colorTheme}
    />
  );
}

/**
 * Reads a counts endpoint's answer.
 *
 * <p>The boot mutator has already unwrapped the response envelope, so what arrives is the body
 * itself — an array of counts — even though the generated signature still describes the envelope
 * around it. The one cast lives here rather than on every screen that draws a strip.
 *
 * @param call the counts request in flight
 * @returns one count per slice, or none when the answer is not an array of them
 */
export async function readCounts(call: Promise<unknown>): Promise<number[]> {
  const body = await call;
  return Array.isArray(body) ? body.map(Number) : [];
}
