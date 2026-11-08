import { describe, expect, it } from "vitest";

import { listScopeOf } from "./list-scope";

describe("listScopeOf", () => {
  it("names no scope for a list whose page forces nothing and has no tab", () => {
    expect(listScopeOf(undefined, undefined)).toBeUndefined();
  });

  it("changes with the tab alone, as a page with tabs that force nothing needs", () => {
    expect(listScopeOf(undefined, "keys")).not.toBe(listScopeOf(undefined, "installation"));
    expect(listScopeOf(undefined, "keys")).toBe(listScopeOf(undefined, "keys"));
  });

  it("changes with the forced request alone, as a tab that forces one needs", () => {
    expect(listScopeOf({ "inUse.equals": "true" }, undefined)).not.toBe(listScopeOf({ "inUse.equals": "false" }, undefined));
  });

  it("does not change with the order the forced request was built in", () => {
    expect(listScopeOf({ a: "1", b: "2" }, "x")).toBe(listScopeOf({ b: "2", a: "1" }, "x"));
  });

  it("tells a forced request apart from a tab of the same text", () => {
    expect(listScopeOf({ a: "1" }, undefined)).not.toBe(listScopeOf(undefined, "a=1"));
  });
});
