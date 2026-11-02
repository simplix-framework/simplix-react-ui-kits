import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteChip } from "../page/site-bits";
import { bySlot, tabStops, unmarked } from "../testing/markup";
import { FieldRow, FormField } from "../form/fields";
import { siteFieldRowStyle } from "../form/form.style";
import { AttachBox, ContactForm, ContactPanel, ContactSent, SuggestBox } from "./contact";
import { siteCategoryGridStyle, siteColumnsStyle, siteSearchHeroInnerStyle, siteSearchKeysStyle } from "./help.style";
import { ArticleList, CategoryGrid, SiteColumns } from "./help-lists";
import { SearchHero, SiteSearch, searchKeyTarget, StatusLine } from "./search-hero";

const matches = [
  { key: "a", title: "When voices are not made", meta: "Troubleshooting" },
  { key: "b", title: "Getting a refund", meta: "Payment" },
];
const search = (value: string, list = matches) =>
  renderToStaticMarkup(<SiteSearch label="Search help" value={value} onValueChange={() => {}} matches={list} onPick={() => {}} foundLabel="2 results" keysLabel="↑ ↓ to pick" emptyLabel="Nothing matches" listId="results" />);

describe("SearchHero and SiteSearch", () => {
  it("draws the status, the one h1, the lede, the searches to try and the search in that order", () => {
    const html = renderToStaticMarkup(
      <SearchHero status={<StatusLine>All services running</StatusLine>} title="How can we help?" lede="In your own words." suggestionsLabel="Try searching" suggestions={[{ id: "a", label: "Refund" }]} search={<span data-slot="product-search" />} />,
    );
    expect(html.match(/<h1/g)).toHaveLength(1);
    const order = ["site-status-line", "site-search-hero-title", "site-search-hero-lede", "site-suggestions", "product-search"].map((slot) => html.indexOf(`data-slot="${slot}"`));
    expect(order.every((at, i) => at > 0 && (i === 0 || at > (order[i - 1] ?? 0)))).toBe(true);
    expect(bySlot(html, "site-action")[0]?.attributes["data-size"]).toBe("sm");
    expect(siteSearchHeroInnerStyle.base).toContain("@max-page-narrow/page:py-6");
    expect(unmarked(html.replace('<span data-slot="product-search"></span>', ""))).toEqual([]);
  });

  it("draws the status in its tone with its dot", () => {
    const html = renderToStaticMarkup(<StatusLine tone="warn">Delays</StatusLine>);
    expect(bySlot(html, "site-status-line")[0]?.attributes["data-tone"]).toBe("warn");
    expect(bySlot(html, "site-status-dot")[0]?.attributes["aria-hidden"]).toBe("true");
  });

  it("is a combobox whose matches open under it only while something is typed, the first one active", () => {
    expect(bySlot(search(""), "site-search-results")).toEqual([]);
    const html = search("voice");
    const input = bySlot(html, "site-search-input")[0];
    expect(input?.attributes.role).toBe("combobox");
    expect(input?.attributes["aria-expanded"]).toBe("true");
    expect(input?.attributes["aria-controls"]).toBe("results");
    expect(bySlot(html, "site-search-results")[0]?.attributes.role).toBe("listbox");
    expect(bySlot(html, "site-search-option").map((option) => [option.attributes["aria-selected"], option.attributes["data-active"]])).toEqual([
      ["true", "true"],
      ["false", "false"],
    ]);
    expect(unmarked(html)).toEqual([]);
  });

  it("says when nothing matches and leaves the keys hint off a narrow page", () => {
    const html = search("xyzzy", []);
    expect(bySlot(html, "site-search-empty")).toHaveLength(1);
    expect(bySlot(html, "site-search-option")).toEqual([]);
    expect(bySlot(html, "site-search-input")[0]?.attributes["aria-expanded"]).toBe("false");
    expect(siteSearchKeysStyle.base).toBe("@max-page-narrow/page:hidden");
  });

  it("moves the active match with the arrows and holds it to the list's ends", () => {
    expect(searchKeyTarget(0, 3, "ArrowDown")).toBe(1);
    expect(searchKeyTarget(2, 3, "ArrowDown")).toBe(2);
    expect(searchKeyTarget(0, 3, "ArrowUp")).toBe(0);
    expect(searchKeyTarget(1, 3, "Enter")).toBeNull();
    expect(searchKeyTarget(0, 0, "ArrowDown")).toBeNull();
  });
});

describe("CategoryGrid and ArticleList", () => {
  it("draws each category named by its title, with its count and its articles as links", () => {
    const html = renderToStaticMarkup(<CategoryGrid categories={[{ key: "start", title: "Getting started", count: "2 articles", articles: [{ key: "a", title: "Installing", href: "/help/a" }, { key: "b", title: "First deck", href: "/help/b" }] }]} />);
    expect(bySlot(html, "site-category")[0]?.attributes["aria-label"]).toBe("Getting started");
    expect(tabStops(html).map((stop) => stop.attributes.href)).toEqual(["/help/a", "/help/b"]);
    expect(siteCategoryGridStyle.base).toContain("grid-cols-5");
    expect(siteCategoryGridStyle.base).toContain("@max-page-medium/page:grid-cols-2");
    expect(unmarked(html)).toEqual([]);
  });

  it("numbers the most read articles in two digits, with the heading's badge", () => {
    const html = renderToStaticMarkup(<ArticleList title="Most read" badge={<SiteChip>This week</SiteChip>} items={[{ key: "a", title: "Refunds", meta: "Payment · 940 people", href: "/help/a" }]} />);
    expect(bySlot(html, "site-article-list")[0]?.attributes["aria-label"]).toBe("Most read");
    expect(bySlot(html, "site-article-rows")[0]?.name).toBe("ol");
    expect(html).toContain(">01</span>");
    expect(bySlot(html, "site-chip")).toHaveLength(1);
    expect(unmarked(html)).toEqual([]);
  });

  it("stands two parts side by side, one under the other below the medium tier", () => {
    expect(bySlot(renderToStaticMarkup(<SiteColumns>x</SiteColumns>), "site-columns")).toHaveLength(1);
    expect(siteColumnsStyle.base).toContain("@max-page-medium/page:grid-cols-1");
  });
});

describe("the contact parts", () => {
  it("offers the form with a primary action and the hours", () => {
    const html = renderToStaticMarkup(<ContactPanel title="Didn't find your answer?" body="Support answers in 4 hours." action={{ id: "open", label: "Contact us" }} hours="Weekdays" />);
    expect(bySlot(html, "site-contact")[0]?.attributes["data-state"]).toBe("closed");
    expect(bySlot(html, "site-action")[0]?.attributes["data-tone"]).toBe("primary");
    expect(bySlot(html, "site-contact-note")).toHaveLength(1);
    expect(unmarked(html)).toEqual([]);
  });

  it("lays the form out, outlined, with a submit button, the cancel action and what is missing", () => {
    const html = renderToStaticMarkup(
      <ContactForm title="Contact us" submit={{ id: "send", label: "Send", disabled: true }} cancel={{ id: "close", label: "Close" }} note="Write a subject">
        <FieldRow>
          <FormField as="group" label="Category">
            <span data-slot="product-control" />
          </FormField>
          <FormField label="Reply to">
            <span data-slot="product-control" />
          </FormField>
        </FieldRow>
        <SuggestBox label="These may answer it" articles={[{ key: "a", title: "Refunds", href: "/help/a" }]} />
        <AttachBox control={(label) => <label data-slot="product-checkbox">{label}</label>} title="Attach the record" badge={<SiteChip tone="accent">Recommended</SiteChip>} about="Versions only" />
      </ContactForm>,
    );
    const form = bySlot(html, "site-contact")[0];
    expect(form?.name).toBe("form");
    expect(form?.attributes["data-state"]).toBe("open");
    expect(form?.attributes.noValidate ?? form?.attributes.novalidate).toBeDefined();
    const actions = bySlot(html, "site-action");
    expect(actions[0]?.attributes.type).toBe("submit");
    expect(actions[0]?.attributes.disabled).toBeDefined();
    expect(actions[1]?.attributes.type).toBe("button");
    expect(bySlot(html, "site-field").map((field) => field.name)).toEqual(["div", "label"]);
    expect(bySlot(html, "site-attach-title")).toHaveLength(1);
    expect(siteFieldRowStyle.base).toContain("@max-page-narrow/page:grid-cols-1");
    expect(unmarked(html.replaceAll('<span data-slot="product-control"></span>', ""))).toEqual([]);
  });

  it("says the question arrived, with its ticket and the way to ask again", () => {
    const html = renderToStaticMarkup(<ContactSent title="We got your question" ticket={<SiteChip>SV-1</SiteChip>} body="We answer by mail." action={{ id: "again", label: "Ask again" }} />);
    expect(bySlot(html, "site-contact")[0]?.attributes["data-state"]).toBe("sent");
    expect(bySlot(html, "site-contact-mark")[0]?.attributes["aria-hidden"]).toBe("true");
    expect(bySlot(html, "site-action")[0]?.attributes["data-size"]).toBe("sm");
    expect(unmarked(html)).toEqual([]);
  });
});
