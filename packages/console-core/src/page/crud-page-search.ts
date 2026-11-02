/**
 * The text an address asks the list to be searched for, or undefined when there is none to type or
 * it was typed already: the page types `?q=` once per value, so what the reader types afterwards
 * stands until the address names another text.
 *
 * @param q the address's `?q=`
 * @param typed the text the page typed last, if any
 */
export function searchToType(q: string | undefined, typed: string | undefined): string | undefined {
  return q !== undefined && q !== typed ? q : undefined;
}
