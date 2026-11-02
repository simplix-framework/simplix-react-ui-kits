import type { ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteBreadcrumb, SitePage, type SiteBreadcrumbStep } from "../page/site-page";
import {
  siteDocBodyStyle,
  siteDocControlsStyle,
  siteDocHeadStyle,
  siteDocRailStyle,
  siteDocRailTitleStyle,
  siteDocSideStyle,
  siteDocStyle,
  siteDocTitleRowStyle,
  siteDocTitleStyle,
  siteTocButtonStyle,
  siteTocChangedStyle,
  siteTocDoneStyle,
  siteTocItemStyle,
  siteTocJumpStyle,
  siteTocNumberStyle,
  siteTocStyle,
  siteTocTitleStyle,
} from "./legal.style";

/** One section of a document's contents. */
export interface SiteTocEntry {
  /** The section's id, which the rail's button jumps to. */
  readonly id: string;
  /** Its number ("Article 3", "1"), in the mono family. */
  readonly no?: ReactNode;
  readonly title: ReactNode;
  /** A section that changed against the previous version, marked with a dot. */
  readonly changed?: boolean;
  /** A step the reader marked as tried, marked with a tick. */
  readonly done?: boolean;
}

/** Props for {@link DocLayout}. */
export interface DocLayoutProps {
  /** The trail from the site's top to the document. */
  readonly crumbs: readonly SiteBreadcrumbStep[];
  readonly crumbsLabel: string;
  /** What stands between two crumbs, a chevron the product draws. */
  readonly crumbSeparator?: ReactNode;
  readonly title: ReactNode;
  /** A badge beside the title (a draft mark). */
  readonly badge?: ReactNode;
  /** The document's controls: the version, the comparison, saving as a PDF. */
  readonly controls?: ReactNode;
  /** What stands under the head: the article's meta and lead, a notice about the version. */
  readonly notice?: ReactNode;
  /** The rail's title; the rail is named by it. */
  readonly tocTitle: string;
  readonly toc: readonly SiteTocEntry[];
  /** The section in view, by id. */
  readonly current: string | null;
  readonly onJump: (id: string) => void;
  /** What a done section's tick is, a glyph the product draws. */
  readonly doneMark?: ReactNode;
  /** The product's jump control (a select over the same sections), drawn below the medium tier. */
  readonly jump?: ReactNode;
  /** What the rail holds under the list. */
  readonly side?: ReactNode;
  /** The document's sections. */
  readonly children: ReactNode;
}

/**
 * A document page (a legal text, a help article): the trail, the title with its badge and controls,
 * a notice, then the contents rail beside the sections. Below the medium tier the rail spans the
 * column above the sections and its list gives way to the product's jump control.
 */
export function DocLayout({ crumbs, crumbsLabel, crumbSeparator, title, badge, controls, notice, tocTitle, toc, current, onJump, doneMark, jump, side, children }: DocLayoutProps) {
  return (
    <SitePage>
      <SiteBreadcrumb steps={crumbs} label={crumbsLabel} separator={crumbSeparator} />
      <header {...slotAttributes(siteDocHeadStyle, {})}>
        <div {...slotAttributes(siteDocTitleRowStyle, {})}>
          <h1 {...slotAttributes(siteDocTitleStyle, {})}>{title}</h1>
          {badge}
        </div>
        {controls !== undefined ? <div {...slotAttributes(siteDocControlsStyle, {})}>{controls}</div> : null}
        {notice}
      </header>
      <div {...slotAttributes(siteDocBodyStyle, {})}>
        <nav {...slotAttributes(siteDocRailStyle, {})} aria-label={tocTitle}>
          <span {...slotAttributes(siteDocRailTitleStyle, {})}>{tocTitle}</span>
          <ol {...slotAttributes(siteTocStyle, {})}>
            {toc.map((entry) => (
              <li key={entry.id} {...slotAttributes(siteTocItemStyle, {})}>
                <button {...slotAttributes(siteTocButtonStyle, { current: current === entry.id })} type="button" aria-current={current === entry.id ? "location" : undefined} onClick={() => onJump(entry.id)}>
                  {entry.no !== undefined ? <span {...slotAttributes(siteTocNumberStyle, {})}>{entry.no}</span> : null}
                  <span {...slotAttributes(siteTocTitleStyle, {})}>{entry.title}</span>
                  {entry.changed === true ? <i {...slotAttributes(siteTocChangedStyle, {})} aria-hidden="true" /> : null}
                  {entry.done === true ? (
                    <span {...slotAttributes(siteTocDoneStyle, {})} aria-hidden="true">
                      {doneMark}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ol>
          {jump !== undefined ? <div {...slotAttributes(siteTocJumpStyle, {})}>{jump}</div> : null}
          {side !== undefined ? <div {...slotAttributes(siteDocSideStyle, {})}>{side}</div> : null}
        </nav>
        <div {...slotAttributes(siteDocStyle, {})}>{children}</div>
      </div>
    </SitePage>
  );
}
