import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { bySlot, tabStops, unmarked } from "../testing/markup";
import { OfferRow, PriceTable, QuestionList } from "./offer-parts";
import { FeatureList, PlanCard, PlanGrid } from "./plan-card";
import { sitePlanGridStyle, siteQuestionListStyle, siteFeatureListStyle } from "./pricing.style";
import { SegmentedSwitch, SwitchRow, switchKeyTarget, type SegmentedOption } from "./segmented-switch";

type Cycle = "monthly" | "yearly";
const cycles: readonly SegmentedOption<Cycle>[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly · 2 months free" },
];

describe("SegmentedSwitch", () => {
  it("is a named radio group with the chosen option checked and the only one Tab reaches", () => {
    const html = renderToStaticMarkup(
      <SwitchRow>
        <SegmentedSwitch label="Billing cycle" options={cycles} value="yearly" onValueChange={() => {}} />
      </SwitchRow>,
    );
    const group = bySlot(html, "site-switch")[0];
    expect(group?.attributes.role).toBe("radiogroup");
    expect(group?.attributes["aria-label"]).toBe("Billing cycle");
    const options = bySlot(html, "site-switch-option");
    expect(options.map((option) => option.attributes["aria-checked"])).toEqual(["false", "true"]);
    expect(options.map((option) => option.attributes["data-checked"])).toEqual(["false", "true"]);
    expect(tabStops(html).map((tag) => tag.attributes["data-value"])).toEqual(["yearly"]);
    expect(bySlot(html, "site-switch-row")).toHaveLength(1);
    expect(unmarked(html)).toEqual([]);
  });

  it("moves the choice with the arrows, Home and End, wrapping and skipping disabled options", () => {
    const three: readonly SegmentedOption<"a" | "b" | "c">[] = [
      { value: "a", label: "A" },
      { value: "b", label: "B", disabled: true },
      { value: "c", label: "C" },
    ];
    expect(switchKeyTarget(three, "a", "ArrowRight")).toBe("c");
    expect(switchKeyTarget(three, "c", "ArrowRight")).toBe("a");
    expect(switchKeyTarget(three, "a", "ArrowLeft")).toBe("c");
    expect(switchKeyTarget(three, "c", "Home")).toBe("a");
    expect(switchKeyTarget(three, "a", "End")).toBe("c");
    expect(switchKeyTarget(three, "a", "ArrowDown")).toBe("c");
  });

  it("leaves the choice alone for any other key, or when the key lands on the chosen option", () => {
    expect(switchKeyTarget(cycles, "monthly", "Enter")).toBeNull();
    expect(switchKeyTarget(cycles, "monthly", "Home")).toBeNull();
    expect(switchKeyTarget([{ value: "a", label: "A", disabled: true }], "a", "ArrowRight")).toBeNull();
  });
});

describe("PlanCard", () => {
  const actions = [
    { id: "start", label: "Start Pro", href: "/checkout?plan=pro", tone: "primary" as const },
    { id: "trial", label: "Try 7 days", href: "/signup", tone: "quiet" as const },
  ];

  it("draws its name, price with its unit, terms, pitch, what it includes and its actions in reading order", () => {
    const html = renderToStaticMarkup(
      <PlanCard
        name="Pro"
        price="$12"
        unit="/mo"
        note="Plus sales tax"
        pitch="For people who present often"
        detail="About ten talks a month"
        features={[{ key: "chars", label: "50,000 characters" }, { key: "4k", label: "4K video", included: false }]}
        highlight="Most chosen"
        actions={actions}
      />,
    );
    const order = ["site-plan-card-badge", "site-plan-card-name", "site-plan-card-price", "site-plan-card-unit", "site-plan-card-pitch", "site-feature-list", "site-spacer", "site-plan-card-actions"];
    const at = order.map((slot) => html.indexOf(`data-slot="${slot}"`));
    expect(at.every((value, i) => value > -1 && (i === 0 || value > (at[i - 1] ?? 0)))).toBe(true);
    const card = bySlot(html, "site-plan-card")[0];
    expect(card?.attributes["data-highlight"]).toBe("true");
    expect(card?.attributes["aria-labelledby"]).toBe(bySlot(html, "site-plan-card-name")[0]?.attributes.id);
    expect(bySlot(html, "site-plan-card-note")).toHaveLength(2);
    expect(bySlot(html, "site-feature").map((line) => line.attributes["data-included"])).toEqual(["true", "false"]);
    const drawn = bySlot(html, "site-action");
    expect(drawn.map((action) => [action.attributes["data-tone"], action.attributes["data-block"], action.attributes.href])).toEqual([
      ["primary", "true", "/checkout?plan=pro"],
      ["quiet", "true", "/signup"],
    ]);
    expect(tabStops(html)).toHaveLength(2);
    expect(unmarked(html)).toEqual([]);
  });

  it("draws the current offer's mark as a disabled action across the card, in place of its actions", () => {
    const html = renderToStaticMarkup(<PlanCard name="Pro" price="$12" current="Your plan" actions={actions} />);
    expect(bySlot(html, "site-plan-card")[0]?.attributes["data-current"]).toBe("true");
    const drawn = bySlot(html, "site-action");
    expect(drawn).toHaveLength(1);
    expect(drawn[0]?.name).toBe("button");
    expect(drawn[0]?.attributes.disabled).toBeDefined();
    expect(html).toContain(">Your plan<");
    expect(tabStops(html)).toEqual([]);
  });

  it("says under its actions why they cannot run now, and draws no reason on the current offer", () => {
    const disabled = actions.map((action) => ({ ...action, disabled: true }));
    const html = renderToStaticMarkup(<PlanCard name="Pro" price="$12" actions={disabled} reason="Buying opens with the checkout" />);
    expect(html.indexOf('data-slot="site-plan-card-actions"')).toBeLessThan(html.indexOf('data-slot="site-plan-card-reason"'));
    expect(bySlot(html, "site-plan-card-reason")).toHaveLength(1);
    expect(html).toContain(">Buying opens with the checkout</p>");
    expect(tabStops(html)).toEqual([]);
    expect(unmarked(html)).toEqual([]);
    const current = renderToStaticMarkup(<PlanCard name="Pro" price="$12" current="Your plan" actions={disabled} reason="Buying opens with the checkout" />);
    expect(bySlot(current, "site-plan-card-reason")).toEqual([]);
    expect(bySlot(renderToStaticMarkup(<PlanCard name="Pro" price="$12" actions={actions} />), "site-plan-card-reason")).toEqual([]);
  });

  it("draws no badge, unit, note or features it was not handed, and is not marked current", () => {
    const html = renderToStaticMarkup(<PlanCard name="Free" price="$0" actions={[]} />);
    for (const slot of ["site-plan-card-badge", "site-plan-card-unit", "site-plan-card-note", "site-plan-card-pitch", "site-feature-list", "site-action"]) {
      expect(bySlot(html, slot)).toEqual([]);
    }
    const card = bySlot(html, "site-plan-card")[0];
    expect(card?.attributes["data-highlight"]).toBe("false");
    expect(card?.attributes["data-current"]).toBeUndefined();
  });
});

describe("PlanGrid and FeatureList", () => {
  it("lays four offers to a row by default, two below the medium tier and one below the narrow tier", () => {
    expect(bySlot(renderToStaticMarkup(<PlanGrid>x</PlanGrid>), "site-plan-grid")[0]?.attributes["data-columns"]).toBe("4");
    expect(bySlot(renderToStaticMarkup(<PlanGrid columns={3}>x</PlanGrid>), "site-plan-grid")[0]?.attributes["data-columns"]).toBe("3");
    expect(sitePlanGridStyle.variants.columns["4"]).toBe("grid-cols-4");
    expect(sitePlanGridStyle.base).toContain("@max-page-medium/page:grid-cols-2");
    expect(sitePlanGridStyle.base).toContain("@max-page-narrow/page:grid-cols-1");
  });

  it("draws a feature list in one column, or two on a wide card that fall to one below the narrow tier", () => {
    const two = bySlot(renderToStaticMarkup(<FeatureList columns={2} items={[{ key: "a", label: "A" }]} />), "site-feature-list")[0];
    expect(two?.attributes["data-columns"]).toBe("2");
    expect(siteFeatureListStyle.variants.columns["2"]).toContain("@max-page-narrow/page:grid-cols-1");
  });
});

describe("OfferRow", () => {
  it("draws its title, what it is, its small action and the note across the row", () => {
    const html = renderToStaticMarkup(
      <OfferRow title="Extra credits" about="For Pro and up" action={{ id: "top-up", label: "Top up credits", href: "/checkout", disabled: true }} note="Extra credits need Pro or Pro+" />,
    );
    const at = ["site-offer-row-title", "site-offer-row-about", "site-action", "site-offer-row-note"].map((slot) => html.indexOf(`data-slot="${slot}"`));
    expect(at.every((value, i) => value > -1 && (i === 0 || value > (at[i - 1] ?? 0)))).toBe(true);
    const action = bySlot(html, "site-action")[0];
    expect(action?.attributes["data-size"]).toBe("sm");
    expect(action?.name).toBe("button");
    expect(bySlot(html, "site-offer-row")[0]?.attributes["aria-labelledby"]).toBe(bySlot(html, "site-offer-row-title")[0]?.attributes.id);
    expect(unmarked(html)).toEqual([]);
  });

  it("draws an open action as a link and no note when none is handed", () => {
    const html = renderToStaticMarkup(<OfferRow title="Team" action={{ id: "notify", label: "Tell me", onSelect: () => {} }} />);
    expect(bySlot(html, "site-action")[0]?.name).toBe("button");
    expect(bySlot(html, "site-offer-row-note")).toEqual([]);
    expect(bySlot(html, "site-offer-row-about")).toEqual([]);
    expect(tabStops(html)).toHaveLength(1);
  });
});

describe("PriceTable", () => {
  it("draws the caption, the named columns and one row head and value per column", () => {
    const html = renderToStaticMarkup(
      <PriceTable
        caption="What each voice costs"
        columns={["Where", "Free voices", "Premium voices"]}
        rows={[
          { key: "app", head: "PC with the app", cells: ["No credits", "Uses credits"] },
          { key: "tablet", head: "Tablet", cells: ["No credits", "Uses credits"] },
        ]}
      />,
    );
    expect(bySlot(html, "site-price-table-column").map((column) => column.attributes.scope)).toEqual(["col", "col", "col"]);
    expect(bySlot(html, "site-price-table-row")).toHaveLength(2);
    expect(bySlot(html, "site-price-table-row-head").map((head) => head.attributes.scope)).toEqual(["row", "row"]);
    expect(bySlot(html, "site-price-table-cell")).toHaveLength(4);
    expect(html.indexOf("site-price-table-caption")).toBeLessThan(html.indexOf("site-price-table-head"));
    expect(unmarked(html)).toEqual([]);
  });
});

describe("QuestionList", () => {
  it("draws each question as a term with its answer, three to a row and one below the medium tier", () => {
    const html = renderToStaticMarkup(
      <QuestionList
        items={[
          { key: "trial", question: "Am I charged when the trial ends?", answer: "No." },
          { key: "carry", question: "Do unused credits carry over?", answer: "Until the next refill." },
        ]}
      />,
    );
    expect(bySlot(html, "site-question-list")[0]?.name).toBe("dl");
    expect(bySlot(html, "site-question-ask").map((tag) => tag.name)).toEqual(["dt", "dt"]);
    expect(bySlot(html, "site-question-answer").map((tag) => tag.name)).toEqual(["dd", "dd"]);
    expect(siteQuestionListStyle.base).toContain("grid-cols-3");
    expect(siteQuestionListStyle.base).toContain("@max-page-medium/page:grid-cols-1");
    expect(unmarked(html)).toEqual([]);
  });
});
