// The terms of use composed from the site parts, with the text of the reference the kit's
// measurements were taken from (terms-copy.json: every article as written with its change marks,
// read off the reference's comparison in English and Korean). The same text draws the current
// version, the previous one and the comparison. The version select and the comparison switch are
// the product's controls, so the page stands boxes of their measured size in.
import type { CSSProperties, ReactNode } from "react";
import { DocText } from "@simplix-react-ui-kits/site-core/help";
import { ChangeList, ClauseList, DiffText, diffChanged, diffVisible, DocLayout, FilledText, InfoCard, InfoGrid, KeyValues, LegalArticle, NoticeBanner, PlainSummary, PrintButton, VersionPicker, type SiteDiffMode } from "@simplix-react-ui-kits/site-core/legal";
import { SiteBadge, SiteCaption, SiteChip } from "@simplix-react-ui-kits/site-core/page";
import { SiteBar, SiteFooter, SiteWindow } from "@simplix-react-ui-kits/site-core/shell";

import copyFile from "./terms-copy.json";
import { glyph, shellCopy, type Locale } from "./shell-copy";

/** What the terms are drawn with. */
export interface LegalFixtureProps {
  readonly locale?: Locale;
  /** The version read. */
  readonly version?: "current" | "previous";
  /** The changes against the previous version marked. */
  readonly compare?: boolean;
  /** The measured width of the product's version select. */
  readonly selectWidth?: number;
  readonly signedIn?: boolean;
  /** The terms, or the business information and refunds. */
  readonly view?: "terms" | "business";
  /** The measured heights of the business page's refund rules and refund steps, which are not this slice's parts. */
  readonly refundHeight?: number;
  readonly howHeight?: number;
}

const box = (height: number, extra: CSSProperties = {}): ReactNode => <span style={{ display: "block", height, ...extra }} />;
const stroke = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": true } as const;
const info = (
  <svg {...stroke}>
    <path d="M12 8h.01M11 12h1v4h1" />
  </svg>
);
const warn = (
  <svg {...stroke}>
    <path d="M12 9v4m0 4h.01M10 3 2 20h20z" />
  </svg>
);
const spark = (
  <svg {...stroke}>
    <path d="M12 3v4m0 10v4M3 12h4m10 0h4" />
  </svg>
);

export function LegalFixture({ locale = "en", version = "current", compare = false, selectWidth = 278, signedIn = false, view = "terms", refundHeight = 0, howHeight = 0 }: LegalFixtureProps) {
  const t = copyFile[locale];
  const shell = shellCopy[locale];
  if (view === "business") return <BusinessPage locale={locale} signedIn={signedIn} refundHeight={refundHeight} howHeight={howHeight} />;
  const mode: SiteDiffMode = version === "previous" ? "previous" : compare ? "diff" : "current";
  const placeholders = t.fields;
  const shown = t.articles.filter((article) => mode !== "previous" || !article.added);
  const toc = mode === "previous" ? t.toc.previous : mode === "diff" ? t.toc.diff : t.toc.current;
  return (
    <SiteWindow
      page="terms"
      bar={
        <SiteBar
          brand={glyph.brand}
          brandHref="/"
          brandLabel={shell.home}
          navLabel={shell.navLabel}
          moreLabel={shell.menu}
          links={[
            { key: "intro", label: shell.intro, href: "/" },
            { key: "pricing", label: shell.pricing, href: "/pricing" },
            { key: "download", label: shell.download, href: "/download" },
            { key: "help", label: shell.help, href: "/help" },
          ]}
          action={signedIn ? undefined : { id: "start", label: shell.startFree, href: "/signup" }}
          account={signedIn ? { label: shell.myAccount, name: "Taylor", href: "/account" } : undefined}
        />
      }
      footer={<SiteFooter owner={shell.company} linksLabel={shell.legal} links={shell.footerLinks.map((link) => (link.key === "terms" ? { ...link, current: true } : link))} language={box(30, { width: 122 })} />}
    >
      <DocLayout
        crumbs={t.crumbs.map((label, index) => ({ key: `c-${String(index)}`, label, ...(index < t.crumbs.length - 1 ? { href: "/help" } : {}) }))}
        crumbsLabel={t.navLabel}
        crumbSeparator={glyph.chevron}
        title={t.title}
        badge={
          <SiteBadge tone="warn" icon={warn} title={t.badgeTitle ?? undefined}>
            {t.badge}
          </SiteBadge>
        }
        controls={
          <>
            <VersionPicker
              select={box(34, { width: selectWidth })}
              compare={{ label: t.compare, control: box(18, { width: 30 }), disabled: version === "previous" }}
            />
            <PrintButton label={t.pdf} onPrint={() => {}} icon={glyph.download} />
          </>
        }
        notice={
          <>
            {mode === "previous" && t.oldBanner !== null ? (
              <NoticeBanner tone="warn" mark={warn} title={t.oldBanner.title} actions={[{ id: "current", label: t.oldBanner.action }]}>
                {t.oldBanner.body}
              </NoticeBanner>
            ) : null}
            {mode === "current" && t.newBanner !== null ? (
              <NoticeBanner tone="info" mark={info} title={t.newBanner.title} actions={[{ id: "changes", label: t.newBanner.action }]}>
                {t.newBanner.body}
              </NoticeBanner>
            ) : null}
            {mode === "diff" && t.panel !== null ? (
              <ChangeList title={t.panel.title} added={t.panel.added} removed={t.panel.removed} changes={t.panel.changes.map(([no, what]) => ({ key: no ?? "", no, what }))} />
            ) : null}
            <SiteCaption>{t.disclaimer}</SiteCaption>
          </>
        }
        tocTitle={t.tocTitle}
        toc={toc.map((entry, index) => ({ id: shown[index]?.id ?? `t-${String(index)}`, title: entry.title, ...(entry.no === null ? {} : { no: entry.no }), ...(entry.changed ? { changed: true } : {}) }))}
        current={null}
        onJump={() => {}}
        jump={box(34)}
        sideAction={{ id: "privacy", label: t.side, href: "/privacy" }}
      >
        {shown.map((article) => {
          const addendum = article.summary === null;
          const changed = article.added || diffChanged((article.summary ?? "") + article.clauses.join(""));
          const no = mode === "previous" ? (article.previousNo ?? article.no) : article.no;
          return (
            <LegalArticle
              key={article.id}
              id={article.id}
              kind={addendum ? "addendum" : "article"}
              no={no}
              title={article.title}
              added={mode === "diff" && article.added}
              {...(mode === "diff" && article.was !== null ? { was: article.was } : {})}
              {...(mode === "diff" && changed && article.tag !== null ? { tag: <SiteChip tone="good">{article.tag}</SiteChip> } : {})}
              {...(article.summary === null
                ? {}
                : {
                    summary: (
                      <PlainSummary label={t.summaryLabel} mark={spark}>
                        <DiffText text={article.summary} mode={mode} placeholders={placeholders} />
                      </PlainSummary>
                    ),
                  })}
            >
              <ClauseList
                items={article.clauses
                  .filter((clause) => diffVisible(clause, mode))
                  .map((clause) => ({ key: clause, content: <DiffText text={clause} mode={mode} placeholders={placeholders} /> }))}
              />
            </LegalArticle>
          );
        })}
      </DocLayout>
    </SiteWindow>
  );
}

/** The bar and footer every legal page shares. */
function LegalWindow({ locale, signedIn, page, children }: { readonly locale: Locale; readonly signedIn: boolean; readonly page: "terms" | "business"; readonly children: ReactNode }) {
  const shell = shellCopy[locale];
  return (
    <SiteWindow
      page={page}
      bar={
        <SiteBar
          brand={glyph.brand}
          brandHref="/"
          brandLabel={shell.home}
          navLabel={shell.navLabel}
          moreLabel={shell.menu}
          links={[
            { key: "intro", label: shell.intro, href: "/" },
            { key: "pricing", label: shell.pricing, href: "/pricing" },
            { key: "download", label: shell.download, href: "/download" },
            { key: "help", label: shell.help, href: "/help" },
          ]}
          action={signedIn ? undefined : { id: "start", label: shell.startFree, href: "/signup" }}
          account={signedIn ? { label: shell.myAccount, name: "Taylor", href: "/account" } : undefined}
        />
      }
      footer={<SiteFooter owner={shell.company} linksLabel={shell.legal} links={shell.footerLinks.map((link) => (link.key === page ? { ...link, current: true } : link))} language={box(30, { width: 122 })} />}
    >
      {children}
    </SiteWindow>
  );
}

/** The business information and refunds: the cards of labelled values are this slice's parts; the refund rules and steps stand in as boxes. */
function BusinessPage({ locale, signedIn, refundHeight, howHeight }: { readonly locale: Locale; readonly signedIn: boolean; readonly refundHeight: number; readonly howHeight: number }) {
  const terms = copyFile[locale];
  const t = terms.business;
  const ids = ["b-info", "b-refund", "b-how"];
  return (
    <LegalWindow locale={locale} signedIn={signedIn} page="business">
      <DocLayout
        crumbs={terms.crumbs.map((label, index) => ({ key: `c-${String(index)}`, label, ...(index < terms.crumbs.length - 1 ? { href: "/help" } : {}) }))}
        crumbsLabel={terms.navLabel}
        crumbSeparator={glyph.chevron}
        title={t.title}
        badge={
          <SiteBadge tone="warn" icon={warn} title={terms.badgeTitle ?? undefined}>
            {terms.badge}
          </SiteBadge>
        }
        controls={<PrintButton label={terms.pdf} onPrint={() => {}} icon={glyph.download} />}
        notice={<DocText tone="muted">{t.lede}</DocText>}
        tocTitle={t.tocTitle}
        toc={t.toc.map((title, index) => ({ id: ids[index] ?? title, title }))}
        current={null}
        onJump={() => {}}
        jump={box(34)}
      >
        <InfoGrid id="b-info">
          {t.cards.map((card) => (
            <InfoCard key={card.title} title={card.title} action={{ id: card.title, label: card.action, ...(card.primary ? { tone: "primary" as const, href: "/help" } : { tone: "quiet" as const }) }}>
              <KeyValues rows={card.rows.map(([label, value]) => ({ key: label ?? "", label, value: <FilledText text={value ?? ""} placeholders={t.fields} /> }))} />
            </InfoCard>
          ))}
        </InfoGrid>
        {box(refundHeight)}
        {box(howHeight)}
      </DocLayout>
    </LegalWindow>
  );
}

export default LegalFixture;
