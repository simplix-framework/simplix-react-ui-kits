import { buildSearchableParams } from "@simplix-react/headless";
import { useTranslation } from "@simplix-react/i18n/react";
import type { CrudListFilters, StatusTone } from "@simplix-react/ui";

import { useRecordContract, recordValueText, type ContractField } from "./record-contract";
import { aggregateValue, statusTiles, useStatusCounts } from "./status-counts";
import type { SettingsTile } from "../layout/settings-tiles";
import type { CrudPageNotice } from "../page/crud-page";
import { PACKAGE_NAMESPACE } from "./locales";
import type { TileFilter } from "./tile-filter";

/** A read the tiles are counted from: the generated query's result. */
export interface FigureQuery {
  readonly data?: unknown;
  readonly isLoading?: boolean;
  /** Whether the read failed, so the page can say its figures are unread. */
  readonly isError?: boolean;
}

/** What a list page counts and sums by default, as its entity's SimpliX Meta states it. */
export interface FigureTilesSpec {
  /** A tile per value of one enum, from the status-counts read. */
  readonly status?: {
    readonly query: FigureQuery;
    /**
     * The field the counts are by: its name, or its contract field, whose `enumName`, `options` and
     * `tones` then stand in for the three below where the page leaves them out.
     */
    readonly field: string | ContractField;
    readonly enumName?: string;
    /** The values to draw a tile for, in order; absent, every option the contract field declares. */
    readonly values?: readonly string[];
    /**
     * The tone of the tile of each enum value, keyed by the value. A tile takes its tone only while
     * its count is above zero (a zero counts nothing to act on), so `danger` and `warning` mark a
     * set the reader must act on now (frontend invariant #48). A value the enum does not list, or
     * one left out, is drawn without a tone. Absent, the tones the contract field declares.
     */
    readonly tones?: Readonly<Record<string, StatusTone>>;
    /** What each value's figure counts, written under it; absent, nothing. */
    readonly basis?: (value: string) => string | undefined;
    /**
     * The narrowing a value's tile writes where it is not the one value of the counted field: a
     * figure that counts under a second condition narrows by both. Absent, `<field>.in` the value.
     */
    readonly filter?: (value: string) => TileFilter | undefined;
  };
  /** A tile per sum or row count, from the aggregates read, drawn by each field's own kind. */
  readonly aggregates?: {
    readonly query: FigureQuery;
    readonly figures: readonly {
      readonly field: ContractField;
      readonly op: "sum" | "count";
      readonly rowCount?: boolean;
      /** The tile's tone for the figure it holds: a tone, or one chosen by the value (a failure count tinted while above zero). */
      readonly tone?: StatusTone | ((value: number | undefined) => StatusTone | undefined);
    }[];
  };
  /** Tiles of the page's own after the generated ones: a figure no status count or aggregate answers. */
  readonly extra?: readonly SettingsTile[];
  /** What a count of every row is called: the entity's plural name. */
  readonly rowsLabel: string;
}

/** What a list's request is made of besides the filters the reader committed. */
export interface ListRequestOptions {
  /** Parameters the screen imposes on every request (a tab, a parent record); they win over the reader's filters. */
  readonly forced?: Readonly<Record<string, unknown>>;
  /** The key the list's free text is sent under, absent where the route has no keyword search. */
  readonly searchKey?: string;
  /** The adapter's filter transform, such as the money filters' typed amount to stored whole number. */
  readonly transformFilters?: (filters: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * The conditions a list's request carries right now, flat and in the server's own filter grammar:
 * the filters the reader committed (a filter bar value, a pressed figure, a chosen time range), the
 * search text under its keyword key, and the parameters the screen forces. Paging and sorting are
 * left out, so the same conditions can be handed to a read that sums or counts the rows the list is
 * showing (the generated aggregates read takes the list's search DTO and ignores the rest).
 *
 * <p>Built with the same serializer as the list's own request, so a figure and the rows under it
 * cannot disagree about which rows are in scope.
 *
 * @param filters the list's filter state: its committed values and its search text
 * @param options what else the list's request carries
 */
export function listRequestParams(
  filters: Pick<CrudListFilters, "committedValues" | "search">,
  options: ListRequestOptions = {},
): Record<string, unknown> {
  const text = filters.search.trim();
  const params = buildSearchableParams(
    { filters: text === "" ? { ...filters.committedValues } : { ...filters.committedValues, _search: text } },
    { transformFilters: options.transformFilters, searchKey: options.searchKey },
  );
  for (const [key, value] of Object.entries(options.forced ?? {})) if (value !== undefined) params[key] = value;
  return params;
}

/** A list controller carrying the conditions of its current request. */
export type WithListRequest<L> = L & {
  /** What {@link listRequestParams} reads off the controller's filters. */
  readonly requestParams: Readonly<Record<string, unknown>>;
};

/**
 * The list controller with the conditions of its current request attached, so a figure that sums
 * the rows (the page's aggregates read) is handed the list's own filters and follows them.
 *
 * @param list the controller `useCrudList` returned
 * @param options what else the list's request carries
 */
export function withListRequest<L extends { readonly filters: Pick<CrudListFilters, "committedValues" | "search"> }>(
  list: L,
  options: ListRequestOptions = {},
): WithListRequest<L> {
  return { ...list, requestParams: listRequestParams(list.filters, options) };
}

/** The parts of a record contract the tiles are named and drawn with. */
export interface FigureWords {
  readonly enumLabel: (enumName: string, value: string) => string;
  readonly fieldLabel: (field: string) => string;
  readonly value: (field: ContractField, row: Readonly<Record<string, unknown>>) => Parameters<typeof recordValueText>[0];
}

/**
 * The default figure tiles of a list page: a tile per counted value, narrowing the list to it,
 * then a tile per sum or row count, each figure drawn as its field draws it (money in its
 * currency, credits with their word).
 *
 * @param spec what the page counts and sums, with the reads that answer it
 * @param words how a value and a field are named and drawn
 * @param counts the status counts, `undefined` before they answer
 */
export function figureTiles(spec: FigureTilesSpec, words: FigureWords, counts: Readonly<Record<string, number>> | undefined): SettingsTile[] {
  const tiles: SettingsTile[] = [];
  if (spec.status) {
    const status = statusFieldOf(spec.status);
    const { basis, filter } = spec.status;
    const drawn = statusTiles({ field: status.field, values: status.values, counts, tones: status.tones, basis, label: (value) => (status.enumName ? words.enumLabel(status.enumName, value) : value), fieldLabel: words.fieldLabel(status.field) });
    // A value whose figure counts under a second condition narrows by both when pressed.
    tiles.push(...drawn.map((tile) => (filter?.(tile.key) ? { ...tile, filter: filter(tile.key) as TileFilter } : tile)));
  }
  for (const figure of spec.aggregates?.figures ?? []) {
    const raw = aggregateValue(spec.aggregates?.query.data, figure.field.name, figure.op);
    const shown = raw === undefined ? undefined : figure.op === "count" ? raw : recordValueText(words.value(figure.field, { [figure.field.name]: raw })) || raw;
    const tone = typeof figure.tone === "function" ? figure.tone(raw) : figure.tone;
    tiles.push({
      key: `${figure.field.name}:${figure.op}`,
      label: figure.rowCount ? spec.rowsLabel : words.fieldLabel(figure.field.name),
      value: shown,
      counted: false,
      ...(tone ? { tone } : {}),
      // A sum is read under the list's current conditions, so it is being read again whenever they
      // change; its tile says so on its own, and the counts beside it keep their numbers.
      ...(spec.aggregates?.query.isLoading ? { loading: true } : {}),
    });
  }
  tiles.push(...(spec.extra ?? []));
  return tiles;
}

/**
 * The counted field of a status spec with the contract field's own declarations standing in for
 * what the page leaves out: its enum, every option it declares, and the tones SimpliX Meta gives
 * its values.
 *
 * @param status the page's status spec
 */
export function statusFieldOf(status: NonNullable<FigureTilesSpec["status"]>): {
  readonly field: string;
  readonly enumName: string | undefined;
  readonly values: readonly string[];
  readonly tones: Readonly<Record<string, StatusTone>> | undefined;
} {
  const declared = typeof status.field === "string" ? undefined : status.field;
  return {
    field: typeof status.field === "string" ? status.field : status.field.name,
    enumName: status.enumName ?? declared?.enumName,
    values: status.values ?? declared?.options ?? [],
    tones: status.tones ?? declared?.tones,
  };
}

/**
 * The default figure tiles of a list page, whether the status counts are still being read, and the
 * counts themselves, so a notice or a tile of the page's own reads the same answer instead of
 * counting again.
 *
 * <p>The sums are read under the list's current conditions and are read again whenever those change;
 * each sum tile carries its own loading state (`SettingsTile.loading`), so the status counts, which
 * stay over every row, do not blink with them.
 *
 * <p><b>A figure that could not be read says so on the page.</b> The tile draws a dash, which alone
 * reads as "nothing to count"; when either read failed, `notices` holds the warning that the figures
 * are unread, for the page to draw beside its own. The reads carry `RECORD_READ_META`, so the
 * console's error dialog does not also land over the page.
 *
 * @param entity the entity the labels are read for
 * @param spec what the page counts and sums, with the reads that answer it
 * @returns the tiles, the loading state, the count of every value (`undefined` until answered), and
 *   the notices the figures raise
 */
export function useFigureTiles(
  entity: string,
  spec: FigureTilesSpec,
): {
  readonly tiles: SettingsTile[];
  readonly loading: boolean;
  readonly counts: Readonly<Record<string, number>> | undefined;
  readonly notices: readonly CrudPageNotice[];
} {
  const contract = useRecordContract(entity);
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  // Every declared value is present in the answer, a value no row counts as 0.
  const counts = useStatusCounts(spec.status?.query ?? {}, { options: spec.status ? statusFieldOf(spec.status).values : [] });
  const unread = Boolean(spec.status?.query.isError || spec.aggregates?.query.isError);
  return {
    tiles: figureTiles(spec, contract, counts),
    loading: Boolean(spec.status?.query.isLoading),
    counts,
    notices: unread ? [{ key: "figures-unread", kind: "warning", when: true, title: t("figureTiles.unreadTitle"), hint: t("figureTiles.unreadHint") }] : [],
  };
}
