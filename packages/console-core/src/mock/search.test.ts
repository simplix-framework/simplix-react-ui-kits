import { describe, expect, it } from "vitest";
import { MOCK_SEARCH_PAGE, searchOptions } from "./search";

const people = Array.from({ length: 25 }, (_, i) => ({ value: `p${i}`, label: `Person ${i}` }));

describe("searchOptions", () => {
  it("matches labels case-insensitively", () => {
    expect(searchOptions(people, "person 2").options.map((o) => o.value)).toEqual(["p2", "p20", "p21", "p22", "p23", "p24"]);
  });
  it("returns one page and says when more match", () => {
    const page = searchOptions(people, "");
    expect(page.options).toHaveLength(MOCK_SEARCH_PAGE);
    expect(page.hasMore).toBe(true);
  });
  it("keeps the picked value at the head when the query no longer matches it", () => {
    expect(searchOptions(people, "person 3", ["p7"]).options[0].value).toBe("p7");
  });
  it("does not repeat a picked value that already matches", () => {
    const values = searchOptions(people, "person 7", ["p7"]).options.map((o) => o.value);
    expect(values.filter((v) => v === "p7")).toHaveLength(1);
  });
});
