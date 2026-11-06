import { EMPTY_VALUE_TEXT } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { tileFigure } from "../layout/settings-tiles";

// The em dash anywhere in drawn text is refused by `scripts/check-em-dash.mjs` at the kit root;
// what is pinned here is that the kit's own placeholders are the framework's.
describe("the placeholder an absent value is drawn with", () => {
  it("is the framework's one hyphen-minus", () => {
    expect(EMPTY_VALUE_TEXT).toBe("-");
  });

  it("is what a tile nobody counted shows", () => {
    expect(tileFigure({ key: "open", label: "Open", value: undefined, counted: true, href: "/open" })).toBe(EMPTY_VALUE_TEXT);
  });

  it("is not what a counted tile shows", () => {
    expect(tileFigure({ key: "open", label: "Open", value: 0, counted: true, href: "/open" })).toBe(0);
  });
});
