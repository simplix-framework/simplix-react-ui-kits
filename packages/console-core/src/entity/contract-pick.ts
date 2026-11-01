import type { ContractField, ContractFilter } from "./record-contract";

/**
 * The contract fields a screen draws, in the order it names them. A name the contract does not
 * carry is skipped, so a field the backend drops leaves the screen instead of breaking it, and a
 * field the screen does not name is left out: only the drawn fields go to
 * `useRecordContract().columns`, so each later column appears at the width the earlier ones fill.
 *
 * <p>Where a name occurs in `fields` more than once, the first entry wins, so a screen that draws a
 * stored value differently puts its own field description ahead of the generated ones.
 *
 * @param fields the fields to choose from, usually the generated column fields of the entity
 * @param names the field names to draw, in the order to draw them
 */
export function pickFields<F extends Pick<ContractField, "name">>(fields: readonly F[], names: readonly string[]): F[] {
  const picked: F[] = [];
  for (const name of names) {
    const field = fields.find((candidate) => candidate.name === name);
    if (field) picked.push(field);
  }
  return picked;
}

/**
 * The contract filters on the fields a screen names, in the order it names them; a name no filter
 * is declared on is skipped.
 *
 * @param filters the filters to choose from
 * @param names the filtered field names, in the order the filter bar offers them
 */
export function pickFilters<F extends Pick<ContractFilter, "field">>(filters: readonly F[], names: readonly string[]): F[] {
  const picked: F[] = [];
  for (const name of names) {
    const filter = filters.find((candidate) => candidate.field === name);
    if (filter) picked.push(filter);
  }
  return picked;
}
