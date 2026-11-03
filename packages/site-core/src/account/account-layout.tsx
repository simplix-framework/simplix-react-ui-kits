import type { MouseEvent, ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

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

/** My account: the section list beside the section; below the medium tier the list stands over it. */
export function AccountLayout({ nav, standing, children }: AccountLayoutProps) {
  return (
    <div {...slotAttributes(siteAccountStyle, {})}>
      {nav}
      <section {...slotAttributes(siteAccountSectionStyle, {})}>
        {standing}
        {children}
      </section>
    </div>
  );
}

/** Props for {@link SectionHead}. */
export interface SectionHeadProps {
  /** `2` is the section's title; `3` a part's title inside it. */
  readonly level?: 2 | 3;
  readonly children: ReactNode;
}

/** A heading inside My account, in the display family. */
export function SectionHead({ level = 2, children }: SectionHeadProps) {
  const Tag = level === 2 ? "h2" : "h3";
  return <Tag {...slotAttributes(siteSectionHeadStyle, { level: String(level) })}>{children}</Tag>;
}
