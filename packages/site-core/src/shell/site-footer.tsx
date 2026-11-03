import type { MouseEvent, ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteLink } from "../link/site-link";
import {
  siteSpacerStyle,
  siteFooterLanguageStyle,
  siteFooterLinkStyle,
  siteFooterLinksStyle,
  siteFooterOwnerStyle,
  siteFooterStyle,
  siteFooterThemeStyle,
} from "./site-shell.style";

/** One legal link in the footer. */
export interface SiteFooterLink {
  readonly key: string;
  readonly label: ReactNode;
  /**
   * The page's address. Absent while the page is not open yet: the link is drawn as plain text in
   * its place, so the footer keeps its shape and no link leads nowhere.
   */
  readonly href?: string;
  /** Drawn in full ink, for the link a law asks to stand out (a privacy policy). */
  readonly emphasis?: boolean;
  /** The page shown is this one. */
  readonly current?: boolean;
  readonly onSelect?: (event: MouseEvent<HTMLElement>) => void;
}

/** Props for {@link SiteFooter}. */
export interface SiteFooterProps {
  /** Who runs the site ("© <company>"). */
  readonly owner: ReactNode;
  readonly links: readonly SiteFooterLink[];
  /** The legal links' landmark name. */
  readonly linksLabel: string;
  /** The product's language picker, drawn at the footer's end. */
  readonly language?: ReactNode;
  /** The product's theme control (system, light, dark), drawn after the language picker. */
  readonly theme?: ReactNode;
}

/** The site's footer: the owner at its start, then the legal links, the language picker and the theme control. */
export function SiteFooter({ owner, links, linksLabel, language, theme }: SiteFooterProps) {
  return (
    <footer {...slotAttributes(siteFooterStyle, {})}>
      <span {...slotAttributes(siteFooterOwnerStyle, {})}>{owner}</span>
      <span {...slotAttributes(siteSpacerStyle, {})} aria-hidden="true" />
      <nav {...slotAttributes(siteFooterLinksStyle, {})} aria-label={linksLabel}>
        {links.map((link) =>
          link.href === undefined ? (
            <span key={link.key} {...slotAttributes(siteFooterLinkStyle, { emphasis: link.emphasis === true, pending: true })}>
              {link.label}
            </span>
          ) : (
            <SiteLink
              key={link.key}
              {...slotAttributes(siteFooterLinkStyle, { emphasis: link.emphasis === true })}
              href={link.href}
              aria-current={link.current ? "page" : undefined}
              onClick={link.onSelect}
            >
              {link.label}
            </SiteLink>
          ),
        )}
      </nav>
      {language !== undefined ? <div {...slotAttributes(siteFooterLanguageStyle, {})}>{language}</div> : null}
      {theme !== undefined ? <div {...slotAttributes(siteFooterThemeStyle, {})}>{theme}</div> : null}
    </footer>
  );
}
