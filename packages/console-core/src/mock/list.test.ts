import { describe, expect, it } from "vitest";

import { matchMockRows } from "./list";

const rows = [
  { id: "1", provider: "openai", outcome: "SUCCEEDED", credits: 4, occurredAt: "2026-10-01T10:00:00Z" },
  { id: "2", provider: "openai", outcome: "FAILED", credits: 2, occurredAt: "2026-10-02T10:00:00Z" },
  { id: "3", provider: "azure", outcome: "FAILED", credits: 8, occurredAt: "2026-10-03T10:00:00Z" },
];
const ids = (matched: readonly { id: string }[]) => matched.map((row) => row.id);

describe("matchMockRows", () => {
  it("keeps every row when nothing is committed", () => {
    expect(ids(matchMockRows(rows, { committedValues: {}, search: "" }))).toEqual(["1", "2", "3"]);
  });
  it("narrows by a committed filter across all pages, as a pressed figure or a chip does", () => {
    expect(ids(matchMockRows(rows, { committedValues: { "outcome.in": ["FAILED"] }, search: "" }))).toEqual(["2", "3"]);
  });
  it("narrows by the chosen time window", () => {
    const window = { "occurredAt.between": ["2026-10-02T00:00:00Z", "2026-10-02T23:59:59Z"] };
    expect(ids(matchMockRows(rows, { committedValues: window, search: "" }))).toEqual(["2"]);
  });
  it("narrows by the search text in any text value", () => {
    expect(ids(matchMockRows(rows, { committedValues: {}, search: "AZU" }))).toEqual(["3"]);
  });
  it("applies filters and search together", () => {
    expect(ids(matchMockRows(rows, { committedValues: { "outcome.equals": "FAILED" }, search: "openai" }))).toEqual(["2"]);
  });
});
