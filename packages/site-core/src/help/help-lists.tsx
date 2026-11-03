import type { MouseEvent, ReactNode } from "react";
import { slotAttributes, type SlotStyle } from "@simplix-react/ui/design";

import { SiteLink } from "../link/site-link";
import {
  siteArticleLinkStyle,
  siteArticleListHeadStyle,
  siteArticleListStyle,
  siteArticleMetaStyle,
  siteArticleNameStyle,
  siteArticleNumberStyle,
  siteArticleRowsStyle,
  siteArticleRowStyle,
  siteArticleListTitleStyle,
  siteCategoryCountStyle,
  siteCategoryGridStyle,
  siteCategoryItemStyle,
  siteCategoryLinkStyle,
  siteCategoryListStyle,
  siteCategoryStyle,
  siteCategoryTitleStyle,
  siteColumnsStyle,
  siteLinkMarkStyle,
  siteLinkTextStyle,
} from "./help.style";

/** An article a list links to. */
export interface SiteArticleLink {
  readonly key: string;
  readonly title: ReactNode;
  /**
   * The address the article opens at. Left out for an article that is not written yet: its title is
   * drawn in the same place as plain text (`data-pending`), so the list keeps its look and no link
   * leads nowhere.
   */
  readonly href?: string;
  readonly onSelect?: (event: MouseEvent<HTMLElement>) => void;
}

/** A slot style with the `pending` variant every article link carries. */
type ArticleLinkStyle = SlotStyle<{ pending: Record<"true" | "false", string> }>;

/**
 * An article's link, or its words as plain text in the link's place when it has no address yet.
 * Shared by the lists that name articles (categories, most read, related).
 */
export function ArticleAnchor({ style, href, onSelect, children }: { readonly style: ArticleLinkStyle; readonly href?: string; readonly onSelect?: (event: MouseEvent<HTMLElement>) => void; readonly children: ReactNode }) {
  if (href === undefined) return <span {...slotAttributes(style, { pending: true })}>{children}</span>;
  return (
    <SiteLink {...slotAttributes(style, { pending: false })} href={href} onClick={onSelect}>
      {children}
    </SiteLink>
  );
}

/** One category of a {@link CategoryGrid}. */
export interface SiteCategory {
  readonly key: string;
  /** The category's name; the card is named by it. */
  readonly title: string;
  /** How many articles it holds ("5 articles"). */
  readonly count?: ReactNode;
  readonly articles: readonly SiteArticleLink[];
}

/** Props for {@link CategoryGrid}. */
export interface CategoryGridProps {
  readonly categories: readonly SiteCategory[];
}

/** The help categories on cards, each with its articles as links: five to a row, two below the medium tier, one below the narrow tier. */
export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div {...slotAttributes(siteCategoryGridStyle, {})}>
      {categories.map((category) => (
        <section key={category.key} {...slotAttributes(siteCategoryStyle, {})} aria-label={category.title}>
          <b {...slotAttributes(siteCategoryTitleStyle, {})}>{category.title}</b>
          {category.count !== undefined ? <small {...slotAttributes(siteCategoryCountStyle, {})}>{category.count}</small> : null}
          <ul {...slotAttributes(siteCategoryListStyle, {})}>
            {category.articles.map((article) => (
              <li key={article.key} {...slotAttributes(siteCategoryItemStyle, {})}>
                <ArticleAnchor style={siteCategoryLinkStyle} href={article.href} onSelect={article.onSelect}>
                  {article.title}
                </ArticleAnchor>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** One row of an {@link ArticleList}. */
export interface SiteArticleRow extends SiteArticleLink {
  /** Where the article is and how many read it. */
  readonly meta?: ReactNode;
}

/** Props for {@link ArticleList}. */
export interface ArticleListProps {
  /** The list's heading; the card is named by it. */
  readonly title: string;
  /** A badge beside the heading ("This week"), such as a `SiteChip`. */
  readonly badge?: ReactNode;
  readonly items: readonly SiteArticleRow[];
  /** The chevron at the end of each row, a glyph the product draws. */
  readonly mark?: ReactNode;
}

/** A numbered list of articles on a card (the most read): each row its number, title, where it is and a chevron. */
export function ArticleList({ title, badge, items, mark }: ArticleListProps) {
  return (
    <section {...slotAttributes(siteArticleListStyle, {})} aria-label={title}>
      <div {...slotAttributes(siteArticleListHeadStyle, {})}>
        <h2 {...slotAttributes(siteArticleListTitleStyle, {})}>{title}</h2>
        {badge}
      </div>
      <ol {...slotAttributes(siteArticleRowsStyle, {})}>
        {items.map((item, index) => (
          <li key={item.key} {...slotAttributes(siteArticleRowStyle, {})}>
            <ArticleAnchor style={siteArticleLinkStyle} href={item.href} onSelect={item.onSelect}>
              <span {...slotAttributes(siteArticleNumberStyle, {})}>{String(index + 1).padStart(2, "0")}</span>
              <span {...slotAttributes(siteLinkTextStyle, {})}>
                <b {...slotAttributes(siteArticleNameStyle, {})}>{item.title}</b>
                {item.meta !== undefined ? <span {...slotAttributes(siteArticleMetaStyle, {})}>{item.meta}</span> : null}
              </span>
              {mark !== undefined ? (
                <span {...slotAttributes(siteLinkMarkStyle, {})} aria-hidden="true">
                  {mark}
                </span>
              ) : null}
            </ArticleAnchor>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Props for {@link SiteColumns}. */
export interface SiteColumnsProps {
  readonly children: ReactNode;
}

/** Two parts side by side with their tops aligned; one under the other below the medium tier. */
export function SiteColumns({ children }: SiteColumnsProps) {
  return <div {...slotAttributes(siteColumnsStyle, {})}>{children}</div>;
}
