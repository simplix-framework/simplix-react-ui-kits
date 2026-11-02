import { createContext, createElement, useContext, type AnchorHTMLAttributes, type ReactElement, type ReactNode } from "react";

/**
 * What a site part hands the link it draws: an address and the anchor's own attributes. It carries no
 * `ref`: no part hands one, and a `Ref` type is unique to the copy of the React types that declares
 * it, so an app resolving its own copy could not pass these props on to its anchor.
 */
export interface SiteLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The address the link opens; a router link resolves it as its own route. */
  readonly href: string;
  readonly children?: ReactNode;
}

/**
 * The element a product's router draws a link with. It receives every attribute a site part sets
 * (the slot marks, `aria-current`, the handlers) and must pass them on to the anchor it renders, so
 * the design's rules reach it.
 */
export type SiteLinkComponent = (props: SiteLinkProps) => ReactElement | null;

/** A plain anchor: the link a site draws when the product names no router link. */
export function PlainSiteLink(props: SiteLinkProps): ReactElement {
  return createElement("a", props);
}

const SiteLinkContext = createContext<SiteLinkComponent>(PlainSiteLink);

/** Props for {@link SiteLinkProvider}. */
export interface SiteLinkProviderProps {
  /** The product's router link; a plain anchor when absent. */
  readonly component?: SiteLinkComponent;
  readonly children?: ReactNode;
}

/**
 * Hands every site part below it the element links are drawn with, so the kit names no router and
 * every part's links still navigate the product's way.
 */
export function SiteLinkProvider({ component, children }: SiteLinkProviderProps) {
  return createElement(SiteLinkContext.Provider, { value: component ?? PlainSiteLink }, children);
}

/** The link element the nearest {@link SiteLinkProvider} names. */
export function useSiteLink(): SiteLinkComponent {
  return useContext(SiteLinkContext);
}

/** Draws a link with the element the nearest {@link SiteLinkProvider} names. */
export function SiteLink(props: SiteLinkProps) {
  const Link = useSiteLink();
  return createElement(Link, props);
}
