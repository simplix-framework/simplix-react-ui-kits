import { useCallback, useMemo } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { TimeRangeSelector } from "@simplix-react/ui";
import type { CrudListFilters, HeatmapColorTheme, TimeRange, TimeRangeValue, WindowPreset } from "@simplix-react/ui";

import { useAppTimeZone } from "@simplix-react/headless";

import { WINDOW_BOUNDS as BOUNDS, windowKeysOf } from "./window-keys";

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

const instantOf = (value: unknown): Date | undefined => {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const at = new Date(value.trim());
  return Number.isNaN(at.getTime()) ? undefined : at;
};

export { windowKeysOf };

/**
 * The window a list is narrowed to on `field`, read from its committed filters.
 *
 * <p>Two controls write a window: the strip (`<field>.between`, a pair) and the filter bar's
 * period filter, or an action that commits one bound (a notice's "since" instant). The rows are
 * read under all of them at once, so the window is their intersection: the latest start and the
 * earliest end. A start with no end runs to `now`. A window with an end and no start, or an empty
 * one, cannot be drawn on the strip, and the strip then shows nothing selected rather than a
 * window the list is not under.
 *
 * @param committed the list's committed filter values
 * @param field the field the list is read by in time
 * @param now where an open-ended window stops
 * @returns the window, or `null` when none is committed or it cannot be drawn
 */
export function committedWindow(committed: Readonly<Record<string, unknown>>, field: string, now: Date): TimeRange | null {
  const froms: Date[] = [];
  const tos: Date[] = [];
  const between = committed[`${field}.between`];
  if (typeof between === "string" && between.includes(",")) {
    const [a, b] = between.split(",");
    const from = instantOf(a);
    const to = instantOf(b);
    if (from) froms.push(from);
    if (to) tos.push(to);
  }
  for (const op of BOUNDS.from) {
    const at = instantOf(committed[`${field}.${op}`]);
    if (at) froms.push(at);
  }
  for (const op of BOUNDS.to) {
    const at = instantOf(committed[`${field}.${op}`]);
    if (at) tos.push(at);
  }
  if (froms.length === 0) return null;
  const from = new Date(Math.max(...froms.map((one) => one.getTime())));
  const to = tos.length > 0 ? new Date(Math.min(...tos.map((one) => one.getTime()))) : now;
  return to.getTime() > from.getTime() ? { from, to } : null;
}

/**
 * What a selected slice commits: the strip's own pair, and every other bound of the field cleared in
 * the same commit. Left standing, the filter bar's bounds would narrow the rows under the new
 * window too, and the list would show a slice the strip does not.
 *
 * @param field the field the list is read by in time
 * @param from the slice's first instant
 * @param to the instant the slice ends at
 */
export function windowCommit(field: string, from: Date, to: Date): Record<string, string | undefined> {
  const cleared = Object.fromEntries(windowKeysOf(field).map((key) => [key, undefined]));
  return { ...cleared, [`${field}.between`]: `${from.toISOString()},${to.toISOString()}` };
}

/**
 * What turning the strip off commits: every bound of the field cleared, the strip's own pair and the
 * filter bar's bounds alike. Left standing, a bound of the filter bar would keep narrowing the rows
 * while the strip drew nothing selected, and the address and the request would still carry a window.
 *
 * @param field the field the list is read by in time
 */
export function windowClear(field: string): Record<string, undefined> {
  return Object.fromEntries(windowKeysOf(field).map((key) => [key, undefined]));
}

/**
 * The list's committed conditions without any bound of the strip's field, empty values dropped.
 * Counting under the window would flatten the strip to the shape of what is already selected, and
 * a cleared filter is still a key whose `undefined` reaches the server as an operator with no value.
 */
export function conditionsWithoutWindow(committed: Readonly<Record<string, unknown>>, field: string): Record<string, unknown> {
  const own = new Set(windowKeysOf(field));
  return Object.fromEntries(Object.entries(committed).filter(([key, value]) => !own.has(key) && value != null && value !== ""));
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
   *
   * <p>Not told when the reader turns the selection off: there is no range to hand over, and a
   * screen that holds a forced window drops it by watching the list's committed values.
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
 * <p>Selecting a range writes the window back to the list as the field's own `between` filter and
 * clears the filter bar's bounds on the same field, so one window is in force. The strip draws the
 * window the list is committed to ({@link committedWindow}), whichever control committed it: a
 * notice that commits a start instant moves the strip to that window instead of leaving it on its
 * own default. A second press on the lit window, the clear control and Escape take the window off
 * again ({@link windowClear}), so a list can return to no window at all.
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
  const committed = filters.committedValues;
  const windowKeys = useMemo(() => windowKeysOf(field), [field]);

  // Nothing is selected until the list is narrowed in time. The strip opens on its default window
  // and the list under it stays unnarrowed - a page that loaded already filtered would be
  // hiding rows nobody asked it to hide. Once any control commits a bound, the strip shows it.
  // `now` is fixed per committed window, so an open-ended window does not move on every render.
  const windowText = JSON.stringify(windowKeys.map((key) => committed[key] ?? null));
  const range = useMemo(() => committedWindow(committed, field, new Date()), [windowText, field]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyed by content, not by the filter object's identity: the list hands back a fresh object
  // on every render, and a strip that re-fetched on each of them would ask the same question
  // three times per load.
  const conditionsKey = useMemo(
    () => JSON.stringify(Object.entries(conditionsWithoutWindow(committed, field)).sort(([a], [b]) => a.localeCompare(b))),
    [committed, field],
  );

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
      filters.commitValues(windowCommit(field, next.from, next.to));
      onRangeChange?.({ from: next.from, to: next.to });
    },
    [field, filters, onRangeChange],
  );

  // A second press on the lit preset, the clear action, Escape on the strip and the narrow bar's
  // "Clear selection" all arrive here: the range leaves the address and the request, so a range that
  // is the only condition on the list can be turned off.
  const clear = useCallback(() => filters.commitValues(windowClear(field)), [field, filters]);

  return (
    <TimeRangeSelector
      value={range}
      onChange={select}
      onClear={clear}
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
