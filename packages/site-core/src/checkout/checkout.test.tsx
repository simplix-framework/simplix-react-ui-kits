import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { bySlot, tabStops, tagsOf, unmarked } from "../testing/markup";
import { CheckoutHead, CheckoutLayout, ConsentAgain, ConsentChecklist, DonePanel, MethodGrid, OrderSummary, ProgressChain, ProviderFrame, ProviderTarget, ProviderWaiting, Stepper } from "./checkout";
import { ChoiceCards } from "./choice-cards";

const byPart = (html: string, part: string) => tagsOf(html).filter((tag) => tag.attributes["data-part"] === part);
const frameworkOwned = (html: string) => new Set(tagsOf(html).filter((tag) => tag.name === "svg" || (tag.name === "input" && tag.attributes["aria-hidden"] === "true")).map((tag) => `<${tag.name}>`));
const ownUnmarked = (html: string) => unmarked(html).filter((tag) => !frameworkOwned(html).has(tag));

describe("Stepper", () => {
  it("marks the steps before the current one done and the current one as the step, joined by lines", () => {
    const html = renderToStaticMarkup(
      <Stepper
        label="Checkout steps"
        current={1}
        doneMark={<svg data-slot="glyph" />}
        caption="Enter your details"
        steps={[
          { key: "plan", label: "Plan" },
          { key: "details", label: "Your details" },
          { key: "pay", label: "Payment" },
        ]}
      />,
    );
    const steps = bySlot(html, "site-stepper-step");
    expect(steps.map((step) => step.attributes["data-state"])).toEqual(["done", "current", "next"]);
    expect(steps[1]?.attributes["aria-current"]).toBe("step");
    expect(bySlot(html, "site-stepper-line").map((line) => line.attributes["data-reached"])).toEqual(["true", "false"]);
    expect(bySlot(html, "site-stepper-caption")).toHaveLength(1);
    expect(unmarked(html)).toEqual([]);
  });
});

describe("ChoiceCards", () => {
  const options = [
    { value: "pro", title: "Pro", price: "₩14,900", unit: "/mo", body: "For people who present often", badge: "Most chosen" },
    { value: "plus", title: "Pro+", price: "₩29,900", unit: "/mo" },
    { value: "pack", title: "Presentation pack", disabled: true },
  ] as const;

  it("is a radio group with one tab stop on the chosen card, the mark beside its title", () => {
    const html = renderToStaticMarkup(<ChoiceCards label="Plans" value="plus" options={options} onValueChange={() => {}} mark={<svg data-slot="glyph" />} />);
    expect(bySlot(html, "site-choice-cards")[0]?.attributes.role).toBe("radiogroup");
    expect(tabStops(html).map((tag) => tag.attributes["data-value"])).toEqual(["plus"]);
    const cards = bySlot(html, "site-choice-card");
    expect(cards.map((card) => card.attributes["data-hover"])).toEqual(["lift", "none", "lift"]);
    expect(bySlot(html, "glyph")).toHaveLength(1);
    expect(bySlot(html, "site-choice-badge")).toHaveLength(1);
    expect(unmarked(html)).toEqual([]);
  });

  it("draws a plan change's small cards, the pointer drawing the control line", () => {
    const html = renderToStaticMarkup(<ChoiceCards size="sm" label="Which plan?" value="b" options={[{ value: "a", title: "Free", meta: "Free" }, { value: "b", title: "Pro+", meta: "₩29,900/mo" }]} onValueChange={() => {}} />);
    expect(bySlot(html, "site-choice-card").map((card) => card.attributes["data-hover"])).toEqual(["line", "none"]);
    expect(bySlot(html, "site-choice-meta")).toHaveLength(2);
  });
});

describe("checkout layout", () => {
  it("draws our side, then the payment side in the provider's frame with its name", () => {
    const html = renderToStaticMarkup(
      <CheckoutLayout main={<CheckoutHead title="What are you presenting?" lede="Choose a plan" />} summary={<ProviderFrame label="Paddle checkout" owner="Paddle">frame</ProviderFrame>} />,
    );
    const order = tagsOf(html).map((tag) => tag.attributes["data-slot"]).filter(Boolean);
    expect(order.indexOf("site-checkout-main")).toBeLessThan(order.indexOf("site-provider-frame"));
    expect(bySlot(html, "site-provider-frame")[0]?.attributes["aria-label"]).toBe("Paddle checkout");
    expect(unmarked(html)).toEqual([]);
  });

  it("draws the receipt's lines, the tax ruled dashed and the total", () => {
    const html = renderToStaticMarkup(
      <OrderSummary
        title="Receipt preview"
        live="Follows the payment window"
        lines={[{ key: "plan", label: "Pro · monthly", amount: "₩13,545" }]}
        tax={{ key: "tax", label: "VAT 10% included", amount: "₩1,355" }}
        total={{ key: "total", label: "Due today", amount: "₩14,900" }}
        note="Next payment Nov 14"
      />,
    );
    expect(bySlot(html, "site-order-line").map((line) => line.attributes["data-kind"])).toEqual(["line", "tax", "total"]);
    expect(bySlot(html, "site-order-amount").map((amount) => amount.attributes["data-total"])).toEqual(["false", "false", "true"]);
    expect(unmarked(html)).toEqual([]);
  });

  it("draws the consents required, agreeing to all first, and a consent asked again", () => {
    const html = renderToStaticMarkup(
      <ConsentChecklist
        all={{ label: "Agree to all", checked: false }}
        badge="Required"
        items={[{ key: "terms", label: "The terms of use", checked: true, view: <a data-slot="site-text-action" href="/terms">View</a> }]}
        onAllChange={() => {}}
        onItemChange={() => {}}
      />,
    );
    const boxes = byPart(html, "site-checkbox");
    expect(boxes).toHaveLength(2);
    expect(boxes[1]?.attributes["aria-required"]).toBe("true");
    expect(bySlot(html, "site-checkbox-badge")).toHaveLength(1);
    expect(bySlot(html, "site-consent-view")).toHaveLength(1);
    expect(ownUnmarked(html)).toEqual([]);
    const again = renderToStaticMarkup(<ConsentAgain note="The total changed">consent</ConsentAgain>);
    expect(bySlot(again, "site-consent-again-note")).toHaveLength(1);
  });
});

describe("payment and after", () => {
  it("draws ways to pay as toggles, a one-off one disabled for a subscription", () => {
    const html = renderToStaticMarkup(
      <MethodGrid
        methods={[
          { key: "card", name: "Card", mark: "CA", pressed: true, wide: true },
          { key: "bank", name: "Bank transfer", mark: "BA", about: "One-off only", disabled: true },
        ]}
      />,
    );
    const methods = bySlot(html, "site-method");
    expect(methods.map((method) => method.attributes["aria-pressed"])).toEqual(["true", "false"]);
    expect(methods[0]?.attributes["data-wide"]).toBe("true");
    expect(methods[1]?.attributes.disabled).toBeDefined();
    expect(unmarked(html)).toEqual([]);
  });

  it("marks the chain's steps done, running and waiting", () => {
    const html = renderToStaticMarkup(
      <ProgressChain
        title="Switching on Pro"
        done={1}
        steps={[
          { key: "paid", label: "Paid" },
          { key: "confirmed", label: "Confirmed" },
          { key: "on", label: "Plan on" },
        ]}
        actions={[{ id: "back", label: "Back to PowerPoint", tone: "primary" }]}
      />,
    );
    expect(bySlot(html, "site-chain-step").map((step) => step.attributes["data-state"])).toEqual(["done", "running", "waiting"]);
    expect(unmarked(html)).toEqual([]);
  });

  it("draws the done page's one h1 and its large actions centred", () => {
    const html = renderToStaticMarkup(<DonePanel mark={<svg data-slot="glyph" />} title="Pro is on" body="50,000 characters are ready" actions={[{ id: "back", label: "Back", tone: "primary" }]} notice="A receipt went to t@example.com" />);
    expect(bySlot(html, "site-done-title")[0]?.name).toBe("h1");
    expect(bySlot(html, "site-action")[0]?.attributes["data-size"]).toBe("lg");
    expect(bySlot(html, "site-checkout-actions")[0]?.attributes["data-align"]).toBe("center");
    expect(tagsOf(html)[0]?.attributes["data-slot"]).toBe("site-done-mark");
    expect(unmarked(html)).toEqual([]);
  });

  it("says in the provider's place what happens there, with its glyph above the sentence", () => {
    const html = renderToStaticMarkup(<ProviderWaiting mark={<svg data-slot="glyph" />}>Agree and the payment window opens here</ProviderWaiting>);
    expect(tagsOf(html)[0]?.attributes["data-slot"]).toBe("site-provider-waiting");
    expect(bySlot(html, "site-provider-waiting-text")[0]?.name).toBe("p");
    expect(html.indexOf('data-slot="glyph"')).toBeLessThan(html.indexOf("site-provider-waiting-text"));
    expect(unmarked(html)).toEqual([]);
  });

  it("gives the provider's script the element it draws into, found by the class it is told", () => {
    const html = renderToStaticMarkup(<ProviderTarget targetClass="provider-frame" />);
    const [target] = bySlot(html, "site-provider-target");
    expect(target?.attributes.class).toBe("provider-frame");
    expect(unmarked(html)).toEqual([]);
  });
});
