import { describe, expect, it } from "vitest";

import { documentTitleOf } from "./document-title";

describe("documentTitleOf", () => {
  it("names the page first and the product after it", () => {
    expect(documentTitleOf("Back Office", "Users")).toBe("Users - Back Office");
  });

  it("keeps the product's title where the page publishes no heading", () => {
    expect(documentTitleOf("Back Office", undefined)).toBe("Back Office");
    expect(documentTitleOf("Back Office", "   ")).toBe("Back Office");
  });

  it("does not name the product twice", () => {
    expect(documentTitleOf("Back Office", "Back Office")).toBe("Back Office");
  });

  it("is the heading alone where the document has no title of its own", () => {
    expect(documentTitleOf("", "Users")).toBe("Users");
  });
});
