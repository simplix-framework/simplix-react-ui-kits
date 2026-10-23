import { createContext, useContext, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, Button } from "@simplix-react/ui";

/**
 * Where the way back out of the screen at this address goes, and what it is called.
 *
 * <p>Resolved by whoever owns the console's menu tree and supplied through
 * {@link PageBackProvider} — this pack is layer 1 and knows no product's navigation, and the tree
 * is the only thing that can answer whether a screen has a row of its own to be returned to.
 */
export interface PageBackTarget {
  /** Where it goes, in the router's `$param` spelling. */
  readonly to: string;
  /** What the menu calls that destination, in the language the console is being read in. */
  readonly label: string;
  /** The segments of `to` the current address already supplies. */
  readonly params: Readonly<Record<string, string>>;
  /**
   * The segments of `to` nothing on this address supplies.
   *
   * <p>Listed rather than guessed. Until every one of them has a value the link is not drawn, so a
   * breadcrumb can never land on an address with a hole in it.
   */
  readonly missing: readonly string[];
}

const PageBackContext = createContext<PageBackTarget | undefined>(undefined);

/**
 * Supplies the way back for the address currently on screen.
 *
 * <p><b>Mounted inside the router, by the app that owns the menu.</b> An app that mounts nothing
 * draws no breadcrumbs, which is the right answer for a shell with no menu column — the kiosk and
 * the worker app have one screen at a time and their own way back.
 */
export const PageBackProvider = PageBackContext.Provider;

/**
 * The breadcrumb above a screen's title, derived rather than written on the screen.
 *
 * <p><b>No screen states its own way back.</b> Where it goes is decided by the menu row the address
 * hangs off, and a screen that is a menu row of its own gets none — the column already returns the
 * reader. Written per screen it was wrong on seven of the ten screens that wrote one, all of them
 * pointing sideways at a destination the menu already carried.
 *
 * <p><b>It hugs its content at the left edge of the title.</b> `size="link"` centres what it holds,
 * and stretched across a stack as wide as the heading that put the arrow fifty pixels in from the
 * title it sits over — a caption floating in the middle rather than a breadcrumb.
 *
 * @param supplied the segments of the destination this screen has to hand over itself
 * @returns the link, or nothing where this screen owes no way back
 */
export function usePageBackLink(supplied?: Readonly<Record<string, string>>): ReactNode {
  const target = useContext(PageBackContext);
  if (!target) return undefined;
  const params = { ...target.params, ...supplied };
  if (target.missing.some((name) => params[name] === undefined)) return undefined;
  return (
    <Button variant="link" size="link" tone="muted" asChild className="self-start">
      <Link to={target.to} params={params}>
        <ArrowLeftIcon />
        {target.label}
      </Link>
    </Button>
  );
}
