import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteBadge } from "../page/site-bits";
import { bySlot, silentRefusals, tabStops, unmarked } from "../testing/markup";
import { DocLayout } from "./doc-layout";
import { ChangeList, ClauseList, DiffText, diffChanged, diffVisible, FilledText, InfoCard, InfoGrid, KeyValues, LegalArticle, NoticeBanner, PlainSummary, PrintButton, VersionPicker } from "./legal-parts";
import { siteInfoGridStyle, siteKeyValuesStyle, siteValueStyle } from "./legal.style";

const clause = "The app {+edits a pptx+}{-only reads files-} for {company}.";

describe("DiffText", () => {
  it("drops the removed text in the current version and the added text in the previous one", () => {
    expect(renderToStaticMarkup(<DiffText text={clause} mode="current" />)).toBe("The app edits a pptx for {company}.");
    expect(renderToStaticMarkup(<DiffText text={clause} mode="previous" />)).toBe("The app only reads files for {company}.");
  });

  it("marks both in the comparison, the addition as ins and the removal as del", () => {
    const html = renderToStaticMarkup(<DiffText text={clause} mode="diff" />);
    expect(bySlot(html, "site-diff-added")[0]?.name).toBe("ins");
    expect(bySlot(html, "site-diff-removed")[0]?.name).toBe("del");
    expect(html).toContain(">edits a pptx</ins>");
    expect(html).toContain(">only reads files</del>");
  });

  it("draws an unfilled field as a dashed field, inside a change too", () => {
    const html = renderToStaticMarkup(<DiffText text="{+Run by {company}+}" mode="diff" placeholders={{ company: "[Company]" }} />);
    expect(bySlot(html, "site-field-gap")).toHaveLength(1);
    expect(html).toContain(">[Company]</span>");
    expect(renderToStaticMarkup(<FilledText text="No {fields} here" />)).toBe("No {fields} here");
  });

  it("knows when a clause says nothing in a version and when it carries a change", () => {
    expect(diffVisible("{+New clause+}", "previous")).toBe(false);
    expect(diffVisible("{+New clause+}", "current")).toBe(true);
    expect(diffVisible("{-Old clause-}", "current")).toBe(false);
    expect(diffVisible("{-Old clause-}", "diff")).toBe(true);
    expect(diffChanged(clause)).toBe(true);
    expect(diffChanged("Plain")).toBe(false);
  });
});

describe("the legal head parts", () => {
  it("speaks an info banner as a status and a warning as an alert, with its actions small", () => {
    const info = renderToStaticMarkup(<NoticeBanner tone="info" title="New terms apply" actions={[{ id: "see", label: "See the changes" }]}>From October 1.</NoticeBanner>);
    expect(bySlot(info, "site-banner")[0]?.attributes["data-tone"]).toBe("info");
    expect(bySlot(info, "site-banner-title")[0]?.attributes.role).toBe("status");
    expect(bySlot(info, "site-action")[0]?.attributes["data-size"]).toBe("sm");
    expect(bySlot(renderToStaticMarkup(<NoticeBanner tone="warn" title="Old version" />), "site-banner-title")[0]?.attributes.role).toBe("alert");
    expect(unmarked(info)).toEqual([]);
  });

  it("dims the comparison switch while it cannot be used, and describes it by the reason for a screen reader and on hover", () => {
    const off = renderToStaticMarkup(
      <VersionPicker select={<span data-slot="product-select" />} compare={{ label: "Show changes", control: (describedBy) => <span data-slot="product-switch" aria-describedby={describedBy} />, disabled: true, reason: "Only the current version" }} />,
    );
    const field = bySlot(off, "site-toggle-field")[0];
    expect(field?.name).toBe("label");
    expect(field?.attributes["data-disabled"]).toBe("true");
    expect(field?.attributes.title).toBe("Only the current version");
    const described = bySlot(off, "product-switch")[0]?.attributes["aria-describedby"];
    expect(described).toBeTruthy();
    expect(off).toContain(`id="${described}">Only the current version</span>`);
    expect(silentRefusals(off)).toEqual([]);
    const on = renderToStaticMarkup(<VersionPicker select={<span />} compare={{ label: "Show changes", control: (describedBy) => <span data-slot="product-switch" aria-describedby={describedBy} /> }} />);
    expect(bySlot(on, "site-toggle-field")[0]?.attributes.title).toBeUndefined();
    expect(bySlot(on, "product-switch")[0]?.attributes["aria-describedby"]).toBeUndefined();
  });

  it("prints the page from a small action, and marks a draft with a warning badge", () => {
    const html = renderToStaticMarkup(<PrintButton label="Save as PDF" onPrint={() => {}} />);
    expect(bySlot(html, "site-action")[0]?.attributes["data-size"]).toBe("sm");
    expect(tabStops(html)).toHaveLength(1);
    const badge = renderToStaticMarkup(<SiteBadge tone="warn" title="A draft before legal review">Draft</SiteBadge>);
    expect(bySlot(badge, "site-badge")[0]?.attributes["data-tone"]).toBe("warn");
    expect(bySlot(badge, "site-badge")[0]?.attributes.title).toBe("A draft before legal review");
  });

  it("lists the changes with the legend of the marks, each change a button", () => {
    const html = renderToStaticMarkup(<ChangeList title="2 changes" added="Added" removed="Removed" changes={[{ key: "a", no: "Article 2", what: "Added editing" }]} />);
    expect(bySlot(html, "site-change-legend").map((legend) => [legend.name, legend.attributes["data-kind"]])).toEqual([
      ["ins", "added"],
      ["del", "removed"],
    ]);
    expect(bySlot(html, "site-change-link")[0]?.name).toBe("button");
    expect(unmarked(html)).toEqual([]);
  });
});

describe("the legal body parts", () => {
  it("draws an article's numbered heading, its summary and its circled clauses", () => {
    const html = renderToStaticMarkup(
      <LegalArticle id="t-ai" no="Article 7" title="Labelling AI content" was="was Article 6" added summary={<PlainSummary label="In short">AI content is marked.</PlainSummary>}>
        <ClauseList items={[{ key: "a", content: "Notes are marked." }, { key: "b", content: "Videos too." }]} />
      </LegalArticle>,
    );
    const article = bySlot(html, "site-legal-article")[0];
    expect(article?.attributes.id).toBe("t-ai");
    expect(article?.attributes["data-added"]).toBe("true");
    expect(article?.attributes["data-kind"]).toBe("article");
    expect(html).toContain(">①</span>");
    expect(html).toContain(">②</span>");
    expect(bySlot(html, "site-legal-article-was")[0]?.name).toBe("small");
    expect(unmarked(html)).toEqual([]);
  });

  it("reads its heading as words in the text a screen reader or a copy takes: number, title, previous number and tag apart", () => {
    const html = renderToStaticMarkup(<LegalArticle id="t-ai" no="Article 7" title="Labelling AI content" was="was Article 6" tag={<span>New</span>} />);
    const heading = /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(html)?.[1] ?? "";
    expect(heading.replace(/<[^>]*>/g, "")).toBe("Article 7 Labelling AI content was Article 6 New");
    const bare = /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(renderToStaticMarkup(<LegalArticle id="t-x" no="Article 8" title="Effective date" />))?.[1] ?? "";
    expect(bare.replace(/<[^>]*>/g, "")).toBe("Article 8 Effective date");
  });

  it("sets the closing provisions closer together", () => {
    const html = renderToStaticMarkup(<LegalArticle id="t-addendum" kind="addendum" no="Addendum" title="Effective date" />);
    expect(bySlot(html, "site-legal-article")[0]?.attributes["data-kind"]).toBe("addendum");
  });

  it("lays labelled values in a definition list, the value two columns wide, stacked below the narrow tier", () => {
    const html = renderToStaticMarkup(
      <InfoGrid id="b-info">
        <InfoCard title="Business information" action={{ id: "check", label: "Check", tone: "quiet" }}>
          <KeyValues rows={[{ key: "c", label: "Company", value: "Example Inc." }]} />
        </InfoCard>
      </InfoGrid>,
    );
    expect(bySlot(html, "site-key-values")[0]?.name).toBe("dl");
    expect(bySlot(html, "site-key")[0]?.name).toBe("dt");
    expect(bySlot(html, "site-value")[0]?.name).toBe("dd");
    expect(bySlot(html, "site-info-grid")[0]?.attributes.id).toBe("b-info");
    expect(siteKeyValuesStyle.base).toContain("@max-page-narrow/page:grid-cols-1");
    expect(siteValueStyle.base).toContain("col-span-2");
    expect(siteInfoGridStyle.base).toContain("@max-page-narrow/page:grid-cols-1");
    expect(unmarked(html)).toEqual([]);
  });
});

describe("DocLayout", () => {
  const draw = (jump?: string) =>
    renderToStaticMarkup(
      <DocLayout crumbs={[]} crumbsLabel="Trail" title="Terms" tocTitle="Contents" toc={[{ id: "t-pay", no: "Article 4", title: "Payment" }, { id: "t-end", title: "Effective date" }]} current={null} onJump={() => undefined} {...(jump === undefined ? {} : { jump: <span>{jump}</span> })}>
        <p>Body</p>
      </DocLayout>,
    );

  it("draws its own jump select over the rail's sections, named by the rail's title, when the page hands none", () => {
    const html = draw();
    const jump = bySlot(html, "site-toc-jump")[0];
    expect(jump).toBeDefined();
    expect(html).toContain('aria-label="Contents"');
    expect(html).toContain("Article 4 Payment");
  });

  it("draws the page's own jump control in its place when it hands one", () => {
    const html = draw("own control");
    expect(html).toContain("own control");
    expect(html).not.toContain("Article 4 Payment");
  });
});
