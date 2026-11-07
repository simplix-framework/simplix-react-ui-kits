import { makeFilterKey } from "@simplix-react/headless";
import { SearchOperator, type AddressedFilters, type CrudSearchFilters, type FilterControl } from "@simplix-react/ui";

import { NUMBER_FILTER_OPERATORS, textFilterOperators } from "./filter-operators";
import type { ContractFilter } from "./record-contract";

/**
 * Where a list keeps its committed filters when its page's address owns them: what the address
 * carries now, and how to write the reader's change back into it.
 *
 * <p>A generated page builds one from its `search` (`value: search.filters`) and its `onNavigate`
 * (`onChange: (next) => onNavigate({ ...search, filters: next }, { replace: true })`) and hands it
 * to the list's hook as its second argument.
 */
export interface ListAddress {
  /** The filters the address carries, in the address's form, or `undefined` when it names none. */
  readonly value: CrudSearchFilters | undefined;
  /** Receives the filters the reader has committed; `undefined` means none applies. */
  readonly onChange: (next: CrudSearchFilters | undefined) => void;
}

/** What the controls a list draws depend on beyond its declared filters. */
export interface ListAddressOptions {
  /**
   * The fields of the `reference` filters the list supplies a facet for. A reference filter with no
   * facet draws no control (a bar offering raw ids asks the reader for a value nobody can know),
   * so its key is not one the address may carry.
   */
  readonly facetFields?: readonly string[];
}

/** One declared filter as the list draws it: its control, and the filter keys that control commits. */
interface DrawnFilter {
  readonly control: FilterControl;
  readonly keys: readonly string[];
}

/**
 * The control a declared filter draws and the keys it commits, or nothing for a `reference` the
 * list supplies no facet for. Mirrors what `recordFilterOf` and the filter bar do with the same
 * declaration: a facet commits `<field>.in`, a toggle `<field>.equals`, a period its two bounds, a
 * text or a number one key per operator it offers.
 */
function drawnBy(def: ContractFilter, facetFields: ReadonlySet<string>): DrawnFilter | undefined {
  const { field } = def;
  switch (def.kind) {
    case "reference":
      return facetFields.has(field) ? { control: { field, type: "faceted" }, keys: [makeFilterKey(field, SearchOperator.IN)] } : undefined;
    case "choice":
      return { control: { field, type: "faceted" }, keys: [makeFilterKey(field, SearchOperator.IN)] };
    case "toggle":
      return { control: { field, type: "toggle" }, keys: [makeFilterKey(field, SearchOperator.EQUALS)] };
    case "dateRange":
      return {
        control: { field, type: "dateRange" },
        keys: [makeFilterKey(field, SearchOperator.GREATER_THAN_OR_EQUAL), makeFilterKey(field, SearchOperator.LESS_THAN_OR_EQUAL)],
      };
    case "number":
      return { control: { field, type: "number" }, keys: NUMBER_FILTER_OPERATORS.map((operator) => makeFilterKey(field, operator)) };
    case "text":
      return { control: { field, type: "text" }, keys: textFilterOperators(def.operators).map((operator) => makeFilterKey(field, operator)) };
  }
}

/** Every declared filter the list draws a control for, in the order they are declared. */
function drawnFilters(defs: readonly ContractFilter[], options: ListAddressOptions | undefined): DrawnFilter[] {
  const facetFields = new Set(options?.facetFields ?? []);
  return defs.flatMap((def) => {
    const drawn = drawnBy(def, facetFields);
    return drawn ? [drawn] : [];
  });
}

/**
 * The controls a list draws for its declared filters, in the form `useCrudList`'s `addressedFilters`
 * reads them: a toggle's `true` and a number's text come back as the boolean and the number the
 * control would have committed, because the controls say what each field is.
 *
 * @param defs the filters the entity declares, as the generated list states them
 * @param options what else decides which of them the list draws
 * @returns one control per filter the list draws a control for
 */
export function filterControlsOf(defs: readonly ContractFilter[], options?: ListAddressOptions): FilterControl[] {
  return drawnFilters(defs, options).map((drawn) => drawn.control);
}

/**
 * The filter keys the list's controls commit, which are the only keys its address may carry.
 *
 * @param defs the filters the entity declares
 * @param options what else decides which of them the list draws
 */
export function declaredFilterKeys(defs: readonly ContractFilter[], options?: ListAddressOptions): ReadonlySet<string> {
  return new Set(drawnFilters(defs, options).flatMap((drawn) => drawn.keys));
}

/**
 * The part of an address's filters a list draws a control for, and nothing else.
 *
 * <p><b>The address is typed by anyone.</b> The framework validates its shape and knows no entity's
 * filter keys, so a stale link, a hand-typed one or a tile that names a field the list has no
 * control for would otherwise reach the request as a parameter the server refuses, or as a filter
 * the bar draws no badge for. A key is kept only when the list has a control that commits it, per
 * kind: a choice and a reference `<field>.in`, a toggle `<field>.equals`, a text and a number the
 * operators they offer, a period its two bounds. A reference with no facet is dropped with its key.
 *
 * <p>The same function narrows for the list and for any screen that links to it, so a link's keys
 * are judged by what the list itself will accept.
 *
 * @param defs the filters the entity declares, as the generated list states them
 * @param filters what the address carries, usually `search.filters`
 * @param options what else decides which filters the list draws
 * @returns the kept filters, or `undefined` when none is left, as an address that names none
 */
export function narrowAddressedFilters(
  defs: readonly ContractFilter[],
  filters: CrudSearchFilters | undefined,
  options?: ListAddressOptions,
): CrudSearchFilters | undefined {
  if (filters === undefined) return undefined;
  const keys = declaredFilterKeys(defs, options);
  const kept = Object.entries(filters).filter(([key]) => keys.has(key));
  return kept.length === 0 ? undefined : Object.fromEntries(kept);
}

/** What a list declares about its address: the controls it draws, the keys they commit, and how to read an address. */
export interface ListAddressDeclaration {
  /** The controls the list draws, for `filtersToRequestParams` and `addressedFilters`. */
  readonly controls: readonly FilterControl[];
  /** The filter keys the controls commit. */
  readonly keys: ReadonlySet<string>;
  /** The address's filters narrowed to {@link keys}, as {@link narrowAddressedFilters}. */
  narrow(filters: CrudSearchFilters | undefined): CrudSearchFilters | undefined;
  /**
   * The `addressedFilters` option of `useCrudList` for a page's address, or `undefined` for a list
   * with no address. `forced` is the request the page imposes (a tab's), so a filter over a field it
   * pins is not applied.
   */
  addressed(address: ListAddress | undefined, forced?: Readonly<Record<string, unknown>>): AddressedFilters | undefined;
}

/**
 * Declares once what a list's address may carry, from its declared filters.
 *
 * <p>The generated list keeps the result in a module constant, exported beside its hook: the hook
 * hands {@link ListAddressDeclaration.addressed} to `useCrudList`, and a screen that links to the
 * list (a tile on a home page) reads {@link ListAddressDeclaration.narrow} and
 * {@link ListAddressDeclaration.controls} off the same constant, so the link and the list cannot
 * disagree about a key.
 *
 * @param defs the filters the entity declares, as the generated list states them
 * @param options what else decides which of them the list draws
 */
export function declareListAddress(defs: readonly ContractFilter[], options?: ListAddressOptions): ListAddressDeclaration {
  const controls = filterControlsOf(defs, options);
  const keys = declaredFilterKeys(defs, options);
  const narrow = (filters: CrudSearchFilters | undefined) => narrowAddressedFilters(defs, filters, options);
  return {
    controls,
    keys,
    narrow,
    addressed: (address, forced) =>
      address === undefined ? undefined : { value: narrow(address.value), onChange: address.onChange, controls, forced },
  };
}
