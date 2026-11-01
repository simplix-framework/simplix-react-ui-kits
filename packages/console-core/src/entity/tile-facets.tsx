import { createContext, useContext, type ReactNode } from "react";

import type { TileFilter } from "./tile-filter";

/** One field the page's figure tiles narrow by a value, with the values its tiles offer. */
export interface TileFacet {
  readonly field: string;
  /** The field's name as the filter bar labels it; the field's own key where no tile states one. */
  readonly label: string;
  readonly options: readonly { readonly value: string; readonly label: string }[];
}

/** A tile as the facets read it: its label and, where it narrows by one value, that value. */
interface FacetTile {
  readonly label: string;
  readonly filter?: TileFilter;
}

/**
 * The fields the page's figure tiles narrow by one value, each with its tiles' values in order.
 *
 * <p>A tile press writes `<field>.in`, the key the filter bar's faceted filter writes, so a list
 * that offers a faceted filter on the same field shows a pressed tile as an active value and clears
 * it. Tiles that write several keys (a window over a time field) are left to the filters that own
 * those keys.
 *
 * @param tiles the page's figure tiles
 */
export function tileFacets(tiles: readonly FacetTile[] | undefined): TileFacet[] {
  const byField = new Map<string, { label: string; options: { value: string; label: string }[] }>();
  for (const tile of tiles ?? []) {
    const filter = tile.filter;
    if (!filter || "values" in filter) continue;
    const facet = byField.get(filter.field) ?? { label: filter.fieldLabel ?? filter.field, options: [] };
    if (!facet.options.some((option) => option.value === filter.value)) facet.options.push({ value: filter.value, label: tile.label });
    byField.set(filter.field, facet);
  }
  return [...byField.entries()].map(([field, facet]) => ({ field, label: facet.label, options: facet.options }));
}

/**
 * The tile facets a list has no other way to narrow by: no filter of its own on the field, no chip
 * row on it, and no screen narrowing writing its `<field>.in`.
 *
 * @param facets the page's tile facets
 * @param list the list's filter fields, chip field and narrowing key
 */
export function missingTileFacets(
  facets: readonly TileFacet[],
  list: { readonly filterFields: readonly string[]; readonly chipField?: string; readonly narrowingKey?: string },
): TileFacet[] {
  return facets.filter(
    (facet) => !list.filterFields.includes(facet.field) && list.chipField !== facet.field && list.narrowingKey !== `${facet.field}.in`,
  );
}

const TileFacetsContext = createContext<readonly TileFacet[]>([]);

/** Hands the page's tile facets to the list it draws. */
export function TileFacetsProvider({ facets, children }: { readonly facets: readonly TileFacet[]; readonly children: ReactNode }) {
  return <TileFacetsContext.Provider value={facets}>{children}</TileFacetsContext.Provider>;
}

/** The facets of the page's figure tiles, empty outside a page that draws any. */
export function useTileFacets(): readonly TileFacet[] {
  return useContext(TileFacetsContext);
}
