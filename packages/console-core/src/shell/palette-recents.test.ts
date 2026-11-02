import { describe, expect, it } from "vitest";

import { parseRecents, withRecent, type ConsoleRecent } from "./palette-recents";

const recent = (key: string): ConsoleRecent => ({ key, kind: "record", label: key, href: `/x?id=${key}` });

describe("the palette's recents", () => {
  it("puts the one just opened first", () => {
    expect(withRecent([recent("a"), recent("b")], recent("c")).map((r) => r.key)).toEqual(["c", "a", "b"]);
  });

  it("keeps one copy of something opened twice, at the front", () => {
    expect(withRecent([recent("a"), recent("b")], recent("b")).map((r) => r.key)).toEqual(["b", "a"]);
  });

  it("keeps the newest eight", () => {
    const eight = Array.from({ length: 8 }, (_, i) => recent(String(i)));
    const kept = withRecent(eight, recent("new"));
    expect(kept).toHaveLength(8);
    expect(kept[0]!.key).toBe("new");
    expect(kept.map((r) => r.key)).not.toContain("7");
  });

  it("reads back what it wrote", () => {
    const kept = [recent("a"), { key: "p", kind: "page" as const, label: "Users", href: "/users" }];
    expect(parseRecents(JSON.stringify(kept))).toEqual(kept);
  });

  it("reads nothing from a value it cannot read, and drops entries of another shape", () => {
    expect(parseRecents(null)).toEqual([]);
    expect(parseRecents("{not json")).toEqual([]);
    expect(parseRecents(JSON.stringify({ key: "a" }))).toEqual([]);
    expect(parseRecents(JSON.stringify([recent("a"), { key: "b", kind: "other", label: "b", href: "/" }])).map((r) => r.key)).toEqual(["a"]);
  });
});
