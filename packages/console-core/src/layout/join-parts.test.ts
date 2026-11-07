import { describe, expect, it } from "vitest";

import { joinParts } from "./join-parts";

describe("joinParts", () => {
  it("joins the parts that say something with a middle dot and leaves no stray dot for a missing one", () => {
    expect(joinParts("Kim", undefined, "", "  ", null, false, "Polish", 3)).toBe("Kim · Polish · 3");
    expect(joinParts()).toBe("");
  });
});
