// A help article and a help guide composed from the site parts, with the words of the reference the
// kit's measurements were taken from (article-copy.json, read off the reference in English and
// Korean). It is the page `scripts/site-demo.mjs` renders for the rendered checks. The words are the
// reference product's own, kept as written because where a line wraps is part of what is measured. The pictures of
// the screen, the cost table and the jump select are the product's content, so the page stands
// boxes of their measured size in.
import type { CSSProperties, ReactNode } from "react";
import { ArticleFigure, ArticleIntro, ArticleStep, DocProgress, DocSection, FeedbackPanel, QuickBox, RelatedLinks, TipNote } from "@simplix-react-ui-kits/site-core/help";
import { DocLayout, LegalTable } from "@simplix-react-ui-kits/site-core/legal";
import { SiteCaption, SiteChip } from "@simplix-react-ui-kits/site-core/page";
import { SiteBar, SiteFooter, SiteWindow } from "@simplix-react-ui-kits/site-core/shell";

import copyFile from "./article-copy.json";
import { glyph, languagePlace, type Locale, shellCopy, themePlace, visitorActions } from "./shell-copy";

/** What the article is drawn with. */
export interface ArticleFixtureProps {
  readonly locale?: Locale;
  /** The troubleshooting article, or the export guide. */
  readonly doc?: "article" | "guide";
  /** The steps marked as tried, by their place. */
  readonly tried?: readonly number[];
  /** The feedback asked, or answered no with the reasons open. */
  readonly feedback?: "ask" | "no";
  /** The measured heights of the product's pictures, one per step that has one. */
  readonly figures?: readonly number[];
  /** The measured height of the product's cost table in the quick checks. */
  readonly costTable?: number;
  readonly signedIn?: boolean;
}

/** A box the size of the product content it stands for. */
const box = (height: number, extra: CSSProperties = {}): ReactNode => <span style={{ display: "block", height, ...extra }} />;
const info = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M12 8h.01M11 12h1v4h1" />
  </svg>
);
const send = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M4 12 20 4l-4 16-4-6z" />
  </svg>
);

export function ArticleFixture({ locale = "en", doc = "article", tried = [], feedback = "ask", figures = [], costTable = 0, signedIn = false }: ArticleFixtureProps) {
  const t = copyFile[locale][doc];
  const shell = shellCopy[locale];
  const article = copyFile[locale].article;
  const steps = t.steps;
  const stepId = (index: number) => `h-step-${String(index)}`;
  let figure = 0;
  return (
    <SiteWindow
      page="article"
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
            { key: "help", label: shell.help, href: "/help", current: true },
          ]}
          actions={signedIn ? undefined : visitorActions(shell)}
          account={signedIn ? { label: shell.myAccount, name: "Taylor", href: "/account" } : undefined}
        />
      }
      footer={<SiteFooter owner={shell.company} linksLabel={shell.legal} links={shell.footerLinks} language={languagePlace} theme={themePlace(locale)} />}
    >
      <DocLayout
        crumbs={t.crumbs.map((label, index) => ({ key: `c-${String(index)}`, label, ...(index < t.crumbs.length - 1 ? { href: "/help" } : {}) }))}
        crumbsLabel={t.navLabel}
        crumbSeparator={glyph.chevron}
        title={t.title}
        notice={
          <ArticleIntro
            facts={t.facts.map((label) => ({ key: label, label }))}
            where={t.where.map((label) => (
              <SiteChip key={label} tone="accent" dot>
                {label}
              </SiteChip>
            ))}
            lead={t.lead}
          />
        }
        tocTitle={t.tocTitle}
        toc={t.toc.map((entry, index) => {
          const step = doc === "article" ? index - 1 : index;
          return {
            id: doc === "article" && index === 0 ? "h-quick" : step >= steps.length ? "h-still" : stepId(step),
            title: entry.title,
            ...(entry.no === null ? {} : { no: entry.no }),
            ...(doc === "article" && tried.includes(step) ? { done: true } : {}),
          };
        })}
        current={null}
        onJump={() => {}}
        doneMark={glyph.check}
        jump={box(34)}
        side={
          doc === "article" ? (
            <DocProgress
              text={tried.length === 0 ? t.progress : article.progressTried}
              share={tried.length / steps.length}
              action={{ id: "ask", label: t.ask, icon: send }}
            />
          ) : undefined
        }
        {...(doc === "guide" ? { sideAction: { id: "ask", label: t.ask, icon: send } } : {})}
      >
        {"quick" in t && t.quick !== null ? (
          <QuickBox id="h-quick" title={t.quick.title} items={t.quick.items.map(([ask, answer]) => ({ key: ask ?? "", ask, answer }))}>
            {box(costTable)}
          </QuickBox>
        ) : null}
        {steps.map((step, index) => {
          const done = tried.includes(index);
          const toggle = done && article.triedDone !== null ? article.triedDone : step.tried;
          return (
            <ArticleStep
              key={step.title}
              id={stepId(index)}
              index={index}
              done={done}
              doneMark={glyph.check}
              title={step.title}
              body={step.body}
              {...(toggle === null ? {} : { tried: { label: toggle.label, name: toggle.name, icon: glyph.check } })}
            >
              {step.figure !== null ? <ArticleFigure caption={step.figure.caption}>{box(figures[figure++] ?? 0)}</ArticleFigure> : null}
              {step.table !== null ? <LegalTable label={step.table.label} head={step.table.head} rows={step.table.rows} /> : null}
              {step.tip !== null ? <TipNote mark={info}>{step.tip}</TipNote> : null}
              {step.note !== null ? <SiteCaption>{step.note}</SiteCaption> : null}
            </ArticleStep>
          );
        })}
        {t.tip !== null ? <TipNote mark={info}>{t.tip}</TipNote> : null}
        {t.still !== null ? <DocSection id="h-still" heading={t.still.title} text={t.still.text} action={{ id: "ask-diag", label: t.still.action, icon: send }} /> : null}
        <div id="h-contact" />
        <FeedbackPanel
          label={t.feedback.label}
          ask={{
            question: t.feedback.question,
            answers: [
              { id: "yes", label: t.feedback.yes, pressed: false },
              { id: "no", label: t.feedback.no, pressed: feedback === "no" },
            ],
          }}
          {...(feedback === "no"
            ? {
                more: {
                  label: t.feedback.whyLabel,
                  reasons: t.feedback.whys.map((label) => ({ id: label, label, pressed: false })),
                  actions: [
                    { id: "send", label: t.feedback.send, tone: "primary" as const },
                    { id: "continue", label: t.feedback.continue },
                  ],
                },
              }
            : {})}
        />
        <RelatedLinks title={t.related.title} items={t.related.items.map(([title, meta]) => ({ key: title ?? "", title, meta, href: "/help" }))} />
      </DocLayout>
    </SiteWindow>
  );
}

export default ArticleFixture;
