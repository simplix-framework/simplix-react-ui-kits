import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { bySlot, silentRefusals, tabStops, unmarked } from "../testing/markup";
import { rangeShare, RefundCalculator, RefundHow, RefundProduct, RefundRule, SiteRange, Walkthrough, WalkthroughMenu, WalkthroughPages } from "./refund-parts";

const noop = () => {};

describe("the refund table's cells", () => {
  it("draws a product with its terms under it", () => {
    const html = renderToStaticMarkup(<RefundProduct product="Presentation pack" detail="₩9,900 · once" />);
    expect(bySlot(html, "site-refund-detail")[0]?.name).toBe("small");
    expect(unmarked(html)).toEqual([]);
  });

  it("gives a verdict and its dot the case's tone, and draws a note only where there is one", () => {
    const html = renderToStaticMarkup(<RefundRule kind="part" label="The remaining period" note="Past months at the monthly price" />);
    expect(bySlot(html, "site-refund-verdict")[0]?.attributes["data-kind"]).toBe("part");
    expect(bySlot(html, "site-refund-dot")[0]?.attributes["data-kind"]).toBe("part");
    expect(bySlot(html, "site-refund-note")).toHaveLength(1);
    expect(bySlot(renderToStaticMarkup(<RefundRule kind="full" label="Full refund" />), "site-refund-note")).toHaveLength(0);
    expect(unmarked(html)).toEqual([]);
  });
});

describe("SiteRange", () => {
  it("fills the track up to the value and reads it out in words", () => {
    const html = renderToStaticMarkup(<SiteRange label="Months used" valueText={(n) => `${String(n)} months`} min={1} max={12} value={4} onValueChange={noop} />);
    const input = bySlot(html, "site-range-input")[0];
    expect(input?.attributes.type).toBe("range");
    expect(input?.attributes["aria-label"]).toBe("Months used");
    expect(input?.attributes["aria-valuetext"]).toBe("4 months");
    expect(bySlot(html, "site-range-fill")[0]?.attributes.style).toBe(`width:${String((3 / 11) * 100)}%`);
    expect(unmarked(html)).toEqual([]);
  });

  it("keeps the share between the ends whatever the value", () => {
    expect(rangeShare(1, 1, 12)).toBe(0);
    expect(rangeShare(12, 1, 12)).toBe(1);
    expect(rangeShare(40, 1, 12)).toBe(1);
    expect(rangeShare(-3, 1, 12)).toBe(0);
    expect(rangeShare(5, 5, 5)).toBe(0);
  });
});

describe("RefundCalculator", () => {
  const props = {
    title: "Cancelling a yearly plan now: how much comes back?",
    choice: <span data-slot="product-switch" />,
    usedLabel: "Time used",
    range: { label: "Months used", min: 1, max: 12, value: 3, onValueChange: noop },
    output: "3 months",
    usedShare: 0.25,
    usedBar: "Used",
    backBar: "Refunded",
    formula: "₩149,000 − 3 × ₩14,900",
    basis: "This month counts as used",
    amount: "₩104,300",
    note: "No penalty.",
  };

  it("names the card by its question and splits the year at the share used", () => {
    const html = renderToStaticMarkup(<RefundCalculator {...props} announce={null} />);
    expect(bySlot(html, "site-refund-calc")[0]?.attributes["aria-label"]).toBe(props.title);
    expect(bySlot(html, "site-refund-bar-used")[0]?.attributes.style).toBe("flex-basis:25%");
    expect(bySlot(html, "site-refund-bar")[0]?.attributes["aria-hidden"]).toBe("true");
    expect(unmarked(html)).toEqual([]);
  });

  it("speaks the amount only once the reader moved something", () => {
    const quiet = renderToStaticMarkup(<RefundCalculator {...props} announce={null} />);
    expect(quiet).toContain('role="status"></span>');
    const spoken = renderToStaticMarkup(<RefundCalculator {...props} announce="₩104,300" />);
    expect(spoken).toContain('role="status">₩104,300</span>');
  });
});

describe("RefundHow", () => {
  const steps = (third: { disabled?: boolean }) => [
    { key: "open", title: "Open My account", text: "Press your name", current: true, onSelect: noop },
    { key: "pick", title: "Pick the receipt", text: "Each payment has its row", onSelect: noop },
    { key: "ask", title: "Request the refund", text: "See the amount", onSelect: noop, ...third },
  ];

  it("marks the step shown and takes a step that cannot be shown out of the keyboard order, described by the reason", () => {
    const html = renderToStaticMarkup(
      <RefundHow steps={steps({ disabled: true })} status="Open My account" reason={{ id: "why", text: "Opens with the receipts." }}>
        <span data-slot="product-picture" />
      </RefundHow>,
    );
    const picks = bySlot(html, "site-step-pick");
    expect(picks.map((pick) => pick.attributes["data-current"])).toEqual(["true", "false", "false"]);
    expect(picks[0]?.attributes["aria-current"]).toBe("step");
    expect(picks[2]?.attributes.disabled).toBeDefined();
    expect(picks[2]?.attributes["aria-describedby"]).toBe("why");
    expect(html).toContain('id="why"');
    expect(tabStops(html)).toHaveLength(2);
    expect(unmarked(html)).toEqual([]);
  });

  it("describes no step and draws no reason when every step can be shown", () => {
    const html = renderToStaticMarkup(
      <RefundHow steps={steps({})} status="Open My account">
        <span data-slot="product-picture" />
      </RefundHow>,
    );
    expect(bySlot(html, "site-step-pick").some((pick) => pick.attributes["aria-describedby"] !== undefined)).toBe(false);
    expect(bySlot(html, "site-caption")).toHaveLength(0);
  });

  it("ticks a passed step in place of its number", () => {
    const html = renderToStaticMarkup(
      <RefundHow steps={[{ key: "open", title: "Open", text: "Press", done: true, onSelect: noop }]} doneMark={<svg data-slot="product-tick" />} status="">
        <span data-slot="product-picture" />
      </RefundHow>,
    );
    expect(bySlot(html, "site-step-pick-disc")[0]?.attributes["data-done"]).toBe("true");
    expect(bySlot(html, "product-tick")).toHaveLength(1);
  });
});

describe("Walkthrough", () => {
  it("draws the menu with the entry to press marked and the next step's primary button", () => {
    const html = renderToStaticMarkup(
      <Walkthrough head="stagevoice.example" foot={{ text: "Next: Pick the receipt", action: { id: "next", label: "Next", onSelect: noop } }}>
        <WalkthroughMenu
          email="taylor@example.com"
          items={[
            { key: "account", label: "My account", current: true },
            { key: "help", label: "Help" },
          ]}
        />
      </Walkthrough>,
    );
    expect(bySlot(html, "site-walkthrough-stage")[0]?.attributes["data-align"]).toBe("end");
    expect(bySlot(html, "site-walkthrough-menu-item").map((item) => item.attributes["data-current"])).toEqual(["true", "false"]);
    const next = bySlot(html, "site-action")[0];
    expect(next?.attributes["data-tone"]).toBe("primary");
    expect(next?.attributes["data-size"]).toBe("sm");
    expect(unmarked(html)).toEqual([]);
  });

  it("leaves the address out for a reader who is not signed in, and describes a next step that cannot be shown", () => {
    const html = renderToStaticMarkup(
      <>
        <Walkthrough head="My account" foot={{ text: "Next: Request the refund", action: { id: "next", label: "Next", disabled: true, describedBy: "why" } }}>
          <WalkthroughPages items={[{ key: "receipts", label: "Receipts", current: true }]} />
        </Walkthrough>
        <p id="why">Opens with the receipts.</p>
      </>,
    );
    expect(bySlot(html, "site-walkthrough-menu-email")).toHaveLength(0);
    expect(bySlot(html, "site-walkthrough-line").map((line) => line.attributes["data-size"])).toEqual(["title", "long", "short"]);
    expect(silentRefusals(html)).toEqual([]);
    expect(bySlot(renderToStaticMarkup(<WalkthroughMenu items={[]} />), "site-walkthrough-menu-email")).toHaveLength(0);
  });
});
