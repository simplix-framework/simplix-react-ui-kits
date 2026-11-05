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

  it("writes every field it owns, so none of the address's own values is left in place", () => {
    expect(Object.keys(validateConsoleSearch({}))).toEqual(expect.arrayContaining(["id", "mode", "tab", "help", "gap", "grant", "q"]));
  });
});
