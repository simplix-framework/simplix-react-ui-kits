import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { figureTiles, statusFieldOf, useFigureTiles, type FigureWords } from "./figure-tiles";
import type { ContractField } from "./record-contract";

const words: FigureWords = {
  enumLabel: (_enum, value) => value.toLowerCase(),
  fieldLabel: (field) => `label:${field}`,
  value: (field, row) => String(row[field.name]),
};

const status: ContractField = { name: "status", kind: "enum", enumName: "JobStatus", options: ["QUEUED", "FAILED"], tones: { FAILED: "danger" } };

describe("a status spec over the contract field", () => {
  it("takes the field's enum, options and tones where the page states none, so no page types the value list again", () => {
    expect(statusFieldOf({ query: {}, field: status })).toEqual({ field: "status", enumName: "JobStatus", values: ["QUEUED", "FAILED"], tones: { FAILED: "danger" } });
    const tiles = figureTiles({ status: { query: {}, field: status }, rowsLabel: "Jobs" }, words, { FAILED: 2 });
    expect(tiles.map((tile) => [tile.key, tile.value, tile.tone])).toEqual([
      ["QUEUED", 0, undefined],
      ["FAILED", 2, "danger"],
    ]);
  });

  it("keeps what the page states over the field's own", () => {
    expect(statusFieldOf({ query: {}, field: status, values: ["FAILED"], tones: {} })).toMatchObject({ values: ["FAILED"], tones: {} });
  });
});

describe("what a page adds to its default figures", () => {
  it("writes a value's basis and its own narrowing, tints an aggregate and appends the page's tiles", () => {
    const tiles = figureTiles(
      {
        status: { query: {}, field: "granted", enumName: "Flag", values: ["true"], basis: () => "granted only", filter: (value) => ({ values: { "granted.equals": value === "true", "withdrawnAt.isNull": true } }) },
        aggregates: { query: { data: [{ field: "failedCount", op: "sum", value: 4 }] }, figures: [{ field: { name: "failedCount", kind: "number" }, op: "sum", tone: (value) => (value ? "danger" : undefined) }] },
        extra: [{ key: "own", label: "Own", value: 1, counted: false }],
        rowsLabel: "Rows",
      },
      words,
      { true: 5 },
    );
    expect(tiles[0]).toMatchObject({ key: "true", basis: "granted only", filter: { values: { "granted.equals": true, "withdrawnAt.isNull": true } } });
    expect(tiles[1]).toMatchObject({ key: "failedCount:sum", tone: "danger" });
    expect(tiles[2]).toMatchObject({ key: "own" });
  });
});

describe("useFigureTiles", () => {
  it("returns the counts its tiles were drawn from, with every declared value present", () => {
    function Probe() {
      const figures = useFigureTiles("job", { status: { query: { data: [{ value: "FAILED", count: 3 }] }, field: status }, rowsLabel: "Jobs" });
      return createElement("pre", null, JSON.stringify(figures.counts));
    }
    const html = renderToStaticMarkup(createElement(UIProvider, { children: createElement(Probe) }));
    expect(JSON.parse((/<pre>([\s\S]*)<\/pre>/.exec(html)?.[1] ?? "null").replace(/&quot;/g, '"'))).toEqual({ QUEUED: 0, FAILED: 3 });
  });

  /** The notices `useFigureTiles` raises for a spec, as the probe's JSON. */
  function noticesFor(spec: Parameters<typeof useFigureTiles>[1]): readonly { key: string; kind: string; when: boolean; title: string; hint?: string }[] {
    function Probe() {
      return createElement("pre", null, JSON.stringify(useFigureTiles("job", spec).notices));
    }
    const html = renderToStaticMarkup(createElement(UIProvider, { children: createElement(Probe) }));
    return JSON.parse((/<pre>([\s\S]*)<\/pre>/.exec(html)?.[1] ?? "null").replace(/&quot;/g, '"'));
  }

  it("raises the unread warning when the status counts could not be read, and none while they answered", () => {
    const failed = noticesFor({ status: { query: { isError: true }, field: status }, rowsLabel: "Jobs" });
    expect(failed).toHaveLength(1);
    expect(failed[0]).toMatchObject({ key: "figures-unread", kind: "warning", when: true, title: "figureTiles.unreadTitle", hint: "figureTiles.unreadHint" });
    expect(noticesFor({ status: { query: { data: [] }, field: status }, rowsLabel: "Jobs" })).toEqual([]);
  });

  it("raises it for a failed sums read too, once", () => {
    const failed = noticesFor({
      status: { query: { data: [] }, field: status },
      aggregates: { query: { isError: true }, figures: [{ field: { name: "failedCount", kind: "number" }, op: "sum" }] },
      rowsLabel: "Jobs",
    });
    expect(failed.map((notice) => notice.key)).toEqual(["figures-unread"]);
  });
});
