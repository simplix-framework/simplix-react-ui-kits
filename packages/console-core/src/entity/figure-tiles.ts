import { buildSearchableParams } from "@simplix-react/headless";
import type { CrudListFilters } from "@simplix-react/ui";

import { useRecordContract, recordValueText, type ContractField } from "./record-contract";
import { aggregateValue, statusTiles, useStatusCounts } from "./status-counts";
import type { SettingsTile } from "../layout/settings-tiles";

/** A read the tiles are counted from: the generated query's result. */
export interface FigureQuery {
  readonly data?: unknown;
  readonly isLoading?: boolean;
}

/** What a list page counts and sums by default, as its entity's SimpliX Meta states it. */
export interface FigureTilesSpec {
  /** A tile per value of one enum, from the status-counts read. */
  readonly status?: { readonly query: FigureQuery; readonly field: string; readonly enumName: string; readonly values: readonly string[] };
  /** A tile per sum or row count, from the aggregates read, drawn by each field's own kind. */
  readonly aggregates?: {
    readonly query: FigureQuery;
    readonly figures: readonly { readonly field: ContractField; readonly op: "sum" | "count"; readonly rowCount?: boolean }[];
  };
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
    const { enumName, field, values } = spec.status;
    tiles.push(...statusTiles({ field, values, counts, label: (value) => words.enumLabel(enumName, value), fieldLabel: words.fieldLabel(field) }));
  }
  for (const figure of spec.aggregates?.figures ?? []) {
    const raw = aggregateValue(spec.aggregates?.query.data, figure.field.name, figure.op);
    const shown = raw === undefined ? undefined : figure.op === "count" ? raw : recordValueText(words.value(figure.field, { [figure.field.name]: raw })) || raw;
    tiles.push({
      key: `${figure.field.name}:${figure.op}`,
      label: figure.rowCount ? spec.rowsLabel : words.fieldLabel(figure.field.name),
      value: shown,
      counted: false,
      // A sum is read under the list's current conditions, so it is being read again whenever they
      // change; its tile says so on its own, and the counts beside it keep their numbers.
      ...(spec.aggregates?.query.isLoading ? { loading: true } : {}),
    });
  }
  return tiles;
}

/**
 * The default figure tiles of a list page and whether the status counts are still being read.
 *
 * <p>The sums are read under the list's current conditions and are read again whenever those change;
 * each sum tile carries its own loading state (`SettingsTile.loading`), so the status counts, which
 * stay over every row, do not blink with them.
 *
 * @param entity the entity the labels are read for
 * @param spec what the page counts and sums, with the reads that answer it
 */
export function useFigureTiles(entity: string, spec: FigureTilesSpec): { readonly tiles: SettingsTile[]; readonly loading: boolean } {
  const contract = useRecordContract(entity);
  const counts = useStatusCounts(spec.status?.query ?? {});
  return {
    tiles: figureTiles(spec, contract, counts),
    loading: Boolean(spec.status?.query.isLoading),
  };
}
