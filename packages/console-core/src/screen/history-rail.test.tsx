import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { HistoryRail, type HistoryNode } from "./history-rail";

const nodes: HistoryNode[] = [
  { key: "a", label: "Queued", state: "done" },
  { key: "b", label: "Started", state: "skip" },
  { key: "c", label: "Finished", state: "done" },
];

/** The `data-skipped` marks of the lines, in the order they stand down the rail. */
function lines(list: HistoryNode[]): string[] {
  const html = renderToStaticMarkup(createElement(UIProvider, { children: createElement(HistoryRail, { nodes: list }) }));
  return [...html.matchAll(/data-slot="console-history-line"[^>]*data-skipped="(true|false)"/g)].map((m) => m[1] as string);
}

describe("HistoryRail line", () => {
  it("draws the line into a skipped step dashed and the line out of it solid", () => {
    expect(lines(nodes)).toEqual(["true", "false"]);
  });

  it("draws no line after the last step and a solid line between steps that all happened", () => {
    expect(lines(nodes.map((n) => ({ ...n, state: "done" as const })))).toEqual(["false", "false"]);
  });
});
