// The terms of use composed from the site parts, with the text of the reference the kit's
// measurements were taken from (terms-copy.json: every article as written with its change marks,
// read off the reference's comparison in English and Korean). The same text draws the current
// version, the previous one and the comparison. The words are the reference product's own, kept as
// written because where a line wraps is part of what is measured. The version select and the comparison switch are
// the product's controls, so the page stands boxes of their measured size in. The privacy policy and the business
// page's refund rules, calculator and steps carry the reference's words as policy-copy.json holds them, read off
// its privacy and business pages in both languages.
import type { CSSProperties, ReactNode } from "react";
import { DocText } from "@simplix-react-ui-kits/site-core/help";
import {
  AgencyGrid,
  ChangeList,
  ClauseList,
  DiffText,
  diffChanged,
  diffVisible,
  DocLayout,
  FilledText,
  GlanceGrid,
  InfoCard,
  InfoGrid,
  KeyValues,
  LegalArticle,
  LegalSection,
  LegalTable,
  NoticeBanner,
  PlainSummary,
  PrintButton,
  RefundCalculator,
  RefundHow,
  RefundProduct,
  RefundRule,
  RightsGrid,
  VersionPicker,
  Walkthrough,
  WalkthroughMenu,
  type SiteDiffMode,
  type SiteRefundKind,
} from "@simplix-react-ui-kits/site-core/legal";
import { SegmentedSwitch } from "@simplix-react-ui-kits/site-core/pricing";
import { SiteBadge, SiteCaption, SiteChip } from "@simplix-react-ui-kits/site-core/page";
import { SiteBar, SiteFooter, SiteWindow } from "@simplix-react-ui-kits/site-core/shell";

import policyFile from "./policy-copy.json";
import copyFile from "./terms-copy.json";
import { glyph, languagePlace, type Locale, shellCopy, themePlace, visitorActions } from "./shell-copy";

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
  /** The terms, the privacy policy, or the business information and refunds. */
  readonly view?: "terms" | "privacy" | "business";
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

export function LegalFixture({ locale = "en", version = "current", compare = false, selectWidth = 278, signedIn = false, view = "terms" }: LegalFixtureProps) {
  const t = copyFile[locale];
  const shell = shellCopy[locale];
  if (view === "business") return <BusinessPage locale={locale} signedIn={signedIn} />;
  if (view === "privacy") return <PrivacyPage locale={locale} signedIn={signedIn} selectWidth={selectWidth} />;
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
          actions={signedIn ? undefined : visitorActions(shell)}
          account={signedIn ? { label: shell.myAccount, name: "Taylor", href: "/account" } : undefined}
        />
      }
      footer={<SiteFooter owner={shell.company} linksLabel={shell.legal} links={shell.footerLinks.map((link) => (link.key === "terms" ? { ...link, current: true } : link))} language={languagePlace} theme={themePlace(locale)} />}
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
function LegalWindow({ locale, signedIn, page, children }: { readonly locale: Locale; readonly signedIn: boolean; readonly page: "terms" | "privacy" | "business"; readonly children: ReactNode }) {
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
          actions={signedIn ? undefined : visitorActions(shell)}
          account={signedIn ? { label: shell.myAccount, name: "Taylor", href: "/account" } : undefined}
        />
      }
      footer={<SiteFooter owner={shell.company} linksLabel={shell.legal} links={shell.footerLinks.map((link) => (link.key === page ? { ...link, current: true } : link))} language={languagePlace} theme={themePlace(locale)} />}
    >
      {children}
    </SiteWindow>
  );
}

/** The business information and refunds: the cards of labelled values, the refund rules with the calculator, and the refund steps beside the picture of the site. */
function BusinessPage({ locale, signedIn }: { readonly locale: Locale; readonly signedIn: boolean }) {
  const terms = copyFile[locale];
  const t = terms.business;
  const r = policyFile[locale].business;
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
        <LegalSection id="b-refund" heading={r.refundTitle}>
          <DocText tone="muted">{r.refundLede}</DocText>
          <LegalTable
            label={r.refundTitle}
            head={r.refundHead}
            rows={r.refundRows.map((row) => [
              <RefundProduct key="product" product={row.product} detail={row.detail} />,
              ...row.rules.map((rule) => <RefundRule key={`${rule.label}-${rule.note ?? ""}`} kind={rule.kind as SiteRefundKind} label={rule.label} {...(rule.note === null ? {} : { note: rule.note })} />),
            ])}
          />
          <RefundCalculator
            title={r.calc.title}
            choice={<SegmentedSwitch label={r.calc.title} value="pro" onValueChange={() => {}} options={r.calc.options.map((option, index) => ({ value: index === 0 ? "pro" : "proPlus", label: option.label }))} />}
            usedLabel={r.calc.used}
            range={{ label: r.calc.used, min: 1, max: 12, value: 3, onValueChange: () => {} }}
            output={r.calc.output}
            usedShare={r.calc.share}
            usedBar={r.calc.usedBar}
            backBar={r.calc.backBar}
            formula={r.calc.formula}
            basis={r.calc.basis}
            amount={r.calc.amount}
            announce={null}
            note={r.calc.note}
          />
        </LegalSection>
        <LegalSection id="b-how" heading={r.howTitle}>
          <DocText tone="muted">{r.howLede}</DocText>
          <RefundHow steps={r.steps.map((step) => ({ key: step.title, title: step.title, text: step.text, current: step.current, onSelect: () => {} }))} status={r.steps[0]?.title ?? ""}>
            <Walkthrough head={r.walkHead} foot={{ text: r.next, action: { id: "next", label: r.nextAction, onSelect: () => {} } }}>
              <WalkthroughMenu email={r.menuEmail} items={r.menu.map((item) => ({ key: item.label, label: item.label, current: item.current }))} />
            </Walkthrough>
          </RefundHow>
        </LegalSection>
      </DocLayout>
    </LegalWindow>
  );
}

/** The privacy policy: the sections at a glance, the tables of what is collected and sent abroad, the voice set apart, the rights and whom to contact. */
function PrivacyPage({ locale, signedIn, selectWidth }: { readonly locale: Locale; readonly signedIn: boolean; readonly selectWidth: number }) {
  const terms = copyFile[locale];
  const p = policyFile[locale].privacy;
  const filled = (row: readonly (string | null)[]) => row.map((cell) => <FilledText key={cell ?? ""} text={cell ?? ""} placeholders={p.fields} />);
  const id = (index: number) => `p-${String(index)}`;
  const heading = (index: number) => p.headings[index] ?? "";
  return (
    <LegalWindow locale={locale} signedIn={signedIn} page="privacy">
      <DocLayout
        crumbs={terms.crumbs.map((label, index) => ({ key: `c-${String(index)}`, label, ...(index < terms.crumbs.length - 1 ? { href: "/help" } : {}) }))}
        crumbsLabel={terms.navLabel}
        crumbSeparator={glyph.chevron}
        title={p.title}
        badge={
          <SiteBadge tone="warn" icon={warn} title={terms.badgeTitle ?? undefined}>
            {terms.badge}
          </SiteBadge>
        }
        controls={
          <>
            <VersionPicker select={box(34, { width: selectWidth })} />
            <PrintButton label={terms.pdf} onPrint={() => {}} icon={glyph.download} />
          </>
        }
        tocTitle={p.tocTitle}
        toc={p.toc.map((entry, index) => ({ id: id(index), title: entry.title, ...(entry.no === null ? {} : { no: entry.no }) }))}
        current={null}
        onJump={() => {}}
        jump={box(34)}
        sideAction={{ id: "terms", label: p.side, href: "/terms" }}
      >
        <LegalSection id={id(0)} heading={heading(0)}>
          <DocText tone="muted">{p.glanceBody}</DocText>
          <GlanceGrid items={p.glance.map((item) => ({ key: item.title, title: item.title, text: item.text, voice: item.voice, onSelect: () => {} }))} />
        </LegalSection>
        <LegalSection id={id(1)} heading={heading(1)}>
          <LegalTable label={p.toc[1]?.title ?? ""} head={p.collect.head} rows={p.collect.rows.map(filled)} />
          <SiteCaption>{p.collectNote}</SiteCaption>
        </LegalSection>
        <LegalSection id={id(2)} tone="voice" heading={heading(2)} chip={<SiteChip tone="voice">{p.voiceChip}</SiteChip>} action={{ id: "transfer", label: p.voiceAction, tone: "quiet", onSelect: () => {} }}>
          <SiteCaption>{p.voiceBody}</SiteCaption>
          <KeyValues rows={p.voiceRows.map(([label, value]) => ({ key: label ?? "", label, value: <FilledText text={value ?? ""} placeholders={p.fields} /> }))} />
        </LegalSection>
        <LegalSection id={id(3)} heading={heading(3)}>
          <DocText tone="muted">{p.transferBody}</DocText>
          <LegalTable label={p.toc[3]?.title ?? ""} head={p.transfer.head} rows={p.transfer.rows.map(filled)} />
          <NoticeBanner tone="warn" mark={warn} title={p.notice.title}>
            {p.notice.text}
          </NoticeBanner>
        </LegalSection>
        <LegalSection id={id(4)} heading={heading(4)}>
          <LegalTable label={p.toc[4]?.title ?? ""} head={p.processors.head} rows={p.processors.rows.map(filled)} />
        </LegalSection>
        <LegalSection id={id(5)} heading={heading(5)}>
          <DocText tone="muted">{p.rightsBody}</DocText>
          <RightsGrid items={p.rights.map((right) => ({ key: right.title, title: right.title, text: right.text, action: { id: right.title, label: right.action, href: "/account" } }))} />
        </LegalSection>
        <LegalSection id={id(6)} heading={heading(6)}>
          <ClauseList items={p.safeguards.map((line) => ({ key: line, content: line }))} />
        </LegalSection>
        <LegalSection id={id(7)} heading={heading(7)}>
          <InfoCard>
            <KeyValues rows={p.officer.map(([label, value]) => ({ key: label ?? "", label, value: <FilledText text={value ?? ""} placeholders={p.fields} /> }))} />
          </InfoCard>
          <SiteCaption>{p.officerNote}</SiteCaption>
          <AgencyGrid items={p.agencies.map(([name, phone, site]) => ({ key: name ?? "", name, phone, site }))} />
        </LegalSection>
      </DocLayout>
    </LegalWindow>
  );
}

export default LegalFixture;
