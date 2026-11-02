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
  readonly children: ReactNode;
}

/**
 * The site's window: the bar, the page and the footer. The window is the `page` container whose
 * width every part reflows by.
 */
export function SiteWindow({ bar, footer, page, linkComponent, children }: SiteWindowProps) {
  const main = useRef<HTMLElement>(null);
  const shown = useRef(page);
  useEffect(() => {
    if (shown.current === page) return;
    shown.current = page;
    main.current?.focus({ preventScroll: true });
  }, [page]);
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
