import { forcedScope } from "@simplix-react/ui";

/**
 * The scope a list hands `useCrudList` as its `scopeKey`: the request its page forces, and the tab the
 * page has open.
 *
 * <p>The list's page index belongs to one set of rows. A tab that forces its own request changes that
 * set, and so does a tab with a body of its own (a settings form, a history table) that the reader
 * leaves the list for and comes back from: the list hook is held by the page, so it outlives the tab
 * and would keep the page it was left on. Putting both in the scope returns the list to its first page
 * whenever either changes.
 *
 * <p>Returns `undefined` for a list with neither, which keeps its page for as long as it is mounted.
 *
 * @param forced the parameters the page forces into every request, if any
 * @param tab the page's open tab, as its address carries it, if the page has tabs
 */
export function listScopeOf(forced: Readonly<Record<string, unknown>> | undefined, tab: string | undefined): string | undefined {
  if (forced === undefined && tab === undefined) return undefined;
  return `${forced === undefined ? "" : forcedScope({ ...forced })}|${tab ?? ""}`;
}
