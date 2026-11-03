import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { bySlot, silentRefusals, tagsOf, unmarked } from "../testing/markup";
import { PackCard, PackSection } from "./pack-card";

const meter = { share: 50_000 / 120_000, label: "50,000 characters", amount: "50,000 characters", talk: "about 50 min of English · 2 twenty-minute talks" };
const pack = (props: Partial<Parameters<typeof PackCard>[0]> = {}) =>
  renderToStaticMarkup(
    <PackCard
      name="Presentation pack"
      price="₩14,900"
      unit=" once"
      about="For getting one presentation ready"
      meter={meter}
      terms="Usable for 12 months · No automatic payment"
      action={{ id: "pack", label: "Buy the pack", href: "/checkout?kind=pack" }}
      {...props}
    />,
  );

describe("PackSection", () => {
  it("draws the heading and lede, the packs, then the closing line, named by its heading", () => {
    const html = renderToStaticMarkup(
      <PackSection heading="Packs and extra credits" lede="Pay once instead of subscribing." note="Presenting every month? Pro is ₩14,900 a month.">
        <i data-slot="probe-pack" />
      </PackSection>,
    );
    const slots = tagsOf(html).map((tag) => tag.attributes["data-slot"]);
    expect(slots).toEqual(["site-pack-section", "site-pack-head", "site-section-heading", "site-section-lede", "site-pack-grid", "probe-pack", "site-pack-note"]);
    const section = bySlot(html, "site-pack-section")[0];
    expect(section?.attributes["aria-labelledby"]).toBe(bySlot(html, "site-section-heading")[0]?.attributes.id);
    expect(bySlot(html, "site-section-heading")[0]?.attributes["data-size"]).toBe("lg");
  });

  it("leaves out the lede and the closing line it is not handed", () => {
    const html = renderToStaticMarkup(<PackSection heading="Packs">{null}</PackSection>);
    expect(bySlot(html, "site-section-lede")).toEqual([]);
    expect(bySlot(html, "site-pack-note")).toEqual([]);
  });
});

describe("PackCard", () => {
  it("draws the name and price on one line, who it is for, the meter, the terms and a primary action", () => {
    const html = pack();
    expect(unmarked(html)).toEqual([]);
    const order = tagsOf(html).map((tag) => tag.attributes["data-slot"]);
    expect(order.slice(0, 6)).toEqual(["site-pack-card", "site-pack-card-head", "site-pack-card-name", "site-pack-card-price", "site-pack-card-unit", "site-pack-card-about"]);
    expect(order.indexOf("site-quota-meter")).toBeLessThan(order.indexOf("site-pack-card-terms"));
    expect(order.indexOf("site-pack-card-terms")).toBeLessThan(order.indexOf("site-action"));
    const action = bySlot(html, "site-action")[0];
    expect(action?.name).toBe("a");
    expect(action?.attributes["data-tone"]).toBe("primary");
    expect(bySlot(html, "site-pack-card")[0]?.attributes["aria-labelledby"]).toBe(bySlot(html, "site-pack-card-name")[0]?.attributes.id);
  });

  it("draws the characters bold at the meter's start and the share as the fill's width", () => {
    const html = pack();
    expect(bySlot(html, "site-pack-card-amount")[0]?.name).toBe("b");
    expect(bySlot(html, "site-quota-track")[0]?.attributes["aria-label"]).toBe("50,000 characters");
    expect(bySlot(html, "site-quota-fill")[0]?.attributes.style).toBe(`width:${String((50_000 / 120_000) * 100)}%`);
  });

  it("describes a disabled action by the reason drawn under it", () => {
    const html = pack({ action: { id: "top-up", label: "Top up credits", disabled: true, reason: "Extra credits need Pro or Pro+." }, reason: "Extra credits need Pro or Pro+. Pick a plan first." });
    const action = bySlot(html, "site-action")[0];
    const reason = bySlot(html, "site-pack-card-reason")[0];
    expect(action?.name).toBe("button");
    expect(action?.attributes["aria-describedby"]).toBe(reason?.attributes.id);
    expect(silentRefusals(html)).toEqual([]);
  });

  it("leaves an action that can run undescribed, and draws no reason line it is not handed", () => {
    const html = pack();
    expect(bySlot(html, "site-action")[0]?.attributes["aria-describedby"]).toBeUndefined();
    expect(bySlot(html, "site-pack-card-reason")).toEqual([]);
  });
});
