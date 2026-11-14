import { useCallback, useState, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import { SiteSelect } from "../form/select";

import { SiteBreadcrumb, SitePage, type SiteBreadcrumbStep } from "../page/site-page";

import { siteDocActionStyle } from "../help/article.style";
import { siteDocStyle, siteDocHeadStyle, siteTocTitleStyle, siteDocSideStyle, siteTocButtonStyle, siteTocJumpStyle, siteDocTitleStyle, siteDocBodyStyle, siteTocItemStyle, siteDocRailStyle, siteDocRailTitleStyle, siteTocDoneStyle, siteDocTitleRowStyle, siteTocStyle, siteTocChangedStyle, siteTocNumberStyle, siteDocControlsStyle } from "./doc-layout.style";

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
  /**
   * The entry's words in the jump select below the medium tier. Left out, they are the number and the
   * title when both are words (`"Article 3 Payment"`); an entry whose title is not words names itself here.
   */
  readonly label?: string;
}

/** The words an entry stands under in the jump select, or none when its title is not words. */
function jumpLabel(entry: SiteTocEntry): string | undefined {
  if (entry.label !== undefined) return entry.label;
  if (typeof entry.title !== "string") return undefined;
  return typeof entry.no === "string" || typeof entry.no === "number" ? `${entry.no} ${entry.title}` : entry.title;
}

/**
 * The section a reader jumped to, and the jump: the section scrolls into view, smoothly unless the
 * reader asks for less motion, and the rail and the jump select mark it. A document page hands both
 * to {@link DocLayout}.
 */
export function useDocJump(): { readonly current: string | null; readonly jump: (id: string) => void } {
  const [current, setCurrent] = useState<string | null>(null);
  const jump = useCallback((id: string) => {
    setCurrent(id);
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, []);
  return { current, jump };
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
  /**
   * The jump control drawn below the medium tier. Left out, the layout draws a select over the same
   * sections named by the rail's title, whose entries all have words ({@link SiteTocEntry.label}).
   */
  readonly jump?: ReactNode;
  /** What the rail holds under the list (progress through the steps). */
  readonly side?: ReactNode;
  /** A small action under the rail's list, such as a link to the other policy or a way to ask. */
  readonly sideAction?: SiteActionSpec;
  /** The document's sections. */
  readonly children: ReactNode;
}

/**
 * A document page (a legal text, a help article): the trail, the title with its badge and controls,
 * a notice, then the contents rail beside the sections. Below the medium tier the rail spans the
 * column above the sections and its list gives way to the product's jump control.
 */
export function DocLayout({ crumbs, crumbsLabel, crumbSeparator, title, badge, controls, notice, tocTitle, toc, current, onJump, doneMark, jump, side, sideAction, children }: DocLayoutProps) {
  const labels = toc.map(jumpLabel);
  const select =
    jump ??
    (toc.length > 0 && labels.every((label) => label !== undefined) ? (
      <SiteSelect label={tocTitle} block value={current ?? toc[0]?.id ?? null} onValueChange={onJump} options={toc.map((entry, index) => ({ value: entry.id, label: labels[index] ?? "" }))} />
    ) : undefined);
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
          {select !== undefined ? <div {...slotAttributes(siteTocJumpStyle, {})}>{select}</div> : null}
          {side !== undefined ? <div {...slotAttributes(siteDocSideStyle, {})}>{side}</div> : null}
          {sideAction !== undefined ? (
            <span {...slotAttributes(siteDocActionStyle, {})}>
              <SiteAction {...sideAction} size="sm" />
            </span>
          ) : null}
        </nav>
        <div {...slotAttributes(siteDocStyle, {})}>{children}</div>
      </div>
    </SitePage>
  );
}
