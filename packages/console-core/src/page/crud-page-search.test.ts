import { describe, expect, it } from "vitest";

import { searchToType } from "./crud-page-search";

describe("the text an address types into a list's search box", () => {
  it("types the address's text the first time the page sees it", () => {
    expect(searchToType("kim", undefined)).toBe("kim");
  });

  it("types nothing again for the same text, so the reader's own typing stands", () => {
    expect(searchToType("kim", "kim")).toBeUndefined();
  });

  it("types a different text the address names later", () => {
    expect(searchToType("lee", "kim")).toBe("lee");
  });

  it("types nothing for an address without one", () => {
    expect(searchToType(undefined, undefined)).toBeUndefined();
    expect(searchToType(undefined, "kim")).toBeUndefined();
  });
});
