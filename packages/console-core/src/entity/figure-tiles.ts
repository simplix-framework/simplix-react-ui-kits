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
    tiles.push(...statusTiles({ field, values, counts, label: (value) => words.enumLabel(enumName, value) }));
  }
  for (const figure of spec.aggregates?.figures ?? []) {
    const raw = aggregateValue(spec.aggregates?.query.data, figure.field.name, figure.op);
    const shown = raw === undefined ? undefined : figure.op === "count" ? raw : recordValueText(words.value(figure.field, { [figure.field.name]: raw })) || raw;
    tiles.push({
      key: `${figure.field.name}:${figure.op}`,
      label: figure.rowCount ? spec.rowsLabel : words.fieldLabel(figure.field.name),
      value: shown,
      counted: false,
    });
  }
  return tiles;
}

/**
 * The default figure tiles of a list page and whether they are still being read.
 *
 * @param entity the entity the labels are read for
 * @param spec what the page counts and sums, with the reads that answer it
 */
export function useFigureTiles(entity: string, spec: FigureTilesSpec): { readonly tiles: SettingsTile[]; readonly loading: boolean } {
  const contract = useRecordContract(entity);
  const counts = useStatusCounts(spec.status?.query ?? {});
  return {
    tiles: figureTiles(spec, contract, counts),
    loading: Boolean(spec.status?.query.isLoading || spec.aggregates?.query.isLoading),
  };
}
