import { describe, expect, it } from "vitest";

import { validateConsoleSearch } from "./console-search";

describe("a console page's address", () => {
  it("keeps the explanation and the overlays it opens", () => {
    expect(validateConsoleSearch({ help: "lifecycle", gap: "a", grant: "b" })).toMatchObject({ help: "lifecycle", gap: "a", grant: "b" });
  });

  // A router lays the validated search over the raw address, so a field is replaced only when it is
  // written: each one the page owns is present, undefined where the address gave nothing it takes.
  it("writes a field that is not text as undefined, so the address's value does not reach the page", () => {
    expect(validateConsoleSearch({ help: 3 })).toHaveProperty("help", undefined);
  });

  it("keeps the text its list opens searched for, and drops a blank one", () => {
    expect(validateConsoleSearch({ q: "kim" })).toMatchObject({ q: "kim" });
    expect(validateConsoleSearch({ q: "  " })).toHaveProperty("q", undefined);
    expect(validateConsoleSearch({ q: 7 })).toHaveProperty("q", undefined);
  });

  // The route's `validateSearch` is this function, so a field it leaves out never reaches the page:
  // the list filters of a link (a home tile's count) arrive here or nowhere.
  it("keeps the list filters a link carries, a lone value as a string and a set as an array", () => {
    expect(validateConsoleSearch({ filters: { "status.in": "FAILED", "state.in": ["A", "B"] } })).toHaveProperty("filters", { "status.in": "FAILED", "state.in": ["A", "B"] });
  });

  it("drops what is not a filter, and never lets a field the page owns pass as a filter key", () => {
    expect(validateConsoleSearch({ filters: { "status.in": 3, id: "1", tab: "open", "a.in": { nested: true } } })).toHaveProperty("filters", undefined);
    expect(validateConsoleSearch({ filters: "status.in" })).toHaveProperty("filters", undefined);
  });

  it("writes every field it owns, so none of the address's own values is left in place", () => {
    expect(Object.keys(validateConsoleSearch({}))).toEqual(expect.arrayContaining(["id", "mode", "tab", "filters", "help", "gap", "grant", "q"]));
  });
});
