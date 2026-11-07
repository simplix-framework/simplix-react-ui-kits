import type { ComponentType } from "react";

/** The pages a site draws in place of its whole window, keyed by the error code of a refused self read. */
export type SiteRefusalPages = Readonly<Record<string, ComponentType>>;

/**
 * The page a site draws in place of its window while the server refuses the signed-in identity's own
 * read for a reason the app names, or undefined while the window stands. Every read behind the window
 * is refused the same way in that state, so a window drawn over it only repeats the refusal.
 *
 * <p>The code is looked up as an own key: it arrives from the server, and a name such as
 * `constructor` must not resolve to something on the object's prototype.
 *
 * @param pages the pages the app names, by error code
 * @param refusal how the server last refused the self read (the boot access extension's
 *   `useSelfAccessRefusal()`), or null
 */
export function refusalPageFor(pages: SiteRefusalPages | undefined, refusal: { readonly errorCode?: string } | null): ComponentType | undefined {
  const code = refusal?.errorCode;
  if (pages === undefined || code === undefined || !Object.hasOwn(pages, code)) return undefined;
  return pages[code];
}
