/** What {@link routesInPage} reads of a press: its button, its keys and whether a handler took it. */
export interface SitePress {
  readonly button: number;
  readonly metaKey: boolean;
  readonly ctrlKey: boolean;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
  readonly defaultPrevented: boolean;
}

/** What {@link routesInPage} reads of the anchor pressed. */
export interface SitePressedAnchor {
  /** A window the link opens in (`_blank`): the browser opens it. */
  readonly target?: string;
  /** A file the link saves: the browser saves it. */
  readonly download?: unknown;
}

/**
 * Whether a press on a site link is one the app's router answers in place: the main button with no
 * key that asks for a new tab or window, no handler that already took it, no window or download the
 * anchor names, and an address on the page's own origin. Every other press is left to the browser,
 * so a link to another site's file (an installer) or to the identity provider's pages simply opens
 * it, and a page never cancels the press to assign `window.location` by hand.
 *
 * @param href the anchor's address, absolute or relative to the page
 * @param origin the page's origin
 */
export function routesInPage(press: SitePress, href: string, anchor: SitePressedAnchor, origin: string = window.location.origin): boolean {
  if (press.defaultPrevented || press.button !== 0 || press.metaKey || press.ctrlKey || press.shiftKey || press.altKey) return false;
  if (anchor.target !== undefined || anchor.download !== undefined) return false;
  let url: URL;
  try {
    url = new URL(href, `${origin}/`);
  } catch (caught) {
    // An address the URL parser refuses is not one the router can name either.
    if (caught instanceof TypeError) return false;
    throw caught;
  }
  return url.origin === origin;
}
