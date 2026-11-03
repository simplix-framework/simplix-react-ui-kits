import { Fragment, useId, type MouseEvent, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteLink } from "../link/site-link";
import {
  siteBreadcrumbItemStyle,
  siteBreadcrumbLinkStyle,
  siteBreadcrumbListStyle,
  siteBreadcrumbSeparatorStyle,
  siteBreadcrumbStyle,
  sitePageEyebrowStyle,
  sitePageHeadStyle,
  sitePageLedeStyle,
  sitePageStyle,
  sitePageTitleStyle,
  siteSectionHeadingStyle,
  siteSectionLedeStyle,
  siteSectionStyle,
} from "./site-page.style";

/** Props for {@link SitePage}. */
export interface SitePageProps {
  /**
   * `spaced` sets the parts under a band that holds the page's head further apart, `open` a
   * marketing page's sections further still, `steps` a purchase's steps a little closer, and `done`
   * centres a page that says a step is finished; `page` is every other page.
   */
  readonly rhythm?: "page" | "spaced" | "open" | "steps" | "done";
  readonly children: ReactNode;
}

/** The page column: centred, as wide as the wide tier at most, its regions one gap apart. */
export function SitePage({ rhythm, children }: SitePageProps) {
  return <div {...slotAttributes(sitePageStyle, { rhythm })}>{children}</div>;
}

/** Props for {@link SitePageHead}. */
export interface SitePageHeadProps {
  readonly title: ReactNode;
  /** The sentence saying what the page is for. */
  readonly lede?: ReactNode;
  /** A short line above the title naming the page's group. */
  readonly eyebrow?: ReactNode;
}

/** The page's head: the page's one `h1`, with its lede under it. */
export function SitePageHead({ title, lede, eyebrow }: SitePageHeadProps) {
  return (
    <div {...slotAttributes(sitePageHeadStyle, {})}>
      {eyebrow !== undefined ? <p {...slotAttributes(sitePageEyebrowStyle, {})}>{eyebrow}</p> : null}
      <h1 {...slotAttributes(sitePageTitleStyle, {})}>{title}</h1>
      {lede !== undefined ? <p {...slotAttributes(sitePageLedeStyle, {})}>{lede}</p> : null}
    </div>
  );
}

/** Props for {@link SiteSection}. */
export interface SiteSectionProps {
  /** The section's heading; the section is named by it. */
  readonly heading: ReactNode;
  readonly lede?: ReactNode;
  /** `lg` opens a part of the page in the display family; `md` is a plain heading. */
  readonly size?: "md" | "lg";
  readonly children: ReactNode;
}

/** A section of a page, named by its `h2`. */
export function SiteSection({ heading, lede, size, children }: SiteSectionProps) {
  const id = useId();
  return (
    <section {...slotAttributes(siteSectionStyle, {})} aria-labelledby={id}>
      <h2 {...slotAttributes(siteSectionHeadingStyle, { size })} id={id}>
        {heading}
      </h2>
      {lede !== undefined ? <p {...slotAttributes(siteSectionLedeStyle, {})}>{lede}</p> : null}
      {children}
    </section>
  );
}

/** One step of a breadcrumb trail. */
export interface SiteBreadcrumbStep {
  readonly key: string;
  readonly label: ReactNode;
  /** The page the step opens; the last step, the page shown, has none. */
  readonly href?: string;
  readonly onSelect?: (event: MouseEvent<HTMLElement>) => void;
}

/** Props for {@link SiteBreadcrumb}. */
export interface SiteBreadcrumbProps {
  /** From the site's top to the page shown. */
  readonly steps: readonly SiteBreadcrumbStep[];
  /** The trail's landmark name. */
  readonly label: string;
  /** What stands between two steps, a chevron the product draws; a slash otherwise. */
  readonly separator?: ReactNode;
}

/** The trail from the site's top to the page shown, the last step marked as the current page. */
export function SiteBreadcrumb({ steps, label, separator = "/" }: SiteBreadcrumbProps) {
  return (
    <nav {...slotAttributes(siteBreadcrumbStyle, {})} aria-label={label}>
      <ol {...slotAttributes(siteBreadcrumbListStyle, {})}>
        {steps.map((step, index) => {
          const current = index === steps.length - 1;
          return (
            <Fragment key={step.key}>
              {index > 0 ? (
                <li {...slotAttributes(siteBreadcrumbSeparatorStyle, {})} aria-hidden="true">
                  {separator}
                </li>
              ) : null}
              <li {...slotAttributes(siteBreadcrumbItemStyle, { current })} aria-current={current ? "page" : undefined}>
                {step.href !== undefined && !current ? (
                  <SiteLink {...slotAttributes(siteBreadcrumbLinkStyle, {})} href={step.href} onClick={step.onSelect}>
                    {step.label}
                  </SiteLink>
                ) : (
                  step.label
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
