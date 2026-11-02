import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { sumByCategory, sumsByKey } from "./chart-model";
import { DashboardReadState, dashboardReadStage } from "./dashboard-read-state";

const draw = (props: Parameters<typeof DashboardReadState>[0]) => renderToStaticMarkup(createElement(DashboardReadState, props));

describe("dashboardReadStage", () => {
  it("says the failure before the wait, the wait before the empty sentence, and the block last", () => {
    expect(dashboardReadStage({ loading: true, failed: "Could not read", empty: "Nothing" })).toBe("failed");
    expect(dashboardReadStage({ loading: true, empty: "Nothing" })).toBe("loading");
    expect(dashboardReadStage({ empty: "Nothing" })).toBe("empty");
    expect(dashboardReadStage({ failed: false, empty: false })).toBe("ready");
  });
});

describe("DashboardReadState", () => {
  const block = createElement("p", { "data-testid": "block" }, "figures");
  it("draws the failure sentence as a banner and not the block", () => {
    const html = draw({ failed: "Could not read the usage", loading: true, children: block });
    expect(html).toContain("Could not read the usage");
    expect(html).toContain('role="alert"');
    expect(html).not.toContain('data-testid="block"');
  });
  it("draws the skeleton while a read is on the way", () => {
    const html = draw({ loading: true, rows: 2, children: block });
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('data-testid="block"');
  });
  it("draws the empty sentence when the reads answered with nothing", () => {
    const html = draw({ empty: "No calls in these 14 days", children: block });
    expect(html).toContain("No calls in these 14 days");
    expect(html).not.toContain('data-testid="block"');
  });
  it("draws the block once the reads answered", () => {
    expect(draw({ loading: false, failed: false, empty: false, children: block })).toContain('data-testid="block"');
  });
});

describe("sumByCategory", () => {
  const rows = [
    { day: "2026-11-01", calls: 5 },
    { day: "2026-11-01", calls: 6 },
    { day: "2026-11-02", calls: null },
    { day: "2026-10-01", calls: 9 },
  ];
  it("sums each category's rows in the order given, 0 where no row names one, and leaves out an unlisted one", () => {
    expect(sumByCategory(rows, (r) => r.day, ["2026-10-31", "2026-11-01", "2026-11-02"], (r) => r.calls)).toEqual([0, 11, 0]);
  });
});

describe("sumsByKey", () => {
  it("sums by key, largest first, then by key, and leaves out a row with no key", () => {
    const rows = [
      { provider: "b", cost: 3 },
      { provider: "a", cost: 3 },
      { provider: "c", cost: 10 },
      { provider: "c", cost: 1 },
      { provider: null, cost: 99 },
      { provider: "d", cost: 0 },
    ];
    expect(sumsByKey(rows, (r) => r.provider, (r) => r.cost)).toEqual([
      { key: "c", value: 11 },
      { key: "a", value: 3 },
      { key: "b", value: 3 },
      { key: "d", value: 0 },
    ]);
  });
});
