import { useEffect, useRef, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteLinkProvider, type SiteLinkComponent } from "../link/site-link";
import { siteBandStyle, siteMainStyle, siteWindowStyle } from "./site-shell.style";

/** Props for {@link SiteWindow}. */
export interface SiteWindowProps {
  /** The bar, a {@link SiteBar}. */
  readonly bar: ReactNode;
  /** The footer, a {@link SiteFooter}. */
  readonly footer?: ReactNode;
  /**
   * The page shown, by a name the product picks. It is written on the window as `data-page`, where
   * a rendered check finds the page root, and a change of it moves the keyboard focus to the new
   * page, since the link that opened it went away with the old one.
   */
  readonly page: string;
  /** The product's router link, handed to every site part inside. */
  readonly linkComponent?: SiteLinkComponent;
  /**
   * The document's title for the page shown, from the text of the page's one heading (empty when it
   * draws none), so a tab, a bookmark and the history name the page and not only the product.
   * Left out, the document keeps the title its HTML gives.
   */
  readonly title?: (heading: string) => string;
  readonly children: ReactNode;
}

/**
 * The text of the page's heading: the first `h1` under `root` as it reads on screen (a line break
 * inside it, such as a hero's accent line, is a space), its spaces folded; empty without one.
 */
export function pageHeading(root: Pick<ParentNode, "querySelector"> | null): string {
  const heading = root?.querySelector("h1");
  const text = (heading as { readonly innerText?: string } | null | undefined)?.innerText ?? heading?.textContent ?? "";
  return text.replace(/\s+/g, " ").trim();
}

/**
 * The site's window: the bar, the page and the footer. The window is the `page` container whose
 * width every part reflows by.
 */
export function SiteWindow({ bar, footer, page, linkComponent, title, children }: SiteWindowProps) {
  const main = useRef<HTMLElement>(null);
  const shown = useRef(page);
  useEffect(() => {
    if (shown.current === page) return;
    shown.current = page;
    main.current?.focus({ preventScroll: true });
  }, [page]);
  // After every drawing: the heading follows the page, its language and the data it names.
  useEffect(() => {
    if (title === undefined) return;
    const next = title(pageHeading(main.current));
    if (document.title !== next) document.title = next;
  });
  return (
    <SiteLinkProvider component={linkComponent}>
      <div {...slotAttributes(siteWindowStyle, {})} data-page={page}>
        {bar}
        <main {...slotAttributes(siteMainStyle, {})} ref={main} tabIndex={-1}>
          {children}
        </main>
        {footer}
      </div>
    </SiteLinkProvider>
  );
}

/** Props for {@link SiteBand}. */
export interface SiteBandProps {
  /** The ground the band is drawn on. */
  readonly tone: "dark";
  readonly children: ReactNode;
}

/**
 * A band of the page on the dark ground, such as a hero the bar continues into. Every site part
 * inside it reads the band's ground, ink, line and accent.
 */
export function SiteBand({ tone, children }: SiteBandProps) {
  return (
    <div {...slotAttributes(siteBandStyle, {})} data-band={tone}>
      {children}
    </div>
  );
}
