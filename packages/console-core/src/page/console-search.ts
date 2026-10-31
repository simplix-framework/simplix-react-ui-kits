import { validateCrudSearch } from "@simplix-react/ui";

import type { ConsoleSearch } from "./types";

const text = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);

/**
 * Reads a console page's address from a router's search object: the crud fields, and the
 * explanation and overlays a console page opens (`?help=`, `?gap=`, `?grant=`), so a reload or a
 * shared link lands on what the reader was looking at.
 *
 * @param search the router's raw search object
 * @returns the address, with every field the page does not take left out
 */
export function validateConsoleSearch(search: Record<string, unknown>): ConsoleSearch {
  const help = text(search.help);
  const gap = text(search.gap);
  const grant = text(search.grant);
  return {
    ...validateCrudSearch(search),
    ...(help !== undefined ? { help } : {}),
    ...(gap !== undefined ? { gap } : {}),
    ...(grant !== undefined ? { grant } : {}),
  };
}
