import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DashboardFactList, type DashboardFactListProps } from "./fact-list";

const draw = (props: DashboardFactListProps) => renderToStaticMarkup(createElement(DashboardFactList, props));

describe("DashboardFactList", () => {
  const entries = [
    { key: "voice", label: "Premium voice", sub: "per character", value: "2 credits" },
    { key: "notes", label: "AI notes", value: "40 credits" },
  ];

  it("states each fact as a term and its value, named for a screen reader", () => {
    const html = draw({ label: "What credits pay for", entries, emptyLabel: "Nothing" });
    expect(html).toContain('<dl aria-label="What credits pay for"');
    expect(html.match(/<dt/g)).toHaveLength(2);
    expect(html.match(/<dd/g)).toHaveLength(2);
    expect(html).toContain("per character");
    expect(html).toContain("40 credits");
  });

  it("draws a row that is read, never pressed: no button and no chevron", () => {
    const html = draw({ label: "Prices", entries, emptyLabel: "Nothing" });
    expect(html).not.toContain("<button");
    expect(html).not.toContain("<svg");
    expect(html).toContain('data-slot="fact-row"');
  });

  it("leaves out the line under a label that has none", () => {
    const html = draw({ label: "Prices", entries: [entries[1]], emptyLabel: "Nothing" });
    expect(html).not.toContain('data-slot="task-sub"');
  });

  it("says the empty line and draws no list when there is nothing to state", () => {
    const html = draw({ label: "Prices", entries: [], emptyLabel: "No prices yet" });
    expect(html).toContain("No prices yet");
    expect(html).not.toContain("<dl");
  });
});
