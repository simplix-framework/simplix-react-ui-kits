import { validateCrudSearch } from "@simplix-react/ui";

import type { ConsoleSearch } from "./types";

const text = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);

/**
 * Reads a console page's address from a router's search object: the crud fields, and the
 * explanation and overlays a console page opens (`?help=`, `?gap=`, `?grant=`) and the text its list
 * opens searched for (`?q=`), so a reload or a shared link lands on what the reader was looking at.
 *
 * <p>Every field is written, `undefined` where the address holds no value the page takes: a router
 * lays a route's search over the raw address, so a field left out would keep whatever the address
 * held (`?q=7` reaching the list as a number).
 *
 * @param search the router's raw search object
 * @returns the address, with every field the page does not take set to `undefined`
 */
export function validateConsoleSearch(search: Record<string, unknown>): ConsoleSearch {
  const q = text(search.q);
  return {
    ...validateCrudSearch(search),
    help: text(search.help),
    gap: text(search.gap),
    grant: text(search.grant),
    q: q !== undefined && q.trim() !== "" ? q : undefined,
  };
}
