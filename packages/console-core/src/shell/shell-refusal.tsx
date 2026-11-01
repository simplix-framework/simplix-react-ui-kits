import type { ComponentType, ReactElement } from "react";
import { Stack } from "@simplix-react/ui";

import { useSelfAccessRefusal, type SelfAccessRefusal } from "./self-access";

/** The pages a shell may draw in place of itself, keyed by the error code of a refused self read. */
export type ShellRefusalPages = Readonly<Record<string, ComponentType>>;

/** The key a shell's blocks state to name the refusals it draws a page for. */
export interface ShellRefusalBlocks {
  /**
   * The page drawn in place of the shell while the server refuses the operator's own read, keyed by
   * the error code its envelope carries. A refusal with no entry here, and a shell that states
   * none, leave the shell as it is.
   */
  readonly refusalPages?: ShellRefusalPages;
}

/**
 * The screen a shell draws for a refusal, or null where the shell stands.
 *
 * <p>The code is looked up as an own key: it arrives from the server, and a name such as
 * `constructor` must not resolve to something on the object's prototype.
 *
 * @param pages the pages the shell names, by error code
 * @param refusal how the server last refused the self read
 * @returns the named page at the height of the window, or null
 */
export function refusalScreenFor(pages: ShellRefusalPages | undefined, refusal: SelfAccessRefusal | null): ReactElement | null {
  const code = refusal?.errorCode;
  if (pages === undefined || code === undefined || !Object.hasOwn(pages, code)) return null;
  const Page = pages[code];
  // The window height is supplied here: a root layout replaces the whole shell, so there is no
  // console around the page to fill (`RouteErrorFallback` is the same mount).
  return (
    <Stack className="min-h-dvh">
      <Page />
    </Stack>
  );
}

/**
 * The page a shell draws in place of itself while the server refuses the operator's own read for a
 * reason the app names, or null while the shell stands.
 *
 * <p>Every read behind the shell is refused the same way in that state, so a console drawn over
 * it only repeats the refusal in each panel. The shell calls this before it picks a layout, so a
 * refusal wins over the sign-in shell and the window alike.
 *
 * @param pages the pages the app names, by error code (`blocks.refusalPages`)
 * @returns the screen to return from the root layout, or null
 */
export function useShellRefusalScreen(pages: ShellRefusalPages | undefined): ReactElement | null {
  return refusalScreenFor(pages, useSelfAccessRefusal());
}
