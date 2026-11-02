import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DashboardCard } from "./dashboard-card";
import { DashboardGrid, dashboardColumnsThatFit, dashboardRowProblems, dashboardRows, spanAt, type DashboardSpan } from "./dashboard-grid";

describe("the dashboard grid's columns", () => {
  // A 240px minimum and a 12px gap: four need 996px, two need 492px.
  it("draws four where four fit, two where two fit, one otherwise, and never three", () => {
    expect(dashboardColumnsThatFit(1124, 12, 240)).toBe(4);
    expect(dashboardColumnsThatFit(996, 12, 240)).toBe(4);
    expect(dashboardColumnsThatFit(995, 12, 240)).toBe(2);
    expect(dashboardColumnsThatFit(760, 12, 240)).toBe(2);
    expect(dashboardColumnsThatFit(491, 12, 240)).toBe(1);
    expect(dashboardColumnsThatFit(358, 12, 240)).toBe(1);
  });
});

describe("a card's span", () => {
  it("takes its span, or the whole row where the grid has fewer columns", () => {
    expect([spanAt(1, 4), spanAt(2, 4), spanAt(4, 4)]).toEqual([1, 2, 4]);
    expect([spanAt(1, 2), spanAt(2, 2), spanAt(4, 2)]).toEqual([1, 2, 2]);
    expect([spanAt(1, 1), spanAt(2, 1), spanAt(4, 1)]).toEqual([1, 1, 1]);
  });
});

describe("rows", () => {
  const composed: DashboardSpan[] = [1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 4];
  it("fills every row of a composition whose rows sum to four, at four, two and one columns", () => {
    expect(dashboardRows(composed, 4)).toEqual([[1, 1, 2], [2, 2], [2, 1, 1], [1, 1, 1, 1], [4]]);
    expect(dashboardRows(composed, 2).every((row) => row.reduce((a, b) => a + b, 0) === 2)).toBe(true);
    expect(dashboardRows(composed, 1).every((row) => row.length === 1)).toBe(true);
    expect(dashboardRowProblems(composed)).toEqual([]);
  });

  it("refuses a span of three or of any other number", () => {
    expect(dashboardRowProblems([1, 3])).toEqual(["card 2: span 3 is not 1, 2 or 4"]);
    expect(dashboardRowProblems([5])).toEqual(["card 1: span 5 is not 1, 2 or 4"]);
  });

  it("refuses a row of four that leaves a gap when the grid narrows to two", () => {
    expect(dashboardRowProblems([1, 2, 1])).toEqual(["at 2 columns, row 1 holds 1 of 2 (1)", "at 2 columns, row 3 holds 1 of 2 (1)"]);
  });

  it("refuses a last row that is not full", () => {
    expect(dashboardRowProblems([2, 2, 1])).toEqual(["at 4 columns, row 2 holds 1 of 4 (1)", "at 2 columns, row 3 holds 1 of 2 (1)"]);
  });
});

describe("DashboardGrid", () => {
  const html = renderToStaticMarkup(
    createElement(
      DashboardGrid,
      null,
      createElement(DashboardCard, { title: "Customers", span: 1, children: "a" }),
      createElement(DashboardCard, { title: "Usage", span: 2, children: "b" }),
      createElement(DashboardCard, { title: "Activity", span: 4, children: "c" }),
    ),
  );
  it("draws four columns before it is measured, and each card takes its span", () => {
    expect(html).toContain('data-columns="4"');
    expect(html).toContain("grid-template-columns:repeat(4, minmax(0, 1fr))");
    expect(html).toMatch(/data-span="1"[^>]*style="grid-column:span 1 \/ span 1"/);
    expect(html).toMatch(/data-span="2"[^>]*style="grid-column:span 2 \/ span 2"/);
    expect(html).toMatch(/data-span="4"[^>]*style="grid-column:span 4 \/ span 4"/);
  });

  it("leaves a card outside a grid to its own column rule", () => {
    const alone = renderToStaticMarkup(createElement(DashboardCard, { title: "Alone", span: 2, children: "x" }));
    expect(alone).toContain('data-span="2"');
    expect(alone).not.toContain("grid-column");
  });
});
