import { describe, expect, it } from "vitest";

import { isNarrowed } from "./record-list";

function state(total: number, search = "", committedValues: Record<string, unknown> = {}) {
  return { filters: { search, committedValues }, pagination: { total } } as unknown as Parameters<typeof isNarrowed>[0];
}

describe("isNarrowed", () => {
  it("reads fewer rows than given as narrowed in memory", () => {
    expect(isNarrowed(state(3), 5, false)).toBe(true);
    expect(isNarrowed(state(5), 5, false)).toBe(false);
  });

  it("reads a server list by its search and its committed filters, never by its total", () => {
    expect(isNarrowed(state(2), 0, true)).toBe(false);
    expect(isNarrowed(state(2, "  "), 0, true)).toBe(false);
    expect(isNarrowed(state(2, "kim"), 0, true)).toBe(true);
    expect(isNarrowed(state(2, "", { "status.in": [] }), 0, true)).toBe(false);
    expect(isNarrowed(state(2, "", { "status.in": ["ACTIVE"] }), 0, true)).toBe(true);
    expect(isNarrowed(state(2, "", { "name.contains": "" }), 0, true)).toBe(false);
  });
});
