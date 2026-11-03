import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DocLayout } from "../legal/doc-layout";
import { LegalTable } from "../legal/legal-table";
import { siteDocBodyStyle, siteDocRailStyle, siteLegalTableHeadStyle, siteLegalTableRowStyle, siteTocJumpStyle } from "../legal/legal.style";
import { bySlot, silentRefusals, tabStops, unmarked } from "../testing/markup";
import { ArticleFigure, ArticleIntro, ArticleStep, DocProgress, DocSection, FeedbackPanel, QuickBox, RelatedLinks, TipNote } from "./article";
import { siteRelatedGridStyle } from "./help.style";

const layout = (over = {}) =>
  renderToStaticMarkup(
    <DocLayout
      crumbs={[
        { key: "help", label: "Help", href: "/help" },
        { key: "doc", label: "When voices are not made" },
      ]}
      crumbsLabel="Help"
      title="When voices are not made"
      tocTitle="In this article"
      toc={[
        { id: "quick", title: "First, just these" },
        { id: "s1", no: "1", title: "Read the message", done: true },
        { id: "s2", no: "2", title: "Run the check", changed: true },
      ]}
      current="s2"
      onJump={() => {}}
      doneMark={<svg data-slot="product-glyph" />}
      jump={<span data-slot="product-select" />}
      side={<DocProgress text="1 of 2 tried" share={0.5} />}
      {...over}
    >
      <p data-slot="product-section">body</p>
    </DocLayout>,
  );

describe("DocLayout", () => {
  it("draws the trail, the one h1 and the rail beside the document, the rail named by its title", () => {
    const html = layout();
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(bySlot(html, "site-doc-rail")[0]?.attributes["aria-label"]).toBe("In this article");
    const order = ["site-breadcrumb", "site-doc-head", "site-doc-rail", "site-doc"].map((slot) => html.indexOf(`data-slot="${slot}"`));
    expect(order.every((at, i) => at > 0 && (i === 0 || at > (order[i - 1] ?? 0)))).toBe(true);
    expect(unmarked(html.replace('<svg data-slot="product-glyph"></svg>', "").replace('<span data-slot="product-select"></span>', "").replace('<p data-slot="product-section">body</p>', ""))).toEqual([]);
  });

  it("marks the section in view, ticks a tried one and dots a changed one", () => {
    const html = layout();
    const buttons = bySlot(html, "site-toc-button");
    expect(buttons.map((button) => button.attributes["aria-current"])).toEqual([undefined, undefined, "location"]);
    expect(buttons.map((button) => button.attributes["data-current"])).toEqual(["false", "false", "true"]);
    expect(bySlot(html, "site-toc-done")).toHaveLength(1);
    expect(bySlot(html, "site-toc-changed")).toHaveLength(1);
    expect(bySlot(html, "site-toc-number")).toHaveLength(2);
    expect(tabStops(html).filter((stop) => stop.attributes["data-slot"] === "site-toc-button")).toHaveLength(3);
  });

  it("stacks the rail over the document below the medium tier, where the product's jump control replaces the list", () => {
    expect(siteDocBodyStyle.base).toContain("@max-page-medium/page:flex-col");
    expect(siteDocRailStyle.base).toContain("@max-page-medium/page:w-full");
    expect(siteTocJumpStyle.base).toBe("hidden @max-page-medium/page:block");
  });

  it("draws the badge and controls only when handed", () => {
    expect(bySlot(layout(), "site-doc-controls")).toEqual([]);
    expect(bySlot(layout({ controls: <span data-slot="product-controls" /> }), "site-doc-controls")).toHaveLength(1);
  });
});

describe("LegalTable", () => {
  it("is a table of rows whose first value names the row, each value carrying its column's name for a narrow page", () => {
    const html = renderToStaticMarkup(<LegalTable label="Messages" head={["Message", "Meaning"]} rows={[["Not enough credits", "Characters ran out"]]} />);
    expect(bySlot(html, "site-legal-table")[0]?.attributes.role).toBe("table");
    expect(bySlot(html, "site-legal-table-column").map((column) => column.attributes.role)).toEqual(["columnheader", "columnheader"]);
    expect(bySlot(html, "site-legal-table-cell").map((cell) => cell.attributes["data-lead"])).toEqual(["true", "false"]);
    expect(bySlot(html, "site-legal-table-label")).toHaveLength(2);
    expect(siteLegalTableHeadStyle.base).toContain("@max-page-narrow/page:hidden");
    expect(siteLegalTableRowStyle.base).toContain("@max-page-narrow/page:flex-col");
    expect(unmarked(html)).toEqual([]);
  });
});

describe("the article parts", () => {
  it("draws the facts, where it applies and the lead", () => {
    const html = renderToStaticMarkup(<ArticleIntro facts={[{ key: "a", label: "3 min read" }]} where={<span data-slot="product-chip" />} lead="Go through these in order." />);
    expect(bySlot(html, "site-article-fact")).toHaveLength(1);
    expect(bySlot(html, "site-article-lead")).toHaveLength(1);
  });

  it("numbers a step until it is tried, then ticks it and presses its toggle, which names the step", () => {
    const step = (done: boolean) =>
      renderToStaticMarkup(<ArticleStep id="s1" index={1} done={done} doneMark={<svg data-slot="product-glyph" />} title="Run the check" body="Press Start." tried={{ label: done ? "Tried" : "Mark as tried", name: "Mark step 2 as tried" }} />);
    const open = step(false);
    expect(bySlot(open, "site-step-disc")[0]?.attributes["data-done"]).toBe("false");
    expect(open).toContain(">2</span>");
    const toggle = bySlot(open, "site-action")[0];
    expect(toggle?.attributes["aria-pressed"]).toBe("false");
    expect(toggle?.attributes["aria-label"]).toBe("Mark step 2 as tried");
    expect(toggle?.attributes["data-tone"]).toBe("quiet");
    expect(toggle?.attributes["data-pad"]).toBe("quietSm");
    const tried = step(true);
    expect(bySlot(tried, "site-step-disc")[0]?.attributes["data-done"]).toBe("true");
    expect(bySlot(tried, "site-action")[0]?.attributes["aria-pressed"]).toBe("true");
    expect(bySlot(tried, "site-action")[0]?.attributes["data-tone"]).toBe("secondary");
    expect(bySlot(step(false), "site-article-step")[0]?.attributes.id).toBe("s1");
  });

  it("draws the quick checks, a figure with its caption, a tip and a closing section with its primary action", () => {
    const html = renderToStaticMarkup(
      <>
        <QuickBox id="quick" title="First, just these" items={[{ key: "a", ask: "Online?", answer: "Premium needs the server." }]} />
        <ArticleFigure caption="Figure 1">
          <span data-slot="product-picture" />
        </ArticleFigure>
        <TipNote mark={<svg data-slot="product-glyph" />}>Skip this on a tablet.</TipNote>
        <DocSection id="still" heading="Still not working" text="Attach the record." action={{ id: "ask", label: "Contact us" }} />
      </>,
    );
    expect(bySlot(html, "site-quick-ask")[0]?.name).toBe("strong");
    expect(bySlot(html, "site-figure")[0]?.name).toBe("figure");
    expect(bySlot(html, "site-figure-caption")[0]?.name).toBe("figcaption");
    expect(bySlot(html, "site-tip-mark")[0]?.attributes["aria-hidden"]).toBe("true");
    expect(bySlot(html, "site-action")[0]?.attributes["data-tone"]).toBe("primary");
  });

  it("asks whether it helped, opens the reasons after a no, and thanks once sent", () => {
    const asked = renderToStaticMarkup(
      <FeedbackPanel
        label="Was this helpful?"
        ask={{ question: "Was this helpful?", answers: [{ id: "yes", label: "Yes", pressed: false }, { id: "no", label: "No", pressed: true }] }}
        more={{ label: "What was missing?", reasons: [{ id: "r", label: "Hard to follow", pressed: true }], actions: [{ id: "send", label: "Send", tone: "primary" }] }}
      />,
    );
    expect(bySlot(asked, "site-feedback")[0]?.attributes["aria-label"]).toBe("Was this helpful?");
    const actions = bySlot(asked, "site-action");
    expect(actions.map((action) => action.attributes["aria-pressed"])).toEqual(["false", "true", "true", undefined]);
    expect(actions[2]?.attributes["data-tone"]).toBe("primary");
    const thanked = renderToStaticMarkup(<FeedbackPanel label="Was this helpful?" status="Thanks" thanks={{ title: "Thanks.", text: "We read every answer." }} />);
    expect(bySlot(thanked, "site-feedback-thanks")).toHaveLength(1);
    expect(bySlot(thanked, "site-feedback-row")).toEqual([]);
    // The answers are gone with their row, so the thanks can take the focus in their place.
    expect(bySlot(thanked, "site-feedback-more")[0]?.attributes.tabindex).toBe("-1");
  });

  it("describes a disabled send after a no by the note under the actions", () => {
    const panel = (note?: string) =>
      renderToStaticMarkup(
        <FeedbackPanel
          label="Was this helpful?"
          ask={{ question: "Was this helpful?", answers: [{ id: "no", label: "No", pressed: true }] }}
          more={{ label: "What was missing?", reasons: [{ id: "a", label: "Hard to follow" }], actions: [{ id: "send", label: "Send", tone: "primary", disabled: true, reason: "Pick what was missing first" }], ...(note === undefined ? {} : { note }) }}
        />,
      );
    const noted = panel("Answers are not recorded yet");
    expect(silentRefusals(noted)).toEqual([]);
    expect(bySlot(noted, "site-action").find((action) => action.attributes["data-action"] === "send")?.attributes["aria-describedby"]).toBeDefined();
    const unnoted = panel();
    // Without the note the send is described by its own reason, drawn for a screen reader only.
    expect(silentRefusals(unnoted)).toEqual([]);
    expect(bySlot(unnoted, "site-action").find((action) => action.attributes["data-action"] === "send")?.attributes["aria-describedby"]).toBe(bySlot(unnoted, "site-action-reason")[0]?.attributes.id);
  });

  it("links the related articles two to a row, one below the narrow tier", () => {
    const html = renderToStaticMarkup(<RelatedLinks title="See also" items={[{ key: "a", title: "No sound", meta: "Troubleshooting", href: "/help/a" }]} />);
    expect(tabStops(html).map((stop) => stop.attributes.href)).toEqual(["/help/a"]);
    expect(siteRelatedGridStyle.base).toContain("@max-page-narrow/page:grid-cols-1");
    expect(unmarked(html)).toEqual([]);
  });

  it("draws a related article with no address as its card in place, pending and out of the tab order", () => {
    const html = renderToStaticMarkup(<RelatedLinks title="See also" items={[{ key: "a", title: "No sound", href: "/help/a" }, { key: "b", title: "Dictionary" }]} />);
    expect(tabStops(html).map((stop) => stop.attributes.href)).toEqual(["/help/a"]);
    expect(bySlot(html, "site-related-link").map((link) => [link.name, link.attributes["data-pending"]])).toEqual([
      ["a", "false"],
      ["span", "true"],
    ]);
    expect(unmarked(html)).toEqual([]);
  });

  it("draws progress only with a share, and the way to ask on its own", () => {
    expect(bySlot(renderToStaticMarkup(<DocProgress text="1 of 2" share={0.5} />), "site-progress")).toHaveLength(1);
    const ask = renderToStaticMarkup(<DocProgress action={{ id: "ask", label: "Contact us" }} />);
    expect(bySlot(ask, "site-progress")).toEqual([]);
    expect(bySlot(ask, "site-live")).toEqual([]);
    expect(bySlot(ask, "site-action")).toHaveLength(1);
  });
});
