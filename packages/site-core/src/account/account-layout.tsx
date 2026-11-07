import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { holdDroppedFocus } from "../form/question-focus";
import { SiteLink } from "../link/site-link";
import { siteAccountSectionStyle, siteAccountStyle, siteSectionHeadStyle, siteSectionNavItemStyle, siteSectionNavStyle } from "./account.style";

/** One section of {@link SectionNav}. */
export interface SectionNavItem {
  readonly key: string;
  readonly label: ReactNode;
  /**
   * The section's own address (`/account/credits`), so a section can be opened and shared. A section
   * that is not open yet has none and is drawn as its words in the list's place, offering no press.
   */
  readonly href?: string;
  readonly current?: boolean;
  /** A section that removes something (deleting the account), in the bad colour while not current. */
  readonly danger?: boolean;
  readonly onSelect?: (event: MouseEvent<HTMLElement>) => void;
}

/** Props for {@link SectionNav}. */
export interface SectionNavProps {
  /** The list's accessible name ("My account"). */
  readonly label: string;
  readonly items: readonly SectionNavItem[];
}

/**
 * The sections of My account as links, the current one marked as the page. A section without an
 * address (not open yet) keeps its place and its look as plain words, as the bar's pages do.
 */
export function SectionNav({ label, items }: SectionNavProps) {
  return (
    <nav {...slotAttributes(siteSectionNavStyle, {})} aria-label={label}>
      {items.map((item) => {
        const state = item.current === true ? "current" : item.danger === true ? "danger" : "plain";
        if (item.href === undefined) {
          return (
            <span key={item.key} {...slotAttributes(siteSectionNavItemStyle, { state, pending: true })}>
              {item.label}
            </span>
          );
        }
        return (
          <SiteLink key={item.key} {...slotAttributes(siteSectionNavItemStyle, { state })} href={item.href} aria-current={item.current === true ? "page" : undefined} onClick={item.onSelect}>
            {item.label}
          </SiteLink>
        );
      })}
    </nav>
  );
}

/** Props for {@link AccountLayout}. */
export interface AccountLayoutProps {
  /** The section list, a {@link SectionNav}. */
  readonly nav: ReactNode;
  /**
   * A state that holds over every section (a renewal that failed and is being retried), drawn above
   * the section's heading on every section: a `NoticeBanner` from `/legal`.
   */
  readonly standing?: ReactNode;
  /** The section: its {@link SectionHead}, then its parts. */
  readonly children: ReactNode;
}

/**
 * My account: the section list beside the section; below the medium tier the list stands over it.
 *
 * <p>A part of the section that goes away while it holds the focus (a notice whose action was
 * pressed, a row a question replaced) would drop the focus to the document; the section's heading
 * takes it then, so the reader stays in the section. A page that knows a better place moves the
 * focus on from there.
 */
export function AccountLayout({ nav, standing, children }: AccountLayoutProps) {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = section.current;
    if (node === null) return;
    const doc = node.ownerDocument;
    let focused: Element | null = null;
    const track = (event: FocusEvent) => {
      focused = event.target instanceof Element && node.contains(event.target) ? event.target : null;
    };
    const watch = new MutationObserver(() => {
      if (focused === null || focused.isConnected) return;
      focused = null;
      if (doc.activeElement !== null && doc.activeElement !== doc.body) return;
      const heading = node.querySelector<HTMLElement>("h1, h2");
      if (heading !== null) holdDroppedFocus(heading);
    });
    doc.addEventListener("focusin", track);
    watch.observe(node, { childList: true, subtree: true });
    return () => {
      doc.removeEventListener("focusin", track);
      watch.disconnect();
    };
  }, []);
  return (
    <div {...slotAttributes(siteAccountStyle, {})}>
      {nav}
      <section ref={section} {...slotAttributes(siteAccountSectionStyle, {})}>
        {standing}
        {children}
      </section>
    </div>
  );
}

/** Props for {@link SectionHead}. */
export interface SectionHeadProps {
  /**
   * `1` is the section's title where it is the page's heading (the account page has no title above
   * it, and its h1 names the tab); `2` is the section's title where a page title stands above it, or
   * a part's title under a level 1 section; `3` a part's title inside a level 2 section.
   */
  readonly level?: 1 | 2 | 3;
  readonly children: ReactNode;
}

/** A heading inside My account, in the display family. */
export function SectionHead({ level = 2, children }: SectionHeadProps) {
  const Tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
  // The section's title takes the focus a part of the section dropped (AccountLayout); never a Tab stop.
  return (
    <Tag tabIndex={level === 3 ? undefined : -1} {...slotAttributes(siteSectionHeadStyle, { level: String(level) })}>
      {children}
    </Tag>
  );
}
